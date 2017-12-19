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
var mallBase = require('./mallmanageBase');
var mallWeb = require('./mallmanageWeb');

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


function getshopingcart(arg, cb) {
    //var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;
    var custid = arg.custid;
    var page = arg.page || 1,
        size = arg.size || 10;
    page = tool.getInt(page);
    size = tool.getInt(size);

    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    var shopdb = db.models.shopingcart;
    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "获取购物车信息成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口getshopingcart错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    shopdb.findAndCountAll({
        where: { custid: custid },
        offset: shopdb.pageOffset(page, size),
        limit: size,
        order: [
            ['addtime', 'DESC']
        ],
        include: {
            model: db.models.mallproduct,
            required: true
        }
    }).then(function (result) {
        result.imageurl = config.mall.productshopcarimageurl;
        result.imagestyle = config.mall.productshopcarimagestyle;
        ep.emit('ok', result);
    }).catch(function (error) {
        logger.error(useraccount, "查询购物车失败");
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    })

}

function addtoshopcart(arg, cb) {
    //var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;
    var custid = arg.custid;
    var productid = arg.productid;
    var number = arg.number || 1;
    number = tool.getInt(number);
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    var rec = {
        id: uuid.v4(),
        custid: custid,
        productid: productid,
        number: number,
        addtime: moment().valueOf()
    };

    var shopdb = db.models.shopingcart;

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "获取购物车信息成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口getshopingcart错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    ep.on("update", function (shopitem) {
        var upnumber = shopitem.number + rec.number;
        shopdb.update({ number: upnumber }, {
            where: { id: shopitem.id }
        }).then(function (result) {
            ep.emit('ok', true);
        }).catch(function (error) {
            ep.emit('error', error);
        })
    });

    ep.on("save", function () {
        shopdb.create(rec).then(function (result) {
            ep.emit('ok', true);
        }).catch(function (error) {
            ep.emit('error', error);
        })
    });

    shopdb.findOne({
        where: { custid: custid, productid: productid }
    }).then(function (result) {
        if (result) {
            ep.emit('update', result);
        } else {

            ep.emit("save");
        }
    }).catch(function (error) {
        ep.emit('error', error);
    });
}

function deleteshopcart(arg, cb) {
    //var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;
    var custid = arg.custid;
    var productid = arg.productid;

    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    var shopdb = db.models.shopingcart;

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "获取购物车信息成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口getshopingcart错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    shopdb.destroy({
        where: { custid: custid, productid: productid }
    }).then(function (result) {
        ep.emit('ok', result);
    }).catch(function (error) {
        ep.emit('error', error);
    });
}

function updateshopitemnumber(arg, cb) {
    var useraccount = !!arg.currentuser ? arg.currentuser.nicjname : null;
    var shopid = arg.itemid;
    var number = arg.number || 1;
    number = tool.getInt(number);

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "获取购物车信息成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口getshopingcart错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    db.sequelize.query("update shopingcart set number=" + number + " where id='" + shopid + "'").spread(function (result) {
        ep.emit('ok', result);
    }).catch(function (error) {
        ep.emit("error", error);
    });
}

function getproducteval(arg, cb) {
    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;
    var productid = arg.productid;
    var evaldb = db.models.producteval;

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "获取购物车信息成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口getproductwval错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    ep.on('avg', function (countinfo) {

        evaldb.aggregate('score', 'avg', {
            where: { productid: productid, state: '1' },
        }).then(function (result) {
            var res = {
                score: result,
                count: countinfo
            }

            ep.emit('ok', res);
        }).catch(function (error) {
            ep.emit('error', error);
        });
    });

    evaldb.count({
        where: { productid: productid, state: '1' },
        attributes: ['leve'],
        group: 'leve'
    }).then(function (result) {

        var levelArray = [0, 1, 2]; //好 中 差
        for (var x = 0; x < result.length; ++x) {
            var ele = result[x].leve;
            var pos = levelArray.indexOf(ele);
            if (-1 != pos) {
                levelArray.splice(pos, 1);
            }
        }

        if (levelArray.length > 0) {
            for (var y = 0; y < levelArray.length; ++y) {
                result.push({
                    leve: levelArray[y],
                    count: 0
                });
            }
        }

        ep.emit('avg', result);

    }).catch(function (error) {
        ep.emit('error', error);
    });
}

/**
 * 获取评论列表，供后台管理查询审核
 * @param state
 * @returns {list}
 */
function getproductevallist(arg, cb) {

    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : 'sys';
    var page = arg.page || 1,
        size = arg.size || 10;
    page = tool.getInt(page);
    size = tool.getInt(size);

    var whereQuery = {},
        joinQuery = {};
    !!arg.state ? whereQuery.state = arg.state : whereQuery;
    !!arg.key ? whereQuery.info = { $like: '%' + arg.key + '%' } : whereQuery;
    !!arg.productname ? joinQuery.productname = { $like: '%' + arg.productname + '%' } : joinQuery;

    if (arg.sensitiveflag) {
        if (-1 === [0, 1].indexOf(parseInt(arg.sensitiveflag))) {
            cb(returnData.createError(returnData.errorType.paraerror, 'sensitiveflag存在非法值'), null);
            return;
        } else {
            whereQuery.sensitiveflag = arg.sensitiveflag;
        }
    }

    var evaldb = db.models.producteval;
    evaldb.findAndCountAll({
        where: whereQuery,
        offset: evaldb.pageOffset(page, size),
        limit: size,
        order: 'createtime desc',
        include: [{
            model: db.models.mallorder,
            required: true
        },
        {
            model: db.models.mallproduct,
            where: joinQuery,
            required: true
        }
        ]
    }).then(function (data) {
        var result = {};
        count = data.count;
        result.data = data.rows;
        result.totalpage = totalpage(count, size);
        result.page = page;
        result.size = size;
        result.totalsize = count;
        cb(null, returnData.createData(result));
    }).catch(function (err) {
        logger.error(arg.currentuser.useraccount, err.message);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
    });
}

function getproductevalbyleve(arg, cb) {
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;
    var productid = arg.productid;
    var leve = arg.leve || -1;
    var pagenumber = arg.pagenumber || 1;
    var pagesize = arg.pagesize || 10;
    pagenumber = tool.getInt(pagenumber);
    pagesize = tool.getInt(pagesize);
    leve = tool.getInt(leve);

    var evaldb = db.models.producteval;

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "获取购物车信息成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口getproductwvalbyleve错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    var where = { productid: productid };
    if (leve >= 0)
        where.leve = leve;
    where.state = '1';


    evaldb.findAndCountAll({
        where: where,
        limit: pagesize,
        offset: (pagenumber - 1) * pagesize,
        order: [
            ['createtime', 'DESC']
        ]
    }).then(function (result) {
        ep.emit('ok', result);
    }).catch(function (error) {
        ep.emit('error', error);
    });
}

function saveproducteval(arg, cb) {
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    var eval = JSON.parse(arg.eval);
    if (!eval.id) {
        eval.id = uuid.v4();
        !eval.createtime ? eval.createtime = moment().valueOf() : eval.createtime;
    }

    if (arg.currentuser.nickname) {
        delete eval.state;
        delete eval.remark;
    }

    var evaldb = db.models.producteval;
    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "保存商品评价成功!");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口saveproducteval错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    db.sequelize.transaction({
        autocommit: true
    }).then(function (tran) {

        ep.on('rollback', function (error, errcode, errmsg) {
            tran.rollback();
            if (error) {
                logger.error(useraccount, "接口checkout错误", error);
                ep.emit('error', error);
            } else {
                logger.error(useraccount, errmsg);
                cb(returnData.createError(errcode, errmsg));
            }

        });
        ep.on('updateorder', function () {
            db.sequelize.query("update mallorder set evalstate=1 where orderid='" + eval.orderid + "'", {
                transaction: tran
            }).then(function (result) {
                tran.commit();
                ep.emit('ok', eval);
            }).catch(function (error) {
                ep.emit('rollback', error);
            });
        });

        evaldb.upsert(eval, {
            transaction: tran
        }).then(function (result) {
            ep.emit('updateorder');
        }).catch(function (error) {
            ep.emit('rollback', error);
        });
    }).catch(function (error) {
        ep.emit('error', error);
    });
}

