/**
 * Created by FUNGWAN on 2016/8/12.
 */
//加载第三方库
var eventproxy = require('eventproxy');
var sequelize = require('sequelize');
var moment = require("moment");
var Q = require("q");
var uuid = require('node-uuid');
//加载自定义库
var returnData = require('../common/returnData');
var db = require('../common/db');
var vo = require('../models/vomodels');
var logger = require('../common/logger');
var config = require('../../config');
var tool = require('../common/tool');
var qrinstance = require('./qrcode');
var wxsender = require('./mobileapp');
/**
 *
 * @param arg
 * @param callback
 */
function generate(arg, callback) {

    var ep = new eventproxy();
    ep.on("error", function (error) {
        logger.error(useraccount, "在调用/qrcode/generategift接口时出错", error);
        callback(returnData.createError(returnData.errorType.unknow, error));
    });
    var qrcode = arg.qrcode;
    var currentuser = arg.currentuser;
    if (!currentuser) {
        ep.emit('error', returnData.errorType.unlogin);
        return;
    }

    var qrcodedb = db.models.proqrcode,
        giftdb = db.models.progift,
        projectdb = db.models.project,
        mallpdtdb = db.models.mallproduct,
        pointdetaildb = db.models.propointdetail,
        custextenddb = db.models.custextend,
        cashcoupondb = db.models.cashcoupon,
        discountcoupondb = db.models.discountcoupon,
        recorddb = db.models.progiftrecord;

    if (!qrcode) {
        ep.emit('error', returnData.errorType.paraerror);
        return;
    }

    var entid = currentuser.entid;
    var useraccount = currentuser.nickname;
    var custid = currentuser.custid;

    var lastresult = {};
    //common info
    lastresult.recid = qrcode;
    lastresult.entname = currentuser.entname;
    lastresult.custid = custid;
    lastresult.nickname = useraccount;
    lastresult.country = currentuser.country;
    lastresult.province = currentuser.province;
    lastresult.city = currentuser.city;
    lastresult.areacode = currentuser.areacode;
    lastresult.phone = currentuser.phone;
    lastresult.openid = currentuser.openid;

    ep.on("finished", function () {

        if (lastresult.mallproducttype === vo.project.prizetype.redpacket) {
            sendmoney(lastresult, function (err, data) {
                if (err !== null) {
                    logger.error(currentuser.openid, '红包发送失败，需要手动再次派送');
                }
            })
        }

        //qrinstance.setQrcodeStates(qrcode, '1');
        callback(null, returnData.createData(lastresult));
    });

    ep.on("setNewRecord", function () {

        //开启事务处理
        db.sequelize.transaction(function (t) {

            function creteRecord() {

                var deferred = Q.defer();

                recorddb.create(lastresult,
                    { transaction: t }).then(function (res) {
                        logger.info(useraccount, "生成新扫码送记录成功。");
                        deferred.resolve(res.get({ chain: true }));

                    }).catch(function (error) {
                        logger.error(useraccount, "生成新扫码送记录失败");
                        deferred.reject(error.message);
                    });

                return deferred.promise;
            }

            var pointscore = 0;

            function updatedetail(recvo) {

                var deferred = Q.defer();

                var detailvo = {
                    detailid: uuid.v4(),
                    custid: custid,
                    entid: recvo.entid,
                    pointchannel: recvo.recid,
                    point: pointscore,
                    pointtime: recvo.rectime,
                    changemode: 'progift',
                    remark: '扫码即送得积分'
                };
                pointdetaildb.create(detailvo, { transaction: t }).then(function (res) {
                    logger.info(useraccount, "扫码送-积分-更新积分明细记录成功。");
                    deferred.resolve(res);
                }).catch(function (error) {
                    logger.error(useraccount, "扫码送-积分-更新积分明细记录失败");
                    deferred.reject(error.message);
                });
                return deferred.promise;
            }

            function updateextend() {

                var deferred = Q.defer();

                var updateExtendsql = 'UPDATE custextend set point = point + ' + /*lastresult.price **/ lastresult.amount + ' where custid = \'';
                updateExtendsql += custid + '\'';
                db.sequelize.query(updateExtendsql, { transaction: t }).spread(function (results, metadata) {
                    logger.info(useraccount, "更新个人总积分成功。");
                    deferred.resolve(results);
                }).catch(function (err) {
                    logger.error(useraccount, "更新个人总积分失败");
                    deferred.reject(err.message);
                });

                return deferred.promise;
            }

            function getcashcoupon() {
                var d = Q.defer();
                cashcoupondb.findAll({
                    where: {
                        state: 'normal',
                        productid:lastresult.mallproductid
                    },
                    limit: lastresult.amount
                }).then(function (res) {
                    if (res.length > 0 && res.length == lastresult.amount) {
                        var cashvo = [];
                        for (var x = 0; x < res.length; ++x) {
                            cashvo.push(res[x].get({ chain: true }).url);
                        }
                        d.resolve(cashvo);
                    } else {
                        logger.error(useraccount, '未找到可用的优惠券，可能库存不足');
                        d.resolve([]);//需手动派送优惠券
                    }
                }).catch(function (err) {
                    d.reject(err.message);
                })
                return d.promise;
            }

            function updatecashcoupon(cashvo) {

                var d = Q.defer();
                if (0 === cashvo.length) {
                    d.resolve(cashvo);
                } else {
                    cashcoupondb.update({
                        owner: custid,
                        usedate: moment().format('X'),
                        state: 'used'
                    }, {
                            where: {
                                url: { $or: cashvo }
                            },
                            transaction: t
                        }).then(function (res) {
                            d.resolve(cashvo);
                        }).catch(function (err) {
                            logger.error(useraccount, '优惠券记录更新失败：' + JSON.stringify(err));
                            d.reject(returnData.errorType.dataBaseError.unknow);
                        });
                }
                return d.promise;
            }

            function updatecouponstock(cashvo) {

                var d = Q.defer();
                if (0 === cashvo.length) {
                    d.resolve(cashvo);
                } else {
                    var d = Q.defer();
                    var updateExtendsql = 'UPDATE mallproduct set amount = amount - ' + lastresult.amount + ' where productid = \'' + lastresult.mallproductid + '\'';
                    db.sequelize.query(updateExtendsql, { transaction: t }).spread(function (results, metadata) {
                        logger.info(useraccount, "更新优惠券库存成功。");
                        d.resolve(cashvo);
                    }).catch(function (err) {
                        logger.error(useraccount, "更新优惠券库存失败");
                        d.reject(err.message);
                    });
                }

                return d.promise;

            }

            function updatelotteryrecord(cashvo) {

                var d = Q.defer();
                if (cashvo.length > 0) {
                    d.resolve(cashvo);
                } else {
                    recorddb.update({
                        'state': 'sendfalse'
                    }, {
                            where: {
                                'recid': qrcode.qrid
                            },
                            transaction: t
                        }).then(function (res) {
                            d.resolve(cashvo);
                        }).catch(function (err) {
                            logger.error(useraccount, '更新奖品类型为优惠券的中奖纪录的状态失败：' + JSON.stringify(err));
                            d.reject(returnData.errorType.dataBaseError.unknow);
                        })
                }

                return d.promise;

            }

            function createDiscountCoupon() {
                var deferred = Q.defer();
                var discountArrarys = [];
                for(var i  = 0; i < lastresult.amount ;++i){
                    var detailvo = {
                        id: uuid.v4(),
                        productid: lastresult.mallproductid,
                        productname: lastresult.mallproductname,
                        createdate: moment().valueOf(),
                        ratio: lastresult.price,
                        owner: custid,
                        state: 0
                    };
                    discountArrarys.push(detailvo);
                }
                
                discountcoupondb.bulkCreate(discountArrarys, { transaction: t }).then(function (res) {
                    deferred.resolve(res);
                }).catch(function (error) {
                    logger.error(arg.currentuser.nickname, "扫码送-折扣券创建失败");
                    deferred.reject(error.message);
                });
                return deferred.promise;
            }

            if (lastresult.mallproducttype === vo.project.prizetype.point) {
                pointscore = lastresult.amount;
                return creteRecord()
                    .then(updatedetail)
                    .then(updateextend)
                    .then(qrinstance.setQrcodeStatesEx(qrcode, t));
            } else if (lastresult.mallproducttype === vo.project.prizetype.cashcoupon) {
                return creteRecord()
                    .then(getcashcoupon)
                    .then(updatecashcoupon)
                    .then(updatecouponstock)
                    .then(updatelotteryrecord)
                    .then(qrinstance.setQrcodeStatesEx(qrcode, t));
            } else if(lastresult.mallproducttype === vo.project.prizetype.discountcoupon){
                return creteRecord()
                    .then(createDiscountCoupon)
                    .then(qrinstance.setQrcodeStatesEx(qrcode, t));
            } else {
                return creteRecord()
                    .then(qrinstance.setQrcodeStatesEx(qrcode, t));
            }

        }).then(function (result) {
            ep.emit('finished');
        }).catch(function (err) {
            ep.emit("error", err.message);
        });
    });

    ep.on('getMallPdtInfo', function (mallpdtId) {
        //get mallinfo from mcd table;
        mallpdtdb.findOne({
            where: {
                productid: mallpdtId
            }
        }).then(function (res) {
            if (res) {
                var mallvo = res.get({ chain: true });
                lastresult.mallproductid = mallvo.productid;
                lastresult.mallproductname = mallvo.productname;
                lastresult.mallproducttype = mallvo.producttype;
                if (mallvo.price > 0 && (lastresult.mallproducttype === vo.project.prizetype.product || lastresult.mallproducttype === vo.project.prizetype.redpacket)) {
                    lastresult["state"] = vo.project.lotterystate.normal;
                } else {
                    lastresult["state"] = vo.project.lotterystate.success;
                }

                if (lastresult.mallproducttype === vo.project.prizetype.redpacket) {
                    lastresult.price = mallvo.cost;
                } else {
                    lastresult.price = mallvo.price;
                }
                ep.emit("setNewRecord");
            } else {
                logger.error(useraccount, "扫码送，没有找到所送商城商品");
                ep.emit("error", '扫码送，没有找到所送商城商品');
            }
        }).catch(function (err) {
            logger.error(useraccount, "扫码送获取商城商品出错");
            ep.emit("error", err);
        });
    });

    ep.on("getSetting", function (pro) {
        giftdb.findOne({ where: { projectid: pro.projectid } }).then(
            function (result) {
                if (!result || tool.isEmptyObject(result)) {
                    logger.error(useraccount,
                        "调用/qrcode/generategift接口时,获取活动积分失败。没有projectid为" + pro.projectid + "的扫码记录");
                    callback(returnData.createError(returnData.errorType.notexist, "参数错误"));
                }
                else {
                    logger.info(useraccount, "获取扫码送配置成功");
                    var data = result.get({ "chain": true });
                    lastresult.rectime = moment().format(config.dateformat);

                    //1.查找对应扫码送的商品及信息
                    lastresult.amount = data.giftcount;//奖品数量
                    lastresult.giftid = data.giftid;//奖项ID
                    ep.emit("getMallPdtInfo", data.mallproductid);
                }
            },
            function (error) {
                logger.error(useraccount, "获取活动扫码送配置");
                ep.emit("error", error);
            }
        );
    });
    
    ep.on("getProjectInfo", function (pro) {
        projectdb.findOne({ where: { projectid: pro.projectid } }).then(
            function (project) {
                if (!project || tool.isEmptyObject(project)) {
                    logger.error(useraccount, "调用/qrcode/generategift接口失败。没有projectid为" + pro.projectid + "的扫码送记录");
                    ep.emit('error', returnData.errorType.mobile.noproject);
                }
                else {
                    arg.project = project.get({ chain: true });
                    lastresult.entid = arg.project.entid;
                    //检查二维码对应活动及扫码记录状态
                    check(arg).then(function (res) {
                        if (res.gen) {
                            lastresult = res.record;
                            logger.info(useraccount, "找到积分扫码记录直接返回");
                            ep.emit("finished");//查找扫码记录，直接返回扫码积分记录
                        } else {
                            lastresult.entname = arg.project.entname;
                            lastresult.projectid = arg.project.projectid;
                            lastresult.projectname = arg.project.shortname;
                            ep.emit("getSetting", pro);//获取对应的扫码送配置
                        }
                    }).catch(function (err) {
                        ep.emit("error", err);
                    });
                }
            },
            function (error) {
                logger.error(useraccount, "获取活动信息失败");
                ep.emit("error", error);
            }
        );
    });

    //again check qr has used or out date
    qrinstance.getpidbyqrcode(qrcode).then(function (res) {
        ep.emit("getProjectInfo", res);//获取活动相关信息
    }).catch(function (err) {
        logger.error(useraccount, "通过qrcode获取projectid失败");
        ep.emit("error", err.message);
    });
}

