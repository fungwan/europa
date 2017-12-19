/**
 * Created by tao on 2017/7/19.
 */
var config = require('../../config');
var logger = require('../common/logger');
var md5 = require('MD5');
var request = require('request');
var Q = require('q');
var https = require('https');
var blh = require('./blh');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';//Bad Idea

/**
 * 请求百利汇接口统一处理
 * @param url
 * @param param
 */
function requestBlh(url,param) {

    var p = Q.defer();
    /*var agentOptions;
    var agent;
    
    agentOptions = {
      host: 'apijk.li91.com'
    , port: '443'
    , path: '/'
    , rejectUnauthorized: false
    };
    
    agent = new https.Agent(agentOptions);

    request({
        url: url
      , method: 'POST'
      , form:param
      , agent: agent
      } ,function (err,repsone,body) {
        if(err){
            p.reject(err);
        }else{
            body=JSON.parse(body);
            if(body.code!=500) {
                body.message = ascii(body.message);
            }
            p.resolve(body);
        }
    });*/

    request.post({url:url,form:param},function (err,repsone,body) {
        if(err){
            p.reject(err);
        }else{
            body=JSON.parse(body);
            if(body.code!=500) {
                body.message = ascii(body.message);
            }
            p.resolve(body);
        }
    });

    return p.promise;
};
/**
 * 根据请求的类型不同生成不同的签名
 * @param obj
 * @param type
 * @returns {string}
 */
function sign(obj,type) {
    var result = "";
    try {
        switch (type) {
            case blh.signType.product_All:
                result = md5("app_id=" + obj.app_id + "&tamptimes=" + obj.tamptimes + ":" + obj.app_key);
                break;
            case blh.signType.product_Info:
                //md5("app_id="+appId+ "&itemId="+itemId+"&tamptimes="+tamptimes+":"+appKey);
                result = md5("app_id=" + obj.app_id +"&itemId="+ obj.itemId +"&tamptimes=" + obj.tamptimes + ":" + obj.app_key);
                break;
            case blh.signType.product_Update:
                //md5("app_id="+appId+"&tamptimes="+tamptimes+":"+appKey);
                result = md5("app_id=" + obj.app_id + "&tamptimes=" + obj.tamptimes + ":" + obj.app_key);
                break;
            case blh.signType.excute_Update:
                //md5("app_id="+appId+"&itemId="+itemId +"&tamptimes="+tamptimes+"&update_id="+updateId+":"+appKey);
                result = md5("app_id="+obj.app_id+"&itemId="+obj.itemId +"&tamptimes="+obj.tamptimes+"&update_id="+obj.update_id+":"+obj.app_key);
                break;
            case blh.signType.order_Generate:
                //"app_id="+order.app_id+"&itemId="+order.itemId+"&num="+order.num+"&orderId="+order.orderId +"&tamptimes="+order.tamptimes+":"+order.app_key
                result = md5("app_id="+obj.app_id+"&itemId="+obj.itemId+"&num="+obj.num+"&orderId="+obj.orderId +"&tamptimes="+obj.tamptimes+":"+obj.app_key);
                break;
            case blh.signType.order_Express:
                //"app_id="+order.app_id+"&itemId="+order.itemId+"&orderId="+order.orderId +"&tamptimes="+order.tamptimes+":"+order.app_key
                result = md5("app_id="+obj.app_id+"&itemId="+obj.itemId+"&orderId="+obj.orderId +"&tamptimes="+obj.tamptimes+":"+obj.app_key);
                break;
        }
    }catch (err){
        logger.error(config.systemUser,"sign时发生错误："+err);
    }
    return result;
};
/**
 * ascii 转码
 * @param source
 * @returns {*}
 */
function ascii(source) {
    var character=source.split("\\u");
    var value=character[0];
    for(var i=1;i<character.length;i++){
        var code=character[i];
        value+=String.fromCharCode(parseInt("0x"+code.substring(0,4)));
        if(code.length>4){
            value+=code.substring(4,code.length);
        }
    }
    return value;
};
/**
 * 获取快递信息json对象
 * @param url
 */
function requestExpress(url) {
    var p = Q.defer();
    request(encodeURI(url),function (err,repsone,body) {
        if(err){
            p.reject(err);
        }else{
            body=JSON.parse(body);
            p.resolve(body);
        }
    });
    return p.promise;
};

exports.requestBlh=requestBlh;
exports.sign = sign;
exports.ascii = ascii;
exports.requestExpress=requestExpress;
