/**
 * Created by Administrator on 2015/11/22.
 */

var request = require('./request.js');
var jsonConvert = require('../lib/jsonFormat.js');
var settings = require('../conf/settings');

var connectAddr = "http://" +settings.bmpMgtIpAddr + ':' + settings.bmpMgtPortAddr;

exports.getProcess = function(req,res){

    //var options = settings.bmpMgtAddr + req.originalUrl;

    res.render('extra-signin', { title: '主页' });

};

exports.postProcess = function(req,res){

    var username = req.body.username;
    var pw = req.body.password;

    var options = connectAddr + '/users?$filter=username eq ' + '\'' + username + '\'' + ' and password eq ' + '\'' + pw + '\'';

    request.get(options,function(err,results){
        if(err === null){
            var jsonObj = jsonConvert.stringToJson(results);
            var array = jsonObj['value'];
            if(array.length === 0){
                //no user in db
                res.send(jsonConvert.jsonToString({
                    result:'fail',
                    content:'用户名与密码匹配不成功...'
                }));
            }else{
                //login success...
                req.session.user = array[0];
                res.send(jsonConvert.jsonToString({
                    result:'success',
                    //code:200,
                    content:''
                }));
            }
        }else{
            res.send(jsonConvert.jsonToString({
                result:'fail',
                content:err
            }));
        }
    });
};




















//test
//    var body = {
//        "username1" : "fungwan",
//        "password" : "123123"
//    };

//    var bodyString = JSON.stringify(body);
//
//    var options = {
//        host: 'localhost',
//        port:'3000',
//        path: '/users',
//        method: 'POST',
//        headers: {
//            'Accept': '/',
//            'Content-Type':'application/json;charset=UTF-8',
//            'Content-Length': bodyString.length
//        }
//    };
//
//    request.post(options,bodyString,function(err,results){
//        if(err === null){
//            console.log(results);
//            res.render('login', { title: '主页' });
//        }else{
//            console.log(err);
//            res.render('login', { title: 'cuowu' });
//        }
//    });