/**
 * Created by fungwan on 2016/3/28.
 */


var request = require('./requestForGo.js');
var historyMgt = require('../history.js');
var tokenMgt = require('./tokenMgt');
var jsonConvert = require('../../lib/jsonFormat.js');
var logger = require('../../lib/log.js').logger;
var async = require('async');
var fs = require("fs");

var uuid = require('node-uuid');

var multiparty = require('multiparty');

function HouseOwner(){

}

HouseOwner.prototype.findHouseOwnersByPage = function(req,res){
    var currPage = req.query.page - 1;
    var filters = req.query.filters;
    async.auto(
        {
            get_token: function (callback) {

                tokenMgt.getToken(function (err, token) {
                    if (err === null) {
                        callback(null, token);
                    } else {
                        callback(err, 'can not get token...');
                    }
                });
            },
            get_all: ['get_token',function (callback,results) {

                var token = results.get_token;
                var path = '/houseOwners?'+ 'limit=-1&filter=' + filters+'&accessToken=' + token ;//&countOnly=true
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);

            }],
            get_currPage: ['get_token',function (callback,results) {

                var token = results.get_token;
                var skipValue = currPage * 10;

                //获取工人信息
                var path = '/houseOwners?'+ 'filter='+ filters + '&limit=10&offset='+ skipValue +'&accessToken=' + token ;
                var optionItem = {};
                optionItem['path'] = path;
                request.get(optionItem,callback);

            }]
        },function(err,results){

            if(err !== null){
                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    pages:1,
                    content:[]});

                return;
            }


            var houseownersArray = jsonConvert.stringToJson(results.get_all)['houseowners'];
            if(houseownersArray === null){//db里面一个屋主也没有.
                res.json({
                        result: 'success',
                        pages:1,
                        content:[]}
                );
                return;
            }
            var allUserCounts = houseownersArray.length;

            //get product list
            var pageCounts = 1;
            if(allUserCounts > 0){
                var over = (allUserCounts) % 10;
                over > 0 ? pageCounts = parseInt((allUserCounts) / 10) + 1 :  pageCounts = parseInt((allUserCounts) / 10) ;
            }

            //第一页用户数组
            var houseownersArrayEx = jsonConvert.stringToJson(results.get_currPage)['houseowners'];

            res.json({ result: 'success',
                pages:pageCounts,
                content:houseownersArrayEx});
        }
    )
};

HouseOwner.prototype.findHouseOwnersById = function(req,res){
    var houseOwnerId = req.params.id;

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
            get_houseOwnerInfo:['get_token',function(callback,results){
                var token = results.get_token;
                var path = '/houseOwners/' + houseOwnerId +'?accessToken=' + token;
                var optionItem = {};
                optionItem['path'] = path;

                request.get(optionItem,callback);
            }]
        },function(err,results){
            if(err === null){
                var houseOwnerInfo = jsonConvert.stringToJson(results.get_houseOwnerInfo);
                res.json({ result: 'success',
                    content:houseOwnerInfo});
            }else{

                if(err === 403){
                    tokenMgt.setTokenExpireStates(true);
                }

                res.json({ result: 'fail',
                    content:{}});
            }
        })
};


module.exports = HouseOwner;
