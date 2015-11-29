var login = require('../models/login');
var logout = require('../models/logout');
var users = require('../models/users');

module.exports = function(app,acl) {

    app.get('/', checkLogin);
    app.get('/', function (req, res) {
        res.render('index',
            {
                active: 'home' ,
                tips:'内测阶段，Fung Wan 暴走写码中...'
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
    app.get('/userList', checkLogin);
    app.get('/userList', function (req, res) {
        res.render('table-action', { title: '测试列表' });
    });

    //front end user
    app.get('/customer', checkLogin);
    app.get('/customer', function (req, res) {
        res.render('front_end_users', { title: '悠住用户' });
    });

    //background user
    app.get('/users', checkLogin);
    app.get('/users', function (req, res) {
        users.getProcess(req,res);
    });

    //system log
    app.get('/orders', checkLogin);
    app.get('/orders', function (req, res) {
        res.render('orders', { title: '所有订单' });
    });

    //system log
    app.get('/history', checkLogin);
    app.get('/history', function (req, res) {
        res.render('system_logs', { title: '历史留痕' });
    });

    app.get('/logout', checkLogin);
    app.get('/logout', function (req, res) {
        logout.getProcess(req,res);
    });

//    app.get('/reg', checkNotLogin);
//    app.get('/reg', function (req, res) {
//        res.render('reg', { title: '注册' });
//    });
//    app.get('/reg', checkNotLogin);
//    app.post('/reg', function (req, res) {
//    });

    //action for ajax request
    app.get('/doFinduserByName', checkLogin);
    app.get('/doFinduserByName', function (req, res) {
        users.findUserByName(req,res);
    });

    app.post('/doCreateAccount', checkLogin);
    app.post('/doCreateAccount', function (req, res) {
        users.createAccount(req,res);
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