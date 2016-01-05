/**
 * Created by Administrator on 2015/11/22.
 */

var request = require('./requestForGo.js');
var tokenMgt = require('./tokenMgt');
var jsonConvert = require('../../lib/jsonFormat.js');
var settings = require('../../conf/settings');
var logger = require('../../lib/log.js').logger;
var async = require('async');
var fs = require("fs");

var uuid = require('node-uuid');
var qiniu = require('qiniu');
//Qn1ZHcP_WhGVHH3xW-tnsxMkJZTVydj4Fy3zLYj1
//DrKZUYTpYBApJAFBRSH5u7xaXd4xaSto9uq1eZfw


//aYJyH8km-caWa-XaBxW9oL1MjFiJTN-rrYsBRRzA
//MTlZJIlIc3mM378_-bVBHWFU4aA2KjIFJ-nFT60U

qiniu.conf.ACCESS_KEY = 'Qn1ZHcP_WhGVHH3xW-tnsxMkJZTVydj4Fy3zLYj1'
qiniu.conf.SECRET_KEY = 'DrKZUYTpYBApJAFBRSH5u7xaXd4xaSto9uq1eZfw'
var qiniuToken = uptoken('uzuoo-photos');//uzuoo-photos

exports.getProcess = function(req,res){

    res.render('front_end_users.ejs',
        {
            userInfo:req.session.user
        });
};

exports.getTodoVerifiedPageProcess = function(req,res){

    res.render('todoVerifiedWorkers.ejs',
        {
            userInfo:req.session.user
        });
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

    return putPolicy.token();
}


