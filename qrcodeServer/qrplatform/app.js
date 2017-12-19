//第三方包
var express = require('express');
var log4js = require('log4js');
var path = require('path');
var cors=require('cors');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

//自定义对象
var logger=require('./common/logger');
var config=require('../config');
var routes = require('./routes/index');
var errorDomain=require('./common/errorListener');
var passport=require('./common/authenticater');
var redis = require("./common/redis");



//检查redis是否已启动
var redisCheck = function(){
    redis.on("error", function (err) {
        logger.error("Redis状态检查失败： " + err);
        process.exit();
    });

    redis.set("redischeck", "redischeck", function(error, reply){
        if(error){
            logger.error(config.systemUser, "Redis状态检查失败，正在退出",error);
            process.exit();
        }
    });
    redis.get('redischeck',function(error, reply) {
        if(reply == 'redischeck'){
            logger.info(config.systemUser, "Redis状态检查成功")
        }
        else{
            logger.error(config.systemUser, "Redis状态检查失败，正在退出");
            process.exit();
        }
    });
};
redisCheck();

require('./common/db').init();
var app = express();
//跨域设置
app.use(cors());
//req参数解析设置
app.use(bodyParser.text({type:'text/xml'}));
app.use(bodyParser.raw({ type: 'application/vnd.custom-type' }));
app.use(bodyParser.json({ type: 'application/*+json' }));
//req参数编码设置
app.use(bodyParser.urlencoded({ extended: false }));
//cookie支持设置
app.use(cookieParser());
//静态文件路径配置
app.use(express.static(path.join(__dirname, config.staticPath)));
//会话设置
app.use(session({
    secret: config.salt,
    store: new RedisStore({
        port: config.redis.port,
        host: config.redis.host,
        pass:config.redis.auth
    }),
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 2*60*60*1000}, //BUG#293 失效时间设置为2小时
    rolling: true                   //BUG#293 用户每次访问都会重设失效时间
}));

//设置身份验证
app.use(passport.initialize());
//设置身份验证会话
app.use(passport.session());
//日志处理配置
app.use(log4js.connectLogger(logger.logger(), {level:log4js.levels.INFO}));
//设置异常处理
app.use(errorDomain.onDomainError);
process.on('uncaughtException', function (err) {
    logger.error(config.systemUser,'未处理异常：'+ err.message);
});
//路由设置
app.use('/', routes);
//设置异常处理(必须在路由设置后执行)
app.use(errorDomain.onError);

module.exports = app;
