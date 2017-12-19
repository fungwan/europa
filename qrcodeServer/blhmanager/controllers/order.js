/**
 * Created by tao on 2017/7/19.
 */
var config = require('../../config');
var logger = require('../common/logger');
var returndata = require('../common/returnData');
var blh= require('../common/blh');
var until= require('../common/requestUntil');
var clone = require('clone');

/**
 * 请求生产订单
 * @param req
 * @param res
 */
function generate(req,res) {
    //验证参数
    if (!req.body.order) {
        res.json(returndata.createError("参数错误，无订单信息"));
        return
    }
    var reqOrder = JSON.parse(req.body.order);
    if (!reqOrder.orderId) {
        res.json(returndata.createError("参数错误,OrderId无效"));
        return;
    }
    if (!reqOrder.itemId) {
        res.json(returndata.createError(500, "参数错误,itemId无效"));
        return;
    }
    if (!reqOrder.num) {
        res.json(returndata.createError(500, "参数错误,num无效"));
        return;
    }
    if (!reqOrder.realname) {
        res.json(returndata.createError(500, "参数错误,realname无效"));
        return;
    }
    if (!reqOrder.phone) {
        res.json(returndata.createError(500, "参数错误,phone无效"));
        return;
    }
    if (!reqOrder.address) {
        res.json(returndata.createError(500, "参数错误,address无效"));
        return;
    }
    if (!reqOrder.remarks) reqOrder.remarks = " ";
    logger.info(config.systemUser, "生成订单参数验证通过");
    logger.info(config.systemUser, "开始请求生成百利汇订单");
    var order = clone(blh.param);
    order.tamptimes=blh.getTamptimes();
    order.orderId = reqOrder.orderId;//"0718003";
    order.itemId = reqOrder.itemId;//10667;
    order.num = reqOrder.num;
    order.realname = reqOrder.realname;//"erathink";
    order.phone = reqOrder.phone //"13888886666";
    order.address = reqOrder.address; //"四川成都";
    order.remarks = reqOrder.remarks;//"remarks";
    order.sign = until.sign(order, blh.signType.order_Generate);
    until.requestBlh(config.blh.url.order_Generate, order).then(function (data) {
        if (data.code == 500) {
            logger.info(config.systemUser, "完成生成百利汇订单");
            logger.info(config.systemUser, JSON.stringify(data));
            res.json(returndata.createData(data));
        } else {
            res.json(returndata.createError(500,data.message));
        }
    }).catch(function (err) {
        logger.error(config.systemUser, err);
        res.json(returndata.createError(err));
    });
};
/**
 * 查询快递信息
 * @param req
 * @param res
 */
function express(req,res) {
    if(!req.body.order) {
        res.json(config.systemUser,"参数错误：无订单信息");
        return;
    }
    var reqOrder = JSON.parse(req.body.order);
    if(!reqOrder.orderId) {
        res.json(returndata.createError(500, "参数错误：orderId无效"));
        return;
    }
    if(!reqOrder.itemId) {
        res.json(returndata.createError(500, "参数错误：itemId无效"));
        return;
    }
    logger.info(config.systemUser,"请求百利汇订单快递");
    var order = clone(blh.param);
    order.tamptimes=blh.getTamptimes();
    order.orderId=reqOrder.orderId;
    order.itemId=reqOrder.itemId;
    order.sign = until.sign(order, blh.signType.order_Express);
    until.requestBlh(config.blh.url.order_Express,order).then(function (data) {
        if (data.code == 500) {
            if(data.value.logisticsstatus==2) {
                data.value.logisticscompany = decodeURI(data.value.logisticscompany);
                var expUrl = clone(config.blh.expressUrl);
                data.value.logisticsurl = expUrl.replace('{1}', data.value.logisticscompany).replace('{2}', data.value.logisticsid);
                data.value.logisticsjsonurl = expUrl.replace('{1}', data.value.logisticscompany).replace('{2}', data.value.logisticsid + '/json/1');
            }
            if(data.value.logisticsjsonurl){
                until.requestExpress(data.value.logisticsjsonurl).then(function (d) {
                    data.value.logisticsjson=d;
                    res.json(returndata.createData(data.value));
                }).catch(function (e) {
                    res.json(returndata.createData(data.value));
                });
            }else {
                res.json(returndata.createData(data.value));
            }
        } else if(data.code==511){
            res.json(returndata.createData(data.value));
        } else {
            // 501：订单不存在
            // 502：接口编号错误
            // 503: 接口调用超时
            // 504：签名验证失败
            // 505：缺少参数
            // 507：itemId不存在
            // 509：系统异常
            // 510:IP错误
            // 511:订单未发货
            if(!data.message){
                switch (data.code){
                    case 501:
                        data.message="订单不存在";
                        break;
                    case 502:
                        data.message="接口编号错误";
                        break;
                    case 507:
                        data.message="itemId不存在";
                        break;
                }
            }
            res.json(returndata.createError(500,data.message));
        }
        logger.info(config.systemUser,"完成百利汇订单快递查询"+JSON.stringify(data));
    }).catch(function (err) {
        logger.error(config.systemUser, err);
        res.json(returndata.createError(err));
    });
}

exports.generate = generate;
exports.express=express;