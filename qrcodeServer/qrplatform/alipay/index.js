var xml2js = require('xml2js');
var moment = require("moment");
var request = require('request');
var logger = require('../common/logger');
var returnData = require('../common/returnData');
var tool = require('../common/tool');
var config = require('../../config');
var wei = require('./wechatcore');
var md5 = require('MD5');

//设置应用相关参数 
//网关地址，示例中为沙箱环境 
var GATEWAY_URL = 'https://openapi.alipaydev.com/gateway.do?';
//沙箱环境应用的APPID 
var APP_ID = '2016082000296751';
//签名方式，推荐使用RSA2 
var SIGN_TYPE = 'RSA2';
//沙箱环境RSA2应用私钥 
var PRIVATE_KEY = 'MIIEowIBAAKCAQEArKS6nAIwOyn8tEuuLJ91ZCZToD2UhbfGFprX5J5NVYeUMSALdK0FGFwfKvbrUG9RYlJVjxxIF5WmZpdYq91vW/JUFPue/aGyG/v3OR/3kU2ZhewyQcUAa47UzgWQ6u99cs5hDJb4e9rREIs/Iusex7eYhiWoItqiOZW86UKs7SLjvWH21fBhX/uUAPOli6VMwIo6PHaWVIRZP5kT1yXoK88GqyRCt/uBt8++04aKYsgDlglGur6AUS2Ev1Hv6qS+bw55XQY11dQVmlENnGZum2HqdnkvnofrtllKi3jY7xyIYBJ4b2KNJXgYscfaVbEhi38VaPuVBTde9zQjZ+nP4wIDAQABAoIBAQCKbTrDRG3vwmbBGb16QhEaUDDVVwrzfLrz/QwGX3eakK8eBJeq4eAn/BVxmbJsOBWFRIcdzItxfaiCse+DPnW/v7nzaR2+OBxbm9hKkXsropDqdMyHN7Jyi3/OAWCFP6nSl+/w7Ewo4vam0T+6e9OeR3OgfCkoaS2SBqIGVlPZfsLqRWEAmQ1aLosWl+NlYSZ4IViQzGGT7UK2LoNIvqhjvK1ojyG6ApiNvj2sP0mVM+GrhyKpmFibXu2nKJ4bbIBSWPsgmzeTvgjg6ZWjt1Sl6m7PBhR95vIoXBxj5q9DQPX2AAT9VCSNBszRNIhrEbuOGRJtYBjiGFX2O+Iphp9BAoGBANdAtrtcTT2E+RpkQaETGMdfwvzsAQxRIgezohcCSl1hIfa9DeOXCfDQFWYBlhicpIWRuKvLzAU/7oVvv/ckGLGSfTSTp++qF3pnWUZsHG3mItANkjheadW4CRIiGq4siI7RLOFbVG3h1uanNWYiaRwrapPjzMF4CkPMV0GkVW9JAoGBAM1TJAkSgJmFe2Kmo4Jtpy4NATqxTf0QCWf/mCgxjCqSr1Evj5a4KSZZUrzamzMaANmWwV2QwIthGxjtDXlPrvjapsFv1XSTB3jZRubyLfCWEmWGXLVTgoB5NNtmfP/cH9OkQ62URhRYhdinl2BOW5K3Bx2oP0MpeZyRVe7QOQnLAoGATYQniid+RWZKkt+B5vDKnpn0zUJsSjQ5jg55k9GmWCRvp7yDcO9mjAtTeW2e0PQwJ03H9E4rBcT1L6aDuguMvP3lCvcVpjBZziHDu6GZR1Z2OPh6LMSLVoS094vCkfDFqLDZebp7GCsZSezzRPmlYpicA/AoP4/sGmhPD/uPLMkCgYARD+Wgs17oYwU7z2kq/32y//WoMO+wJdMCR2UXgfaJ2yKidndSKP+SZj3P38Kh3nlPm415/vthGbKswZYrDIoXt+O/k1GDnGw0iKmxq1JR+caRlTbDAquHjYrs6HlesaYbaj0NgZLJQgntVQ/pOtm1OWxn9IE9TYcDkbg4Xik/PQKBgAYyOpptONwhaDYbqdaSQ/oszK77VaCU17310ObSScAUgSbIHr00+/erwFrhIHcTMvcPecUYtBX04SU4M8ypZz2H0LxXvNRBZpxm4RN7DUgQLROmaxixzblBsClOhsGU3hAsCk1BWu0dZj5IGweNbm2BT2Gg7TcrsI3R+rV/groh';
//沙箱环境RSA2支付宝公钥 
var ALI_PUBLIC_KEY = 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4J2tu2RvWz69WMMP4MZ6fI3TBw2du9cEH4QY3f0UAafgBGbQScPwoyU5NusPVtxuhg4EGiXJld1MPVpMjRXFHoKurpmFVbbwKfJA+/MTDyH0cZPARafqq7DX9QMf5ngRdIiwCRqgAT1ZGC7l9uUtGJy0IVoZAzxueW7YITWnodDwNKyxAIDbUK4bVrZywr174hT21uJGFNOdyA3ZtMcVgj2UW4tdXQBE7Iqd9Zwy50uqftoVIroMB7ILVoB6otzwjPcMzb0NoeAYVqgTQ5lSRPPPck4v/uJ6OHDYI2p6KuDKiV/GpdvOBPZxEjlfd4zt27DvAq9msQAW25SQh+7sewIDAQAB';


