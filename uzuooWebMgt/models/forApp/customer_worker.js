/**
 * Created by fungwan on 2016/3/28.
 */


var request = require('./requestForGo.js');
var historyMgt = require('../history.js');
var tokenMgt = require('./tokenMgt');
var jsonConvert = require('../../lib/jsonFormat.js');
var settings = require('../../conf/settings');
var logger = require('../../lib/log.js').logger;
var async = require('async');
var fs = require("fs");

var uuid = require('node-uuid');
var qiniu = require('qiniu');
var multiparty = require('multiparty');

qiniu.conf.ACCESS_KEY = settings.qiniuAccessKey;
qiniu.conf.SECRET_KEY = settings.qiniuSecretKey;
var qiniuToken = uptoken('uzuoo-photos');//uzuoo-photos

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

function verifiedSuccess(id,token){
    //更新工人状态为已认证
    var verifiedString = JSON.stringify({
        "verified":	2,
        "reason" : ''
    });

    var verifiedPath = '/workers/' + id + '/verificationStatus?accessToken=' + token;
    var verifiedItem = {};
    verifiedItem['path'] = verifiedPath;
    request.post(verifiedItem,verifiedString,function(err,results){
        if(err === null){
        }else{

            if(err === 403){
                tokenMgt.setTokenExpireStates(true);
            }

            console.error(err);
        }
    });
}

function Worker(){

}

module.exports = Worker;

Worker.prototype.updateWorkerProfileById = function(req,res){

    //var content = req.body;
    //var imgData = req.file;
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        //res.write('received upload:\n\n');
        //res.end(util.inspect({fields: fields, files: files}));
        var content =  JSON.parse(fields.content[0]);
        var savePath = '';
        if (files && files.file && files.file[0] && files.file[0].headers && files.file[0].headers['content-type'].search('image') !== -1) {
            savePath = files.file[0].path;
        }
        //console.log(content);
        tokenMgt.getToken(function(err,token){
            if(!err){

                //更新工人联系方式

                var optionItem = {};
                var putPath = '/workers/' + content.id + '/verification?accessToken=' + token;
                optionItem['path'] = putPath;

                if(!savePath){

                    verifiedSuccess(content.id,token);
                    var desc = '';
                    var workerName = content.content.first_name + content.content.last_name;;
                    desc = '为工人' + workerName + '执行了现场认证';
                    historyMgt.addLogsEx(req,res,desc);

                }else{
                    var qiniuFileName = uuid.v1();
                    uploadFile(savePath,qiniuFileName,qiniuToken.token(),function(err,results){
                        if(err === null){
                            content.content.verify_photo = qiniuFileName;
                            var bodyString = JSON.stringify(content.content);

                            request.post(optionItem,bodyString,function(err,results){
                                if(err === null){

                                    verifiedSuccess(content.id,token);
                                    var desc = '';
                                    var workerName = content.content.first_name + content.content.last_name;
                                    desc = '为工人' + workerName + '执行了现场认证';
                                    historyMgt.addLogsEx(req,res,desc);
                                    res.json({ result: 'success',
                                        content:results});
                                }else{

                                    if(err === 403){
                                        tokenMgt.setTokenExpireStates(true);
                                    }

                                    res.json({ result: 'fail',
                                        content:err});
                                }
                            });

                        }else{
                            content.content.verify_photo = '';//图片上传失败。不更新db数据
                            var bodyString = JSON.stringify(content);

                            request.post(optionItem,bodyString,function(err,results){
                                if(err === null){

                                    verifiedSuccess(content.id,token);
                                    var desc = '';
                                    var workerName = content.content.first_name + content.content.last_name;
                                    desc = '为' + workerName + '执行了现场认证';
                                    historyMgt.addLogsEx(req,res,desc);
                                    res.json({ result: 'success',
                                        content:results});
                                }else{

                                    if(err === 403){
                                        tokenMgt.setTokenExpireStates(true);
                                    }

                                    res.json({ result: 'fail',
                                        content:err});
                                }
                            });
                        }
                    });
                }
            }else{
                console.error('can not get token...');
                res.json({ result: 'fail',
                    content:err});
            }
        });
    });
};

