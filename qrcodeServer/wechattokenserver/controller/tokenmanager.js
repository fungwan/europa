/**
 * Created by shuwei on 15/12/14.
 */
var request = require('request');
var schedule = require('node-schedule');
var moment = require('moment');
var jsSHA = require('jssha');

var returndata = require('../common/returnData');
var config = require('../../config');
var logger = require('../common/logger');

var tokenjob = null;
var tickjob = null;

function savetoken(token, intime, cb) {
    global.systoken = token;
    logger.info(config.systemUser, '存储token成功！');
    //if(cb){
    //    cb(null,returndata.createData(JSON.parse(token)));
    //};
    getjdktickfromwechat(cb);
}

function savetick(tick, intime, cb) {
    global.jsapitick = tick;
    logger.info(config.systemUser, '存储jsapitick成功！');
    if (cb) {
        cb(null, returndata.createData(JSON.parse(tick)));
    };
}

function gettokenfromwechat(cb) {
    logger.info(config.systemUser, '开始刷新token！');
    var appid = config.wechat.appId;
    var secret = config.wechat.appSecret;
    var path = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=' + appid + '&secret=' + secret;
    request({
        url: path,
        method: 'get'
    }, function(err, result) {
        var timespace = config.retrytime;
        if (err) {
            logger.error(config.systemUser, '获取微信方token失败！');
            logger.error(config.systemUser, JSON.stringify(err));
            timespace = config.retrytime;
            if (cb) {
                cb(returndata.createError('unknow', err.message), null);
            }
        } else {
            var data = JSON.parse(result.body);
            if (data.errcode) {
                logger.error(config.systemUser, '获取微信方token失败！错误码:' + data.errcode);
                timespace = config.retrytime;
                if (cb) {
                    cb(returndata.createError('unknow', err.message), null);
                }
            } else {
                logger.info(config.systemUser, '获取微信方token成功！');
                var token = JSON.stringify(data);
                timespace = data.expires_in - 10;
                savetoken(token, timespace, cb);
            }
        }
        var date = moment();
        date.add(timespace, 'seconds');
        var dt = date.toDate();
        logger.info(config.systemUser, '下次获取微信方token时间：' + date.format('YYYY-MM-DD HH:mm:ss'));
        if (tokenjob)
            tokenjob.cancel();
        tokenjob = schedule.scheduleJob(dt, function() {
            gettokenfromwechat();
        });
    });
};

/**
 * 获取系统票据
 * @param req
 * @param res
 */
function gettoken(req, res) {
    var webtoken = req.body.webtoken;
    global.webtoken = webtoken;

    var systoken = global.systoken;
    if (systoken) {
        logger.info(config.systemUser, '成功返回token！');
        res.json(returndata.createData(systoken));
    } else {
        gettokenfromwechat(function(err, token) {
            if (err) {
                global.systoken = null;
                res.json(err);
            } else {
                global.systoken = token.data;
                res.json(token);
            }
        });
    }
};

/**
 * 获取普通access_token，不传入web_token
 */
function getsystoken(req, res) {
    var _systoken = global.systoken;
    var manual = req.body.manual;

    if (manual == 1 || !_systoken) {
        logger.info(null, '开始手动获取access_token')
        gettokenfromwechat(function(err, token) {
            if (err) {
                logger.error(null, '手动获取access_token失败')
                global.systoken = null;
                res.json(err);
            } else {
                logger.info(null, '手动获取access_token成功');
                logger.info(null, token.data);
                res.json(returndata.createData(global.systoken));
            }
        });
    } else {
        logger.info(config.systemUser, '成功返回access_token！');
        logger.info(null, _systoken);
        res.json(returndata.createData(_systoken));
    }
}

/**
 * 获取网页端票据
 * @param req
 * @param res
 */
function getwebtoken(req, res) {
    var webtoken = global.webtoken;
    if (webtoken) {
        res.json(returndata.createData(webtoken));
    } else {
        res.json(returndata.createError('webtokenerror', '获取页面票据失败!'))
    }
};

/**
 * 获取所有票据(包括系统与网页端)
 * @param req
 * @param res
 */
