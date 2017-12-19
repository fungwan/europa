/**
 * Created by ivan on 15/12/21.
 */
var config = require('../../config');
var logger=require('./logger');
var redis = require('redis');
var client = redis.createClient(config.redis.port,config.redis.host);
client.auth(config.redis.auth);
var init = function(){
    client.on("error", function (err) {
        logger.error("Redis状态检查失败： " + err);
        process.exit();
    });
    client.set("redischeck", "redischeck", function(error, reply){
        if(error){
            logger.error(config.systemUser, "Redis状态检查失败，正在退出",error);
            process.exit();
        }
    });
    client.get('redischeck',function(error, reply) {
        if(reply == 'redischeck'){
            logger.info(config.systemUser, "Redis状态检查成功")
        }
        else{
            logger.error(config.systemUser, "Redis状态检查失败，正在退出");
            process.exit();
        }
    });
}
exports = module.exports = client;
module.exports.init=init;