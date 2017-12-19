var router = require('../common/router');
var config = require('../../config');
var controllers = require('../controllers');
var pass = require('../common/authenticater');
var returnData = require('../common/returnData');
var parachecker = require('../models/prmodels');
var sms = require('../common/smsmanage');
var uploader = require('../common/uploader');
var wechat = require('../wechat');


router.setHome(config.page.home);
//用户相关接口
router.addLogin('/login');
router.addLogout('/logout');
router.add('/register', controllers.sign.register, parachecker.register, '用户注册', false);
router.add('/remail', controllers.sign.remail, null, '重发邮件确认', true);
router.add('/checklogin', controllers.sign.getuserinfo, null, '检查用户是否登录', false);
router.add('/confirm', controllers.sign.confirm, parachecker.confirm, '邮件激活确认', false);
router.add('/checkregist', controllers.sign.checkregist, parachecker.checkregist, '检查邮箱名是否被占用', false);
router.add('/updateentinfo', controllers.sign.updateentinfo, parachecker.updateentinfo, '更新用户资料信息', true);
router.add('/updatepwd', controllers.sign.updatepwd, parachecker.updatepwd, '更改密码接口', true);
router.add('/findpwd', controllers.sign.findpwd, parachecker.findpwd, '密码找回申请', false);
router.add('/findpwdconfirm', controllers.sign.findpwdconfirm, parachecker.findpwdconfirm, '密码找回后的邮件确认', false);
router.add('/updatepwdbykey', controllers.sign.updatepwdbykey, parachecker.updatepwdbykey, '根据邮件内容更新密码', false);
router.add('/getentinfo', controllers.sign.getentinfo, parachecker.getentinfo, '获取个人企业信息', true);
//用户接口
router.add('/user/info', controllers.user.info, null, '获取用户一般信息', false);
router.add('/user/list', controllers.user.list, parachecker.customer.userList, '获取用户列表', true, [true, true, false, false]);
router.add('/user/updatelocked', controllers.user.updateLocked, parachecker.customer.updateLocked, '更新账户冻结状态', true, [true, true, false, false]);
router.add('/user/setrole', controllers.user.setrole, parachecker.customer.setrole, '设置用户', true, [true, true, false, false]);
router.add('/user/roles', controllers.user.getrole, null, '获取系统定义的角色信息', true, [true, true, false, false]);
//消息接口
router.add('/message/num', controllers.message.num, null, '获取用户消息数', false);
router.add('/message/list', controllers.message.list, parachecker.message.list, '获取用户消息列表', false);
router.add('/message/get', controllers.message.get, parachecker.message.get, '获取具体消息内容', false);
router.add('/message/markread', controllers.message.markread, parachecker.message.markread, '设置为已读', false);
//客户管理接口
router.add('/customer/list', controllers.customer.list, parachecker.customer.list, '获取客户列表', true, [true, true, false, false]);
router.add('/customer/get', controllers.customer.get, parachecker.customer.get, '获取指定客户信息', true, [true, true, false, false]);
router.add('/customer/update', controllers.customer.update, parachecker.customer.update, '创建或更新客户', true, [true, true, false, false]);
router.add('/customer/group', controllers.customer.group, parachecker.customer.group, '将客户分组', true, [true, true, false, false]);
//router.add('/customer/test', controllers.customer.test, parachecker.customer.test, '测试接口', false,[true,true,false,false]);
router.add('/customer/checkpasswordstate', controllers.customer.checkpasswordstate, parachecker.customer.checkpasswordstate, '获取用户密码状态', true, [true, true, false, false]);
router.add('/customer/resetPhoneNo', controllers.customer.resetPhoneNo, parachecker.customer.resetPhoneNo, '设置用户安全手机', true, [true, true, false, false]);

//客户组别管理
router.add('/cgroup/list', controllers.cgroup.list, parachecker.cgroup.list, '获取客户组别列表', true, [true, true, false, false]);
router.add('/cgroup/query', controllers.cgroup.query, parachecker.cgroup.query, '查询分组', true, [true, true, false, false]);
router.add('/cgroup/update', controllers.cgroup.update, parachecker.cgroup.update, '创建或更新客户组别', true, [true, true, false, false]);
router.add('/cgroup/deletegr', controllers.cgroup.deletegr, parachecker.cgroup.deletegr, '删除客户组别', true, [true, true, false, false]);
/**
 * 统一活动接口
 */
