/**
 * Created by fengyun on 14-6-26.
 */
var events      = require('events'),
    Util        = require('util'),
    clientMac2Socket = require('./clientMac2Socket.js');

module.exports = netCmd_CaptureScreenshot;

function netCmd_CaptureScreenshot(){



}

netCmd_CaptureScreenshot.prototype.HandleRequest = function(CmdStream) {

    var jsObj = {
        'type'  : "request",
        "cmd"   : "capture screenshot",
        "parameters": null
    };

    var jsonStr = JSON.stringify(jsObj);
    jsonStr += '\n';
    var jsonStrBuffer = new Buffer(jsonStr,'utf8');

    var jsonObj = JSON.parse(CmdStream);
    var parametersObj = jsonObj.parameters;
    var idArray = parametersObj["idArray"];//Array for macId
    for(index in idArray){
        var macID = idArray[index];
        var socket = clientMac2Socket.findSocketByMacID(macID);
        if(socket === null){
        }else{
            socket.write(jsonStrBuffer);
        }
    }
};