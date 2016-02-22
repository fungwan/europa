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