exports.updateWorkerProfileById = function(req,res){

    var content = req.body.content;
    var imgData = content.verify_photo;

    tokenMgt.getToken(function(err,token){
        if(!err){

            //更新工人联系方式

            //更新工人状态为已认证
            var verifiedString = JSON.stringify({
                "verified":	2,
                "reason" : ''
            });

            var verifiedPath = '/v1/workers/' + req.body.id + '/verificationStatus?accessToken=' + token;
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

            var optionItem = {};
            var putPath = '/v1/workers/' + req.body.id + '/verification?accessToken=' + token;
            optionItem['path'] = putPath;

            if(imgData.search(/^data:image\/\w+;base64,/) === -1){

                //图片不用更新上传,只更新其他数据

                content.verify_photo = '';//图片上传失败。不更新db数据
                var bodyString = JSON.stringify(content);

                request.post(optionItem,bodyString,function(err,results){
                    if(err === null){
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
                var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
                var dataBuffer = new Buffer(base64Data, 'base64');
                var workerId = req.body.id;
                var savePath = workerId + '.jpg';
                fs.writeFile(savePath, dataBuffer, function(err) {
                    if(err){
                        res.json({ result: 'fail',
                            content:err});
                    }else{

                        tokenMgt.getQiniuToken(function(err,qiniu_token){
                            if(err !== null){
                                res.json({ result: 'fail',
                                    content:err});
                            }

                            //qiniuToken为我自己生成
                            var qiniuFileName = uuid.v1();
                            uploadFile(savePath,qiniuFileName,qiniuToken,function(err,results){
                                if(err === null){
                                    content.verify_photo = qiniuFileName;
                                    var bodyString = JSON.stringify(content);

                                    request.post(optionItem,bodyString,function(err,results){
                                        if(err === null){
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
                                    content.verify_photo = '';//图片上传失败。不更新db数据
                                    var bodyString = JSON.stringify(content);

                                    request.post(optionItem,bodyString,function(err,results){
                                        if(err === null){
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
};

/*exports.findWorkersByPage = function(req,res){

    var currPage = req.query.page - 1;

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
            get_roleAndRegions:['get_token',function(callback,results){

                var token = results.get_token;

                getroleAndRegions(token,callback);
            }],
            get_all: ['get_token',function (callback,results) {

                var token = results.get_token;
                var path = '/v1/workers?'+'accessToken=' + token + '&filter=all';
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }],
            get_currPage: ['get_token',function (callback,results) {

                var token = results.get_token;
                var skipValue = currPage * 10;

                //获取工人信息
                var path = '/v1/workers?'+'accessToken=' + token + '&filter='+'all&limit=10&offset='+ skipValue;
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
                var workersArray = jsonConvert.stringToJson(results.get_all)['workers'];
                if(workersArray === null){//db里面一个工人也没有.
                    res.json({
                            result: 'success',
                            pages:1,
                            content:[]}
                    );
                    return;
                }
                var allUserCounts = workersArray.length;

                //get product list
                var pageCounts = 1;
                if(allUserCounts > 0){
                    var over = (allUserCounts) % 10;
                    over > 0 ? pageCounts = parseInt((allUserCounts) / 10) + 1 :  pageCounts = parseInt((allUserCounts) / 10) ;
                }

                //第一页用户数组
                var workerArray = jsonConvert.stringToJson(results.get_currPage)['workers'];
                var workerArrayEx = [];

                var regionsAndRolesArray = results.get_roleAndRegions;
                if(regionsAndRolesArray.length === 0){
                    res.json({ result: 'fail',
                        pages:1,
                        content:'',
                        additionalData:''});
                    return;
                }
                var regionsMap = regionsAndRolesArray[0][1];
                var rolesMap = regionsAndRolesArray[1][1];

                var counts = 0;

                for(x in workerArray){
                    var item = workerArray[x];
                    var workerDetailLink = item['href'];
                    var pos = workerDetailLink.lastIndexOf('/');
                    var workerId = workerDetailLink.substr(pos+1);
                    item['workerId'] = workerId;

                    var regionsArray = item['regions'];
                    var tmp = [];
                    for(x in regionsArray){
                        tmp.push(regionsMap[regionsArray[x]].name);
                    }
                    item['regionsValuesArray'] = tmp;
                    if(regionsArray[0] === undefined){
                        item['city'] = '';
                    }else{
                        item['city'] = regionsMap[regionsArray[0]].parent;
                    }


                    var rolesArray = item['categories'];
                    var tmp2 = [];
                    for(y in rolesArray){
                        tmp2.push(rolesMap[rolesArray[y]['role_id']]);
                    }

                    item['rolesValuesArray'] = tmp2;

                    workerArrayEx.push(item);
                }

                res.json({ result: 'success',
                    pages:pageCounts,
                    content:workerArrayEx,
                    additionalData:regionsAndRolesArray});
            }
        }
    );
};*/

exports.findWorkerById = function(req,res){

    var workerId = req.query.id;

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
                var path = '/v1/workers/' + workerId +'?accessToken=' + token;
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
};

exports.findWorkersByFilters = function(req,res){
    var currPage = req.query.page - 1;
    var filterArray = req.query.filters;
    var filters = filterArray.join(",");

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
                var path = '/v1/workers?'+'accessToken=' + token + '&filter=' + filters;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }],
            get_currPage: ['get_token',function (callback,results) {

                var token = results.get_token;
                var skipValue = currPage * 10;

                //获取工人信息
                var path = '/v1/workers?'+'accessToken=' + token + '&filter='+ filters + '&limit=10&offset='+ skipValue;
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
                var workersArray = jsonConvert.stringToJson(results.get_all)['workers'];
                if(workersArray === null){//db里面一个工人也没有.
                    res.json({
                            result: 'success',
                            pages:1,
                            content:[]}
                    );
                    return;
                }
                var allUserCounts = workersArray.length;

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

                var workerArrayEx = [];

                /*var regionsAndRolesArray = results.get_roleAndRegions;
                if(regionsAndRolesArray.length === 0){
                    res.json({ result: 'fail',
                        pages:1,
                        content:'',
                        additionalData:''});
                    return;
                }

                var regionsMap = regionsAndRolesArray[0][1];
                var rolesMap = regionsAndRolesArray[1][1];

                var counts = 0;

                for(x in workerArray){
                    var item = workerArray[x];
                    var workerDetailLink = item['href'];
                    var pos = workerDetailLink.lastIndexOf('/');
                    var workerId = workerDetailLink.substr(pos+1);
                    item['workerId'] = workerId;

                    var regionsArray = item['regions'];
                    var tmp = [];
                    for(x in regionsArray){
                        tmp.push(regionsMap[regionsArray[x]].name);
                    }
                    item['regionsValuesArray'] = tmp;
                    if(regionsArray[0] === undefined){
                        item['city'] = '';
                    }else{
                        item['city'] = regionsMap[regionsArray[0]].parent;
                    }

                    var rolesArray = item['categories'];
                    var tmp2 = [];
                    for(y in rolesArray){
                        tmp2.push(rolesMap[rolesArray[y]['role_id']]);
                    }

                    item['rolesValuesArray'] = tmp2;

                    workerArrayEx.push(item);
                }

                 res.json({ result: 'success',
                 pages:pageCounts,
                 content:workerArrayEx,
                 additionalData:regionsAndRolesArray});*/

            }
        }
    );
}

exports.changeWorkerRole = function(req,res){

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
                var path = '/v1/workers/'+ id + '/roles?accessToken=' + token;
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
};

exports.findHouseOwnersByPage = function(req,res){

    var currPage = req.query.page - 1;
    async.auto(
        {
            get_token: function (callback) {

                tokenMgt.getToken(function (err, token) {
                    if (err === null) {
                        callback(null, token);
                    } else {
                        callback(err, 'can not get token...');
                    }
                });
            },
            get_all: ['get_token',function (callback,results) {

            var token = results.get_token;
            var path = '/v1/houseOwners?'+'accessToken=' + token + '&filter=all';
            var optionItem = {};
            optionItem['path'] = path;

            request.get(optionItem,callback);

            }],
            get_currPage: ['get_token',function (callback,results) {

                var token = results.get_token;
                var skipValue = currPage * 10;

                //获取工人信息
                var path = '/v1/houseOwners?'+'accessToken=' + token + '&filter='+'all&limit=10&offset='+ skipValue;
                var optionItem = {};
                optionItem['path'] = path;
                request.get(optionItem,callback);

            }]
        },function(err,results){

            if(err !== null){
                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    pages:1,
                    content:[]});

                return;
            }


            var houseownersArray = jsonConvert.stringToJson(results.get_all)['houseowners'];
            if(houseownersArray === null){//db里面一个屋主也没有.
                res.json({
                        result: 'success',
                        pages:1,
                        content:[]}
                );
                return;
            }
            var allUserCounts = houseownersArray.length;

            //get product list
            var pageCounts = 1;
            if(allUserCounts > 0){
                var over = (allUserCounts) % 10;
                over > 0 ? pageCounts = parseInt((allUserCounts) / 10) + 1 :  pageCounts = parseInt((allUserCounts) / 10) ;
            }

            //第一页用户数组
            var houseownersArray = jsonConvert.stringToJson(results.get_currPage)['houseowners'];

            res.json({ result: 'success',
                pages:pageCounts,
                content:houseownersArray});
        }
    )
}

exports.verifiedById = function(req,res){

    var idArray = req.body.ids;
    var verifiedContent = req.body.content;

    tokenMgt.getToken(function (err, token) {
        if (err === null) {
            async.map(idArray, function(item, callback) {

                var path = '/v1/workers/' + item + '/verificationStatus?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                var content = {
                    verified:parseInt(verifiedContent.verified)
                };

                var bodyString = JSON.stringify(content);

                request.post(optionItem,bodyString,callback);

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


};

function getroleAndRegions(token,callback){

    async.parallel([ //找施工区域
        function(cb) {

            var regionsPath = '/v1/countries/001/administrativeDivision?'+'accessToken=' + token;
            var regionsItem = {};
            regionsItem['path'] = regionsPath;

            //通过国家Get所有省份
            request.get(regionsItem,function(err,data){

                if(err !== null){
                    cb(err,{});
                    return;
                }

                var regionsMap = {};

                //取到省份组
                var provincesArray = jsonConvert.stringToJson(data)['provinces'];
                for(y in provincesArray){

                    //regionsMap[provincesArray[y]['id']] = provincesArray[y]['name'];//if it is sichuan
                    var tmp2Obj = {};
                    tmp2Obj['name'] = provincesArray[y]['name'];
                    regionsMap[provincesArray[y]['id']] = tmp2Obj;
                    regionsMap[provincesArray[y]['id']]['children'] = provincesArray[y]['cities'];

                    var citiesArray = provincesArray[y]['cities'];
                    for(z in citiesArray){

                        //取到城市组
                        var tmp4Obj = {};
                        tmp4Obj['name'] = citiesArray[z]['name'];
                        regionsMap[citiesArray[z]['id']] = tmp4Obj;
                        regionsMap[citiesArray[z]['id']]['children'] = citiesArray[z]['regions'];

                        var regionsArray = citiesArray[z]['regions'];

                        //取到区域
                        var regionsNameArray = [];
                        for(index in regionsArray){

                            var tmpObj = {};
                            tmpObj['name'] = regionsArray[index]['name'];
                            tmpObj['parent'] = citiesArray[z]['name'];

                            regionsMap[regionsArray[index]['id']] = tmpObj;//取到区域
                        }
                    }
                }

                var tmpRegions = [];
                tmpRegions.push(provincesArray);
                tmpRegions.push(regionsMap);
                cb(null,tmpRegions);

            });
        },
        //找到工人对应角色
        function(cb) {
            var rolesMap = {};

            var roleArray = [];
            var rolePath = '/v1/workers/roles?'+'accessToken=' + token;

            var roleItem = {};
            roleItem['path'] = rolePath;

            //获取所有角色组
            request.get(roleItem,function(err,data){
                if(err !== null){
                    cb(err,{});
                    return;
                }

                var array = jsonConvert.stringToJson(data)['roles'];//包含所有角色信息
                for(x in array){
                    var roleItem = array[x];
                    rolesMap[roleItem['id']] = roleItem['name'];//取到角色
                    var craftArray = roleItem['crafts'];
                    for(y in craftArray){
                        rolesMap[craftArray[y]['id']] = craftArray[y]['name'];//取到细项
                    }
                }
                var tmpRoles = [];
                tmpRoles.push(array);
                tmpRoles.push(rolesMap);
                cb(null,tmpRoles);
            });
        }
    ],function (err, resultsEx){
        if(!err){
            var regionsArray = resultsEx[0];//包含源对象和warp后的map对象
            var rolesArray = resultsEx[1];//同上
            var localData = [];
            localData.push(regionsArray);
            localData.push(rolesArray);
            callback(null,localData);
        }else{
            if(err === 403){
                tokenMgt.setTokenExpireStates(true);
            }
            logger.error(err + 'customer-区域和角色获取错误...' + resultsEx);
            callback(null,[]);
        }
    });
}

exports.getRoleAndRegions = function(req,res){
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
            get_roleAndRegions: ['get_token', function (callback, results) {

                var token = results.get_token;

                getroleAndRegions(token, callback);
            }]
        },function(err,result){
            if(err === null){
                res.json({
                    result: 'success',
                    content: result})
            }else{
                res.json({
                    result: 'fail',
                    content:err})
            }
        }
    );
};

exports.getCapitalAccountById = function(req,res){
    var workerId = req.query.id;

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
            get_capitalAccount:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/v1/capitalAccount/' + workerId +'?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;
                request.get(optionItem,callback);
            }]
        },function(err,results){
            if(err === null){
                var capitalAccountInfo = jsonConvert.stringToJson(results.get_capitalAccount);
                res.json({ result: 'success',
                    content:capitalAccountInfo});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:{}});
            }
        })
}
//exports.findUserByName = function(req,res){
//
//    var username = req.query.username;
//    var options = connectAddr + '/users?$filter=username eq ' + '\'' + username + '\'' ;
//
//    request.get(options,function(err,results){
//        if(err === null){
//            var jsonObj = jsonConvert.stringToJson(results);
//            var array = jsonObj['value'];
//            if(array.length === 0){
//                //no user in db
//                res.json({ result: 'success',
//                    content:''});
//            }else{
//
//                res.json({ result: 'fail',
//                    content:'user has been exist...'});
//            }
//        }else{
//            res.json({ result: 'fail',
//                content:err});
//        }
//    });
//
//};