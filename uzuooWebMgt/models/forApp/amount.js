/**
 * Created by Administrator on 2015/12/31.
 */


var request = require('./requestForGo.js');
var tokenMgt = require('./tokenMgt');
var jsonConvert = require('../../lib/jsonFormat.js');
var settings = require('../../conf/settings');
var logger = require('../../lib/log.js').logger;
var async = require('async');
var fs = require("fs");

var uuid = require('node-uuid');


exports.postProcess = function(req,res){

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
            update_amount: ['get_token', function (callback, results) {

                var token = results.get_token;
                var rId = req.body.roleId;
                var cId = req.body.craftId;

                var updateAmountPath = ' /workerRole/' + rId + '/craft/' + cId + '/setting?' +'accessToken=' + token;

                var item = {};
                item['path'] = updateAmountPath;

                var content = {
                    earnest:parseInt(req.body.earnest),
                    need_trustee:parseInt(req.body.need_trustee),
                    commssion_basic:parseFloat(req.body.commssion_basic),
                    commssion_float:parseFloat(req.body.commssion_float),
                    margin_rate:parseFloat(req.body.margin_rate),
                    margin_up_threshold:parseInt(req.body.margin_up_threshold),
                    margin_down_threshold:parseInt(req.body.margin_down_threshold)
                };

                var bodyString = JSON.stringify(content);

                request.post(item,bodyString,callback);

            }]
        },function(err,result){
            if(err === null){

                var feedbackArray = result.update_amount; //jsonConvert.stringToJson(result.update_amount);

                res.json({
                    result: 'success',
                    content: feedbackArray})
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

//获取角色相关配置
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


//更新角色相关配置
exports.updatePointsRule = function(req,res){

    var cityStr = req.session.user.city;
    var cityId  = cityStr.substr(cityStr.indexOf(',')+1,cityStr.length);
    var roleId = req.body.roleId;

    var roleRule = {
        margin_rate:parseFloat(req.body.content.margin_rate),
        margin_up_threshold : parseInt(req.body.content.margin_up_threshold),
        margin_down_threshold : parseInt(req.body.content.margin_down_threshold),
        freeze_time : parseInt(req.body.content.freeze_time) * 365 * 1000,
        default_margin_give : parseInt(req.body.content.default_margin_give),
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
                content = roleRule;
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

//获取细项相关配置
exports.getCraftRule = function(req,res){
    var cityStr = req.session.user.city;
    var cityId  = cityStr.substr(cityStr.indexOf(',')+1,cityStr.length);
    var craftId = req.query.craftId;
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
                var path = '/cities/' + cityId + '/crafts/' + craftId + '/setting?accessToken=' + token;
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

//更新细项相关配置
exports.updateCraftRule = function(req,res){

    var cityStr = req.session.user.city;
    var cityId  = cityStr.substr(cityStr.indexOf(',')+1,cityStr.length);
    var craftId = req.body.craftId;

    var craftRule = {
        earnest : parseInt(req.body.content.earnest),
        need_trustee : req.body.content.need_trustee ? 1:0,
        commission_basic : parseFloat(req.body.content.commission_basic),
        commission_float : parseFloat(req.body.content.commission_float)
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
                var path = '/cities/' + cityId + '/crafts/' + craftId + '/setting?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                var content ={};
                content = craftRule;
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

//获取推广工种
exports.getRecommendRole = function(req,res){
    var cityStr = req.session.user.city;
    var cityId  = cityStr.substr(cityStr.indexOf(',')+1,cityStr.length);

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
            get_recommend: ['get_token',function (callback,results) {

                var token = results.get_token;
                var path = '/cities/' + cityId + '/recommendation?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }]
        },function(err,result){
            if(err === null){
                var recommendRole = jsonConvert.stringToJson(result.get_recommend);
                res.json({
                        result: 'success',
                        content:recommendRole['recommendations']}
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

//设置推广工种
exports.setRecommendRole = function(req,res){

    var cityStr = req.session.user.city;
    var cityId  = cityStr.substr(cityStr.indexOf(',')+1,cityStr.length);

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
                var path = '/cities/' + cityId + '/recommendation?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                var content ={};
                content = req.body;
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
