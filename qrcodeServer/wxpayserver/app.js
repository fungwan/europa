// call the packages we need
var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var log4js = require('log4js');

//customize module
var returnData = require('./common/returnData');
var logger=require('./common/logger');
var errorDomain=require('./common/errorListener');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(log4js.connectLogger(logger.logger(), {level:log4js.levels.INFO}));


//设置异常处理
//app.use(errorDomain.onDomainError);
process.on('uncaughtException', function (err) {
    logger.error(null,'未处理异常：'+ err.message);
});

var router = express.Router();

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	//console.log('Something is happening.');
	next();
});

app.use('/v1/pay',  require('./routes/pay'));

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json(returnData.createError(err.status,err.message));
});

//app.use(errorDomain.onError);

module.exports = app;