/**
 * Created by shuwei on 15/12/18.
 */

var xml2js = require('xml2js');
var request = require('request');
var logger = require('../common/logger');
var returnData = require('../common/returnData');
var tool = require('../common/tool');
var config = require('../../config');
var wei = require('./wechatcore');
var md5=require('MD5');

/**
 * 将传入参数按微信要求规则重新组装参数,(排序)
 * @param opts
 * @returns {redpack}
 * @constructor
 */
function Redpack(opts) {

    var redpack = function (opts) {
        this._paymentOptions = opts || {};
    };
    _mix(redpack.prototype, {
        send: function (opts, fn) {
            var params = _mix({}, this._paymentOptions, opts);
            sendRedpack(params, fn);
        }
    });

    return new redpack(opts);
};

/**
 * 发送红包,注意调用该方法的webapi应保证安全
 * @param opts
 * @param cb
 */
function sendRedpack(opts, cb) {
    opts.mch_id = config.wechat.mch_id;
    opts.partner_key = config.wechat.partner_key;
    opts.pfx = config.wechat.pfx;
    opts.wxappid = config.wechat.appId;
    opts.mch_billno = config.wechat.mch_id + opts.billno;

    var SEND_REDPACK_URL = config.services.webchatmch.url + config.services.webchatmch.interfaces.sendredpack;
    var PFX = opts.pfx;

    opts.nonce_str = _generateNonceString(32);
    opts.max_value = opts.min_value = opts.total_amount;
    if (opts.total_amount >= 200 * 100) {
        // 金额超过200元，传递 scene_id 参数，值为 PRODUCT_2 - 抽奖
        opts.scene_id = "PRODUCT_2"; 
    }

    delete opts.billno;

    opts = _sign(opts);

    var builder = new xml2js.Builder();
    var xml = builder.buildObject({xml: opts});

    logger.info(null,'开始向openid:' + opts.re_openid+'发送红包.单号:' + opts.mch_billno);
    request({
            url: SEND_REDPACK_URL,
            method: 'POST',
            body: xml,
            agentOptions: {
                pfx: PFX,
                passphrase: opts.mch_id
            }
        },
        function (err, response, body) {
            wei.xmlcreateCallback(err, response, body,function(errorinfo,datainfo){
                cb(errorinfo,datainfo);
            });
        }
    );
}

/**
 * 签名算法
 * @param obj
 * @returns {*}
 * @private
 */
var _sign = function (obj) {

    var PARTNER_KEY = obj.partner_key || "";

    ['key', 'pfx', 'partner_key', 'sign'].forEach(function (k) {
        delete obj[k];
    });

    var querystring = Object.keys(obj).filter(function (key) {
            return obj[key] !== undefined && obj[key] !== '';
        }).sort().map(function (key) {
            return key + '=' + obj[key];
        }).join('&') + "&key=" + PARTNER_KEY;

    obj.sign = md5(querystring).toUpperCase();

    return obj;
};

var _generateNonceString = function (length) {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var maxPos = chars.length;
    var noceStr = "";
    for (var i = 0; i < (length || 32); i++) {
        noceStr += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return noceStr;
};

var _mix = function () {
    var root = arguments[0];
    if (arguments.length == 1) {
        return root;
    }
    for (var i = 1; i < arguments.length; i++) {
        for (var k in arguments[i]) {
            root[k] = arguments[i][k];
        }
    }
    return root;
};

/**
 * 获取红包信息
 * @param billno订单号
 * @param billtype订单类型
 * @param cb
 */
function getredpack(billno,cb){
    var opts={};
    opts.mch_id = config.wechat.mch_id;
    opts.partner_key = config.wechat.partner_key;
    opts.mch_billno = config.wechat.mch_id+billno;
    opts.bill_type='MCHT';
    opts.nonce_str = _generateNonceString(32);
    opts.appid = config.wechat.appId;
    
    opts = _sign(opts);
    var GET_REDPACK_URL = config.services.webchatmch.url + config.services.webchatmch.interfaces.getredpackinfo;
    console.log(GET_REDPACK_URL);
    var PFX = config.wechat.pfx;

    var builder = new xml2js.Builder();
    var xml = builder.buildObject({xml: opts});

    logger.info(null,'开始查询订单:' + opts.mch_billno);
    request({
            url: GET_REDPACK_URL,
            method: 'POST',
            body: xml,
            agentOptions: {
                pfx: PFX,
                passphrase: opts.mch_id
            }
        },
        function (err, response, body) {
            wei.xmlcreateCallback(err, response, body,cb);
        }
    );
};

/**
 * 转账到指定用户
 * @param opts {partner_trade_no:订单号,openid:openid,amount:金额,desc:转账备注,spbill_create_ip:IP地址}
 * @param cb
 */
function paymoney(opts, cb) {
    opts.mch_id = config.wechat.mch_id;
    opts.partner_key = config.wechat.partner_key;
    opts.pfx = config.wechat.pfx;
    opts.wxappid = config.wechat.appId;
    opts.mch_billno = config.wechat.mch_id + opts.billno;
    opts.check_name='NO_CHECK';

    var SEND_MONEY_URL = config.services.webchatmch.url + config.services.webchatmch.interfaces.paymoney;
    var PFX = opts.pfx;

    opts.nonce_str = _generateNonceString(32);
    delete opts.billno;

    opts = _sign(opts);

    var builder = new xml2js.Builder();
    var xml = builder.buildObject({xml: opts});

    logger.info(null,'开始向openid:' + opts.openid+'进行转账.单号:' + opts.mch_billno);
    request({
            url: SEND_MONEY_URL,
            method: 'POST',
            body: xml,
            agentOptions: {
                pfx: PFX,
                passphrase: opts.mch_id
            }
        },
        function (err, response, body) {
            wei.xmlcreateCallback(err, response, body,cb);
        }
    );
};


/**
 * 获取红包信息
 * @param billno订单号
 * @param billtype订单类型
 * @param cb
 */
function getpaymoneyrecord(billno,billtype,cb){
    var opts={};
    opts.mch_id = config.wechat.mch_id;
    opts.wxappid = config.wechat.appId;
    opts.mch_billno = billno;
    opts.nonce_str = _generateNonceString(32);
    opts = _sign(opts);

    var GET_REDPACK_URL = config.services.webchatmch.url + config.services.webchatmch.interfaces.getpayinfo;
    var PFX = config.wechat.pfx;

    var builder = new xml2js.Builder();
    var xml = builder.buildObject({xml: opts});

    logger.info(null,'开始查询订单:' + opts.mch_billno+ opts.mch_billno);
    request({
            url: GET_REDPACK_URL,
            method: 'POST',
            body: xml,
            agentOptions: {
                pfx: PFX,
                passphrase: opts.mch_id
            }
        },
        function (err, response, body) {
            wei.xmlcreateCallback(err, response, body,cb);
        }
    );
};





exports.redpack = Redpack;
exports.sendredpack = sendRedpack;
exports.getredpack=getredpack;
exports.paymoney=paymoney;
exports.getpaymoneyrecord=getpaymoneyrecord;