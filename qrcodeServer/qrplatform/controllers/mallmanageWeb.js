/**
 * Created by Erathink on 2016/12/13.
 */
//加载第三方库
var eventproxy = require('eventproxy');
var sequelize = require('sequelize');
var Q = require('q');
var multiline = require('multiline');
var uuid = require('node-uuid');
var moment = require('moment');
var md5 = require('MD5');
var request = require('request');
var Excel = require('exceljs');
var decodeExcel = require('node-xlsx');
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
var finance = require('./finance');
var uploader = require('../common/uploader');
var mallmanageBase = require('./mallmanageBase');

/**
 * 获取已参加活动的商品列表
 * @param arg
 * @param callback
 * @author fengyun
 */
function _getMallPdtList(arg, cb) {

    var page = arg.page || 1,
        size = arg.size || 10;
    page = tool.getInt(page);
    size = tool.getInt(size);

    var queryobj = {};
    var categoryid = arg.categoryid;
    if (categoryid && categoryid != '') queryobj = { 'mallcategoryCaid': { $like: categoryid + '%' } };

    //queryobj.state = vmall.state.sell;
    var point = arg.point || -1;
    point = tool.getInt(point);
    if (point >= 0) queryobj.price = { $lte: point };

    //var showpoint = arg.showpoint;
    //if (showpoint === 'false') queryobj.producttype = { $ne: 'point' };

    if (!arg.currentuser.openid) {
        queryobj.productor = {
            $or: [
                [arg.currentuser.entid, 'erathink']
            ]
        }
    }

    var parm = arg.query;
    if (parm != undefined && !tool.verifier.isEmptyString(parm)) {
        try {
            var parmobj = JSON.parse(parm);
            if (parmobj.productname && parmobj.productname != '') {
                var pdtquery = '%' + parmobj.productname + '%';
                queryobj.productname = { $like: pdtquery };
            }

            if (parmobj.state && parmobj.state != '') {
                queryobj.state = parmobj.state;
            }

            if (parmobj.producttype && parmobj.producttype != '') {
                queryobj.producttype = { $or: parmobj.producttype };
            }

        } catch (error) {
            cb(returnData.createError(returnData.errorType.paraerror, "查询参数解析错误"), null);
        }
    }

    var malldb = db.models.mallproduct;
    malldb.findAndCountAll({
        where: queryobj,
        offset: malldb.pageOffset(page, size),
        limit: size,
        order: [
            ['productdate', 'DESC']
        ],
        /*include: {
            model: db.models.mallcategory,
            required: true // 加个required: true,即可
        }*/
    }).then(function (data) {
        if (data) {
            var result = {};
            count = data.count;
            result.data = data.rows;
            result.totalpage = totalpage(count, size);
            result.page = page;
            result.size = size;
            result.totalsize = count;
            result.imageurl = config.mall.productlistimageurl;
            result.imagestyle = config.mall.productlistimagestyle
            cb(null, returnData.createData(result));
        } else {
            logger.error(arg.currentuser.useraccount, '******获取已参加商品类别列表出错!******');
            cb(returnData.createError(returnData.errorType.notexist, "未找到商品类别列表"), null);
        }
    }).catch(function (err) {
        logger.error(arg.currentuser.useraccount, err.message);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
    });
}

/**
 * 更新商城商品
 * @param arg
 * @param callback
 * @author fengyun
 */
