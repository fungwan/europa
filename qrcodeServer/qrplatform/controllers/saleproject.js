/**
 * Created by FUNGWAN on 2016/8/11.
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


/**
 * 获取活动列表
 * @param req
 * @param res
 * @param next
 */
exports.list = function (arg, cb) {
    logger.info(arg.currentuser.useraccount, '******开始获取满减活动数据列表!******');
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
 * 获取奖项类型为满减的配置信息
 * @param project
 * @param cb
 */
exports.get = function (arg, cb) {

    var proxy = new eventproxy();

    var sadb = db.models.prosale;
    sadb.findOne({
        where: { projectid: arg.projectid }
    }).then(function (data) {
        if (data) {
            var saleinfo = {
                enable:arg.lotteryState,
                config: {
                    saleitems: data.get({ chain: true })
                }
            };
            cb(null, returnData.createData(saleinfo));
        } else {
            proxy.emit('nodata');
        }
    }).catch(function (err) {
        proxy.on('err', err);
    })
    proxy.on("err", function (err) {
        var errmsg = '获取奖项类型为满减的配置信息出错';
        logger.error(arg.currentuser.useraccount, '******' + errmsg + '*****');
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
    });
    proxy.on("nodata", function () {
        var errmsg = '未找到奖项类型为满减的配置信息';
        logger.error(arg.currentuser.useraccount, '******' + errmsg + '*****');
        cb(returnData.createError(returnData.errorType.notexist, errmsg), null);
    });
};

function verifyParam(projectvo) {

    var rpnames = [];

    for (var i in projectvo.config.saleitems) {
        //奖项个数，必填且为整数
        if (!projectvo.config.saleitems['condition'] || 
        (!!projectvo.config.saleitems['condition']  
        && !tool.verifier.isInteger(projectvo.config.saleitems['condition']) 
        && parseInt(projectvo.config.saleitems['condition']) <= 0)) {
            return false;
        }

        if (!projectvo.config.saleitems['redpacket'] || 
        (!!projectvo.config.saleitems['redpacket']  
        && !tool.verifier.isInteger(projectvo.config.saleitems['redpacket']) 
        && parseInt(projectvo.config.saleitems['redpacket']) <= 0)) {
            return false;
        }
    }

    return true;

}

/**
 * 更新满减活动数据
 * @param req
 * @param res
 * @param next
 */
exports.update = function (sa, currentuser, cb) {
    var projectdb = db.models.project;
    var qaInstance = sa;
    db.sequelize.transaction(function (t) {

        //更新pjtdb的directory field
        function updateDirectory() {
            var deferred = Q.defer();
            var cpType = qaInstance.directory === null ? cpType = '':cpType=qaInstance.directory;
            var arrayType = cpType.split(',');
            if (!qaInstance.enable) {
                //不启用配置
                for (var i = 0; i < arrayType.length; i++) {
                    if (arrayType[i] == qaInstance.type) {
                        arrayType.splice(i, 1);
                        break;
                    }
                }
            } else {
                if (-1 === arrayType.indexOf(qaInstance.type)) {
                    arrayType.push(qaInstance.type);
                }
            }

            var updateValue = arrayType.join(',');
            projectdb.update({ "directory": updateValue }, { where: { projectid: qaInstance.projectid }, transaction: t }).then(function (data) {
                deferred.resolve(sa);
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

            var qaConfig = qaInstance.config.saleitems;
            qaConfig.projectid = qaInstance.projectid;
            if (!qaConfig.saleid) qaConfig.saleid = uuid.v4();
            var deferred = Q.defer();
            var qadb = db.models.prosale;
            qadb.create(qaConfig, { transaction: t })
                .then(function (result) {
                    deferred.resolve(sa);
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
            //校验参数
            if (!verifyParam(sa)) {
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

/**
 * 根据projectid删除除project表的关联数据
 * @param id
 * @param tran
 * @returns {*|promise}
 */
function deleteProjectById(id, tran) {
    var deferred = Q.defer();
    var proxy = new eventproxy();
    var sadb = db.models.prosale;
    sadb.destroy({
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
 * 删除满减活动数据
 * @param project
 * @param cb
 */
exports.delete = function (project, cb) {
    logger.info("", '******开始删除满减活动数据!******');
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
                //proxy.emit("delete", project.projectid);
                tran.commit();
                cb(null, returnData.createData({ projectid: project.projectid }));
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
    logger.info(project.name, '******删除单个满减活动数据成功!******');
}

