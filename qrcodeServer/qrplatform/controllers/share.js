var uuid = require('node-uuid');
var sequelize = require("sequelize");
var moment = require("moment");
var Q = require("q");
var _ = require("lodash");

var returnData = require("../common/returnData");
var db = require("../common/db");
var logger = require("../common/logger");
var serverConfig = require("../../config");
var menumanager = require("../wechat/menumanager");

/*
 * 模型关系
 * Project < 1 - 1 > ProjectShareConfig < 1 - n > ShareRecord < 1 - n > ShareHelpRecord
 * ShareRecord < n - 1 > Customer
 * ShareHelpRecord < n - 1 > Customer
 */

var STATE_START = "start",
    STATE_EDITING = "editing";

var service = {};
/*
 * 删除对象上的私有属性
 */
service.removePrivateProperty = function (obj) {
    _.map(_.keys(obj), function (key) {
        if (key[0] == "_") delete obj[key];
    });
    return obj;
};
/*
 * 异常处理方法
 */
service.errorHandler = function (error, cb, defaultMessage) {
    var message = defaultMessage || "未知错误";
        uncaught = true,
        errorMessageMap = {
            "INVALIDATE": "参数校验失败",
            "PROJECTINVALID": "未找到对应活动或者活动状态不符合",
            "CONFIGNOTFOUND": "未找到分享配置",
            "OVERMAXPOINT": "超过积分上限",
            "SHARERECORDNOTFOUND": "未找到分享记录",
            "CANTHELPSELF": "不能助力自己的分享",
            "HAVEHELPALREADY": "已经进行了助力操作",
            "CUSTNOTFOUND": "未找到对应用户"
        };

    if (errorMessageMap[error.message]) {
        message = errorMessageMap[error.message];
        uncaught = false;
    }

    var loggerMessage = uncaught ? error.stack : message,
        returnCode = uncaught ? "unknown" : error.message;
    logger.error(loggerMessage);
    cb(returnData.createError(returnCode, message));
}
/* 
 * 判断是否是有效的活动
 */
service.isValidProject = function (projectid, state) {
    if (!projectid) {
        var deferred = Q.defer();
        deferred.resolve(true);
        return deferred.promise;
    } 

    var projectDb = db.models.project;
    return projectDb.findById(projectid).then(function (project) {
        if (project && (!state || project.state == state)) {
            return true;
        } else {
            throw new Error("PROJECTINVALID");
        }
    });
};  

/*
 * 获取用户当前积分，包含分享和助力积分
 * 当update为true时，返回的值皆为0
 */
service.getCurrentPoint = function (configid, custid, update) {
    if (update) {
        var deferred = Q.defer();
        deferred.resolve({
            shareCurrentPoint: 0,
            helpCurrentPoint: 0
        });
        return deferred.promise;
    }

    var configDb = db.models.projectshareconfig,
        shareRecordDb = db.models.sharerecord,
        helpRecordDb = db.models.sharehelprecord;
    
    return Q.all([
        helpRecordDb.sum("share_point", {
            include: [
                {
                    model: shareRecordDb,
                    where: {
                        share_custid: custid,
                        config_id: configid
                    }
                }
            ]
        }),
        helpRecordDb.sum("help_point", {
            include: [
                {
                    model: shareRecordDb,
                    where: {
                        config_id: configid
                    }
                }
            ],
            where: {
                help_custid: custid
            }
        })
    ]).then(function (results) {
        return {
            shareCurrentPoint: results[0] || 0,
            helpCurrentPoint: results[1] || 0
        }
    });
};

/*
 * 获取分享记录，如果不存在时，将会创建分享记录
 * 当generate为false时，直接返回{}
 */
service.generateShareRecord = function (configid, custid, generate) {
    if (!generate) {
        var deferred = Q.defer();
        deferred.resolve({});
        return deferred.promise;
    }

    var shareRecordDb = db.models.sharerecord;
    return shareRecordDb.findOne({
        where: {
            config_id: configid,
            share_custid: custid
        }
    }).then(function (record) {
        if (record) return record;

        return shareRecordDb.create({
            id: uuid.v4(),
            config_id: configid,
            share_custid: custid
        });
    });
};

/*
 * 通过分享记录id获取分享配置
 */
