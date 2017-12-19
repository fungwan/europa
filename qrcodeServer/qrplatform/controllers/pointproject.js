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

/**
 * 获取奖项类型为积分送的配置信息
 * @param req
 * @param res
 * @param next
 */
exports.get = function (arg, cb) {

    var proxy = new eventproxy();

    var pdb = db.models.propoint;
    pdb.findOne({
        where: { projectid: arg.projectid }
    }).then(function (data) {
        if (data) {
            var pointinfo = {
                enable: arg.lotteryState,
                config: {
                    pointitems: data.get({ chain: true })
                }
            };
            cb(null, returnData.createData(pointinfo));
        } else {
            proxy.emit('nodata');
        }
    }).catch(function (err) {
        proxy.emit("err", err);
    });

    proxy.on("err", function (err) {
        var errmsg = '获取奖项类型为积分的配置信息出错';
        logger.error(arg.currentuser.useraccount, '******' + errmsg + '*****');
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
    });
    proxy.on("nodata", function () {
        var errmsg = '未找到奖项类型为积分的配置信息';
        logger.error(arg.currentuser.useraccount, '******' + errmsg + '*****');
        cb(returnData.createError(returnData.errorType.notexist, errmsg), null);
    });
}
/**
 * 根据projectid删除除project表的关联数据
 * @param id
 * @param tran
 * @returns {*|promise}
 */
function deleteProjectById(id, tran) {
    var deferred = Q.defer();
    var proxy = new eventproxy();
    proxy.on("err", function (err) {
        logger.error(config.systemUser, '******删除活动数据时出错!******');
        deferred.reject(err);
    });
    proxy.on("point", function (projectid) {
        var pdb = db.models.propoint;
        pdb.destroy({
            where: { projectid: projectid }
            , transaction: tran
        }
        ).then(function (suc) {
            deferred.resolve(true);
        }).catch(function (err) {
            proxy.emit("err", err);
        });
    });
    proxy.emit("point", id);
    return deferred.promise;
}

function verifyParam(project) {

    //积分量
    try{

        if(project.config.pointitems.pointtype === '0'){
            if (!project.config.pointitems.point ||
                (!!project.config.pointitems.point
                && !tool.verifier.isInteger(project.config.pointitems.point)
                && (project.config.pointitems.point <= 0))) {
                return false;
            }
        }

    }catch (err){

        logger.error('systemuser',err.message);
        return false;
    }

    return true;

}

/**
 * 更新积分活动数据
 * @param req
 * @param res
 * @param next
 */
