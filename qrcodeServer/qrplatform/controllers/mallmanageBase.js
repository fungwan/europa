'use strict'
//加载第三方库
var eventproxy = require('eventproxy');
var sequelize = require('sequelize');
var Q = require('q');
var multiline = require('multiline');
var uuid = require('node-uuid');
var moment = require('moment');
var md5 = require('MD5');
var request = require('request');
var fs = require('fs');
//加载自定义库
var returnData = require('../common/returnData');
var db = require('../common/db');
var vo = require('../models/vomodels');
var logger = require('../common/logger');
var tool = require('../common/tool');
var config = require('../../config');
var db = require('../common/db');
var vmall = require('../models/vomodels/mall');
var mobile = require('./mobileapp');

function _pointConvertMoney(point) {
  return point / 1;
}

//价格转积分
function _priceConvertPoint(price) {
  return price * 1;
}

//检查订单创建条件，库存和积分是否充足,返回订单商品金额和折扣金额（如有）
function _checkOrderCondition(action, productList, custId, password, point,discountList, callback) {

  if (action != 'order') {
    callback(null, 0,0); return;
  }

  var res = {
    data: [],
    success: true,
    errorlist: []
  };

  var custdb = db.models.custextend;
  var len = productList.length;
  var ptdNum = 0, totalPrice = 0,disCountPrice = 0;
  var discountMap = {};

  var ep = new eventproxy();

  ep.on('ok', function () {
    callback(null, totalPrice,disCountPrice);
  });

  ep.on('error', function (error, msg) {

    var errorObj = {
      code: error,
      msg: msg
    };
    callback(errorObj, null);
  });

  ep.on('pointcheck', function () {
    if (password != '' && point > 0) {
      custdb.findOne({
        where: { custid: custId }
      }).then(function (result) {
        var custInfo = result.get({ chain: true });
        var passwordcode = tool.genPwd(password);
        if (passwordcode === custInfo.paypassword) {
          if (custInfo.point >= point) {
            ep.emit('ok');
          } else {
            ep.emit('error', returnData.errorType.account.pointerror, '积分不足');
          }
        } else {
          ep.emit('error', returnData.errorType.account.passworderror, '支付密码错误');
        }
      }).catch(function (error) {
        logger.error(custId, '数据库异常：' + error.message);
        ep.emit('error', returnData.errorType.dataBaseError.unknow, '服务器开小差');
      })
    } else {
      ep.emit('ok');
    }
  });

  ep.after('endcheck', len, function () {
    if (res.success == false) {
      ep.emit('error', returnData.errorType.mallmanager.understock, res.errorlist);
    } else {
      ep.emit('pointcheck');
    }
  });

  ep.on('startJudge',function(){
    productList.forEach(function (item) {

      var mallProductvo = item.product;

      var ratio = discountMap[mallProductvo.productid] || [];
      var remainNum = mallProductvo.amount;//剩余个数
      var buyNum = item.number;//购买个数
      ptdNum += buyNum;

      if (buyNum <= remainNum) {

        totalPrice += (buyNum * mallProductvo.price);
        ratio.forEach(function (item) {
            disCountPrice += buyNum * mallProductvo.price * 0.5;//item.ratio ;
        })
        
        disCountPrice = parseFloat(disCountPrice.toFixed(2));
        res.data.push(item);
        ep.emit('endcheck');

      } else {
        logger.error(custId, mallProductvo.productname + '库存不足');
        res.success = false;
        res.errorlist.push(item);
        ep.emit('endcheck');
      }
    })
  })

  var discountLength = discountList.length;
  if(discountLength == 0){
    ep.emit('startJudge');
  }else{    
    ep.after('warp', discountLength, function () {
      ep.emit('startJudge');
    })
    discountList.forEach(function (item) {

      discountMap[item.productid] = discountMap[item.productid] || [];
      discountMap[item.productid] = item.discountList;
      ep.emit('warp');   
    })
  }
}

function _createRedpacketOrder(totalPrice, callback) {
  var bm = 'ER' + moment().format('YYYYMMDD') + Math.random().toString().substr(2, 10);
}

