var login = require('../models/login');
var logout = require('../models/logout');
var users = require('../models/users');
var history = require('../models/history');
var customer = require('../models/forApp/customer');
var feedbacks = require('../models/forApp/feedbacks');

module.exports = function(app,acl) {

    app.get('/', checkLogin);
    app.get('/', function (req, res) {
        res.render('index',
            {
                userInfo:req.session.user
            });
    });

    app.get('/login', checkNotLogin);
    app.get('/login', function (req, res) {
        login.getProcess(req,res);
    });

    app.post('/login', checkNotLogin);
    app.post('/login', function (req, res) {
        login.postProcess(req,res);
    });

    //test list common element
    app.get('/test', function (req, res) {
        res.render('index_city', { title: '测试列表' });
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

    //background user
    app.get('/users', checkLogin);
    app.get('/users', function (req, res) {
        users.getProcess(req,res);
    });

    //orders
    app.get('/orders', checkLogin);
    app.get('/orders', function (req, res) {
        res.render('orders',
            {
                userInfo:req.session.user
            });
    });

    //bills
    app.get('/bills', checkLogin);
    app.get('/bills', function (req, res) {
        res.render('bills',
            {
                userInfo:req.session.user
            });
    });

    //system log
    app.get('/history', checkLogin);
    app.get('/history', function (req, res) {
        res.render('system_logs',
            {
                userInfo:req.session.user
            });
    });

    app.get('/logout', checkLogin);
    app.get('/logout', function (req, res) {
        logout.getProcess(req,res);
    });

    //action for ajax request about bg_users

    app.post('/doCreateAccount', function (req, res) {
        users.createAccount(req,res);
    });

    app.post('/doDelUsersById', function (req, res) {
        users.delUsersById(req,res);
    });

    app.post('/doUpdateUserById', function (req, res) {
        users.updateUserById(req,res);
    });

    app.post('/doUpdateUserPWById', function (req, res) {
        users.updateUserPWById(req,res);
    });

    app.get('/doFindUsersByPage', function (req, res) {
        users.findUsersByPage(req,res);
    });

    app.get('/doFindUserByName', function (req, res) {
        users.findUserByName(req,res);
    });

    app.get('/doFindLogsByPage', function (req, res) {
        history.findLogsByPage(req,res);
    });

    app.get('/doFindLogsByDate', function (req, res) {
        history.findLogsByDate(req,res);
    });

    app.post('/doDelLogsById', function (req, res) {
        history.delLogsById(req,res);
    });

    //action for ajax request about app

    app.get('/doGetRoleAndRegionsInfo', function (req, res) {
        customer.getRoleAndRegions(req,res);
    });

    app.get('/doFindWorkersByPage', function (req, res) {
        customer.findWorkersByPage(req,res);
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