function createsendredpackorder(arg, cb) {
    if (!arg.currentuser.custid) { //非mobile请求
        cb(returnData.createError(returnData.errorType.refuse), null)
        return;
    }
    var productid = arg.productid;
    var custid = arg.custid;
    var addid = arg.addid;
    var remak = arg.remak;
    var password = arg.password;
    var amount = arg.amount;

    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    var custdb = db.models.custextend;
    var prodb = db.models.mallproduct;
    var orderdb = db.models.mallorder;
    var orderitemdb = db.models.mallorderdetail;
    var pointdb = db.models.propointdetail;
    var custinfodb = db.models.customer;

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "获取购物车信息成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口getshopingcart错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    ep.on('updateorderstate', function (order) {

        orderdb.update({
            state: '3'
        }, {
                where: { orderid: order.orderid }
            }).then(function (result) {
                order.state = 3;
                ep.emit('ok', order);
            }).catch(function (error) {
                ep.emit('ok', order);
            });
    });

    ep.on('sendredpack', function (order, custinfo, amount) {
        var ops = {
            billtype: 'mallorder',
            openid: custinfo.dataValues.openid,
            amount: amount,
            billno: '',
            sendname: '订单' + order.orderbm,
            wishing: '感谢您的订购!',
            ip: '',
            actname: '积分兑换',
            remark: ''
        };
        // if(order.billno&&order.billno!=''&&order.billno!='0'){
        //     ops.billno=order.billno;
        // }
        mobile.getbillno(function (error, bm) {
            if (error) {
                logger.error('sys', '调用订单服务出错!')
                ep.emit('ok', order);
            } else {
                orderdb.update({
                    billno: bm
                }, {
                        where: { orderid: order.orderid }
                    }).then(function (result) {
                        ops.billno = bm;
                        mobile.resendredpack(ops, function (error1, bill) {
                            if (error1) {
                                ep.emit('ok', order);
                            } else {
                                if (bill.resultcode != 'success') {
                                    ep.emit('ok', order);
                                } else {
                                    ep.emit('updateorderstate', order);
                                }
                            }
                        });
                    }).catch(function (error) {
                        ep.emit('ok', order);
                    });
            }
        });

    });

    ep.on('createorderop', function (productinfo, custinfo) {
        db.sequelize.transaction({
            autocommit: true
        }).then(function (tran) {
            var sumpoint = productinfo.price * amount;
            var sumprivi = productinfo.privilege * amount;
            var sumcost = productinfo.cost * amount;

            ep.on('rollback', function (error, errcode, errmsg) {
                tran.rollback();
                if (error) {
                    logger.error(useraccount, "接口checkout错误", error);
                    ep.emit('error', error);
                } else {
                    logger.error(useraccount, errmsg);
                    cb(returnData.createError(errcode, errmsg));
                }

            });

            ep.on('savepointrec', function (order) {
                var rec = {
                    detailid: uuid.v4(),
                    custid: custid,
                    pointchannel: order.orderid,
                    point: 0 - order.paymoney,
                    pointtime: moment().format(config.dateformat),
                    changemode: 'order',
                    remark: '订单消费'
                };
                pointdb.create(rec, {
                    transaction: tran
                }).then(function () {
                    tran.commit();
                    ep.emit('sendredpack', order, custinfo, sumcost);
                }).catch(function (error) {
                    ep.emit('rollback', error);
                });
            });

            ep.on('createorderitem', function (order) {
                var item = {
                    itemid: uuid.v4(),
                    orderid: order.orderid,
                    mcdid: productinfo.productid,
                    productname: productinfo.productname,
                    productnumber: amount,
                    productinfo: productinfo.productinfo,
                    productimage: productinfo.productimage,
                    price: productinfo.price,
                    sumprice: productinfo.price * amount,
                    privilege: productinfo.privilege * amount,
                    cost: productinfo.cost
                };
                orderitemdb.create(item, {
                    transaction: tran
                }).then(function (result) {
                    order.items = [];
                    order.items.push(item);
                    ep.emit('savepointrec', order);
                }).catch(function (error) {
                    ep.emit('rollback', error);
                });
            });

            ep.on('createorder', function (bm) {

                var order = {
                    orderid: uuid.v4(),
                    custid: custid,
                    price: sumpoint,
                    createtime: moment().valueOf(),
                    state: 2,
                    addid: addid,
                    orderbm: bm,
                    paymoney: sumpoint - sumprivi,
                    tickmoney: 0,
                    remak: remak,
                    evalstate: -1,
                    billno: '0',
                    producttype: 'redpacket',
                    express: '',
                    trackingno: ''
                };
                orderdb.create(order, {
                    transaction: tran
                }).then(function (result) {
                    ep.emit('createorderitem', order);
                }).catch(function (error) {
                    ep.emit('rollback', error);
                });
            });

            ep.on('createOrderBm', function () {
                orderdb.max('orderbm', {
                    where: { orderbm: { $gt: "ER" + moment().format('YYYYMMDD') + '0000000000' } },
                    transaction: tran
                }).then(function (result) {
                    var bm = "ER" + moment().format('YYYYMMDD');
                    if (result) {
                        var nustr = result.substring(10, result.length);
                        var nu = tool.getInt(nustr) + 1;
                        nustr = '' + nu;
                        bm = bm + tool.padLeft(nustr, '0', 8);
                    } else {
                        bm = bm + '00000001';
                    }
                    ep.emit('createorder', bm);
                }).catch(function (error) {
                    ep.emit('error', error);
                });
            });

            custdb.update({
                point: custinfo.point - sumpoint
            }, {
                    where: { custid: custid },
                    transaction: tran
                }).then(function () {
                    ep.emit('createOrderBm');
                }).catch(function (error) {
                    ep.emit('rollback', error);
                });

        }).catch(function (error) {
            ep.emit('error', error);
        });
    });

    ep.on('checkpoint', function (productinfo, custinfo) {
        custdb.findOne({
            where: { custid: custid }
        }).then(function (result) {
            var passwordcode = tool.genPwd(password);
            var sumpoint = productinfo.price * amount;

            if (passwordcode === result.paypassword) {
                if (result.point >= sumpoint) {
                    result.dataValues.openid = custinfo.openid;
                    ep.emit('createorderop', productinfo, result);
                } else {
                    cb(returnData.createError(returnData.errorType.account.pointerror, "积分不足"));
                }
            } else {
                cb(returnData.createError(returnData.errorType.account.passworderror, '支付密码错误'));
            }

        }).catch(function (error) {
            ep.emit('error', error);
        });
    });

    ep.on('getopenid', function (productinfo) {
        custinfodb.findOne({
            where: { custid: custid }
        }).then(function (result) {
            if (result) {
                ep.emit('checkpoint', productinfo, result);
            } else {
                cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "找不到用户信息!"));
            }
        }).catch(function (error) {
            ep.emit('error', error);
        });
    });

    prodb.findOne({
        where: { productid: productid }
    }).then(function (result) {
        if (result.producttype == "redpacket") {
            ep.emit('getopenid', result);
        } else {
            cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "商品类型错误!"));
        }
    }).catch(function (error) {
        ep.emit('error', error);
    });

}

//重新尝试发送红包
function resendredpackorder(arg, cb) {
    if (!arg.currentuser.custid) { //非mobile请求
        cb(returnData.createError(returnData.errorType.refuse), null)
        return;
    }

    var orderid = arg.orderid;
    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;

    var custdb = db.models.customer;
    var billdb = db.models.bill;
    var orderdb = db.models.mallorder;
    var orderitemdb = db.models.mallorderdetail;

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "重新发送红包订单成功!");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口resendredpackorder错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    ep.on('updateorderstate', function (order) {
        orderdb.update({
            state: '3'
        }, {
                where: { orderid: order.orderid }
            }).then(function (result) {
                order.state = 3;
                ep.emit('ok', order);
            }).catch(function (error) {
                ep.emit('error', error);
            });
    });

    ep.on('sendred', function (order, ops) {
        mobile.resendredpack(ops, function (error, bill) {
            if (error) {
                ep.emit('error', error);
            } else {
                if (bill.resultcode != 'success') {
                    //ep.emit('error', error);
                    logger.error(useraccount, "接口resendredpackorder错误", bill.resultcode);
                    cb(returnData.createError('paraerror', bill.resultcode));
                } else {
                    ep.emit('updateorderstate', order);
                }

            }
        })
    });


    ep.on('getbillbm', function (order, custinfo, amount) {
        mobile.getbillno(function (err1, bm) {
            if (err1) {
                ep.emit('error', err1);
            } else {
                orderdb.update({ billno: bm }, { where: { orderid: orderid } }).then(function (orderresult) {
                    var ops = {
                        billtype: 'mallorder',
                        openid: custinfo.openid,
                        amount: amount,
                        billno: bm,
                        sendname: '订单' + order.orderbm,
                        wishing: '感谢您的订购!',
                        ip: '',
                        actname: '积分兑换',
                        remark: ''
                    };
                    logger.info('sys order', JSON.stringify(ops));
                    ep.emit('sendred', order, ops);
                }).catch(function (error1) {
                    ep.emit('error', error1);
                })

            }
        })
    });

    ep.on('getorderitems', function (order, custinfo) {
        orderitemdb.findAll({
            where: { orderid: orderid }
        }).then(function (result) {
            if (result && result.length > 0) {
                var sum = 0;
                result.forEach(function (item) {
                    logger.info('sys item', JSON.stringify(item));
                    sum = sum + (item.cost * item.productnumber);
                });

                ep.emit('getbillbm', order, custinfo, sum);

            } else {
                ep.emit('updateorderstate', order);
            }
        }).catch(function (error) {
            ep.emit('error', error);
        });
    });

    ep.on('getcust', function (order) {
        custdb.findOne({
            where: { custid: order.custid }
        }).then(function (result) {
            ep.emit('getorderitems', order, result);
        }).catch(function (error) {
            ep.emit('error', error);
        });
    });

    ep.on('getbillinfo', function (order) {
        billdb.findOne({
            where: { billno: order.billno }
        }).then(function (result) {
            if (result) {
                var ops = {
                    billtype: 'mallorder',
                    openid: result.openid,
                    amount: result.amount,
                    billno: result.billno,
                    sendname: '订单' + order.orderbm,
                    wishing: '感谢您的订购!',
                    ip: '',
                    actname: '积分兑换',
                    remark: ''
                };
                ep.emit('sendred', order, ops);
            } else {
                ep.emit('getcust', order);
            }
        }).catch(function (error) {
            ep.emit('error', error);
        });
    });

    orderdb.findOne({
        where: { orderid: orderid }
    }).then(function (result) {
        if (result.state === '2' || result.state === '1') {
            if (result.billno && result.billno != '' && result.billno != '0') {
                ep.emit('getbillinfo', result);
            } else {
                ep.emit('getcust', result);
            }
        } else {
            cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "订单状态异常,订单已关闭或未付款!"));
        }
    }).catch(function (error) {
        ep.emit('error', error);
    });

}

