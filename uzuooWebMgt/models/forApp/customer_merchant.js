/**
 * Created by fungwan on 2016/3/28.
 */


var request = require('./requestForGo.js');
var historyMgt = require('../history.js');
var tokenMgt = require('./tokenMgt');
var jsonConvert = require('../../lib/jsonFormat.js');
var logger = require('../../lib/log.js').logger;
var async = require('async');
var fs = require("fs");

var uuid = require('node-uuid');
var qiniu = require('qiniu');

var multiparty = require('multiparty');
var qiniuToken = uptoken('uzuoo-photos');//uzuoo-photos

module.exports = Merchant;

function Merchant(){

}

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

    var verifiedPath = '/merchants/' + id + '/verificationStatus?accessToken=' + token;
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

Merchant.prototype.updateMerchantsCasesById = function(req,res){
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
                var path = '/merchants/decorationCases/' + caseId + '/verificationStatus?accessToken=' + token;
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
};

Merchant.prototype.findMerchantsByFilters = function(req,res){
    var currPage = req.query.page - 1;
    var filters = req.query.filters;
    // var filters = filterArray.join(",");
    var cityStr = req.session.user.city;
    var cityId  = cityStr.substr(cityStr.indexOf(',')+1,cityStr.length);
    if(filters.indexOf('all')!== -1){
        filters = 'city::' + cityId;
    }else{
        filters += ',city::' + cityId;
    }
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
                var path = '/merchants?' + 'filter=' + filters + '&limit=-1&countOnly=true' +'&accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }],
            get_currPage: ['get_token',function (callback,results) {

                var token = results.get_token;
                var skipValue = currPage * 10;

                var path = '/merchants?'+ 'filter='+ filters + /*'&sort=create_time::-1' +*/ '&limit=10&offset='+ skipValue + '&accessToken=' + token ;
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
                var array = jsonConvert.stringToJson(results.get_currPage)['merchants'];
                res.json({ result: 'success',
                    pages:pageCounts,
                    content:array});
            }
        }
    );
};

Merchant.prototype.getMerchandiseById = function(req,res){
    var merchantId = req.params.id;

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
                var path = '/merchants/' + merchantId +'/merchandise?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;
                request.get(optionItem,callback);
            }]
        },function(err,results){
            if(err === null){
                var merchandiseInfo = jsonConvert.stringToJson(results.get_decorationCases);
                res.json({ result: 'success',
                    content:merchandiseInfo});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:{}});
            }
        })
};

Merchant.prototype.findMerchantById = function(req,res){
    var merchantId = req.params.id;

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
            get_merchantInfo:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/merchants/' + merchantId +'?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }]
        },function(err,results){
            if(err === null){
                var merchantInfo = jsonConvert.stringToJson(results.get_merchantInfo);
                res.json({ result: 'success',
                    content:merchantInfo});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:{}});
            }
        })
};