service.getConfigByRecord = function (recordid, custid) {
    var configDb = db.models.projectshareconfig,
        shareRecordDb = db.models.sharerecord,
        helpRecordDb = db.models.sharehelprecord;

    var shareRecord,
        shareConfig;

    return shareRecordDb.findById(recordid, { include: [configDb] })
    .then(function (record) {
        if (!record) throw new Error("SHARERECORDNOTFOUND");
        if (!record.project_share_config) throw new Error("CONFIGNOTFOUND");

        shareRecord = record, shareConfig = record.project_share_config;
        return service.isValidProject(shareConfig.project_id, STATE_START);
    }).then(function () {
        return Q.all([
            service.getCurrentPoint(shareConfig.id, custid),
            helpRecordDb.findOne({
                where: {
                    share_record_id: shareRecord.id,
                    help_custid: custid
                }
            })
        ]);
    }).then(function (results) {
        var currentPoint = results[0],
            helpRecord = results[1];

        return {
            enable: shareConfig.enable,
            sharePoint: shareConfig.share_point,
            shareMaxPoint: shareConfig.share_max_point,
            helpPoint: shareConfig.help_point,
            helpMaxPoint: shareConfig.help_max_point,
            shareCurrentPoint: currentPoint.shareCurrentPoint,
            helpCurrentPoint: currentPoint.helpCurrentPoint,
            recordid: recordid,
            isSelf: shareRecord.share_custid === custid,
            hasHelp: !!helpRecord,
            _currentRecord: shareRecord,
            _config: shareConfig
        }
    });
};

/*
 * 通过projectid获取分享配置
 */
service.getConfigByProject = function (projectid, custid, update, generate) {
    var configDb = db.models.projectshareconfig,
        state = update ? undefined : STATE_START;

    var shareConfig;

    return service.isValidProject(projectid, state).then(function () {
        return configDb.findOne({
            where: {
                project_id: projectid
            }
        });
    }).then(function (config) {
        if (!config) throw new Error("CONFIGNOTFOUND");

        shareConfig = config;
        return Q.all([
            service.getCurrentPoint(config.id, custid, update),
            service.generateShareRecord(config.id, custid, generate)
        ]);
    }).then(function (results) {
        var currentPoint = results[0],
            shareRecord = results[1];

        var data = {
            enable: shareConfig.enable,
            sharePoint: shareConfig.share_point,
            shareMaxPoint: shareConfig.share_max_point,
            helpPoint: shareConfig.help_point,
            helpMaxPoint: shareConfig.help_max_point,
            shareCurrentPoint: currentPoint.shareCurrentPoint,
            helpCurrentPoint: currentPoint.helpCurrentPoint,
            recordid: shareRecord.id,
            _currentRecord: shareRecord,
            _config: shareConfig
        };        
        return data;
    });
};

/*
 * 更新config
 */
service.updateConfig = function (config) {
    var configDb = db.models.projectshareconfig;

    return service.isValidProject(config.projectid, STATE_EDITING)
    .then(function () {
        return configDb.findOne({
            where: { 
                project_id: config.projectid
            }
        })
    }).then(function (foundConfig) {
        var data = {
            project_id: config.projectid,
            enable: config.enable,
            share_point: config.sharePoint,
            share_max_point: config.shareMaxPoint,
            help_point: config.helpPoint,
            help_max_point: config.helpMaxPoint
        };
        if (foundConfig) { 
            return foundConfig.update(data); 
        } else {
            data.id = uuid.v4();
            return configDb.create(data);
        }
    });
};

/*
 * 更新微信菜单
 */
service.updateWxMenu = function (config) {
    var menuooption = {
        name: '分享送积分',
        type: 'view',
        url: serverConfig.host + serverConfig.share.shareUrl,
        updatetype: 0,
        index: ''
    };
    menuooption.updatetype = (config.enable) ? 1 : 0;
    menumanager._updatemenulist(menuoption, function(res) {
        if (res.type == 'error') {
            logger.error(null, res.msg); 
        } else if (res.type == 'success') {
            logger.info(null, res.msg);
        }
    });
};

/*
 * 『助力』操作
 */
service.help = function (recordid, custid) {
    /*
     * 能否『助力』
     * enable == true
     * isSelf == false
     * hasHelp == false
     * helpCurrentPoint < helpMaxPoint
     */
    var custextendDb = db.models.custextend,
        pointDb = db.models.propointdetail,
        helpRecordDb = db.models.sharehelprecord;

    var now = moment().format("YYYY-MM-DD HH:mm:ss"),
        shareRecord,
        shareConfig,
        sharerCurrentPoint,
        sharer,
        helper,
        transaction;

    return service.getConfigByRecord(recordid, custid).then(function (config) {
        if (!config.enable) throw new Error("SHAREDISABLED");
        if (config.isSelf) throw new Error("CANTHELPSELF");
        if (config.hasHelp) throw new Error("HAVEHELPALREADY");
        if (config.helpCurrentPoint >= config.helpMaxPoint) throw new Error("OVERHELPMAXPOINT");

        shareConfig = config;
        shareRecord = config._currentRecord;
        return Q.all([
            service.getCurrentPoint(shareConfig._config.id, shareRecord.share_custid),
            custextendDb.findById(shareRecord.share_custid),
            custextendDb.findById(custid)
        ]);
    }).then(function (results) {
        sharerCurrentPoint = results[0];
        sharer = results[1];
        helper = results[2];

        if (!sharer || !helper) throw new Error("CUSTNOTFOUND");

        return db.sequelize.transaction();
    }).then(function(t) {
        transaction = t;
        var promises = [],
            helpRecord = {
                id: uuid.v4(),
                share_record_id: shareRecord.id,
                help_custid: custid,
                help_point: shareConfig.helpPoint,
                share_point: 0
            },
            pointRecord = {
                pointchannel: 'share',
                pointtime: now
            };

        promises.push(helper.update({
            point: (helper.point || 0) + shareConfig.helpPoint
        }));

        var helpPointRecord = _.merge(_.cloneDeep(pointRecord), {
            detailid: uuid.v4(),
            custid: custid,
            point: shareConfig.helpPoint,
            changemode: 'help',
            remark: '活动分享助力'
        });
        promises.push(pointDb.create(helpPointRecord));

        if (sharerCurrentPoint.shareCurrentPoint < shareConfig.shareMaxPoint) {
            helpRecord.share_point = shareConfig.sharePoint;
            promises.push(sharer.update({
                point: (sharer.point || 0) + shareConfig.sharePoint
            }));
            var sharePointRecord = _.merge(_.cloneDeep(pointRecord), {
                detailid: uuid.v4(),
                custid: shareRecord.share_custid,
                point: shareConfig.sharePoint,
                changemode: 'share',
                remark: '活动分享'
            });
            promises.push(pointDb.create(sharePointRecord));
        }

        promises.push(helpRecordDb.create(helpRecord));

        return Q.all(promises);
    }).then(function() {
        return transaction.commit();
    }).catch(function(error) {
        try {
            if (transaction) transaction.rollback();
        } catch (e) {};
        throw error;
    });
};