router.add('/project/prolist', controllers.project.prolist, null, '获取活动列表', true, [true, true, false, false]);
router.add('/project/list', controllers.project.list, parachecker.project.list, '获取红包活动数据', true, [true, true, false, false]);
router.add('/project/get', controllers.project.get, parachecker.project.get, '获取单个红包活动数据', true, [true, true, false, false]);
router.add('/project/lottery/get', controllers.project.lotteryget, parachecker.project.lotteryget, '获取活动奖项配置数据', false, [true, true, false, false]);
router.add('/project/lottery/update', controllers.project.lotteryupdate, parachecker.project.lotteryupdate, '获取活动奖项配置数据', true, [true, true, false, false]);
router.add('/project/update', controllers.project.update, parachecker.project.update, '更新红包活动数据', true, [true, true, false, false]);
router.add('/project/delete', controllers.project.delete, parachecker.project.delete, '删除红包活动数据', true, [true, true, false, false]);
router.add('/project/start', controllers.project.start, parachecker.project.start, '启动红包活动', true, [true, true, false, false]);
router.add('/project/stop', controllers.project.stop, parachecker.project.stop, '停止红包活动', true, [true, true, false, false]);
router.add('/project/preview', controllers.project.preview, parachecker.project.preview, '二维码预览活动', false);
router.add('/project/reqcode', controllers.project.reqcode, parachecker.project.reqcode, '请求生成二维码文件', true, [true, true, false, false]);
router.add('/project/uploadimage', controllers.project.uploadbackground, null, '上传背景图', true, [true, true, false, false]);

router.add('/qrcode/generate', controllers.qrcode.generate, parachecker.qrcode.qrcode, '扫码抽奖接口', true, null);
router.add('/qrcode/send', controllers.qrcode.sendmoney, parachecker.qrcode.qrcode, '抽奖发送接口', true, null);
router.add('/qrcode/baseinfo', controllers.qrcode.baseinfo, parachecker.qrcode.qrcode, '根据二维码获取活动基本信息', false, null);
router.add('/qrcode/checkqrcode', controllers.qrcode.checkqrcode, parachecker.qrcode.qrcode, '二维码状态检查', true, null);
router.add('/qrcode/generatepoint', controllers.qrcode.generatepoint, parachecker.qrcode.qrcode, '生成积分', true, null);
router.add('/qrcode/qasave', controllers.qrcode.saveqa, parachecker.qrcode.qasave, '保存问卷', true, null);
router.add('/qrcode/onsale', controllers.qrcode.onsale, parachecker.qrcode.qrcode, '参与满减', true, null);
router.add('/qrcode/gift', controllers.qrcode.gift, parachecker.qrcode.qrcode, '扫码即送', true, null);
router.add('/qrcode/genorder', controllers.qrcode.genorder, parachecker.qrcode.genorder, '扫码生成订单（抽奖/扫码送获得实物奖品）', true, null);
router.add('/qrcode/updatephoneno', controllers.qrcode.updatephoneno, parachecker.qrcode.updatephoneno, '更新用户手机号', true, null);
router.add('/qrcode/cashcoupon', controllers.qrcode.getCashCoupon, parachecker.qrcode.getcashcoupon, '扫码获取优惠券', true, null);

//消费者分析
router.add('/custanalysis/customerarea', controllers.analyze.customerarea, parachecker.customer.customerarea, '获取消费者分布区域数据', true, [true, true, false, false]);
router.add('/custanalysis/customerdate', controllers.analyze.customerdate, parachecker.customer.customerdate, '获取消费者走势分析', true, [true, true, false, false]);
router.add('/custanalysis/customernumbers', controllers.analyze.customernumbers, parachecker.customer.customernumbers, '获取消费者人数分析', true, [true, true, false, false]);

