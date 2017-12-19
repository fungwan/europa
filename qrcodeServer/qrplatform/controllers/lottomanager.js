//加载第三方模块
var uuid = require('node-uuid');
var moment = require('moment');
var eventproxy = require('eventproxy');
//加载项目内部模块
var db = require('../common/db');
var logger = require('../common/logger');
var returnData = require('../common/returnData');
var vo = require('../models/vomodels');
var tool = require('../common/tool');
var config = require('../../config');
var mallmanager = require('./mallmanageMobile');

function savelotto(arg, cb) {
    var lotto = JSON.parse(arg.lotto);
    var ep = new eventproxy();
    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;

    var lottodb = db.models.lotto;
    var lottoprizedb = db.models.lottoprize;
    var lottopointdb = db.models.lottopoint;

    ep.on('ok', function (result) {
        logger.info(useraccount, "生成抽奖活动成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口savelotto错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    ep.on('save', function () {
        db.sequelize.transaction({
            autocommit: true
        }).then(function (tran) {
            // if (!lotto.lottoid || lotto.lottoid == '') {
            //     lotto.lottoid = uuid.v4();
            // }

            ep.on('rollback', function (error, errcode, errmsg) {
                tran.rollback();
                if (error) {
                    logger.error(useraccount, "接口custsign错误", error);
                    ep.emit('error', error);
                } else {
                    logger.error(useraccount, errmsg);
                    cb(returnData.createError(errcode, errmsg));
                }

            });

            ep.on('savepointset', function () {
                lottopointdb.destroy({
                    where: { 'lottoid': lotto.lottoid },
                    transaction: tran
                }).then(function () {
                    for (var itemkey in lotto.points) {
                        var item = lotto.points[itemkey];
                        item.id = uuid.v4();
                        item.lottoid = lotto.lottoid;
                    }
                    lottopointdb.bulkCreate(lotto.points, {
                        transaction: tran
                    }).then(function () {
                        tran.commit();
                        ep.emit('ok', lotto);
                    }).catch(function (err) {
                        logger.error(err);
                        ep.emit('rollback', err, '写入抽奖活动积分设置信息失败!');
                    })
                }).catch(function (err) {
                    logger.error(err);
                    ep.emit('rollback', err, '写入抽奖活动积分设置信息失败!');
                })
            });

            ep.on('saveitem', function () {
                lottoprizedb.destroy({
                    where: { 'lottoid': lotto.lottoid },
                    transaction: tran
                }).then(function () {
                    for (var itemkey in lotto.items) {
                        var item = lotto.items[itemkey];
                        item.id = uuid.v4();
                        item.lottoid = lotto.lottoid;
                    }
                    lottoprizedb.bulkCreate(lotto.items, {
                        transaction: tran
                    }).then(function () {
                        ep.emit('savepointset');
                    }).catch(function (err) {
                        logger.error(err);
                        ep.emit('rollback', err, '写入抽奖活动奖项信息失败!');
                    })
                }).catch(function (err) {
                    logger.error(err);
                    ep.emit('rollback', err, '写入抽奖活动奖项信息失败!');
                })
            });

            lottodb.upsert(lotto, {
                transaction: tran
            }).then(function (result) {
                ep.emit('saveitem', lotto);
            }).catch(function (err) {
                logger.error(err);
                ep.emit('rollback', err, '写入抽奖活动信息失败!');
            });
        }).catch(function (error) {
            logger.error(error);
            ep.emit('error', error);
        });

    });

    //otto.enddate = lotto.enddate + 86399000;//将时间调整至当天的23:59:59
    //判断日期
    var sql = "select max(enddate) as enddate from lotto";
    if (!lotto.lottoid || lotto.lottoid == '') {
        lotto.lottoid = uuid.v4();
    } else {
        sql = sql + " where lottoid <> '" + lotto.lottoid + "'";
    }

    ep.emit('save');

    /*db.sequelize.query(sql, {
        type: 'SELECT'
    }).then(function (data) {
        if (data) {
            if (data[0].enddate < lotto.enddate && lotto.begindate <= lotto.enddate) {//data[0].enddate < lotto.enddate
                ep.emit('save');
            } else {
                cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "设置的日期已有抽奖活动!"));
            }
        } else {
            ep.emit('save');
        }
    }).catch(function (error) {
        logger.error(error);
        ep.emit('error', error);
    });*/
}


function getlottolist(arg, cb) {
    var ep = new eventproxy();
    var beg = tool.getInt(arg.begdate);
    var end = tool.getInt(arg.enddate) + 86399000;
    var key = arg.key;

    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;

    var lottodb = db.models.lotto;
    ep.on('ok', function (result) {
        logger.info(useraccount, "获取抽奖活动成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口getlottolist错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    var where = {};
    if (beg)
        where.begindate = { $gte: beg };
    if (end)
        where.enddate = { $lte: end };
    if (key)
        where.name = { $like: '%' + key + '%' };

    lottodb.findAll({
        where: where,
        order: [['begindate', 'DESC']]
    }).then(function (result) {
        ep.emit('ok', result);
    }).catch(function (error) {
        logger.error(error);
        ep.emit('error', error);
    });
}

function getcurrentlotto(arg, cb) {
    var ep = new eventproxy();
    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;

    var lottodb = db.models.lotto;
    var lottoprizedb = db.models.lottoprize;
    var lottopointdb = db.models.lottopoint;


    ep.on('ok', function (result) {
        logger.info(useraccount, "获取当前抽奖活动成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口getcurrentlotto错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    var now = moment(new Date().toDateString()).format("x");

    ep.on('getpointset', function (lotto) {
        lottopointdb.findAll({
            where: { lottoid: lotto.lottoid },
            order: [['point', 'ASC']]
        }).then(function (result) {
            lotto.points = result;
            ep.emit('ok', lotto);
        }).catch(function (error) {
            logger.error(error);
            ep.emit('error', error);
        });
    });

    ep.on('getitem', function (lotto) {
        lottoprizedb.findAll({
            where: { lottoid: lotto.lottoid }
        }).then(function (result) {
            lotto.items = result;
            ep.emit('getpointset', lotto);
        }).catch(function (error) {
            logger.error(error);
            ep.emit('error', error);
        });
    });

    lottodb.findOne({
        where: { begindate: { $lte: now }, enddate: { $gte: now }, state: 1 }
    }).then(function (result) {
        if (result)
            ep.emit('getitem', result.dataValues);
        else {
            ep.emit('ok', result);
        }
    }).catch(function (error) {
        logger.error(error);
        ep.emit('error', error);
    });
}


function getlottobyid(arg, cb) {
    var lottoid = arg.lottoid;
    var ep = new eventproxy();
    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;

    var lottodb = db.models.lotto;
    var lottoprizedb = db.models.lottoprize;
    var lottopointdb = db.models.lottopoint;


    ep.on('ok', function (result) {
        logger.info(useraccount, "获取当前抽奖活动成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口getcurrentlotto错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    var now = moment(new Date().toDateString()).format("x");

    ep.on('getpointset', function (lotto) {
        lottopointdb.findAll({
            where: { lottoid: lotto.lottoid },
            order: [['point', 'ASC']]
        }).then(function (result) {
            lotto.points = result;
            ep.emit('ok', lotto);
        }).catch(function (error) {
            logger.error(error);
            ep.emit('error', error);
        });
    });

    ep.on('getitem', function (lotto) {
        var sql = "select a.*,b.productname from lottoprize as a inner join mallproduct as b on a.productid=b.productid where a.lottoid='" + lotto.lottoid + "'";
        db.sequelize.query(sql,
            { type: db.sequelize.QueryTypes.SELECT }).then(function (result) {
                lotto.items = result;
                ep.emit('getpointset', lotto);
            }).catch(function (error) {
                logger.error(error);
                ep.emit('error', error);
            });
    });

    lottodb.findOne({
        where: { lottoid: lottoid }
    }).then(function (result) {
        if (result)
            ep.emit('getitem', result.dataValues);
        else {
            ep.emit('ok', result);
        }
    }).catch(function (error) {
        logger.error(error);
        ep.emit('error', error);
    });
}

function playlotto(arg, cb) {
    var lottopointid = arg.lottopointid;
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    var custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    //var custid = '33e6e487-2fef-47c3-a5b4-bcfb7903bb42';

    var ep = new eventproxy();
    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;

    var lottodb = db.models.lotto;
    var lottoprizedb = db.models.lottoprize;
    var lottopointdb = db.models.lottopoint;
    var custdb = db.models.custextend;
    var lottorecorddb = db.models.lottorecord;
    var productdb = db.models.mallproduct;
    var recdb = db.models.propointdetail;
    var orderdb = db.models.mallorder;
    var orderitemdb = db.models.mallorderdetail;
    var coupondb = db.models.cashcoupon;

    var lotto = null;
    var lottopoint = null;
    var lottoprize = [];
    var cust = null;
    var wininfo = {};
    var wincount = 0;
    var defpri = null;
    var prizesel = null;
    var prizeselinfo = null;
    var lottororder = null;

    ep.on('ok', function () {
        if (prizesel) {
            prizesel.productinfo = prizeselinfo;
            prizesel.order = lottororder;
        } else {
            prizesel = null;
        }
        logger.info(useraccount, "抽奖活动成功!");
        cb(null, returnData.createData(prizesel));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口getcurrentlotto错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    ep.on('send', function (order) {
        arg.orderid = order.orderid;
        switch (prizeselinfo.producttype) {
            case 'product':
                prizesel.sendstate = false;
                ep.emit('ok');
                break;
            case 'redpacket':
                mallmanager.resendredpackorder(arg, function (err, resdata) {
                    if (err) {
                        prizesel.sendstate = false;
                    } else {
                        if (resdata.state == 3) {
                            prizesel.sendstate = true;
                        } else
                            prizesel.sendstate = false;
                    }
                    ep.emit('ok');
                });
                break;
            case 'cashcoupon':
                ep.emit('ok');
                break;
            case 'qoupon':
                mallmanager.createqoupon(order.orderid, null, function (err, resdata) {
                    if (err) {
                        prizesel.sendstate = false;
                    } else {
                        if (resdata.state == 3) {
                            prizesel.sendstate = true;
                        } else
                            prizesel.sendstate = false;
                    }
                    ep.emit('ok');
                });
                break;
        }

    });

    //处理抽奖结果
    ep.on('save', function () {
        db.sequelize.transaction({
            autocommit: true
        }).then(function (tran) {
            ep.on('rollback', function (errorcode, errmsg) {
                cb(returnData.createError(errorcode, errmsg));
                tran.rollback();
            });


            ep.on('createorderitem', function (order) {
                var item = {
                    itemid: uuid.v4(),
                    orderid: order.orderid,
                    mcdid: prizeselinfo.productid,
                    productname: prizeselinfo.productname,
                    productnumber: prizesel.productnumber,
                    productinfo: prizeselinfo.productinfo,
                    productimage: prizeselinfo.productimage,
                    price: 0,
                    sumprice: 0,
                    privilege: 0,
                    cost: prizeselinfo.cost
                };
                orderitemdb.create(item, {
                    transaction: tran
                }).then(function (result) {
                    lottororder = order;

                    tran.commit();
                    ep.emit('send', order);
                }).catch(function (error) {
                    logger.error(null,error.message);
                    ep.emit('rollback', 'databaseError', '生成订单明细失败!');
                });
            });

            ep.on('createorder', function (bm) {

                var order = {
                    orderid: uuid.v4(),
                    custid: cust.custid,
                    price: 0,
                    createtime: moment().valueOf(),
                    state: 1,
                    orderbm: bm,
                    paymoney: 0,
                    tickmoney: 0,
                    remak: '积分抽奖中奖订单',
                    evalstate: -1,
                    billno: '0',
                    producttype: prizeselinfo.producttype,
                    express: '',
                    trackingno: ''
                };
                orderdb.create(order, {
                    transaction: tran
                }).then(function (result) {
                    ep.emit('createorderitem', order);
                }).catch(function (error) {
                    logger.error(null,error.message);
                    ep.emit('rollback', 'databaseError', '生成订单失败!');
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
                    logger.error(null,error.message);
                    ep.emit('rollback', 'databaseError', '生成订单失败!');
                });
            });

            ep.on('savegetpointrec', function () {
                var prec = {
                    detailid: uuid.v4(),
                    custid: cust.custid,
                    pointchannel: prizesel.id,
                    point: prizesel.productnumber,
                    pointtime: moment().format(config.dateformat),
                    changemode: 'lotto',
                    remark: '抽奖获得积分'
                };
                recdb.create(prec, {
                    transaction: tran
                }).then(function (result) {
                    tran.commit();
                    ep.emit('ok');
                }).catch(function (error) {
                    logger.error(useraccount, "新增积分记录失败");
                    ep.emit("rollback", returnData.errorType.dataBaseError.unknow,'新增积分记录失败');
                });
            });

            ep.on('sendpoint', function () {
                var point = prizesel.productnumber;
                custdb.update({
                    point: cust.point + point
                }, {
                        where: { custid: cust.custid },
                        transaction: tran
                    }).then(function (result) {
                        ep.emit('savegetpointrec');
                    }).catch(function (err) {
                        logger.error(useraccount, err.message);
                        ep.emit('rollback', 'databaseError', '积分获取失败!');
                    })
            });

            ep.on('updatecashcouponnumber', function () {
                db.sequelize.query(
                    "update mallproduct set amount=amount-" + prizesel.productnumber + " where productid='" + prizesel.productid + "'",
                    {
                        transaction: tran
                    }
                ).spread(function () {
                    tran.commit();
                    ep.emit('ok');
                }).catch(function (error) {
                    logger.error(useraccount, "updatecashcouponnumber error");
                    ep.emit("rollback", 'databaseError','数据库错误');
                });
            });

            ep.on('sendcashcoupon', function () {

                coupondb.findAll({
                    where: {
                        state: 'normal',
                        productid: prizesel.productid
                    },
                    limit: prizesel.productnumber
                }).then(function (res) {
                    if (res.length > 0 && res.length == prizesel.productnumber) {
                        var cashvo = [];
                        for (var x = 0; x < res.length; ++x) {
                            cashvo.push(res[x].get({ chain: true }).url);
                        }
                        coupondb.update({
                            owner: custid,
                            usedate: moment().format('X'),
                            state: 'used'
                        }, {
                                where: {
                                    url: { $or: cashvo }
                                },
                                transaction: tran
                            }).then(function (res) {
                                ep.emit('updatecashcouponnumber');
                            }).catch(function (err) {
                                logger.error(useraccount, "抽奖失败,请重试!"+err.message);
                                ep.emit("rollback", returnData.errorType.dataBaseError.unknow,'数据库错误');
                            });
                    } else {
                        logger.error(useraccount, "很遗憾库存不足，请联系客服");
                        ep.emit("rollback", 'understock','很遗憾库存不足，请联系客服');
                    }
                }).catch(function (err) {
                    logger.error(useraccount, "抽奖失败,请重试!"+err.message);
                    ep.emit("rollback", 'databaseError','数据库错误');
                })
            });

            ep.on('savelottorrec', function () {
                var priname = '';
                if (prizesel)
                    priname = prizesel.id;
                var prec = {
                    id: uuid.v4(),
                    custid: cust.custid,
                    lottoprizeid: priname,
                    usepoint: lottopoint.point,
                    rectime: moment().valueOf(),
                    lottoid: lotto.lottoid
                };
                lottorecorddb.create(prec, {
                    transaction: tran
                }).then(function (result) {
                    if (prizesel) {
                        if (prizeselinfo.producttype === 'point')
                            ep.emit('sendpoint');
                        else if (prizeselinfo.producttype === 'cashcoupon')
                            ep.emit('sendcashcoupon');
                        else
                            ep.emit('createOrderBm');
                    } else {
                        tran.commit();
                        ep.emit('ok');
                    }
                }).catch(function (error) {
                    logger.error(useraccount, "新增抽奖记录失败"+error.message);
                    ep.emit("rollback", 'databaseError','数据库错误');
                });
            });


            ep.on('savepointrec', function () {
                var pointchannel = '';
                if (prizesel)
                    pointchannel = prizesel.id;
                var prec = {
                    detailid: uuid.v4(),
                    custid: cust.custid,
                    pointchannel: pointchannel,
                    point: 0 - lottopoint.point,
                    pointtime: moment().format(config.dateformat),
                    changemode: 'lotto',
                    remark: '积分抽奖'
                };
                recdb.create(prec, {
                    transaction: tran
                }).then(function (result) {
                    ep.emit('savelottorrec');
                }).catch(function (error) {
                    logger.error(useraccount, "新增积分记录失败"+error.message);
                    ep.emit("rollback", 'databaseError','数据库错误');
                });
            });

            //扣积分
            custdb.update({
                point: cust.point - lottopoint.point
            }, {
                    where: { custid: cust.custid },
                    transaction: tran
                }).then(function (result) {
                    ep.emit('savepointrec');
                }).catch(function (error) {
                    logger.error(useraccount, "积分扣除失败"+error.message);
                    ep.emit("rollback", error.errortype,'积分扣除失败');
                });

        }).catch(function (error) {
            logger.error(useraccount, '数据库错误'+error.message);
            ep.emit('error', error);
        })
    });

    ep.on('getprizeinfo', function () {
        if (prizesel) {
            productdb.findOne({
                where: { productid: prizesel.productid }
            }).then(function (result) {
                if (result) {
                    prizeselinfo = result.dataValues;
                    ep.emit('save');
                } else {
                    cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "获取当前奖品信息失败!"));
                }
            }).catch(function (error) {
                logger.error(useraccount, error);
                ep.emit('error', error);
            })
        } else {
            ep.emit('save');
        }
    });

    //抽奖
    ep.on('getwinnumber', function () {
        lottoprize.forEach(function (prize) {
            if (prize.maxnumber && prize.maxnumber > 0) {
                wininfo[prize.id] = 0;
                wincount++;
            }
        });

        //创建奖池,并抽奖
        ep.after('createpool', wincount, function () {
            //计算奖池
            var bl = 100000000;
            var beg = 0;

            for (var prikey in lottoprize) {
                var pri = lottoprize[prikey];
                pri.beg = beg + 1;
                pri.end = beg + pri.ratio * bl;
                beg = pri.end;
                if (pri.ratio >= 1)
                    defpri = pri;
            }

            //生成随机数,判断随机数落入那个奖池
            var prisel = null;

            var code = Math.round(Math.random() * bl) + 1;
            for (var prikey in lottoprize) {
                var pri = lottoprize[prikey];
                if (pri.beg <= code && pri.end >= code) {
                    prisel = pri;
                }
            }
            if (prisel == null)
                prisel = defpri;

            if (prisel) {
                //判断是否超过中奖最大数
                var selwin = wininfo[prisel.id];
                if (selwin) {
                    if (selwin + 1 > prisel.maxnumber && prisel.maxnumber > 0) {
                        prisel = defpri;
                    }
                }
            }

            prizesel = prisel;
            ep.emit('getprizeinfo');

        });

        for (var key in wininfo) {
            lottorecorddb.count({
                where: { lottoid: lotto.lottoid, lottoprizeid: key }
            }).then(function (result) {
                if (result) {
                    wininfo[key] = result;
                }
                ep.emit('createpool');
            }).catch(function (error) {
                logger.error(useraccount, error);
                ep.emit('error', error);
            })
        }

    });

    //获取抽奖设置
    ep.on('getlottoinfo', function () {
        lottoprizedb.findAll({
            where: { lottoid: lotto.lottoid }
        }).then(function (result) {
            if (result) {
                for (var index in result) {
                    lottoprize.push(result[index].dataValues);
                }

                ep.emit('getwinnumber');
            } else {
                cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "获取当前活动设置信息失败!"));
            }
        }).catch(function (error) {
            logger.error(useraccount, error);
            ep.emit('error', error);
        })
    });

    //检查用户积分是否足够
    ep.on('checkpoint', function () {
        custdb.findOne({
            where: { custid: custid }
        }).then(function (result) {
            if (result) {
                cust = result.dataValues;
                if (cust.point >= lottopoint.point) {
                    ep.emit('getlottoinfo');
                } else {
                    cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "您的积分不足!"));
                }
            } else {
                cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "获取当前用户信息失败!"));
            }
        }).catch(function (error) {
            logger.error(error);
            ep.emit('error', error);
        })
    });

    //检查活动时间
    ep.on('checktime', function () {
        lottodb.findOne({
            where: { lottoid: lottopoint.lottoid }
        }).then(function (result) {
            if (result) {
                lotto = result.dataValues;
                var now = moment(new Date().toDateString()).format("x");
                if (lotto.begindate <= now && lotto.enddate >= now) {
                    ep.emit('checkpoint');
                } else {
                    cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "活动未开始或已结束!"));
                }
            } else {
                cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "错误的活动信息!请重试!"));
            }
        }).catch(function (error) {
            logger.error(error);
            ep.emit('error', error);
        })
    });

    //查询投注积分信息
    lottopointdb.findOne({
        where: { id: lottopointid }
    }).then(function (result) {
        if (result) {
            lottopoint = result.dataValues;
            ep.emit('checktime');
        } else {
            cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "错误的活动信息!请重试!"));
        }
    }).catch(function (error) {
        logger.error(error);
        ep.emit('error', error);
    })
}

