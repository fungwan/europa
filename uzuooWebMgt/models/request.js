/**
 * Created by fungwan on 2015/11/22.
 *
 * 对http请求的封装
 *
 */

var http = require('http');

exports.get = function(options,cb){

    http.get(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(data) {
            return cb(null,data);
        });
    }).on('error',function(e){
        return cb(e, e.message);
    });

};

exports.post = function(options,contents,cb){

    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(data) {
            return cb(null,data);
        });
    });

    req.on('error',function(e){
        return cb(e, e.message);
    });
    req.write(contents);
    req.end();
};