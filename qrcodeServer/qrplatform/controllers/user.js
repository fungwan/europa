/**
 * Created by ivan on 15/11/30.
 */
//加载第三方库
var uuid = require('node-uuid');
var eventproxy = require('eventproxy');
var sequelize = require('sequelize');
var Q = require('q');
var multiline = require('multiline');
//加载自定义库
var returnData = require('../common/returnData');
var db = require('../common/db');
var vo = require('../models/vomodels');
var logger = require('../common/logger');
var config = require('../../config');
var tool = require('../common/tool');
var sms = require('../common/smsmanage');
var roleconfig = require('../roleconfig');


exports.info = function(arg, cb){
    var info = {
        info1:"info1",
        info2:"info2",
        info3:"info3"
    }

    cb(null, returnData.createData(info));
}

exports.list = function(arg, cb){
    //获取参数
    //获取参数
    var page = parseInt(arg.page) || 1;
    var size = parseInt(arg.size) || 10;
    var query = tool.isEmptyObject(arg.query) ? '' : arg.query;
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;
    var queryobj = {};
    var sysuser = db.models.sysuser;
    var ep = new eventproxy();
    var count = 0;
    //参数校验
    if (!!query && !tool.verifier.isEmptyString(query)) {
        try {
            queryobj = JSON.parse(query)
        } catch (error) {
            logger.error(arg.currentuser.useraccount, "解析参数query出错：" + query);
            cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
            return;
        }
    }
    if (tool.isEmptyObject(queryobj)) {
        logger.error(arg.currentuser.useraccount, "调用/user/list接口时未提供queryobj参数");
    }

        queryobj.useraccount = {$like:'%'+queryobj.useraccount+'%'};

    //获取用户列表及其总数
    sysuser.findAndCountAll({
            where: queryobj,
            offset: sysuser.pageOffset(page, size),
            limit: size,
            attributes:['userid','useraccount','disabled','roleid','confirmed'],
            order: 'convert(useraccount using gbk) asc'
        })
        .then(
            function (data) {
                logger.info(useraccount, "获取用户列表成功");
                ep.emit("userList", data);
            },
            function (error) {
                logger.error(useraccount, error.message);
                error.errortype = returnData.errorType.dataBaseError.unknow;
                ep.emit("error", error);
            }
        );
    //组装用户列表信息，返回给前端
    ep.on("userList", function (data) {
        if (!data || tool.isEmptyObject(data)) {
            //未找到对象
            logger.error(useraccount, "调用/cgroup/list接口时，分组列表不存在");
            cb(returnData.createError(returnData.errorType.notexist, "获取分组列表不存在"));
        }
        else {
            var result = {};
            count = data.count;
            result.data = data.rows;
            result.total=count,
            result.totalpage = totalpage(count, size);
            result.page = page;
            result.size = size;
            cb(null, returnData.createData(result));
            logger.info(useraccount, "获取用户列表成功");
        }
    })
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/user/list错误", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });
};
exports.updateLocked = function(arg, cb){
    var userid=arg.userid;
    var confirmed=arg.disabled;
    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;
    var sysuser = db.models.sysuser;
    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "修改账户状态成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口user/locked错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    sysuser.update({confirmed: confirmed}, {
        where: { userid: userid }
    }).then(function (result) {
        ep.emit('ok', result);
    }).catch(function (error) {
        ep.emit("error", error);
    });
};
exports.setrole=function(arg,cb){
    var userid=arg.userid;
    var roleid=arg.roleid;
    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;
    var sysuser = db.models.sysuser;
    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "角色设置成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口user/setrole错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    sysuser.update({roleid: roleid }, {
        where: { userid: userid }
    }).then(function (result) {
        ep.emit('ok', result);
    }).catch(function (error) {
        ep.emit("error", error);
    });
}

exports.getrole = function(arg,cb){
    cb(null,returnData.createData(roleconfig));
}

var totalpage = function (total, size) {
    var page = 0;
    var num = Number(total) / Number(size);
    if (parseInt(num) == num)
        page = num;
    else
        page = Math.floor(num) + 1;
    return page;
}