/**
 * Created by Yatagaras on 2015/12/7.
 */


var db = require('../common/db');
var logger = require('../common/logger');
var returnData = require('../common/returnData');
var vo = require('../models/vomodels');
var tool = require('../common/tool');
var eventproxy = require('eventproxy');

var levels = ["country", "province", "city", "district", "address"];

/**
 * 查询子级城市列表
 * @param arg
 * @param callback
 */
function _query(arg, callback) {
    var citiesdb = db.models.cities;

    citiesdb.findAll({ where: { "parentCode": arg.parentCode || "0" } }).then(
        function (result) {
            logger.info('', "获取城市列表");
            callback(null, returnData.createData(result));
        }, function (error) {
            logger.error(config.systemUser, "应用程序错误，数据库查找失败");
            callback(returnData.createError(returnData.errorType.unknow, error.message), null);
        });
}

exports.query = _query;

/**
 * 根据COde获取详细城市列表（包括当前CODE城市、其同级城市以及祖先级城市及同级城市列表）
 * @param code 城市编号
 * @param details 详细
 * @param callback 回调
 */
function getDetailByCode(code, details, callback) {
    var citiesdb = db.models.cities;

    citiesdb.findOne({ where: { "code": code } }).then(
        function (result) {
            if (result && result.dataValues.level > 0) {
                var tmp = details[levels[result.dataValues.level]] = {
                    current: result.dataValues
                };
                _query({
                    parentCode: result.dataValues.parentCode
                }, function (error, d) {
                    tmp["list"] = d.data;
                    getDetailByCode(result.dataValues.parentCode, details, callback);
                });
            } else {
                if (result) details[levels[result.dataValues.level]] = {
                    current: result.dataValues
                };
                logger.info('', "获取城市详细信息（包含省、市、区及同级列表）成功");
                callback(null, returnData.createData(details));
            }
        }, function (error) {
            logger.error(config.systemUser, "应用程序错误，数据库查找失败");
            callback(returnData.createError(returnData.errorType.unknow, error.message), null);
        });
}

/**
 * 根据条件获取详细城市列表（包括当前要查找的城市、其同级城市以及祖先级城市及同级城市列表）
 * @param code 城市信息
 * @param details 详细
 * @param callback 回调
 */
function getDetailByInfo(info, details, callback) {
    var citiesdb = db.models.cities,
        key = info.province + (info.city ? "%" : "") + info.city + (info.district ? "%" : "") + info.district;

    key = "%" + key + "_";

    citiesdb.findOne({ where: { "full": { "$like": key } } }).then(
        function (result) {
            logger.info('', "开始获取城市详细信息（包含省、市、区及同级列表）");
            if (result)
                getDetailByCode(result.code, details, callback);
            else {
                logger.info('', "获取城市详细信息（包含省、市、区及同级列表）成功");
                callback(null, returnData.createData(details));
            }
        }, function (error) {
            logger.error(config.systemUser, "应用程序错误，数据库查找失败");
            callback(returnData.createError(returnData.errorType.unknow, error.message), null);
        });
}

/**
 * 查询当前城市详细
 * @param arg 根据城市名称或Code进行查询
 * @param callback
 */
exports.detail = function (arg, callback) {
    var key = arg.keyword, isCode = true;
    try {
        key = JSON.parse(key);
        isCode = typeof key != "object" || tool.isEmptyObject(key);
    } catch (e) {
    }
    if (key)
        isCode ? getDetailByCode(key, {}, callback) : getDetailByInfo(key, {}, callback);
    else {
        logger.error(config.systemUser, "查询指定城市详细信息失败，参数不正确");
        callback(returnData.createError(returnData.errorType.paraerror, "查询指定城市详细信息失败，参数不正确"), null);
    }
};

/**
 * 根据城市信息获取Code
 * @param arg
 * @param callback
 */
exports.getCode = function (arg, callback) {
    var _fullstr = "";
    if (!!arg.province) _fullstr = arg.province;
    if (!!arg.city) {
        if (_fullstr.indexOf('香港') > -1 || _fullstr.indexOf('澳门') > -1 || _fullstr.indexOf('台湾') > -1) {
            _fullstr += ("%");
        } else {
            _fullstr += ("%/" + arg.city);
        }
    }
    else {
        if (arg.province.indexOf('北京') != -1 || arg.province.indexOf('天津') != -1 || arg.province.indexOf('上海') != -1 || arg.province.indexOf('重庆') != -1) {
            _fullstr += ("%/" + "市辖区");
        }
    }
    if (!!arg.district)
        _fullstr += ("%/" + arg.district);

    if (_fullstr) {
        var citiesdb = db.models.cities;
        citiesdb.findOne({ where: { "full": { "$like": _fullstr } } }).then(
            function (result) {
                logger.info('', "开始获取城市Code");
                callback(null, returnData.createData(result));
                logger.info('', "获取城市Code成功");
            }, function (error) {
                logger.error(config.systemUser, "应用程序错误，数据库查找失败");
                callback(returnData.createError(returnData.errorType.unknow, error.message), null);
            });
    } else
        callback(null, returnData.createData(null));
};

/**
 * 获取指定Code的城市信息
 * @param arg
 * @param callback
 */
exports.get = function (arg, callback) {
    var citiesdb = db.models.cities;

    citiesdb.findOne({ where: { "code": arg.code } }).then(
        function (result) {
            logger.info('', "获取指定城市信息");
            callback(null, returnData.createData(result));
        }, function (error) {
            logger.error(config.systemUser, "应用程序错误，数据库查找失败");
            callback(returnData.createError(returnData.errorType.unknow, error.message), null);
        });
};