//供扫码抽奖生成订单使用
function creategiftorder(arg, custid, address, productid, number, remak, cb) {
    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;

    var addid = address.addid;

    var prodb = db.models.mallproduct;
    var orderdb = db.models.mallorder;
    var orderitemdb = db.models.mallorderdetail;
    var adddb = db.models.custaddress;
    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "获取购物车信息成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口creategiftorder错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    ep.on('recordnewinfo', function (res) {
        var order = res;
        var newdb = db.models.custnewinfo;
        newdb.findOne({
            where: { custid: order.custid }
        }).then(function (result) {
            if (result) {
                var info = {
                    neworderreceivin: result.neworderreceivin + 1
                };
                newdb.update(info, {
                    where: { custid: order.custid }
                }).then(function () {
                    ep.emit('ok', res);
                }).catch(function (err) {
                    ep.emit('error', err.message);
                });
            } else {
                var info = {
                    custid: order.custid,
                    neworderreceivin: 1,
                    newordereva: 0,
                    newprize: 0,
                    newprizereceivin: 0
                };
                newdb.create(info).then(function () {
                    ep.emit('ok', res);
                }).catch(function () {
                    ep.emit('ok', res);
                });
            }
        }).catch(function (error) {
            ep.emit('ok', res);
        });
    });

    ep.on('begincreate', function () {
        db.sequelize.transaction({
            autocommit: true
        }).then(function (tran) {

            var productinfo = null;
            ep.on('rollback', function (error, errcode, errmsg) {
                tran.rollback();
                if (error) {
                    logger.error(useraccount, "接口creategiftorder错误", error);
                    ep.emit('error', error);
                } else {
                    logger.error(useraccount, errmsg);
                    cb(returnData.createError(errcode, errmsg));
                }

            });
            ep.on('createorderitem', function (order) {

                var item = {
                    itemid: uuid.v4(),
                    orderid: order.orderid,
                    mcdid: productinfo.productid,
                    productname: productinfo.productname,
                    productnumber: number,
                    productinfo: productinfo.productinfo,
                    productimage: productinfo.productimage,
                    price: 0,
                    sumprice: 0,
                    privilege: 0
                };

                orderitemdb.create(item, {
                    transaction: tran
                }).then(function (result) {
                    order.items = [];
                    order.items.push(item);
                    tran.commit();
                    ep.emit('recordnewinfo', order);
                }).catch(function (error) {
                    ep.emit('rollback', error);
                });
            });

            ep.on('createorder', function (bm) {

                var addressStr = address.country +
                    ' ' + address.province +
                    ' ' + address.city +
                    ' ' + address.address +
                    ' ' + address.phone +
                    ' ' + address.contact;

                var order = {
                    orderid: uuid.v4(),
                    custid: custid,
                    price: 0,//productinfo.price * number,
                    createtime: moment().valueOf(),
                    state: 1,
                    addid: addid,
                    address: addressStr,
                    orderbm: bm,
                    paymoney: 0,
                    tickmoney: 0,
                    remak: remak,
                    evalstate: -1,
                    producttype: productinfo.producttype
                };
                orderdb.create(order, {
                    transaction: tran
                }).then(function (result) {
                    ep.emit('createorderitem', order);
                }).catch(function (error) {
                    ep.emit('rollback', error);
                });
            });

            ep.on('createbm', function () {
                orderdb.max('orderbm', {
                    where: { orderbm: { $gt: "ER" + moment().format('YYYYMMDD') + '0000000000' } },
                    transaction: tran
                }).then(function (result) {
                    var bm = "ER" + moment().format('YYYYMMDD');
                    if (result) {
                        var nustr = result.substring(10, result.length);
                        var nu = tool.getInt(nustr) + 1;
                        nustr = '' + nu;
                        bm = bm + tool.padLeft(nustr, '0', 8);
                    } else {
                        bm = bm + '00000001';
                    }
                    ep.emit('createorder', bm);
                }).catch(function (error) {
                    ep.emit('rollback', error);
                });
            });

            prodb.findOne({
                where: { productid: productid }
            }).then(function (result) {
                productinfo = result.dataValues;
                ep.emit('createbm');
            }).catch(function (error) {
                ep.emit('rollback', error);
            });

        }).catch(function (error) {
            ep.emit('error', error);
        });

    });

    if (!address.addid || address.addid == '') {
        address.addid = uuid.v4();
        addid = address.addid;
        adddb.create(address).then(function (result) {
            ep.emit('begincreate');
        }).catch(function (error) {
            ep.emit('error', error);
        })
    } else {
        ep.emit('begincreate');
    }
}

