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
                    if(err === null){
                        callback(null,token);
                    }else{
                        callback(err,'can not get token...');
                    }
                });
            },
            get_all: ['get_token',function (callback,results) {

                var token = results.get_token;
                var path = '/v1/workers?'+'accessToken=' + token + '&filter='+'verified::1';
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }],
            get_currPage: ['get_token',function (callback,results) {

                var token = results.get_token;
                var skipValue = currPage * 10;
                var path = '/v1/workers?'+'accessToken=' + token + '&filter='+'verified::1&limit=10&offset='+ skipValue;
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


                var workersArray = jsonConvert.stringToJson(results.get_all)['workers'];
                if(workersArray === null){//db里面一个工人也没有.
                    res.json({
                            result: 'success',
                            pages:1,
                            content:[]}
                    );
                    return;
                }
                var allUserCounts = jsonConvert.stringToJson(results.get_all)['workers'].length;

                //get product list
                var pageCounts = 1;
                if(allUserCounts > 0){
                    var over = (allUserCounts) % 10;
                    over > 0 ? pageCounts = parseInt((allUserCounts) / 10) + 1 :  pageCounts = parseInt((allUserCounts) / 10) ;
                }

                //第一页用户数组
                var userArray = jsonConvert.stringToJson(results.get_currPage)['workers'];

                res.json({
                        result: 'success',
                        pages:pageCounts,
                        content:userArray}
                );
            }
        }
    );
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