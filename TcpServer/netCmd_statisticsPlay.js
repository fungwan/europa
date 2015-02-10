/**
 * Created by fengyun on 2014/8/26.
 *
 * 统计播放次数和时长
 *
 */
var libHelper = require('./lib_Helper.js'),
    area_event = require('./area_event.js');

module.exports = netCmd_statisticsPlay;

function netCmd_statisticsPlay(){

}

netCmd_statisticsPlay.prototype.HandleRequest = function(videoId,playtime,dbOperate){

    dbOperate.statisticsPlay(videoId,playtime);
}