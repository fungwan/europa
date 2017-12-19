/**
 * Created by Administrator on 2016/2/17.
 */
var Q = require('q');
var redis = require('redis');
var config = require('../../config');
var logger = require('../common/logger');
var Alidayu = require('alidayujs');
/**
 * 生成随机数字
 */
function randnum(len) {
    var Num = '';
    for (var i = 0; i < len; i++) {
        Num += Math.floor(Math.random() * 10);
    }
    return Num;
}
/**
 * 发送短信
 * @param phone
 * @returns {d.promise|Function|*|promise|promise.promise|jQuery.promise}
 */
function sendsms(phone) {
    var defer = Q.defer();
    var valcode = randnum(4);
    //采用阿里短信通道发送
    var alidayu = new Alidayu(config.sms.config);
    var options = config.sms.options;
    options.rec_num = phone;
    options.sms_param.code = valcode;
    //发送短信
    alidayu.sms(options, function (err, result) {
        logger.info(null, '验证码返回:' + err);
        err = JSON.parse(err);

        if(err.alibaba_aliqin_fc_sms_num_send_response && err.alibaba_aliqin_fc_sms_num_send_response.result && err.alibaba_aliqin_fc_sms_num_send_response.result.success &&err.alibaba_aliqin_fc_sms_num_send_response.result.success==true) {
            logger.info(null, '验证码发送成功:' + phone + '---' + valcode);
            var client = redis.createClient(config.redis);
            client.auth(config.redis.auth);
            client.set(phone, valcode);
            client.expire(phone, config.sms.timeout);
        }else{
            logger.error(null,JSON.stringify(err));
        }
        defer.resolve(true);
    });
    return defer.promise;
}
/**
 * 从redis获取验证码
 * @param phone
 * @returns {d.promise|Function|*|promise|promise.promise|jQuery.promise}
 */
function getcodefromredis(phone) {
    var defer = Q.defer();
    var client = redis.createClient(config.redis);
    client.auth(config.redis.auth);
    client.get(phone, function (err, reply) {
        if (reply) {
            logger.info(null, '读取验证码成功:' + phone + '---' + reply.toString());
            defer.resolve(reply.toString());
        } else {
            defer.reject(err);
        }
    });
    return defer.promise;
}
/**
 * 验证输入的验证码与redis中做比较
 * @param phone
 * @param code
 * @returns {d.promise|Function|*|promise|promise.promise|jQuery.promise}
 */
function valsms(phone, code) {
    var defer = Q.defer();
    getcodefromredis(phone).then(function (data) {
        if (data === code) {
            logger.info(null, '验证码验证成功:' + phone + '---' + code);
            var client = redis.createClient(config.redis);
            client.auth(config.redis.auth);
            client.del(phone);
            defer.resolve();
        } else {
            logger.info(null,code+"验证失败");
            defer.reject(new Error("验证失败"));
        }
    }).catch(function (err) {
        defer.reject(err == null ? new Error("未找到验证码") : err);
    });
    return defer.promise;
}

/**
 * 发送重置支付密码短信
 */
function sendResetSms (phone) {
    var defer = Q.defer(),
        newPwd = randnum(6),
        alidayu = new Alidayu(config.sms.config),
        options = config.sms.resetPwdOptions;
        options.rec_num = phone;
        options.sms_param.code = newPwd;

    alidayu.sms(options, function (err, result) {
        err = JSON.parse(err);
        if(err.alibaba_aliqin_fc_sms_num_send_response && err.alibaba_aliqin_fc_sms_num_send_response.result && err.alibaba_aliqin_fc_sms_num_send_response.result.success &&err.alibaba_aliqin_fc_sms_num_send_response.result.success==true) {
            logger.info(null, '重置密码发送成功:' + phone + '---' + newPwd);
            defer.resolve(newPwd);
        }else {
            defer.reject(err);
            logger.error(null, JSON.stringify(err));
        }
    });
    return defer.promise;
}

/**
 * 发送重要信息变更验证码
 * @param phone
 * @param fieldName 变更的信息描述
 * @returns {*}
 */
function sendSetInfosms(phone,fieldName) {
    var defer = Q.defer();
    var valcode = randnum(4);
    //采用阿里短信通道发送
    var alidayu = new Alidayu(config.sms.config);
    var options = config.sms.resetInfoOptions;
    options.rec_num = phone;
    options.sms_param.code = valcode;
    options.sms_param.product = fieldName;
    //发送短信
    alidayu.sms(options, function (err, result) {
        logger.info(null, '验证码返回:' + err);
        err = JSON.parse(err);

        if(err.alibaba_aliqin_fc_sms_num_send_response && err.alibaba_aliqin_fc_sms_num_send_response.result && err.alibaba_aliqin_fc_sms_num_send_response.result.success &&err.alibaba_aliqin_fc_sms_num_send_response.result.success==true) {
            logger.info(null, '验证码发送成功:' + phone + '---' + valcode);
            var client = redis.createClient(config.redis);
            client.auth(config.redis.auth);
            client.set(phone, valcode);
            client.expire(phone, config.sms.timeout);
        }else{
            logger.error(null,JSON.stringify(err));
        }
        defer.resolve(true);
    });
    return defer.promise;
}

/**
 * 发送优惠券短信
 */
function sendCashCouponSms (phone,couponUrl) {
    var defer = Q.defer(),
        alidayu = new Alidayu(config.sms.config),
        options = config.sms.resetPwdOptions;
        options.rec_num = phone;
        options.sms_param.code = couponUrl;

    alidayu.sms(options, function (err, result) {
        err = JSON.parse(err);
        if(err.alibaba_aliqin_fc_sms_num_send_response && err.alibaba_aliqin_fc_sms_num_send_response.result && err.alibaba_aliqin_fc_sms_num_send_response.result.success &&err.alibaba_aliqin_fc_sms_num_send_response.result.success==true) {
            logger.info(null, '优惠券发送成功:' + phone + '---' + couponUrl);
            defer.resolve(true);
        }else {
            defer.reject(err);
            logger.error(null, JSON.stringify(err));
        }
    });
    return defer.promise;
}

exports.sendsms = sendsms;
exports.valsms = valsms;
exports.sendResetSms = sendResetSms;
exports.sendSetInfosms=sendSetInfosms;
exports.sendCashCouponSms=sendCashCouponSms;
