/**
 * Created by tao on 2017/7/19.
 */
var config = require('../../config');
var logger = require('../common/logger');
var returndata = require('../common/returnData');
var until  = require('../common/requestUntil');
var blh= require('../common/blh');
var Q = require('q');
var eventproxy = require('eventproxy');
var dao = require('./product');
var clone = require('clone');
var sleep = require('thread-sleep');

/**
 * 根据ID获取详情，并同步写入数据库
 * @param itemIds
 */
function productInfo(itemIds) {
    var defer = Q.defer();
    var proxy = new eventproxy();
    proxy.after('get_info',itemIds.length,function (list) {
        logger.info(config.systemUser,"获取商品数据完成，开始写入数据库，本次共【"+list.length+"】条");
        //将数据写入数据库
        for(var i=0;i<list.length;i++){
            list[i].category_name=decodeURIComponent(list[i].category_name).replace(/\+/g,' ');
            list[i].product_name=decodeURIComponent(list[i].product_name).replace(/\+/g,' ');
            list[i].product_infos=decodeURIComponent(list[i].product_infos).replace(/\+/g,' ');
            list[i].product_img = JSON.stringify(list[i].product_img);
        };
        dao.batch(list).then(function () {
            defer.resolve("本次共同步【"+list.length+"】条");
        }).catch(function(err){
            defer.reject(err);
        });
    });
    function reqBatch(items) {
        items.forEach(function (item) {
            //根据id请求商品详情。
            var param = clone(blh.param);
            param.tamptimes=blh.getTamptimes();
            param.itemId=item.itemId;
            param.sign = until.sign(param,blh.signType.product_Info);
            until.requestBlh(config.blh.url.product_Info,param).then(function (data) {
                hitCounts++;
                //console.log('hits:'+hitCounts);
                proxy.emit('get_info',data.value);
            }).catch(function(err){
                logger.error(config.systemUser,err);
                defer.reject(err);
            });
        });
    }
    var reqItems=[];var hitCounts = 0;
    //console.log('total:'+itemIds.length);
    for(var i=0;i<itemIds.length;i++){
        reqItems.push(itemIds[i]);
        //一批请求一次
        if((i+1)%config.blh.numbers==0){
            reqBatch(reqItems);
            //请求后休眠
            sleep(config.blh.times);
            reqItems=[];
        }
    }

    if(reqItems.length > 0){
        reqBatch(reqItems);
    }


    return defer.promise;
};

/**
 * 获取商品信息
 * @param req
 * @param res
 */
function all(req,res) {
    logger.info(config.systemUser,"同步百利汇所有商品");
    //1、获取所有商品id信息
    var param=clone(blh.param);
    param.tamptimes=blh.getTamptimes();
    param.sign=until.sign(param,blh.signType.product_All);
    //2、根据id信息获取所有商品详细信息，并写入本地数据库
    // 错误处理；
    function fail(err) {
        logger.error(config.systemUser,"获取百利汇所有商品ID时发生错误："+err);
        res.json(returndata.createError(err));
    };
    function success(data) {
        if(data.code!=500) {
            res.json(returndata.createError(data));
            return;
        }
        logger.info(config.systemUser,"开始获取商品详细信息");
        productInfo(data.value).then(function (message) {
            res.json(returndata.createData({"success":"true","message":message}));
        }).catch(fail);
    };
    until.requestBlh(config.blh.url.product_All,param).then(success).catch(fail);
};
/**
 * 更新商品信息
 * @param req
 * @param res
 */
function update(req,res) {
    logger.info(config.systemUser, "同步百礼汇变更商品");
    var proxy = new eventproxy();
    var param = clone(blh.param);
    param.tamptimes=blh.getTamptimes();
    param.sign = until.sign(param, blh.signType.product_Update);
    proxy.after('update',2,function (objList) {
        logger.info(config.systemUser,"开始处理更新通知");
        var list=[];
        for(var i=0;i<objList.length;i++){
            list = list.concat(objList[i]);
        }
        var parObj = clone(blh.param);
        param.tamptimes=blh.getTamptimes();
        proxy.after('excute',list.length,function (list) {
            logger.info(config.systemUser,"更新通知完成");
            if(res) res.json(returndata.createData(true));
        });
        list.forEach(function (item) {
            parObj.itemId=item.itemId;
            parObj.update_id=item.update_id;
            parObj.sign = until.sign(parObj,blh.signType.excute_Update);
            until.requestBlh(config.blh.url.excute_Update,parObj).then(function (data) {
                if(data.code==500){
                    proxy.emit('excute',data);
                }else{
                    proxy.emit('excute',data);
                    logger.error(config.systemUser,JSON.stringify(data));
                }
            });
        });
    });
    // 错误处理；
    function fail(err) {
        logger.error(config.systemUser, "获取百利汇更新商品ID时发生错误：" + err);
        if(res) {
            res.json(returndata.createError(err));
            return;
        }else{
            return returndata.createError(err);
        }
    };
    function success(data) {
        var items = [];
        if(data.code!=500) {
            if(res) {
                res.json(returndata.createError(data));
                return;
            }else{
                return returndata.createError(data);
            }
        }
        items=items.concat(data.value.onshelves|| []);
        items=items.concat(data.value.settlement|| []);
        items=items.concat(data.value.details|| []);
        var uqItems=[];bs={};
        for(var i=0;i<items.length;i++){
            if(items[i] && !bs[items[i].itemId]){
                uqItems.push({itemId:items[i].itemId});
                bs[items[i].itemId]=1;
            }
        }
        productInfo(uqItems).then(function (message) {
            proxy.emit('update',items);
        }).catch(fail);
        dao.updateState((data.value.offshelves||[]),blh.shelves.off).then(function () {
            proxy.emit('update',(data.value.offshelves||[]));
        }).catch(fail);
    };
    until.requestBlh(config.blh.url.product_Update, param).then(success).catch(fail);
};

exports.all = all;
exports.update=update;
