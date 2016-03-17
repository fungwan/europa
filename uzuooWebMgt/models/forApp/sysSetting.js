/**
 * Created by Administrator on 2015/12/31.
 */


var request = require('./requestForGo.js');
var tokenMgt = require('./tokenMgt');
var jsonConvert = require('../../lib/jsonFormat.js');
var settings = require('../../conf/settings');
var logger = require('../../lib/log.js').logger;
var async = require('async');
var fs = require("fs");
var qiniu = require('qiniu');
var qiniuUpload = require('./upload.js');
var uuid = require('node-uuid');
var multiparty = require('multiparty');

//获取角色相关配置
exports.getPointsRule = function(req,res){
    var cityStr = req.session.user.city;
    var cityId  = cityStr.substr(cityStr.indexOf(',')+1,cityStr.length);
    var roleId = req.query.roleId;
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
            get_rules: ['get_token',function (callback,results) {

                var token = results.get_token;
                var path = '/cities/' + cityId + '/roles/' + roleId + '/setting?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }]
        },function(err,result){
            if(err === null){
                var pointRule = jsonConvert.stringToJson(result.get_rules);
                res.json({
                        result: 'success',
                        content:pointRule}
                );
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

//更新角色相关配置
exports.updatePointsRule = function(req,res){

    var cityStr = req.session.user.city;
    var cityId  = cityStr.substr(cityStr.indexOf(',')+1,cityStr.length);
    var roleId = req.body.roleId;

    var roleRule = req.body.content;

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
            update_rule:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/cities/' + cityId + '/roles/' + roleId + '/setting?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                var content ={};
                content = roleRule;
                var bodyString = JSON.stringify(content);

                request.post(optionItem,bodyString,callback);
            }]
        },function(err,results){
            if(err === null){
                res.json({ result: 'success',
                    content:''});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:results});
            }
        })
};

//获取细项相关配置
exports.getCraftRule = function(req,res){
    var cityStr = req.session.user.city;
    var cityId  = cityStr.substr(cityStr.indexOf(',')+1,cityStr.length);
    var craftId = req.query.craftId;
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
            get_rules: ['get_token',function (callback,results) {

                var token = results.get_token;
                var path = '/cities/' + cityId + '/crafts/' + craftId + '/setting?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }]
        },function(err,result){
            if(err === null){
                var pointRule = jsonConvert.stringToJson(result.get_rules);
                res.json({
                        result: 'success',
                        content:pointRule}
                );
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

//更新细项相关配置
exports.updateCraftRule = function(req,res){

    var cityStr = req.session.user.city;
    var cityId  = cityStr.substr(cityStr.indexOf(',')+1,cityStr.length);
    var craftId = req.body.craftId;

   var craftRule = req.body.content;

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
            update_rule:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/cities/' + cityId + '/crafts/' + craftId + '/setting?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                var content ={};
                content = craftRule;
                var bodyString = JSON.stringify(content);

                request.post(optionItem,bodyString,callback);
            }]
        },function(err,results){
            if(err === null){
                res.json({ result: 'success',
                    content:''});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:results});
            }
        })
};

//获取推广工种
exports.getRecommendRole = function(req,res){
    var cityStr = req.session.user.city;
    var cityId  = cityStr.substr(cityStr.indexOf(',')+1,cityStr.length);

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
            get_recommend: ['get_token',function (callback,results) {

                var token = results.get_token;
                var path = '/cities/' + cityId + '/recommendation?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }]
        },function(err,result){
            if(err === null){
                var recommendRole = jsonConvert.stringToJson(result.get_recommend);
                res.json({
                        result: 'success',
                        content:recommendRole['recommendations']}
                );
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

//设置推广工种
exports.setRecommendRole = function(req,res){

    var cityStr = req.session.user.city;
    var cityId  = cityStr.substr(cityStr.indexOf(',')+1,cityStr.length);

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
            update_rule:['get_token',function(callback,results){

                var form = new multiparty.Form();
                form.parse(req, function(err, fields, files) {
                    var content = JSON.parse(fields.content[0]);
                    var savePath = '';
                    if (files && files.file && files.file[0] && files.file[0].headers && files.file[0].headers['content-type'].search('image') !== -1) {
                        savePath = files.file[0].path;
                    }

                    var token = results.get_token;
                    var path = '/cities/' + cityId + '/recommendation?accessToken=' + token;
                    var optionItem = {};
                    optionItem['path'] = path;

                    if (!savePath) {
                        var bodyString = JSON.stringify(content);
                        request.post(optionItem,bodyString,callback);
                    } else {

                        var recommendationArray = content.recommendations;
                        var flag = false;

                        for(var x = 0; x < recommendationArray.length;){
                            var icon = recommendationArray[x].icon_href;
                            if(icon.search(/^data:image\/\w+;base64,/) === -1){
                                ++x;
                                continue;
                            }

                            var base64Data = icon.replace(/^data:image\/\w+;base64,/, "");
                            var dataBuffer = new Buffer(base64Data, 'base64');
                            var roleId = recommendationArray[x].id;
                            var savePath = roleId + '.jpg';
                            flag = true;
                            fs.writeFile(savePath, dataBuffer, function(err) {
                                if(err){
                                    //本地文件写入流出错
                                    callback('error','uploadRoleImage error...');
                                }else{

                                    var qiniuFileName = uuid.v1();
                                    uploadFile(savePath,qiniuFileName,qiniuUpload.getUploadTokenEx(),function(err,results){
                                        if(err === null){
                                            recommendationArray[x].icon_href = settings.qiniuUrl+qiniuFileName;
                                            var content = {
                                                recommendations:recommendationArray
                                            };
                                            var bodyString = JSON.stringify(content);
                                            request.post(optionItem,bodyString,callback);
                                        }
                                    });
                                }
                            });


                            break;
                        }

                        if(!flag){
                            var bodyString = JSON.stringify(content);
                            request.post(optionItem,bodyString,callback);
                        }
                    }
                });
            }]
        },function(err,results){
            if(err === null){
                res.json({ result: 'success',
                    content:''});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:results});
            }
        })
};