//获取城市列表
router.add('/cities/query', controllers.cities.query, parachecker.cities.query, "查询并获取城市数据", false);
router.add('/cities/detail', controllers.cities.detail, parachecker.cities.detail, "查询并获取指定城市详细信息", false);
router.add('/cities/get', controllers.cities.get, parachecker.cities.get, "查询并获取指定城市信息", false);
router.add('/cities/getcode', controllers.cities.getCode, parachecker.cities.getCode, "查询并获取指定城市的Code", false);
//活动分析接口定义
router.add('/analyze/lotterylist', controllers.analyze.lotterylist, parachecker.analyze.lotterylist, "获取奖项信息", true, [true, true, false, false]);
router.add('/analyze/projprogress', controllers.analyze.projprogress, parachecker.analyze.projprogress, "获取活动进度分析信息", true, [true, true, false, false]);
router.add('/analyze/projeffect', controllers.analyze.projeffect, parachecker.analyze.projeffect, "获取活动效果分析信息", true, [true, true, false, false]);
router.add('/analyze/lotterydate', controllers.analyze.lotterydate, parachecker.analyze.lotterydate, "获取中奖时间分析信息", true, [true, true, false, false]);
router.add('/analyze/lotterytimes', controllers.analyze.lotterytimes, parachecker.analyze.lotterytimes, "获取中奖次数分析信息", true, [true, true, false, false]);
router.add('/analyze/lotteryarea', controllers.analyze.lotteryarea, parachecker.analyze.lotteryarea, "获取地区中奖分析信息", true, [true, true, false, false]);
router.add('/analyze/lotteryanalyinfo', controllers.analyze.lotteryanalyinfo, parachecker.analyze.lotteryprogress, "获取中奖进度分析信息", true, [true, true, false, false]);
router.add('/analyze/rqprogress', controllers.analyze.rqprogress, parachecker.analyze.rqprogress, "获取红包活动进度", true, [true, true, false, false]);
router.add('/analyze/qaprogress', controllers.analyze.qaprogress, parachecker.analyze.qaprogress, "获取问卷分析进度，以及数据信息", true, [true, true, false, false]);
router.add('/analyze/qalist', controllers.analyze.qalist, parachecker.analyze.qalist, "获取问卷问题列表", true, [true, true, false, false]);
router.add('/analyze/qaanalyze', controllers.analyze.qaanalyze, parachecker.analyze.qaanalyze, "获取区域内问卷信息", true, [true, true, false, false]);
router.add('/analyze/qaanalyzenum', controllers.analyze.qaanalyzenum, parachecker.analyze.qaanalyzenum, "获取某地问卷信息", true, [true, true, false, false]);
router.add('/analyze/answeranalyze', controllers.analyze.answeranalyze, parachecker.analyze.answeranalyze, "获取某地答题信息", true, [true, true, false, false]);
router.add('/analyze/ordersanalyze', controllers.analyze.orderanalyze, parachecker.analyze.orderanalyze, "获取订单分析信息", true, [true, true, false, false]);
router.add('/analyze/pointcomponent', controllers.analyze.pointcomponent, parachecker.analyze.pointcomponent, "获取积分分值组成信息", true, [true, true, false, false]);
router.add('/analyze/pointcomponentoverview', controllers.analyze.pointcomponentoverview, parachecker.analyze.pointcomponent, "获取积分总积分信息", true, [true, true, false, false]);
router.add('/analyze/pointgentrade', controllers.analyze.pointgentrade, parachecker.analyze.pointcomponent, "获取积分趋势信息", true, [true, true, false, false]);

router.add('/sms/send', controllers.qrcode.sendsms, parachecker.qrcode.sms, "发送短信验证码", true, null);

//微信接口，不应直接暴露，此处用于测试，记得删除
//微信验证接口
router.router.get('/weinxin',
    //controllers.weixin.onrecivemessage
    function(req, res) {
        res.send(req.query.echostr);
    }
);
router.router.post('/weinxin', controllers.weixin.onrecivemessage);
router.router.post('/wx/getmessage', controllers.weixin.sendaritcl);
router.router.post('/wx/paynotify', controllers.weixin.paynotify);//接收微信支付回调，处理支付结果
router.router.get('/uploader/getproducttoken', uploader.getproducttoken);
router.router.get('/uploader/getarticletoken', uploader.getarticletoken); //上传文章票据

router.router.get('/logs/readlogs', controllers.logsmanage.readLogs);
router.router.get('/logsmanage', controllers.logsmanage.rendHtml);

