/**
 * Created by fengyun on 14-6-27.
 */
var events = require('events'),
    clientMac2Socket = require('./clientMac2Socket.js'),
    libHelper = require('./lib_Helper.js');

module.exports = netCmd_logOff;
function netCmd_logOff(){

}

netCmd_logOff.prototype.HandleRequest = function(dbOperate,offlineID){
/*
    Todo 統計在線時長
 */
    var currTime = libHelper.getCurrentTime(1);

    dbOperate.logOff(offlineID,currTime);

    clientMac2Socket.removeClient(offlineID);
};