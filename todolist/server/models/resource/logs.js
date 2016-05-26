/**
 * Created by Administrator on 2015/11/22.
 */

exports.use = function(server){

    server.resource('books', { title: String, price: Number });
};