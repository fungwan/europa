var express = require('express');
var router = express.Router();
var Q = require('q');
var redis = require('redis');
var logger = require('../common/logger');
var config = require('../../config');
var fs  = require('fs');

/* GET home page. */
router.all('/', function(req, res, next) {
  var key = req.body.key;
  var proID = req.body.batchid;//projectid;
  //参数验证
  if(isEmptyString(key) || isEmptyString(proID)){
    res.json({error:'参数错误'});
    return;
  }

  //读取Redis
  _checkRedis(proID).then(function(data){
        if(!data || isEmptyObj(data)){
          logger.error(config.systemUser, "参数错误");
          res.json({error:"记录未找到"});
        }
        else{
          if(key == data.key){
            res.attachment("package.zip");
            try{
              fs.createReadStream(data.url).pipe(res);
            }catch(error){
              logger.error(config.systemUser, "文件下载出错", error);
              res.json({error:"文件下载出错"});
            }
          }
          else{
            logger.error(config.systemUser, "文件下载key不匹配");
            res.json({error:"key错误"});
          }
        }
  },
  function(err){
    logger.error(config.systemUser, "Redis查询错误");
    res.json({error:err.message});
  });
});

var isEmptyObj = function(obj){
  for(var i in obj){
    return false;
  }
  return true;
}
var isEmptyString = function(str){
  var val = str? str:'';
  return val.length<=0 ? true:false;
}

var _checkRedis = function(projectid, callback){
  var deferred = Q.defer();
  try{
    var client = redis.createClient(config.redis);
    client.auth(config.redis.auth);
    //Redis错误处理
    client.on("error", function (err) {
      logger.error(config.systemUser, "Redis:错误"+JSON.stringify(err), err);
      deferred.reject(returnData.errorType.dataBaseError.unknow); //TODO:此处应该返回为Error
    });

    client.hgetall("gen"+projectid, function (err, replies) {
      logger.info(config.systemUser, "Redis:项目【"+projectid+"】查找到"+JSON.stringify(replies));
      if(replies){
        logger.info(config.systemUser, JSON.stringify(replies));
        deferred.resolve(replies);
      }
      else{
        logger.info(config.systemUser, "Redis:项目【"+projectid+"】记录未找到");
        deferred.resolve(null);
      }
      client.quit();
    });
  }catch(err){
    deferred.reject(err);
  }
  return deferred.promise;
}

module.exports = router;
