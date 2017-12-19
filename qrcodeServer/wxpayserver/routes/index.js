var express = require('express');
var router = express.Router();
var Q = require('q');
var redis = require('redis');
var logger = require('../common/logger');
var returnData = require('../common/returnData');
var fs  = require('fs');

/* GET home page. */
router.get('/', function(req, res) {
  res.json(returnData.createData('hello wxpay...'));
});

module.exports = router;
