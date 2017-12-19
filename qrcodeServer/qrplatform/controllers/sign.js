/**
 * Created by ivan on 15/11/27.
 */
//加载第三方模块
var uuid = require('node-uuid');
var moment = require('moment');
//加载项目内部模块
var db = require('../common/db');
var logger = require('../common/logger');
var returnData = require('../common/returnData');
var vo = require('../models/vomodels');
var mail = require('../common/email.js');
var tool = require('../common/tool');
var config = require('../../config');
var roleconfig = require('../roleconfig');
var eventproxy = require('eventproxy');
var authen = require('../common/authenticater');
var Q = require("q");

/**
 * 根据状态判断是否可以继续下一步操作
 * @param arg
 * @param confirmed
 * @param incompleted
 * @param locked
 * @param disabled
 * @private
 */
function _matchingState(arg, callback, confirmed, incompleted, locked, disabled) {
    var deferred = Q.defer();

    function mathUserState(user) {
        var errCode = "", accountErrorType = returnData.errorType.account;

        if (!user)
            errCode = returnData.errorType.notexist;
        else {
            if (typeof confirmed === "boolean" && user.confirmed !== confirmed)
                errCode = confirmed ? accountErrorType.unconfirmed : accountErrorType.confirmed;

            if (!errCode && typeof incompleted === "boolean" && user.updateinfo !== incompleted)
                errCode = incompleted ? accountErrorType.uncompleted : accountErrorType.incompleted;

            if (!errCode && typeof locked === "boolean" && user.locked !== locked)
                errCode = locked ? accountErrorType.unlock : accountErrorType.locked;

            if (!errCode && typeof disabled === "boolean" && user.disabled !== disabled)
                errCode = disabled ? accountErrorType.enabled : accountErrorType.disabled;
        }

        if (errCode) {
            logger.error(mail, "用户状态不符合");
            if (typeof callback === "function")
                callback(returnData.createError(errCode), null);
            else
                deferred.reject(errCode);
        } else {
            deferred.resolve(user, arg, callback);
        }
    }

    if (typeof arg === "string")
        _getUserByMail(arg).then(mathUserState); //如果arg参数为字符串，则为邮箱，并进行严格验证
    else if (typeof arg === "object") {
        if (arg.currentuser && arg.currentuser.useraccount) //如果arg为框架封闭后的，则获取其中的邮箱，并进行严格验证
            _getUserByMail(arg.currentuser.useraccount).then(mathUserState);
        else if (arg.useraccount)
            mathUserState(arg); //如果arg为用户信息，则进行懒惰验证
        else
            mathUserState(null);
    }

    return deferred.promise;
}

/**
 * 返回指定邮箱的用户信息
 * @param mail
 * @param callback
 * @private
 */
function _getUserByMail(mail) {
    var userdb = db.models.sysuser,
        deferred = Q.defer();

    userdb.findOne({ where: { useraccount: mail } })
        .then(function (user) {
            deferred.resolve(user);
        }).catch(function (err) {
            deferred.reject();
            logger.error(config.systemUser, "数据库错误，查找用户失败");
        });

    return deferred.promise;
}

/**
 * 获取当前登录用户信息
 * @param arg
 * @param callback
 * @private
 */
function _getCurrentUser(arg, callback) {
    _matchingState(arg).then(function (user) {
        user.userpwd = '';
        callback(null, returnData.createData(user));
    }, function (errCode) {
        callback(returnData.createError(errCode, '用户未登录！'), null);
    });
}

/**
 * 检测邮箱是否已经被注册
 * @param arg
 * @param callback
 * @private
 */
function _checkRegistered(arg, callback) {
    var deferred = Q.defer();
    _getUserByMail(arg.useraccount).then(function (user) {
        if (user) {
            if (callback && typeof callback === "function")
                callback(returnData.createError(returnData.errorType.exists, '邮箱已存在，请更换邮箱！'), null);
            else
                deferred.resolve(true);
        } else {
            if (callback && typeof callback === "function")
                callback(null, returnData.createData(true));
            else
                deferred.resolve(false);
        }
    });
    return deferred.promise;
}

/**
 * 登录
 * @param arg
 * @param callback
 * @private
 */
