/**
 * Created by shuwei on 16/1/16.
 */
var formidable = require('formidable');

var logger=require('./logger');
var config=require('../../config');
var returnData=require('./returnData');
var qiniu = require("qiniu");
var uuid = require('node-uuid');

var createUpload=function(req,res){
    var form = new formidable.IncomingForm();
    form.encoding = config.upload.encoding;
    form.uploadDir = config.upload.uploadtempdir;
    form.keepExtensions = false;
    form.maxFieldsSize = config.upload.maxfieldssize;


    form.on('error', function(message) {
        if(message)
        {
            res.json(returnData.createError(returnData.errorType.unknow,message));
        }
        else
        {
            res.json(returnData.createError(returnData.errorType.unknow,'文件上传失败!'));
        }
    });

    return form;
};

function getfileext(filepath) {
    if (filepath != "") {
        var pos = "." + filepath.replace(/.+\./, "");
        return pos;
    }
}

//var getprogress=function(req,res){
//    var progress = sessions.getSession(req, "uploadprogress");
//    res.json(returnData.createData(progress));
//};

function createqiniutoken(bucket){
    qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
    qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;
    var key=uuid.v4();
    var putPolicy = new qiniu.rs.PutPolicy(bucket);
    var token = putPolicy.token();
    var res={"uptoken":token};
    return res;
}

function getproducttoken(req,res){
    var bucket=config.qiniu.product;
    var v=createqiniutoken(bucket);
    res.json(v);
}

function getarticletoken(req,res){
    var bucket=config.qiniu.article;
    var v=createqiniutoken(bucket);
    res.json(v);
}

exports.createUpload=createUpload;
exports.getfileext=getfileext;
exports.getproducttoken=getproducttoken;
exports.getarticletoken=getarticletoken;
//exports.getprogress=getprogress;

