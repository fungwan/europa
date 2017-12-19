/**
 * Created by Taoj on 2015/12/29.
 */
//加载第三方库
var eventproxy = require('eventproxy');
var sequelize = require('sequelize');
var moment = require("moment");
var Q = require('q');
var uuid = require('node-uuid');
//加载自定义库
var returnData = require('../common/returnData');
var db = require('../common/db');
var vo = require('../models/vomodels');
var logger = require('../common/logger');
var config = require('../../config');
var tool = require('../common/tool');
var qrinstance = require('./qrcode');

/**
 *
 * @param arg
 * @param callback
 */
function generate(arg, callback) {

    /**
     * 逻辑：产生积分，并保存到表propointrecord中，然后返回结果
     * 参数：qrcode（二维码id）
     * 流程：1、判断qrcode是否使用，活动是否过期，根据qrcode获取到积分活动所对应的project，再获取到扫一次二维码所得的积分分数
     *       2、组装数据并保存到propointrecord表中,recid为qrcode
     *       3、保存成功返回propointrecord对象，失败则返回错误信息
     */

    var ep = new eventproxy();
    ep.on("error", function (error) {
        logger.error(useraccount, "在调用/qrcode/generatepoint接口时出错", error);
        callback(returnData.createError(returnData.errorType.unknow, error));
    });
    var qrcode = arg.qrcode;
    var currentuser = arg.currentuser;
    if (!currentuser) {
        ep.emit('error', returnData.errorType.unlogin);
        return;
    }

    var qrcodedb = db.models.proqrcode,
        pointdb = db.models.propoint,
        pointdetaildb = db.models.propointdetail,
        custextenddb = db.models.custextend,
        projectdb = db.models.project,
        recorddb = db.models.propointrecord;

    if (!qrcode) {
        ep.emit('error', returnData.errorType.paraerror);
        return;
    }

    var useraccount = currentuser.nickname;
    var custid = currentuser.custid;

    var lastresult = {};
    lastresult.recid = qrcode;
    lastresult.custid = custid;
    lastresult.nickname = useraccount;
    lastresult.country = currentuser.country;
    lastresult.province = currentuser.province;
    lastresult.city = currentuser.city;
    lastresult.areacode = currentuser.areacode;

    ep.on("getProjectInfo", function (pro) {
        projectdb.findOne({ where: { projectid: pro.projectid } }).then(
            function (project) {
                if (!project || tool.isEmptyObject(project)) {
                    logger.error(useraccount, "调用/qrcode/generatepoint接口失败。没有projectid为" + pro.projectid + "的积分记录");
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
                logger.error(useraccount, "获取积分活动信息失败："+error.message);
                ep.emit("error", 'databaseError');
            }
        );
    });

    ep.on("getSetting", function (pro) {
        pointdb.findOne({ where: { projectid: pro.projectid } }).then(
            function (result) {
                if (!result || tool.isEmptyObject(result)) {
                    logger.error(useraccount,
                        "调用/qrcode/generatepoint接口时,获取活动积分配置失败。没有projectid为" + pro.projectid + "的积分记录");
                    callback(returnData.createError(returnData.errorType.notexist, "参数错误"));
                }
                else {
                    var data = result.get({ "chain": true });
                    lastresult.pointtime = moment().format(config.dateformat);

                    if (data.pointtype === '0') {//固定积分（point字段中记录积分的实际值）
                        lastresult.point = data.point;
                        ep.emit("setNewRecord");
                    } else {
                        //1.查找对应商品，及它对应积分值
                        try {
                            var score = (pro.mcdvo.point == null || pro.mcdvo.point == '') ? 0 : parseInt(pro.mcdvo.point);
                            //2.计算倍数后的分值
                            lastresult.point = parseInt(data.pointtype) * score;
                            ep.emit("setNewRecord");
                        } catch (error) {
                            logger.error(useraccount, "获取商品原始积分并计算本次累计积分出错:"+error.message);
                            ep.emit('error', error);
                        }
                    }
                }
            },
            function (error) {
                logger.error(useraccount, "获取活动积分配置失败："+error.message);
                ep.emit("error", 'databaseError');
            }
        );
    });

    ep.on("setNewRecord", function () {

        //开启事务处理

        db.sequelize.transaction(function (t) {

            function creteRecord() {

                var deferred = Q.defer();

                recorddb.create(lastresult,
                    { transaction: t }).then(function (res) {
                        //logger.info(useraccount, "生成新积分记录成功。");
                        deferred.resolve(res.get({ chain: true }));

                    }).catch(function (error) {
                        logger.error(useraccount, "生成新积分记录失败："+error.message);
                        deferred.reject('databaseError');
                    });

                return deferred.promise;
            }

            function updatedetail(recvo) {

                var deferred = Q.defer();

                var detailvo = {
                    detailid: uuid.v4(),
                    custid: custid,
                    entid:lastresult.entid,
                    pointchannel: recvo.recid,
                    point: recvo.point,
                    pointtime: recvo.pointtime,
                    changemode: 'propoint',
                    remark: '扫码获得预设积分'
                };
                pointdetaildb.create(detailvo, { transaction: t }).then(function (res) {
                    //logger.info(useraccount, "更新积分明细记录成功。");
                    deferred.resolve(res);
                }).catch(function (error) {
                    logger.error(useraccount, "更新积分明细记录失败："+error.message);
                    deferred.reject('databaseError');
                });
                return deferred.promise;
            }

            function updateextend() {

                var deferred = Q.defer();

                var updateExtendsql = 'UPDATE custextend set point = point + ' + lastresult.point + ' where custid = \'';
                updateExtendsql+= custid + '\'';
                db.sequelize.query(updateExtendsql, { transaction:t}).spread(function (results, metadata) {
                    //logger.info(useraccount, "更新个人总积分成功。");
                    deferred.resolve(results);
                }).catch(function (err) {
                    logger.error(useraccount, "更新个人总积分失败:"+err.message);                    
                    deferred.reject('databaseError');
                });

                return deferred.promise;
            }

            return creteRecord()
                .then(updatedetail)
                .then(updateextend)
                .then(qrinstance.setQrcodeStatesEx(qrcode,t));

        }).then(function (result) {
            ep.emit('finished');
        }).catch(function (err) {
            ep.emit("error", err);
        });
    });

    ep.on("finished", function () {
        //qrinstance.setQrcodeStates(qrcode,'1');
        callback(null, returnData.createData(lastresult));
    });

    //again check qr has used or out date
    qrinstance.getpidbyqrcode(qrcode).then(function (res) {
        ep.emit("getProjectInfo", res);//获取活动相关信息
    }).catch(function (err) {
        logger.error(useraccount, "通过qrcode获取projectid失败:"+err);
        ep.emit("error", err);
    });
}
/**
 * 验证qrcode是否可用
 * @param arg
 * @param callback
 */
function check(arg) {
    /**
     * 验证qrcode是否存在，qrcode 是否已经使用(propointrecord表中的recid是否存在qrcode的值)，活动是否过期,
     * 验证通过则返回true,若已经积分则返回propointrecord对象;未通过验证则以错误格式返回错误数据
     */

    /*if (!currentuser) {
        callback(returnData.createError(returnData.errorType.unlogin, "用户未登陆"));
        return;
    }*/

    var ep = new eventproxy();
    var d = Q.defer();

    var qrcode = arg.qrcode;
    if (!qrcode) {
        d.reject(returnData.createError(returnData.errorType.paraerror, "QRcode参数错误"));
        return d.promise;
    }

    var currentuser = arg.currentuser;
    var data = arg.project;
    var useraccount = currentuser.nickname;

    var recorddb = db.models.propointrecord;

    ep.on("checkqramount", function (project) {
        recorddb.findAll({
            where: { projectid: project.projectid }
        }).then(function (data) {
            if (!!data && (data.length >= 0 && data.length < project.qramounts)) {
                callback(null, returnData.createData(true));
            } else {
                callback(returnData.createError(returnData.errorType.mobile.noproject));
            }
        }).catch(function (err) {
            logger.error(useraccount, "验证qrcode失败，数据库错误" + err.message);
            d.reject(returnData.errorType.dataBaseError.unknow);
        })
    })

    ep.on('getrec', function () {
        recorddb.find({ where: { recid: qrcode } }).then(
            function (result) {
                if (!result || tool.isEmptyObject(result)) {
                    //logger.info(useraccount, "record表中没有该记录,可以使用");
                    d.resolve({ name: 'propoint', gen: false, record: '' });
                }
                else {
                    if (result.custid == currentuser.custid) {
                        d.resolve({ name: 'propoint', gen: true, record: result });
                    } else {
                        d.reject(returnData.errorType.mobile.used);
                        logger.error(useraccount, "二维码已经被使用："+qrcode);
                    }
                }
            }, function (err) {
                logger.error(useraccount, "验证qrcode失败，数据库错误" + err.message);
                d.reject(returnData.errorType.dataBaseError.unknow);
            }
        );
    });

    var startdate = data.begdate, enddate = data.enddate;
    if (moment().isBetween(startdate, enddate) && data.state === vo.project.state.start) {
        //logger.info(useraccount, "验证成功,活动仍在进行中。");
        ep.emit("getrec");
    }
    else {
        if (data.state !== vo.project.state.start) {
            logger.error(useraccount, "活动状态不正确，活动未启用或已停止");
            d.reject(returnData.errorType.mobile.noproject);
        } else {
            logger.error(useraccount, "活动不在时间范围内");
            d.reject(returnData.errorType.mobile.outofdate);
        }
    }

    return d.promise;
}
exports.generate = generate;
exports.check = check;