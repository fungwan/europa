/**
 * Created by Administrator on 2016/1/5.
 */

var request = require('./requestForGo.js');
var tokenMgt = require('./tokenMgt');
var jsonConvert = require('../../lib/jsonFormat.js');
var settings = require('../../conf/settings');
var logger = require('../../lib/log.js').logger;
var async = require('async');
var fs = require("fs");

var uuid = require('node-uuid');

exports.getContractById = function(req,res){

    var contractId = req.params.id;

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
            get_contract: ['get_token', function (callback, results) {

                var token = results.get_token;
                var orderPath = '/contracts/' + contractId +'?accessToken=' + token;

                var item = {};
                item['path'] = orderPath;
                request.get(item,callback);
            }]
        },function(err,result){
            if(err === null){

                var contractObject = jsonConvert.stringToJson(result.get_contract);

                res.json({
                    result: 'success',
                    content: contractObject})
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

exports.getContractItem = function(req,res){

    var contractId = req.params.id;

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
            get_contractItem: ['get_token', function (callback, results) {

                var token = results.get_token;
                var orderPath = '/v1/contracts/' + contractId +'/items?accessToken=' + token;

                var item = {};
                item['path'] = orderPath;
                request.get(item,callback);
            }]
        },function(err,result){
            if(err === null){

                var contractItemArray = jsonConvert.stringToJson(result.get_contractItem)['items'];

                res.json({
                    result: 'success',
                    content: contractItemArray})
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