/**
 * Created by fengyun on 14-7-8.
 */
var events = require('events'),
    dbOperate = require('./dbOperate.js');

module.exports = netCmd_logOff;
var db   = new dbOperate();
function netCmd_logOff(){
}

netCmd_logOff.prototype.HandleRequest = function(offlineID){
    db.logOff(offlineID);
};