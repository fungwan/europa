'use strict';
var appApi = require('./appApi');
var webuserApi = require('./webuserApi');

var express = require('express');
var router = express.Router();



router.initAcl = function (acl) {
	router.use(function (req, res, next) {
		if (req.method == 'POST' &&  (req.path == '/login' || req.path == '/logout')) {
			next();
		} else {
			if (req.session.user) {
				next();
			} else {
				res.json({
		            result: 'failed',
		            content: 'not login'
		        });
			}
		}
	});
    appApi(router, acl);
    webuserApi(router, acl);
}


module.exports = router;