function getalltoken(req, res) {
    var webtoken = global.webtoken;
    var restoken = {};

    function getsystokenfinish(err, token) {
        if (err) {
            global.systoken = null;
            res.json(err);
        } else {
            global.systoken = token.data;
            restoken.systoken = token.data;
            res.json(returndata.createData(restoken));
        }
    };
    if (webtoken) {
        restoken.webtoken = webtoken;
        var systoken = global.systoken;
        if (systoken) {
            restoken.systoken = systoken;
            logger.info(config.systemUser, '成功返回token！');
            res.json(returndata.createData(restoken));
        } else {
            gettokenfromwechat(getsystokenfinish);
        }
    } else {
        res.json(returndata.createError('webtokenerror', '获取页面票据失败!'))
    }
};

function getjdktickfromwechat(cb) {

    logger.info(config.systemUser, '开始刷新token！');
    //var appid=config.wechat.appId;
    //var secret=config.wechat.appSecret;
    var token = JSON.parse(global.systoken);
    var path = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + token.access_token + '&type=jsapi';
    request({
        url: path,
        method: 'get'
    }, function(err, result) {
        var timespace = config.retrytime;
        if (err) {
            logger.error(config.systemUser, '获取微信方jsapitick失败！');
            logger.error(config.systemUser, err.stack);
            if (cb) {
                cb(returndata.createError('unknow', err.message), null);
            }
        } else {
            var data = JSON.parse(result.body);
            if (data.errcode || data.errcode != 0) {
                logger.error(config.systemUser, '获取微信方jsapitick失败！错误码:' + data.errcode);
                if (cb) {
                    cb(returndata.createError('unknow', err.message), null);
                }
            } else {
                logger.info(config.systemUser, '获取微信方jsapitick成功！');
                var tick = JSON.stringify(data);
                timespace = data.expires_in - 10;
                savetick(tick, timespace, cb);
            }
        }
        //var date=moment();
        //date.add(timespace,'seconds');
        //var dt = date.toDate();
        //logger.info(config.systemUser,'下次获取微信方jsapitick时间：'+date.format('YYYY-MM-DD HH:mm:ss'));
        //if(tickjob)
        //    tickjob.cancel();
        //tickjob = schedule.scheduleJob(dt, function(){
        //    getjdktickfromwechat();
        //});
    });
};


var createNonceStr = function() {
    return Math.random().toString(36).substr(2, 15);
};

var createTimestamp = function() {
    return parseInt(new Date().getTime() / 1000) + '';
};

var raw = function(args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function(key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
};

function sign(jsapi_ticket, url) {
    var ret = {
        jsapi_ticket: jsapi_ticket,
        nonceStr: createNonceStr(),
        timestamp: createTimestamp(),
        url: url
    };
    var string = raw(ret);
    shaObj = new jsSHA(string, 'TEXT');
    ret.signature = shaObj.getHash('SHA-1', 'HEX');

    var v = {
        debug: false,
        appId: config.wechat.appId,
        timestamp: ret.timestamp,
        nonceStr: ret.nonceStr,
        signature: ret.signature
    }
    return v;
};

function getsign(req, res) {
    logger.info(config.systemUser, '开始获取签名!');
    try {
        var tick = JSON.parse(global.jsapitick);
        var url = req.body.url;
        var s = sign(tick.ticket, url);
        logger.info(config.systemUser, '获取签名成功!');
        res.json(returndata.createData(s));
    } catch (err) {
        logger.error(config.systemUser, '获取签名失败!');
        logger.error(config.systemUser, err.stack);
        res.json(returndata.createError('unknow', err.message));
    }
}



function init() {
    global.systoken = null;

    //function finishgettoken(err,result){
    //    if(err){
    //        logger.info(config.systemUser,'获取token失败!');
    //    }
    //    else{
    //        getjdktickfromwechat();
    //    }
    //};
    gettokenfromwechat();

};

exports.gettoken = gettoken;
exports.getsystoken = getsystoken;
exports.getwebtoken = getwebtoken;
exports.getalltoken = getalltoken;
exports.getsign = getsign;
exports.init = init;