function getqouponrecord(arg, cb) {

    var ep = new eventproxy();
    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;

    ep.on('ok', function (result) {
        logger.info(useraccount, "获取礼券使用记录成功!");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口getqouponrecord错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    var sequelize = db.sequelize;
    var begtime = arg.begtime;
    var endtime = arg.endtime;
    var usetype = arg.usetype;


    var sql = "select qouponrecord.*," +
        "customer.nickname," +
        "customer.country," +
        "customer.province," +
        "customer.city," +
        "customer_alias1.nickname AS recivername," +
        "qoupon.productid," +
        "mallproduct.productname," +
        "mallproduct.productimage " +
        "FROM qouponrecord JOIN customer ON qouponrecord.`user` = customer.custid " +
        "JOIN qoupon on qoupon.qouponid=qouponrecord.qouponid " +
        "JOIN mallproduct on mallproduct.productid = qoupon.productid " +
        "left JOIN customer AS customer_alias1 ON qouponrecord.reciver = customer_alias1.custid " +
        " where 1 = 1";

    var whereCondition = '';
    if (begtime) {
        var begMoment = moment(begtime);
        if (begMoment.isValid()) {
            whereCondition += ' and qouponrecord.usetime >= ' + begMoment.format('x');
        }
    }

    if (endtime) {
        var endMoment = moment(endtime);
        if (endMoment.isValid()) {
            whereCondition += ' and qouponrecord.usetime <= ' + endMoment.format('x');
        }
    }

    if (usetype) {
        whereCondition += " and qouponrecord.usetype = '" + usetype + "'";
    }

    var page = tool.getInt(arg.page);
    var size = tool.getInt(arg.size);
    var begindex = arg.size * (page - 1);

    var orderCondition = ' order by qouponrecord.usetime desc limit ' + begindex + ',' + size;

    sql += whereCondition;
    sql += orderCondition;

    ep.on('getsum', function (datalist) {
        var sumsql = "select count(1) as con,sum(price) as price,sum(cost) as cost from qouponrecord where 1=1 ";
        var sumsql = sumsql + whereCondition;
        sequelize.query(sumsql, {
            type: 'SELECT'
        }).then(function (data) {
            var resdata = {
                count: data[0].con,
                price: data[0].price,
                cost: data[0].cost,
                items: datalist
            };
            ep.emit('ok', resdata);
        }).catch(function (error) {
            logger.error(error);
            ep.emit('error', error);
        });

    });

    sequelize.query(sql, {
        type: 'SELECT'
    }).then(function (data) {
        ep.emit('getsum', data);
    }).catch(function (error) {
        logger.error(error);
        ep.emit('error', error);
    });

}


function getqouponContent(arg, cb) {
    var proid = arg.productid;
    var mydb = db.models.qoupon_content;
    var ep = new eventproxy();
    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;

    ep.on('ok', function (result) {
        logger.info(useraccount, "获取购物车信息成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口createnetorder错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    mydb.findAll({
        where: { qouponclassid: proid }
    }).then(function (data) {
        ep.emit('ok', data);
    }).catch(function (error) {
        ep.emit('error', error);
    })

}

/**
 * 响应微信支付，对订单的异步处理逻辑，财务台账，关单请求等
 * @param orderid 商户订单号
 * @param payresult 支付结果
 * @returns
 */
function doOrderPayResult(ordervo, payresult) {

    var orderid = ordervo.orderid;
    var params = {
        currentuser: {
            useraccount: 'wxcb'//支付成功后，校验系统内部调用的参数
        }
    };

    //格式化微信返回的日期格式为YY-MM--DD HH:MM:SS
    var timeget = payresult.time_end;
    var date = timeget.substr(0, 8);
    var time = timeget.substr(8);
    var time_end = date + ' ' + time;
    time_end = moment(time_end).format("YYYY-MM-DD HH:mm:ss");
    var cashParams = {
        transaction_id: payresult.transaction_id,
        out_trade_no: payresult.out_trade_no,
        time_end: time_end,
        openid: payresult.openid,
        trade_type: payresult.trade_type,
        pay_bank: payresult.bank_type,
        fee_type: payresult.fee_type,
        total_fee: (payresult.total_fee / 100).toFixed(2)
    };

    if (payresult.return_code == 'SUCCESS' && payresult.result_code == 'SUCCESS') {

        if (ordervo.producttype == 'qoupon') {
            params.orderInfo = JSON.stringify({
                orderid: orderid,
                state: 3 /*已完成*/
            });
        } else {
            params.orderInfo = JSON.stringify({
                orderid: orderid,
                state: 1 /*待发货*/
            });
        }
        cashParams.pay_state = 'SUCCESS';

        _updateStock(orderid);
    } else {
        //支付需重新下单，并关闭当前订单
        params.orderInfo = JSON.stringify({
            orderid: orderid,
            state: 100 /*订单关闭*/
        });

        cashParams.pay_state = 'FAIL';
        cashParams.err_code = payresult.err_code;
        cashParams.err_code_des = payresult.err_code_des;

        var opt = {};
        opt.out_trade_no = payresult.out_trade_no;
        var closeorderurl = config.services.wxpayserver.url + config.services.wxpayserver.interfaces.closeOrder;
        request.post({ url: closeorderurl, form: opt }, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var d = JSON.parse(body);
                if (!d.error) {
                    logger.info('wxcb', '发起关闭订单成功，商户订单id:' + orderid);
                } else {
                    logger.error('wxcb', '发起关闭订单失败，商户订单id:' + orderid + '错误原因：' + d.error.message);
                }
            } else {
                logger.error('wxcb', '发起关闭订单失败，商户订单id:' + orderid + '错误原因：' + err.message);
            }
        });
    }

    //对于处理微信支付的回调结果，业务系统接收并处理时，其后续更新订单及财务日志时的写库操作，如果失败，无须回滚事务，只有手动更新订单或校对财务明细
    mallWeb.updateOrder(params, function (err, result) {
        if (err != null) {
            logger.error('sys', '订单更新失败:' + err.message);
            return;
        }

        if (ordervo.producttype == 'blh' && cashParams.pay_state == 'SUCCESS') {
            //如果是百礼汇订单，调用百礼汇订单生成接口,如果失败，无须回滚事务，只有手动更新百礼汇订单
            mallBase.genBlhOrder(ordervo, function (err, data) {

            });
        }

        //如果是礼券订单，则生成礼券实例
        if (ordervo.producttype == 'qoupon' && cashParams.pay_state == 'SUCCESS') {
            var orderdetaildb = db.models.mallorderdetail;
            orderdetaildb.findOne({ where: { orderid: orderid } }).then(function (res) {
                var detailvo = res.get({ chain: true });
                createqoupon(orderid, detailvo.mcdid, function (err, result) {
                    if (err != null) {
                        logger.error('sys', '支付成功，但礼券创建失败，原因是:' + err.message);
                    }
                })
            })

        }
    });

    //写财务日志
    finance.updateIncomeRecord(cashParams, function (err, result) { });

}

/**
 * 查询相应商户订单的支付信息
 * @param orderbm 商户订单号
 * @returns
 */
function queryPayOrder(arg, cb) {

    var orderbm = arg.orderbm;
    var opt = {
        out_trade_no: orderbm
    };

    var queryorderurl = config.services.wxpayserver.url + config.services.wxpayserver.interfaces.queryOrder;
    request.post({ url: queryorderurl, form: opt }, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            var d = JSON.parse(body);
            cb(null, d)
        } else {
            cb(returnData.createError('unknow', err.message), null);
        }
    });
}

/**
 * 关单
 * @param orderbm 商户订单号
 * @returns
 */
function closePayOrder(arg, cb) {

    var orderbm = arg.orderbm;
    var opt = {
        out_trade_no: orderbm
    };

    var closeorderurl = config.services.wxpayserver.url + config.services.wxpayserver.interfaces.closeOrder;
    request.post({ url: closeorderurl, form: opt }, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            var d = JSON.parse(body);
            cb(null, d)
        } else {
            cb(returnData.createError('unknow', err.message), null);
        }
    });
}

/**
 * 创建普通实体商品的订单
 * @param
 * @returns
 */
function createOrder(arg, cb) {

    var shopinglistinput = arg.shopinglist;
    var discountList = JSON.parse(arg.discountList);

    var addid = arg.addid;
    var remak = arg.remak || ''; //订单备注
    var point = arg.point || 0;
    point = parseInt(point);
    var password = arg.password || '';

    if (!arg.currentuser.custid) { //非mobile请求
        cb(returnData.createError(returnData.errorType.refuse), null)
        return;
    }

    var custid = arg.currentuser.custid;
    var useraccount = arg.currentuser.nickname;
    var orderinfo = {};
    var shopdb = db.models.shopingcart;
    var prodb = db.models.mallproduct;
    var orderdb = db.models.mallorder;
    var custdb = db.models.custextend;
    var orderitemdb = db.models.mallorderdetail;
    var pointdetaildb = db.models.propointdetail;

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "创建普通商品订单成功");
        cb(null, returnData.createData(result));
    });

    ep.on("error", function (errorCode, msg) {
        logger.error(useraccount, "接口createOrder错误"+msg);
        cb(returnData.createError(errorCode, msg));
    });

    try {
        var shoping = JSON.parse(shopinglistinput);
    } catch (error) {
        logger.error(useraccount, "购物车信息参数错误");
        cb(returnData.createError(returnData.errorType.paraerror, '购物车信息参数错误'), null)
        return;
    }

    if (0 == shoping.length) {
        logger.error(useraccount, "购物车信息为空");
        cb(returnData.createError(returnData.errorType.refuse, '购物车信息为空'), null);
        return;
    }

    ep.on('recordnewinfo', function (res) {
        ep.emit('ok',res);
    });

    ep.on('deleteshop', function () {
        shopdb.destroy({
            where: { id: { $in: shoping } },
            // transaction: tran
        }).then(function (result) {
            ep.emit("recordnewinfo", orderinfo)
        }).catch(function (error) {
            ep.emit('ok', orderinfo);
        });
    });

    var len = shoping.length; //购物车数量
    var sumMoney = 0; //需要支付金额
    var sumprivi = 0; //商品优惠金额
    var postage = 0; //邮费
    var pdtnum = 0; //初始化购物车里所有的商品总数

    var res = {
        data: [],
        success: true,
        errorlist: []
    };
    shopdb.findAll({
        where: { id: { $in: shoping } },
        include: {
            model: db.models.mallproduct,
            required: true
        }
    }).then(function (result) {
        if (result && result.length > 0) {

            var productList = [];
            result.forEach(function (eshopitem) {

                var shopitem = eshopitem.get({ chain: true });
                var mallproductvo = shopitem.mallproduct.get({ chain: true });
                var ele = {
                    product:mallproductvo,
                    number:shopitem.number
                }

                productList.push(ele);
            })

            mallBase.createOrder('product', 'order', productList,
            custid, addid, password, point,remak,discountList,function(error,res){
                if(error == null){
                    orderinfo = res;
                    ep.emit('deleteshop');
                }else{
                    ep.emit('error', error.code, error.msg);
                }
            });
        } else {
            var msg = '没有查到购物车对应的商品';
            logger.error(useraccount, msg);
            ep.emit('error', returnData.errorType.notexist, msg);
        }
    }).catch(function (error) {
        ep.emit('error', returnData.errorType.dataBaseError.unknow, error.message);
    });
}

