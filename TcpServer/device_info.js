/**
 * Created by fengyun on 14-6-23.
 */

module.exports = deviceInfo;

function deviceInfo(){

    var macID = null;
    this.getMacID = function(){
        return macID;
    };
    this.setMacID = function(macAddress){
        macID = macAddress;
    };
};