Worker.prototype.findWorkerById = function(req,res){
    var workerId = req.params.id;

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
            get_workerInfo:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/workers/' + workerId +'?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }]
        },function(err,results){
            if(err === null){
                var workerInfo = jsonConvert.stringToJson(results.get_workerInfo);
                res.json({ result: 'success',
                    content:workerInfo});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:{}});
            }
        })
}

Worker.prototype.findWorkersByFilters = function(req,res){
    var currPage = req.query.page - 1;
    var filters = req.query.filters;
    // var filters = filterArray.join(",");

    async.auto(
        {
            get_token:function(callback){

                tokenMgt.getToken(function(err,token){
                    if(!err){
                        callback(null,token);
                    }else{
                        callback(err,'can not get token...');
                    }
                });
            },
            /*get_roleAndRegions:['get_token',function(callback,results){

             var token = results.get_token;

             getroleAndRegions(token,callback);
             }],*/
            get_all: ['get_token',function (callback,results) {

                var token = results.get_token;
                var path = '/workers?' + 'filter=' + filters + '&limit=-1&countOnly=true&sort=create_time::-1' +'&accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }],
            get_currPage: ['get_token',function (callback,results) {

                var token = results.get_token;
                var skipValue = currPage * 10;

                //获取工人信息
                var path = '/workers?'+ 'filter='+ filters + '&sort=create_time::-1' + '&limit=10&offset='+ skipValue + '&accessToken=' + token ;
                var optionItem = {};
                optionItem['path'] = path;
                request.get(optionItem,callback);
            }]
        },
        function(err, results) {
            if(err !== null){

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:err});
            }else{

                var token = results.get_token;
                var workersCounts = jsonConvert.stringToJson(results.get_all)['count'];
                if(workersCounts === 0){//db里面一个工人也没有.
                    res.json({
                            result: 'success',
                            pages:1,
                            content:[]}
                    );
                    return;
                }
                var allUserCounts = workersCounts;

                //get product list
                var pageCounts = 1;
                if(allUserCounts > 0){
                    var over = (allUserCounts) % 10;
                    over > 0 ? pageCounts = parseInt((allUserCounts) / 10) + 1 :  pageCounts = parseInt((allUserCounts) / 10) ;
                }

                //第一页用户数组
                var workerArray = jsonConvert.stringToJson(results.get_currPage)['workers'];
                res.json({ result: 'success',
                    pages:pageCounts,
                    content:workerArray});
            }
        }
    );
}

Worker.prototype.changeWorkerRole = function(req,res){
    var roleArray = req.body.content;
    var id = req.body.accountId;

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
            put_workerRole:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/workers/'+ id + '/roles?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                var content ={};
                content['roles'] = roleArray;
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
}

Worker.prototype.verifiedById = function(req,res){
    var idArray = req.body.ids;
    var verifiedContent = req.body.content;

    tokenMgt.getToken(function (err, token) {
        if (err === null) {
            async.map(idArray, function(item, callback) {

                var path = '/workers/' + item + '/verificationStatus?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                var content = {
                    verified:parseInt(verifiedContent.verified),
                    reason:verifiedContent.reason
                };

                var bodyString = JSON.stringify(content);

                request.post(optionItem,bodyString,callback);

                var desc = '';
                desc = '为工人' + item + '执行了认证动作';
                historyMgt.addLogsEx(req,res,desc);

            }, function(err,results) {
                if(!err){

                    if(err === 403){
                        tokenMgt.setTokenExpireStates(true);
                    }

                    res.json({
                            result: 'success',
                            content: 'ok'}
                    );
                }else{
                    res.json({
                            result: 'fail',
                            content:err}
                    );
                }
            });
        } else {
            res.json({
                    result: 'fail',
                    content:err}
            );
        }
    });
}

Worker.prototype.findVerifiedRecordById = function(req,res){
    var userId = req.params.id;


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
            get_verifiedRecord:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/workers/' + userId + '/verification_logs?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }]
        },function(err,results){
            if(err === null){
                var verifiedRecordArray = jsonConvert.stringToJson(results.get_verifiedRecord)['Verification_logs'];
                if(verifiedRecordArray === null){
                    verifiedRecordArray = [];
                }

                res.json({ result: 'success',
                    content:verifiedRecordArray});

            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:{}});
            }
        })
}