/**
 * 创建礼券订单，即购买礼券
 * @param
 * @returns
 */
function createQouponOrder(arg, cb) {
    var qouponid = arg.productid; //qouponid
    var pdtnum = parseInt(arg.number) || 1; //礼券购买个数
    var point = arg.point || 0;
    point = parseInt(point);
    var password = arg.password || '';

    if (!arg.currentuser.custid) { //非mobile请求
        cb(returnData.createError(returnData.errorType.refuse), null)
        return;
    }

    var custid = arg.currentuser.custid;
    var useraccount = arg.currentuser.nickname;
    var orderinfo = {};
    var shopdb = db.models.shopingcart;
    var orderdb = db.models.mallorder;
    var custdb = db.models.custextend;
    var qouponcontentdb = db.models.qoupon_content;
    var orderitemdb = db.models.mallorderdetail;
    var pointdetaildb = db.models.propointdetail;
    var productdb = db.models.mallproduct;

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        cb(null, returnData.createData(result));
    });

    ep.on("error", function (errorCode, msg) {
        logger.error(useraccount, "接口createQouponOrder错误"+ msg);
        cb(returnData.createError(errorCode, msg));
    });

    ep.on('recordnewinfo', function (res) {
        var order = res;
        ep.emit('ok', res);
    });

    var len = 0; //类似购物车数量
    var sumMoney = 0; //需要支付金额
    var sumprivi = 0; //优惠金额
    var res = {
        data: [],
        success: true,
        errorlist: []
    };
    //拆分礼券
    productdb.findOne({
        where: { productid: qouponid }
    }).then(function (result) {
        if (result) {
            var productList = [];
                var shopitem = result.get({ chain: true });
                var mallproductvo = shopitem;
                var ele = {
                    product:mallproductvo,
                    number:1
                }

                productList.push(ele);

            mallBase.createOrder('qoupon', 'order', productList,
            custid, null, password, point,'购买礼券订单',[],function(error,res){
                if(error == null){
                    orderinfo = res;
                    ep.emit('recordnewinfo', orderinfo);
                }else{
                    ep.emit('error', error.code, error.msg);
                }
            });
        } else {
            var msg = '没有查到礼券对应的商品';
            logger.error(useraccount, msg);
            ep.emit('error', returnData.errorType.notexist, msg);
        }
    }).catch(function (error) {
        ep.emit('error', returnData.errorType.dataBaseError.unknow, error.message);
    });
}

/**
 * 针对订单的结算
 * @param orderid
 * @returns
 */
function checkoutex(arg, cb) {

    if (!arg.currentuser.custid) { //非mobile请求
        cb(returnData.createError(returnData.errorType.refuse), null)
        return;
    }

    var custid = arg.currentuser.custid;
    var useraccount = arg.currentuser.nickname;

    var custinfo = {},
        orderinfo = {};

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "订单的结算成功");
        cb(null, returnData.createData(result));
    });

    ep.on("error", function (errorCode, msg) {
        logger.error(useraccount, "订单结算错误"+msg);
        cb(returnData.createError(errorCode, msg));
    });

    var orderdb = db.models.mallorder;
    var custdb = db.models.custextend;

    ep.on('recordnewinfo', function (res) {
        var order = res;
        var newdb = db.models.custnewinfo;
        newdb.findOne({
            where: { custid: order.custid }
        }).then(function (result) {
            if (result) {
                var info = {
                    neworderreceivin: result.neworderreceivin + 1
                };
                newdb.update(info, {
                    where: { custid: order.custid }
                }).then(function () { })
            } else {
                var info = {
                    custid: order.custid,
                    neworderreceivin: 1,
                    newordereva: 0,
                    newprize: 0,
                    newprizereceivin: 0
                };
                newdb.create(info).then(function () { })
            }
            ep.emit('ok', res);
        }).catch(function (error) {
            ep.emit('ok', res);
        });
    });

    ep.on('callBlhManager', function () {

        mallBase.genBlhOrder(orderinfo,function(err,data){
            if(err == null){
                //ep.emit('ok', orderinfo);
            }else{
                //ep.emit('error', returnData.errorType.unknow, err.error.message);
                logger.error(useraccount, "订单结算错误:"+err.error.message);
            }
        });
    });

    //完全积分结算，直接扣除相应积分
    ep.on('pointcheck', function () {

        var ordervo = {
            orderid: orderinfo.orderid,
            paymoney: 0,
            state: 1
        };
        if (orderinfo.producttype == "qoupon") {
            createqoupon(orderinfo.orderid, null, function (error, data) {
                if (error) {
                    logger.error(useraccount, '积分结算成功，但生成礼券失败，原因是：' + error.message);
                    ep.emit('error', returnData.errorType.unknow, error.message);
                } else {
                    ep.emit('ok', orderinfo);
                }
            });
        } else {
            orderdb.update(ordervo, {
                where: { orderid: orderinfo.orderid }
            }).then(function (res) {

                if (orderinfo.producttype == "blh") {
                    ep.emit('callBlhManager');
                }

                ep.emit('ok', orderinfo);
                
            }).catch(function (error) {
                ep.emit('error', returnData.errorType.unknow, error.message);
            })
        }

        _updateStock(orderinfo.orderid);
    });

    //现金支付，需向微信申请预支付交易单，还需等待微信的支付结果回调
    ep.on('cashcheck', function (money) {
        var getpayparamsurl = config.services.wxpayserver.url + config.services.wxpayserver.interfaces.getParams;
        var mchorderno = orderinfo.orderbm;
        var userip = '127.0.0.1';
        var opt = {
            "body": orderinfo.orderbm,
            "out_trade_no": mchorderno,
            "total_fee": parseInt(money * 100), ///*换算成为分 */
            "spbill_create_ip": userip,
            "notify_url": config.services.wxpayserver.notifyurl,
            "openid": arg.currentuser.openid //"ovNEP0x4zSd4zRN8XJzsliblBAj8"
        }

        var ordervo = {
            orderid: orderinfo.orderid,
            paymoney: money
        };

        orderdb.update(ordervo, {
            where: { orderid: orderinfo.orderid }
        }).then(function (res) {
            //更新订单中的paymoney和tickmoney
            request.post({ url: getpayparamsurl, form: opt }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var d = JSON.parse(body);
                    cb(null, d);
                } else {
                    cb(returnData.createError('unknow', error.message));
                }
            });
        }).catch(function (error) {
            ep.emit('error', returnData.errorType.unknow, error.message);
        });
    });

    /*验证结算方式 */
    ep.on('getcheckmethod', function (order) {

        //ep.emit('pointcheck');
        if (order.paymoney > 0) {
            ep.emit('cashcheck', order.paymoney);
        } else {
            ep.emit('pointcheck');
        }
    })

    ep.on('findOrder', function () {
        orderdb.findOne({ where: { orderid: arg.orderid } }).then(function (res) {
            if (res) {
                var ordervo = res.get({ chain: true });
                orderinfo = ordervo;
                ep.emit('getcheckmethod', ordervo);
            } else {
                var msg = '没有查到购物车对应的商品';
                logger.error(useraccount, msg);
                ep.emit('error', returnData.errorType.notexist, msg);

            }
        }).catch(function (error) {
            ep.emit('error', returnData.errorType.dataBaseError.unknow, error.message);
        });
    })

    ep.emit('findOrder');

}

