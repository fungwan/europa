'use strict';
var customer = require('../models/forApp/customer');
var feedbacks = require('../models/forApp/feedbacks');
var orders = require('../models/forApp/orders');
var contracts = require('../models/forApp/contracts');
var amount = require('../models/forApp/amount');
var activities = require('../models/forApp/activities');
var bills = require('../models/forApp/bills');
var qiniuToken = require('../models/forApp/upload');
var levelRules = require('../models/forApp/levelRules');

var users = require('../models/users');
var login = require('../models/login');
var logout = require('../models/logout');
var history = require('../models/history');



module.exports = function (router, acl) {

    router.use(function sysLog(req, res, next) {

        history.addLogs(req,res,next);
    });

    router.get('/setting/levelRules', function (req, res) {
        levelRules.getLevelRules(req, res);
    });
    
    router.post('/setting/levelRules', function (req, res) {
        levelRules.updateLevelRules(req, res);
    });

    router.get('/setting/roleRules', function (req, res) {
        amount.getPointsRule(req, res);
    });

    router.post('/setting/roleRules', function (req, res) {
        amount.updatePointsRule(req, res);
    });

    router.get('/setting/craftRules', function (req, res) {
        amount.getCraftRule(req, res);
    });

    router.post('/setting/craftRules', function (req, res) {
        amount.updateCraftRule(req, res);
    });

    //action for ajax request about app

    //action for houseOwner
    router.get('/doFindHouseOwnersByPage', function (req, res) { 
        customer.findHouseOwnersByPage(req,res);
    });

    router.get('/doGetRoleAndRegionsInfo', function (req, res) {
        customer.getRoleAndRegions(req,res);
    });

    //action for workers
    router.get('/workers', acl.middleware(),function (req, res,next) {
        customer.findWorkersByFilters(req,res);
    });

    router.get('/workers/:id',/*acl.middleware(1),*/function (req, res) {    
        customer.findWorkerById(req,res);
    });

    //批量执行认证动作
    router.post('/workers/verificationStatus', function (req, res) {
        customer.verifiedById(req,res);
    });

    router.get('/workers/:id/verification_logs', function (req, res) { 
        customer.findVerifiedRecordById(req,res);
    });

    router.post('/doUpdateWorkerProfileById', function (req, res) {
        customer.updateWorkerProfileById(req,res);
    });

    //提交worker的认证信息
    /*router.post('/workers/:id/verification', function (req, res) {
        customer.updateWorkerProfileById(req,res);
    });*/

    router.post('/doChangeWorkerRole', function (req, res) {
        customer.changeWorkerRole(req,res);
    });

    router.get('/workers/:id/capitalAccount', function (req, res) {    
        customer.getCapitalAccountById(req,res);
    });

    router.get('/feedbacks', function (req, res) {
        feedbacks.getFeedbacks(req,res);
    });

    router.get('/orders', /*acl.middleware(),*/function (req, res) {
        orders.getOrders(req,res);
    });

    router.get('/orders/:id', /*acl.middleware(1),*/function (req, res) {
        orders.getOrderById(req,res);
    });

    router.get('/contracts/:id', function (req, res) {
        contracts.getContractById(req,res);
    });

    router.get('/contracts/:id/items', function (req, res) {
        contracts.getContractItem(req,res);
    });

    router.get('/bills', acl.middleware(),function (req, res,next) {
        bills.getBills(req,res);
    });

    //第一次审核，行为为post
    router.post('/bills/:id/billStatus', acl.middleware(3),function (req, res) {
        bills.pendingBillById(req,res);
    });

    //承上，进行复核，行为为put，即将该支付订单的status更新
    router.put('/bills/:id/billStatus', acl.middleware(3),function (req, res) {
        bills.reviewBillById(req,res);
    });


    router.get('/houseOwners/:id', function (req, res) {
        customer.findHouseOwnersById(req,res);
    });

    //更改价格配置，保证金上下限等
    router.post('/amount', function (req, res) {
        amount.postProcess(req,res);
    });

    //获取所有活动列表
    router.get('/activities', function (req, res) {
        activities.getActivities(req,res);
    });


    router.get('/activities/:id', function (req, res) {
        activities.getActivityById(req,res);
    });

    router.post('/activities/:id', function (req, res) {
        activities.setActivityById(req,res);
    });

    router.post('/activities/:id/status', function (req, res) {
        activities.setActivityStatus(req,res);
    });

    router.get('/qiniuToken', function (req, res) {
        qiniuToken.getUploadToken(req,res);
    });
}