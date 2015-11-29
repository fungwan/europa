/**
 * Created by Administrator on 2015/11/22.
 */

exports.use = function(server){

    server.resource('users', { username: String, password: String ,role:String,city:String});

};