function _updateMallProduct(arg, cb) {

    var ep = new eventproxy();

    var mallproductdb = db.models.mallproduct;
    var mallproductdetaildb = db.models.mallproductinfo;
    var qouponcontentdb = db.models.qoupon_content;

    var productInput = arg.productInfo;
    var productInfo = {};
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;

    if (!!productInput) {
        try {
            productInfo = JSON.parse(productInput);
        } catch (error) {
            logger.error(useraccount, "更新商品参数解析失败");
            error.code = returnData.errorType.paraerror;
            cb(returnData.createError(err.code, error.message));
            return;
        }
    }

    //拆分商品概要和商品详情信息,更新至各自表
    var productOverview = {},
        productDetailInfo = {};
    for (var x in productInfo) {
        if (x === 'productdetail') {
            productDetailInfo = productInfo['productdetail'];
            productDetailInfo['productid'] = productInfo['productid'];
            continue;
        }
        productOverview[x] = productInfo[x];
    }


    ep.on("error", function (error) {
        logger.error(useraccount, "接口/mall/saveOrUpdPcd错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    /**
     * 更新商品
     */
    ep.on("updateProduct", function () {
        db.sequelize.transaction(function (t) {
            function updateProduct() {
                var d = Q.defer();
                productOverview.productor = arg.currentuser.entid;
                //检查更新的名字是否与其他商品相同
                if(productOverview.productname != undefined){
                    mallproductdb.findOne({
                        where: {
                            productname: productOverview.productname,
                            productid: { $ne: productOverview.productid },
                            $or: [{ productor: 'erathink' }, { productor: arg.currentuser.entid }]
                        }
                    }).then(function (res) {
                        if (res) {
                            var error = {};
                            error.code = returnData.errorType.exists;
                            error.msg = '商品名已经存在';
                            d.reject(error);
                        } else {
                            mallproductdb.upsert(productOverview, {
                                where: { productid: productOverview.productid },
                                transaction: t
                            }).then(function (result) {
                                logger.info(useraccount, "更新商城商品成功");
                                d.resolve(productOverview);
                            }).catch(function (error) {
                                logger.error(useraccount, "更新商城商品失败");
                                error.code = returnData.errorType.dataBaseError.unknow;
                                error.msg = error.message;
                                d.reject(error);
                            });
                        }
                    }).catch(function (err) {
                        var error = {};
                        error.code = returnData.errorType.dataBaseError.unknow;
                        error.msg = err.message;
                        d.reject(error);
                    })
                }else{
                    mallproductdb.upsert(productOverview, {
                        where: { productid: productOverview.productid },
                        transaction: t
                    }).then(function (result) {
                        logger.info(useraccount, "更新商城商品成功");
                        d.resolve(productOverview);
                    }).catch(function (error) {
                        logger.error(useraccount, "更新商城商品失败");
                        error.code = returnData.errorType.dataBaseError.unknow;
                        error.msg = error.message;
                        d.reject(error);
                    });
                }
                
                return d.promise;
            }

            function updateqoupon(product) {
                //如果是qoupon,需保存清单内容
                var d = Q.defer();
                if (product.producttype == 'qoupon') {
                    var content = arg.content;
                    if (content) {
                        qouponcontentdb.destroy({
                            where: { qouponclassid: product.productid },
                            transaction: t
                        }).then(function (resu) {
                            content = JSON.parse(content);
                            var conlist = [];
                            for (var index in content) {
                                var conitem = content[index];
                                conitem.qouponclassid = productOverview.productid;
                                if (!conitem.itemid)
                                    conitem.itemid = uuid.v4();
                                conlist.push(conitem);
                            }
                            qouponcontentdb.bulkCreate(conlist, { transaction: t }).then(function (ponres) {
                                d.resolve(product);
                            }).catch(function (error) {
                                error.code = returnData.errorType.dataBaseError.unknow;
                                error.msg = error.message;
                                d.reject(error);
                            });
                        }).catch(function (error) {
                            error.code = returnData.errorType.dataBaseError.unknow;
                            error.msg = error.message;
                            d.reject(error);
                        });
                    }else{
                        d.resolve(product);
                    }                    
                } else {
                    d.resolve(product);
                }
                return d.promise;
            }

            function updateProductDetail(product) {
                var d = Q.defer();
                if (!productDetailInfo.productid) {
                    d.resolve(product);
                } else {
                    mallproductdetaildb.upsert(productDetailInfo, {
                        where: { productid: productOverview.productid },
                        transaction: t
                    }).then(function (result) {
                        product.productdetail = productDetailInfo;
                        d.resolve(product);
                    }).catch(function (error) {
                        error.code = returnData.errorType.dataBaseError.unknow;
                        error.msg = error.message;
                        d.reject(error);
                    });
                }
                return d.promise;
            }

            //更新商品时同时更新礼券内关联商品列表内商品的名称
            function updateQouponContent(product) {
                var d = Q.defer();

                if (product.producttype == 'qoupon') {
                    d.resolve(product);
                } else {
                    qouponcontentdb.update({ productname: productOverview.productname }, {
                        where: { productid: productOverview.productid },
                        transaction: t
                    }).then(function () {
                        logger.info(useraccount, 'qouponcontentdb内商品名称更新成功');
                        d.resolve(product);
                    }).catch(function () {
                        logger.error(useraccount, "更新商城商品失败");
                        error.code = returnData.errorType.dataBaseError.unknow;
                        error.msg = error.message;
                        d.reject(error);
                    });
                }
                return d.promise;
            }

            return updateProduct()
                .then(updateProductDetail).then(updateqoupon).then(updateQouponContent);

        }).then(function (result) {
            cb(null, returnData.createData(result));
        }).catch(function (err) {
            cb(returnData.createError(err.code, err.msg));
        });
    });

    //校验礼品名称，积分数，市场参考价，礼品总数，礼品描述，礼品详情
    try {
        if ( (productOverview.productname != undefined && productOverview.productname.length > 100)
             || (productOverview.productinfo != undefined && productOverview.productinfo.length > 200)
             || (productOverview.amount != undefined && parseInt(productOverview.amount) <= 0 )
             || (productOverview.price != undefined && parseFloat(productOverview.price) <= 0 )
             || (productOverview.cost != undefined && parseFloat(productOverview.cost) <= 0) ){
            cb(returnData.createError(returnData.errorType.paraerror, '新增商品参数错误'));
            return;
        }
    } catch (error) {
        cb(returnData.createError(returnData.errorType.paraerror, '新增商品参数错误'));
        return;
    }

    if (productOverview.productid == '') { //新增商品
        var productid = productOverview.productid ? productOverview.productid : uuid.v4();
        productOverview['productid'] = productid;
        productDetailInfo['productid'] = productid;
        productOverview.productdate = moment().format(config.dateformat);
    }

    ep.emit("updateProduct");
}

function updateProductState(arg, cb) {
    var productid = arg.productid,
        state = arg.state;

    var ep = new eventproxy();

    var mallproductdb = db.models.mallproduct;
    ep.on("updateState", function () {
        mallproductdb.update({
            state: state
        }, {
                where: { productid: productid },
            }).then(function (res) {
                if (!!res) {
                    logger.info('sys', "更新商品状态成功");
                    cb(null, returnData.createData(res));
                } else {
                    logger.error('sys', '无法找到对应商品');
                    cb(returnData.errorType.dataBaseError.notfind, '无法找到对应商品');
                }
            }).catch(function (error) {
                logger.error('sys', '更新商品状态失败', error.message);
                cb(returnData.errorType.dataBaseError.unknow, error.message);
            })
    });

    ep.emit("updateState");
}

function _getOrderList(arg, cb) {

    var page = arg.page || 1,
        size = arg.size || 10;
    page = tool.getInt(page);
    size = tool.getInt(size);

    var bt = 0,
        et = 0;
    var advancedQuery = {};
    try {

        arg.begtime ? bt = moment(arg.begtime).valueOf() : bt;
        arg.endtime ? et = moment(arg.endtime).add(1, 'd').valueOf() : et;

        if (et < bt && (0 != bt && 0 != et)) {
            cb(returnData.createError(returnData.errorType.paraerror, '查询结束时间小于开始时间'), null);
            return;
        } else if (0 == et && bt > 0) {
            advancedQuery.createtime = { $gte: bt };
        } else if (0 == bt && et > 0) {
            advancedQuery.createtime = { $lte: et };
        } else if (et >= bt && 0 != et && 0 != bt) {
            advancedQuery.createtime = { $between: [bt, et] };
        }

    } catch (error) {
        cb(returnData.createError(returnData.errorType.paraerror, '订单查询时间解析出错'), null);
        return;
    }

    if (arg.orderbm) {
        advancedQuery.orderbm = arg.orderbm;
    }

    if (arg.state) {
        advancedQuery.state = arg.state;
    }

    var mallorderdb = db.models.mallorder;
    var orderitemdb = db.models.mallorderdetail;

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info('sys', "订单查找成功");
        cb(null, returnData.createData(result));
    });

    ep.on("error", function (error) {
        logger.error('sys', "接口club/getOrderList错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误" + error));
    });

    ep.on('getorderlist', function (result) {
        if (result && result.data.length > 0) {
            var list = result.data;
            var count = result.data.length;

            ep.after('finish', count, function () {
                result.imageurl = config.mall.productlistimageurl;
                result.imagestyle = config.mall.productlistimagestyle;
                ep.emit('ok', result);
            });

            try {
                list.forEach(function (item) {
                    item.dataValues.createtime = moment(item.dataValues.createtime).format('YYYY-MM-DD HH:mm:ss');
                    var id = item.orderid;
                    orderitemdb.findAll({
                        where: { orderid: id }
                    }).then(function (reslist) {
                        if (reslist)
                            item.dataValues.items = reslist;
                        else
                            item.dataValues.items = [];
                        ep.emit('finish')
                    }).catch(function (info) {
                        throw new Error(info);
                    })
                })
            } catch (error) {
                ep.emit("error", error.message);
            };
        } else {
            ep.emit('ok', result);
        }
    });

    mallorderdb.findAndCountAll({
        where: advancedQuery,
        offset: mallorderdb.pageOffset(page, size),
        limit: size,
        order: 'createtime desc',
        include: {
            model: db.models.customer,
            required: true
        }
    }).then(function (data) {
        var result = {};
        count = data.count;
        result.data = data.rows;
        result.totalpage = totalpage(count, size);
        result.page = page;
        result.size = size;
        result.totalsize = count;

        ep.emit('getorderlist', result);
    }).catch(function (err) {
        logger.error(arg.currentuser.useraccount, err.message);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
    });
}