function _login(username, password, callback) {
    var proxy = new eventproxy();
    proxy.on('getentname', function (user) {
        var entdb = db.models.sysenterprise;
        entdb.findOne({
            where: { entid: user.entid },
            attributes: ['entname']
        }).then(function (data) {
            user = user.get({ chain: true });
            user.entname = data.entname;
            callback(null, user);
        }).catch(function (err) {
            callback(returnData.createError(returnData.errorType.unknow), null);
        })
    })
    _matchingState(username, callback, null, null, false, false).then(function (user) {
        if (user.userpwd === tool.genPwd(password)) {
            user.logintime = tool.date();
            user.failtimes = 0;
            user.save();
            user.userpwd = "";
            proxy.emit('getentname', user);
        } else {
            logger.error(username, '登录密码错误！');
            //检查当前登录的日期是否与系统记录上次登录错误时间是否为同一天
            if (!!user.loginfailtime && (moment().day() - moment(user.loginfailtime).day()) < 1) {
                //判断同一天是否超过10次被锁定,若超过执行锁定用户状态，未锁定则更新失败次数
                user.failtimes += 1;
                if (user.failtimes >= config.login.maxtimes) {
                    user.locked = true;
                    user.locktime = tool.date();
                }
            } else {
                user.failtimes = 1;
            }
            user.loginfailtime = tool.date();
            user.save();
            if (user.locked) {
                callback(returnData.createError(returnData.errorType.account.locked, "你的账户由于密码错误次数达到10次，已被锁定！"), null);
            } else {
                callback(returnData.createError(returnData.errorType.refuse, "用户密码错误，请输入正确密码，还可以尝试" + (config.login.maxtimes - user.failtimes) + "次！"), null);
            }
        }
    });
}

/**
 * 用户注册
 * @param arg
 * @param callback
 * @private
 */
function _register(arg, callback, req, res, next) {
    _checkRegistered(arg).then(function (isExist) {
        if (isExist) {
            logger.info(arg.useraccount, "邮箱已被注册");
            callback(returnData.createError(returnData.errorType.exists, '此邮箱已注册'), null);
        } else {
            var userdb = db.models.sysuser;

            var uservo = vo.sysuser.createnew();
            uservo.userid = uuid.v4();
            uservo.useraccount = tool.verifier.delSpace(arg.useraccount);
            uservo.userpwd = tool.genPwd(tool.verifier.delSpace(arg.userpwd));
            uservo.confirmed = false;
            uservo.disabled = false;
            uservo.confirmcontent = tool.genPwd(uuid.v4());
            uservo.entid = config.entinfo.entid;//uuid.v4();
            uservo.registtime = tool.date();
            uservo.confirmtime = moment().add(config.email.hours, 'hours').format(config.dateformat);
            uservo.failtimes = 0;
            uservo.roleid = 'normal';//注册用户默认为一般用户，最高权限系统管理员则手动新建，不通过邮件注册
            var entdb = db.models.sysenterprise;
            var entvo = vo.sysenterprise.createnew();
            entvo.entid = uservo.entid;
            entvo.createtime = new Date();
            db.sequelize.transaction(function (t) {
                return entdb.findOne({ transaction: t, where: { entid: entvo.entid } }).then(function (result) {
                    if (result) {
                        uservo.updateinfo = true;
                        return userdb.create(uservo, { transaction: t });
                    } else {
                        return entdb.create(entvo, { transaction: t }).then(function (result) {
                            return userdb.create(uservo, { transaction: t });
                        });
                    }
                })
            }).then(function (result) {
                req.body.username = uservo.useraccount;
                req.body.password = arg.userpwd;
                uservo.userpwd = '';
                //mail.sendActiveMail(uservo.useraccount, uservo.confirmcontent);
                logger.info(uservo.useraccount, "用户创建成功");
                authen.authenticate('local')(req, res, function (err) {
                    callback(null, returnData.createData(uservo));
                });
            }).catch(function (err) {
                logger.error(uservo.useraccount, "创建用户失败");
                callback(returnData.createError(returnData.errorType.unknow, err.message), null);
            });
        }
    });
}

/**
 * 重新发送激活邮件
 * @param arg
 * @param callback
 * @private
 */
function _remail(arg, callback) {
    _matchingState(arg, callback, false, null, false, false).then(function (user) {
        var confirmContent = tool.genPwd(uuid.v4());
        logger.error(user.useraccount, "生成密钥:" + confirmContent);
        user.update({
            confirmcontent: confirmContent,
            confirmtime: moment().add(config.email.hours, 'hours').format(config.dateformat)
        }).then(function (sucess) {
            logger.info(user.useraccount, '邮件重发，资料更新成功！' + user.confirmcontent);
            mail.sendActiveMail(user.useraccount, user.confirmcontent);
            callback(null, returnData.createData(true));
        }).catch(function (err) {
            logger.error(arg.currentuser.useraccount, err.message);
            callback(returnData.createError(returnData.errorType.unknow, err.message), null);
        });
    });
}

/**
 * 激活用户
 * @param arg
 * @param callback
 * @private
 */
