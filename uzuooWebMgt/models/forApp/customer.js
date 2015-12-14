/**
 * Created by Administrator on 2015/11/22.
 */

var request = require('./requestForGo.js');
var jsonConvert = require('../../lib/jsonFormat.js');
var settings = require('../../conf/settings');
var async = require('async');
var fs = require("fs");
var connectAddr = "http://" + settings.bmpMgtIpAddr + ':' + settings.bmpMgtPortAddr;

var qiniu = require('qiniu');
qiniu.conf.ACCESS_KEY = '5yc6AUXYdTdFoEDnqLPxC8vfB4AxkOAERBEtJcZ-'
qiniu.conf.SECRET_KEY = '7IDegFrh_gk9EVE9Ak_XDkgA1hkTWn3eOoy25tq7'
var qiniuToken = uptoken('fungwan');

exports.getProcess = function(req,res){

    res.render('front_end_users.ejs',
        {
            userInfo:req.session.user
        });
};


function uploadFile(localFile, key, uptoken) {
    var extra = new qiniu.io.PutExtra();
    //extra.params = params;
    //extra.mimeType = mimeType;
    //extra.crc32 = crc32;
    //extra.checkCrc = checkCrc;

    qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
        if(!err) {
            // 上传成功， 处理返回值
            console.log(ret.key, ret.hash);
            // ret.key & ret.hash
            fs.unlinkSync(localFile);
        } else {
            // 上传失败， 处理返回代码
            console.log(err);
            // http://developer.qiniu.com/docs/v6/api/reference/codes.html
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


exports.updateCustomerById = function(req,res){

    var content = req.body.content;
    var imgData = content.imgData;
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

                uploadFile(savePath,workerId+'.jpg',qiniuToken);

                res.json({ result: 'success',
                    content:''});
            }
        });
    }





    // var putPath = '/users(' + req.body.id + ')';

    // var bodyString = JSON.stringify(content);

    // var optionItem = {};
    // optionItem['path'] = putPath;

    // request.put(optionItem,bodyString,function(err,results){
    //     if(err === null){
    //         res.json({ result: 'success',
    //             content:results});
    //     }else{
    //         res.json({ result: 'fail',
    //             content:err});
    //     }
    // });
};

exports.findUsersByPage = function(req,res){

    var currPage = req.query.page - 1;

    async.auto(
        {
            get_all: function (callback) {
                var options = connectAddr + '/users?$count=true';
                request.get(options,callback);
            },
            get_currPage: function (callback) {

                var skipValue = currPage * 10;
                var options = connectAddr + '/users?$top=10&$skip=' + skipValue;//
                request.get(options,callback);
            }
        },
        function(err, results) {
            if(err !== null){
                res.json({ result: 'fail',
                    content:err});
            }else{


                var allUserCounts = jsonConvert.stringToJson(results.get_all)['@odata.count'];

                //get product list
                var pageCounts = 1;
                if(allUserCounts > 0){
                    var over = (allUserCounts) % 10;
                    over > 0 ? pageCounts = parseInt((allUserCounts) / 10) + 1 :  pageCounts = parseInt((allUserCounts) / 10) ;
                }

                //第一页用户数组
                var userArray = jsonConvert.stringToJson(results.get_currPage)['value'];

                res.json({
                        result: 'success',
                        pages:pageCounts,
                        content:userArray}
                );
            }
        }
    );
};

exports.findUserByName = function(req,res){

    var username = req.query.username;
    var options = connectAddr + '/users?$filter=username eq ' + '\'' + username + '\'' ;

    request.get(options,function(err,results){
        if(err === null){
            var jsonObj = jsonConvert.stringToJson(results);
            var array = jsonObj['value'];
            if(array.length === 0){
                //no user in db
                res.json({ result: 'success',
                    content:''});
            }else{

                res.json({ result: 'fail',
                    content:'user has been exist...'});
            }
        }else{
            res.json({ result: 'fail',
                content:err});
        }
    });

};