Merchant.prototype.getMerchantsCases = function(req,res){
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
                var path = '/merchants/decorationCases?' + 'filter=' + filters + '&limit=-1&countOnly=true' +'&accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }],
            get_currPage: ['get_token',function (callback,results) {

                var token = results.get_token;
                var skipValue = currPage * 10;

                var path = '/merchants/decorationCases?'+ 'filter='+ filters + /*'&sort=create_time::-1' +*/ '&limit=10&offset='+ skipValue + '&accessToken=' + token ;
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
};

Merchant.prototype.verifiedMerchantById = function(req,res){
    var idArray = req.body.ids;
    var verifiedContent = req.body.content;

    tokenMgt.getToken(function (err, token) {
        if (err === null) {
            async.map(idArray, function(item, callback) {

                var path = '/merchants/' + item + '/verificationStatus?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                var content = {
                    verified:parseInt(verifiedContent.verified),
                    reason:verifiedContent.reason
                };

                var bodyString = JSON.stringify(content);

                request.post(optionItem,bodyString,callback);

                var desc = '';
                desc = '为商家' + item + '执行了认证动作';
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

Merchant.prototype.getMerchandises = function(req,res){
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
                var path = '/merchandises?' + 'filter=' + filters + '&limit=-1&countOnly=true' +'&accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }],
            get_currPage: ['get_token',function (callback,results) {

                var token = results.get_token;
                var skipValue = currPage * 10;

                var path = '/merchandises?'+ 'filter='+ filters + /*'&sort=create_time::-1' +*/ '&limit=10&offset='+ skipValue + '&accessToken=' + token ;
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
                var array = jsonConvert.stringToJson(results.get_currPage)['merchandises'];
                res.json({ result: 'success',
                    pages:pageCounts,
                    content:array});
            }
        }
    );
};

Merchant.prototype.updateMerchandisesById = function(req,res){
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
                var path = '/merchandises/' + caseId + '/verificationStatus?accessToken=' + token;
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
};

Merchant.prototype.getMerchantDecorationCasesDetailById = function(req,res){
    var merchantId = req.params.id;
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
                var path = '/merchants/' + merchantId +'/decorationCases/' +caseId+ '?accessToken=' + token;
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
};

Merchant.prototype.findMerchantVerifiedRecordById = function(req,res){
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
                var path = '/merchants/' + userId + '/verification_logs?accessToken=' + token;
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
};

Merchant.prototype.getMerchantDecorationCasesById = function(req,res){
    var merchantId = req.params.id;

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
                var path = '/merchants/' + merchantId +'/decorationCases?accessToken=' + token;
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
};

Merchant.prototype.updateMerchantProfileById = function(req,res){

    var merchantId = req.params.id;

    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {

        var content =  JSON.parse(fields.content[0]);
        /*var savePath = '';
        if (files && files.file && files.file[0] && files.file[0].headers && files.file[0].headers['content-type'].search('image') !== -1) {
            savePath = files.file[0].path;
        }*/

        content.content.verify_photo = [];

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
                get_merchantPic1:function(callback){

                    var qiniuFileName1 = uuid.v1();
                    var savePath1 = files.file[0].path;

                    uploadFile(savePath1,qiniuFileName1,qiniuToken.token(),function(err,results){
                        if(err === null){
                            content.content.verify_photo.push(qiniuFileName1);
                            callback(null, '');

                        }else{
                            callback('uploadImgError', '');
                        }
                    });
                },
                get_merchantPic2:function(callback){

                    var savePath2 = files.file[1].path;
                    var qiniuFileName2 = uuid.v1();
                    uploadFile(savePath2,qiniuFileName2,qiniuToken.token(),function(err,results){
                        if(err === null){
                            content.content.verify_photo.push(qiniuFileName2);
                            callback(null, '');

                        }else{
                            callback('uploadImgError', '');
                        }
                    });

                },
                get_merchantPic:['get_token','get_merchantPic1','get_merchantPic2',function(callback,results){
                    var token = results.get_token;


                    //console.log(content.verify_photo);
                    var optionItem = {};
                    var putPath = '/merchants/' + merchantId + '/verification?accessToken=' + token;
                    optionItem['path'] = putPath;


                    var bodyString = JSON.stringify(content.content);

                    request.post(optionItem,bodyString,function(err,results){
                        if(err === null){

                            verifiedSuccess(merchantId,token);
                            var desc = '';
                            var merchantName = content.content.name;
                            desc = '为商家' + merchantName + '执行了现场认证';
                            historyMgt.addLogsEx(req,res,desc);

                            callback(null,'');

                        }else{

                            callback('error','');
                        }
                    });
                }]
            },function(err,results){
                if(err === null){

                    res.json({ result: 'success',
                        content:results});

                }else{

                    if(err === 403){
                        tokenMgt.setTokenExpireStates(true);
                    }

                    res.json({ result: 'fail',
                        content:{}});
                }
            })
    });
};




