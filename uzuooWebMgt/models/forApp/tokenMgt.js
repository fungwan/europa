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

function _getToken(cb){
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
                        if(tokenObject === null){
                            cb('get token error',false);
                            return;
                        }
                        if(tokenObject.code === undefined){
                            _token = tokenObject.access_token;
                            _refreshToken = tokenObject.refresh_token;
                            _expireTime = tokenObject.expired_in;
                            cb(null,_token);
                        }else{
                            cb(tokenObject.status,false);
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
                if(tokenObject === null){
                    cb('get token error',false);
                    return;
                }
                if(tokenObject.code === undefined){
                    _token = tokenObject.access_token;
                    _expireTime = tokenObject.expired_in;
                    _tokenIsExpire = false;
                    cb(null,_token);
                }else{
                    //refresh_token或已过期
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
                            if(tokenObject === null){
                                cb('get token error',false);
                                return;
                            }
                            if(tokenObject.code === undefined){
                                _token = tokenObject.access_token;
                                _refreshToken = tokenObject.refresh_token;
                                _expireTime = tokenObject.expired_in;
                                _tokenIsExpire = false;
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

}

exports.setTokenExpireStates = function(flag){

    _tokenIsExpire = flag;
};

exports.getQiniuToken = function(cb){

    _getToken(function(err,token){

        if(err === null){
            var qiniuOptionItem = {};
            qiniuOptionItem['path'] = '/v1/applications/uploadToken?accessToken='+ token;
            var expireTime = new Date().getTime() + 3600;
            var bodyInfo = JSON.stringify({
                'scope':'uzuoo-photos',
                'deadline':expireTime
            });

            request.post(qiniuOptionItem,bodyInfo,function(err,results){
                if(err !== null){
                    cb(err,false);
                }else{
                    var tokenObject = jsonConvert.stringToJson(results);
                    var qiniuToken = tokenObject['upload_token'];
                    cb(null,qiniuToken);
                }

            });
        }else{
            cb(err,'get token wrong...');
        }
    });
};

exports.getToken = _getToken;