//router.add('/wechat/getwebtoken', wechatapi.usermanager.getwebtoken, parachecker.wechat.getwebtoken, "获取微信网页票据", false);
//----------------------------------------------------
//移动端接口
router.add('/mobile/login', controllers.mobile.login, parachecker.mobile.login, "移动端用户登录!", false);
router.add('/mobile/getsign', controllers.mobile.getsign, parachecker.mobile.getsign, "获取js签名!", false);
router.add('/mobile/checklogin', controllers.mobile.checklogin, parachecker.mobile.checklogin, "登录检查!", false);

//测试接口记得删除
//router.add('/mobile/sendtest', controllers.mobile.sendredpack, null, "测试发送红包!", false);
//router.router.post('/mobile/wxpaytest', controllers.mobile.mmppay);//测试公众号支付


//红包中奖明细
router.add('/rp/lotterydetails', controllers.rpproject.lotterydetails, parachecker.rpproject.lotterydetails, "查询抽奖明细记录", true, [true, true, false, false]);
//手动派发领取失败的红包
router.add('/rp/distributeprize', controllers.rpproject.distributeprize, parachecker.rpproject.distributeprize, "查询抽奖明细记录", true, [true, true, false, false]);
//积分明细
router.add('/point/pointdetails', controllers.pointproject.pointdetails, parachecker.pointproject.pointdetails, "查询积分明细记录", true, [true, true, false, false]);

//商品二维码管理
router.add('/mcdManage/getMcdList', controllers.mcdqrmanage.getMcdList, parachecker.merchandis.mcdList, "获取商家的商品列表", true, [true, true, false, false]);
router.add('/mcdManage/getMcdById', controllers.mcdqrmanage.getMcdById, parachecker.merchandis.mcdById, "查询商家的商品明细", true, [true, true, false, false]);
router.add('/mcdManage/saveOrUpdMcd', controllers.mcdqrmanage.saveOrUpdMcd, parachecker.merchandis.svOrUpd, "添加或更新商品", true, [true, true, false, false]);
router.add('/mcdManage/delMcd', controllers.mcdqrmanage.delMcd, parachecker.merchandis.delMcd, "删除商品", true, [true, true, false, false]);
router.add('/mcdManage/getMcdQRbatchList', controllers.mcdqrmanage.getMcdQRbatchList, parachecker.merchandis.qrBatchList, "获取商品二维码批次", true, [true, true, false, false]);
router.add('/mcdManage/addMcdQR', controllers.mcdqrmanage.addMcdQR, parachecker.merchandis.creatQRbatch, "给商品添加新批次的二维码", true, [true, true, false, false]);
router.add('/mcdManage/delMcdQR', controllers.mcdqrmanage.delMcdQR, null, "删除商品选中批次二维码", true, [true, true, false, false]);
router.add('/mcdManage/sendMcdQREmail', controllers.mcdqrmanage.sendMcdQREmail, parachecker.merchandis.sendMcdQREmali, "发送商品二维码附件邮件", true, [true, true, false, false]);
router.add('/mcdManage/getAddQRbatch', controllers.mcdqrmanage.getAddQRbatch, parachecker.merchandis.getAddQRbatch, "获取新的商品二维码批次号", true, [true, true, false, false]);
router.add('/mcdManage/getCategoryList', controllers.mcdqrmanage.getCategoryList, parachecker.merchandis.categotyList, "获取商家的商品类别列表", true, [true, true, false, false]);
router.add('/mcdManage/getCategoryListEx', controllers.mcdqrmanage.getCategoryListEx, parachecker.merchandis.categotyListEx, "获取商家的商品类别列表", true, [true, true, false, false]);
router.add('/mcdManage/getCtgListSelected', controllers.mcdqrmanage.getCtgListSelected, parachecker.merchandis.ctgListSelected, "获取已参与活动商品类别列表", true, [true, true, false, false]);
router.add('/mcdManage/updateCtgListSelected', controllers.mcdqrmanage.updateCtgListSelected, parachecker.merchandis.updateCtgListSelected, "更新已参与活动商品类别列表", true, [true, true, false, false]);
router.add('/mcdManage/saveOrUpdCategory', controllers.mcdqrmanage.saveOrUpdCategory, parachecker.merchandis.categotyUpdate, "新增或更新商家的商品类别列表", true, [true, true, false, false]);
router.add('/mcdManage/delCategory', controllers.mcdqrmanage.delCategory, parachecker.merchandis.categoryDelete, "删除指定的商品类别", true, [true, true, false, false]);


