/**
 * Created by Administrator on 2015/11/22.
 */

var request = require('./request.js');
var jsonConvert = require('../lib/jsonFormat.js');
var settings = require('../conf/settings');

exports.getProcess = function(req,res){

    var options = settings.bmpMgtAddr + '/users';
    request.get(options,function(err,results){
        if(err === null){
            res.render('background_users.ejs', { title: '后台用户' });
        }else{
            res.send(503);
        }
    });

};


exports.postProcess = function(req,res){


};


exports.findUserByName = function(req,res){

    var username = req.query.username;
    var options = settings.bmpMgtAddr + '/users?$filter=username eq ' + '\'' + username + '\'' ;

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

exports.createAccount = function(req,res){

    var content = req.body;

    var bodyString = JSON.stringify(content);
    var options = {
        host: 'localhost',
        port:'3000',
        path: '/users',
        method: 'POST',
        headers: {
            'Accept': '/',
            'Content-Type':'application/json'
        }
    };

    request.post(options,bodyString,function(err,results){
        if(err === null){
            console.log('chengg');
            res.json({ result: 'success',
                content:results});
        }else{
            res.json({ result: 'fail',
                content:err});
        }
    });

};

