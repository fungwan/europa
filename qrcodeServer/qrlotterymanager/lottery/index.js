/**
 * Created by taoj on 2015/12/22.
 * 此文件包含接口：初始化数据、查询中奖数量、产生中奖结果
 */
var logger = require('../common/logger');
var config = require('../../config');
var initLottery = require('./initLottery');
var gen = require('./genLottery');
var returnData = require('../common/returnData');
var common = require('../common/common');
/**
 * 获取奖项及策略所对应的剩余个数
 */
function init() {
    global.lotterys = {};
    global.progress ={};
    logger.info(config.systemUser, "开始初始化抽奖数据......");
    function success(data) {
        logger.info(config.systemUser, "完成初始化抽奖数据......");
        //logger.info(config.systemUser,JSON.stringify(global.lotterys));
        //logger.info(config.systemUser,JSON.stringify(global.progress))
    }
    function fail(err) {
        logger.error(null, err.message, err);
        process.exit();
    }
    initLottery.getStartingProjects().then(success, fail);
}
/**
 * 获取中奖数据
 * @param projectid 营销活动id
 */
function getLotteryProgress(req, res) {
    /**
     * 根据活动id或奖项ID或策略id获取当前已中奖数量
     * 格式：{"projectid":{"lotteryid1":{num:1},"lotteryid":{num:1,ruleid:{num:1}}}}
     */
    var id = req.body.projectid;
    var project = global.progress[id];
    if (!!project) {
        res.json(returnData.createData(project));
    } else {
        res.json(returnData.createError(common.errType.noexists));
    }
}
/**
 * 产生奖项
 * @param customer 客户信息
 * @param qrcode 二维码id
 */
function generateLottery(req, res) {
    /**
     * 根据客户信息，二维码id生成奖项结果
     * 格式：custormer json对象，qrcode
     * 产生结果并输入到数据库表示完成
     */
    //res.json(global.lotterys);
    var customer = JSON.parse(req.body.customer);
    var qrcode = req.body.qrcode;
    logger.info(config.systemUser, "开始生成抽奖结果：");
    //抽奖成功
    function success(result) {
        res.json(returnData.createData(result));
    }
    //抽奖失败
    function fail(errCode) {
        res.json(returnData.createError(errCode));
    }
    gen.generateLottery(customer, qrcode).then(success, fail);
    //logger.info(config.systemUser, "生成抽奖完成！");
}
/**
 * 检查二维码
 * @param req
 * @param res
 */
function check(req, res) {
    var customer = JSON.parse(req.body.customer);
    var qrcode = req.body.qrcode;
    //check成功返回true
    function success(result) {
        res.json(returnData.createData(result));
    }
    //check失败，返回失败信息
    function fail(errCode) {
        res.json(returnData.createError(errCode));
    }
    gen.checkLottery(customer, qrcode).then(success, fail);
}
/**
 * 通过projectid手动开启一个红包活动
 * @param req
 * @param res
 */
function startProjectById(req, res) {
    var id = req.body.projectid;

    function success(data) {
        logger.info(config.systemUser,JSON.stringify(global.progress[id]));
        res.json(returnData.createData(data));
    }
    function fail(errCode) {
        res.json(returnData.createError(errCode));
    }
    initLottery.start(id).then(success).catch(fail);
}
/**
 * 手动停止一个红包活动
 * @param req
 * @param res
 */
function stopProjectById(req, res) {
    var id = req.body.projectid;

    function success(data) {
        res.json(returnData.createData(true));
    }
    function fail(errCode) {
        res.json(returnData.createError(errCode));
    }
    initLottery.stop(id).then(success).catch(fail);
}
/**
 * 重置规则，先从队列移除，然后添加
 * @param pid
 */
function updateRule(req,res){
    var id = req.body.projectid;
    //logger.info(config.systemUser,"开始更规奖池成功："+ JSON.stringify(global.lotterys[id]));
    function success(data) {
        //logger.info(config.systemUser,"更新规奖池成功："+ JSON.stringify(global.lotterys[id]));
        res.json(returnData.createData(true));
    }
    function fail(errCode) {
        res.json(returnData.createError(errCode));
    }
    initLottery.stop(id);
    initLottery.start(id).then(success).catch(fail);
}

exports.init = init;
exports.generateLottery = generateLottery;
exports.getLotteryProgress = getLotteryProgress;
exports.check = check;
exports.start = startProjectById;
exports.stop = stopProjectById;
exports.updaterule = updateRule;

