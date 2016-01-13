

var route_users = require('./users');
var customer = require('../models/forApp/customer');
var feedbacks = require('../models/forApp/feedbacks');
var orders = require('../models/forApp/orders');
var amount = require('../models/forApp/amount');

module.exports = function(app,acl) {

    route_users(app,acl);

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

    app.get('/doGetRoleAndRegionsInfo', function (req, res) {
        customer.getRoleAndRegions(req,res);
    });

    app.post('/doUpdateWorkerProfileById', function (req, res) {
        customer.updateWorkerProfileById(req,res);
    });

    app.get('/doFindHouseOwnersByPage', function (req, res) {
        customer.findHouseOwnersByPage(req,res);
    });

    app.post('/doVerifiedById', function (req, res) {
        customer.verifiedById(req,res);
    });

    app.get('/doGetVerifiedRecordById', function (req, res) {
        customer.findVerifiedRecordById(req,res);
    });

    app.get('/doFindWorkerById', function (req, res) {
        customer.findWorkerById(req,res);
    });

    app.get('/doFindWorkersByFilters', function (req, res) {
        customer.findWorkersByFilters(req,res);
    });

    app.post('/doChangeWorkerRole', function (req, res) {
        customer.changeWorkerRole(req,res);
    });

    app.get('/doGetCapitalAccountById', function (req, res) {
        customer.getCapitalAccountById(req,res);
    });

    app.get('/doGetFeedbacks', checkLogin);
    app.get('/doGetFeedbacks', function (req, res) {
        feedbacks.getFeedbacks(req,res);
    });

    app.get('/orders', checkLogin);
    app.get('/orders', function (req, res) {
        orders.getOrders(req,res);
    });

    app.get('/orders/:id', checkLogin);
    app.get('/orders/:id', function (req, res) {
        orders.getOrderById(req,res);
    });

    app.get('/doFindHouseOwnersById', checkLogin);
    app.get('/doFindHouseOwnersById', function (req, res) {
        customer.findHouseOwnersById(req,res);
    });
    //findHouseOwnersById

    app.post('/amount', checkLogin);
    app.post('/amount', function (req, res) {
        amount.postProcess(req,res);
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