//商城web后台管理相关接口
router.add('/mall/pdtlist', controllers.mallmanageWeb.getMallPdtList, parachecker.mall.mallPdtList, "获取商城产品", true, [true, true, false, false]);
router.add('/mall/getProductTypeList', controllers.mallmanageWeb.getProductTypeList, parachecker.mall.getProductTypeList, "获取商城产品目录", true, [true, true, false, false]);
router.add('/mall/updateMallProduct', controllers.mallmanageWeb.updateMallProduct, parachecker.mall.productUpdate, "更新商城产品", true, [true, true, false, false]);
router.add('/mall/updateProductState', controllers.mallmanageWeb.updateProductState, parachecker.mall.updateProductState, "更新商品状态", true, [true, true, false, false]);
router.add('/mall/updateCouponProduct', controllers.mallmanageWeb.updateCouponProduct, null, "更新商城的优惠券产品", true, [true, true, false, false]);
router.add('/mall/getOrderList', controllers.mallmanageWeb.getOrderList, parachecker.mall.orderlist, "商城订单列表", true, [true, true, false, false]);
router.add('/mall/updateOrder', controllers.mallmanageWeb.updateOrder, parachecker.mall.updateorder, "更新订单", true, [true, true, false, false]);
router.router.post('/mall/downloadOrderList', controllers.mallmanageWeb.downloadOrderList);
router.add('/mall/getproductinfo', controllers.mallmanageWeb.getproductinfo, parachecker.mall.getproductinfo, "获取商品详细信息", true, [true, true, false, false]);
router.add('/mall/getBlhPdtList', controllers.mallmanageWeb.getBlhPdtList, parachecker.mall.blhList, "获取百礼汇商城产品", true, [true, true, false, false]);
router.add('/mall/importBlhPdt', controllers.mallmanageWeb.importBlhPdt, parachecker.mall.importBlhPdt, "导入百礼汇商城产品", true, [true, true, false, false]);
router.add('/mall/setDiscountProd', controllers.mallmanageWeb.setDiscountProd, parachecker.mall.setDiscountProd, "设置折扣商城产品", true, [true, true, false, false]);