function _createProductOrder(orderType, pdtNum, totalPrice, disCountPrice,custId, addId, point, remark, productList, discountList,callback) {

  var prodb = db.models.mallproduct;
  var orderdb = db.models.mallorder;
  var custdb = db.models.custextend;
  var orderitemdb = db.models.mallorderdetail;
  var pointdetaildb = db.models.propointdetail;
  var order = {};
  var ep = new eventproxy();

  ep.on('ok', function (data) {
    callback(null, data);
  });

  ep.on('error', function (error, msg) {
    var errorObj = {
      code: error,
      msg: msg
    };
    callback(errorObj, null);
  });

  ep.on('createOrderTrans', function (order) {

    db.sequelize.transaction({
      autocommit: true
    }).then(function (tran) {

      ep.on('rollback', function (error, errmsg) {
        tran.rollback();
        ep.emit('error', error, errmsg);
      });

      /*更新积分记录 */
      ep.on('updatePointRecord', function () {
        var detailvo = {
          detailid: uuid.v4(),
          custid: custId,
          pointchannel: order.orderid,
          point: 0 - point,
          pointtime: moment().format(config.dateformat),
          changemode: 'order',
          remark: '订单消费'
        };
        pointdetaildb.create(detailvo, { transaction: tran }).then(function (results) {
          ep.emit('ok', order);
          tran.commit();
        }).catch(function (error) {
          ep.emit('rollback', returnData.errorType.dataBaseError.unknow, error.message);
        });
      });

      /*更新个人积分 */
      ep.on('updatePoint', function (data) {
        if (0 == point) { //不使用积分抵扣时，不记录积分消费记录
          ep.emit('ok', order);
          tran.commit();
          return;
        }
        var updateExtendsql = 'UPDATE custextend set point = point - ' + point + ' where custid = \'';
        updateExtendsql += custId + '\'';
        db.sequelize.query(updateExtendsql, { transaction: tran }).spread(function (results, metadata) {
          ep.emit('updatePointRecord');
        }).catch(function (error) {
          ep.emit('rollback', returnData.errorType.dataBaseError.unknow, error.message);
        });
      });

      /*更新折扣券信息 */
      ep.on('updateDiscount', function (data) {

        var discountcoupondb = db.models.discountcoupon;
        discountcoupondb.update({
          state:1,
          usedate:moment().valueOf()
        },{
            where:{id:{$in:useDiscountColl}},
            transaction: tran 
          }).then(function(res){            
            ep.emit('updatePoint');
          }).catch(function(err){
            ep.emit('rollback', returnData.errorType.dataBaseError.unknow, error.message);
          })         
      });

      /*创建订单详情*/
      ep.on('createOrderDetail', function (order) {

        var detailItems = [];
        productList.forEach(function (productItem) {

          var mallproductvo = productItem.product;

          var item = {
            itemid: uuid.v4(),
            orderid: order.orderid,
            mcdid: mallproductvo.productid,
            productname: mallproductvo.productname,
            productnumber: productItem.number,
            productinfo: mallproductvo.productinfo,
            productimage: mallproductvo.productimage,
            price: mallproductvo.price,
            sumprice: mallproductvo.price * productItem.number,
            privilege: mallproductvo.privilege * productItem.number,
            cost: mallproductvo.cost
          };

          detailItems.push(item);
        });

        orderitemdb.bulkCreate(detailItems, {
          transaction: tran
        }).then(function (result) {
          order.items = detailItems;
          if (0 == useDiscountColl.length) {
            ep.emit('updatePoint');
          }else{
            ep.emit('updateDiscount');
          }
          
        }).catch(function (error) {
          ep.emit('rollback', returnData.errorType.dataBaseError.unknow, error.message);
        });
      });

      orderdb.create(order, {
        transaction: tran
      }).then(function (result) {
        ep.emit('createOrderDetail', order);
      }).catch(function (error) {
        ep.emit('rollback', returnData.errorType.dataBaseError.unknow, error.message);
      });

    })
  })

  var useDiscountColl = [],tmpDiscountList = [];        
  discountList.forEach(function (item) {
    item.discountList.forEach(function(e){
      if(-1 == useDiscountColl.indexOf(e.id))
        useDiscountColl.push(e.id);
    })    
  })

  var bm = 'ER' + moment().format('YYYYMMDD') + Math.random().toString().substr(2, 10);

  if (addId == null) {//针对于礼券的购买，不是使用，注意区分，所以无须传addId
    var _paymoney = totalPrice - disCountPrice - _pointConvertMoney(point); //实付金额 = 商品总额 + 邮费 - 抵扣金额
    _paymoney = (_paymoney < 0) ? 0 : _paymoney;
    _paymoney = parseFloat(_paymoney.toFixed(2));

    order = {
      orderid: uuid.v4(),
      custid: custId,
      price: totalPrice, //商品总额
      createtime: moment().valueOf(),
      state: 0,
      orderbm: bm,
      paymoney: _paymoney, 
      tickmoney: parseFloat(_pointConvertMoney(point).toFixed(2)),
      tickid:JSON.stringify(useDiscountColl),
      discountmoney:disCountPrice,
      evalstate: -1,
      producttype: orderType,
      postage: 0
    };
    ep.emit('createOrderTrans', order);
  } else {
    var addressdb = db.models.custaddress;
    addressdb.findOne({ where: { addid: addId } }).then(function (data) {
      if (data) {
        var addressInfo = data.get({ chain: true });
        //冗余收货地址信息
        var addressStr = addressInfo.country +
          ' ' + addressInfo.province +
          ' ' + addressInfo.city +
          ' ' + addressInfo.address +
          ' ' + addressInfo.phone +
          ' ' + addressInfo.contact;

        //计算邮费
        _getPostage(pdtNum, addressInfo.province).then(function (results) {
          if (results === false) {
            logger.error('', '购物车结算时，运费计算出错，找不到地址信息');
            ep.emit('error', returnData.errorType.unknow, '邮费计算异常');
          } else {

            var _paymoney = totalPrice  + results - disCountPrice - _pointConvertMoney(point); //实付金额 = 商品总额 + 邮费 - 抵扣金额
            _paymoney = (_paymoney < 0) ? 0 : _paymoney;
            _paymoney = parseFloat(_paymoney.toFixed(2));

            order = {
              orderid: uuid.v4(),
              custid: custId,
              price: totalPrice, //商品总额
              createtime: moment().valueOf(),
              state: 0,
              addid: addId,
              address: addressStr,
              orderbm: bm,
              paymoney: _paymoney, 
              tickmoney: parseFloat(_pointConvertMoney(point).toFixed(2)),
              tickid:JSON.stringify(useDiscountColl),
              discountmoney:disCountPrice,
              remak: remark,
              evalstate: -1,
              producttype: orderType,
              express: '',
              trackingno: '',
              postage: results
            };
            ep.emit('createOrderTrans', order);
          }
        })
      } else {
        ep.emit('error', returnData.errorType.dataBaseError.unknow, '没有找到地址信息');
      }
    }).catch(function (error) {
      logger.error('', '数据库错误：' + error.message);
      ep.emit('error', returnData.errorType.dataBaseError.unknow, error.message);
    })
  }
}

