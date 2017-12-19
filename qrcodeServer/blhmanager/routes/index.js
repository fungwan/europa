var express = require('express');
var router = express.Router();
var category = require('../controllers/category');
var product = require('../controllers/product');
var order = require('../controllers/order');
var sync = require('../controllers/blhSync');

/**
 * 百礼汇-对接积分商城接口-获取百利汇商品分类
 */
router.post('/category/list', category.list);
/**
 * 百礼汇-对接积分商城接口-查询百利汇商品
 */
router.post('/product/list', product.list);

/**
 * 百礼汇-对接积分商城接口-生成订单
 */
router.post('/order/new',order.generate);

/**
 * 百礼汇-对接积分商城接口-订单快递信息
 */
router.post('/order/express',order.express);
/**
 * 请求同步百利汇所有商品
 */
router.post('/sync/product/all',sync.all);

/**
 * 请求同步百利汇更新商品
 */
router.post('/sync/product/update',sync.update);


module.exports = router;