/**
 * 验证qrcode是否可用
 * @param arg
 * @param callback
 */
function check(arg, callback) {

    var d = Q.defer();
    var recdb = db.models.progiftrecord;
    var qrcode = arg.qrcode; var project = arg.project;
    var currentuser = arg.currentuser;
    var useraccount = currentuser.nickname;

    var proxy = new eventproxy();

    proxy.on('getrec', function () {
        recdb.findOne({
            where: { recid: qrcode }
        }).then(function (result) {

            if (!result || tool.isEmptyObject(result)) {
                logger.info(useraccount, "record表中没有该记录，该二维码可以使用,继续验证是否在活动期内。");
                d.resolve({ name: 'progift', gen: false, record: '' });
            }
            else {
                if (result.custid == currentuser.custid) {

                    var result = result.get({ chain: true });
                    d.resolve({ name: 'progift', gen: true, record: result });
                } else {
                    d.reject(returnData.errorType.mobile.used);
                }
            }
        }).catch(function (err) {
            logger.error(useraccount, "验证qrcode失败，数据库错误" + err.message);
            d.reject(returnData.errorType.dataBaseError.unknow);
        })
    });

    if (moment().isBetween(project.begdate, project.enddate) && project.state === vo.project.state.start) {
        proxy.emit("getrec");
    } else {
        if (project.state !== vo.project.state.start) {
            logger.error(useraccount, "活动状态不正确，活动未启用或已停止");
            d.reject(returnData.errorType.mobile.noproject);
        } else {
            logger.error(useraccount, "活动不在时间范围内");
            d.reject(returnData.errorType.mobile.outofdate);
        }
    }

    return d.promise;
}

function sendmoney(data, callback) {
    var senddata = {};
    senddata["openid"] = data.openid;
    senddata["amount"] = data.price * data.amount;
    senddata["billtype"] = "gift";
    senddata["nickname"] = data.nickname;
    senddata["wishing"] = "恭喜获得扫码送红包";
    senddata["ip"] = "127.0.0.1";
    senddata["actname"] = data.projectname;
    senddata["remark"] = data.entname;
    senddata["sendname"] = data.projectname;
    wxsender.sendredpack(senddata, function (err, res) {
        if (!err) {
            var record = {};
            record["recno"] = res.billno;
            record["state"] = res.state;
            var recdb = db.models.progiftrecord;
            recdb.update(record, { where: { recid: data.recid } }).then(function (affectedRows) {
                //更新红包发送状态
                logger.info(config.systemUser, affectedRows);
            }).catch(function (errdata) {
                logger.error(config.systemUser, errdata);
            });
            callback(null, returnData.createData(data));
        } else {
            callback(returnData.createError(err.code, err.message), null);
        }
    });
}


exports.generate = generate;
exports.check = check;