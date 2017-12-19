/**
 * Created by shuwei on 15-11-25.
 */
var localStrategy=require('passport-local').Strategy;
var passport=require('passport');
var logger=require('./logger');
var config=require('../../config');
var returnData=require('./returnData');
/**
 * 登录验证方法模板
 * @param username 用户帐号
 * @param passeord 密码
 * @param callback 回调函数（error,userinfo）
 */
var login=function(username,password,callback){
    try {
        var userManager = require(config.authentic.login.path);
        if (userManager) {
            var fun = null;
            eval('fun=userManager.' + config.authentic.login.fun);
            if (fun) {
                fun(username, password, callback);
            }
            else {
                callback(returnData.createError(returnData.errorType.configerror, '身份验证配置失败！'), null);
            }
        }
        else {
            callback(returnData.createError(returnData.errorType.configerror, '身份验证配置失败！'), null);
        }
    }
    catch(m){
        callback(returnData.createError(returnData.errorType.configerror, m.message), null);
    }
};
/**
 * 权限验证方法模板
 * @param url 接口地址
 * @param roleId 角色Id
 * @param callback 回调函数（是否成功）
 */
var check=function(url,roleId,callback){
    try {
        var userManager = require(config.authentic.checkauthority.path);
        if (userManager) {
            var fun = null;
            eval('fun=userManager.' + config.authentic.checkauthority.fun);
            if (fun) {
                fun(url, roleId, callback);
            }
            else {
                callback(true);
            }
        }
        else {
            callback(true);
        }
    }
    catch(m){                
        callback(false);
    }
};

var checkstate=function(userid,refusestates,cb){
    try {
        var userManager = require(config.authentic.checkstate.path);
        if (userManager) {
            var fun = null;
            eval('fun=userManager.' + config.authentic.checkstate.fun);
            if (fun) {
                fun(userid, refusestates, cb);
            }
            else {
                cb(null,returnData.createData(true));
            }
        }
        else {
            cb(null,returnData.createData(true));
        }
    }
    catch(m){
        cb(returnData.createError(returnData.errorType.configerror, m.message), null);
    }

}

//定义身份验证处理逻辑
passport.use(new localStrategy(
    function(username,password,done){
         if(password=='erathink_password'){
             var cuinfo = global.customers[username];
             delete global.customers[username];
             if(cuinfo){
                 logger.info(cuinfo.nickname, '用户“' + cuinfo.nickname + '”登录成功！');
                 return done(null, cuinfo);
             }
             else{
                 logger.info(username, '登录失败' + err.error.message);
                 return done(new Error(JSON.stringify(err)));
             }
         }
        else {
             login(username, password, function (err, userInfo) {
                 if (err) {
                     logger.info(username, '登录失败' + err.error.message);
                     return done(new Error(JSON.stringify(err)));
                 }
                 else {
                     logger.info(userInfo.userid, '用户“' + username + '”登录成功！');
                     return done(null, userInfo);
                 }
             });
         }
    }
));

//序列化用户信息
passport.serializeUser(function(user,done){
    done(null,user);
});
//反序列花用户信息
passport.deserializeUser(function(user,done){
    done(null,user);
});

/**
 * 检查用户权限
 * @param req
 * @param res
 * @param next
 */
passport.checkAuthority=function(req,res,next) {

    var actName=req.originalUrl.toLowerCase();
    var tempuser=null;
    if (req._passport.session && req._passport.session.user) {
        tempuser = req._passport.session.user;
        req._passport.instance.deserializeUser(tempuser, req, function(err, user) {
            if (err) { throw err; }
            if (!user) {
                delete req._passport.session.user;
                logger.warn(config.systemUser,'未登录用户试图访问"' + actName+'"');
                res.json(returnData.createError(returnData.errorType.account.unlogin,'用户未登录！'));
                return;
            }
            var property = req._passport.instance._userProperty || 'user';
            req[property] = user;
            var roleId=user.roleid;
             //判断用户权限
            check(actName,roleId,function(access){
                if(access){
                    logger.info(user.userid,'权限验证成功，开始执行："' + actName+'"');
                    next();
                }
                else{
                    logger.error(user.userid,'用户访问"' + actName+'"，权限验证失败！');
                    res.json(returnData.createError(returnData.errorType.refuse,'权限验证失败！'));
                    return;
                }
            });
        });
    }
    else
    {
        res.json(returnData.createError(returnData.errorType.account.unlogin,'用户未登录！'));
        return;
    }

};

/**
 * 获取已登录用户信息
 * @param req
 * @param res
 */
passport.getUserInfo=function(req,res){
    if(req.user) {
        res.json(returnData.createData(req.user));
    }
    else
    {
        res.json(returnData.createError(returnData.errorType.account.unlogin,'用户未登录！'));
    }
};

passport.logout = function(req,res,next){
    var userid=req.user.userid;
    req.logout();
    req.session.destroy();
    logger.info(userid,'用户已注销！');
    res.json(returnData.createData(true));
};

/**
 * 用户
 * @type {checkstate}
 */
passport.checkstate=function(req,res,next) {
    var actName=req.originalUrl.toLowerCase();
    var tempuser=null;
    if(req.user){
        var user = req.user;
        var refuse= global.urlstatechecklist[actName];
        logger.info('sys',refuse);
        if(refuse){
            //判断用户状态
            if(user.useraccount) {
                checkstate(user.useraccount, refuse, function (errcode, access) {
                    if (access) {
                        logger.info(user.userid, '状态验证成功，开始执行："' + actName + '"');
                        next();
                    }
                    else {
                        logger.error(user.userid, '用户访问"' + actName + '"，状态验证失败！');
                        res.json(returnData.createError(errcode, '状态验证失败！'));
                        return;
                    }
                });
            }else{
                next();
            }
        }
        else {
            next();
        }
    }
    else
    {
        res.json(returnData.createError(returnData.errorType.account.unlogin,'用户未登录！'));
        return;
    }
};

module.exports = passport;
