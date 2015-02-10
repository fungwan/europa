/**
 * Created by fengyun on 14-6-18.
 */
var events = require('events'),
    clientMac2Socket = require('./clientMac2Socket.js'),
    area_event = require('./area_event.js');

module.exports = netCmd_logon;
function netCmd_logon(){

    this.HandleRequest = function(socket, CmdStream,dbOperate){
        var jsonObj = JSON.parse(CmdStream);
        var parametersObj = jsonObj.parameters;

        var macAddress = parametersObj.id;

        //dbOperate.isRegistered(macAddress,emitter);
        clientMac2Socket.addClient(macAddress,socket);
        dbOperate.statisticsOnlineCounts(macAddress);
        area_event.pushEvent(socket,macAddress);

        var jsObj = {
            "type":"response",
            "cmd":"log on",
            "result":"success"
        };

        var jsonStr = JSON.stringify(jsObj);
        jsonStr += '\n';
        var jsonStrBuffer = new Buffer(jsonStr,'utf8');

        socket.write(jsonStrBuffer );
    };
}
