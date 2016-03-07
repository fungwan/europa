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

exports.getBills = function(req,res){

    //var billId = req.params.id;
    var currPage = req.query.page - 1;
    var filters = req.query.filters;

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
            get_all: ['get_token', function (callback, results) {

                var token = results.get_token;
                var billsPath = '/tradeDetails?countOnly=true&limit=-1'+ '&filter=' + filters +'&accessToken=' + token;

                var item = {};
                item['path'] = billsPath;
                request.get(item,callback);
            }],
            get_tradeDetails: ['get_token', function (callback, results) {

                var token = results.get_token;
                var skipValue = currPage * 10;

                var billsPath = '/tradeDetails?limit=10' +'&offset='+ skipValue + '&filter=' + filters +'&accessToken=' + token;

                var item = {};
                item['path'] = billsPath;
                request.get(item,callback);
            }]
        },function(err,result){
            if(err === null){
                var billsCounts = jsonConvert.stringToJson(result.get_all)['count'];
                if(billsCounts === 0){
                    res.json({
                            result: 'success',
                            pages:1,
                            content:[]}
                    );
                    return;
                }
                var allBillCounts = billsCounts;
                var pageCounts = 1;
                if(allBillCounts > 0){
                    var over = (allBillCounts) % 10;
                    over > 0 ? pageCounts = parseInt((allBillCounts) / 10) + 1 :  pageCounts = parseInt((allBillCounts) / 10) ;
                }

                var tradeDetailArray = jsonConvert.stringToJson(result.get_tradeDetails)['details'];

                res.json({
                    result: 'success',
                    pages:pageCounts,
                    content: tradeDetailArray})
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

exports.updateBillStatusById = function(req,res){

    var billId = req.params.billId;
    //var verifiedContent = req.body.content;

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
            post_tradeStatus: ['get_token', function (callback, results) {

                var token = results.get_token;
                var path = '/tradeDetails/' + billId + '/status?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                var content = {
                    status:req.body.status
                };

                var bodyString = JSON.stringify(content);

                request.post(optionItem,bodyString,callback);
            }]
        },function(err,result){
            if(err === null){

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