/*生成礼券的一个实例 */
function createqoupon(orderid, productid, cb) {

    var useraccount = 'sys';

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "生成礼券!");
        cb(null, returnData.createData(result));
    });

    ep.on("error", function (errorCode, msg) {
        logger.error(useraccount, "接口createqoupon错误"+msg);
        cb(returnData.createError(errorCode, msg));
    });

    var orderdb = db.models.mallorder;
    var orderitemdb = db.models.mallorderdetail;
    var productdb = db.models.mallproduct;
    var qoupondb = db.models.qoupon;
    var recdb = db.models.qouponrecord;

    ep.on('create', function (orderinfo, qouponinfo) {
        db.sequelize.transaction({
            autocommit: true
        }).then(function (t) {

            ep.on("rollback", function (errorCode, msg) {
                t.rollback();
                logger.error(useraccount, "接口createqoupon错误", msg);
                cb(returnData.createError(errorCode, msg));
            });

            var qpon = {
                qouponid: uuid.v4(),
                productid: qouponinfo.productid,
                createdate: moment().valueOf(),
                owner: orderinfo.custid,
                state: 'normal'
            };

            ep.on('changeorder', function () {

                orderdb.update({ state: '3' }, {
                    where: { orderid: orderinfo.orderid },
                    transaction: t
                }).then(function () {
                    t.commit();
                    ep.emit('ok', qpon);
                }).catch(function (error) {
                    logger.error(useraccount, error.message);
                    ep.emit('rollback', returnData.errorType.dataBaseError.unknow, '生成礼券记录错误!');
                });
            });

            ep.on('createrec', function () {
                var rec = {
                    recid: uuid.v4(),
                    qouponid: qpon.qouponid,
                    user: qpon.owner,
                    usetime: qpon.createdate,
                    usetype: 'create',
                    reciver: qpon.owner,
                    info: '订单:' + orderinfo.orderbm,
                    price: qouponinfo.price,
                    cost: qouponinfo.cost
                };
                recdb.create(rec, {
                    transaction: t
                }).then(function () {
                    ep.emit('changeorder');
                }).catch(function (error) {
                    logger.error(useraccount, error.message);
                    ep.emit('rollback', returnData.errorType.dataBaseError.unknow, '生成礼券记录错误!');
                });
            });

            qoupondb.create(qpon, {
                transaction: t
            }).then(function () {
                ep.emit('createrec');
            }).catch(function (error) {
                logger.error(useraccount, error.message);
                ep.emit('rollback', returnData.errorType.dataBaseError.unknow, '生成礼券错误!');
            });

        }).catch(function (error) {
            logger.error(useraccount, error.message);
            ep.emit('error', returnData.errorType.dataBaseError.unknow, '查询礼券信息错误!');
        });
    });

    ep.on('findproduct', function (orderinfo) {
        productdb.findOne({ where: { productid: productid } }).then(function (result) {
            if (result) {
                ep.emit('create', orderinfo, result.dataValues);
            } else {
                ep.emit('error', returnData.errorType.dataBaseError.notfind, '找不到指定的礼券信息!');
            }
        }).catch(function (error) {
            logger.error(useraccount, error.message);
            ep.emit('error', returnData.errorType.dataBaseError.unknow, '查询礼券信息错误!');
        });
    });

    ep.on('getproductid', function (orderinfo) {
        if (productid) {
            ep.emit('findproduct', orderinfo);
        } else {
            orderitemdb.findOne({
                where: { orderid: orderinfo.orderid }
            }).then(function (result) {
                productid = result.dataValues.mcdid;
                ep.emit('findproduct', orderinfo);
            }).catch(function (error) {
                logger.error(useraccount, error.message);
                ep.emit('error', returnData.errorType.dataBaseError.unknow, '查询礼券信息错误!');
            })
        }
    });

    orderdb.findOne({
        where: { orderid: orderid }
    }).then(function (result) {
        //现金支付成功后生成礼券实例
        if (result.dataValues.state == '3') {
            ep.emit('getproductid', result.dataValues);
        }//积分支付生成礼券实例 
        else if (result.dataValues.producttype == 'qoupon' && result.dataValues.state == '0') {
            ep.emit('getproductid', result.dataValues);
        } else {
            ep.emit('error', returnData.errorType.dataBaseError.notfind, '该订单不能生成礼券!');
        }

    }).catch(function (error) {
        logger.error(useraccount, error.message);
        ep.emit('error', returnData.errorType.dataBaseError.unknow, '查询订单信息错误!');
    });
}

function sendqoupon(arg, cb) {
    var orderid = arg.orderid;
    //var productid = arg.productid;
    var orderdb = db.models.mallorderdetail;
    orderdb.findOne({
        where: { orderid: orderid }
    }).then(function (result) {
        createqoupon(orderid, result.dataValues.mcdid, cb);
    }).catch(function (error) {
        logger.error(useraccount, "接口sendqoupon错误", error.message);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, error.message));
    })


}

function getgiveqoupon(arg, cb) {
    var custid = arg.currentuser.custid;
    var useraccount = arg.currentuser.nickname;

    var qouponid = arg.qouponid;

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "生成代金券转赠码成功!");
        cb(null, returnData.createData(result));
    });

    ep.on("error", function (errorCode, msg) {
        logger.error(useraccount, "接口getgiveqoupon错误"+msg);
        cb(returnData.createError(errorCode, msg));
    });


    var qoupondb = db.models.qoupon;
    qoupondb.findOne({
        where: { qouponid: qouponid }
    }).then(function (result) {
        result = result.get({ chain: true });
        if (custid === result.owner) {
            //加密方法。
            //礼券ID+礼券创建时间的字符串进行Des加密
            var code = result.qouponid + result.owner + result.createdate;
            code = tool.des.encrypt(code, 'ewdrghsb', "erathinktest");
            code = config.host + "mall/mobile/html/reciveqoupon.html?code=" + code; //+ ":" + config.port.qrplatform
            ep.emit('ok', code);
        } else {
            ep.emit('error', returnData.errorType.dataBaseError.unknow, '您无权转让此优惠券!');
        }
    }).catch(function (error) {
        logger.error(useraccount, error);
        ep.emit('error', returnData.errorType.dataBaseError.unknow, '查询优惠券信息错误!');
    });

}

function recivegiveqoupon(arg, cb) {

    var custid = !!arg.currentuser.custid ? arg.currentuser.custid : arg.currentuser.userid;

    var useraccount = arg.currentuser.nickname;
    var code = arg.code;

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "发放代金券成功!");
        cb(null, returnData.createData(result));
    });

    ep.on("error", function (errorCode, msg) {
        logger.error(useraccount, "接口createOrdert错误"+msg);
        cb(returnData.createError(errorCode, msg));
    });

    code = tool.des.decrypt(code, 4, "erathinktest");
    var qouponid = code.substring(0, 36);
    var owner = code.substring(36, 72);
    var createtime = tool.getInt(code.substring(72));

    if (owner === custid)
        ep.emit('error', returnData.errorType.dataBaseError.notfind, '不能将礼券转让给自己!');


    var qoupondb = db.models.qoupon;
    var recdb = db.models.qouponrecord;
    ep.on('give', function (qoupon) {

        db.sequelize.transaction({
            autocommit: true
        }).then(function (tran) {

            ep.on('rollback', function (error, errmsg) {
                tran.rollback();
                ep.emit('error', error, errmsg);
            });

            ep.on('record', function () {
                var rec = {
                    recid: uuid.v4(),
                    qouponid: qoupon.qouponid,
                    user: qoupon.owner,
                    usetime: moment().valueOf(),
                    usetype: 'give',
                    reciver: custid,
                    info: '礼券转让成功。'
                };
                recdb.create(rec, {
                    transaction: tran
                }).then(function () {
                    tran.commit();
                    ep.emit('ok', rec);
                }).catch(function (err) {
                    logger.error(useraccount, err);
                    ep.emit('rollback', returnData.errorType.dataBaseError.unknow, '生成礼券记录错误!');
                });
            });

            qoupondb.update({ owner: custid }, {
                where: { qouponid: qoupon.qouponid, state: 'normal' },
                transaction: tran
            }).then(function (result) {

                ep.emit('record');

            }).catch(function (error) {
                ep.emit('rollback', returnData.errorType.dataBaseError.unknow, '礼券所有人修改失败!');
            })

        })
    });

    ep.on('checkgive', function (qouponinfo) {
        recdb.findOne({
            where: { qouponid: qouponid, usetype: 'give', user: owner }
        }).then(function (result) {
            if (result) {
                ep.emit('error', returnData.errorType.dataBaseError.notfind, '转让错误，当前用户不能多次转让同一礼券');
            } else {
                ep.emit('give', qouponinfo);
            }
        }).catch(function (error) {
            logger.error(useraccount, error);
            ep.emit('error', returnData.errorType.dataBaseError.unknow, '查询礼券信息错误!');
        });
    });

    qoupondb.findOne({
        where: { qouponid: qouponid }
    }).then(function (result) {
        if (result) {
            var qouponinfo = result.get({ chain: true });
            if (qouponinfo.state === 'used') {
                ep.emit('error', returnData.errorType.dataBaseError.notfind, '礼券已使用,转赠已失效!');
            } else if (qouponinfo.owner != owner) {
                ep.emit('error', returnData.errorType.dataBaseError.notfind, '非法的转赠二维码!');
            } else if (qouponinfo.createdate == createtime) {
                ep.emit('checkgive', qouponinfo);
            } else {
                ep.emit('error', returnData.errorType.dataBaseError.notfind, '非法的转赠二维码或已失效!');
            }
        } else {
            ep.emit('error', returnData.errorType.dataBaseError.notfind, '找不到待转让的礼券信息!');
        }
    }).catch(function (error) {
        logger.error(useraccount, err);
        ep.emit('error', returnData.errorType.dataBaseError.unknow, '查询礼券信息错误!');
    });

}

