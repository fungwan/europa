/**
 * Created by root on 15-11-25.
 */
var express = require('express');
var moment = require('moment');
var logger = require('./logger');
var authen = require('./authenticater');
var verifier = require('./tool');
var returnData = require('./returnData');
var namecheck = require('./namepasscheck');
var config = require('../../config');

var router = express.Router();

/**
 * 添加路由
 * @param url 路由地址
 * @param fun 映射函数
 * @param checkAuthority 是否进行权限认证
 * @param describe 路由描述
 */
function add(url, fun, parameter, describe, checkAuthority, refusestate) {
    if(checkAuthority & refusestate=="undefined") refusestate=[null,null,false,false];
    describe = describe || ''
    var uid = '';
    function routerLog(req, res, next) {
        if (req.user)
            uid = req.user.useraccount;
        logger.info(uid, '开始调用' + url + '(' + describe + ')');
        if (next)
            next();
    };

    function dofun(req, res, next) {
        if (req._passport.session && req._passport.session.user) {
            req.user = req._passport.session.user;
        }
        if (req.user)
            uid = req.user.useraccount;
        actName = req.originalUrl.toLowerCase();
        var p = null;
        if (parameter) {
            p={};
            var ptype = parameter.createNew();
            for (var key in ptype) {
                if (req.body[key]) {
                    //为兼容已写好代码
                    if(!ptype[key]|| ptype[key]==''|| ptype[key]=={} || ptype[key]==[] || ptype[key]==0)
                    {
                        p[key]=req.body[key];
                    }
                    else {
                        p[key] = createValue(ptype[key], req.body[key]);
                    }
                }
            };
        }

        var pass = verifier.verifyData(p, parameter);
        if (p == null)
            p = {};
        if (pass) {
            if (req.user)
                p.currentuser = req.user;
            else
                p.currentuser = null;
            fun(p, function (err, datainfo) {
                if (err) {
                    logger.error(uid, url + '执行失败：' + JSON.stringify(err));
                    res.json(err);
                }
                else {
                    logger.info(uid, url + '执行成功！');
                    res.json(datainfo);
                }
            },req,res,next);
        }
        else {
            logger.error(uid, url + '参数校验失败！');
            res.json(returnData.createError(returnData.errorType.verifyError.unknow, '参数校验失败！'))
        }
    }
    if (checkAuthority || checkAuthority == undefined) {
        if (refusestate) {
            if (!global.urlstatechecklist) {
                global.urlstatechecklist = {};
            }
            global.urlstatechecklist[url] = refusestate;
            router.post(url, routerLog, authen.checkAuthority, authen.checkstate, dofun);
        }
        else {
            router.post(url, routerLog, authen.checkAuthority, dofun);
        }
    }
    else {
        router.post(url, routerLog, dofun);
    }
};

function createValue(datatype,v){
    var res;
    switch(datatype){
        case 'string':
            res=v;
            break;
        case 'int':
            res=!!v?parseInt(v):0;
            break;
        case 'float':
            res=!!v?parseFloat(v):0;
            break;
        case 'json':
            res=!!v? JSON.parse(v) :null;
            break;
        case 'date':
            res=!!v? moment(new Date(v)).format(config.dateformat) :null;
            break;
        default:
            res=v;
            break;
    }
    return res;
}

/**
 * 添加登录路由
 */
function addLogin(url) {
    router.post(url, namecheck, authen.authenticate('local'), authen.getUserInfo);
};

/**
 * 添加注销路由
 */
function addLogout(url) {
    router.post(url, authen.checkAuthority, authen.logout);
};

/**
 * 设置默认起始页
 * @param url
 */
function setHome(url) {
    router.get('/', function (req, res) {
        var pam = req.originalUrl.replace('/', '');
        res.redirect(url + pam);
    });
};


exports.addLogin = addLogin;
exports.addLogout = addLogout;
exports.add = add;
exports.setHome = setHome;
exports.router = router;