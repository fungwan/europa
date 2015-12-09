/**
 * Created by fungwan on 2015/12/8.
 */

var async = require('async');
var request = require('./requestForGo');
var settings = require('../../conf/settings');
var jsonConvert = require('../../lib/jsonFormat.js');

var _nonce = '';
var _token = '';
var _refreshToken = '';
var _tokenIsExpire = false;
var _expireTime = 0;

var appId = settings.appID;

function getAccessTokenByChallenge(challenge){


}

function getAccessTokenByRefreshToken(refreshToken){


}

exports.setTokenExpireStates = function(flag){

    _tokenIsExpire = flag;
};

exports.getToken = function(cb){

    if(_token === ''){

        // step 1: get nonce
        var nonceOptionItem = {};
        nonceOptionItem['path'] = '/v1/applications/' + appId + '/nonce';
        request.post(nonceOptionItem,'',function(err,results){
            if(err !== null){
                console.error(err);
                cb(err,false);
            }else{

                _nonce = results.nonce;
                //TODO encrpt nonce using app key to generate challenge key

                //step 3: get token
                var tokenOptionItem = {};
                tokenOptionItem['path'] = '/v1/applications/' + appId + '/accessToken';

                var challengeInfo = JSON.stringify({
                    'grant_type':'challenge',
                    'challenge':_nonce
                });

                request.post(tokenOptionItem,challengeInfo,function(err,results){
                    if(err !== null){
                        cb(err,false);
                    }else{
                        var tokenObject = jsonConvert.stringToJson(results);
                        if(tokenObject.code === undefined){
                            _token = tokenObject.access_token;
                            _refreshToken = tokenObject.refresh_token;
                            _expireTime = tokenObject.expired_in;
                            cb(null,_token);
                        }else{
                            cb(tokenObject.code,false);
                            console.error(results);
                        }

                    }

                });

            }
        });


    }else if(_token !== '' && !_tokenIsExpire){

        cb(null,_token);

    }else{//token 过期

        //用_refreshToken获取token

        var tokenOptionItem = {};
        tokenOptionItem['path'] = '/v1/applications/' + appId + '/accessToken';

        var challengeInfo = JSON.stringify({
            'grant_type':'refresh_token',
            'refresh_token':_refreshToken
        });

        request.post(tokenOptionItem,challengeInfo,function(err,results){
            if(err !== null){
                cb(err,false);
            }else{
                var tokenObject = jsonConvert.stringToJson(results);
                if(tokenObject.code === undefined){
                    _token = tokenObject.access_token;
                    _refreshToken = tokenObject.refresh_token;
                    _expireTime = tokenObject.expired_in;
                    cb(null,_token);
                }else{
                    //进一步判断refreshToken是否过期,这一步可能是refresh_token已经过期
                    var tokenOptionItem = {};
                    tokenOptionItem['path'] = '/v1/applications/' + appId + '/accessToken';

                    var challengeInfo = JSON.stringify({
                        'grant_type':'challenge',
                        'challenge':_nonce
                    });

                    request.post(tokenOptionItem,challengeInfo,function(err,results){
                        if(err !== null){
                            cb(err,false);
                        }else{
                            var tokenObject = jsonConvert.stringToJson(results);
                            if(tokenObject.code === undefined){
                                _token = tokenObject.access_token;
                                _refreshToken = tokenObject.refresh_token;
                                _expireTime = tokenObject.expired_in;
                                cb(null,_token);
                            }else{
                                cb(tokenObject.code,false);
                                console.error(results);
                            }

                        }

                    });
                }

            }

        });
    }

};