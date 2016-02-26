/**
 * Created by Administrator on 2016/1/5.
 */

var request = require('./requestForGo.js');
var jsonConvert = require('../../lib/jsonFormat.js');
var settings = require('../../conf/settings');
var logger = require('../../lib/log.js').logger;
var async = require('async');
var qiniu = require('qiniu');

qiniu.conf.ACCESS_KEY = settings.qiniuAccessKey;
qiniu.conf.SECRET_KEY = settings.qiniuSecretKey;

var uptoken = new qiniu.rs.PutPolicy(settings.qiniuBuket);

exports.getUploadToken = function(req,res){

    var token = uptoken.token();
    res.header("Cache-Control", "max-age=0, private, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    if (token) {
        res.json({
            uptoken: token
        });
    }else{
        res.json({
            uptoken: 'up token error...'
        });

        logger.error('获取qiniu上传token出错...');
    }
};

exports.getUploadTokenEx = function(){


    var token = uptoken.token();

    if (token) {
        return token;
    }else{

        logger.error('获取qiniu上传token出错...');
        return '';
    }
};

