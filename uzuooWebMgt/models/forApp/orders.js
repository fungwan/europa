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

exports.getOrderById = function(req,res){

    var orderId = req.query.id;

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
                var orderPath = '/v1/orders/' + orderId +'?accessToken=' + token;

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