function _createBlhOrder(orderType, pdtNum, totalPrice, disCountPrice,custId, addId, point, remark, productList,discountList, callback) {

  var prodb = db.models.mallproduct;
  var orderdb = db.models.mallorder;
  var custdb = db.models.custextend;
  var orderitemdb = db.models.mallorderdetail;
  var pointdetaildb = db.models.propointdetail;
  var order = {},blhOrder = {};
  var ep = new eventproxy();

  ep.on('ok', function (data) {
    callback(null, data);
  });

  ep.on('error', function (error, msg) {
    var errorObj = {
      code: error,
      msg: msg
    };
    callback(errorObj, null);
  });

  ep.on('createOrderTrans', function (order) {

    db.sequelize.transaction({
      autocommit: true
    }).then(function (tran) {

      ep.on('rollback', function (error, errmsg) {
        tran.rollback();
        ep.emit('error', error, errmsg);
      });

      ep.on('callBlhManager', function () {

        tran.commit();
        ep.emit('ok', order);
        /*var parmobj = {
            order: JSON.stringify(blhOrder)
        }

        var blhurl = config.services.blhserver.url + config.services.blhserver.interfaces.createOrder;
        request.post({ url: blhurl, form: parmobj }, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var d = JSON.parse(body);
                if (!!d.data) {                    
                    tran.commit();
                    ep.emit('ok', order);
                } else {
                    logger.error(null, "请求百礼汇下单接口失败");
                    ep.emit('rollback', returnData.errorType.dataBaseError.unknow, JSON.stringify(d.error));

                }
            } else {
                logger.error(null, "请求百礼汇下单接口失败");
                ep.emit('rollback', returnData.errorType.dataBaseError.unknow, JSON.stringify(err));
            }
        });*/
      });

      /*更新积分记录 */
      ep.on('updatePointRecord', function () {
        var detailvo = {
          detailid: uuid.v4(),
          custid: custId,
          pointchannel: order.orderid,
          point: 0 - point,
          pointtime: moment().format(config.dateformat),
          changemode: 'order',
          remark: '订单消费'
        };
        pointdetaildb.create(detailvo, { transaction: tran }).then(function (results) {
          ep.emit('callBlhManager', order);
        }).catch(function (error) {
          ep.emit('rollback', returnData.errorType.dataBaseError.unknow, error.message);
        });
      });

      /*更新个人积分 */
      ep.on('updatePoint', function (data) {
        if (0 == point) { //不使用积分抵扣时，不记录积分消费记录
          ep.emit('ok', order);
          tran.commit();
          return;
        }
        var updateExtendsql = 'UPDATE custextend set point = point - ' + point + ' where custid = \'';
        updateExtendsql += custId + '\'';
        db.sequelize.query(updateExtendsql, { transaction: tran }).spread(function (results, metadata) {
          ep.emit('updatePointRecord');
        }).catch(function (error) {
          ep.emit('rollback', returnData.errorType.dataBaseError.unknow, error.message);
        });
      });

      /*更新折扣券信息 */
      ep.on('updateDiscount', function (data) {        
          var discountcoupondb = db.models.discountcoupon;
          discountcoupondb.update({
            state:1,
            usedate:moment().valueOf()
          },{
              where:{id:{$in:useDiscountColl}},
              transaction: tran 
            }).then(function(res){            
              ep.emit('updatePoint');
            }).catch(function(err){
              ep.emit('rollback', returnData.errorType.dataBaseError.unknow, error.message);
            })   
      });

      /*创建订单详情*/
      ep.on('createOrderDetail', function (order) {

        var detailItems = [];
        productList.forEach(function (productItem) {

          var mallproductvo = productItem.product;

          var item = {
            itemid: uuid.v4(),
            orderid: order.orderid,
            mcdid: mallproductvo.productid,
            productname: mallproductvo.productname,
            productnumber: productItem.number,
            productinfo: mallproductvo.productinfo,
            productimage: mallproductvo.productimage,
            price: mallproductvo.price,
            sumprice: mallproductvo.price * productItem.number,
            privilege: mallproductvo.privilege * productItem.number,
            cost: mallproductvo.cost
          };

          blhOrder.itemId = mallproductvo.productid;
          detailItems.push(item);
        });

        orderitemdb.bulkCreate(detailItems, {
          transaction: tran
        }).then(function (result) {
          order.items = detailItems;
          if (0 == useDiscountColl.length) {
            ep.emit('updatePoint');
          }else{
            ep.emit('updateDiscount');
          }
        }).catch(function (error) {
          ep.emit('rollback', returnData.errorType.dataBaseError.unknow, error.message);
        });
      });

      orderdb.create(order, {
        transaction: tran
      }).then(function (result) {
        ep.emit('createOrderDetail', order);
      }).catch(function (error) {
        ep.emit('rollback', returnData.errorType.dataBaseError.unknow, error.message);
      });

    })
  })

  var useDiscountColl = [],tmpDiscountList = [];        
  discountList.forEach(function (item) {
    item.discountList.forEach(function(e){
      if(-1 == useDiscountColl.indexOf(e.id))
        useDiscountColl.push(e.id);
    })    
  })

  var bm = 'ER' + moment().format('YYYYMMDD') + Math.random().toString().substr(2, 10);

  var addressdb = db.models.custaddress;
  addressdb.findOne({ where: { addid: addId } }).then(function (data) {
      if (data) {
        var addressInfo = data.get({ chain: true });
        //冗余收货地址信息
        var addressStr = addressInfo.country +
          ' ' + addressInfo.province +
          ' ' + addressInfo.city +
          ' ' + addressInfo.address +
          ' ' + addressInfo.phone +
          ' ' + addressInfo.contact;

        //计算邮费
        _getPostage(pdtNum, addressInfo.province).then(function (results) {
          if (results === false) {
            logger.error('', '购物车结算时，运费计算出错，找不到地址信息');
            ep.emit('error', returnData.errorType.unknow, '邮费计算异常');
          } else {

            var _paymoney = totalPrice  + results - disCountPrice - _pointConvertMoney(point); //实付金额 = 商品总额 + 邮费 - 抵扣金额
            _paymoney = (_paymoney < 0) ? 0 : _paymoney;
            _paymoney = parseFloat(_paymoney.toFixed(2));

            order = {
              orderid: uuid.v4(),
              custid: custId,
              price: totalPrice, //商品总额
              createtime: moment().valueOf(),
              state: 0,
              addid: addId,
              address: addressStr,
              orderbm: bm,
              paymoney: _paymoney,
              tickmoney: parseFloat(_pointConvertMoney(point).toFixed(2)),
              tickid:JSON.stringify(useDiscountColl),
              discountmoney:disCountPrice,
              remak: remark,
              evalstate: -1,
              producttype: orderType,
              express: '',
              trackingno: '',
              postage: results
            };

            blhOrder = {
              orderId : bm,
              itemId : '',
              num :pdtNum,
              realname:addressInfo.contact,
              phone:addressInfo.phone,
              address:addressStr,
              remarks:remark
            };

            ep.emit('createOrderTrans', order);
          }
        })
      } else {
        ep.emit('error', returnData.errorType.dataBaseError.unknow, '没有找到地址信息');
      }
    }).catch(function (error) {
      logger.error('', '数据库错误：' + error.message);
      ep.emit('error', returnData.errorType.dataBaseError.unknow, error.message);
    })
}
/**
 * 获取城市对应的邮费
 * @param pdtnum 商品数量
 * @param cityname 城市名
 * @return price
 */
