/**
 * Created by Administrator on 2016/1/5.
 */

var request = require('./requestForGo.js');
var tokenMgt = require('./tokenMgt');
var jsonConvert = require('../../lib/jsonFormat.js');
var settings = require('../../conf/settings');
var logger = require('../../lib/log.js').logger;
var async = require('async');
var fs = require("fs");

var uuid = require('node-uuid');
var multiparty = require('multiparty');
var qiniu = require('qiniu');
var qiniuToken = uptoken('uzuoo-photos');//uzuoo-photos

exports.getContractById = function(req,res){

    var contractId = req.params.id;

    async.auto(
        {
            get_token: function (callback) {

                tokenMgt.getToken(function (err, token) {
                    if (!err) {
                        callback(null, token);
                    } else {
                        callback(err, 'can not get token...');
                    }
                });
            },
            get_contract: ['get_token', function (callback, results) {

                var token = results.get_token;
                var orderPath = '/contracts/' + contractId +'?accessToken=' + token;

                var item = {};
                item['path'] = orderPath;
                request.get(item,callback);
            }]
        },function(err,result){
            if(err === null){

                var contractObject = jsonConvert.stringToJson(result.get_contract);

                res.json({
                    result: 'success',
                    content: contractObject})
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({
                    result: 'fail',
                    content:err})
            }
        }
    );
};

exports.getContractItem = function(req,res){

    var contractId = req.params.id;

    async.auto(
        {
            get_token: function (callback) {

                tokenMgt.getToken(function (err, token) {
                    if (!err) {
                        callback(null, token);
                    } else {
                        callback(err, 'can not get token...');
                    }
                });
            },
            get_contractItem: ['get_token', function (callback, results) {

                var token = results.get_token;
                var orderPath = '/contracts/' + contractId +'/items?accessToken=' + token;

                var item = {};
                item['path'] = orderPath;
                request.get(item,callback);
            }]
        },function(err,result){
            if(err === null){

                var contractItemArray = jsonConvert.stringToJson(result.get_contractItem)['items'];

                res.json({
                    result: 'success',
                    content: contractItemArray})
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({
                    result: 'fail',
                    content:err})
            }
        }
    );
};


exports.getBuildingLogs = function(req,res){

    var contractId = req.params.contractId;
    var itemId = req.params.itemId;

    async.auto(
        {
            get_token: function (callback) {

                tokenMgt.getToken(function (err, token) {
                    if (!err) {
                        callback(null, token);
                    } else {
                        callback(err, 'can not get token...');
                    }
                });
            },
            
            get_buildingLogs: ['get_token', function (callback, results) {

                var token = results.get_token;
                var orderPath = '/contracts/' + contractId +'/items/' + itemId + '/buildingLogs?accessToken=' + token;

                var item = {};
                item['path'] = orderPath;
                request.get(item,callback);
            }]
        },function(err,result){
            if(err === null){

                var buildingLogsArray = jsonConvert.stringToJson(result.get_buildingLogs)['building_logs'];

                res.json({
                    result: 'success',
                    content: buildingLogsArray})
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({
                    result: 'fail',
                    content:err})
            }
        }
    );
};


exports.uploadBuildingLogs = function(req,res){
    var contractId = req.params.contractId;
    var itemId = req.params.itemId;
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        var content =  JSON.parse(fields.content[0]);
        var savePath = '';
        if (files && files.file && files.file[0] && files.file[0].headers && files.file[0].headers['content-type'].search('image') !== -1) {
            savePath = files.file[0].path;
        }
        tokenMgt.getToken(function(err,token){
            if(!err){
                tokenMgt.getQiniuToken(function(err,qiniu_token){
                    if(err !== null){
                        res.json({ result: 'fail',content:err});
                    } else {
                        var qiniuFileName = uuid.v1();
                        uploadFile(savePath,qiniuFileName,qiniuToken.token(),function(err,results){
                            if(err === null){
                                content.building_logs[0].photos.push(qiniuFileName);
                                var optionItem = {};
                                var putPath = '/contracts/' + contractId + '/items/' + itemId +  '/buildingLogs?accessToken=' + token;
                                optionItem['path'] = putPath;
                                var bodyString = JSON.stringify(content);
                                request.post(optionItem,bodyString,function(err,results){
                                    if(err === null){
                                        res.json({ result: 'success',content:results});
                                    } else {
                                        res.json({ result: 'fail',content:err});
                                    }
                                });
                            } else {
                                res.json({ result: 'fail',content:err});
                            }
                        });
                    }
                });
            } else {
                res.json({ result: 'fail',content:err});
            }
        });
        
    });
}


exports.getChanges = function(req,res){

    var contractId = req.params.contractId;
    var itemId = req.params.itemId;

    async.auto(
        {
            get_token: function (callback) {

                tokenMgt.getToken(function (err, token) {
                    if (!err) {
                        callback(null, token);
                    } else {
                        callback(err, 'can not get token...');
                    }
                });
            },
            
            get_changes: ['get_token', function (callback, results) {

                var token = results.get_token;
                var orderPath = '/contracts/' + contractId +'/items/' + itemId + '/changes?accessToken=' + token;

                var item = {};
                item['path'] = orderPath;
                request.get(item,callback);
            }]
        },function(err,result){
            if(err === null){

                var buildingLogsArray = jsonConvert.stringToJson(result.get_changes)['change_logs'];

                res.json({
                    result: 'success',
                    content: buildingLogsArray})
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({
                    result: 'fail',
                    content:err})
            }
        }
    );
};





function uploadFile(localFile, key, uptoken,cb) {
    var extra = new qiniu.io.PutExtra();
    //extra.params = params;
    //extra.mimeType = mimeType;
    //extra.crc32 = crc32;
    //extra.checkCrc = checkCrc;

    qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
        if(!err) {
            console.log(ret.key, ret.hash);
            // ret.key & ret.hash

            cb(null,'success');

            fs.unlinkSync(localFile);
        } else {
            // 上传失败， 处理返回代码
            console.log(err);

            cb(err,'fail');
        }
    });
}

function uptoken(bucketname) {
    var putPolicy = new qiniu.rs.PutPolicy(bucketname);
    //putPolicy.callbackUrl = callbackUrl;
    //putPolicy.callbackBody = callbackBody;
    //putPolicy.returnUrl = returnUrl;
    //putPolicy.returnBody = returnBody;
    //putPolicy.asyncOps = asyncOps;
    putPolicy.expires = 30 * 24 * 3600;

    return putPolicy;
}

