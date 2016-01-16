

var route_users = require('./users');
var customer = require('../models/forApp/customer');
var feedbacks = require('../models/forApp/feedbacks');
var orders = require('../models/forApp/orders');
var contracts = require('../models/forApp/contracts');
var amount = require('../models/forApp/amount');
var activities = require('../models/forApp/activities');
var bills = require('../models/forApp/bills');

module.exports = function(app,acl) {

    route_users(app,acl);

    app.get('/permissionError', function (req, res) {
        res.render('permission_error',
            {
                userInfo:req.session.user
            });
    });
    //front end user
    app.get('/customer', checkLogin);
    app.get('/customer', function (req, res) {
        customer.getProcess(req,res);
    });

    app.get('/customerFeedbacks', checkLogin);
    app.get('/customerFeedbacks', function (req, res) {
        feedbacks.getProcess(req,res);
    });

    //front end user
    app.get('/todoVerifiedCustomer', checkLogin);
    app.get('/todoVerifiedCustomer', function (req, res) {
        customer.getTodoVerifiedPageProcess(req,res);
    });

    //orders
    app.get('/showOrdersPage', checkLogin);
    app.get('/showOrdersPage', function (req, res) {
        orders.getProcess(req,res);
    });

    //bills
    app.get('/billsMgtPage', checkLogin);
    app.get('/billsMgtPage', function (req, res) {
        res.render('bills',
            {
                userInfo:req.session.user
            });
    });

    //amount
    app.get('/amountMgtPage', checkLogin);
    app.get('/amountMgtPage', function (req, res) {
        res.render('amountMgt',
            {
                userInfo:req.session.user
            });
    });

    app.get('/activityMgtPage', checkLogin);
    app.get('/activityMgtPage', function (req, res) {
        res.render('activityMgt',
            {
                userInfo:req.session.user
            });
    });

    app.get('/levelRulesMgtPage', checkLogin);
    app.get('/levelRulesMgtPage', function (req, res) {
        res.render('levelRulesMgt',
            {
                userInfo:req.session.user
            });
    });

    //action for ajax request about app

    //action for houseOwner
    app.get('/doFindHouseOwnersByPage', function (req, res) {
        customer.findHouseOwnersByPage(req,res);
    });

    app.get('/doGetRoleAndRegionsInfo', function (req, res) {
        customer.getRoleAndRegions(req,res);
    });

    //action for workers
    app.get('/workers', acl.middleware(),function (req, res,next) {
        customer.findWorkersByFilters(req,res);
    });

    app.get('/workers/:id',acl.middleware(1),function (req, res) {
        customer.findWorkerById(req,res);
    });

    //批量执行认证动作
    app.post('/workers/verificationStatus', function (req, res) {
        customer.verifiedById(req,res);
    });

    app.get('/workers/:id/verification_logs', function (req, res) {
        customer.findVerifiedRecordById(req,res);
    });

    app.post('/doUpdateWorkerProfileById', function (req, res) {
        customer.updateWorkerProfileById(req,res);
    });

    //提交worker的认证信息
    /*app.post('/workers/:id/verification', function (req, res) {
        customer.updateWorkerProfileById(req,res);
    });*/

    app.post('/doChangeWorkerRole', function (req, res) {
        customer.changeWorkerRole(req,res);
    });

    app.get('/workers/:id/capitalAccount', function (req, res) {
        customer.getCapitalAccountById(req,res);
    });

    app.get('/doGetFeedbacks', checkLogin);
    app.get('/doGetFeedbacks', function (req, res) {
        feedbacks.getFeedbacks(req,res);
    });

    app.get('/orders', checkLogin);
    app.get('/orders', acl.middleware(),function (req, res) {
        orders.getOrders(req,res);
    });

    app.get('/orders/:id', checkLogin);
    app.get('/orders/:id', acl.middleware(1),function (req, res) {
        orders.getOrderById(req,res);
    });

    app.get('/contracts/:id', checkLogin);
    app.get('/contracts/:id', function (req, res) {
        contracts.getContractById(req,res);
    });

    app.get('/contracts/:id/items', checkLogin);
    app.get('/contracts/:id/items', function (req, res) {
        contracts.getContractItem(req,res);
    });

    app.get('/bills', checkLogin);
    app.get('/bills', acl.middleware(),function (req, res,next) {
        bills.getBills(req,res);
    });

    //第一次审核，行为为post
    app.post('/bills/:id/billStatus', checkLogin);
    app.post('/bills/:id/billStatus', acl.middleware(3),function (req, res) {
        bills.pendingBillById(req,res);
    });

    //承上，进行复核，行为为put，即将该支付订单的status更新
    app.put('/bills/:id/billStatus', checkLogin);
    app.put('/bills/:id/billStatus', acl.middleware(3),function (req, res) {
        bills.reviewBillById(req,res);
    });

    app.get('/doFindHouseOwnersById', checkLogin);
    app.get('/doFindHouseOwnersById', function (req, res) {
        customer.findHouseOwnersById(req,res);
    });

    //更改价格配置，保证金上下限等
    app.post('/amount', checkLogin);
    app.post('/amount', function (req, res) {
        amount.postProcess(req,res);
    });

    //获取所有活动列表
    app.get('/activities', checkLogin);
    app.get('/activities', function (req, res) {
        activities.getActivities(req,res);
    });

    app.get('/activities/:id', checkLogin);
    app.get('/activities/:id', function (req, res) {
        activities.getActivityById(req,res);
    });
};

function checkLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session.user) {
        res.redirect('back');//已经是登陆的，返回之前的页面
    }
    next();
}