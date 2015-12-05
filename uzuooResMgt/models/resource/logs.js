/**
 * Created by Administrator on 2015/11/22.
 */

exports.use = function(server){

    server.resource('logs', {operator_date: Number,username: String, role: String ,action:String});
};