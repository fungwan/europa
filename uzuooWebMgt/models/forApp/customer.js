/**
 * Created by Administrator on 2015/11/22.
 */

var _Worker = require('./customer_worker.js');
var _HouseOwner = require('./customer_houseOwner.js');
var _Merchant = require('./customer_merchant.js');

var async = require('async');
var tokenMgt = require('./tokenMgt');
var jsonConvert = require('../../lib/jsonFormat.js');
var request = require('./requestForGo.js');
var logger = require('../../lib/log.js').logger;
var historyMgt = require('../history.js');


exports.worker = new _Worker();
exports.houseOwner = new _HouseOwner();
exports.merchant = new _Merchant();

function getRoleAndRegions(token,callback){

    async.parallel([ //找施工区域
        function(cb) {

            var regionsPath = '/countries/001/administrativeDivision?'+'accessToken=' + token;
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
            var rolePath = '/workers/roles?'+'accessToken=' + token;

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
                    var tmpObj = {};
                    tmpObj['name'] = roleItem['name'];
                    tmpObj['crafts'] = roleItem['crafts'];

                    rolesMap[roleItem['id']] = tmpObj;//取到角色
                    var craftArray = roleItem['crafts'];
                    for(y in craftArray){

                        var tmpObj2 = {};
                        tmpObj2['name'] = craftArray[y]['name'];
                        /*tmpObj2['earnest'] = craftArray[y]['earnest'];
                         tmpObj2['need_trustee'] = craftArray[y]['need_trustee'];
                         tmpObj2['commission_basic'] = craftArray[y]['commission_basic'];
                         tmpObj2['commission_float'] = craftArray[y]['commission_float'];
                         tmpObj2['margin_rate'] = craftArray[y]['margin_rate'];
                         tmpObj2['margin_up_threshold'] = craftArray[y]['margin_up_threshold'];
                         tmpObj2['margin_down_threshold'] = craftArray[y]['margin_down_threshold'];*/

                        rolesMap[craftArray[y]['id']] = tmpObj2;//取到细项
                    }
                }
                var tmpRoles = [];
                tmpRoles.push(array);
                tmpRoles.push(rolesMap);
                cb(null,tmpRoles);
            });
        },
        //找到商家对应角色
        function(cb) {
            var rolesMap = {};

            var roleArray = [];
            var rolePath = '/merchants/roles?'+'accessToken=' + token;

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
                    var tmpObj = {};
                    tmpObj['name'] = roleItem['name'];
                    tmpObj['crafts'] = roleItem['crafts'];

                    rolesMap[roleItem['id']] = tmpObj;//取到角色
                    var craftArray = roleItem['crafts'];
                    for(y in craftArray){

                        var tmpObj2 = {};
                        tmpObj2['name'] = craftArray[y]['name'];
                        /*tmpObj2['earnest'] = craftArray[y]['earnest'];
                         tmpObj2['need_trustee'] = craftArray[y]['need_trustee'];
                         tmpObj2['commission_basic'] = craftArray[y]['commission_basic'];
                         tmpObj2['commission_float'] = craftArray[y]['commission_float'];
                         tmpObj2['margin_rate'] = craftArray[y]['margin_rate'];
                         tmpObj2['margin_up_threshold'] = craftArray[y]['margin_up_threshold'];
                         tmpObj2['margin_down_threshold'] = craftArray[y]['margin_down_threshold'];*/

                        rolesMap[craftArray[y]['id']] = tmpObj2;//取到细项
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
            var rolesArray2 = resultsEx[2];//同上，商家版的
            var localData = [];
            localData.push(regionsArray);
            localData.push(rolesArray);
            localData.push(rolesArray2);
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

                getRoleAndRegions(token, callback);
            }]
        },function(err,result){
            if(err === null){

                delete result['get_token'];

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
    var workerId = req.params.id;

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
                var path = '/capitalAccount/' + workerId +'?accessToken=' + token;
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
};

exports.chargeAccount = function(req,res){

    var obj = req.body.content;

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
            set_advertisement: ['get_token', function (callback, results) {

                var token = results.get_token;
                var path = '/paymentOrders' + '?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                var content = obj;
                content['city']=cityId;

                var bodyString = JSON.stringify(content);

                request.post(optionItem,bodyString,callback);
            }]
        },function(err,result){
            if(err === null){

                var desc = '';
                desc = '为账号ID是' + obj.account_id + '的' + obj.type + '账户充值了' + obj.amount / 100 + '元';
                historyMgt.addLogsEx(req,res,desc);

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

exports.findInviteesById = function(req,res){

    var accountId = req.params.accountId;

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
            get_inviteesInfo:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/accounts/' + accountId +'/invitees?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }]
        },function(err,results){
            if(err === null){
                var inviteesInfo = jsonConvert.stringToJson(results.get_inviteesInfo);
                res.json({ result: 'success',
                    content:inviteesInfo});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:{}});
            }
        })

};

exports.getCapitalAccountDetailsById = function(req,res){
    var accountId = req.params.id;
    var type = req.query.accountType;
    var filter = req.query.filter;
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
            get_details:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/capitalAccount/' + accountId +'/details?limit=-1&accountType=' + type +'&filter='+filter +'&accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;
                request.get(optionItem,callback);
            }]
        },function(err,results){
            if(err === null){
                var detailsInfoArray = jsonConvert.stringToJson(results.get_details)['details'];
                res.json({ result: 'success',
                    content:detailsInfoArray});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:{}});
            }
        })
}

exports.getCapitalAccountUbeanDetailsById = function(req,res){
    var accountId = req.params.id;
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
            get_details:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/capitalAccount/' + accountId +'/ubeans/details?limit=-1&accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;
                request.get(optionItem,callback);
            }]
        },function(err,results){
            if(err === null){
                var detailsInfoArray = jsonConvert.stringToJson(results.get_details)['details'];
                res.json({ result: 'success',
                    content:detailsInfoArray});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:{}});
            }
        })
}

exports.getCapitalAccountMarginDetailsById = function(req,res){
    var accountId = req.params.id;
    var type = req.query.accountType;
    //var filter = req.query.filter;
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
            get_details:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/capitalAccount/' + accountId +'/margins/details?limit=-1&accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;
                request.get(optionItem,callback);
            }]
        },function(err,results){
            if(err === null){
                var detailsInfoArray = jsonConvert.stringToJson(results.get_details)['details'];
                res.json({ result: 'success',
                    content:detailsInfoArray});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:{}});
            }
        })
}