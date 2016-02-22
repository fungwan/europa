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

//获取积分规则
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


//更新积分规则
exports.updatePointsRule = function(req,res){

    var cityStr = req.session.user.city;
    var cityId  = cityStr.substr(cityStr.indexOf(',')+1,cityStr.length);
    var roleId = req.body.roleId;
    
    var pointRule = {
        score_inc_by_good : parseInt(req.body.content.score_inc_by_good),
        score_inc_by_normal : parseInt(req.body.content.score_inc_by_normal),
        score_inc_by_bad : parseInt(req.body.content.score_inc_by_bad),
        score_inc_by_pay : parseFloat(req.body.content.score_inc_by_pay)
    } ;

    //var pointRule = req.body.content;
    
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
                content = pointRule;
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