exports.update = function (point, user, cb) {
    var projectdb = db.models.project;
    var qaInstance = point;
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
            } else {
                if (-1 === arrayType.indexOf(qaInstance.type)) {
                    arrayType.push(qaInstance.type);
                }
            }

            var updateValue = arrayType.join(',');
            projectdb.update({ "directory": updateValue }, { where: { projectid: qaInstance.projectid }, transaction: t }).then(function (data) {
                deferred.resolve(point);
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

            var qaConfig = qaInstance.config.pointitems;
            qaConfig.projectid = qaInstance.projectid;
            if (!qaConfig.pointid) qaConfig.pointid = uuid.v4();
            var deferred = Q.defer();
            var qadb = db.models.propoint;
            qadb.create(qaConfig, { transaction: t })
                .then(function (result) {
                    deferred.resolve(point);
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
            if (!verifyParam(point)) {
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
}

exports.updateold = function (arg, user, callback) {
    logger.info(user.useraccount, '******开始获取单个积分活动数据!******');
    var tran = null;
    var proxy = new eventproxy();
    var projectdb = db.models.project;
    var projectvo = arg;
    projectvo.entid = user.entid,
        projectvo.begdate = tool.begdate(projectvo.begdate),
        projectvo.enddate = tool.enddate(projectvo.enddate),
        projectvo.description = !projectvo.description ? "" : projectvo.description,
        projectvo.qramounts = !projectvo.qramounts ? 0 : projectvo.qramounts,
        projectvo.type = vo.project.type.point,
        projectvo.percent = !projectvo.percent ? 0 : projectvo.percent,
        projectvo.projectid = !projectvo.projectid ? uuid() : projectvo.projectid,
        projectvo.state = vo.project.state.editing,
        projectvo.creater = user.userid,
        projectvo.entname = user.entname,
        projectvo.createtime = tool.date();
    projectvo.qrid = Date.now();
    if (!arg.config) {
        arg.config = {};
    }
    if ("pointitems" in arg.config) {
        var _p = arg.config.pointitems;
        var _point = vo.point.createnew();
        _point.projectid = projectvo.projectid;
        _point.pointid = uuid.v4();
        _point.point = _p;
        arg.config.pointitems = [];
        arg.config.pointitems.push(_point);
        //for (var i in projectvo.config.pointitems) {
        //    projectvo.config.pointitems[i].projectid = projectvo.projectid;
        //    if (!projectvo.config.pointitems[i].pointid) projectvo.config.pointitems[i].pointid = uuid.v4();
        //}
    }
    //定义成功返回
    proxy.on("success", function (data) {
        tran.commit();
        if (typeof data !== "boolean") {
            if ("pointitems" in data.config) {
                if (data.config.pointitems && data.config.pointitems.length > 0) data.config.pointitems = data.config.pointitems[0].point;
                callback(null, returnData.createData(data));
                logger.info(user.useraccount, '******完成更新单个积分活动数据!******');
            } else {
                delete data.config;
                callback(null, returnData.createData(data));
                logger.info(user.useraccount, '******完成更新单个积分活动数据!******');
            }
        } else {
            callback(null, returnData.createData(data));
            logger.info(user.useraccount, '******完成更新单个积分活动数据!******');
        }
    })
    //定义错误
    proxy.on("err", function (err, callback) {
        tran.rollback();
        logger.error(config.systemUser, err.message);
        callback(returnData.createError(returnData.errorType.unknow, err.message), null);
    });
    //插入积分规则
    proxy.on("insertpoint", function (result) {
        var pdb = db.models.propoint;
        if (projectvo.config.pointitems) {
            pdb.bulkCreate(projectvo.config.pointitems, { transaction: tran })
                .then(function (rpresult) {
                    proxy.emit("success", result);
                }).catch(function (err) {
                    proxy.emit("err", err, callback);
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
                    proxy.emit("insertpoint", projectvo);
                } else {
                    //表示更新操作
                    delete projectvo.qrid;
                    data = data.get({ chain: true });
                    if (data.state === vo.project.state.editing) {
                        projectvo.creater = data.creater;
                        projectvo.createtime = data.createtime;
                        projectvo.updater = user.useraccount;
                        projectvo.updatetime = tool.date();
                        projectdb.update(projectvo, { where: { projectid: projectvo.projectid } }, { transaction: tran }).then(function () {
                            deleteProjectById(data.projectid, tran).then(function (suc) {
                                proxy.emit("insertpoint", suc)
                            }, function (err) {
                                proxy.emit("err", err);
                            })
                        });
                    } else {
                        logger.info(data.projectid, '活动已启动不能更新!');
                        callback(returnData.createError(returnData.errorType.refuse, '活动已启动不能更新'), null);
                    }
                }
            });
    }).catch(function (err) {
        logger.error(config.systemUser, err.message);
        callback(returnData.createError(returnData.errorType.unknow, err.message), null);
    });
    logger.info(user.useraccount, '******完成获取单个积分活动数据!******');
}
/**
 * 删除积分活动数据
 * @param req
 * @param res
 * @param next
 */
exports.delete = function (data, callback) {
    logger.info(config.systemUser, '******删除单个积分活动数据!******');
    //执行对数据库的操作，更新活动状态未已删除
    var proxy = new eventproxy();
    var tran = null;
    //定义成功返回
    proxy.on("delete", function (projectid) {
        var pdb = db.models.project;
        pdb.destroy(
            { where: { projectid: projectid }, transaction: tran }
        ).then(function (delpro) {
            tran.commit();
            logger.info(data.name, '******删除单个活动数据成功!******');
            callback(null, returnData.createData({ projectid: projectid }));
        }).catch(function (err) {
            proxy.emit("err", err);
        });
    });
    //定义错误
    proxy.on("err", function (err, callback) {
        tran.rollback();
        logger.error(config.systemUser, err.message);
        callback(returnData.createError(returnData.errorType.unknow, err.message), null);
    });
    if (data.state === vo.project.state.editing) {
        db.sequelize.transaction().then(function (t) {
            tran = t;
            deleteProjectById(data.projectid, tran).then(function (suc) {
                //proxy.emit("delete", data.projectid);
                tran.commit();
                callback(null, returnData.createData({ projectid: project.projectid }));
            }, function (err) {
                proxy.emit("err", err);
            });
        }).catch(function (err) {
            logger.error(config.systemUser, err.message);
            callback(returnData.createError(returnData.errorType.unknow, err.message), null);
        });
    } else {
        if (data.state === vo.project.state.start) {
            callback(returnData.createError(returnData.errorType.refuse, "活动已开始，不能删除！"), null);
        } else {
            callback(returnData.createError(returnData.errorType.refuse, "活动已停止，不能删除！"), null);
        }
    }
    logger.info(data.name, '******删除单个积分活动数据成功!******');
};
/**
 * 积分明细查询
 * @param arg={begtime:开始时间,endtime:结束时间,,areacode:地区号,projectid:活动id,keywords:关键字,minPoint: 最小积分,maxPoint: 最大积分}
 * @param cb
 */
exports.pointdetails = function (arg, cb) {
    var usr = arg.currentuser;
    if (usr) {
        var recdb = db.models.propointrecord;
        var where = { entid: usr.entid };
        if (arg.begtime) {
            where.pointtime = { $gte: arg.begtime };
        } else {

        }
        if (arg.endtime) {
            if (where.pointtime) {
                var beg = where.pointtime;
                where.pointtime = { $and: [beg, { $lte: arg.endtime }] };
            }
            else {
                where = { pointtime: { $lte: arg.endtime } };
            }
        }
        if (arg.begtime > arg.endtime) {
            cb(returnData.createError(returnData.errorType.paraerror, "开始时间不能大于结束时间"));
            logger.error(arg.currentuser.useraccount, "开始时间不能大于结束时间");
            return;
        }
        if (arg.minPoint) {
            where.point = { $gte: arg.minPoint };
        }
        if (arg.maxPoint && arg.maxPoint != 0) {
            if (where.point) {
                var min = where.point;
                where.point = { $and: [min, { $lte: arg.maxPoint }] };
            } else {
                where = { point: { $lte: arg.maxPoint } };
            }
        }
        if (arg.areacode && arg.areacode != 0) {
            var areacodestr = arg.areacode + '%';
            where.areacode = { $like: areacodestr };
        }
        if (arg.projectid) {
            where.projectid = arg.projectid;
        }
        if (arg.keywords) {
            var keystr = '%' + arg.keywords + '%';
            where.$or = [
                { nickname: { $like: keystr } },
                { point: { $like: keystr } },
                { projectname: { $like: keystr } }
                //{pointtime: {$like: keystr}},
                //{province: {$like: keystr}},
                //{city: {$like: keystr}}
            ]
        }
        var size = arg.size,
            page = arg.page,
            sort = arg.sort,
            orderStr = "",
            limtStr = 0,
            offsetStr = 0;
        if (sort) {
            var _sort = JSON.parse(sort);
            for (var i = 0; i < _sort.length; i++) {
                if (_sort[i].field == "address") {
                    if (arg.areacode == "0" || !arg.areacode) {
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
        }
        if (size) {
            limtStr = size;
            if (page) {
                offsetStr = parseInt(page - 1) * 10;
            }
        }
        recdb.findAndCountAll({
            where: where,
            offset: offsetStr,
            limit: limtStr,
            order: orderStr
        }).then(
            function (result) {
                var data = {};
                data.count = result.rows.length;
                var temp = [];
                for (var i = 0; i < data.count; i++) {
                    temp.push({
                        "recid": result.rows[i].recid,
                        "projectname": result.rows[i].projectname || "不详",
                        "nickname": result.rows[i].nickname || "不详",
                        "point": result.rows[i].point || "不详",
                        "pointtime": result.rows[i].pointtime || "不详",
                        "address": /*(result.rows[i].country || "不详") + "/" +*/ (result.rows[i].province || "不详") + "/" + (result.rows[i].city || "不详")
                        //"areacode": "3201",
                    })
                }
                data.details = temp;
                logger.info(usr.userid, "查询积分明细成功!");
                cb(null, returnData.createData(data));
            },
            function (error) {
                logger.error(usr.userid, "查询积分明细失败!");
                logger.error(usr.userid, error.stack);
                cb(returnData.createError(returnData.errorType.dataBaseError.unknow, error.message));
            }
            ).catch(function (err) {
                logger.error(usr.userid, "查询积分明细失败!");
                logger.error(usr.userid, err.stack);
                cb(returnData.createError(returnData.errorType.unknow, err.message));
            });

    }
    else {
        logger.info(config.systemUser, '用户未登录,或会话已过期!');
        callback(returnData.createError(returnData.errorType.unlogin, "用户未登录,或会话已过期!"), null);
    }
};