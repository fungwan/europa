var express = require('express');

var nameArray = ['fengyun','liuchunping'];




// Or Using the mongodb backend


module.exports = function(app,acl) {

    app.get('/', function (req, res) {

//        if(req.session.user){
//           console.log(req.session.user['name']);
//        }else{
//            console.log('meiyou session');
//        }

        res.render('index', { title: '主页' });
    });
    app.get('/reg', function (req, res) {
        res.render('reg', { title: '注册' });
    });
    app.post('/reg', function (req, res) {
    });
    app.get('/login', function (req, res) {
        res.render('login', { title: '登录' });
    });
    app.post('/login', function (req, res) {
        //req.session.user = {'name':'fengyun'};
        res.render('login', { title: '主页' });
    });
    app.get('/post', function (req, res) {
        res.render('post', { title: '发表' });
    });
    app.post('/post', function (req, res) {
    });
    app.get('/logout', function (req, res) {
    });


    app.get('/blogs/:id', acl.middleware(1, 'joed', 'view'), function(req, res, next){

        if(res){
            console.log("User joed is allowed to view blogs");
        }else{
            console.log("User not view");
        }
        res.render('reg', { title: '允许' });
    });
};

function checkLogin(req, res, next) {
    if (req.session === undefined) {
        res.redirect('/login');
    }
    next();
}

function checkNotLogin(req, res, next) {
    if (req.session === undefined) {
        res.redirect('back');//返回之前的页面
    }
    next();
}


//module.exports = function(app) {

//    app.get('/', checkLogin);
//    app.get('/', function (req, res) {
//
//        var _user = {};
//        if(req.session !== undefined){
//            res.render('index', {
//                title: '主页',
//                user: req.session.user,
//                success: 'success'
//            });
//        }else{
//            res.render('index', {
//                title: '主页',
//                user: {},
//                success: 'success'
//            });
//        }
//
//    });
//
//    app.get('/reg', function (req, res) {
//        if(req.session !== undefined){
//            res.render('reg', {
//                title: '注册',
//                user: req.session.user,
//                success: 'success',
//                error: 'error'
//            });
//        }else{
//            res.render('index', {
//                title: '主页',
//                user: {},
//                success: 'success'
//            });
//        }
//
//    });
//
//    app.post('/reg', function (req, res) {
//        var name = req.body.name,
//            password = req.body.password,
//            password_re = req.body['password-repeat'];
//        //检验用户两次输入的密码是否一致
//        if (password_re != password) {
//            return res.redirect('/reg');//返回注册页
//        }
//        //生成密码的 md5 值
//
//        //检查用户名是否已经存在
//        var nPos = nameArray.indexOf('name');
//        if(nPos !== -1){
//            return res.redirect('/reg');//返回注册页
//        }else{
//            req.session.user = {'name':'fengyun'};//用户信息存入 session
//            return res.redirect('/');//注册成功后返回主页
//        }
//
//    });
//
//    app.get('/login', checkNotLogin);
//    app.get('/login', function (req, res) {
//
//        res.render('login', {
//            title: '登录',
//            success: 'success',
//            user: 'ds'
//        });
//    });
//    app.post('/login', checkNotLogin);
//    app.post('/login', function (req, res) {
//
//            var name = req.body.name,
//                password = req.body.password;
//
//
//            //检查用户是否存在
//            //检查用户名是否已经存在
//            var nPos = nameArray.indexOf('name');
//            if(nPos !== -1){
//                return res.redirect('/reg');//返回注册页
//            }else{
//                req.session.user = {'name':'fengyun'};//用户信息存入 session
//                res.redirect('/');//注册成功后返回主页
//            }
//
//        });
//
//    app.get('/post', function (req, res) {
//            res.render('post', { title: '发表' });
//        });
//    app.post('/post', function (req, res) {
//        });
//
//    app.get('/logout', function (req, res) {
//            req.session.user = null;
//            req.flash('success', '登出成功!');
//            res.redirect('/');//登出成功后跳转到主页
//        });


//};