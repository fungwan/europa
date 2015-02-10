/**
 * Created by fengyun on 14-6-26.
 */

module.exports = clientMac2Socket;

function clientMac2Socket(){
    var screenshotSavePath = '';
}

clientMac2Socket.clientMap =  new Array();

clientMac2Socket.getScreenshotSavePath = function(){
    return this.screenshotSavePath;
};

clientMac2Socket.setScreenshotSavePath = function(szPath){
    this.screenshotSavePath = szPath;
};

clientMac2Socket.addClient = function(macID,socket){
    var loginDate = new Date();
    var  clientMember = {
        "macID"  :  macID,
        "socket" :  socket,
        "time"   :loginDate.getTime()
    };

    clientMac2Socket.clientMap.push(clientMember);
};

clientMac2Socket.removeClient = function(macID){

    for(index in clientMac2Socket.clientMap){
        if(macID === clientMac2Socket.clientMap[index].macID){
            clientMac2Socket.clientMap.splice(index,1);
            break;
        }
    }

};

clientMac2Socket.findSocketByMacID = function(macID){
    //this.clientMap
    for(index in clientMac2Socket.clientMap){
        if(macID === clientMac2Socket.clientMap[index].macID){
            return clientMac2Socket.clientMap[index].socket;
        }
    }

    return null;
};

clientMac2Socket.setKeepAliveByMacID = function(macID,time){
    //this.clientMap
    for(index in clientMac2Socket.clientMap){
        if(macID === clientMac2Socket.clientMap[index].macID){
            clientMac2Socket.clientMap[index].time = time;
            return true;
        }
    }

    return false;
};