/*使用礼券，生成订单 */
function createOrderByQoupon(arg, cb) {

    var addid = arg.addid;
    var remak = arg.remak;
    var qouponid = arg.qouponid;

    if (!arg.currentuser.custid) { //非mobile请求
        cb(returnData.createError(returnData.errorType.refuse), null);
        return;
    }

    var custid = arg.currentuser.custid;
    var useraccount = arg.currentuser.nickname;
    var orderinfo = {};

    var prodb = db.models.mallproduct;
    var orderdb = db.models.mallorder;
    var orderitemdb = db.models.mallorderdetail;
    var qoupondb = db.models.qoupon;
    var qoucontentdb = db.models.qoupon_content;
    var qourecdb = db.models.qouponrecord;

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "接口createOrderByQoupon成功");
        cb(null, returnData.createData(result));
    });

    ep.on("error", function (errorCode, msg) {
        logger.error(useraccount, "接口createOrderByQoupon错误"+msg);
        cb(returnData.createError(errorCode, msg));
    });

    ep.on('createordertrans', function (qoupon, product, content) {
        //开启创建订单事务
        db.sequelize.transaction({
            autocommit: true
        }).then(function (tran) {
            ep.on('rollback', function (error, errmsg) {
                tran.rollback();
                ep.emit('error', error, errmsg);
            });
            ep.on('saverec', function (qoupon, product, content) {
                qoupon = qoupon.get({ chain: true });
                var rec = {
                    recid: uuid.v4(),
                    qouponid: qoupon.qouponid,
                    user: qoupon.owner,
                    usetime: moment().valueOf(),
                    usetype: 'use',
                    info: '礼券使用',
                    price: product.price,
                    cost: product.cost
                };
                qourecdb.create(rec, {
                    transaction: tran
                }).then(function () {
                    tran.commit();
                    ep.emit('ok', rec);
                }).catch(function (err) {
                    logger.error(useraccount, err);
                    ep.emit('rollback', returnData.errorType.dataBaseError.unknow, '生成礼券记录错误!');
                });
            });

            /*修改礼券状态*/
            ep.on('updateqoupon', function (qoupon, product, order) {
                qoupondb.update({
                    state: 'used',
                    useDate: new Date()
                }, {
                        transaction: tran,
                        where: { qouponid: qoupon.qouponid }
                    }).then(function (result) {
                        ep.emit('saverec', qoupon, product, content)
                    }).catch(function (err) {
                        logger.error(useraccount, '修改礼券状态失败!' + err.message);
                        ep.emit('rollback', returnData.errorType.dataBaseError.unknow, '修改礼券状态失败');
                    });
            });

            /*创建订单详情*/
            ep.on('createorderitem', function (order) {
                var items = [];
                content.forEach(function (shopitem) {

                    var item = {
                        itemid: uuid.v4(),
                        orderid: order.orderid,
                        mcdid: shopitem.dataValues.productid,
                        productname: shopitem.dataValues.mallproduct.productname,
                        productnumber: shopitem.dataValues.number,
                        productinfo: shopitem.dataValues.mallproduct.productinfo,
                        productimage: shopitem.dataValues.mallproduct.productimage,
                        price: 0,//shopitem.dataValues.mallproduct.price,
                        sumprice: 0,//shopitem.dataValues.mallproduct.price * shopitem.dataValues.number,
                        privilege: 0,//shopitem.dataValues.mallproduct.privilege * shopitem.dataValues.number,
                        cost: shopitem.dataValues.mallproduct.cost
                    };
                    items.push(item);
                });

                orderitemdb.bulkCreate(items, {
                    transaction: tran
                }).then(function (result) {
                    order.items = items;
                    ep.emit('updateqoupon', qoupon, product, order);
                }).catch(function (err) {
                    logger.error(useraccount, '写入订单明细失败!' + err.message);
                    ep.emit('rollback', returnData.errorType.dataBaseError.unknow, '写入订单明细失败');
                });
            });

            /*创建订单抬头概要 */
            ep.on('createorder', function (bm) {
                var addressdb = db.models.custaddress;
                addressdb.findOne({ where: { addid: addid }, transaction: tran }).then(function (data) {
                    if (data) {
                        var addressInfo = data.get({ chain: true });
                        var addressStr = addressInfo.country +
                            ' ' + addressInfo.province +
                            ' ' + addressInfo.city +
                            ' ' + addressInfo.address +
                            ' ' + addressInfo.phone +
                            ' ' + addressInfo.contact;

                        var order = {
                            orderid: uuid.v4(),
                            custid: custid,
                            price: 0,
                            createtime: moment().valueOf(),
                            state: 1,
                            addid: addid,
                            address: addressStr,
                            orderbm: bm,
                            paymoney: 0,
                            tickmoney: 0,
                            remak: remak,
                            evalstate: -1,
                            producttype: 'qoupon', //目前购物车的结算只针对type为product类型
                            express: '',
                            trackingno: ''
                        };
                        orderdb.create(order, {
                            transaction: tran
                        }).then(function (result) {
                            orderinfo = order;
                            ep.emit('createorderitem', order);
                        }).catch(function (error) {
                            ep.emit('rollback', returnData.errorType.dataBaseError.unknow, error.message);
                        });
                    } else {
                        ep.emit('rollback', returnData.errorType.dataBaseError.unknow, '没有找到地址信息');
                    }
                }).catch(function (error) {
                    ep.emit('rollback', returnData.errorType.dataBaseError.unknow, error.message);
                })
            });

            ep.on('createOrderBm', function () {
                orderdb.max('orderbm', {
                    where: { orderbm: { $gt: "ER" + moment().format('YYYYMMDD') + '0000000000' } },
                    transaction: tran
                }).then(function (result) {
                    //生成系统唯一订单号
                    var bm = "ER" + moment().format('YYYYMMDD');
                    if (result) {
                        var nustr = result.substring(10, result.length);
                        var nu = tool.getInt(nustr) + 1;
                        nustr = '' + nu;
                        bm = bm + tool.padLeft(nustr, '0', 8);
                    } else {
                        bm = bm + '00000001';
                    }
                    ep.emit('createorder', bm);
                }).catch(function (error) {
                    ep.emit('rollback', returnData.errorType.dataBaseError.unknow, error.message);
                });
            });

            ep.emit('createOrderBm');

        });
    });

    ep.on('getqouponcontent', function (qoupon, product) {
        qoucontentdb.findAll({
            where: { qouponclassid: qoupon.productid },
            include: {
                model: db.models.mallproduct,
                required: true // 加个required: true,即可
            }
        }).then(function (result) {
            if (result && result.length > 0) {
                ep.emit('createordertrans', qoupon, product, result);
            } else {
                logger.error(useraccount, '查询礼券内容失败!' + err.message);
                ep.emit('error', returnData.errorType.dataBaseError.unknow, '查询礼券内容失败!');
            }
        }).catch(function (err) {
            logger.error(useraccount, '查询礼券内容失败!' + err.message);
            ep.emit('error', returnData.errorType.dataBaseError.unknow, '查询礼券内容失败!');
        })
    });

    ep.on('checkproduct', function (qoupon) {
        prodb.findOne({
            where: { productid: qoupon.productid }
        }).then(function (result) {
            var now = new Date().getTime();
            if (new Date(result.validity_beg).getTime() > now ||
                (new Date(result.validity_end).getTime() + 24 * 60 * 60 * 1000 - 1) < now) {
                logger.error(useraccount, '礼券兑换未开始或已过期');
                ep.emit('error', returnData.errorType.dataBaseError.unknow, '礼券兑换未开始或已过期');
            } else {
                ep.emit('getqouponcontent', qoupon, result);
            }
        }).catch(function (err) {
            logger.error(useraccount, '查询礼券对应商品信息失败!' + err.message);
            ep.emit('error', returnData.errorType.dataBaseError.unknow, '查询礼券对应商品信息失败!');
        })
    });

    qoupondb.findOne({
        where: { qouponid: qouponid }
    }).then(function (result) {
        if (result) {
            if (result.dataValues.state == 'used') {
                logger.error(useraccount, '礼品券已使用!');
                ep.emit('error', returnData.errorType.dataBaseError.unknow, '礼品券已使用!');
            } else if (result.owner != custid) {
                logger.error(useraccount, '您无权使用该礼品券!');
                ep.emit('error', returnData.errorType.dataBaseError.unknow, '礼品券已使用!');
            } else {
                ep.emit('checkproduct', result);
            }
        } else {
            logger.error(useraccount, '找不到礼品券信息!');
            ep.emit('error', returnData.errorType.dataBaseError.unknow, '找不到礼品券信息!');
        }

    }).catch(function (err) {
        logger.error(useraccount, err);
        ep.emit('error', returnData.errorType.dataBaseError.unknow, err.message);
    })
}

/**
 * 预定功能（添加至收藏夹）
 * @param productid 商品id
 * @return {}
 */
