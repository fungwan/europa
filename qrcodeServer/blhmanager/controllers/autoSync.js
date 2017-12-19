/**
 * Created by tao on 2017/7/24.
 */
var schedule = require('node-schedule');
var config = require('../../config');
var sync = require('./blhSync');
var logger = require('../common/logger');


function start() {
    logger.info(config.systemUser, '开启定时更新商品服务......');
    schedule.scheduleJob(config.blh.syncTime, function () {
        logger.info(config.systemUser, '开始更新商品...');
        sync.update();
    });
}

exports.start=start;