//获取等级规则
exports.getLevelRules = function(req,res){

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
            get_rules: ['get_token',function (callback,results) {

                var token = results.get_token;
                var path = '/levelRules?'+'accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }]
        },function(err,result){
            if(err === null){
                var rulesArray = jsonConvert.stringToJson(result.get_rules)['rules'];
                res.json({
                        result: 'success',
                        content:rulesArray}
                );
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

//更新等级规则
exports.updateLevelRules = function(req,res){

    var rulesArray = req.body.content;

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
            update_rules:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/levelRules?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                var content ={};
                content['rules'] = rulesArray;
                var bodyString = JSON.stringify(content);

                request.post(optionItem,bodyString,callback);
            }]
        },function(err,results){
            if(err === null){
                res.json({ result: 'success',
                    content:''});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:results});
            }
        })
};

exports.getSysConfig = function(req,res){

    var cityStr = req.session.user.city;
    var cityId  = cityStr.substr(cityStr.indexOf(',')+1,cityStr.length);

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
            get_rules: ['get_token',function (callback,results) {

                var token = results.get_token;
                var path = '/settings?city=' + cityId +'&accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }]
        },function(err,result){
            if(err === null){
                var rulesObj = jsonConvert.stringToJson(result.get_rules);
                res.json({
                        result: 'success',
                        content:rulesObj}
                );
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

exports.updateSysConfig = function(req,res){

    var rulesObj = req.body;
    var cityStr = req.session.user.city;
    var cityId  = cityStr.substr(cityStr.indexOf(',')+1,cityStr.length);

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
            update_rules:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/settings?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                rulesObj['city'] = cityId;
                var bodyString = JSON.stringify(rulesObj);

                request.post(optionItem,bodyString,callback);
            }]
        },function(err,results){
            if(err === null){
                res.json({ result: 'success',
                    content:''});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:results});
            }
        })
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

//获取APK/IPA版本信息
exports.getAppVersions = function(req,res){

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
            get_versions: ['get_token',function (callback,results) {

                var token = results.get_token;
                var path = '/applications/versions?'+'accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }]
        },function(err,result){
            if(err === null){
                var versionsArray = jsonConvert.stringToJson(result.get_versions)['versions'];
                res.json({
                        result: 'success',
                        content:versionsArray}
                );
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

//设置APK/IPA版本信息
exports.setAppVersion = function(req,res){

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
            update_version:['get_token',function(callback,results){
                 var token = results.get_token;
                 var path = '/applications/version?accessToken=' + token;
                 var optionItem = {};
                 optionItem['path'] = path;

                 var content ={};
                 content = req.body;
                 var bodyString = JSON.stringify(content);

                 request.post(optionItem,bodyString,callback);

            }]
        },function(err,results){
            if(err === null){
                res.json({ result: 'success',
                    content:''});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:results});
            }
        })
};

exports.delAppVersion = function(req,res){

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
            update_version:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/applications/version?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                var content ={};
                content.id = req.query.id;
                var bodyString = JSON.stringify(content);

                request.del(optionItem,bodyString,callback);

            }]
        },function(err,results){
            if(err === null){
                res.json({ result: 'success',
                    content:''});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:results});
            }
        })
};