var controller = {};
/*
 * 获取配置及相关信息
 * projectid: 活动id
 * update: true / false 是否用于更新配置，用于Web端获取活动配置，
 *         默认为false，当recordid为空时生效
 * recordid: 分享记录id
 * generate: 是否返回分享记录id，当没有分享记录时，将会创建分享记录
 * 
 * return: {}
 * * enable: true ? false 
 * * sharePoint: 单次分享积分
 * * shareMaxPoint: 分享积分上限
 * * helpPoint: 单次助力积分
 * * helpMaxPoint: 助力积分上限
 * shareCurrentPoint: 当前活动分享获得的积分，当update为false时返回
 * helpCurrentPoint: 当前活动助力获得的积分，当update为false返回
 * hasHelp: 是否已『助力』，当recordid为空时返回
 * isSelf: 是否是本人分享，当recordid为空时返回
 * recordid: 生成的分享记录id，当generate为true时返回
 */
controller.getConfig = function (arg, cb) {
    var projectid = arg.projectid || null,
        update = arg.update || false,
        recordid = arg.recordid || null,
        generate = arg.generate || false,
        custid = arg.currentuser.custid,
        promise;

    if (recordid) {
        promise = service.getConfigByRecord(recordid, custid);
    } else {
        promise = service.getConfigByProject(projectid, custid, update, generate);
    }

    promise.then(function (config) {
        config = service.removePrivateProperty(config);
        return cb(null, returnData.createData(config));
    }).catch(function (error) {
        return service.errorHandler(error, cb, "配置获取失败");
    });
};

/*
 * 更新配置并更新微信公众号菜单
 * projectid: 活动id
 * enable: 是否开启
 * sharePoint: 单次分享积分
 * shareMaxPoint: 分享积分上限
 * helpPoint: 单次助力积分
 * helpMaxPoint: 助力积分上限
 * 
 * return: true
 */
controller.updateConfig = function (arg, cb) {
    var config = {
        projectid: arg.projectid || null,
        enable: arg.enable,
        sharePoint: arg.sharePoint,
        shareMaxPoint: arg.shareMaxPoint,
        helpPoint: arg.helpPoint,
        helpMaxPoint: arg.helpMaxPoint
    };

    if (config.enable == false) {
        sharePoint = shareMaxPoint = helpPoint = helpMaxPoint = 0;
    } else if (!_.inRange(config.sharePoint, 1, 101) || 
        !_.inRange(config.shareMaxPoint, config.sharePoint, 10001) ||
        !_.inRange(config.helpPoint, 1, 101) || 
        !_.inRange(config.helpMaxPoint, config.helpPoint, 10001)) {
        return service.errorHandler(new Error("INVALIDATE"), cb, "参数校验失败");
    }

    service.updateConfig(config).then(function () {
        if (!config.projectid) {
            try { service.updateWxMenu(config); }
            catch (e) { logger.error(e) }
        }
        return cb(null, returnData.createData(true));
    }).catch(function (error) {
        return service.errorHandler(error, cb, "更新配置失败");
    });
};

/*
 * 助力操作
 * recordid: 分享id
 *
 * return: true
 */
controller.help = function (arg, cb) {
    var recordid = arg.recordid,
        custid = arg.currentuser.custid;

    service.help(recordid, custid).then(function (result) {
        return cb(null, returnData.createData(true));
    }).catch(function (error) {
        return service.errorHandler(error, cb, "助力失败");
    });
};

module.exports = {
    getConfig: controller.getConfig,
    updateConfig: controller.updateConfig,
    help: controller.help
};