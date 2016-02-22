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


exports.getProcess = function(req,res){

    res.render('customer_feedbacks.ejs',
        {
            userInfo:req.session.user
        });
};

exports.getFeedbacks = function(req,res){

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
            get_feedbacks: ['get_token', function (callback, results) {

                var token = results.get_token;
                var feedbacksPath = '/feedbacks?'+'accessToken=' + token;

                var item = {};
                item['path'] = feedbacksPath;
                request.get(item,callback);
            }]
        },function(err,result){
            if(err === null){

                var feedbackArray = jsonConvert.stringToJson(result.get_feedbacks)['feedbacks'];

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