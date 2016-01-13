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

var str = settings.apiKeyID + ':' + settings.apiKeySecret;
var buffer = new Buffer(str);
var base64Code = buffer.toString('base64');
var basicCode = 'Basic ' + base64Code;

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

    options['path'] = optionItem['path'];

    var req = http.request(options, function(res) {
        res.setEncoding('utf8');

        var recv = '';

        res.on('data', function(chunk) {
            recv += chunk;
        });

        res.on('end', function () {

            if(res.statusCode === 200){
                return cb(null,recv);
            }else{
                logger.debug('requestForGo----Get请求错误...' + recv);
                return cb(res.statusCode,res.body);
            }
        });
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

    options['path'] = optionItem['path'];

    var req = http.request(options, function(res) {

        res.setEncoding('utf8');

        if(res.statusCode === 200){
            return cb(null,'');
        }

        if(res.statusCode === 400 || res.statusCode === 403 || res.statusCode === 404 || res.statusCode === 500){
            logger.debug('requestForGo----POST请求错误,url为：' + options['path']);
            return cb(res.statusCode,res.body);
        }

        res.on('data', function(recv) {
            return cb(null,recv);
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
            'Authorization': basicCode,
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
            'Authorization': basicCode,
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
