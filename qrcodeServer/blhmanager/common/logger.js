/**
 *
 */
var log4js = require('log4js');
var config = require('../../config');
//get log config info
var logConfig = config.log;

//get log object
log4js.configure({
    appenders: [
        {type: 'console'}, //控制台输出
        logConfig
    ],
    replaceConsole: true
});
var loggerman = log4js.getLogger(logConfig.category);
//写日至
function logMsg(userId, msg) {
    var str = '';
    if (userId && userId != '')
        str = '[user：' + userId + ']' + msg;
    else
        str = '[user：UNKNOW]' + msg;
    return str;
}

/**
 * 获取日志管理对象
 * @returns {*}
 */
exports.logger = function () {
    loggerman.setLevel('INFO');
    return loggerman;
};
/**
 * 记录一般信息日志
 * @param user 当前用户
 * @param msg 日志信息
 */
exports.info = function (user, msg) {

    var str = logMsg(user, msg);
    loggerman.info(str);
};
/**
 * 记录出错信息日志
 * @param user 当前用户
 * @param msg 日志信息
 */
exports.error = function (user, msg) {

    var str = logMsg(user, msg);
    loggerman.error(str);
};
/**
 * 记录警告信息日志
 * @param user 当前用户
 * @param msg 日志信息
 */
exports.warn = function (user, msg) {

    var str = logMsg(user, msg);
    loggerman.warn(str);
}