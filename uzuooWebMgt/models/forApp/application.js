/**
 * Created by Administrator on 2016/4/8.
 */
var request = require('./requestForGo.js');
var tokenMgt = require('./tokenMgt');
var jsonConvert = require('../../lib/jsonFormat.js');
var settings = require('../../conf/settings');
var logger = require('../../lib/log.js').logger;
var async = require('async');


exports.getApplications = function(req,res){
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
            get_versions: ['get_token',function (callback,results) {

                var token = results.get_token;
                var path = '/applications?'+'accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }]
        },function(err,result){
            if(err === null){
                var versionsArray = jsonConvert.stringToJson(result.get_versions)['applications'];
                res.json({
                        result: 'success',
                        content:versionsArray}
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