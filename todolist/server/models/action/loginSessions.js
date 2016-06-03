/**
 * Created by Administrator on 2016/5/20.
 */

var db = require('../db');
var jwt = require('../../libs/jwt'),
    moment = require('../../libs/moment');

exports.use = function(server){

    server.get('/loginSessions', function(req, res, next) {

        if(req.authInfo === undefined) {res.status(401).end();return;}

        var userId = req.authInfo.owner_id;
        var userModel = db.getDataModel('users');
        userModel.findOne({_id:userId},function(err,person){
            if(err === null){
                //var _userInfo = person;//person._doc;

                if(person === null){
                    res.json({
                        result:'fail',
                        content:''
                    });

                    return;
                }
                delete person['password'];

                res.json({
                    result:'ok',
                    content:person
                });

            }else{
                res.json({
                    result:'fail',
                    content:{
                        error_code : 500,
                        error_msg : 'server may be internal error...'
                    }
                });
            }
        });

    });

    server.delete('/loginSessions', function(req, res, next) {

        if(req.authInfo === undefined) {res.status(401).end();return;}

        var userId = req.authInfo.owner_id;
        var tokenModel = db.getDataModel('tokens');
        var conditions = {owner_id: userId};
        tokenModel.remove(conditions, function(error){
            if(error) {
                res.json({
                    result:'fail',
                    content:{
                        error_code : 500,
                        error_msg : 'server may be internal error...'
                    }
                });
            } else {
                res.json({
                    result:'ok',
                    content:''
                });
            }
        });

    });

    server.post('/loginSessions', function(req, res, next) {

        var userModel = db.getDataModel('users');
        var userInfo = req.body;
        userModel.findOne(userInfo,function(err,person){
            if(err === null){
                if(person === null){
                    //user is not db
                    res.json({
                        result:'fail',
                        content:{
                            error_code : 10001,
                            error_msg : 'can not find specified user...'
                        }
                    });
                }else{

                    //var _userInfo = person;//person._doc;

                    //return access_token & refresh_token
                    var token_expires = moment().add(10,'seconds').valueOf();
                    //console.log('access_token生成时的预期时间：' + token_expires);
                    var access_token = jwt.encode({
                        iss: person._id,
                        exp: token_expires
                    }, server.get('jwtTokenSecret'));

                    var refresh_token_expires = moment().add(1,'days').valueOf();
                    var refresh_token = jwt.encode({
                        iss: person._id,
                        exp: refresh_token_expires
                    }, server.get('jwtTokenSecret'));

                    var additionalBody = {
                        access_token : access_token,
                        refresh_token : refresh_token,
                        owner_id: person._id,
                        exp:token_expires
                    };
                    res.json({
                        result:'ok',
                        content:additionalBody
                    });

                    //store token to db
                    var tokenModel = db.getDataModel('tokens');
                    tokenModel.create(additionalBody,function(err){console.log('token has been inserted to db...')});
                }
            }else{
                res.json({
                    result:'fail',
                    content:{
                        error_code : 500,
                        error_msg : 'server may be internal error...'
                    }
                });
            }
        });

    });
};