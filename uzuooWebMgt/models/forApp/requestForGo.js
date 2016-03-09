/**
 * Created by fungwan on 2015/11/22.
 *
 * 对http请求的封装,目标REST服务器为GO语言实现，端口为80
 *
 */

var http = require('http');
var settings = require('../../conf/settings');
var jsonConvert = require('../../lib/jsonFormat.js');
var logger = require('../../lib/log.js').logger;

var hostIp =  settings.appCloudMgtIpAddr;
var hostPort = settings.appCloudPortAddr;
var apiVersion = settings.apiVersion;

var str = settings.apiKeyID + ':' + settings.apiKeySecret;
var buffer = new Buffer(str);
var base64Code = buffer.toString('base64');
var basicCode = 'Basic ' + base64Code;

var errorCodeArray = [
  400, 403,404,500
];


exports.get = function(optionItem,cb){

    var options = {
        host: hostIp,
        port: hostPort,
        method: 'GET',
        headers: {
            'Accept': '/',
            'Authorization': basicCode,
            'Content-Type':'application/json'
        }
    };

    options['path'] = encodeURI(apiVersion + optionItem['path']);

    var req = http.request(options, function(res) {
        res.setEncoding('utf8');

        if(errorCodeArray.indexOf(res.statusCode) !== -1){
            logger.error('requestForGo----GET请求错误,状态码为：'+ res.statusCode + ',url为：' + options['path']);
            return cb(res.statusCode,res.body);
        }else{
            var recv = '';

            res.on('data', function(chunk) {
                recv += chunk;
            });

            res.on('end', function() {
                return cb(null,recv);
            });
        }
    });

    req.on('error',function(e){
        return cb(e, e.message);
    });

    req.end();
};

exports.post = function(optionItem,contents,cb){

    var options = {
        host: hostIp,
        port: hostPort,
        method: 'POST',
        headers: {
            'Accept': '/',
            'Authorization': basicCode,
            'Content-Type':'application/json'
        }
    };

    options['path'] = apiVersion + optionItem['path'];

    var req = http.request(options, function(res) {

        res.setEncoding('utf8');

        if(errorCodeArray.indexOf(res.statusCode) !== -1){
            logger.error('requestForGo----POST请求错误,状态码为：'+ res.statusCode + ',url为：' + options['path']);
            return cb(res.statusCode,res.body);
        }else{
            var recv = '';

            res.on('data', function(chunk) {
                recv += chunk;
            });

            res.on('end', function() {
                return cb(null,recv);
            });
        }
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
            'Authorization': basicCode,
            'Content-Type':'application/json'
        }
    };

    options['path'] = apiVersion + optionItem['path'];

    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        if(errorCodeArray.indexOf(res.statusCode) !== -1){
            logger.error('requestForGo----PUT请求错误,状态码为：'+ res.statusCode + ',url为：' + options['path']);
            return cb(res.statusCode,res.body);
        }else{
            var recv = '';

            res.on('data', function(chunk) {
                recv += chunk;
            });

            res.on('end', function() {
                return cb(null,recv);
            });
        }
    });

    req.on('error',function(e){
        return cb(e, e.message);
    });
    req.write(contents);
    req.end();
};

exports.del = function(optionItem,contents,cb){

    var options = {
        host: hostIp,
        port: hostPort,
        method: 'DELETE',
        headers: {
            'Accept': '/',
            'Authorization': basicCode,
            'Content-Type':'application/json'
        }
    };

    options['path'] = apiVersion + optionItem['path'];

    var req = http.request(options, function(res) {
        res.setEncoding('utf8');

        if(errorCodeArray.indexOf(res.statusCode) !== -1){
            logger.error('requestForGo----DELETE请求错误,状态码为：'+ res.statusCode + ',url为：' + options['path']);
            return cb(res.statusCode,res.body);
        }else{
            var recv = '';

            res.on('data', function(chunk) {
                recv += chunk;
            });

            res.on('end', function() {
                return cb(null,recv);
            });
        }
    });

    req.on('error',function(e){
        return cb(e, e.message);
    });

    req.write(contents);

    req.end();
};