function _getPostage(pdtNum, cityname) {
  var d = Q.defer();

  if (pdtNum >= 3) {
    d.resolve(0);
  } else {

    var citiespostagedb = db.models.citiespostage;
    citiespostagedb.findOne({
      where: {
        name: cityname
      }
    }).then(function (res) {
      if (res) {
        var obj = res.get({ chain: true });
        d.resolve(obj.price);
      } else {
        d.resolve(false);
      }
    }).catch(function (error) {
      logger.error('sys', '获取邮费出错，原因是:' + error.message);
      d.resolve(false);
    });
  }

  return d.promise;
}


function MallBase() {

}

/**
 * 创建商品订单
 * @param orderType:string 订单类型  
 *        example value : product|blh|qoupon|redpacket
 * @param action:string 创建订单的‘行为’
 *        example value : order,use,lotto,prolottery
 *        商城普通购买，普通购买礼券，积分抽奖下实物订单，扫码线下抽中实物，使用礼券
 * @param productList:array 商品列表
 *        example：[{product:object,num:int:}]
 * @param custId:string 购买者id
 * @param discountList:array 折扣券集合
 *        example:[{discountid:string,productid:string}]
 * @param callback(err,res)
 *        example:({code:string,msg:string},data:obj)
 * 
 * @description ：根据不同类型创建相应订单，订单详情也不尽相同，比如普通商品购买，扣除积分->产出订单实例等
 *                百礼汇，扣除积分->产出订单实例->call api to blh order
 *                购买礼券 ...
 *                使用礼券 ...
 *                积分兑换红包 ...
 * 
 * @step :
 *   //检查积分是否足够（密码是否正确）
    //计算订单金额
    //不同组合类型创建订单抬头
    //不同组合类型创建订单详情
    //扣除相应积分如有必要
    //记录相应积分记录如有必要
 */
