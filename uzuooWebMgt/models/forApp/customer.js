/**
 * Created by Administrator on 2015/11/22.
 */

var request = require('./requestForGo.js');
var tokenMgt = require('./tokenMgt');
var jsonConvert = require('../../lib/jsonFormat.js');
var settings = require('../../conf/settings');
var async = require('async');
var fs = require("fs");

var qiniu = require('qiniu');
//Qn1ZHcP_WhGVHH3xW-tnsxMkJZTVydj4Fy3zLYj1
//DrKZUYTpYBApJAFBRSH5u7xaXd4xaSto9uq1eZfw


//aYJyH8km-caWa-XaBxW9oL1MjFiJTN-rrYsBRRzA
//MTlZJIlIc3mM378_-bVBHWFU4aA2KjIFJ-nFT60U

qiniu.conf.ACCESS_KEY = '5yc6AUXYdTdFoEDnqLPxC8vfB4AxkOAERBEtJcZ-'
qiniu.conf.SECRET_KEY = '7IDegFrh_gk9EVE9Ak_XDkgA1hkTWn3eOoy25tq7'
var qiniuToken = uptoken('fungwan');//uzuoo-photos

exports.getProcess = function(req,res){

    res.render('front_end_users.ejs',
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


exports.updateWorkersById = function(req,res){

    var content = req.body.content;
    var imgData = content.imgData;

    var optionItem = {};
    var putPath = '/users(' + req.body.id + ')';
    optionItem['path'] = putPath;

    if(imgData.search(/^data:image\/\w+;base64,/) === -1){
        //图片不用更新上传,只更新其他数据

        res.json({ result: 'success',
            content:''});
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

                uploadFile(savePath,workerId+'.jpg',qiniuToken,function(err,results){
                    if(err === null){
                        content.imgData = 'http://7xooab.com1.z0.glb.clouddn.com/boy.jpeg';
                        var bodyString = JSON.stringify(content);

                        request.post(optionItem,bodyString,function(err,results){
                            if(err === null){
                                res.json({ result: 'success',
                                    content:results});
                            }else{
                                res.json({ result: 'fail',
                                    content:err});
                            }
                        });

                    }else{
                        delete content.imgData;//图片上传失败。不更新db数据
                        var bodyString = JSON.stringify(content);

                        request.post(optionItem,bodyString,function(err,results){
                             if(err === null){
                                 res.json({ result: 'success',
                                     content:results});
                             }else{
                                 res.json({ result: 'fail',
                                     content:err});
                             }
                        });
                    }
                });
            }
        });
    }
};

exports.findWorkersByPage = function(req,res){

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

                                regionsMap[provincesArray[y]['id']] = provincesArray[y]['name'];
                                var citiesArray = provincesArray[y]['cities'];
                                for(z in citiesArray){

                                    //取到城市组
                                    regionsMap[citiesArray[z]['id']] = citiesArray[z]['name'];
                                    var regionsArray = citiesArray[z]['regions'];

                                    //取到区域
                                    var regionsNameArray = [];
                                    for(index in regionsArray){
                                        regionsMap[regionsArray[index]['id']] = regionsArray[index]['name'];//取到区域
                                    }
                                }
                            }

                            cb(null,regionsMap);

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

                            cb(null,rolesMap);
                        });
                    }
                ],function (err, resultsEx){
                    if(!err){
                        var regionsMap = resultsEx[0];
                        var rolesMap = resultsEx[1];
                        var localData = [];
                        localData.push(regionsMap);
                        localData.push(rolesMap);
                        callback(null,localData);
                    }else{
                        callback(null,[]);
                    }
                });
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
                var regionsMap = regionsAndRolesArray[0];
                var rolesMap = regionsAndRolesArray[1];

                var counts = 0;

                //串行查找每个工人的区域、角色和详情
                async.eachSeries(workerArray, function(item, callback) {
                    //console.log('1.3 enter: ' + item.name);
                    ++counts;
                    var workerItemObj = item;
                    var workerDetailLink = workerItemObj['href'];
                    var pos = workerDetailLink.lastIndexOf('/');
                    var workerId = workerDetailLink.substr(pos+1);

                    var workerIdPath = '/v1/workers/'+ workerId +'?accessToken=' + token;

                    var workerItem = {};
                    workerItem['path'] = workerIdPath;

                    //获取指定workerID的相关信息,取全名
                    request.get(workerItem,function(err,data){
                        if(err !== null){
                            callback(err, '');
                            return;
                        }

                        var firstName = jsonConvert.stringToJson(data)['first_name'];
                        var lastName = jsonConvert.stringToJson(data)['last_name'];
                        item['fullName'] = firstName+lastName;
                        item['workerId'] = workerId;
                        item['verify_photo'] = jsonConvert.stringToJson(data)['verify_photo'];
                        item['phone'] = jsonConvert.stringToJson(data)['phone'];
                        item['id_card_no'] = jsonConvert.stringToJson(data)['id_card_no'];//身份证
                        item['username'] = jsonConvert.stringToJson(data)['user_name'];

                        var regionsArray = workerItemObj['regions'];
                        var tmp = [];
                        for(x in regionsArray){
                            tmp.push(regionsMap[regionsArray[x]]);
                        }
                        item['regionsValuesArray'] = tmp;

                        var rolesArray = workerItemObj['categories'];
                        var tmp2 = [];
                        for(y in rolesArray){
                            tmp2.push(rolesMap[rolesArray[y]['role_id']]);
                        }

                        item['rolesValuesArray'] = tmp2;

                        callback(null, workerItemObj);
                        workerArrayEx.push(item);
                        if(counts === workerArrayEx.length){
                            res.json({ result: 'success',
                                pages:pageCounts,
                                content:workerArrayEx});
                        }
                    });

                }, function(err,resultsEx) {
                    //console.log(resultsEx);
                    //console.log('1.3 err: ' + err);
                    if(err){
                        res.json({ result: 'fail',
                            content:[]});
                    }
                });
            }
        }
    );
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
                    verified:verifiedContent.verified
                };

                var bodyString = JSON.stringify(content);

                request.post(optionItem,bodyString,callback);

            }, function(err,results) {
                if(!err){
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
            callback(err, 'can not get token...');
        }
    });


};

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