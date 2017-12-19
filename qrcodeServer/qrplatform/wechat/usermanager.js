/**
 * Created by shane on 2015/12/10.
 */
var request = require('request');

var logger = require('../common/logger');
var returnData = require('../common/returnData');
var tool = require('../common/tool');
var config = require('../../config');
var wei = require('./wechatcore');

/**
 * 获取用户的web token
 * @param code
 * @param cb
 */
function getwebtoken(code,cb){
    if(code.indexOf('&')>=0)
    {
       cb(returnData.createError(returnData.errorType.verifyError.unknow,'code 格式错误！'));
        return;
    }
    var path=config.services.wechat.url+config.services.wechat.interfaces.getwebtoken;
    path=path.replace('{1}',config.wechat.appId);
    path=path.replace('{2}',config.wechat.appSecret);
    path=path.replace('{3}',code);
    request({
        url: path,
        method: 'get'
        }, wei.createcallback(cb));
};

/**
 * 获取用户信息(详细信息),如用户未关注则无法获取
 * @param token
 * @param openid
 * @param cb
 */
function getuser(token,openid,cb){
    var path=config.services.wechat.url+config.services.wechat.interfaces.getuserinfo;
    path=path.replace('{1}',token);
    path=path.replace('{2}',openid);
    request({
        url: path,
        method: 'get'
    }, wei.createcallback(cb));
};

/**
 * 获取用户信息,web端,不包含是否关注等信息
 * @param webtoken
 * @param cb
 */
function getwebuser(token,openid,cb){
    var path=config.services.wechat.url+config.services.wechat.interfaces.getwebuser;
    path=path.replace('{1}',token);
    path=path.replace('{2}',openid);
    request({
        url: path,
        method: 'get'
    }, wei.createcallback(cb));
}



exports.getwebtoken=getwebtoken;
exports.getuser=getuser;
exports.getwebuser=getwebuser;