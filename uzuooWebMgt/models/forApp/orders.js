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


exports.getProcess = function(req,res){

    res.render('orders.ejs',
        {
            userInfo:req.session.user
        });
};

exports.getOrders = function(req,res){

    var currPage = req.query.page - 1;
    var filterArray = req.query.filters;
    var filters = filterArray.join(",");

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
            get_all: ['get_token',function (callback,results) {

                var token = results.get_token;
                var path = '/orders?'+'accessToken=' + token + '&filter=' + filters;// + '&countOnly=true';
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }],
            get_currPage: ['get_token',function (callback,results) {

                var token = results.get_token;
                var skipValue = currPage * 10;

                //获取工人信息
                var path = '/orders?'+'accessToken=' + token + '&filter='+ filters + '&limit=10&offset='+ skipValue;
                var optionItem = {};
                optionItem['path'] = path;
                request.get(optionItem,callback);
            }]
        },function(err,result){
            if(err === null){

                var ordersArray = jsonConvert.stringToJson(result.get_all)['orders'];
                if(ordersArray === null){//db里面一个工人也没有.
                    res.json({
                            result: 'success',
                            pages:1,
                            content:[]}
                    );
                    return;
                }
                var allOrderCounts = ordersArray.length;

                //get product list
                var pageCounts = 1;
                if(allOrderCounts > 0){
                    var over = (allOrderCounts) % 10;
                    over > 0 ? pageCounts = parseInt((allOrderCounts) / 10) + 1 :  pageCounts = parseInt((allOrderCounts) / 10) ;
                }

                //第一页用户数组
                var orderArray = jsonConvert.stringToJson(result.get_currPage)['orders'];
                res.json({ result: 'success',
                    pages:pageCounts,
                    content:orderArray});

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

exports.getOrderById = function(req,res){

    var orderId = req.params.id;

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
            get_order: ['get_token', function (callback, results) {

                var token = results.get_token;
                var orderPath = '/orders/' + orderId +'?accessToken=' + token;

                var item = {};
                item['path'] = orderPath;
                request.get(item,callback);
            }]
        },function(err,result){
            if(err === null){

                var orderObject = jsonConvert.stringToJson(result.get_order);

                res.json({
                    result: 'success',
                    content: orderObject})
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