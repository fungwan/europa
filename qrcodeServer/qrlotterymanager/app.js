var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var log4js = require('log4js');
var routes = require('./routes/index');
var logger=require('./common/logger');
var errorDomain=require('./common/errorListener');
var config = require('../config');
var redis = require("./common/redis");
var lottery = require("./lottery/index");

require('./common/db').init().then(lottery.init);
var app = express();
// uncomment after placing your favicon in /public
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//日志处理配置
app.use(log4js.connectLogger(logger.logger(), {level:log4js.levels.INFO}));
//设置异常处理
app.use(errorDomain.onDomainError);
process.on('uncaughtException', function (err) {
  logger.error(config.systemUser,'未处理异常：'+ err.message,err);
});
app.use('/', routes);
//设置异常处理(必须在路由设置后执行)
app.use(errorDomain.onError);
//检查redis是否已启动
redis.init();

module.exports = app;