function _confirm(arg, callback) {
    var userdb = db.models.sysuser;
    userdb.findOne({ where: { confirmcontent: arg.ukey } }).then(function (user) {
        if (user) {
            _matchingState(user, callback, false, null, false, false).then(function () {
                if (moment(user.confirmtime, config.dateformat).diff(moment()) < 0) {
                    logger.info(user.useraccount, "邮件激活失败，链接已超时");
                    callback(returnData.createError(returnData.errorType.timeout, "邮件激活失败，链接已超时"), null);
                } else {
                    user.update({
                        confirmed: true,
                        confirmcontent: "",
                        confirmtime: tool.date()
                    }).then(function (suc) {
                        logger.info(user.useraccount, '邮件激活成功！');
                        callback(null, returnData.createData(true))
                    }, function (err) {
                        logger.error(config.systemUser, err);
                        throw err;
                    });
                }
            });
        } else {
            logger.error(config.systemUser, '邮件激活失败，未找到激活码：' + arg.ukey);
            callback(returnData.createError(returnData.errorType.notexist, '邮件激活失败，未找到激活码！'), null);
        }
    }).catch(function (e) {
        logger.error(config.systemUser, '邮件激活失败, ukey: ' + arg.ukey);
        callback(returnData.createError(returnData.errorType.unknow, '服务器错误，邮件激活失败，请稍后再试。' + e.message), null);
    });
}

/**
 * 获取企业信息
 * @param arg
 * @param callback
 * @private
 */
function _getEnterpriseInfo(arg, callback) {
    _matchingState(arg, callback).then(function (user) {
        var entdb = db.models.sysenterprise;
        entdb.findOne({
            where: { entid: user.entid }
        }).then(function (ent) {
            if (ent) {
                logger.info(user.useracount, "企业信息ENT:" + ent);
                callback(null, returnData.createData(ent));
            } else {
                logger.error(arg.currentuser.useraccount, "查找出错");
                callback(null, returnData.createData(ent));
            }
        }).catch(function (err) {
            logger.error(arg.currentuser.useraccount, err.message);
            callback(returnData.createError(returnData.errorType.unknow), err.message);
        });
    });
}

/**
 * 更新企业信息
 * @param arg
 * @param callback
 * @private
 */
function _updateEnterpriseInfo(arg, callback) {
    _matchingState(arg, callback, null, null, false, false).then(function (user) {
        var entdb = db.models.sysenterprise;
        entdb.findOne({ where: { entid: user.entid } })
            .then(function (ent) {
                if (ent) {
                    ent.update({
                        entname: tool.verifier.delSpace(arg.entname),
                        entcontact: tool.verifier.delSpace(arg.entcontact),
                        entphone: tool.verifier.delSpace(arg.entphone),
                        entaddr: tool.verifier.delSpace(arg.entaddr || ''), //BUG#292企业资料更新_企业地址_企业地址为必填项
                        areacode: tool.verifier.delSpace(arg.areacode),
                        entemail: config.entinfo.entemail,//user.useraccount,
                        imageurl: arg.imageurl,
                        updateinfotime: tool.date()
                    }).then(function (data) {
                        user.updateinfotime = tool.date();
                        user.updateinfo = true;
                        user.save();
                        logger.info(user.useraccount, '更新企业资料成功！');
                        arg.currentuser.entname = data.entname;
                        callback(null, returnData.createData(true));
                    }).catch(function (err) {
                        logger.error(entvo.entemail, err.message);
                        callback(returnData.createError(returnData.errorType.unknow, err.message), null);
                    });
                } else {
                    callback(null, returnData.createError(returnData.errorType.notexist, '企业信息不存在'));
                }
            }).catch(function (err) {
                logger.error(entvo.entemail, err.message);
                callback(returnData.createError(returnData.errorType.unknow, err.message), null);
            });
    });
}

/**
 * 更新用户密码
 * @param arg
 * @param callback
 * @private
 */
function _resetPassword(arg, callback) {
    _matchingState(arg, callback, null, null, false, false).then(function (user) {
        if (user.userpwd != tool.genPwd(arg.userpwd))
            callback(returnData.createError(returnData.errorType.notexist, '用户密码不匹配'), null);
        else {
            user.update({
                userpwd: tool.genPwd(arg.usernewpwd)
            }).then(function (data) {
                logger.info(user.useraccount, '密码更新成功！');
                callback(null, returnData.createData(true));
            }).catch(function (err) {
                logger.error(user.useraccount, err.message);
                callback(returnData.createError(returnData.errorType.unknow, err.message), null);
            });
        }
    });
}

/**
 * 找回密码
 * @param arg
 * @param callback
 * @private
 */
