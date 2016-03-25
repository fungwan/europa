/**
 * Created by fungwan on 2015/11/22.
 *
 * 对http请求的封装
 *
 */

var http = require('http');
var settings = require('../conf/settings');

var hostIp = settings.bgMgtIpAddr;

var hostPort = settings.bgMgtPortAddr;

exports.get = function(options,cb){

    options = encodeURI(options);
    http.get(options, function(res) {
        res.setEncoding('utf8');
        var recv = '';
        res.on('data', function(chunk) {
            recv += chunk;
        });

        res.on('end', function () {
            return cb(null,recv);
        });

    }).on('error',function(e){
        return cb(e, e.message);
    });

};

exports.post = function(optionItem,contents,cb){

    var options = {
        host: hostIp,
        port: hostPort,
        method: 'POST',
        headers: {
            'Accept': '/',
            'Content-Type':'application/json'
        }
    };

    options['path'] = optionItem['path'];

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

exports.put = function(optionItem,contents,cb){

    var options = {
        host: hostIp,
        port: hostPort,
        method: 'PUT',
        headers: {
            'Accept': '/',
            'Content-Type':'application/json'
        }
    };

    options['path'] = optionItem['path'];

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

exports.del = function(optionItem,cb){

    var options = {
        host: hostIp,
        port: hostPort,
        method: 'DELETE',
        headers: {
            'Accept': '/',
            'Content-Type':'application/json'
        }
    };

    options['path'] = optionItem['path'];

    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(data) {
            return cb(null,data);
        });
    });

    req.on('error',function(e){
        return cb(e, e.message);
    });
    req.end();
};