/**
 * Created by Taoj on 2015/12/29.
 */
var eventproxy = require('eventproxy');
var uuid = require('node-uuid');
var moment = require('moment');
var Q = require("q");
//加载项目内部模块
var db = require('../common/db');
var logger = require('../common/logger');
var returnData = require('../common/returnData');
var config = require('../../config');
var vo = require('../models/vomodels');
var tool = require('../common/tool');
var qrinstance = require('./qrcode');
/**
 * 保存问卷答题结果
 * @param arg
 * @param callback
 */
function save(arg, callback) {
    /**
     * 逻辑：
     * 参数：{qrcode（二维码id）,qa:[{name，value}]},其中若为多选时 ,有多条记录
     * 流程：1、根据qrcode判断活动是否过期，根据qrcode获取到问卷活动所对应的project
     *       2、若answer为数组时，一个题目需产生多条答案进行存储，组装数据并保存到proqarecord表中,recid 为自动生成uuid
     *       3、保存成功返回true，失败则返回错误信息
     */
    var prodb = db.models.project;
    var codedb = db.models.proqrcode;
    var currentuser = arg.currentuser; var useraccount = currentuser.nickname;
    var qrcode = arg.qrcode;
    var qa = JSON.parse(arg.qa);
    //获取问题编号
    var qaids = [];
    var qarecvos = [];
    for (var i in qa) {
        if (qa[i].name) qaids.push(qa[i].name);
    }
    var proxy = new eventproxy();
    proxy.on('nodata', function () {
        logger.error(arg.currentuser.custid, "未获取到数据");
        callback(returnData.createError(returnData.errorType.mobile.noexists), null);
    })
    proxy.on('error', function (errCode, err) {
        if (err && typeof err === "error") {
            logger.error(config.systemUser, err.message);
        }
        callback(returnData.createError(returnData.errorType.unknow), null);
    });
    proxy.on('success', function (data) {
        logger.info(arg.currentuser.custid, "插入答题数据成功");       
        callback(null, returnData.createData(data));
    })
    proxy.on('getquestion', function (project) {
        var qadb = db.models.proquestion;
        qadb.findAll({
            where: { qaid: { $in: qaids } }
        }).then(function (question) {
            if (question) {
                proxy.emit('makeqarec', project, question);
            } else {
                proxy.emit('nodata');
            }
        }).catch(function (err) {
            proxy.emit('error', err);
        })
    })
    proxy.on('makeqarec', function (project, question) {
        for (var i in question) {
            for (var j in qa) {
                if (qa[j].name === question[i].qaid) {
                    var qarecvo = {};
                    qarecvo.recid = uuid.v4();
                    qarecvo.qrid = arg.qrcode;
                    qarecvo.custid = arg.currentuser.custid;
                    qarecvo.qaid = qa[j].name;
                    qarecvo.projectid = project.projectid;
                    qarecvo.projectname = project.shortname;
                    qarecvo.entid = project.entid;
                    qarecvo.entname = project.entname;
                    qarecvo.nickname = arg.currentuser.nickname;
                    qarecvo.qaname = question[i].name;
                    qarecvo.answertime = tool.date();
                    qarecvo.country = arg.currentuser.country;
                    qarecvo.province = arg.currentuser.province;
                    qarecvo.city = arg.currentuser.city;
                    qarecvo.areacode = arg.currentuser.areacode;
                    qarecvo.number = question[i].number;
                    qarecvo.answer = qa[j].value;
                    qarecvos.push(qarecvo);
                }
            }
        }
        logger.info("", qarecvos);
        if (qarecvos.length > 0) {
            proxy.emit('saveqarec', qarecvos);
        } else {
            callback(returnData.createError(returnData.errorType.mobile.noexists), null);
        }
    })
    proxy.on('saveqarec', function (record) {

        db.sequelize.transaction({
        }).then(function (tran) {
            var qarecdb = db.models.proqarecord;
            qarecdb.bulkCreate(record,{transaction:tran})
                .then(function (qarec) {
                    qrinstance.setQrcodeStatesEx(qrcode, tran).then(function(data){
                        tran.commit();
                        proxy.emit('success', record);                        
                    }).catch(function(err){
                        tran.rollback();
                        proxy.emit('error', err);
                    })
                }).catch(function (err) {
                    tran.rollback();
                    proxy.emit('error', err);
                })

        }).catch(function(err){
            proxy.emit('error', err);
        })
    })
    proxy.on('getproject', function (projectid) {
        prodb.findOne({
            where: { projectid: projectid }
        }).then(function (project) {
            if (project) {
                project = project.get({ chain: true });
                if (moment().isBetween(project.begdate, project.enddate) && project.state === vo.project.state.start) {
                    proxy.emit('getquestion', project);
                } else {
                    logger.error(arg.currentuser.custid, "活动已经过期");
                    if (project.state !== vo.project.state.start) {
                        callback(returnData.createError(returnData.errorType.mobile.noproject), null);
                    } else {
                        callback(returnData.createError(returnData.errorType.mobile.outofdate), null);
                    }
                }
            } else {
                callback(returnData.createError(returnData.errorType.mobile.noproject), null);
            }
        }).catch(function (err) {
            proxy.emit('error', err);
        })
    })

    //again check qr has used or out date
    qrinstance.getpidbyqrcode(qrcode).then(function (res) {
        proxy.emit('getproject', res.projectid);
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
    /**
     * 验证qrcode是否存在，活动是否过期
     * 验证通过则返回true
     */

    var d = Q.defer();
    var recdb = db.models.proqarecord;
    var proxy = new eventproxy();

    var qrcode = arg.qrcode; var project = arg.project;
    var currentuser = arg.currentuser;
    var useraccount = currentuser.nickname;

    proxy.on('getrec', function () {
        recdb.findAll({
            where: { qrid: qrcode }
        }).then(function (resultArray) {
            try {
                if (0 === resultArray.length) {
                    logger.info(useraccount, "record表中没有该记录，该二维码可以使用,继续验证是否在活动期内。");
                    d.resolve({ name: 'proquestion', gen: false, record: '' });
                }
                else {
                    var result = resultArray[0].get({ chain: true });
                    if (result.custid == currentuser.custid) {
                        d.resolve({ name: 'proquestion', gen: true, record: resultArray });
                    } else {
                        d.reject(returnData.errorType.mobile.used);
                    }
                }
            } catch (error) {
                logger.error(useraccount, "验证qrcode失败：" + error.message);
                d.reject(returnData.errorType.unknow);
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
exports.save = save;
exports.check = check;