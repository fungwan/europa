/**
 * Created by fungwan on 2016/5/17.
 */

var db = require('../db');

exports.use = function(server){

    server.resource('tokens',
        {
            owner_id: String,
            access_token: String ,
            refresh_token:String,
            access_time:Number,
            create_time:Number
        })
        .get()
            .auth(function(req){
                return false;
            })
        .list()
            .auth(function(req){
                //console.log(req.headers.authorization);
                return false;
            })
        .post()
            .auth(function(req){
                return false;
            })
        .put()
            .auth(function(req){
                return false;
            })
            .before(function (entity) {})
        .delete()
            .auth(function(req){
                return false;
            })
};