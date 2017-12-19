/**
 * Created by fungwan on 17/06/08.
 */
var eventproxy = require('eventproxy');
var moment = require('moment');
var Q = require("q");
var multiline = require('multiline');
var Alidayu = require('alidayujs');

var config = require('../../config');
var logger = require('../common/logger');

var sequelize = {};
var custdb = {}, favoritesdb = {}; custmap = {}, pdtmap = {};

/**
 *
 * @description task entrance
 * 
 * @param sequelize
 * 
 * @return void
 */
function task(_sequelize) {

    sequelize = _sequelize;
    favoritesdb = sequelize.import("../models/favorites");
    custdb = sequelize.import("../models/custextend");

    custmap = {}, pdtmap = {};//reset data

    _getDistinctPdt().then(_getConditionUser)
        .then(_getRidOfUser)
        .then(function (res) {
            var data = _wrapData(res);
            _sendSmsMsg(data);
        }).catch(function (err) {
            logger.error('sys', '执行检查收藏夹定时任务失败:' + err.message);
        })
};

/**
 *
 * @description step1:获取收藏夹去重后的产品列表
 * 
 * @param null
 * 
 * @return promise
 */
function _getDistinctPdt() {

    var pdtlist = [],
        sql = 'SELECT DISTINCT favorites.productid,mallproduct.price,mallproduct.productname FROM favorites LEFT JOIN mallproduct on favorites.productid = mallproduct.productid;'

    var defer = Q.defer();

    logger.info(null, '开始获取收藏夹去重后的产品列表');
    sequelize.query(sql).spread(function (results, metadata) {

        for (var index = 0; index < results.length; ++index) {
            pdtmap[results[index].productid] = {
                'productname': results[index].productname
            }
            pdtlist.push(results[index]);
        }

        defer.resolve(pdtlist);

    }).catch(function (error) {
        defer.reject(error);
    });

    return defer.promise;
}

//todo store product and customer mapinfo

/**
 *
 * @description step2:遍历step1获取的产品列表，查询符合条件的用户列表
 * 
 * @param pdtlist
 * 
 * @return promise
 */
function _getConditionUser(pdtlist) {

    var deferAll = Q.defer();

    function __comparePrice(ele) {

        var beyondPoint = _priceConvertPoint(ele.price);
        var usrList = [];//存放符合条件的用户列表

        var defer = Q.defer();

        custdb.findAll({
            where: {
                favoritesnotify: 1,
                point: {
                    $gt: beyondPoint,
                }
            },
            attributes: ['custid', 'phone']
        }).then(function (res) {

            for (var m = 0; m < res.length; ++m) {

                var usrObj = res[m].get({ chain: true });
                custmap[usrObj.custid] = usrObj;
                usrList.push(usrObj.custid);
            }
            ele.usrList = usrList;

            defer.resolve(ele);

        }).catch(function (err) {
            defer.reject(err);
        })

        return defer.promise;
    }

    var promiseArray = pdtlist.map(function (value, index, self) {
        return __comparePrice(value);
    });

    Q.all(promiseArray).then(function (results) {
        deferAll.resolve(results);
    }).catch(function (err) {
        deferAll.reject(results);
    })

    return deferAll.promise;
}


/**
 *
 * @description step3:剔除没有收藏相应商品的用户
 * 
 * @param pdtlist
 * 
 * @return promise
 */
function _getRidOfUser(pdtlist) {

    var deferAll = Q.defer();

    function __ridUser(ele) {

        var allUsrList = []; var favUsrList = [];//存放收藏夹不为空用户列表
        var uLength = ele.usrList.length,
            usrList = ele.usrList;

        for (var i = 0; i < uLength; ++i) {
            allUsrList.push(usrList[i]);
        }

        var defer = Q.defer();

        favoritesdb.findAll({
            where: {
                productid: ele.productid,
                custid: {
                    $in: allUsrList
                }
            }
        }).then(function (res) {
            for (var m = 0; m < res.length; ++m) {
                var usrObj = res[m].get({ chain: true });
                favUsrList.push(usrObj.custid);
            }
            ele.usrList = favUsrList;

            defer.resolve(ele);
        }).catch(function (err) {
            defer.reject(err);
        })

        return defer.promise;
    }

    var promiseArray = pdtlist.map(function (value, index, self) {
        return __ridUser(value);
    });

    Q.all(promiseArray).then(function (results) {
        deferAll.resolve(results);
    }).catch(function (err) {
        deferAll.reject(results);
    })

    return deferAll.promise;
}