//手机端商城相关接口
router.add('/mall/getshopingcart', controllers.mallmanage.getshopingcart, parachecker.mall.getshopingcart, "获取购物车信息", true, [true, true, false, false]);
router.add('/mall/addtoshopcart', controllers.mallmanage.addtoshopcart, parachecker.mall.addtoshopcart, "加入购物车", true, [true, true, false, false]);
router.add('/mall/checkout', controllers.mallmanage.checkout, parachecker.mall.checkout, "结算", true, [true, true, false, false]);
router.add('/mall/updateshopitemnumber', controllers.mallmanage.updateshopitemnumber, parachecker.mall.updateshopitemnumber, "修改购物车数量", true, [true, true, false, false]);
router.add('/mall/getproducteval', controllers.mallmanage.getproducteval, parachecker.mall.getproducteval, "获取商品评价情况摘要", true, [true, true, false, false]);
router.add('/mall/getproductevallist', controllers.mallmanage.getproductevallist, parachecker.mall.getproductevallist, "获取商品评价列表", true, [true, true, false, false]);
router.add('/mall/getproductevalbyleve', controllers.mallmanage.getproductevalbyleve, parachecker.mall.getproductevalbyleve, "获取商品评价明细", true, [true, true, false, false]);
router.add('/mall/saveproducteval', controllers.mallmanage.saveproducteval, parachecker.mall.saveproducteval, "保存商品评价", true, [true, true, false, false]);
router.add('/mall/createsendredpackorder', controllers.mallmanage.createsendredpackorder, parachecker.mall.createsendredpackorder, "创建红包订单", true, [true, true, false, false]);
router.add('/mall/resendredpackorder', controllers.mallmanage.resendredpackorder, parachecker.mall.resendredpackorder, "重发红包订单", true, [true, true, false, false]);
router.add('/mall/pointlottery', controllers.mallmanage.pointlottery, parachecker.mall.pointlottery, "积分抽奖", true, [true, true, false, false]);
router.add('/mall/deleteshopcart', controllers.mallmanage.deleteshopcart, parachecker.mall.deleteshopcart, "删除购物车商品", true, [true, true, false, false]);
router.add('/mall/queryPayOrder', controllers.mallmanage.queryPayOrder, parachecker.mall.queryPayOrder, "查询支付订单状态", true);
router.add('/mall/colsePayOrder', controllers.mallmanage.closePayOrder, parachecker.mall.queryPayOrder, "关闭指定支付订单", true);
router.add('/mall/createOrder', controllers.mallmanage.createOrder, parachecker.mall.createOrder, "创建(下)实体商品订单", true);
router.add('/mall/createQouponOrder', controllers.mallmanage.createQouponOrder, parachecker.mall.createQouponOrder, "创建(下)礼券订单", true,[true, true, false, false]);
router.add('/mall/createBlhOrder', controllers.mallmanage.createBlhOrder, parachecker.mall.createBlhOrder, "创建百礼汇订单", true,[true, true, false, false]);
router.add('/mall/getqouponContent', controllers.mallmanage.getqouponContent, parachecker.mall.getqouponContent, "获取优惠券内容", true, [true, true, false, false]);
router.add('/mall/getqouponrecord', controllers.mallmanage.getqouponrecord, parachecker.mall.getqouponrecord, "获取优惠券使用记录", true, [true, true, false, false]);
router.add('/mall/sendqoupon', controllers.mallmanage.sendqoupon, parachecker.mall.sendqoupon, "按订单发放优惠券", true, [true, true, false, false]);
router.add('/mall/getgiveqoupon', controllers.mallmanage.getgiveqoupon, parachecker.mall.getgiveqoupon, "生成优惠券转让二维码", true, [true, true, false, false]);
router.add('/mall/recivegiveqoupon', controllers.mallmanage.recivegiveqoupon, parachecker.mall.recivegiveqoupon, "接收转赠优惠券", true, [true, true, false, false]);
router.add('/mall/createOrderByQoupon', controllers.mallmanage.createOrderByQoupon, parachecker.mall.createOrderByQoupon, "通过礼券创建订单", true, [true, true, false, false]);
router.add('/mall/getPostageByAddId', controllers.mallmanageBase.getPostageByAddId, parachecker.mall.getPostageByAddId, "通过地址id和购买数量获取对应邮费信息", true, [true, true, false, false]);
router.add('/mall/addFavoritesById', controllers.mallmanage.addFavoritesById, parachecker.mall.addFavoritesById, "预定功能（添加至收藏夹）", true, [true, true, false, false]);
router.add('/mall/delFavoritesById', controllers.mallmanage.delFavoritesById, parachecker.mall.delFavoritesById, "从收藏夹中移除", true, [true, true, false, false]);
router.add('/mall/getSelfFavorites', controllers.mallmanage.getSelfFavorites, null, "获取个人收藏夹信息", true, [true, true, false, false]);
router.add('/mall/getBlhExpress', controllers.mallmanageBase.getBlhExpress, parachecker.mall.orderdetail, "获取百礼汇订单的快递信息", true, [true, true, false, false]);
router.add('/mall/getDiscountCoupon', controllers.mallmanage.getDiscountCoupon, parachecker.mall.getDiscountCoupon, "获取个人的折扣券列表", true, [true, true, false, false]);

//----------------微商城接口--------------------------------------------------
router.add('/shop/getCustSummary', controllers.customer.getSummary, parachecker.customer.getSummary, "获取个人信息摘要", true, [true, true, false, false]);
router.add('/shop/getCustInfo', controllers.customer.getCustInfo, parachecker.customer.getCustInfo, "获取个人信息详情", true, [true, true, false, false]);
router.add('/shop/updateBaseInfo', controllers.customer.updateBaseInfo, parachecker.customer.updateBaseInfo, "更新个人基本信息", true, [true, true, false, false]);
router.add('/shop/resetPayPassword', controllers.customer.resetPayPassword, parachecker.customer.resetPayPassword, "更新个人支付密码", true, [true, true, false, false]);
router.add('/shop/getAddressList', controllers.customer.getAddressList, parachecker.customer.getAddressList, "获取常用地址列表", true, [true, true, false, false]);
router.add('/shop/readMessage', controllers.customer.readMessage, parachecker.customer.readMessage, "清除未读消息", true, [true, true, false, false]);
router.add('/shop/resetSaftInfo', controllers.customer.resetSaftInfo, parachecker.customer.resetSaftInfo, "设置安全邮箱与手机", true, [true, true, false, false]);
router.add('/shop/updateAddress', controllers.customer.updateAddress, parachecker.customer.updateAddress, "添加或修改常用地址", true, [true, true, false, false]);
router.add('/shop/setDefaultAddress', controllers.customer.setDefaultAddress, parachecker.customer.setDefaultAddress, "设置默认送货地址", true, [true, true, false, false]);
router.add('/shop/delAddress', controllers.customer.delAddress, parachecker.customer.delAddress, "删除认送货地址", true, [true, true, false, false]);
router.add("/shop/resetPassword", controllers.customer.resetPassword, null, "重置支付密码", true, [true, true, false, false]);