function _findPassword(arg, callback) {
    _matchingState(arg.useraccount, callback, null, null, null, false).then(function (user) {
        user.update({
            confirmcontent: tool.genPwd(uuid.v4()),
            confirmtime: moment().add(config.email.hours, 'hours').format(config.dateformat),
            locked: true,
            locktime: tool.date()
        }).then(function (sucess) {
            logger.info(user.useraccount, '邮件已发送，请接收邮箱！:' + user.confirmcontent);
            mail.sendMailFindPwd(user.useraccount, user.confirmcontent);
            callback(null, returnData.createData(true));
        }).catch(function (err) {
            logger.error(user.useraccount, err.message);
            callback(returnData.createError(returnData.errorType.unknow, err.message), null);
        });
    });
}

/**
 * 检查找回密码密钥
 * @param arg
 * @param callback
 * @private
 */
function _checkFindPasswordKey(arg, callback) {
    var userdb = db.models.sysuser,
        deferred = Q.defer();

    userdb.findOne({ where: { confirmcontent: arg.ukey } }).then(function (user) {
        if (user) {
            _matchingState(user, callback, null, null, true, false).then(function () {
                //判断激活时效
                if (moment(user.confirmtime, config.dateformat).diff(moment()) < 0) {
                    logger.info(user.useraccount, "检测找回密码密钥失败，密钥已过期");
                    if (typeof callback === "function")
                        callback(returnData.createError(returnData.errorType.timeout, "密钥已过期"), null);
                    else
                        deferred.reject(returnData.errorType.timeout);
                } else {
                    logger.info(user.useraccount, '检测找回密码密钥成功！');
                    if (typeof callback === "function")
                        callback(null, returnData.createData(true));
                    else
                        deferred.resolve(user, arg, callback);
                }
            });
        } else {
            logger.error(config.systemUser, '找回密码确认失败,未找到激活码！' + arg.ukey);
            if (typeof callback === "function")
                callback(returnData.createError(returnData.errorType.notexist, '找回密码确认失败，未找到激活码！'), null);
            else
                deferred.reject(returnData.errorType.notexist);
        }
    }).catch(function (e) {
        logger.error(config.systemUser, '找回密码确认失败, ukey: ' + arg.ukey);
        callback(returnData.createError(returnData.errorType.unknow, '服务器错误，找回密码确认失败，请稍后再试！' + e.message), null);
    });

    return deferred.promise;
}

/**
 * 根据密钥重置密码
 * @param arg
 * @param callback
 * @private
 */
function _resetPasswordByKey(arg, callback) {
    _checkFindPasswordKey(arg).then(function (user) {
        user.locked = false;
        user.userpwd = tool.genPwd(arg.password);
        user.confirmcontent = "";
        locktime: tool.date();
        user.save();
        logger.info(user.useraccount, '根据密钥修改成功！');
        callback(null, returnData.createData(true));
    }, function (errCode) {
        logger.error(config.systemUser, '根据密钥修改失败, ukey: ' + arg.ukey);
        callback(returnData.createError(errCode, '根据密钥修改失败'), null);
    });
}


/**
 * 判断角色是否拥有访问的权限
 * @param url
 * @param roleId
 * @param callback
 * @constructor
 */
exports.rolecheck = function (url, roleId, callback) {
    //如果权限列表为空，表示全部允许
    if (!roleId && roleId == '' || roleId == undefined){
        roleId = config.authentic.defaulerole;
    }else if(roleId == undefined){//mobile
        callback(true);return;
    }       

    if (roleconfig[roleId].permissions.length > 0) {
        /*if (roleconfig[roleId].permissions.indexOf(url) > -1) {
            callback(true);
        }
        else {
            callback(false);
        }*/

        for(var i = 0 ; i < roleconfig[roleId].permissions.length ; ++i){
            var urlpermission = roleconfig[roleId].permissions[i];
            if(url.indexOf(urlpermission) == -1){
                continue;
            }else{
                callback(false);return;
            }
        }

        callback(true);
    }
    else {
        callback(true);
    }
};


exports.login = _login;
exports.register = _register;
exports.checkregist = _checkRegistered;
exports.getuserinfo = _getCurrentUser;
exports.remail = _remail;
exports.confirm = _confirm;
exports.getentinfo = _getEnterpriseInfo;
exports.updateentinfo = _updateEnterpriseInfo;
exports.updatepwd = _resetPassword;
exports.findpwd = _findPassword;
exports.findpwdconfirm = _checkFindPasswordKey;
exports.updatepwdbykey = _resetPasswordByKey;

/**
 * 检查用户状态
 * @param userid
 * @param refusestates [禁用，锁定，邮件确认，资料跟新]。null表示不对该状态进行校验。例[true,true,null,null]表示拒绝已禁用或已锁定的
 * @param cb
 */
exports.statecheck = function (userid, refusestates, cb) {
    if (refusestates) {
        _matchingState(userid, null, refusestates[0], refusestates[1], refusestates[2], refusestates[3]).then(function (user) {
            cb(null, true);
        }, function (errcode) {
            cb(errcode, false);
        });
    } else {
        cb(null, true);
    }
};

