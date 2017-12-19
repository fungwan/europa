//第三方包
var express = require('express');
var log4js = require('log4js');
var path = require('path');
var cors=require('cors');
var bodyParser = require('body-parser');

//自定义对象
var logger=require('./common/logger');
var config=require('../config');
var routes = require('./routes/index');
var errorDomain=require('./common/errorListener');

require('./common/db').init();
require('./common/tool').init();

var app = express();

//跨域设置
app.use(cors());
//req参数解析设置
app.use(bodyParser.json());
//req参数编码设置
app.use(bodyParser.urlencoded({ extended: false }));

app.use(log4js.connectLogger(logger.logger(), {level:log4js.levels.INFO}));

app.use(errorDomain.onDomainError);
process.on('uncaughtException', function (err) {
  logger.error(config.systemUser,'未处理异常：'+ err.message);
});
//路由设置
app.use('/', routes);
//设置异常处理(必须在路由设置后执行)
app.use(errorDomain.onError);


module.exports = app;