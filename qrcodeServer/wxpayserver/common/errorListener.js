/**
 * Created by shuwei on 15-11-25.
 */
var express = require('express');
var domain = require('domain');

var logger = require('./logger');
var returnData=require('../common/returnData');
var errCode=require('../common/errorType');

function onDomainError(req, res, next) {
    var d = domain.create();
    //监听domain的错误事件
    d.on('error', function (err) {
        logger.error('', '未处理异常：' + err.message);
        logger.error('', err.stack);
        res.statusCode = 500;
        res.json(returnData.createError(errCode.unknow,err.message));
    });
    d.add(req);
    d.add(res);
    d.run(next);
};

function onError(err, req, res, next) {
    logger.error('', '未处理异常：' + err.message);
    logger.error('', err.stack);
    res.statusCode = 500;
    res.json(returnData.createError(errCode.unknow,err.message));
};

exports.onDomainError = onDomainError;
exports.onError = onError;