/**
 * Created by taoj on 2015/11/30.
 */
//加载第三方模块
var uuid = require('node-uuid');
var moment = require('moment');
var eventproxy = require('eventproxy');
var Q = require("q");
//加载项目内部模块
var db = require('../common/db');
var logger = require('../common/logger');
var returnData = require('../common/returnData');
var vo = require('../models/vomodels');
var tool = require('../common/tool');
var config = require('../../config');
//去除问卷中名字和答案的标签
deltag = function (str) {
    if (str) {
        var reg = new RegExp("<[^<]*>", "gi");
        return str.replace(reg, "");
    } else {
        return;
    }
}

/*Array.prototype.removeByValue = function (val) {

}*/

/**
 * 获取活动列表
 * @param req
 * @param res
 * @param next
 */
exports.list = function (arg, cb) {
    logger.info(arg.currentuser.useraccount, '******开始获取调查问卷活动数据列表!******');
    if (!arg.currentuser) {
        cb(returnData.createError(returnData.errorType.unknow, "当前用户未登录"));
        return;
    }
    var query = arg.query;
    if (!query)
        query = {};
    query.entid = arg.currentuser.entid;
    if (arg.begdate && arg.enddate)
        query.begdate = { $gt: arg.begdate, $lt: arg.enddate };
    if (arg.state)
        query.state = arg.state;
    if (arg.key)
        query.$or = [{ name: { $like: '%' + arg.key + '%' } }, { description: { $like: '%' + arg.key + '%' } }];

    var projectdb = db.models.project;
    projectdb.findAndCountAll({
        where: query,
        offset: projectdb.pageOffset(arg.page, arg.size),
        limit: arg.size
    }).then(function (result) {
        cb(null, result);
    }).catch(function (err) {
        logger.error(arg.currentuser.useraccount, err.message);
        cb(returnData.createError(returnData.errorType.unknow, err.message), null);
    });
};
/**
 * 获取奖项类型为调查问卷的配置信息
 * @param project
 * @param cb
 */
exports.get = function (arg, cb) {

    var proxy = new eventproxy();
    var qadb = db.models.proquestion;
    qadb.findAll({
        where: { projectid: arg.projectid },
        attributes: [
            'qaid',
            'projectid',
            'name',
            'answer',
            'qatype',
            'number'
        ],
        order: 'number asc'
    }).then(function (data) {
        if (data.length > 0) {
            var qainfo = {
                enable: arg.lotteryState,
                config: {
                    qaitems: data//data.get({ chain: true })
                }
            };
            cb(null, returnData.createData(qainfo));
        } else {
            proxy.emit('nodata');
        }
    }).catch(function (err) {
        proxy.on('err', err);
    })

    proxy.on("err", function (err) {
        var errmsg = '获取奖项类型为问卷的配置信息出错';
        logger.error(arg.currentuser.useraccount, '******' + errmsg + '******');
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
    });

    proxy.on("nodata", function () {
        var errmsg = '未找到奖项类型为问卷的配置信息';
        logger.error(arg.currentuser.useraccount, '******' + errmsg + '*****');
        cb(returnData.createError(returnData.errorType.notexist, errmsg), null);
    });
};

function verifyParam(project) {

    for (var i in project.config.qaitems) {
        if (project.config.qaitems[i].answer)
            project.config.qaitems[i].answer = project.config.qaitems[i].answer.trim();
        if (project.config.qaitems[i].name)
            project.config.qaitems[i].name = project.config.qaitems[i].name.trim();
        //验证问卷编号，验证为uuid
        if (project.config.qaitems[i].qaid && !tool.verifier.isUUID(project.config.qaitems[i].qaid)) {
            return false;
        }
        if ((project.config.qaitems[i].number && project.config.qaitems[i].number > 100) || (project.config.qaitems[i].number && project.config.qaitems[i].number < 1)) {
            return false;
        }
        //验证问卷名称字符，必填且不能超50
        if (!project.config.qaitems[i].name || (!!project.config.qaitems[i].name && project.config.qaitems[i].name.length > 50)) {
            return false;
        }
        //验证问卷答案字符，必填且不能超500
        if (!project.config.qaitems[i].answer || (!!project.config.qaitems[i].answer && project.config.qaitems[i].answer.length > 500)) {
            return false;
        }
        //问卷类型
        if (!project.config.qaitems[i].qatype || (!!project.config.qaitems[i].qatype && !tool.verifier.isInteger(project.config.qaitems[i].qatype))) {
            return false;
        }
        //问卷序号
        if (!project.config.qaitems[i].number || (!!project.config.qaitems[i].number && !tool.verifier.isInteger(project.config.qaitems[i].number))) {
            return false;
        }
    }

    return true;

}