function _updateOrder(arg, cb) {

    /*
        0：代付款     1：待发货  2：待收货   3：已完成   4：已取消   
        5：退货审核中  6：换货审核中   7：退货中  8：换货中        
        100：已关闭（订单完成或取消1月后，该订单不能再评价））
    */

    var statesArray = [
        0, 1, 2, 3, 4, 100
    ];

    var ep = new eventproxy();

    var orderInput = arg.orderInfo;
    var orderInfo = {};
    if (!!orderInput) {
        try {
            orderInfo = JSON.parse(orderInput);
        } catch (error) {
            logger.error(arg.currentuser.useraccount, "更新订单参数解析失败");
            error.code = returnData.errorType.paraerror;
            cb(returnData.createError(error.code, error.message));
            return;
        }
    }
    var mallorderdb = db.models.mallorder;

    ep.on('progressOrder', function (orderfromdb) {

        var prestate = orderfromdb.state;

        db.sequelize.transaction({ autocommit: true }).then(function (t) {

            function updateOrder() {
                var deferred = Q.defer();
                mallorderdb.update(orderInfo, {
                    where: { orderid: orderInfo.orderid },
                    transaction: t
                }).then(function (result) {
                    result[0] >= 1 ? deferred.resolve(true) : deferred.resolve(false);
                }).catch(function (error) {
                    deferred.reject(returnData.createError(returnData.errorType.dataBaseError.unknow, error.message));
                });

                return deferred.promise;
            }

            if (('4' == orderInfo.state || '100' == orderInfo.state) && orderfromdb.producttype != 'redpacket') {
                //更改订单状态为已取消或关闭,且所购商品不是红包类型，会回滚相关信息

                if (prestate == '4' || prestate == '100') {
                    cb(returnData.createError(returnData.errorType.refuse, '非法的订单取消请求'), null);
                    t.rollback();
                } else {
                    updateOrder().then(function (res) {
                        doRevokeActionEx(arg.currentuser, orderfromdb, orderInfo.state, t).then(function (result) {
                            cb(null, returnData.createData(result));
                            t.commit();
                        }).catch(function (err) {
                            cb(err, null);
                            t.rollback();
                        })
                    }).catch(function (err) {
                        cb(err, null);
                        t.rollback();
                    })
                }

            } else {
                if ('3' == orderInfo.state) { //更改订单状态为已完成
                    orderInfo.evalstate = '0'; //可评价
                    orderInfo.finishtime == null ? orderInfo.finishtime = moment().format('x') : orderInfo.finishtime
                } else if ('2' == orderInfo.state) {
                    orderInfo.trackingno != null ? orderInfo.sendtime = moment().format('x') : orderInfo.sendtime

                    var newdb = db.models.custnewinfo;//消息提醒（小红标）
                    newdb.findOne({
                        where: { custid: orderfromdb.custid }
                    }).then(function (result) {
                        if (result) {
                            var info = {
                                neworderreceivin: result.neworderreceivin + 1
                            };
                            newdb.update(info, {
                                where: { custid: orderfromdb.custid }
                            }).then(function () { })
                        } else {
                            var info = {
                                custid: orderfromdb.custid,
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
                updateOrder().then(function (result) {
                    cb(null, returnData.createData(result));
                    t.commit();
                }).catch(function (err) {
                    cb(err, null);
                    t.rollback();
                })
            }

        }).catch(function (err) {
            cb(err, null);
        });

    });

    ep.on('vaildOrder', function (orderfromdb) {

        //通过此接口更改state为1时，强校验，必须是来自系统内部调用，其他一律为非法请求
        if (1 == orderInfo.state) {
            if (arg.currentuser.useraccount == 'wxcb') {
                ep.emit('progressOrder', orderfromdb);
            } else {
                var error = {};
                error.code = returnData.errorType.refuse;
                cb(returnData.createError(error.code, '非法请求'));
            }
        } else {
            ep.emit('progressOrder', orderfromdb);
        }
    })

    mallorderdb.findOne({ where: { orderid: orderInfo.orderid } }).then(function (res) {
        if (res) {
            var ov = res.get({ chain: true });
            ep.emit('vaildOrder', ov);
        } else {
            var error = {};
            error.code = returnData.errorType.dataBaseError.notfind;
            logger.error(arg.currentuser.useraccount, '找不到指定的订单id：' + orderInfo.orderid);
            cb(returnData.createError(error.code, '找不到指定的订单id'));
        }
    }).catch(function (error) {
        error.code = returnData.errorType.dataBaseError.unknow;
        logger.error(arg.currentuser.useraccount, '更新订单状态失败，原因是：' + error.message);
        cb(returnData.createError(error.code, '服务器开小差，数据库异常'));
    })

}

/**
 * 除了红包等虚拟物品,发起撤销订单后，客户积分回滚，写入积分回滚记录,库存回滚，如有现金交易则退款，并生成退款记录
 * @param currentuser 执行退单的用户信息
 * @param orderid 订单id
 * @param t 事务对象
 * @return {promise}
 */

function doRevokeActionEx(currentuser, orderfromdb, cancelstate, t) {

    /**
     * 
     * step1:回滚库存
     * 
     * step2:回滚积分
     * 
     * step3:回滚折扣券
     * 
     * step4:记录积分回滚记录
     * 
     * step5:回滚现金，依赖微信支付服务器返回（如需要）。 ----- 该步骤如果失败，必须回滚事务
     * 
     * step6：记录现金回滚日志（如果记录日志的dao操作失败，但微信现金确实正常退还给原账户，可不用事物回滚，都返回为成功）
     */
    var useraccount = currentuser.useraccount || 'sys';

    var orderele = orderfromdb;
    var orderid = orderfromdb.orderid;
    var refundObj = {
        'paymoney': 0,
        'reducePoint': 0
    };

    var deferred = Q.defer();

    var ep = new eventproxy();

    //数据库异常错误
    ep.on("dbError", function (error) {
        logger.error(useraccount, "内部doRevokeAction失败，数据库错误:" + error.message);
        deferred.reject(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    //回滚业务出错
    ep.on("resultError", function (error) {
        logger.error(useraccount, "内部doRevokeAction失败，业务错误", error.message);
        deferred.reject(returnData.createError(error.code, error.message));
    });

    //撤销订单成功
    ep.on("ok", function () {
        deferred.resolve(true);
    });

    //记录现金日志
    ep.on("writeCashLogs", function (cashvo) {

        var cashParams = {};
        cashParams.transaction_id = cashvo.transaction_id;
        cashParams.out_refund_no = cashvo.out_refund_no; //退款单号
        cashParams.refund_id = cashvo.refund_id; //微信退款单号
        cashParams.refund_fee = (cashvo.refund_fee / 100).toFixed(2); //退款金额
        cashParams.refund_type = cashvo.refund_type; //退款类型
        cashParams.refund_state = cashvo.refund_state; //退款状态
        cashParams.refund_time_end = moment().format("YYYY-MM-DD HH:mm:ss"); //退款时间
        finance.updateIncomeRecord(cashParams, function (err, result) { //need to transaction?
            if (err != null) {
                logger.error(useraccount, err.error.message);
            }

            ep.emit('ok');
        });
    });

    //退款,如果条件成立（之前已成功付款）
    ep.on("refund", function () {

        var paymoney = refundObj.paymoney;
        if (paymoney > 0 && orderfromdb.state != '0') { //订单状态不是待付款
            var fee = parseInt((paymoney * 100).toFixed(2));
            var outbm = 'TK' + moment().format('YYYYMMDD') + Math.random().toString().substr(2, 10); 
            var opt = {
                out_trade_no: orderele.orderbm,
                out_refund_no: outbm,
                total_fee: fee,
                refund_fee: fee
            };

            var refundurl = config.services.wxpayserver.url + config.services.wxpayserver.interfaces.refund;
            request.post({ url: refundurl, form: opt }, function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var d = JSON.parse(body);
                    if (d.error != null) {
                        var error = {};
                        error.code = d.error.code;
                        error.message = d.error.message;
                        ep.emit('resultError', error);
                    } else {
                        ep.emit('writeCashLogs', d.data);
                    }
                } else {
                    var error = {};
                    error.code = 'unknow';
                    error.message = '退款失败，请重试';
                    ep.emit('resultError', error);
                }
            });
        } else if(paymoney > 0 && orderfromdb.state == '0'){
            //调用微信关单接口
            var opt = {};
            opt.out_trade_no = orderfromdb.orderbm;
            var closeorderurl = config.services.wxpayserver.url + config.services.wxpayserver.interfaces.closeOrder;
            request.post({ url: closeorderurl, form: opt }, function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var d = JSON.parse(body);
                    if (!d.error) {
                        logger.info('wxcb', '发起关闭订单成功，商户订单id:' + orderfromdb.orderbm);
                    } else {
                        logger.error('wxcb', '发起关闭订单失败，商户订单id:' + orderfromdb.orderbm + '错误原因：' + d.error.message);
                    }
                } else {
                    logger.error('wxcb', '发起关闭订单失败，商户订单id:' + orderfromdb.orderbm + '错误原因：' + err.message);
                }
            });
            ep.emit('ok');
        } else{
            ep.emit('ok');
        }
    });

    //写入积分回滚记录
    ep.on('writePointLogs', function (reducePoint) {
        var detailvo = {
            detailid: uuid.v4(),
            custid: orderele.custid,
            entid: currentuser.entid,
            pointchannel: orderid,
            point: reducePoint,
            pointtime: moment().format(config.dateformat),
            changemode: 'refund',
            remark: '订单撤销，退回积分'
        };

        var pointdetaildb = db.models.propointdetail;
        pointdetaildb.create(detailvo, { transaction: t }).then(function (res) {
            ep.emit('refund');
        }).catch(function (error) {
            ep.emit('dbError', error);
        })
    })    

    //回滚积分
    ep.on("rollbackPoint", function () {

        var reducePoint = refundObj.reducePoint;
        if (reducePoint > 0) {
            var updateExtendsql = 'UPDATE custextend set point = point + ' + reducePoint + ' where custid = \'';
            updateExtendsql += orderele.custid + '\'';
            db.sequelize.query(updateExtendsql, { transaction: t }).spread(function (results, metadata) {
                ep.emit('writePointLogs', reducePoint);
            }).catch(function (error) {
                ep.emit('dbError', error);
            })
        } else {
            ep.emit('refund');
        }
    });

    //回滚折扣券
    ep.on('rollbackDiscountCoupon',function(){
        var discountmoney = orderele.discountmoney; //抵扣折扣券金额
        var discountIDArray = [];
        if(discountmoney > 0){
            discountIDArray = JSON.parse(orderele.tickid);
        }

        var discountcoupondb = db.models.discountcoupon;
        discountcoupondb.update({state:0,usedate:0}, { where:{id:{$in:discountIDArray}},transaction: t }).then(function (res) {
            ep.emit('rollbackPoint');
        }).catch(function (error) {
            ep.emit('dbError', error);
        })
    })

    //回滚库存
    ep.on("rollbackStock", function () {
        var orderdetaildb = db.models.mallorderdetail;
        orderdetaildb.findAll({
            where: { orderid: orderid },
            transaction: t
        }).then(function (details) {
            if (0 == details.length) {
                var error = {};
                error.code = 'databaseError.notfind';
                error.message = '回滚商品库存，查不到对应的订单明细';
                ep.emit('resultError', error);
            } else {
                var buffer = [];
                for (var x = 0; x < details.length; ++x) {
                    var id = details[x].mcdid;
                    var amounts = details[x].productnumber;
                    (function (productid, addnumbers) {
                        var updateExtendsql = 'UPDATE mallproduct set amount = amount + ' + addnumbers + ' where productid = \'';
                        updateExtendsql += productid + '\'';
                        db.sequelize.query(updateExtendsql, { transaction: t }).spread(function (results, metadata) {
                            buffer.push(productid);
                            if (buffer.length === details.length) {
                                ep.emit('rollbackDiscountCoupon');
                            }
                        }).catch(function (error) {
                            ep.emit('dbError', error);
                        })
                    })(id, amounts);
                }
            }
        }).catch(function (error) {
            ep.emit('dbError', error);
        });
    });

    //核对退还信息
    ep.on("confirmOrder", function () {
        var paymoney = orderele.paymoney; //实际支付现金额
        var reducePoint = _priceConvertPoint(orderele.tickmoney); //抵扣积分
        refundObj.paymoney = paymoney;
        refundObj.reducePoint = reducePoint;
        if (cancelstate == '100') {//如果是关闭订单直接从抵扣折扣券金额开始
            ep.emit('rollbackDiscountCoupon');
        } else {
            ep.emit('rollbackStock');
        }

    });

    //todo 回滚抵扣券
    ep.emit('confirmOrder');

    return deferred.promise;
}
/**
 * 总行数计算
 * @param total
 * @param size
 * @returns {number}
 */
var totalpage = function (total, size) {
    var page = Math.floor(Number(total) / Number(size));
    if (Number(total) % Number(size) > 0) page++;
    return page;
};

function getProductTypeList(arg, cb) {
    var page = arg.page || 1,
        size = arg.size || 10;

    page = tool.getInt(page);
    size = tool.getInt(size);

    var queryobj = {};

    var parmobj = {
        page:page,
        size:size
    }

    var blhurl = config.services.blhserver.url + config.services.blhserver.interfaces.getCategory;
    request.post({ url: blhurl, form: parmobj }, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            var d = JSON.parse(body);
            if (!!d.data) {
                cb(null, returnData.createData(d.data));
            } else {
                logger.error(arg.currentuser.useraccount, "_getProductTypeList错误");
                cb(returnData.createError('unknow', JSON.stringify(d.error)));
            }
        } else {
            logger.error(arg.currentuser.useraccount, "_getProductTypeList错误");
            cb(returnData.createError('unknow', "获取百礼汇商品失败"));
        }
    });
}

function getproductinfo(arg, cb) {
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;
    var productid = arg.productid;

    var prodb = db.models.mallproduct;
    var infodb = db.models.mallproductinfo;
    var evaldb = db.models.producteval;
    var ep = new eventproxy();

    var res = {
        baseinfo: {},
        info: {},
        eval: {}
    };

    ep.on('ok', function (result) {
        logger.info(useraccount, "获取购商品信息成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口getproductinfo错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });


    ep.on('avg', function (countinfo) {

        evaldb.aggregate('score', 'avg', {
            where: { productid: productid, state: '1' },
        }).then(function (result) {
            res.eval = {
                score: result,
                count: countinfo
            };

            ep.emit('ok', res);
        }).catch(function (error) {
            ep.emit('error', error);
        });
    });


    ep.on('geteval', function () {
        evaldb.count({
            where: { productid: productid, state: '1' },
            attributes: ['leve'],
            group: 'leve'
        }).then(function (result) {
            res.eval = result;
            ep.emit('avg', result);
        }).catch(function (error) {
            ep.emit('error', error);
        });
    });


    ep.on('getinfo', function () {
        infodb.findOne({
            where: { productid: productid }
        }).then(function (result) {
            res.info = result;
            if (result) {
                result.dataValues.imagepath = config.mall.productimageurl;
                result.dataValues.imagestyle = config.mall.productimagestyle;
                result.dataValues.images = JSON.parse(result.dataValues.images);
            }
            ep.emit('geteval', eval);
        }).catch(function (error) {
            ep.emit('error', error);
        });
    });

    prodb.findOne({
        where: { productid: productid }
    }).then(function (result) {
        res.baseinfo = result;
        ep.emit('getinfo');
    }).catch(function (error) {
        ep.emit('error', error);
    });

}

// 格式化orderItem
function _formatOrderItem(orderItem) {
    orderItem.createtime = moment(orderItem.createtime).isValid() ? moment(orderItem.createtime).format("YYYY-MM-DD HH:mm:ss") : "";
    orderItem.finishtime = moment(orderItem.finishtime).isValid() ? moment(orderItem.finishtime).format("YYYY-MM-DD HH:mm:ss") : "";
    orderItem.sendtime = moment(orderItem.sendtime).isValid() ? moment(orderItem.sendtime).format("YYYY-MM-DD HH:mm:ss") : "";

    switch (orderItem.state) {
        case "0":
            orderItem.state = "待付款";
            break;
        case "1":
            orderItem.state = "待发货";
            break;
        case "2":
            orderItem.state = "待收货";
            break;
        case "3":
            orderItem.state = "已完成";
            break;
        case "4":
            orderItem.state = "已取消";
            break;
        case "5":
            orderItem.state = "退货审核中";
            break;
        case "6":
            orderItem.state = "换货审核中";
            break;
        case "7":
            orderItem.state = "退货中";
            break;
        case "8":
            orderItem.state = "换货中";
            break;
        case "100":
            orderItem.state = "已关闭";
            break;
        default:
            orderItem.state = "未知";
            break;
    }
    return orderItem;
}

// 合并单元格
function _mergeWorkSheet(worksheet, mergeList) {
    var columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

    for (var i = 0; i < mergeList.length; i++) {
        var mergeItem = mergeList[i];
        for (var j = 0; j < columns.length; j++) {
            var column = columns[j];
            var mergeString = column + mergeItem.start + ":" + column + mergeItem.end;
            worksheet.mergeCells(mergeString);
            worksheet.getCell(column + mergeItem.start).alignment = { vertical: 'middle' };
        }
    }
}

// 初始化workbook
function _initWorkbook(data) {
    var workbook = new Excel.Workbook();
    var worksheet = workbook.addWorksheet('订单列表');
    worksheet.columns = [
        { header: '订单编号', key: 'orderbm', width: 25 },
        { header: '创建时间', key: 'createtime', width: 25 },
        { header: '客户名称', key: 'nickname', width: 15 },
        { header: '状态', key: 'state', width: 10 },
        { header: '收货信息', key: 'address', width: 70 },
        { header: '快递公司', key: 'express', width: 20 },
        { header: '快递单号', key: 'trackingno', width: 25 },
        { header: '发货时间', key: 'sendtime', width: 25 },
        { header: '完成时间', key: 'finishtime', width: 25 },
        { header: '总金额（分）', key: 'price', width: 15 },
        { header: '实付金额（分）', key: 'paymoney', width: 15 },
        { header: '代金劵金额（分）', key: 'tickmoney', width: 15 },
        { header: '商品名称', key: 'productname', width: 25 },
        { header: '数量', key: 'productnumber', width: 10 },
        { header: '单价（分）', key: 'detailprice', width: 15 },
        { header: '小计（分）', key: 'sumprice', width: 15 }
    ];
    var mergeList = [];

    for (var i = 0; i < data.length; i++) {
        var item = _formatOrderItem(data[i]);
        worksheet.addRow(item);

        var mergeItem;
        if (mergeList.length == 0) {
            mergeItem = {
                start: 2,
                end: 2,
                orderbm: item.orderbm
            };
            mergeList.push(mergeItem);
        } else {
            // 取最后一个mergeItem
            mergeItem = mergeList[mergeList.length - 1];
            if (mergeItem.orderbm == item.orderbm) {
                mergeItem.end += 1;
            } else {
                mergeList.push({
                    start: i + 2,
                    end: i + 2,
                    orderbm: item.orderbm
                });
            }
        }
    }
    _mergeWorkSheet(worksheet, mergeList);
    return workbook;
}

function downloadOrderList(req, res) {
    var sequelize = db.sequelize;

    var sql = 'select morder.orderbm, morder.createtime, morder.remak,' +
        ' morder.address, morder.state, morder.express, morder.trackingno,' +
        ' morder.finishtime, morder.sendtime, morder.price, morder.paymoney, morder.tickmoney,' +
        ' detail.productname, detail.productnumber, detail.price as detailprice, detail.sumprice,' +
        ' customer.nickname' +
        ' from mallorder as morder' +
        ' join mallorderdetail as detail on morder.orderid = detail.orderid' +
        ' left join customer on morder.custid = customer.custid' +
        ' where 1 = 1'

    var whereCondition = '';
    if (req.body.begtime) {
        var begMoment = moment(req.body.begtime);
        if (begMoment.isValid()) {
            begMoment = begMoment.hours(0).minutes(0).seconds(0);
            whereCondition += ' and morder.createtime >= ' + begMoment.format('x');
        }
    }

    if (req.body.endtime) {
        var endMoment = moment(req.body.endtime);
        if (endMoment.isValid()) {
            endMoment = endMoment.hours(23).minutes(59).seconds(59);
            whereCondition += ' and morder.createtime <= ' + endMoment.format('x');
        }
    }

    if (req.body.orderbm) {
        whereCondition += ' and morder.orderbm = ' + req.body.orderbm;
    }

    if (req.body.state) {
        whereCondition += ' and morder.state = ' + req.body.state;
    }


    var orderCondition = ' order by morder.orderbm, morder.createtime ';

    sql += whereCondition;
    sql += orderCondition;

    sequelize.query(sql, {
        type: 'SELECT'
    }).then(function (data) {
        try {
            var workbook = _initWorkbook(data);
        } catch (error) {
            logger.error(error);
            res.json({
                error: {
                    code: "unknow",
                    message: "excel文档构建错误"
                }
            });
            return;
        }

        res.header("Content-Type", "application/octet-stream");
        res.header("Content-Disposition", "attachment; filename=orderList.xlsx");
        workbook.xlsx.write(res);
    }).catch(function (error) {
        logger.error(error);
        res.json({
            error: {
                code: "databaseError",
                message: "sql语句执行错误"
            }
        });
    });

}

function _pointConvertMoney(point) {
    return point / 1;
}

//价格转积分
function _priceConvertPoint(price) {
    return price * 1;
}

function _updateCouponProduct(arg, cb, req, res) {

    var mallproductdb = db.models.mallproduct;
    var mallproductdetaildb = db.models.mallproductinfo;
    var qouponcontentdb = db.models.qoupon_content;
    var productInput = arg.productInfo;
    var productInfo = {};
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;
    var productOverview = {},
        productDetailInfo = {};
    var ep = new eventproxy();

    ep.on("error", function (errorCode, msg) {
        logger.error(useraccount, "接口updateCouponProduct错误", msg);
        cb(returnData.createError(errorCode, msg));
    });

    /**
     * 更新商品
     */
    ep.on("updateProduct", function (params) {
        db.sequelize.transaction(function (t) {

            //更新商品信息
            function updateProduct() {
                var d = Q.defer();
                productOverview.productor = arg.currentuser.entid;
                //检查更新的名字是否与其他商品相同
                mallproductdb.findOne({
                    where: {
                        productname: productOverview.productname,
                        productid: { $ne: productOverview.productid },
                        $or: [{ productor: 'erathink' }, { productor: arg.currentuser.entid }]
                    }
                }).then(function (res) {
                    if (res) {
                        var error = {};
                        error.code = returnData.errorType.exists;
                        error.msg = '商品名已经存在';
                        d.reject(error);
                    } else {

                        mallproductdb.findOne({
                            where: { productid: productOverview.productid }
                        }).then(function (fres) {

                            if (fres) {
                                var pdvo = fres.get({ chain: true });
                                if (params.body.couponlist.length > 0) {
                                    if (pdvo.amount == null)
                                        productOverview.amount = 0;

                                    productOverview.amount = pdvo.amount + params.body.couponlist.length;
                                }
                            } else {
                                productOverview.amount = params.body.couponlist.length;
                            }

                            mallproductdb.upsert(productOverview, {
                                where: { productid: productOverview.productid },
                                transaction: t
                            }).then(function (result) {
                                logger.info(useraccount, "更新商城商品成功");
                                d.resolve(productOverview);
                            }).catch(function (error) {
                                logger.error(useraccount, "更新商城商品失败");
                                error.code = returnData.errorType.dataBaseError.unknow;
                                error.msg = error.message;
                                d.reject(error);
                            });
                        }).catch(function (error) {
                            logger.error(useraccount, "更新商城商品失败");
                            error.code = returnData.errorType.dataBaseError.unknow;
                            error.msg = error.message;
                            d.reject(error);
                        })
                    }
                }).catch(function (err) {
                    var error = {};
                    error.code = returnData.errorType.dataBaseError.unknow;
                    error.msg = err.message;
                    d.reject(error);
                })
                return d.promise;
            }

            //更新商品明细信息
            function updateProductDetail(product) {
                var d = Q.defer();
                if (!productDetailInfo.productid) {
                    d.resolve(product);

                } else {
                    mallproductdetaildb.upsert(productDetailInfo, {
                        where: { productid: productOverview.productid },
                        transaction: t
                    }).then(function (result) {
                        product.productdetail = productDetailInfo;
                        d.resolve(product);
                    }).catch(function (error) {
                        error.code = returnData.errorType.dataBaseError.unknow;
                        error.msg = error.message;
                        d.reject(error);
                    });
                }
                return d.promise;
            }

            //创建优惠券列表
            function createCoupon() {
                var d = Q.defer();
                var productid = productOverview.productid;

                //construct insert sql
                var insertCoupon = '';
                for (var i = 0; i < params.body.couponlist.length; ++i) {
                    var ele = "('" + uuid.v4() + "'" + ',"' + productid + '",' + moment().format('X') + ",'normal','" + params.body.couponlist[i] + "'),";
                    insertCoupon += ele;
                }
                insertCoupon = insertCoupon.substr(0, insertCoupon.length - 1);

                db.sequelize.query('insert into cashcoupon (couponid,productid,createdate,state,url) values ' + insertCoupon, {
                    transaction: t
                }).spread(function (results, metadata) {
                    d.resolve(true);
                }).catch(function (error) {
                    error.code = returnData.errorType.mallmanager.excelerror;
                    error.msg = '不能导入含有重复的优惠券或excel文件格式有误，请检查';
                    d.reject(error);
                });

                return d.promise;
            }

            if (0 == params.flist.length) { //不需要新增优惠券列表
                return updateProduct()
                    .then(updateProductDetail);
            } else {
                return createCoupon()
                    .then(updateProduct)
                    .then(updateProductDetail);
            }


        }).then(function (result) {
            cb(null, returnData.createData(result));
        }).catch(function (err) {
            cb(returnData.createError(err.code, err.msg));
        });
    });

    //封装校验商品信息
    ep.on('warpdata', function (params) {

        var productInput = params.body.productInfo;
        try {
            productInfo = JSON.parse(productInput);
        } catch (error) {
            logger.error(useraccount, "更新商品参数解析失败");
            ep.emit('error', returnData.errorType.paraerror, error.message);
            return;
        }

        //拆分商品概要和商品详情信息,更新至各自表
        for (var x in productInfo) {
            if (x === 'productdetail') {
                productDetailInfo = productInfo['productdetail'];
                productDetailInfo['productid'] = productInfo['productid'];
                continue;
            }
            productOverview[x] = productInfo[x];
        }

        //校验礼品名称，积分数，市场参考价，礼品总数，礼品描述，礼品详情
        try {
            if (productOverview.productname.length > 100 || productOverview.productinfo.length > 200 ||
                parseFloat(productOverview.price) <= 0 || parseFloat(productOverview.cost) <= 0) {
                ep.emit('error', returnData.errorType.paraerror, error.message);
                return;
            }
        } catch (error) {
            ep.emit('error', returnData.errorType.paraerror, error.message);
            return;
        }

        if (productOverview.productid == '') { //新增商品
            var productid = productOverview.productid ? productOverview.productid : uuid.v4();
            productOverview['productid'] = productid;
            productDetailInfo['productid'] = productid;
            productOverview.productdate = moment().format(config.dateformat);
        }

        ep.emit("updateProduct", params);

    })

    //解析excel文件
    ep.on('decode', function (params) {

        if (params.flist.length == 0) { //未上传excel文件
            params.body.couponlist = [];
            ep.emit('warpdata', params);
            return;
        }

        try {
            var excelfilePath = params.flist[0];
            var workSheetsFromFile = decodeExcel.parse(excelfilePath);
            var sData = workSheetsFromFile[0].data,
                couponlist = [];
            for (var i = 0; i < sData.length; ++i) {
                if (sData[i].length > 0 && (sData[i][0] != '' || sData[i][0] !== 'undefined')) {
                    couponlist.push(sData[i][0]);
                }
            }
        } catch (error) {
            ep.emit('error', returnData.errorType.mallmanager.excelerror, 'excel解析失败');
        }

        fs.unlink(excelfilePath, function (err) {
            if (err == null) {
                params.body.couponlist = couponlist;
                ep.emit('warpdata', params);
            } else {
                ep.emit('error', returnData.errorType.mallmanager.excelerror, 'excel解析失败');
            }
        });
    })

    //接收excel文件和表单数据    
    ep.on('recv', function () {

        var form = uploader.createUpload(req, res);
        var flist = []; //接收的文件列表
        form.parse(req, function (err, fields, files) {

            if (err) {
                ep.emit('error', returnData.errorType.mallmanager.excelerror, '文件上传失败');
            } else {
                for (var k in files) {
                    var newname = uuid.v4();
                    var ext = uploader.getfileext(files[k].name);
                    flist.push(files[k].path);
                }

                var couponParams = {};
                couponParams.flist = flist;
                couponParams.body = fields;
                ep.emit('decode', couponParams);
            }
        });
    })

    ep.emit('recv');
}

/**
 * 获取百礼汇商品
 * @param arg
 * @param callback
 * @author fengyun
 */
function _getBlhPdtList(arg, cb) {

    var page = arg.page || 1,
        size = arg.size || 10;

    page = tool.getInt(page);
    size = tool.getInt(size);

    var queryobj = {};
    var categoryId = arg.categoryId;
    if (categoryId && categoryId != '') queryobj['category_id']= categoryId;
    
    var low = arg.low,high = arg.high; 
    if (low != undefined && high != undefined && low < high){
        queryobj['market_price'] = {between:[low,high]};
    }

    var parmobj = {
        page:page,
        size:size,
        filter: JSON.stringify(queryobj)
    }

    var blhurl = config.services.blhserver.url + config.services.blhserver.interfaces.getPdtList;
    request.post({ url: blhurl, form: parmobj }, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            var d = JSON.parse(body);
            if (!!d.data) {
                cb(null, returnData.createData(d.data));
            } else {
                logger.error(arg.currentuser.useraccount, "_getBlhPdtList错误");
                cb(returnData.createError('unknow', JSON.stringify(d.error)));
            }
        } else {
            logger.error(null,err);logger.error(null,JSON.stringify(err));
            logger.error(arg.currentuser.useraccount, "_getBlhPdtList错误");
            cb(returnData.createError('unknow', "获取百礼汇商品失败"));
        }
    });
}

/**
 * 批量导入百礼汇商品
 * @param arg
 * @param callback
 * @author fengyun
 */
function _importBlhPdt(arg, cb) {

    var mallproductdb = db.models.mallproduct;
    var mallproductdetaildb = db.models.mallproductinfo;

    var ep = new eventproxy();

    ep.on("error", function (code, msg) {
        logger.error(arg.currentuser.useraccount, "接口/mall/importBlhPdt错误", msg);
        cb(returnData.createError(code, msg));
    });

    ep.on("ok",function(){
        cb(null, returnData.createData(true));
    })

    try {
        var blhList = JSON.parse(arg.list); 
    } catch (error) {
        ep.emit('error', returnData.errorType.paraerror, error.message);
        return;
    }
    
    ep.on('warpdata', function (pdtlist) {

        function insert(item) {
    
            var defer = Q.defer();

            var info = item;
            console.log(moment(info.update_time*1000).format('YYYY-MM-DD HH:mm:ss'));
            var productOverview = {
                productid : info.itemId,
                productname:info.product_name,
                productor : arg.currentuser.entid,
                price:info.market_price,
                privilege:0,
                amount : 999999,
                productdate:moment(info.update_time*1000).format('YYYY-MM-DD HH:mm:ss'),
                state : 'sell',
                producttype:'blh',
                mallcategoryCaid:'006',//info.category_id,
                productimage:info.product_images,
                productinfo:info.product_name,
                leve : 5,
                cost : info.settlement,
                spec:1
            };

            var productDetail = {
                productid : info.itemId,
                htmlinfo : info.product_infos,
                images : info.product_img
            };

            db.sequelize.transaction(function (t) {

                function insertPdt() {
                    var d1 = Q.defer();
                    mallproductdb.create(productOverview, {
                        transaction: t
                    }).then(function (result) {
                        d1.resolve(productOverview);
                    }).catch(function (error) {
                        error.code = returnData.errorType.dataBaseError.unknow;
                        error.msg = error.message;
                        d1.reject(error);
                    });

                    return d1.promise;
                }

                function insertDetail() {
                    var d2 = Q.defer();
                    mallproductdetaildb.create(productDetail, {
                        transaction: t
                    }).then(function (result) {
                        d2.resolve(result);
                    }).catch(function (error) {
                        error.code = returnData.errorType.dataBaseError.unknow;
                        error.msg = error.message;
                        d2.reject(error);
                    });

                    return d2.promise;
                }

                return insertPdt().then(insertDetail);

            }).then(function (res) {
                defer.resolve(true);
            }).catch(function (error) {
                defer.reject(error);
            })

            return defer.promise;
        }

        var promiseArray = pdtlist.map(function (value, index, self) {
            return insert(value);
        });

        Q.all(promiseArray).then(function (results) {
            ep.emit('ok');
        }).catch(function (error) {
            ep.emit('error', error.code, error.msg);
        })
    });

    ep.on('checkPdts', function (list) {

        var nameList = [];
        for (var i = 0; i < list.length; ++i) {
            nameList.push(list[i].product_name);
        }
        
        mallproductdb.count({
            where: {
                productname: {
                    $in: nameList
                }
            }
        }).then(function (data) {
            if (data > 0) {
                ep.emit('error', returnData.errorType.exists, data);
            } else {
                ep.emit('warpdata', list);
            }
        }).catch(function (err) {
            logger.error(arg.currentuser.useraccount, err.message);
            cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
        });

    });

    var parmobj = {
        filter: JSON.stringify({
            itemId: {
                in: blhList
            }
        })
    }

    var blhurl = config.services.blhserver.url + config.services.blhserver.interfaces.getPdtList;
    request.post({ url: blhurl, form: parmobj }, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            var d = JSON.parse(body);
            if (!!d.data) {
                logger.info(arg.currentuser.useraccount, "成功获取商品列表！" + d.data.data);
                ep.emit('checkPdts', d.data.data);
            } else {
                ep.emit('error', 'unknow', JSON.stringify(d.error));
            }
        } else {
            ep.emit('error', 'unknow', '服务器内部错误');
        }
    });
}

function setDiscountProd(arg,cb){

    var mallproductdb = db.models.mallproduct;
    var pdtlist = JSON.parse(arg.pdtlist);

    mallproductdb.update({
        isDiscount : arg.state
    },{
        where:{
            productid:{
                $in:pdtlist
            }
        }
    }).then(function(res){
        cb(null, returnData.createData(true));
    }).catch(function(err){
        logger.error(arg.currentuser.useraccount, "设置折扣商品出错，原因是："+JSON.stringify(err));
        cb(returnData.createError('unknow', "设置折扣商品出错"));
    })

}

exports.getMallPdtList = _getMallPdtList;
exports.getBlhPdtList = _getBlhPdtList;
exports.updateMallProduct = _updateMallProduct;
exports.updateCouponProduct = _updateCouponProduct;
exports.getOrderList = _getOrderList;
exports.updateOrder = _updateOrder;
exports.getProductTypeList = getProductTypeList;
exports.getproductinfo = getproductinfo;
exports.downloadOrderList = downloadOrderList;
exports.updateProductState = updateProductState;
exports.importBlhPdt = _importBlhPdt;
exports.setDiscountProd = setDiscountProd;