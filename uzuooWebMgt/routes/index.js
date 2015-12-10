var login = require('../models/login');
var logout = require('../models/logout');
var users = require('../models/users');
var history = require('../models/history');

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
        res.render('front_end_users',
            {
                userInfo:req.session.user
            }
        );
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