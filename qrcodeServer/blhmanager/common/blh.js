/**
 * Created by tao on 2017/7/19.
 */
var config = require('../../config');
var md5 = require('MD5');

/**
 * 百利汇参数对象
 * @type {{appId: number, appKey: string, tamptimes: number}}
 */
var param = {
    app_id:config.blh.app_id,
    app_key : config.blh.app_key,
    tamptimes:Math.floor((new Date().getTime())/1000),
    sign:""
};
var signType= {
    product_All: 1,
    product_Info: 2,
    product_Update: 3,
    excute_Update:4,
    order_Generate:5,
    order_Express:6
};

var handleType={
    full:1,
    insert:2,
    update:3,
    delete:4
};
var shelves={
    on:0,
    off:1
};
function getTamptimes() {
    var t = Math.floor((new Date().getTime())/1000);
    return t;
}

exports.param = param;
exports.signType=signType;
exports.handleType=handleType;
exports.shelves = shelves;
exports.getTamptimes=getTamptimes;