/**
 *
 * @description step4:依据当前的pdlist,包装数据
 * 
 * @param pdtlist
 * 
 * @return promise
 * 
 * @eg:
 * {
 *  custid:[productid,...],
 *  ... 
 * }
 */
function _wrapData(pdtlist) {

    /*

    [
        {productid:xxx,price:xxx,usrList:[x,x,x]}
    ]

    */

    /**
     * description:
     * 1.合并每个商品id对应的usrList => allUsrList
     * 2.去重第一步allUsrList => unqiueArray
     * 3.遍历unqiueArray对比pdtlist中的usrList
     * 4.最后得到用户对应需要通知的商品
     */

    var allUsrList = [], unqiueArray;
    pdtlist.forEach(function (val, index, array) {
        allUsrList = allUsrList.concat(val.usrList);
    });

    unqiueArray = _unique(allUsrList);

    var rtObj = {};
    for (var i = 0; i < unqiueArray.length; ++i) {
        var _custid = unqiueArray[i];
        rtObj[_custid] = [];
        pdtlist.forEach(function (val, index, array) {
            if (val.usrList.indexOf(_custid) != -1) {
                rtObj[_custid].push(val.productid);
            }
        });
    }

    return rtObj;
}


/**
 *
 * @description step5:发送收藏夹通知
 * 
 * @param usrList
 * 
 * @return void
 * 
 */

function _sendSmsMsg(usrList) {

    var options = config.sms.favoritesNotifyOptions;

    var usrCounts = 0,smsUsrLimits = 200;

    for (n in usrList) {
        var custinfo = custmap[n];
        if (!custinfo.phone) {
            continue;
        }
        options.rec_num += custinfo.phone + ',';
        usrCounts++;

        var favPdtList = usrList[n]; var sendContent = '';
        favPdtList.forEach(function (val) {
            var pdtName = pdtmap[val].productname;
            sendContent += pdtName + ',';
        });

        if (usrCounts > smsUsrLimits) {
            var rec_phones = options.rec_num;
            options.rec_num = rec_phones.substring(0, rec_phones.length - 1);

            usrCounts = 0;

            //sleep 1 s
            (function (options) {

                setTimeout(function () {
                    alis(options);
                }, 1000);

            })(options);
        
            options.rec_num = '';
        }
    }

    if (0 < usrCounts <= smsUsrLimits) {

        var rec_phones = options.rec_num;
        options.rec_num = rec_phones.substring(0, rec_phones.length - 1);

        (function (options) {
            alis(options);
        })(options);
    }
}


/**
 *
 * @description 发送短信
 * 
 * @param options
 * 
 * @return void
 * 
 */

function alis(options) {

    var alidayu = new Alidayu(config.sms.config);

    alidayu.sms(options, function (err, result) {
        err = JSON.parse(err);
        if (err.alibaba_aliqin_fc_sms_num_send_response && err.alibaba_aliqin_fc_sms_num_send_response.result
            && err.alibaba_aliqin_fc_sms_num_send_response.result.success
            && err.alibaba_aliqin_fc_sms_num_send_response.result.success == true) {
            logger.info(null, '发送收藏夹通知短信成功:' + options.rec_num + ':' + JSON.stringify(err));
        } else {
            logger.error(null, '发送收藏夹通知短信失败:' + options.rec_num + ':' + JSON.stringify(err));
        }
    })
}

//数组去重
function _unique(array) {
    var n = {}, r = []; //n为hash表，r为临时数组
    for (var i = 0; i < array.length; i++) //遍历当前数组
    {
        if (!n[array[i]]) //如果hash表中没有当前项
        {
            n[array[i]] = true; //存入hash表
            r.push(array[i]); //把当前数组的当前项push到临时数组里面
        }
    }
    return r;
}

//价格转积分
function _priceConvertPoint(price) {
    return price * 1;
}

exports.task = task;