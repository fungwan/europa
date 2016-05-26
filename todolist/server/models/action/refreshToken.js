/**
 * Created by Administrator on 2016/5/20.
 */

var db = require('../db');
var jwt = require('jwt-simple'),
    moment = require('moment');

exports.use = function(server){

    server.post('/refreshToken', function(req, res, next) {

        var refresh_token_info = req.body;
        var tokenModel = db.getDataModel('tokens');
        tokenModel.findOne(refresh_token_info,function(err,token){
            if(err === null){
                if(token === null){
                    //query refresh_token is not db
                    res.json({
                        result:'fail',
                        content:{
                            error_code : 20001,
                            error_msg : 'can not find specified refresh_token...'
                        }
                    });
                }else{
                    //check refresh_token has expired?
                    var decoded = jwt.decode(token._doc.refresh_token, server.get('jwtTokenSecret'));
                    if (decoded.exp <= Date.now()) {// refresh_token has expired
                        //res.end('Access token has expired', 400);
                        res.json({
                            result:'fail',
                            content:{
                                error_code : 20002,
                                error_msg : 'posted refresh_token has been expired...'
                            }
                        });
                    }else{
                        var token_expires = moment().add(150,'seconds').valueOf();
                        //console.log('有用户在刷新token...');
                        var access_token = jwt.encode({
                            iss: token._doc.owner_id,
                            exp: token_expires
                        }, server.get('jwtTokenSecret'));

                        res.json({
                            result:'ok',
                            content:{
                                access_token : access_token,
                                exp:token_expires
                            }
                        });


                        //update new access_token
                        tokenModel.update({refresh_token:refresh_token_info.refresh_token},{$set:{access_token: access_token}},function(err){
                            if(err !== null){
                                console.log(err);
                            }
                        });

                    }
                }
            }else{
                res.json({
                    result:'fail',
                    content:{
                        error_code : 500,
                        error_msg : 'server may be internal error...'
                    }
                });
                //res.status(500).send({ error: 'Something blew up!' });
                //res.status(401).end();
            }
        });
    });
};