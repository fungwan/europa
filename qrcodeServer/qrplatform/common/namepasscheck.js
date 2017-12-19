/**
 * Created by ivan on 15/12/2.
 */
var logger = require('./logger');
var returnData = require('./returnData');
var config = require('../../config');

exports = module.exports = function(req, res, next){
    if(!!req.body.username && !!req.body.password){
        next();
    }
    else {
        res.json(returnData.createError(returnData.errorType.refuse, "参数错误"));
        res.end();
    }
}