router.add('/club/getPointRecord', controllers.clubmanager.getPointRecord, parachecker.clubmanager.getPointRecord, "获取个人积分记录", true, [true, true, false, false]);
router.add('/club/getPointRanking', controllers.clubmanager.getPointRanking, parachecker.clubmanager.getPointRanking, "获取用户积分排名记录", true, [true, true, false, false]);
router.add('/club/getCustInfo', controllers.clubmanager.getCustInfo, parachecker.clubmanager.getCustInfo, "获取个人关键信息", true, [true, true, false, false]);
router.add('/club/getOrderList', controllers.clubmanager.getOrderList, parachecker.clubmanager.getOrderList, "获取个人订单信息", true, [true, true, false, false]);
router.add('/club/getPrizeRecord', controllers.clubmanager.getPrizeRecord, parachecker.clubmanager.getPrizeRecord, "获取个人中奖记录信息", true, [true, true, false, false]);
router.add('/club/getOrderByid', controllers.clubmanager.getOrderByid, parachecker.clubmanager.getOrderByid, "获取指定订单信息", true, [true, true, false, false]);
router.add('/club/getFocusList', controllers.clubmanager.getFocusList, parachecker.clubmanager.getFocusList, "获取用户关注列表信息", true, [true, true, false, false]);
router.add('/club/beginExchangePoint', controllers.clubmanager.beginExchangePoint, parachecker.clubmanager.beginExchangePoint, "开始积分赠送", true, [true, true, false, false]);
router.add('/club/finishPointExchange', controllers.clubmanager.finishPointExchange, parachecker.clubmanager.finishPointExchange, "接收积分赠送", true, [true, true, false, false]);
router.add('/club/getWaitEval', controllers.clubmanager.getWaitEval, parachecker.clubmanager.getWaitEval, "获取待评价订单", true, [true, true, false, false]);
router.add('/club/getarticle', controllers.clubmanager.getarticle, parachecker.clubmanager.getarticle, "获取用户关注的文章", true, [true, true, false, false]);
router.add('/club/createAritle', controllers.clubmanager.createAritle, parachecker.clubmanager.createAritle, "创建文章", true, [true, true, false, false]);
router.add('/club/gettoparticle', controllers.clubmanager.gettoparticle, parachecker.clubmanager.gettoparticle, "获取top文章", true, [true, true, false, false]);
router.add('/club/getarticlebyentid', controllers.clubmanager.getarticlebyentid, parachecker.clubmanager.getarticlebyentid, "获取企业发布的文章", true, [true, true, false, false]);
router.add('/club/delarticle', controllers.clubmanager.delarticle, parachecker.clubmanager.delarticle, "删除企业发布的文章", true, [true, true, false, false]);
router.add('/club/getarticlebyid', controllers.clubmanager.getarticlebyid, parachecker.clubmanager.getarticlebyid, "的文章", true);
router.add('/club/changefocusstate', controllers.clubmanager.changefocusstate, parachecker.clubmanager.changefocusstate, "修改关注的状态", true);
router.add('/club/getlotteryrecord', controllers.clubmanager.getlotteryrecord, parachecker.clubmanager.getlotteryrecord, "获取扫码记录", true);
router.add('/club/sendsms', controllers.clubmanager.sendsms, parachecker.clubmanager.sendsms, "发送验证码", true);
router.add('/club/getAdList', controllers.clubmanager.getAdList, parachecker.clubmanager.getAdList, "获取广告列表", true);
router.add('/club/addAdItem', controllers.clubmanager.addAdItem, parachecker.clubmanager.addAdItem, "新增广告", true);
router.add('/club/delAdItem', controllers.clubmanager.delAdItem, parachecker.clubmanager.delAdItem, "删除广告", true);
router.add('/club/publishAritle', controllers.clubmanager.publishAritle, parachecker.clubmanager.publishAritle, "发布文章广告", true);
router.add('/club/sendSetPhoneSms', controllers.clubmanager.sendSetPhoneSms, parachecker.clubmanager.sendSetPhoneSms, "发送设置安全手机验证码true", true);
router.add('/club/getselfqoupon', controllers.clubmanager.getselfqoupon, parachecker.clubmanager.getselfqoupon, "获取本人礼券列表", true);
router.add('/club/getselfqouponrecord', controllers.clubmanager.getselfqouponrecord, parachecker.clubmanager.getselfqouponrecord, "获取本人礼券使用记录列表", true);
router.add('/club/getselfcashcoupon', controllers.clubmanager.getselfcashcoupon, parachecker.clubmanager.getselfcashcoupon, "获取本人优惠券列表", true);
router.add('/club/deletecashcoupon', controllers.clubmanager.deletecashcoupon, parachecker.clubmanager.deletecashcoupon, "删除优惠券", true);
router.add('/club/custsign', controllers.clubmanager.custsign, parachecker.clubmanager.custsign, "每日签到", false);
router.add('/club/updateFavoritesNotify', controllers.clubmanager.updateFavoritesNotify, parachecker.clubmanager.updateFavoritesNotify, "更新收藏通知属性", true);
router.add('/club/applyJoin', controllers.clubmanager.applyJoin, parachecker.clubmanager.applyJoin, "申请加盟", true);

