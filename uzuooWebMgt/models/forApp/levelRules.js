/**
 * Created by Administrator on 2016/1/5.
 */

var request = require('./requestForGo.js');
var tokenMgt = require('./tokenMgt');
var jsonConvert = require('../../lib/jsonFormat.js');
var logger = require('../../lib/log.js').logger;
var async = require('async');



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