var createOrder = function (orderType, action, productList,
  custId, addId, password, point, remark,discountList,
  callback) {

  var ptdNum = 0;//计算包邮需求

  productList.forEach(function (item) {
    var buyNum = item.number;//购买个数
    ptdNum += buyNum;
  })


  //检查订单创建条件，库存和积分是否充足,返回订单商品金额
  _checkOrderCondition(action, productList, custId, password, point,discountList, function (error, totalPrice,disCountPrice) {
    if (error != null) {
      callback(error, null);
    } else {
      switch (orderType) {
        case 'redpacket':
          _createRedpacketOrder(orderType, totalPrice, ptdNum, callback);
          break;
        case 'product':
          _createProductOrder(orderType, ptdNum, totalPrice, disCountPrice,custId, addId, point, remark, productList, discountList,callback);
          break;
        case 'qoupon':
          _createProductOrder(orderType, ptdNum, totalPrice, disCountPrice,custId, addId, point, remark, productList, discountList,callback);
          break;
        case 'blh':
          _createBlhOrder(orderType, ptdNum, totalPrice, disCountPrice,custId, addId, point, remark, productList, discountList,callback);
          break;
        default:
          callback({ code: 'unknow', msg: 'notype' }, null);
          logger.error(custId, '没有可创建的订单类型');
      }
    }
  });

}