function getlottorecord(arg, cb) {
    var custid = '';
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    //var lottorecorddb=db.models.lottorecord;

    var ep = new eventproxy();
    ep.on('ok', function (result) {
        logger.info(useraccount, "获取当前抽奖活动成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口getcurrentlotto错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    db.sequelize.query(
        "select * from v_lotto_record where custid='" + custid + "' order by rectime DESC",
        { type: db.sequelize.QueryTypes.SELECT }
    ).then(function (data) {
        ep.emit('ok', data);
    }).catch(function (error) {
        logger.error(error);
        ep.emit('error', error);
    });


    // lottorecorddb.findAll({
    //     where:{custid:custid},
    //     order:[['rectime','DESC']]
    // }).then(function(data){
    //     ep.emit('ok',data);
    // }).catch(function(error){
    //     logger.error(error);
    //     ep.emit('error', error);
    // })
}

function editorderadd(arg, cb) {
    var addid = arg.addid;
    var orderid = arg.orderid;
    var address = arg.address;
    var custid = '';
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    //var lottorecorddb=db.models.lottorecord;
    var orderdb = db.models.mallorder;

    var ep = new eventproxy();
    ep.on('ok', function (result) {
        logger.info(useraccount, "获取当前抽奖活动成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口getcurrentlotto错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    orderdb.update({ addid: addid, address: address }, { where: { orderid: orderid } }).then(function (data) {
        ep.emit('ok', data);
    }).catch(function (error) {
        logger.error(error);
        ep.emit('error', error);
    })

}

function enablelotto(arg, cb) {

    var lottoid = arg.lottoid;
    var state = arg.state;

    var lottodb = db.models.lotto;
    lottodb.update({
        state: state
    }, {
            where: { lottoid: lottoid }
        }).then(function (result) {

            lottodb.update({
                state: 0
            }, {
                    where: {
                        lottoid: {
                            $ne: lottoid,
                        }
                    }
                }).then(function (res) {
                    cb(null, returnData.createData(true));
                }).catch(function (err) {
                    cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
                })

        }).catch(function (err) {
            logger.error(arg.currentuser.useraccount, err.message);
            cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
        })

}

module.exports = {
    savelotto: savelotto,
    enablelotto: enablelotto,
    getlottolist: getlottolist,
    getcurrentlotto: getcurrentlotto,
    getlottobyid: getlottobyid,
    playlotto: playlotto,
    getlottorecord: getlottorecord,
    editorderadd: editorderadd
};