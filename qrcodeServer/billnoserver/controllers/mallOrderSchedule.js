/**
 * Created by fungwan on 17/06/08.
 */
var eventproxy = require('eventproxy');
var moment = require('moment');
var Q = require("q");
var multiline = require('multiline');
var Alidayu = require('alidayujs');
var request = require('request');
var config = require('../../config');
var logger = require('../common/logger');

var sequelize = {};
var mallorderdb = {};

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
    mallorderdb = sequelize.import("../models/mallorder");

    _getOutDateOrders().then(function(res){
        
        var orderidlist = res['orderid'];
        var orderbmlist = res['orderbm'];

        _updateOrderStates(orderidlist);
        _closeWxPayOrderStates(orderbmlist);

    }).catch(function(err){
        logger.error('sys', '执行检查超时订单定时任务失败:' + err.message);
    })
};

/**
 *
 * @description 获取超时的订单集合
 * 
 * @param null
 * 
 * @return promise
 */
function _getOutDateOrders() {
    
    //SELECT orderid,orderbm,state,createtime,paymoney from mallorder WHERE state = '0' and (1504506250000 - createtime) > 7200000

    var currenttime = moment().valueOf(),outOfTime = 7200000;
	var closeEle = {},
    sql = "SELECT orderid,orderbm,state,createtime,paymoney from mallorder WHERE state = '0' and (" + currenttime + " - createtime) > " + outOfTime;

    var defer = Q.defer();

    logger.info(null, '开始获取超时订单列表');
    sequelize.query(sql).spread(function (results, metadata) {

        var orderidlist = [],orderbmlist = [];
        for (var index = 0; index < results.length; ++index) {

            orderidlist.push(results[index].orderid);

            if(results[index].paymoney > 0)
                orderbmlist.push(results[index].orderbm);
        }

        closeEle['orderid'] = orderidlist;
        closeEle['orderbm'] = orderbmlist;

        defer.resolve(closeEle);

    }).catch(function (error) {
        defer.reject(error);
    });

    return defer.promise;

}

function _updateOrderStates(orderidlist){
    
    mallorderdb.update({state:'100'},{where:{
        orderid:{
            $in:orderidlist
        }
    }}).then(function(){

    }).catch(function(err){
        logger.error('sys', '执行更新订单状态为100出错，原因是:' + err.message);
    })
}

function _closeWxPayOrderStates(orderbmlist){

    orderbmlist.forEach(function(orderbm){
        var opt = {};
        opt.out_trade_no = orderbm;
        var closeorderurl = config.services.wxpayserver.url + config.services.wxpayserver.interfaces.closeOrder;
        request.post({ url: closeorderurl, form: opt }, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var d = JSON.parse(body);
                if (!d.error) {
                    logger.info('wxcb', '发起关闭订单成功，商户订单id:' + orderbm);
                } else {
                    logger.error('wxcb', '发起关闭订单失败，商户订单id:' + orderbm + '错误原因：' + d.error.message);
                }
            } else {
                logger.error('wxcb', '发起关闭订单失败，商户订单id:' + orderbm + '错误原因：' + err.message);
            }
        });
    })    
}

exports.task = task;