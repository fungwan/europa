'use strict';
var appApi = require('./appApi');
var webuserApi = require('./webuserApi');

var express = require('express');
var router = express.Router();



router.initAcl = function (acl) {
    appApi(router, acl);
    webuserApi(router, acl);
}

module.exports = router;