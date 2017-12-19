"use strict";
var express = require('express');
var router = express.Router();

var returnData = require('../common/returnData');
var config = require('../../config');
var validation = require('../lib/formValidator');
var pmodels = require('../models/prmodels');
var ErrorType=require('../common//errorType');
var logger=require('../common/logger');
var WXPay = require('../controller/wxpay');
WXPay.mix('Util', require('../common/util'));

var wxpay = WXPay({
  appid: config.wechat.appId,
  mch_id: config.wechat.mch_id,
  partner_key: config.wechat.partner_key,
  pfx: config.wechat.pfx
});

function _throw_error(err,res){
  
  if (!err || err.code !== 0) {
    logger.error('wxpayserver',err.message);
    res.json(returnData.createError(ErrorType.wxPayError.params, err.message));
    return false;
  }

  return true;
}

/**
 * 请求生成h5唤起支付的必要参数
 * @param 
 * @param 
 */
router.post('/params', function (req, res, next) {

  var opt = req.body;
  var err = validation.validate(opt, pmodels.h5.sending);

  if(_throw_error(err,res)){
    next();
  }
}, function (req, res) {
  wxpay.getBrandWCPayRequestParams(req.body, function (err, result) {
    if (err == null) {
      res.json(returnData.createData({ payargs: result }));
    } else {
      res.json(returnData.createError(err.code, err.message));
    }
  });
});

/**
 * 统一下单接口
 * @param 
 * @param 
 */
router.post('/unified', function (req, res, next) {

  var opt = req.body;
  var err = validation.validate(opt, pmodels.unified.sending);

  if(_throw_error(err,res)){
    next();
  }
}, function (req, res) {
  wxpay.createUnifiedOrder(req.body, function (err, result) {
    if (err == null) {
      res.json(returnData.createData(result));
    } else {
      res.json(returnData.createError(err.code, err.message));
    }
  });
});


/**
 * 查询支付订单
 * @param 
 * @param 
 */
router.post('/queryOrder', function (req, res, next) {

  var opt = req.body;
  var err = validation.validate(opt, pmodels.order.query);

  if(_throw_error(err,res)){
    next();
  }
}, function (req, res) {
  wxpay.queryOrder(req.body, function (err, result) {
    if (err == null) {
      res.json(returnData.createData(result));
    } else {
      res.json(returnData.createError(err.code, err.message));
    }
  });
});


/**
 * 关闭订单
 * @param 
 * @param 
 */
router.post('/closeOrder', function (req, res, next) {

  var opt = req.body;
  var err = validation.validate(opt, pmodels.order.query);

  if(_throw_error(err,res)){
    next();
  }
}, function (req, res) {
  wxpay.closeOrder(req.body, function (err, result) {
    if (err == null) {
      res.json(returnData.createData(result));
    } else {
      res.json(returnData.createError(err.code, err.message));
    }
  });
});

/**
 * 退款
 * @param 
 * @param 
 */
router.post('/refund', function (req, res, next) {

  var opt = req.body;
  var err = validation.validate(opt, pmodels.refund.create.sending);

  if(_throw_error(err,res)){
    next();
  }
}, function (req, res) {
  wxpay.refund(req.body, function (err, result) {
    if (err == null) {
      res.json(returnData.createData(result));
    } else {
      res.json(returnData.createError(err.code, err.message));
    }
  });
});

router.post('/test', function (req, res) {
  res.json(returnData.createData({ message: 'test success!' }));
});

module.exports = router;