/**
 * 获取城市对应的邮费
 * @param productnum 商品数量
 * @param addid 地址id
 * @return price
 */
function getPostageByAddId(arg, cb) {
    var pdtnum = arg.productnum || 1;
    var addressdb = db.models.custaddress;
    addressdb.findOne({
        where: {
            addid: arg.addid
        }
    }).then(function (res) {
        if (res) {
            var addinfo = res.get({ chain: true });
            _getPostage(pdtnum, addinfo.province).then(function (result) {
                if (result === false) {
                    logger.error('sys', '获取城市邮费信息出错,addid为：' + arg.addid);
                    cb(returnData.createError('unknow', '获取城市邮费信息出错'));
                } else {
                    cb(null, { price: result });
                }
            })
        } else {
            cb(returnData.createError('databaseError.notfind', '没有找到对应的地址信息'));
        }
    }).catch(function (err) {
        cb(returnData.createError('databaseError', err.message));
    })
}

function _getBlhExpress(arg,cb){

  var orderid = arg.orderid;
  var orderdetaildb = db.models.mallorderdetail;
  var orderdb = db.models.mallorder;

  function updateNewInfo(){
    orderdb.findOne({where:{orderid:orderid}}).then(function(res){
      if(res){
        var ordervo = res.get({chain:true});
        var newdb = db.models.custnewinfo;//消息提醒（小红标）
        newdb.findOne({
            where: { custid: ordervo.custid }
        }).then(function (result) {
            if (result) {
                var info = {
                    neworderreceivin: result.neworderreceivin + 1
                };
                newdb.update(info, {
                    where: { custid: ordervo.custid }
                }).then(function () { })
            } else {
                var info = {
                    custid: ordervo.custid,
                    neworderreceivin: 1,
                    newordereva: 0,
                    newprize: 0,
                    newprizereceivin: 0
                };
                newdb.create(info).then(function () { })
            }
        }).catch(function (error) {
        });
      }
    }).catch(function(err){
    })
  }

  orderdetaildb.findOne({
    where:{
      orderid : orderid
    }
  }).then(function(res){
    if(res){
      var orderev = res.get({chain:true});
      var parmobj = {
         order:JSON.stringify({
          orderId:arg.orderbm,
          itemId:orderev.mcdid
         })
      };

      var blhurl = config.services.blhserver.url + config.services.blhserver.interfaces.express;
      request.post({ url: blhurl, form: parmobj }, function (err, response, body) {
          if (!err && response.statusCode == 200) {
              var d = JSON.parse(body);
              if (!!d.data) {
                  cb(null, returnData.createData(d.data));
                  if(d.data.logisticsstatus == 2){
                    orderdb.update({state:'2'},{where:{orderid:orderid,state:'1'}}).then(function(res){
                      if(res[0] > 0){
                        updateNewInfo();
                      }
                      
                    }).catch(function(err){
                      logger.error('sys', orderid + '订单状态更新失败：' + JSON.stringify(err));
                    });
                  }
              } else {
                  cb(returnData.createError('unknow', JSON.stringify(d.error)));
              }
          } else {
              cb(returnData.createError('unknow', "获取百礼汇订单快递信息失败"));
          }
      });
    }else{
      cb(returnData.createError('databaseError.notfind', '没有找到对应的订单信息'));
    }
  }).catch(function(err){
    cb(returnData.createError('databaseError', err.message));
  })
}