//将RSA公私钥转换为PEM格式 
var privateKey = '-----BEGIN PRIVATE KEY-----\n' + PRIVATE_KEY + '\n-----END PRIVATE KEY-----';
var aliPublicKey = '-----BEGIN PUBLIC KEY-----\n' + ALI_PUBLIC_KEY + '\n-----END PUBLIC KEY-----';

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

var _alisign = function (requestParams) {
    var preStr = '';
    var keySet = [];
    for (var key of Object.keys(requestParams).sort()) {
        if (!requestParams[key] || key == 'sign') {
            continue;
        }
        keySet.push(key);
    }
    for (var i = 0; i < keySet.length; i++) {
        var key = keySet;
        var value = requestParams[key];
        if (i == keySet.length - 1) {
            preStr = preStr + key + '=' + value + '';
        } else {
            preStr = preStr + key + '=' + value + '&';
        }
    }

    //生成签名 
    var crypto = require('crypto');
    var signer = crypto.createSign('RSA-SHA256');
    if (SIGN_TYPE == 'RSA') {
        signer = crypto.createSign('RSA-SHA1');
    }
    signer.update(preStr);
    var sign = signer.sign(privateKey, 'base64');

    return sign;
}


function getAuthAccesstoken(auth_code, cb) {
    /*opts.mch_id = config.wechat.mch_id;
    opts.partner_key = config.wechat.partner_key;
    opts.pfx = config.wechat.pfx;
    opts.wxappid = config.wechat.appId;
    opts.mch_billno = config.wechat.mch_id + opts.billno;
    opts.check_name = 'NO_CHECK';*/

    var requestParams = {
        app_id: APP_ID,
        method: 'alipay.system.oauth.token',
        charset: 'utf-8',
        sign_type: SIGN_TYPE,
        version: '1.0',
        timestamp: moment().format(config.dateformat),
        grant_type:'authorization_code',
        code:auth_code
        /*biz_content: {
            total_amount: '0.01',
            subject: '订单标题',
            body: '商品描述信息',
            scene: 'qr_code',
            store_id: 'SH001',
            out_trade_no: 'ALIPAYTEST2016081622560194853'
        }*/
    }

    //将biz_content参数序列化为JSON格式字符串 
    //requestParams.biz_content=JSON.stringify(requestParams.biz_content); 

    var https = require('https');
    var qs = require('querystring');
    requestParams.sign = _alisign(requestParams);
    var content = qs.stringify(requestParams);
    var requestUrl = GATEWAY_URL + content;
    https.get(requestUrl, function (res) {
        res.setEncoding('utf8')
        res.on('data', function (chunk) {
            console.log("响应数据：" + chunk);
            //对响应数据进行验签 
            var responseData = JSON.parse(chunk);
            //获取待验签字符串 
            var preVerifyStr = JSON.stringify(responseData.alipay_trade_precreate_response);
            //转义正斜杠 
            var reg = new RegExp('/', "g");
            preVerifyStr = preVerifyStr.replace(reg, '\\/');
            //验签 
            var verifier = crypto.createVerify('RSA-SHA256');
            if (SIGN_TYPE == 'RSA') {
                verifier = crypto.createVerify('RSA-SHA1');
            }
            verifier.update(preVerifyStr);
            console.log("验签结果：" + verifier.verify(aliPublicKey, responseData.sign, 'base64'));
        });
    }).on('error', function (e) {
        console.log("Got error: " + e.message);
    });
}

exports.getAuthAccesstoken = getAuthAccesstoken;