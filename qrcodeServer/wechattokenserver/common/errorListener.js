/**
 * Created by shuwei on 15-11-25.
 */
var express = require('express');
var domain = require('domain');

var logger = require('./logger');
var config = require('../../config');

function onDomainError(req, res, next) {
    var userid = config.systemUser;
    if (req.user) {
        userid = req.user.id;
    }
    var d = domain.create();
    //监听domain的错误事件
    d.on('error', function (err) {
        logger.error(userid, '未处理异常：' + err.message);
        res.statusCode = 500;
        res.json(err.message);
    });
    d.add(req);
    d.add(res);
    d.run(next);
};

function onError(err, req, res, next) {
    var userid = config.systemUser;
    if (req.user) {
        userid = req.user.id;
    }
    logger.error(userid, '未处理异常：' + err.message);
    res.statusCode = 500;
    res.json(err.message);
};

exports.onDomainError = onDomainError;
exports.onError = onError;