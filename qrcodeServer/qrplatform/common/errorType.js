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
    used:"used",
    account: {
        unlogin: 'unlogin', //帐号未登录
        confirmed: "confirmed", //帐号已激活
        unconfirmed: "unconfirmed", //帐号未激活
        enabled: "enabled", //帐号未禁用
        disabled: "disabled", //帐号已禁用
        incompleted: "incompleted", //帐号信息已填写
        uncompleted: "uncompleted", //帐号信息未填写
        locked: "locked", //帐号已锁定
        unlock: "unlock", //帐号未锁定
        pointerror:"pointerror",//积分错误,一般由积分不足引起
        passworderror:"passworderror"
    },
    project:{
        started:'started',
        stoped:'stop',
        notype:'notype',
        badparam:"badparam",
        outofdate:"outofdate",
        norpitem:"norpitem",
        noquestion:"noquestion",
        nopoint:"nopoint",
        nosale:"nosale",
        nogift:"nogift",
        nomoney:"nomoney",
        notenoughqramount:"notenoughqramount",//没有足够的二维码开启活动
        invaild:'invaild',
        nocategory:'nocategory',//该活动没有关联商品类别
        categoryused:'categoryused'//关联的商品类别正被其他活动启用中
    },
    mobile:{
        unknow: "unknow",
        limit:"limit",
        badcode:"badcode",
        noexists:"noexists",
        noproject:"noproject",
        refuse:"refuse",
        used: "used",
        outofdate: "outofdate",
        badsmscode:"badsmscode",
        unfinished:"unfinished"
    },
    verifyError: {
        unknow: ' verifyError',
        notAllowNull: 'VerifyError.notAllowNull',
        formatError: 'formatError'
    },
    dataBaseError: {
        unknow: 'databaseError',
        connectError: 'databaseError.connectError',
        notfind:'databaseError.notfind'
    },
    club:{
        unknow: 'clubError',
        pointExchangeError:'pointExchangeError'
    },
    mcdqrmanager:{
        category:{
            mcdoccupied: 'mcdoccupied',//类别关联商品
            projectoccupied:'projectoccupied'//类别关联进行的活动
        },
        merchandise:{
            nocategory: 'nocategory'//异常：商品没有对应分类
        }
    },
    customermanager:{

    },
    mallmanager:{
        understock:'understock',//库存不足
        amounterror:'amounterror',//库存更新失败
        excelerror:'excelerror'//导入excel优惠券错误
    },
    configerror: 'configerror'
};

module.exports = errorType;