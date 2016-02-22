'use strict';


var users = require('../models/users');
var login = require('../models/login');
var logout = require('../models/logout');
var history = require('../models/history');



module.exports = function (router, acl) {

    router.post('/login', function (req, res) {
        login.postProcess(req, res);
    });

    router.post('/logout', function (req, res) {
        login.userLogout(req, res);
    });
    
    router.get('/sessions', function (req, res) {
        login.getSessions(req, res);
    });    


    router.post('/doCreateAccount', function (req, res) {
        users.createAccount(req, res, acl);
    });

    router.post('/doDelUsersById', function (req, res) {
        users.delUsersById(req, res, acl);
    });

    router.post('/doUpdateUserById', function (req, res) {
        users.updateUserById(req, res, acl);
    });

    router.post('/doUpdateUserPWById', function (req, res) {
        users.updateUserPWById(req, res);
    });

    /*router.get('/doFindUsersByPage', function (req, res) {
        users.findUsersByPage(req,res);
    });*/

    router.get('/users', function (req, res) {
        users.findUsersByPage(req, res);
    });

    router.get('/doFindUserById', function (req, res) {
        users.findUserById(req, res);
    });

    router.get('/doFindUserByName', function (req, res) {
        users.findUserByName(req, res);
    });

    /*router.get('/doFindLogsByPage', function (req, res) {
        history.findLogsByPage(req,res);
    });*/

    router.get('/logs', /*acl.middleware(),*/ function (req, res) {
        history.findLogsByPage(req, res);
    });

    router.get('/doFindLogsByDate', function (req, res) {
        history.findLogsByDate(req, res);
    });

    router.post('/doDelLogsById', function (req, res) {
        history.delLogsById(req, res);
    });    
    

}