Worker.prototype.sendNotifications = function(req,res){
    var recvBody = req.body.content;
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
            send_notifications:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/workers/notifications?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                var content ={};
                //if(recvBody.type === 'worker');
                content.type = recvBody.msg_type;
                content.content = recvBody.msg_content;
                content.brief = '';

                if(recvBody.method === 'assign'){
                    content.account_id = recvBody.filter.account_id;
                }else if(recvBody.method === 'mass'){
                    content.regions = recvBody.filter.regions;
                    content.categories = recvBody.filter.categories;
                }

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

}

Worker.prototype.getDecorationCasesById = function(req,res){
    var workerId = req.params.id;

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
            get_decorationCases:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/workers/' + workerId +'/decorationCases?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;
                request.get(optionItem,callback);
            }]
        },function(err,results){
            if(err === null){
                var decorationCasesInfo = jsonConvert.stringToJson(results.get_decorationCases);
                res.json({ result: 'success',
                    content:decorationCasesInfo});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:{}});
            }
        })
}

Worker.prototype.getDecorationCasesDetailById = function(req,res){
    var workerId = req.params.id;
    var caseId = req.params.caseId;

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
            get_decorationCases:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/workers/' + workerId +'/decorationCases/' +caseId+ '?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;
                request.get(optionItem,callback);
            }]
        },function(err,results){
            if(err === null){
                var decorationCasesInfo = jsonConvert.stringToJson(results.get_decorationCases);
                res.json({ result: 'success',
                    content:decorationCasesInfo});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:{}});
            }
        })
}

Worker.prototype.getWorkersCases = function(req,res){
    var currPage = req.query.page - 1;
    var filters = req.query.filters;
    // var filters = filterArray.join(",");
    async.auto(
        {
            get_token:function(callback){

                tokenMgt.getToken(function(err,token){
                    if(!err){
                        callback(null,token);
                    }else{
                        callback(err,'can not get token...');
                    }
                });
            },
            get_all: ['get_token',function (callback,results) {

                var token = results.get_token;
                var path = '/workers/decorationCases?' + 'filter=' + filters + '&limit=-1&countOnly=true' +'&accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }],
            get_currPage: ['get_token',function (callback,results) {

                var token = results.get_token;
                var skipValue = currPage * 10;

                var path = '/workers/decorationCases?'+ 'filter='+ filters + /*'&sort=create_time::-1' +*/ '&limit=10&offset='+ skipValue + '&accessToken=' + token ;
                var optionItem = {};
                optionItem['path'] = path;
                request.get(optionItem,callback);
            }]
        },
        function(err, results) {
            if(err !== null){

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:err});
            }else{

                var token = results.get_token;
                var counts = jsonConvert.stringToJson(results.get_all)['count'];
                if(counts === 0){
                    res.json({
                            result: 'success',
                            pages:1,
                            content:[]}
                    );
                    return;
                }
                var allCounts = counts;

                //get product list
                var pageCounts = 1;
                if(allCounts > 0){
                    var over = (allCounts) % 10;
                    over > 0 ? pageCounts = parseInt((allCounts) / 10) + 1 :  pageCounts = parseInt((allCounts) / 10) ;
                }

                //第一页用户数组
                var array = jsonConvert.stringToJson(results.get_currPage)['decoration_cases'];
                res.json({ result: 'success',
                    pages:pageCounts,
                    content:array});
            }
        }
    );
}

Worker.prototype.updateWorkersCasesById = function(req,res){
    var caseId = req.params.id;
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
            set_status: ['get_token', function (callback, results) {

                var token = results.get_token;
                var path = '/workers/decorationCases/' + caseId + '/verificationStatus?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                var content = req.body;
                var bodyString = JSON.stringify(content);

                request.post(optionItem,bodyString,callback);
            }]
        },function(err,result){
            if(err === null){

                res.json({
                    result: 'success',
                    content: ''})
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
}