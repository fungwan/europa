/**
 * Created by fengyun on 2014/7/16.
 */
var libHelper = require('./lib_Helper.js'),
    area_event = require('./area_event.js');

module.exports = netCmd_contentEmbed;

function netCmd_contentEmbed(){
    this.HandleRequest = function(socket, CmdStream) {

        var jsonObj = JSON.parse(CmdStream);
        var parametersObj = jsonObj.parameters;
        var startTime, endTime;
        startTime = parametersObj["start date"];
        endTime = parametersObj["end date"];
        parametersObj['isPublish'] = false;
	var resourceType = parametersObj['resource type'];
        var areaId = parametersObj['area id'];
	var currTime = libHelper.getCurrentTime(1);

        /*if(libHelper.isFromBiggerThanTo(currTime,startTime)){
            return;
        }*/

        if(libHelper.isFromBiggerThanTo(currTime,endTime)){
            return;
        }
       
	//To prevent the repeated push info about apply/stop
	
	for(var x = 0; x<area_event.eventList.length;) {
	    var jEvent = area_event.eventList[x];
	    if(resourceType === jEvent['resource type']){
		if(areaId.toString() === jEvent['area id'].toString()){
		    return;
		}
	    }
	    ++x;
	}

        area_event.eventList.push(parametersObj);

    };
}

