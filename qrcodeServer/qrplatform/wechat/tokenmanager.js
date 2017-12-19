/**
 * Created by shuwei on 15/12/14.
 */
var request = require('request');
var moment = require('moment');
var logger = require('../common/logger');
var returnData = require('../common/returnData');
var tool = require('../common/tool');
var config = require('../../config');
var eventproxy = require('eventproxy');
var redis = require('../common/redis');


function gettoken(webtoken, cb) {
    logger.info(null, '重新请求token!');
    var path = config.services.wechattokenserver.url + config.services.wechattokenserver.interfaces.gettoken;
    request({
        url: path,
        method: 'post',
        form: {webtoken: webtoken}
    }, function (err, data) {
        if (err) {
            logger.error(config.systemUser, '读取token失败！');
            logger.error(config.systemUser, JSON.stringify(err));
            cb({code: returnData.errorType.unknow, message: err.message}, null);
        }
        else {
            data = JSON.parse(data.body);
            if (data.error) {
                logger.error(null, '读取token失败！' + data.error.message);
                cb(data.error, null);
            }
            else {
                data = data.data;
                logger.info(null, '获取token成功!');
                cb(null, data);
            }
        }
    });
};

function getsystoken(arg, cb) {
    var path = config.services.wechattokenserver.url + config.services.wechattokenserver.interfaces.getsystoken;
    var manual = arg.manual;

    request({
        url: path,
        method: 'post',
        json: true,
        body: {
            manual: manual
        }
    }, function (err, res) {
        if (err) {
            logger.error(config.systemUser, '读取普通access_token失败！');
            logger.error(config.systemUser, JSON.stringify(err));
            cb({code: returnData.errorType.unknow, message: err.message}, null);
        }
        else {
            if (!res.body) {
                logger.error(null, '读取普通access_token错误，可能是路径出错');
                cb(res.error, null);
            } else {
                var data = JSON.parse(res.body.data);
                if (data.error) {
                    logger.error(null, '读取普通access_token失败！' + data.error.message);
                    cb(data.error, null);
                }
                else {
                    logger.info(null, '获取普通access_tokentoken成功!');
                    cb(null, data.access_token);
                }
            }
        }
    });
}

function savewebtoken(webtoken, cb) {
    redis.set(config.wechat.webtokenkey, JSON.stringify(webtoken), function (err, reply) {
        if (err) {
            logger.error(config.systemUser, '存储webtoken失败！');
            logger.error(config.systemUser, JSON.stringify(err));
            if (cb) {
                cb(returndata.createError('unknow', err.message), null);
            }
        }
        else {
            redis.expire(config.wechat.webtokenkey, 86400);
            logger.info(config.systemUser, '存储webtoken成功！');
            if (cb) {
                cb(null, returndata.createData(JSON.parse(webtoken)));
            }
        }
    });

}

function getsign(url, cb) {
    logger.info(null, '请求js签名');
    var path = config.services.wechattokenserver.url + config.services.wechattokenserver.interfaces.getsign;
    request({
        url: path,
        method: 'post',
        form: {url: url}
    }, function (err, data) {
        if (err) {
            logger.error(config.systemUser, '请求js签名！');
            logger.error(config.systemUser, JSON.stringify(err));
            cb({code: returnData.errorType.unknow, message: err.message}, null);
        }
        else {
            data = JSON.parse(data.body);
            if (data.error) {
                logger.error(null, '请求js签名失败！' + data.error.message);
                cb(data.error, null);
            }
            else {
                data = data.data;
                logger.info(null, '获取请求js签名成功!');
                cb(null, data);
            }
        }
    });
};


exports.gettoken = gettoken;
exports.getsystoken = getsystoken;
exports.savewebtoken = savewebtoken;
exports.getsign = getsign;