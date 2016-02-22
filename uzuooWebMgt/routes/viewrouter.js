
var express = require('express');
var router = express.Router();

module.exports = function (app, acl) {

    //app.use(router.verify());
    
    router.get('/', function (req, res) {
        res.render('index', { title: 'MySite', env: 'env' });
    });

    //
    router.get('/:spec', function (req, res) {
        res.render('index', { title: 'MySite', env: 'env' });
    });

    //for angular partial page service
    router.get('/partial/:spec', function (req, res) {
        res.render(req.params.spec, { title: 'MySite', env: 'env' });
    });

    app.use('/', router);

};