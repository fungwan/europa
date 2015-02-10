/**
 * Created by fengyun on 2014/7/18.
 */
var libHelper = require('./lib_Helper.js'),
    area_event = require('./area_event.js');

module.exports = netCmd_CancelEmbed;

function netCmd_CancelEmbed(){
    this.HandleRequest = function(socket, CmdStream) {
        var jsonObj = JSON.parse(CmdStream);
        var parametersObj = jsonObj.parameters;

        var startTime = parametersObj["start date"];
        var currTime = libHelper.getCurrentTime(1);


        if(libHelper.isFromBiggerThanTo(currTime,startTime)){
            area_event.removePushedEvent(parametersObj,true);//delete list and notice remote
        }else{
            area_event.removePushedEvent(parametersObj,false);
        }
    }
}