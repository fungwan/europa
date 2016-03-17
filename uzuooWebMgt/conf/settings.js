/**
 * Created by Administrator on 2015/11/19.
 */

var mongodbAddr =  {
    cookieSecret: '',
    db: '',
    host: '',
    port: 27017,
    username:'',
    password:''
};

exports.mongodb = {
    cookieSecret: mongodbAddr.cookieSecret,
    db: mongodbAddr.db,
    host: mongodbAddr.host,
    port: mongodbAddr.port,
    username:mongodbAddr.username,
    password:mongodbAddr.password,
    url:'mongodb://' + mongodbAddr.username + ':' + mongodbAddr.password + '@' + mongodbAddr.host+ ':' + mongodbAddr.port + '/' + mongodbAddr.db
};

exports.webMgtPort = 8001;

exports.bgMgtIpAddr = '127.0.0.1';
exports.bgMgtPortAddr = 8002;

exports.appCloudMgtIpAddr = '';
exports.appCloudPortAddr = ;
exports.apiVersion = '/v1';

exports.appID = '';
exports.apiKeyID = '';
exports.apiKeySecret = '';

exports.qiniuAccessKey = '';
exports.qiniuSecretKey = '';
exports.qiniuBuket = '';
exports.qiniuUrl = '';