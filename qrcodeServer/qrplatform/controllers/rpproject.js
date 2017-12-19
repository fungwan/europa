/**
 * Created by taoj on 2015/11/30.
 */
//加载第三方模块
var uuid = require('node-uuid');
var moment = require('moment');
var sequelize = require('sequelize');
//加载项目内部模块
var db = require('../common/db');
var logger = require('../common/logger');
var returnData = require('../common/returnData');
var vo = require('../models/vomodels');
var tool = require('../common/tool');
var config = require('../../config');
var eventproxy = require('eventproxy');
var request = require('request');
var wechat = require('../wechat/index');
var Q = require('q');
/**
 * 根据活动id获取活动进度数据
 * @param pid
 */
function getProgressById(pid) {
    logger.info(config.systemUser, "开始调用进度服务：");
    var deferrd = Q.defer();
    var _url = config.services.qrlotterymanager.url + config.services.qrlotterymanager.interfaces.progress;
    request.post({ url: _url, form: { "projectid": pid } }, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            var d = JSON.parse(body);
            if (!!d.data) {
                logger.info(config.systemUser, "调用进度服务成功！");
                deferrd.resolve(d.data);
            } else {
                deferrd.reject(d);
            }
        } else {
            logger.error(config.systemUser, err ? err.message : "unknown", err);
            deferrd.reject(returnData.errorType.unknow);
        }
    });
    return deferrd.promise;
}
/**
 *
 * @param id
 * @param callback
 */
function synRulePond(id, callback) {
    var syncurl = syncurl = config.services.qrlotterymanager.url + config.services.qrlotterymanager.interfaces.syncrulelottery;
    request.post({ url: syncurl, form: { "projectid": id } }, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            var d = JSON.parse(body);
            if (!!d.data) {
                callback(null, d);
            } else {
                callback(d, null);
            }
        } else {
            callback(returnData.createError(returnData.errorType.unknow), null);
        }
    });
}
/**
 * 获取单个红包活动详细信息
 * @param project
 * @param callback
 */
exports.getold = function (project, callback, rule) {
    var pid = project.projectid;
    var proxy = new eventproxy();
    //所有数据获取完成后执行返回数据
    proxy.all("lottery", "lotteryrule", function (lottery, lotteryrule) {
        project["config"] = {};
        project.config["rpitems"] = lottery;
        project.progress = 0;
        /**
         * 组装奖项配置信息
         */
        if (!rule) {
            //将lotteryrule转为json对象
            for (var i = 0; i < lotteryrule.length; i++) {
                lotteryrule[i] = lotteryrule[i].get({ chain: true });
                lotteryrule[i]["number"] = 0;
            }
            //向lottery加入lotteryrule
            for (var i = 0; i < lottery.length; i++) {
                lottery[i] = lottery[i].get({ chain: true });
                lottery[i]["number"] = 0;
                lottery[i]["lotteryrule"] = [];
                for (var r in lotteryrule) {
                    if (lotteryrule[r].lotteryid === lottery[i].lotteryid) {
                        lottery[i].lotteryrule.push(lotteryrule[r]);
                    }
                }
            }
            //更新抽奖进度
            getProgressById(pid).then(function (data) {
                //计算进度百分比
                var lsum = 0, psum = 0;
                for (var i = 0; i < lottery.length; i++) {
                    lottery[i].number = data[lottery[i].lotteryid].num;
                    lsum += lottery[i].amount;
                    psum += lottery[i].number;
                    for (var j = 0; j < lottery[i].lotteryrule.length; j++) {
                        lottery[i].lotteryrule[j].number = data[lottery[i].lotteryid][lottery[i].lotteryrule[j].ruleid].num;
                    }
                }
                project.progress = (psum / lsum).toFixed(4);
                callback(null, returnData.createData(project));
            }).catch(function () {
                callback(null, returnData.createData(project));
            });
        } else {
            callback(null, returnData.createData(project));
        }
        logger.info(project.name, '******完成获取单个红包活动数据!******');
    });
    //定义获取lottery奖项配置
    //定义错误处理
    proxy.on("err", function (err) {
        logger.error(project.name, '******获取红包活动数据时出错!******');
        callback(returnData.createError(returnData.errorType.unknow, err.message), null);
    });
    var reddb = db.models.prolottery;
    reddb.findAll({
        where: { projectid: pid, price: { $gt: 0 } },
        order: 'PRICE DESC,CONVERT(NAME USING GBK) ASC'
    }).then(function (lotterys) {
        proxy.emit("lottery", lotterys);
    }).catch(function (err) {
        proxy.emit("err", err);
    });
    //定义获取lotteryrule奖项中奖策略
    var ruledb = db.models.prolotteryrule;
    ruledb.findAll({
        where: { projectid: pid }
    }).then(function (rules) {
        proxy.emit("lotteryrule", rules);
    }).catch(function (err) {
        proxy.emit("err", err);
    })

}