function addFavoritesById(arg, cb) {

    var pdtid = arg.productid;
    if (!arg.currentuser.custid) {
        cb(returnData.createError(returnData.errorType.refuse), null)
        return;
    }
    var custid = arg.currentuser.custid;
    var pdtdb = db.models.mallproduct;
    var fvLimitCounts = 10,
        bExists = false;
    var favoritesdb = db.models.favorites;
    favoritesdb.findAll({
        where: {
            custid: custid
        }
    }).then(function (data) {
        if (fvLimitCounts == data.length) {
            logger.error(arg.currentuser.nickname, '收藏夹个数超过限制10个');
            cb(returnData.createError(returnData.errorType.refuse, '收藏夹个数超过限制10个'), null);
        } else {

            for (var x = 0; x < data.length; ++x) {
                var ele = data[x].get({ chain: true });
                if (ele.productid == pdtid) {
                    bExists = true;
                }
            }

            if (bExists) {
                cb(returnData.createError(returnData.errorType.exists, '不能收藏重复商品'), null);
            } else {
                pdtdb.findOne({
                    where: {
                        productid: pdtid
                    }
                }).then(function (res) {
                    if (res) {
                        favoritesdb.create({
                            favoritesid: uuid.v4(),
                            productid: pdtid,
                            custid: custid,
                            createdate: moment().format('X')
                        }).then(function (res) {
                            cb(null, returnData.createData(res));
                        }).catch(function (err) {
                            cb(returnData.createError('databaseError', err.message));
                        })
                    } else {
                        cb(returnData.createError('databaseError.notfind', '没有找到对应的商品，收藏商品异常'));
                    }
                }).catch(function (err) {
                    cb(returnData.createError('databaseError', err.message));
                })
            }
        }
    }).catch(function (err) {
        cb(returnData.createError('databaseError', err.message), null);
    });
}

/**
 * （从收藏夹中移除）
 * @param favoritesid 收藏夹id
 * @return boolean
 */
function delFavoritesById(arg, cb) {
    if (!arg.currentuser.custid) {
        cb(returnData.createError(returnData.errorType.refuse), null)
        return;
    }
    var favoritesid = arg.favoritesid;
    var favoritesdb = db.models.favorites;
    favoritesdb.destroy({
        where: {
            favoritesid: favoritesid
        }
    }).then(function (res) {
        cb(null, returnData.createData(true));
    }).catch(function (err) {
        cb(returnData.createError('databaseError', err.message));
    })
}

/**
 * 获取个人收藏夹商品
 * 
 * @return {}
 */
function getSelfFavorites(arg, cb) {

    if (!arg.currentuser.custid) {
        cb(returnData.createError(returnData.errorType.refuse), null)
        return;
    }
    var custid = arg.currentuser.custid;

    var favoritesdb = db.models.favorites;
    favoritesdb.findAll({
        where: {
            custid: custid
        },
        include: {
            model: db.models.mallproduct,
            required: true
        }
    }).then(function (data) {
        cb(null, returnData.createData(data));
    }).catch(function (err) {
        logger.error(arg.currentuser.nickname, err.message);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
    });
}

/**
 * 更新库存
 * 
 * @param orderid 
 * 
 * @return void
 */
function _updateStock(orderid) {

    var prodb = db.models.mallproduct,
        orderdetaildb = db.models.mallorderdetail;

    var len = 0,
        pdtmap = {};
    var ep = new eventproxy();

    orderdetaildb.findAll({
        where: { orderid: orderid }
    }).then(function (resArray) {
        len = resArray.length;

        ep.after('finished', len, function () {
            for (var x in pdtmap) {
                prodb.update({
                    amount: pdtmap[x].pnu - pdtmap[x].shopnu
                }, {
                        where: { productid: x }
                    }).then(function (res) {
                        logger.info('sys', '支付后，更新库存成功');
                    }).catch(function (error) { logger.error('sys', '更新库存失败:' + error.message); });
            }
        })

        ep.on('update', function (pdtArray) {
            pdtArray.forEach(function (items) {
                var pdtvo = items.get({ chain: true });
                prodb.findOne({
                    where: {
                        productid: pdtvo.mcdid
                    }
                }).then(function (resvo) {

                    var pnu = resvo.amount;

                    pdtmap[pdtvo.mcdid] = {
                        pnu: resvo.amount,
                        shopnu: pdtvo.productnumber
                    };

                    ep.emit('finished');

                }).catch(function (error) { logger.error('sys', '更新库存失败:' + error.message); })
            });
        })

        ep.emit('update', resArray);
    }).catch(function (error) {
        logger.error('sys', '更新库存失败:' + error.message);
    });
}

/**
 * 创建百礼汇订单
 * @param
 * @returns
 */
function createBlhOrder(arg, cb) {
    var productid = arg.productid; 
    var discountList = JSON.parse(arg.discountList);
    var pdtnum = parseInt(arg.number) || 1; //购买个数
    var point = arg.point || 0;
    point = parseInt(point);
    var password = arg.password || '';

    if (!arg.currentuser.custid) { //非mobile请求
        cb(returnData.createError(returnData.errorType.refuse), null)
        return;
    }

    var custid = arg.currentuser.custid;
    var useraccount = arg.currentuser.nickname;
    var orderinfo = {};    
    var orderdb = db.models.mallorder;    
    var orderitemdb = db.models.mallorderdetail;    
    var productdb = db.models.mallproduct;

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        cb(null, returnData.createData(result));
    });

    ep.on("error", function (errorCode, msg) {
        logger.error(useraccount, "接口createBlhOrder错误"+msg);
        cb(returnData.createError(errorCode, msg));
    });

    ep.on('recordnewinfo', function (res) {
        ep.emit('ok', res);
    });

    productdb.findOne({
        where: { productid: productid }
    }).then(function (result) {
        if (result) {
                var productList = [];
                var mallproductvo = result.get({ chain: true });
                var ele = {
                    product:mallproductvo,
                    number:pdtnum
                }

                productList.push(ele);

            mallBase.createOrder('blh', 'order', productList,
            custid, arg.addid, password, point,'百礼汇商品备注',discountList,function(error,res){
                if(error == null){
                    orderinfo = res;
                    ep.emit('recordnewinfo', orderinfo);
                }else{
                    ep.emit('error', error.code, error.msg);
                }
            });
        } else {
            var msg = '没有查到礼券对应的商品';
            logger.error(useraccount, msg);
            ep.emit('error', returnData.errorType.notexist, msg);
        }
    }).catch(function (error) {
        ep.emit('error', returnData.errorType.dataBaseError.unknow, error.message);
    });
}

/**
 * 获取个人的折扣券列表
 * 
 * @return {}
 */
function getDiscountCoupon(arg, cb) {

    if (!arg.currentuser.custid) {
        cb(returnData.createError(returnData.errorType.refuse), null)
        return;
    }
    var custid = arg.currentuser.custid;

    try {
        var queryObj = JSON.parse(arg.query);
        queryObj.owner = custid;
    } catch (error) {
        logger.error(arg.currentuser.nickname, JSON.stringify(error));
        cb(returnData.createError(returnData.errorType.paraerror, '个人的折扣券列表参数错误'), null)
        return;
    }

    var discountcoupondb = db.models.discountcoupon;
    discountcoupondb.findAll({
        where: queryObj
    }).then(function (data) {
        cb(null, returnData.createData(data));
    }).catch(function (err) {
        logger.error(arg.currentuser.nickname, err.message);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
    });
}

exports.getshopingcart = getshopingcart;
exports.checkout = checkoutex;
exports.addtoshopcart = addtoshopcart;
exports.deleteshopcart = deleteshopcart;
exports.updateshopitemnumber = updateshopitemnumber;
exports.getproducteval = getproducteval;
exports.getproductevallist = getproductevallist;
exports.getproductevalbyleve = getproductevalbyleve;
exports.saveproducteval = saveproducteval;
exports.createsendredpackorder = createsendredpackorder;
exports.resendredpackorder = resendredpackorder;
exports.creategiftorder = creategiftorder;
exports.getqouponContent = getqouponContent;
exports.doOrderPayResult = doOrderPayResult;
exports.getqouponrecord = getqouponrecord;
exports.queryPayOrder = queryPayOrder;
exports.closePayOrder = closePayOrder;
exports.createOrder = createOrder;
exports.createQouponOrder = createQouponOrder;
exports.sendqoupon = sendqoupon;
exports.createqoupon = createqoupon;
exports.getgiveqoupon = getgiveqoupon;
exports.recivegiveqoupon = recivegiveqoupon;
exports.createOrderByQoupon = createOrderByQoupon;
exports.addFavoritesById = addFavoritesById;
exports.delFavoritesById = delFavoritesById;
exports.getSelfFavorites = getSelfFavorites;
exports.createBlhOrder = createBlhOrder;
exports.getDiscountCoupon = getDiscountCoupon;