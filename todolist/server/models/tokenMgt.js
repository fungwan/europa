/**
 * Created by Administrator on 2016/5/20.
 */

var db = require('./db');
var jwt = require('jwt-simple'),
    moment = require('moment');

var resources = require('node-odata').resources;

exports.authorization = function(req, res, next){

    var authInfo = req.headers.authorization;
    if(authInfo === undefined) {/*console.log('没有传递认证信息...');*/req.authInfo = undefined; next();return;}

    //Bearer  info include id and access_token
    var bearerInfo = new Buffer(authInfo.substr(7), 'base64').toString();
    var ownerId = bearerInfo.substr(0,bearerInfo.indexOf(':'));
    var accessToken = bearerInfo.substr(bearerInfo.indexOf(':')+1,bearerInfo.length-bearerInfo.indexOf(':'));

    var tokenInfo = {
        owner_id : ownerId,
        access_token : accessToken
    };

    var tokenModel = resources.tokens;

    tokenModel.findOne(tokenInfo,function(err,token){
        if(err === null){
            if(token === null){
                //cb('error','can not find specified token...');
                req.authInfo = undefined;
            }else{
                //check token has expired?
                var decoded = jwt.decode(token._doc['access_token'], 'fungwan_todolist');
                if (decoded.exp <= Date.now()) {// refresh_token has expired
                    req.authInfo = undefined;
                }else{
                    req.authInfo = token;
                    //return true;
                }
            }
        }else{
            req.authInfo = undefined;
        }

        next();
    });

};