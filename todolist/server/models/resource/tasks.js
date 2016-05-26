/**
 * Created by fungwan on 2016/5/17.
 */

var auth = require('./auth')
exports.use = function(server){

    server.resource('tasks',
        {
            name: String,
            desc: String ,
            account_id:String,
            update_time:Number,
            time:Number,
            level:Number,
            status:Number
        })
        /*.all()
            .auth(function(req){
        })*/
        .get()
            .auth(auth.token)
        .list()
            .auth(auth.token)
        .post()
            .auth(auth.token)
        .put()
            .auth(auth.token)
        .delete()
            .auth(auth.token)
};