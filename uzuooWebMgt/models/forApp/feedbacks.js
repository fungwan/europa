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
            get_feedbacks: ['get_token', function (callback, results) {

                var token = results.get_token;
                var feedbacksPath = '/feedbacks?'+'accessToken=' + token;

                var item = {};
                item['path'] = feedbacksPath;
                request.get(item,callback);
            }],
            get_currFeedback:['get_token', function (callback, results) {

                var token = results.get_token;
                var feedbacksPath = '/feedbacks?filter=all'+ '&limit=10&offset='+currPage*10 +'&accessToken=' + token;

                var item = {};
                item['path'] = feedbacksPath;
                request.get(item,callback);
            }]
        },function(err,result){
            if(err === null){

                var feedbackArray = jsonConvert.stringToJson(result.get_feedbacks)['feedbacks'];
                var feedbackCounts = feedbackArray.length;
                if(feedbackCounts === 0){//db里面一个工人也没有.
                    res.json({
                            result: 'success',
                            pages:1,
                            content:[]}
                    );
                    return;
                }

                var allUserCounts = feedbackCounts;

                //get product list
                var pageCounts = 1;
                if(allUserCounts > 0){
                    var over = (allUserCounts) % 10;
                    over > 0 ? pageCounts = parseInt((allUserCounts) / 10) + 1 :  pageCounts = parseInt((allUserCounts) / 10) ;
                }

                var feedbackArray = jsonConvert.stringToJson(result.get_currFeedback)['feedbacks'];

                res.json({
                    result: 'success',
                    pages:pageCounts,
                    content: feedbackArray})
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({
                    result: 'fail',
                    content:err})
            }
        });
};