function genBlhOrder(orderinfo,cb){

  var ep = new eventproxy();

  ep.on('ok', function (result) {
    cb(null, returnData.createData(result));
  });

  ep.on("error", function (errorCode, msg) {
    logger.error('', "请求百礼汇下单接口失败"+msg);
    cb(returnData.createError(errorCode, msg));
  });

  var blhOrder = {
    orderId: '',
    itemId: '',
    num: 0,
    realname: '',
    phone: '',
    address: '',
    remarks: ''
  };

  ep.on('genBlhOrder', function () {

    var orderitemdb = db.models.mallorderdetail;
    orderitemdb.findOne({ where: { orderid: orderinfo.orderid } }).then(function (data) {
      if (data) {
        var blhorderdetail = data.get({ chain: true });
        var pdtnum = blhorderdetail.productnumber;
        var mcdid = blhorderdetail.mcdid;

        blhOrder['itemId'] = mcdid;
        blhOrder['num'] = pdtnum;

        var parmobj = {
          order: JSON.stringify(blhOrder)
        }

        var blhurl = config.services.blhserver.url + config.services.blhserver.interfaces.createOrder;
        request.post({ url: blhurl, form: parmobj }, function (err, response, body) {
          if (!err && response.statusCode == 200) {
            var d = JSON.parse(body);
            if (!!d.data) {
              ep.emit('recordnewinfo', orderinfo);
            } else {
              ep.emit('error', returnData.errorType.dataBaseError.unknow, JSON.stringify(d.error));

            }
          } else {
            ep.emit('error', returnData.errorType.dataBaseError.unknow, JSON.stringify(err));
          }
        });

      } else {
        ep.emit('error', returnData.errorType.notexist, '没有找到对应的订单明细');
      }

    }).catch(function (error) {
      ep.emit('error', returnData.errorType.unknow, error.message);
    })
  });

  ep.on('callBlhManager', function () {

    var addressStr = '', addphone = '', addname = '';
    var addressdb = db.models.custaddress;
    addressdb.findOne({ where: { addid: orderinfo.addid } }).then(function (data) {
      if (data) {
        var addressInfo = data.get({ chain: true });
        addressStr = addressInfo.country +
          ' ' + addressInfo.province +
          ' ' + addressInfo.city +
          ' ' + addressInfo.address +
          ' ' + addressInfo.phone +
          ' ' + addressInfo.contact;

        addphone = addressInfo.phone;
        addname = addressInfo.contact;
      }

      blhOrder['orderId'] = orderinfo.orderbm;
      blhOrder['realname'] = addname;
      blhOrder['phone'] = addphone;
      blhOrder['address'] = addressStr;
      blhOrder['remarks'] = orderinfo.remak;

      ep.emit('genBlhOrder');
    }).catch(function (error) {
      ep.emit('error', returnData.errorType.unknow, error.message);
    })
  });

  ep.emit('callBlhManager');
}

exports.createOrder = createOrder;
exports.getPostageByAddId = getPostageByAddId;
exports.priceConvertPoint = _priceConvertPoint;
exports.getBlhExpress = _getBlhExpress;
exports.genBlhOrder = genBlhOrder;