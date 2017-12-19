/**
 * Created by ivan on 15/11/27.
 * 用于管理数据库
 *
 *
 **/
var Sequelize = require('sequelize');
var fswalk = require('./fswalk');
var config = require('../../config');
var path = require('path');
var logger = require('./logger')

var sequelize = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password, {
    host: config.mysql.host,
    dialect: 'mysql',
    pool: config.mysql.pool,
    define: {
        freezeTableName: true,
        timestamps: true,
        classMethods:{
            pageOffset:function(pageNum, limit){
                if(isNaN(pageNum) || pageNum < 1){
                    pageNum = 1;
                }
                return (pageNum - 1) * limit;
            }
        }
    }
});

var models = {};
function init(){
    //遍历dbmodels下的所有文件，加载进sequelize
    fswalk.walk('./models/dbmodels', function(error, result){
        if(error){
            logger.error(config.systemUser, "数据库初始化失败："+error.message);
            }
        else{
            result.forEach(function(result){
                var filename = path.basename(result);
                if(path.basename(result,'.js')!='foreignkeys') {
                    if (!!filename) {
                        try {
                            logger.info(config.systemUser, "数据库初始化表结构：" + path.basename(result, '.js'));
                            models[path.basename(result, '.js')] = sequelize.import("../" + result);
                            sequelize.sync();
                        }
                        catch (e) {
                            logger.error(config.systemUser, "数据库初始化错误：" + e.message);
                        }
                    }
                    else {
                        logger.error(config.systemUser, "数据库初始化错误，空文件名：" + path);
                    }
                }
            });
            logger.info(config.systemUser, "数据库初始化结束");
        }
    });
    //sequelize.sync();  //这里调用不起作用，don't know why
}

exports.models = models;
exports.init = init;
exports.sequelize = sequelize;