/**
 * 更新调查问卷活动数据
 * @param req
 * @param res
 * @param next
 */
exports.update = function (qa, currentuser, cb) {

    var projectdb = db.models.project;
    var qaInstance = qa;
    db.sequelize.transaction(function (t) {

        //更新pjtdb的directory field
        function updateDirectory() {
            var deferred = Q.defer();
            var cpType = qaInstance.directory === null ? cpType = '' : cpType = qaInstance.directory;
            var arrayType = cpType.split(',');
            if (!qaInstance.enable) {
                //不启用配置
                for (var i = 0; i < arrayType.length; i++) {
                    if (arrayType[i] == qaInstance.type) {
                        arrayType.splice(i, 1);
                        break;
                    }
                }
                /*arrayType.removeByValue(qaInstance.type);*/
            } else {
                if (-1 === arrayType.indexOf(qaInstance.type)) {
                    arrayType.push(qaInstance.type);
                }
            }

            var updateValue = arrayType.join(',');
            projectdb.update({ "directory": updateValue }, { where: { projectid: qaInstance.projectid }, transaction: t }).then(function (data) {
                deferred.resolve(qa);
            }, function (err) {
                deferred.reject('奖项启用失败：' + err);
            });

            return deferred.promise;
        }

        function warpConfig() {

        }

        //删除原有的奖项配置信息
        function del() {
            return deleteProjectById(qaInstance.projectid, t);
        }

        //插入规则
        function updateConfig() {

            var qaConfig = qaInstance.config.qaitems;
            for (var i = 0; i < qaConfig.length; ++i) {
                qaConfig[i].projectid = qaInstance.projectid;
                qaConfig[i].name = deltag(qaInstance.config.qaitems[i].name);
                qaConfig[i].answer = deltag(qaInstance.config.qaitems[i].answer);
                if (!qaConfig[i].qaid) qaConfig[i].qaid = uuid.v4();
            }
            var deferred = Q.defer();
            var qadb = db.models.proquestion;
            qadb.bulkCreate(qaConfig, { transaction: t })
                .then(function (result) {
                    deferred.resolve(qa);
                }).catch(function (err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function error(){
            var deferred = Q.defer();
            deferred.reject(returnData.errorType.paraerror);
            return deferred.promise;

        }

        if (!qaInstance.enable) {
            return updateDirectory();
        } else {
            if (!verifyParam(qa)) {
                return error();
            }
            return updateDirectory().then(del).then(updateConfig);
        }

    }).then(function (result) {
        //auto commit  
        cb(null, returnData.createData(result));
    }).catch(function (err) {
        //auto rollback  
        cb(returnData.createError(returnData.errorType.unknow, err), null);
    });
};

exports.updateold = function (project, currentuser, cb) {
    logger.info(currentuser.useraccount, '******开始更新单个调查问卷活动数据!******');
    if (!currentuser) {
        cb(returnData.createError(returnData.errorType.unknow, "当前用户未登录"));
        return;
    }
    var tran = null;
    var proxy = new eventproxy();
    var projectdb = db.models.project;
    var projectvo = project;
    projectvo.entid = currentuser.entid,
        projectvo.begdate = tool.begdate(projectvo.begdate),
        projectvo.enddate = tool.enddate(projectvo.enddate),
        projectvo.description = !projectvo.description ? "" : projectvo.description,
        projectvo.qramounts = 1;//问卷活动二维码固定一个//!projectvo.qramounts ? 0 : projectvo.qramounts,
    projectvo.type = vo.project.type.question,
        projectvo.percent = !projectvo.percent ? 0 : projectvo.percent,
        projectvo.projectid = !projectvo.projectid ? uuid() : projectvo.projectid,
        projectvo.state = vo.project.state.editing,
        projectvo.creater = currentuser.userid,
        projectvo.createtime = tool.date();
    projectvo.entname = currentuser.entname;
    projectvo.qrid = Date.now();
    if (!project.config) {
        project.config = {};
    }
    if ("qaitems" in project.config) {
        for (var i in projectvo.config.qaitems) {
            projectvo.config.qaitems[i].projectid = projectvo.projectid;
            projectvo.config.qaitems[i].name = deltag(projectvo.config.qaitems[i].name);
            projectvo.config.qaitems[i].answer = deltag(projectvo.config.qaitems[i].answer);
            if (!projectvo.config.qaitems[i].qaid) projectvo.config.qaitems[i].qaid = uuid.v4();
        }
    }

    //定义成功返回
    proxy.on("success", function (data) {
        tran.commit();
        if (typeof data !== "boolean") {
            if ("qaitems" in data.config) {
                cb(null, returnData.createData(data));
                logger.info(currentuser.useraccount, '******完成更新单个问卷活动数据!******');
            } else {
                delete data.config;
                cb(null, returnData.createData(data));
                logger.info(currentuser.useraccount, '******完成更新单个问卷活动数据!******');
            }
        } else {
            cb(null, returnData.createData(data));
            logger.info(currentuser.useraccount, '******完成更新单个问卷活动数据!******');
        }
    });

    //定义错误
    proxy.on("err", function (err) {
        tran.rollback();
        logger.error(config.systemUser, err.message);
        cb(returnData.createError(returnData.errorType.unknow, err.message), null);
    });

    //插入问卷规则
    proxy.on("insertquestion", function (result) {
        var qadb = db.models.proquestion;
        if (projectvo.config.qaitems) {
            qadb.bulkCreate(projectvo.config.qaitems, { transaction: tran })
                .then(function (rpresult) {
                    proxy.emit("success", result);
                }).catch(function (err) {
                    proxy.emit("err", err);
                })
        } else {
            proxy.emit("success", result);
        }
    });

    db.sequelize.transaction().then(function (t) {
        tran = t;
        projectdb.findOrCreate({ where: { projectid: projectvo.projectid }, defaults: projectvo, transaction: tran })
            .spread(function (data, created) {
                //表示新增
                if (created) {
                    proxy.emit("insertquestion", projectvo);
                } else {
                    //表示更新操作
                    delete projectvo.qrid;
                    data = data.get({ chain: true });
                    if (data.state === vo.project.state.editing) {
                        projectvo.creater = data.creater;
                        projectvo.createtime = data.createtime;
                        projectvo.updater = currentuser.useraccount;
                        projectvo.updatetime = tool.date();
                        projectdb.update(projectvo, { where: { projectid: projectvo.projectid }, transaction: tran }).then(function () {
                            deleteProjectById(data.projectid, tran).then(function (suc) {
                                proxy.emit("insertquestion", suc)
                            }, function (err) {
                                proxy.emit("err", err);
                            })
                        });
                    } else {
                        logger.info(data.projectid, '活动已启动不能更新!');
                        cb(returnData.createError(returnData.errorType.refuse, '活动已启动不能更新'), null);
                    }
                }
            });
    }).catch(function (err) {
        logger.error(config.systemUser, err.message);
        cb(returnData.createError(returnData.errorType.unknow, err.message), null);
    });
};
/**
 * 根据projectid删除除project表的关联数据
 * @param id
 * @param tran
 * @returns {*|promise}
 */
function deleteProjectById(id, tran) {
    var deferred = Q.defer();
    var proxy = new eventproxy();
    var qadb = db.models.proquestion;
    qadb.destroy({
        where: { projectid: id }, transaction: tran
    }
    ).then(function (suc) {
        deferred.resolve(true);
    }).catch(function (err) {
        proxy.emit("err", err);
    });
    proxy.on("err", function (err) {
        logger.error(config.systemUser, '******删除活动数据时出错!******');
        deferred.reject(err);
    });
    return deferred.promise;
}
/**
 * 删除调查问卷活动数据
 * @param project
 * @param cb
 */
exports.delete = function (project, cb) {
    logger.info("", '******开始删除调查问卷活动数据!******');
    var proxy = new eventproxy();
    var id = project.projectid;
    var tran = null;
    //定义成功返回
    proxy.on("delete", function (projectid) {

        var pdb = db.models.project;
        pdb.destroy(
            { where: { projectid: projectid }, transaction: tran }
        ).then(function (data) {
            tran.commit();
            logger.info(data.name, '******删除单个活动数据成功!******');
            cb(null, returnData.createData({ projectid: projectid }));
        }).catch(function (err) {
            proxy.emit("err", err);
        });
    });
    proxy.on("err", function (err) {
        tran.rollback();
        logger.error(project.name, '******获取问卷数据时出错!******', err);
        cb(returnData.createError(returnData.errorType.unknow, err.message), null);
    });
    if (project.state === vo.project.state.editing) {
        db.sequelize.transaction().then(function (t) {
            tran = t;
            deleteProjectById(project.projectid, tran).then(function (suc) {
                tran.commit();
                cb(null, returnData.createData({ projectid: project.projectid }));
                //proxy.emit("delete", project.projectid);
            }, function (err) {
                proxy.emit("err", err);
            });
        }).catch(function (err) {
            cb(returnData.createError(returnData.errorType.unknow), null);
        });
    } else {
        if (project.state === vo.project.state.start) {
            cb(returnData.createError(returnData.errorType.refuse, "活动已开始，不能删除！"), null);
        } else {
            cb(returnData.createError(returnData.errorType.refuse, "活动已停止，不能删除！"), null);
        }
    }
    logger.info(project.name, '******删除单个问卷活动数据成功!******');
}
