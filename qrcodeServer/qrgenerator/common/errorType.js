/**
 * Created by root on 15-11-28.
 */
var errorType = {
    unknow: 'unknow',
    refuse: 'refuse',
    exists: 'exists',
    notexist: 'notexist',
    paraerror:'paraerror', //参数错误
    timeout: "timeout",
    account: {
        unlogin: 'unlogin', //帐号未登录
        confirmed: "confirmed", //帐号已激活
        unconfirmed: "unconfirmed", //帐号未激活
        disabled: "disabled", //帐号已禁用
        locked: "locked", //帐号已锁定
        unlock: "unlock" //帐号未锁定
    },
    verifyError: {
        unknow: ' verifyError',
        notAllowNull: 'VerifyError.notAllowNull',
        formatError: 'formatError'
    },
    dataBaseError: {
        unknow: 'databaseError',
        connectError: 'databaseError.connectError'
    },
    configerror: 'configerror'
};

module.exports = errorType;