router.add("/finance/income/list", controllers.finance.incomeList, parachecker.finance.incomeList, "财务收入记录(订单记录)", true);
router.add("/finance/redpacket/list", controllers.finance.redpacketList, parachecker.finance.redpacketList, "红包记录", true);
router.add("/finance/redpacket/info", controllers.finance.redpacketInfo, parachecker.finance.redpacketInfo, "红包详情", true);

router.router.post('/finance/income/download', controllers.finance.downLoadIncomeList);
router.router.post('/finance/redpacket/download', controllers.finance.downloadRedpacketList);

router.add('/wx/getmenulist', wechat.menumanager.getMenuList, null, "获取公众号菜单", false);
router.add('/wx/updatemenulist', wechat.menumanager.updateMenuList, parachecker.menumanager.updateMenuList, '创建（更新）公众号菜单', false);

router.add('/lotto/savelotto', controllers.lottomanager.savelotto, parachecker.lottomanager.savelotto, "保存抽奖活动设置", true, [true, true, false, false]);
router.add('/lotto/enablelotto', controllers.lottomanager.enablelotto, parachecker.lottomanager.enablelotto, "启用抽奖活动", true, [true, true, false, false]);
router.add('/lotto/getlottolist', controllers.lottomanager.getlottolist, parachecker.lottomanager.getlottolist, "获取抽奖活动列表", true, [true, true, false, false]);
router.add('/lotto/getcurrentlotto', controllers.lottomanager.getcurrentlotto, parachecker.lottomanager.getcurrentlotto, "获取当前抽奖活动列表", true, [true, true, false, false]);
router.add('/lotto/getlottobyid', controllers.lottomanager.getlottobyid, parachecker.lottomanager.getlottobyid, "获取当前抽奖活动列表", true, [true, true, false, false]);
router.add('/lotto/playlotto', controllers.lottomanager.playlotto, parachecker.lottomanager.playlotto, "抽奖", true, [true, true, false, false]);
router.add('/lotto/getlottorecord', controllers.lottomanager.getlottorecord, parachecker.lottomanager.getlottorecord, "获取抽奖记录", true, [true, true, false, false]);
router.add('/lotto/editorderadd', controllers.lottomanager.editorderadd, parachecker.lottomanager.editorderadd, "修改订单地址", true, [true, true, false, false]);


router.add("/share/config", controllers.share.getConfig, parachecker.share.getConfig, "获取分享配置", true);
router.add("/share/config/update", controllers.share.updateConfig, parachecker.share.updateConfig, "更新分享配置", true);
router.add("/share/help", controllers.share.help, parachecker.share.help, "助力操作", true);

module.exports = router.router;