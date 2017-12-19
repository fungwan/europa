/**
 * Created by FUNGWAN on 2016/8/12.
 */
//加载第三方库
var eventproxy = require('eventproxy');
var sequelize = require('sequelize');
var moment = require("moment");
var Q = require("q");
//加载自定义库
var returnData = require('../common/returnData');
var db = require('../common/db');
var vo = require('../models/vomodels');
var logger = require('../common/logger');
var config = require('../../config');
var tool = require('../common/tool');
var qrinstance = require('./qrcode');
var wxsender = require('./mobileapp');

function generate(arg, callback) {

    var currentuser = arg.currentuser;
    var entid = currentuser.entid;
    var useraccount = currentuser.nickname;
    var custid = currentuser.custid;

    var ep = new eventproxy();
    ep.on("error", function (error) {//其他异常处理的回调
        logger.error(useraccount, "在调用/qrcode/generatepoint接口时出错", error.message);
        callback(returnData.createError(returnData.errorType.unknow, error.message));
    });

    var qrcode = arg.qrcode;
    if (!qrcode) {
        callback(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }

    var lastresult = {};
    lastresult.qrid = qrcode;
    lastresult.entname = currentuser.entname;
    lastresult.custid = custid;
    lastresult.openid = currentuser.openid;
    lastresult.nickname = useraccount;
    //lastresult.rectime = tool.date();
    lastresult.country = currentuser.country;
    lastresult.province = currentuser.province;
    lastresult.city = currentuser.city;
    lastresult.areacode = currentuser.areacode;

    var saledb = db.models.prosale,
        projectdb = db.models.project,
        lotteryrecorddb = db.models.prolotteryrecord,
        salerecorddb = db.models.prosalerecord;

    function getSaleCounts(query) {
        var d = Q.defer();
        salerecorddb.count({
            where: query
        }).then(function (res) {
            d.resolve(res);
        }).catch(function (err) {
            d.reject(err);
        });
        return d.promise;
    }

    function insertSaleRecord(vo, trans) {
        var d = Q.defer();
        salerecorddb.create(vo, { transaction: trans }).then(function (res) {
            var rlt = res.get({ chain: true });
            d.resolve({ d: vo });
        }).catch(function (err) {
            d.reject(err);
        });
        return d.promise;
    }

    ep.on("getProjectInfo", function (pro) {
        projectdb.findOne({ where: { projectid: pro.projectid } }).then(
            function (project) {
                if (!project || tool.isEmptyObject(project)) {
                    logger.error(useraccount, "调用/qrcode/generatesale接口失败。没有projectid为" + pro.projectid + "的积分记录");
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
                            ep.emit("getSetting", pro);//获取对应的积分配置
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

    ep.on("getSetting", function (pro) {
        saledb.findOne({ where: { projectid: pro.projectid } }).then(
            function (result) {
                if (!result || tool.isEmptyObject(result)) {
                    logger.error(useraccount,
                        "调用/qrcode/generatesale接口时,获取活动满减配置失败。没有projectid为" + pro.projectid + "的满减配置记录");
                    callback(returnData.createError(returnData.errorType.notexist, "参数错误"));
                }
                else {
                    var data = result.get({ "chain": true });
                    var ctgid = pro.mcdvo.categoryid;

                    lastresult.rectime = moment().format(config.dateformat);
                    lastresult.categoryid = ctgid;
                    //conditiontype:'0'全场，'1':同类
                    var query = {
                        projectid: lastresult.projectid,
                        openid: lastresult.openid
                    };
                    if ('1' === data.conditiontype) {
                        query.categoryid = ctgid;
                    }

                    getSaleCounts(query).then(function (userbuycounts) {
                        var salecondition = data.condition;
                        var alreadybuy = 0, tobuy = 0;
                        var remainder = (userbuycounts + 1) % salecondition;
                        var saleData = {};

                        db.sequelize.transaction(function (t) {

                            if (remainder === 0) {
                                //满足满减条件
                                lastresult.price = data.redpacket;
                                lastresult.recid = qrcode;
                                lastresult.state = 'normal';

                                /*
                                    如果当前扫码满足满减条件，则更新最近扫码前几次状态
                                 */
                                function updataSaleRecords() {

                                    var d = Q.defer();
                                    var salecondition = data.condition;
                                    var fields = {
                                        recid: qrcode
                                    };

                                    salerecorddb.update(fields,
                                        {
                                            where: query,
                                            limit: salecondition,
                                            order: 'rectime desc',
                                            transaction: t
                                        }
                                    ).then(function (effect) {
                                        d.resolve(lastresult);
                                        logger.info(useraccount, "update满减salerecord记录成功.");
                                    }).catch(function (error) {
                                        d.reject(error);
                                        logger.error(useraccount, "update满减salerecord记录失败." + error.message);
                                    });

                                    return d.promise;
                                }

                                return insertSaleRecord(lastresult, t).then(updataSaleRecords).then(qrinstance.setQrcodeStatesEx(qrcode,t));
                            }

                            function unfinished() {
                                var d = Q.defer();
                                var salecondition = data.condition;
                                var alreadybuy = remainder;
                                d.resolve({
                                    code: returnData.errorType.mobile.unfinished,
                                    scaned: alreadybuy,
                                    total: salecondition
                                });
                                return d.promise;
                            }
                            return insertSaleRecord(lastresult, t).then(unfinished).then(qrinstance.setQrcodeStatesEx(qrcode,t));

                        }).then(function (result) {
                            ep.emit('finished', result);
                        }).catch(function (err) {
                            ep.emit("error", err);
                        });

                    });
                }
            },
            function (error) {
                logger.error(useraccount, "获取活动积分失败");
                ep.emit("error", error);
            }
        );
    });

    ep.on("finished", function (res) {

        if (res.price) {
            sendmoney(lastresult, function (err, data) {
                if (err !== null) {
                    logger.error(currentuser.openid, '红包发送失败，需要手动再次派送');
                }
            })
        }

        //qrinstance.setQrcodeStates(qrcode,'1');
        callback(null, returnData.createData(res));
    });

    //again check qr has used or out date
    qrinstance.getpidbyqrcode(qrcode).then(function (res) {
        ep.emit("getProjectInfo", res);//获取活动相关信息
    }).catch(function (err) {
        logger.error(useraccount, "通过qrcode获取projectid失败");
        ep.emit("error", err);
    });
}

/**
 * 验证qrcode是否可用
 * @param arg
 * @param callback
 */
function check(arg) {

    var currentuser = arg.currentuser;
    var entid = currentuser.entid;
    var useraccount = currentuser.nickname;
    var custid = currentuser.custid;

    var d = Q.defer();
    var recdb = db.models.prosalerecord;
    var saledb = db.models.prosale;
    var proxy = new eventproxy();

    var qrcode = arg.qrcode; var project = arg.project;
    proxy.on('getrec', function (pro) {
        recdb.findOne({
            where: { qrid: qrcode }
        }).then(function (result) {

            if (!result || tool.isEmptyObject(result)) {
                logger.info(useraccount, "record表中没有该记录，该二维码可以使用,继续验证是否在活动期内。");
                d.resolve({ name: 'prosale', gen: false, record: '' });
            }
            else {
                if (result.custid == currentuser.custid) {
                    //检查是否满足条件，为否则返回已扫码次数
                    var rs = result.get({ chain: true });
                    if (rs.recid != null || rs.recid != '' || rs.recid != undefined) {
                        d.resolve({ name: 'prosale', gen: true, record: result });
                    } else {
                        saledb.findOne({ where: { projectid: pro.projectid } }).then(
                            function (res) {
                                var data = res.get({ "chain": true });
                                var query = {
                                    projectid: arg.project.projectid,
                                    openid: arg.currentuser.openid
                                };
                                if ('1' === data.conditiontype) {
                                    query.categoryid = pro.mcdvo.categoryid;
                                }
                                recdb.count({
                                    where: query
                                }).then(function (res) {
                                    var remainder = res % data.condition;
                                    d.resolve({
                                        name: 'prosale',
                                        gen: true,
                                        record: {
                                            code: returnData.errorType.mobile.unfinished,
                                            scaned: remainder,
                                            total: data.condition
                                        }
                                    });
                                }).catch(function (err) {
                                    logger.error(useraccount, "验证qrcode失败，数据库错误" + err.message);
                                    d.reject(returnData.errorType.dataBaseError.unknow);
                                });
                            }).catch(function (err) {
                                logger.error(useraccount, "验证qrcode失败，数据库错误" + err.message);
                                d.reject(returnData.errorType.dataBaseError.unknow);
                            });
                    }
                } else {
                    d.reject(returnData.errorType.mobile.used);
                }
            }
        }).catch(function (err) {
            logger.error(useraccount, "验证qrcode失败，数据库错误");
            d.reject(returnData.errorType.dataBaseError.unknow);
        })
    });

    if (moment().isBetween(project.begdate, project.enddate) && project.state === vo.project.state.start) {
        proxy.emit("getrec", project);
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
    senddata["amount"] = data.price;
    senddata["billtype"] = "onsale";
    senddata["nickname"] = data.nickname;
    senddata["wishing"] = "恭喜获得满减红包";
    senddata["ip"] = "127.0.0.1";
    senddata["actname"] = data.projectname;
    senddata["remark"] = data.entname;
    senddata["sendname"] = data.projectname;
    wxsender.sendredpack(senddata, function (err, res) {
        if (!err) {
            var record = {};
            record["recno"] = res.billno;
            record["state"] = res.state;
            var recdb = db.models.prosalerecord;
            recdb.update(record, { where: { recid: data.qrid } }).then(function (affectedRows) {
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