exports.get = function (arg, callback) {
    var pid = arg.projectid;
    var proxy = new eventproxy();

    var reddb = db.models.prolottery;
    reddb.findAll({
        where: { projectid: pid, summoney: { $gt: 0 } },
        order: 'summoney DESC,CONVERT(NAME USING GBK) ASC'
    }).then(function (lotterys) {
        proxy.emit("lottery", lotterys);
    }).catch(function (err) {
        proxy.emit("err", err);
    });

    //获取lotteryrule奖项中奖策略
    var ruledb = db.models.prolotteryrule;
    ruledb.findAll({
        where: { projectid: pid }
    }).then(function (rules) {
        proxy.emit("lotteryrule", rules);
    }).catch(function (err) {
        proxy.emit("err", err);
    })

    proxy.all("lottery", "lotteryrule", function (lottery, lotteryrule) {

        //将lotteryrule转为json对象
        for (var i = 0; i < lotteryrule.length; i++) {
            lotteryrule[i] = lotteryrule[i].get({ chain: true });
            lotteryrule[i]["number"] = 0;
        }
        //向lottery加入lotteryrule
        for (var i = 0; i < lottery.length; i++) {
            lottery[i] = lottery[i].get({ chain: true });
            lottery[i]["number"] = 0;//初始化中奖数量
            lottery[i]["lotteryrule"] = [];
            for (var r in lotteryrule) {
                if (lotteryrule[r].lotteryid === lottery[i].lotteryid) {
                    lottery[i].lotteryrule.push(lotteryrule[r]);
                }
            }
        }

        var lotteryinfo = {
            enable: arg.lotteryState,
            config: {
                lotteryitems: lottery
            }
        };

        callback(null, returnData.createData(lotteryinfo));

    });

    proxy.on("nodata", function () {
        var errmsg = '未找到奖项类型为抽奖的配置信息';
        logger.error(projectid, '******' + errmsg + '*****');
        cb(returnData.createError(returnData.errorType.notexist, errmsg), null);
    });

    proxy.on("err", function (err) {
        var errmsg = '获取奖项类型为抽奖的配置信息出错';
        logger.error(projectid, '******' + errmsg + '******');
        callback(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
    });

}

function verifyParam(projectvo) {

    var rpnames = [];
    for (var i = 0; i < projectvo.config.lotteryitems.length; ++i) {
        //验证奖项名称是否重复,提出空格
        if (rpnames.indexOf(projectvo.config.lotteryitems[i].name.trim()) > -1) {
            return false;
        } else {
            rpnames.push(projectvo.config.lotteryitems[i].name.trim());
        }
        //验证奖项名称字符，必填且不能超10
        if (!projectvo.config.lotteryitems[i].name || (!!projectvo.config.lotteryitems[i].name && projectvo.config.lotteryitems[i].name.length > 10)) {
            return false;
        }

        //奖项个数，必填且为整数
        if (!projectvo.config.lotteryitems[i].prizecount || (!!projectvo.config.lotteryitems[i].prizecount && projectvo.config.lotteryitems[i].prizecount <= 0 && !tool.verifier.isInteger(projectvo.config.lotteryitems[i].prizecount))) {
            return false;
        }

        //预计中奖奖项个数，必填且为整数
        if (!projectvo.config.lotteryitems[i].amount || (!!projectvo.config.lotteryitems[i].amount && projectvo.config.lotteryitems[i].amount <= 0 && !tool.verifier.isInteger(projectvo.config.lotteryitems[i].amount))) {
            return false;
        }
    }

    return true;

}

/**
 * 更新红包活动数据
 * @param arg
 * @param callback
 */
exports.update = function (arg, user, cb) {

    var projectdb = db.models.project;
    var rpdb = db.models.prolottery;
    var ruledb = db.models.prolotteryrule;
    var thanksamount = 0;
    var projectvo = arg;
    projectvo.config.lotterysetting = [];
    //判断当前用户的entname是否为空
    if (!user.entname) {
        //向数据库获取数据
        var entdb = db.models.sysenterprise;
        entdb.findOne({ where: { entid: user.entid } }).then(function (d) {
            if (d) {
                user.entname = d.entname;
            } else {
                logger.error(user.entid, "企业信息查找失败！");
                cb(returnData.createError(returnData.errorType.unknow), null);
                return;
            }
        }).catch(function (err) {
            logger.error(user.entid, "企业信息查找出错！", err);
            cb(returnData.createError(returnData.errorType.unknow), null);
            return;
        });
    }

    db.sequelize.transaction(function (t) {

        //更新pjtdb的directory field
        function updateDirectory() {
            var deferred = Q.defer();
            var cpType = projectvo.directory === null ? cpType = '' : cpType = projectvo.directory;
            var arrayType = cpType.split(',');
            if (!projectvo.enable) {
                //不启用配置
                for (var i = 0; i < arrayType.length; i++) {
                    if (arrayType[i] == projectvo.type) {
                        arrayType.splice(i, 1);
                        break;
                    }
                }
            } else {
                if (-1 === arrayType.indexOf(projectvo.type)) {
                    arrayType.push(projectvo.type);
                }
            }

            var updateValue = arrayType.join(',');
            projectdb.update({ "directory": updateValue }, { where: { projectid: projectvo.projectid }, transaction: t }).then(function (data) {
                deferred.resolve(arg);
            }, function (err) {
                deferred.reject('奖项启用失败：' + err);
            });

            return deferred.promise;
        }

        //封装抽奖配置信息
        function warpConfig() {
            var deferred = Q.defer();
            if ("lotteryitems" in arg.config) {
                var _lottcount = 0;
                for (var i = 0; i < projectvo.config.lotteryitems.length; ++i) {
                    projectvo.config.lotteryitems[i].projectid = projectvo.projectid;
                    if (!projectvo.config.lotteryitems[i].lotteryid) projectvo.config.lotteryitems[i].lotteryid = uuid.v4();
                    //计算单个奖项金额与个数的小计金额
                    //projectvo.config.lotteryitems[i].summoney = parseInt(projectvo.config.lotteryitems[i].amount) * parseFloat(projectvo.config.lotteryitems[i].price);
                    _lottcount += parseInt(projectvo.config.lotteryitems[i].amount);
                    //判断是否包含lotteryrule规则
                    if ("lotteryrule" in projectvo.config.lotteryitems[i]) {
                        for (var j in projectvo.config.lotteryitems[i].lotteryrule) {
                            projectvo.config.lotteryitems[i].lotteryrule[j].lotteryid = projectvo.config.lotteryitems[i].lotteryid;
                            projectvo.config.lotteryitems[i].lotteryrule[j].projectid = projectvo.projectid;
                            //处理开始时间
                            projectvo.config.lotteryitems[i].lotteryrule[j].begtime = tool.begtime(projectvo.config.lotteryitems[i].lotteryrule[j].begtime);
                            //处理结束时间
                            projectvo.config.lotteryitems[i].lotteryrule[j].endtime = tool.endtime(projectvo.config.lotteryitems[i].lotteryrule[j].endtime);
                            if (!projectvo.config.lotteryitems[i].lotteryrule[j].ruleid) projectvo.config.lotteryitems[i].lotteryrule[j].ruleid = uuid.v4();
                            projectvo.config.lotterysetting.push(projectvo.config.lotteryitems[i].lotteryrule[j]);
                        }
                    }
                }
                thanksamount = _lottcount;
                deferred.resolve(true);
            }

            return deferred.promise;
        }

        //删除策略配置信息
        function delRule() {
            var deferred = Q.defer();
            ruledb.destroy(
                { where: { projectid: projectvo.projectid }, transaction: t }
            ).then(function (delrules) {
                deferred.resolve(true);
            }).catch(function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        }

        //删除抽奖配置信息
        function delLottery() {
            var deferred = Q.defer();
            rpdb.destroy(
                { where: { projectid: projectvo.projectid }, transaction: t }
            ).then(function (delrp) {
                deferred.resolve(true);
            }).catch(function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        }

        //插入抽奖配置
        function insertlottery() {

            var deferred = Q.defer();

            var ep = new eventproxy();
            var items = projectvo.config.lotteryitems;

            ep.after('mallfinished', items.length, function (info) {

                try {
                    info = info.map(function (pair) {
                        var lotteryitem = pair[0];
                        var pdt = pair[1];
                        if (pdt !== '') {
                            lotteryitem.mallproducttype = pdt.producttype;
                            lotteryitem.mallproductname = pdt.productname;
                            lotteryitem.price = pdt.price;
                            lotteryitem.summoney = pdt.cost * lotteryitem.prizecount * lotteryitem.amount;
                        }

                        return (lotteryitem);
                    });
                    rpdb.bulkCreate(info/*projectvo.config.lotteryitems*/, { transaction: t })
                        .then(function (rpresult) {
                            deferred.resolve(rpresult);//false mean is not sync lotterypond
                        }).catch(function (err) {
                            deferred.reject(err);
                        })
                } catch (err) {
                    deferred.reject(err);
                }

            });

            items.forEach(function (item) {
                var malldb = db.models.mallproduct;
                var pdtid = ''; item.mallproductid === null ? pdtid = '' : pdtid = item.mallproductid;
                malldb.findOne({
                    where: {
                        productid: pdtid
                    }
                }).then(function (res) {
                    var pdt = '';
                    if (res) {
                        pdt = res.get({ chain: true });
                    }
                    ep.emit('mallfinished', [item, pdt]);
                }).catch(function (err) {
                    deferred.reject(err);
                });
            });

            return deferred.promise;
        }

        function insertlotteryrule(synclottery) {
            var deferred = Q.defer();
            if (projectvo.config.lotterysetting.length > 0) {
                ruledb.bulkCreate(projectvo.config.lotterysetting, { transaction: t })
                    .then(function (rule) {
                        //调用同步奖池服务
                        if (synclottery) {
                            synRulePond(projectvo.projectid, function (err, d) { });
                        }
                        deferred.resolve(true);
                    }).catch(function (err) {
                        deferred.reject(err);
                    })
            } else {
                if (synclottery) {
                    synRulePond(projectvo.projectid, function (err, d) { });
                }
                deferred.resolve(true);
            }

            return deferred.promise;
        }

        function _excuteUpdate() {
            if (projectvo.state === vo.project.state.start) {
                //仅更新规则
                return updateDirectory()
                    .then(warpConfig)
                    .then(delRule).then(insertlotteryrule);
            } else {
                return updateDirectory()
                    .then(warpConfig)
                    .then(delRule)
                    .then(delLottery)
                    .then(insertlottery)
                    .then(insertlotteryrule);
            }
        }

        function callLotteryProcess() {
            var deferred = Q.defer();
            getProgressById(projectvo.projectid).then(function (pdata) {
                logger.info(config.systemUser, JSON.stringify(pdata));
                var _pass = true;
                var _lrules = {};
                for (var i = 0; i < projectvo.config.lotterysetting.length; i++) {
                    var _temprule = projectvo.config.lotterysetting[i];
                    //1、判定设置的策略数量是否大于当前奖项所剩余的数量，2、判定策略数量是否小于已中奖数量
                    if (_temprule.amount > (pdata[_temprule.lotteryid].amount - pdata[_temprule.lotteryid].num)) {
                        logger.error(projectid, "策略数量大于当前奖项剩余奖项数量,策略保存失败！");
                        _pass = false;
                        break;
                    }
                    if (!!pdata[_temprule.lotteryid][_temprule.ruleid] && _temprule.amount < pdata[_temprule.lotteryid][_temprule.ruleid].num) {
                        logger.error(projectid, "策略数量小于当前策略已中奖数量,策略保存失败！");
                        _pass = false;
                        break;
                    }
                    //将相同奖项下的策略设置数量处理
                    if (!_lrules[_temprule.lotteryid]) _lrules[_temprule.lotteryid] = 0;
                    _lrules[_temprule.lotteryid] += parseInt(_temprule.amount);
                }
                //判定统一奖项下的策略总数量是否超过奖项的剩余数量
                if (_pass) {
                    for (var key in _lrules) {
                        if (_lrules[key] > (pdata[key].amount - pdata[key].num)) {
                            logger.error(projectid, "策略总量大于当前奖项剩余奖项数量,策略保存失败！");
                            _pass = false;
                            break;
                        }
                    }
                }
                if (_pass) {
                    deferred.resolve(true);
                } else {
                    logger.error(config.systemUser, '策略保存失败');
                    deferred.reject(returnData.errorType.project.badparam);
                }
            }).catch(function (err) {
                logger.error(config.systemUser, '调用进度服务失败' + err.message);
                deferred.resolve(true);
            });

            return deferred.promise;
        }

        function error() {
            var deferred = Q.defer();
            deferred.reject(returnData.errorType.paraerror);
            return deferred.promise;

        }

        if (!projectvo.enable) {
            return updateDirectory();
        } else {
            //校验参数
            if (!verifyParam(projectvo)) {
                return error();
            }
            return callLotteryProcess().then(_excuteUpdate);
        }

    }).then(function (result) {
        cb(null, returnData.createData(result));
    }).catch(function (err) {
        cb(returnData.createError(returnData.errorType.unknow, err.message), null);
    });
}

exports.updateold = function (arg, user, callback) {
    logger.info(user.useraccount, '******开始更新单个红包活动数据!******');
    var proxy = new eventproxy();
    var projectdb = db.models.project;
    var rpdb = db.models.prolottery;
    var ruledb = db.models.prolotteryrule;
    var tran = null;
    var flag = false;
    var thanksamount = 0;
    var projectvo = arg;
    //logger.info(null,(moment(projectvo.begdate+"23:59:59")).format(config.dateformat));
    projectvo.entid = user.entid,
        projectvo.begdate = tool.begdate(projectvo.begdate),
        projectvo.enddate = tool.enddate(projectvo.enddate),
        projectvo.description = !projectvo.description ? "" : projectvo.description,
        projectvo.qramounts = !projectvo.qramounts ? 0 : projectvo.qramounts,
        projectvo.type = vo.project.type.redpacket,
        projectvo.percent = !arg.percent ? 0 : arg.percent,
        projectvo.projectid = !projectvo.projectid ? uuid() : projectvo.projectid,
        projectvo.state = vo.project.state.editing,
        projectvo.creater = user.userid,
        projectvo.entname = user.entname,
        projectvo.createtime = tool.date()
    projectvo.qrid = Date.now();
    if (!arg.config) {
        arg.config = {};
    }
    proxy.on("badparam", function (errCode) {
        logger.error(config.systemUser, errCode);
        callback(returnData.createError(errCode), null);
    });
    try {
        if ("rpitems" in arg.config) {
            projectvo.config["lotterysetting"] = [];
            var _lottcount = 0;
            for (var i in projectvo.config.rpitems) {
                projectvo.config.rpitems[i].projectid = projectvo.projectid;
                if (!projectvo.config.rpitems[i].lotteryid) projectvo.config.rpitems[i].lotteryid = uuid.v4();
                //计算单个奖项金额与个数的小计金额
                projectvo.config.rpitems[i].summoney = parseInt(projectvo.config.rpitems[i].amount) * parseFloat(projectvo.config.rpitems[i].price);
                _lottcount += parseInt(projectvo.config.rpitems[i].amount);
                //判断是否包含lotteryrule规则
                if ("lotteryrule" in projectvo.config.rpitems[i]) {
                    flag = true;
                    for (var j in projectvo.config.rpitems[i].lotteryrule) {
                        projectvo.config.rpitems[i].lotteryrule[j].lotteryid = projectvo.config.rpitems[i].lotteryid;
                        projectvo.config.rpitems[i].lotteryrule[j].projectid = projectvo.projectid;
                        //处理开始时间
                        projectvo.config.rpitems[i].lotteryrule[j].begtime = tool.begtime(projectvo.config.rpitems[i].lotteryrule[j].begtime);
                        //处理结束时间
                        projectvo.config.rpitems[i].lotteryrule[j].endtime = tool.endtime(projectvo.config.rpitems[i].lotteryrule[j].endtime);
                        if (!projectvo.config.rpitems[i].lotteryrule[j].ruleid) projectvo.config.rpitems[i].lotteryrule[j].ruleid = uuid.v4();
                        projectvo.config.lotterysetting.push(projectvo.config.rpitems[i].lotteryrule[j]);
                    }
                }
            }
            thanksamount = _lottcount;
            //根据中奖率及个数计算二维码总个数
            projectvo.qramounts = 0;
            var percent = parseFloat(projectvo.percent);
            if (percent > 0 && percent < 1 && _lottcount !== projectvo.qramounts) {
                var lotteryvo = {};
                lotteryvo = {
                    lotteryid: uuid.v4(),
                    projectid: projectvo.projectid,
                    name: '谢谢参与',
                    price: 0,
                    amount: thanksamount / percent - thanksamount,
                    summoney: 0
                }
                projectvo.config.rpitems.push(lotteryvo);
            }
            if (percent > 0 && percent <= 1) {
                projectvo.qramounts = _lottcount / percent;
            } else {
                proxy.emit("badparam", returnData.errorType.project.badparam);
            }
        }
    } catch (err) {
        proxy.emit("badparam", returnData.errorType.project.badparam);
    }
    //定义成功返回
    proxy.on("success", function (data) {
        tran.commit();
        if (typeof data !== "boolean") {
            delete data.config.lotterysetting;
            if ("qritems" in data.config) {
                callback(null, returnData.createData(data));
                logger.info(user.useraccount, '******完成更新单个抽奖活动数据!******');
            } else {
                delete data.config;
                callback(null, returnData.createData(data));
                logger.info(user.useraccount, '******完成更新单个抽奖活动数据!******');
            }
        } else {
            callback(null, returnData.createData(data));
            logger.info(user.useraccount, '******完成更新单个抽奖活动数据!******');
        }
    })
    //定义错误
    proxy.on("err", function (err, callback) {
        tran.rollback();
        logger.error(config.systemUser, err.message, err);
        callback(returnData.createError(returnData.errorType.unknow, err.message), null);
    });
    proxy.on("updatedata", function (data) {
        proxy.emit("deletedata", data.projectid, proxy.done("insertlottery"));
    });
    //删除数据
    proxy.on("deletedata", function (projectid, cb) {
        proxy.emit("deleterule", projectid, function (err, data) {
            cb(err, data);
        });
    });
    //删除红包中奖策略
    proxy.on("deleterule", function (projectid, cb) {
        ruledb.destroy(
            { where: { projectid: projectid }, transaction: tran }
        ).then(function (delrules) {
            proxy.emit("deletelottery", projectid, function (err, data) {
                cb(err, data);
            });
        }).catch(function (err) {
            proxy.emit("err", err, cb);
        });
    });
    //删除红包配置奖项
    proxy.on("deletelottery", function (projectid, cb) {
        rpdb.destroy(
            { where: { projectid: projectid }, transaction: tran }
        ).then(function (delrp) {
            cb(null, true);
        }).catch(function (err) {
            proxy.emit("err", err, cb);
        });
    });
    //插入红包配置数据
    proxy.on("insertlottery", function (result) {
        if (projectvo.config.rpitems) {
            rpdb.bulkCreate(projectvo.config.rpitems, { transaction: tran })
                .then(function (rpresult) {
                    proxy.emit("insertrule", result);
                }).catch(function (err) {
                    proxy.emit("err", err, callback);
                })
        } else {
            proxy.emit("insertrule", result);
        }
    });
    //插入中奖配置数据
    proxy.on("insertrule", function (result, synclottery) {
        function _emitsuccess() {
            //调用同步奖池服务
            if (!!synclottery) {
                synRulePond(projectvo.projectid, function (err, d) {
                });
            }
            proxy.emit("success", result);
        }

        if (projectvo.config.lotterysetting) {
            ruledb.bulkCreate(projectvo.config.lotterysetting, { transaction: tran })
                .then(function (rule) {
                    _emitsuccess();
                }).catch(function (err) {
                    proxy.emit("err", err, callback);
                })
        } else {
            _emitsuccess();
        }
    });
    //更新中奖规则数据
    proxy.on("updaterule", function (projectid, synclottery) {
        function _doruledata() {
            //先执行删除操作
            ruledb.destroy({ where: { projectid: projectid } }, { transaction: tran }).then(function (delrules) {
                //执行插入操作
                proxy.emit("insertrule", true, true);
            }).catch(function (err) {
                proxy.emit("err", err);
            });
        }
        //验证更新的数据与活动进度进行比较
        //调用活动进度服务
        getProgressById(projectid).then(function (pdata) {
            logger.info(config.systemUser, JSON.stringify(pdata));
            var _pass = true;
            var _lrules = {};
            for (var i = 0; i < projectvo.config.lotterysetting.length; i++) {
                var _temprule = projectvo.config.lotterysetting[i];
                //1、判定设置的策略数量是否大于当前奖项所剩余的数量，2、判定策略数量是否小于已中奖数量
                if (_temprule.amount > (pdata[_temprule.lotteryid].amount - pdata[_temprule.lotteryid].num)) {
                    logger.error(projectid, "策略数量大于当前奖项剩余奖项数量,策略保存失败！");
                    _pass = false;
                    break;
                }
                if (!!pdata[_temprule.lotteryid][_temprule.ruleid] && _temprule.amount < pdata[_temprule.lotteryid][_temprule.ruleid].num) {
                    logger.error(projectid, "策略数量小于当前策略已中奖数量,策略保存失败！");
                    _pass = false;
                    break;
                }
                //将相同奖项下的策略设置数量处理
                if (!_lrules[_temprule.lotteryid]) _lrules[_temprule.lotteryid] = 0;
                _lrules[_temprule.lotteryid] += parseInt(_temprule.amount);
            }
            //判定统一奖项下的策略总数量是否超过奖项的剩余数量
            if (_pass) {
                for (var key in _lrules) {
                    if (_lrules[key] > (pdata[key].amount - pdata[key].num)) {
                        logger.error(projectid, "策略总量大于当前奖项剩余奖项数量,策略保存失败！");
                        _pass = false;
                        break;
                    }
                }
            }
            if (_pass) {
                _doruledata();
            } else {
                proxy.emit("badparam", returnData.errorType.project.badparam);
            }
        }).catch(function (err) {
            _doruledata();
        });

    })
    function dataSuccess(data, created) {
        //表示新增
        if (created) {
            proxy.emit("insertlottery", projectvo);
        } else {
            //更新操作,不更新qrid
            delete projectvo.qrid;
            data = data.get({ chain: true });
            if (data.state === vo.project.state.editing) {
                projectvo.creater = data.creater;
                projectvo.createtime = data.createtime;
                projectvo.updater = user.useraccount;
                projectvo.updatetime = tool.date();
                projectdb.update(projectvo, {
                    where: { projectid: projectvo.projectid },
                    transaction: tran
                }).then(function () {
                    proxy.emit("updatedata", projectvo);
                }).catch(function (err) {
                    proxy.emit("err", err, callback);
                });
            } else if (data.state === vo.project.state.start && flag) {
                proxy.emit("updaterule", projectvo.projectid);
            } else {
                logger.info(data.projectid, '当前活动状态下只能更新中奖策略!');
                callback(returnData.createError(returnData.errorType.refuse, '当前活动状态下只能更新中奖策略'), null);
            }
        }
    }

    function _do() {
        //产生事务transaction
        db.sequelize.transaction().then(function (t) {
            tran = t;
            //why use findOrCreate?
            projectdb.findOrCreate({ where: { projectid: projectvo.projectid }, defaults: projectvo, transaction: tran })
                .spread(dataSuccess);
        }).catch(function (err) {
            logger.error(config.systemUser, err.message);
            callback(returnData.createError(returnData.errorType.unknow, err.message), null);
        });
    }

    //判断当前用户的entname是否为空
    if (!user.entname) {
        //向数据库获取数据
        var entdb = db.models.sysenterprise;
        entdb.findOne({ where: { entid: user.entid } }).then(function (d) {
            if (d) {
                user.entname = d.entname;
            } else {
                logger.error(user.entid, "企业信息查找失败！");
                callback(returnData.createError(returnData.errorType.unknow), null);
            }
            _do();
        }).catch(function (err) {
            logger.error(user.entid, "企业信息查找出错！", err);
            callback(returnData.createError(returnData.errorType.unknow), null);
        });
    } else {
        _do();
    }
}

/**
 * 删除红包活动数据
 * @param arg
 * @param callback
 */
exports.delete = function (project, callback) {
    var proxy = new eventproxy();
    var projectdb = db.models.project;
    var rpdb = db.models.prolottery;
    var ruledb = db.models.prolotteryrule;
    var tran = null;
    //删除红包中奖策略
    proxy.on("deleterule", function (data) {
        db.sequelize.transaction().then(function (t) {
            tran = t;
            ruledb.destroy(
                { where: { projectid: data.projectid } }, { transaction: tran }
            ).then(function (delrules) {
                proxy.emit("deletelottery", data);
            }).catch(function (err) {
                tran.rollback();
                logger.error(config.systemUser, err.message);
                callback(returnData.createError(returnData.errorType.unknow, err.message), null);
            });
        });
    });
    //删除红包配置奖项
    proxy.on("deletelottery", function (data) {
        rpdb.destroy(
            { where: { projectid: data.projectid } }, { transaction: tran }
        ).then(function (delrp) {
            //proxy.emit("deleteproject", data);
            tran.commit();
            callback(null, returnData.createData({ projectid: data.projectid }));
        }).catch(function (err) {
            tran.rollback();
            logger.error(config.systemUser, err.message);
            callback(returnData.createError(returnData.errorType.unknow, err.message), null);
        })
    });
    //删除红包活动
    proxy.on("deleteproject", function (data) {
        projectdb.destroy(
            { where: { projectid: data.projectid } }, { transaction: tran }
        ).then(function (delpro) {
            tran.commit();
            logger.info(data.name, '******删除单个红包活动数据成功!******');
            callback(null, returnData.createData({ projectid: data.projectid }));
        }).catch(function (err) {
            tran.rollback();
            logger.error(config.systemUser, err.message);
            callback(returnData.createError(returnData.errorType.unknow, err.message), null);
        })
    });
    //执行删除操作
    if (project) {
        if (project.state === vo.project.state.editing) {
            proxy.emit("deleterule", project);
        } else {
            if (project.state === vo.project.state.start) {
                callback(returnData.createError(returnData.errorType.refuse, "活动已开始，不能删除！"), null);
            } else {
                callback(returnData.createError(returnData.errorType.refuse, "活动已停止，不能删除！"), null);
            }
        }
    } else {
        logger.info(config.systemUser, '******未找到红包活动数据!******');
        callback(returnData.createError(returnData.errorType.notexist, "未找到红包活动数据"), null);
    }
};
/**
 * 中奖明细查询
 * @param arg={begtime:开始时间,endtime:结束时间,lotteryid:中奖等级(数组,空表示所有),areacode:地区号,state:状态,projectid:活动id,key:关键字}
 * @param cb
 */
exports.lotterydetails = function (arg, cb) {
    var usr = arg.currentuser;
    if (usr) {
        var recdb = db.models.prolotteryrecord;
        var details = JSON.parse(arg.details);
        var where = { entid: usr.entid };
        if (details.begtime && details.begtime) {
            where.rectime = { $gte: details.begtime };
        }
        if (details.endtime) {
            if (where.rectime) {
                var beg = where.rectime;
                where.rectime = { $and: [beg, { $lte: details.endtime }] };
            }
            else {
                where = { rectime: { $lte: details.endtime } };
            }
        }
        if (arg.begtime > arg.endtime) {
            cb(returnData.createError(returnData.errorType.paraerror, "开始时间不能大于结束时间!"));
            logger.error(arg.currentuser.useraccount, "开始时间不能大于结束时间!");
            return;
        }
        if (details.lotteryid) {
            where.lotteryid = details.lotteryid;
        }
        if (details.areacode && details.areacode != 0) {
            var areacodestr = details.areacode + '%';
            where.areacode = { $like: areacodestr };
        }
        if (details.projectid) {
            where.projectid = details.projectid;
        }
        if (details.state) {
            where.state = details.state;
        }
        if (details.keywords) {
            var keystr = '%' + details.keywords + '%';
            where.$or = [
                { nickname: { $like: keystr } },
                { phone: { $like: keystr } },
                //{province: {$like: keystr}},
                //{city: {$like: keystr}},
                { projectname: { $like: keystr } },
                { lotteryname: { $like: keystr } },
                { price: { $like: keystr } },
                //{rectime: {$like: keystr}},
                { state: { $like: keystr } }
            ]
        }
        var size = arg.size,
            page = arg.page,
            sort = arg.sort,
            orderStr = "",
            limtStr = 0,
            offsetStr = 0;
        var _sort = JSON.parse(sort);
        for (var i = 0; i < _sort.length; i++) {
            if (_sort[i].field == "address") {
                //CONVERT(province USING gb2312) ASC LIMIT 20;
                if (details.areacode == "0" || !details.areacode) {
                    orderStr += 'CONVERT(province USING gb2312)' + _sort[i].type + ",";
                } else {
                    orderStr += 'CONVERT(city USING gb2312)' + _sort[i].type + ",";
                }
            } else {
                orderStr += _sort[i].field + " " + _sort[i].type + ",";
                //orderStr += 'CONVERT(' + _sort[i].field + ' USING gb2312)' + " " + _sort[i].type + ",";
            }
        }
        orderStr = orderStr.replace(/,$/, "");
        if (size) {
            limtStr = size;
            if (page) {
                offsetStr = parseInt(page - 1) * 10;
            }
        }
        recdb.findAll({
            where: where,
            offset: offsetStr,
            limit: limtStr,
            order: orderStr
        }).then(
            function (result) {
                var data = {};
                data.count = result.length;
                var temp = [];
                for (var i = 0; i < data.count; i++) {
                    var state = "";
                    switch (result[i].state) {
                        case "normal":
                            state = "红包未发送";
                            break;
                        case "success":
                            state = "发送成功";
                            break;
                        case "refund":
                            state = "已退款";
                            break;
                        case "sending":
                            state = "正在发送中";
                            break;
                        case "sendfalse":
                            state = "发送失败";
                            break;
                        default:
                            state = "未知状态";
                            break;
                    }
                    temp.push({
                        "recid": result[i].recid,
                        "projectname": result[i].projectname || "不详",
                        "nickname": result[i].nickname || "不详",
                        "lotteryname": result[i].lotteryname || "不详",
                        "rectime": result[i].rectime || "不详",
                        "state": state,
                        "price": result[i].price || "不详",
                        "address": /*(result.rows[i].country || "不详") + "/" +*/ (result[i].province || "不详") + "/" + (result[i].city || "不详"),
                        "phone": result[i].phone || "不详"
                    })
                }
                logger.info(usr.userid, "查询中奖明细成功!");
                data.details = temp;
                cb(null, returnData.createData(data));
            },
            function (error) {
                logger.error(usr.userid, "查询中奖明细失败!");
                logger.error(usr.userid, error.stack);
                cb(returnData.createError(returnData.errorType.dataBaseError.unknow, error.message));
            }
            ).catch(function (err) {
                logger.error(usr.userid, "查询中奖明细失败!");
                logger.error(usr.userid, err.stack);
                cb(returnData.createError(returnData.errorType.unknow, err.message));
            });

    }
    else {
        logger.info(config.systemUser, '用户未登录,或会话已过期!');
        callback(returnData.createError(returnData.errorType.unlogin, "用户未登录,或会话已过期!"), null);
    }
};
/**
 * 手动派发红包领取失败的人的奖品
 * @param arg ｛custid: [派发id数组]｝
 * @param cb
 */
exports.distributeprize = function (arg, cb) {
    var usr = arg.currentuser;
    var idList = JSON.parse(arg.recid), failedId = [],successList = [];
    if (usr) {
        var ep = new eventproxy();
        var custDB = db.models.prolotteryrecord;
        custDB.findAll({
            where: { recid: { $in: idList } }
        }).then(
            function (result) {
                var len = result.length;
                ep.on("resendrp", function (d) {
                    wechat.paymanager.sendredpack(opts, function (err, res) {
                        if (err) {
                            logger.error(config.systemUser, '微信端红包发送失败,昵称：' + d.nickname + ',单号:' + opts.mch_billno);
                            logger.error(config.systemUser, JSON.stringify(err));
                            len--;
                            ep.emit("saveFailedId", d.nickname);

                        } else {
                            logger.info(config.systemUser, '微信端红包发送成功,单号:' + opts.mch_billno);
                            ep.emit("saveSuccessedId", d.recid);
                        }
                    });
                });
                logger.info(arg.currentuser.userid, '查询该派发用户数据成功！');
                for (var i = 0, len = result.length; i < len; i++) {
                    var opts = {
                        nick_name: result[i].nickname,
                        send_name: result[i].entname,
                        re_openid: result[i].openid,
                        total_amount: result[i].price * 100,
                        max_value: result[i].price * 100,
                        min_value: result[i].price * 100,
                        total_num: 1,
                        wishing: '恭喜您！',
                        client_ip: '127.0.0.1',
                        act_name: result[i].projectname,
                        remark: '备注:',
                        billno: result[i].recno
                    };
                    //ep.emit("resendrp", result[i]);
                    (function (opts, d) {
                        wechat.paymanager.sendredpack(opts, function (err, res) {
                            if (err) {
                                logger.error(config.systemUser, '微信端红包发送失败,昵称：' + d.nickname + ',单号:' + opts.billno);
                                logger.error(config.systemUser, JSON.stringify(err));
                                //len--;
                                ep.emit("saveFailedId", d.nickname);

                            } else {
                                logger.info(config.systemUser, '微信端红包发送成功,单号:' + opts.billno);
                                ep.emit("saveSuccessedId", d.recid);
                            }
                        });
                    })(opts, result[i])

                }
                ep.on('saveSuccessedId', function (res) {
                    successList.push(res);
                    ep.emit('finish', successList);
                });
                ep.on('saveFailedId', function (res) {
                    //failedId.push(res);
                    ep.emit('finish', successList);
                });
                ep.after('finish', len, function (successList) {
                    ep.emit("updateState", successList);
                });
                ep.on('updateState', function (successId) {
                    custDB.update({
                        state: "success"
                    }, {
                            where: {
                                recid: { $in: successId }
                            }
                        }).then(
                        function (result) {
                            logger.info(arg.currentuser.userid, '红包派发成功！');
                            cb(null, returnData.createData(true));
                        },
                        function (error) {
                            logger.error(arg.currentuser.userid, '红包发送成功，但更新lotteryrecord状态失败');
                            logger.error(arg.currentuser.userid, config.systemUser, error.stack);
                            var e = {
                                message: error.message,
                                failed: failedId
                            };
                            cb(returnData.createError(returnData.errorType.unknow, e), null);
                        }
                        );
                });
            },
            function (error) {
                logger.error(arg.currentuser.useraccount, '查询该派发用户数据失败！');
                logger.error(arg.currentuser.useraccount, config.systemUser, error.stack);
                var e = {
                    code: error.message,
                    tips: "查询该派发用户数据失败"
                };
                cb(returnData.createError(returnData.errorType.unknow, e), null);
            }
            );
    } else {
        logger.info(config.systemUser, '用户未登录,或会话已过期!');
        callback(returnData.createError(returnData.errorType.unlogin, "用户未登录,或会话已过期!"), null);
    }
};