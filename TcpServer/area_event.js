/**
 * Created by fengyun on 2014/7/16.
 */
var libHelper           = require('./lib_Helper.js'),
    clientMac2Socket    = require('./clientMac2Socket.js'),
    async       = require('async'),
    dbService   = require("./dbService.js"),
    C_dbOperate = require("./dbOperate.js");

module.exports = area_event;

function area_event(){

    /*if( area_event.unique !== undefined ){
        return area_event.unique;
    }

    area_event.unique = this;*/
}

area_event.yesterday = 0;
area_event.lastMonth = 0;

area_event.eventList = [];

area_event.sessionPool = null;
area_event.openTimer = function(){

   //area_event.sessionPool = pool;

   //var sessionPool =  pool;

   setInterval(function(){

       //循环检查各个设备的心跳时间
       var dbOperate = new C_dbOperate();
       var aliveTime = 90 * 1000;//90s
       for(var index = 0; index < clientMac2Socket.clientMap.length;){
           var currentDate = new Date();
           var time =currentDate.getTime();
           var device = clientMac2Socket.clientMap[index];
           if(device === undefined){
               ++index;
               continue;
           }

           var difference = time - device.time;
           if(difference > aliveTime){//user should quit?!
               //clientMac2Socket.clientMap[index].socket.end();
               clientMac2Socket.clientMap[index].socket.destroy();
               clientMac2Socket.clientMap.splice(index,1);
               var currTime = libHelper.getCurrentTime(1);
               dbOperate.logOff(device.macID,currTime);
               continue;
           }
           ++index;
       }

       //控制管理（文字、视频插播），于事件队列中根据开时间时间检查是否有可触发事件
       for(var x = 0; x<area_event.eventList.length;) {
           var jEvent = area_event.eventList[x];
           if(jEvent === undefined || jEvent === null){
		++x;
		continue;
	   }
	   var resourceType, content, startTime, endTime;
           resourceType = jEvent["resource type"];
           content = jEvent["content"];
           startTime = jEvent["start date"];
           endTime = jEvent["end date"];

           var currentTime = libHelper.getCurrentTime(1);
           if (libHelper.isFromBiggerThanTo(currentTime, startTime) && (!jEvent["isPublish"])) {

               var from = new Date(startTime).getTime();
               var to = new Date(endTime).getTime();

               var playTime = to - from;
               var strPlayTime;
               if (playTime < 0) {
                   strPlayTime = '';
               }else{
                   strPlayTime = playTime.toString();
               }

               var videoId = parseInt(jEvent["id"]);
               var jsObj = {
                   'type': "request",
                   "cmd": "content embed",
                   "parameters": {
                       "resource type": resourceType,
                       "id"        :videoId,
                       "content": content,
                       "playtime": strPlayTime / 1000 //秒数
                   }
               };

               var jsonStr = JSON.stringify(jsObj);
               jsonStr += '\n';
               //
               var areaIdArr = jEvent["area id"];

               for (j in areaIdArr) {
                   var areaId = areaIdArr[j];
                   var condition = ' where area_id = ' + areaId + ' and online = 1';
                   var channelTableName = 'device_information';
                   async.auto({
                           get_macArray: function(callback){
                               dbService.selectMulitValue('mac', channelTableName, condition, callback);
                           }
                       },function(err, results) {
                           var rs1 = results.get_macArray;
                           if(rs1 != ''){
                               var macId;
                               for(x in rs1){
                                   var tempResult = rs1[x];
                                   macId = tempResult['mac'];
                                   var socket = clientMac2Socket.findSocketByMacID(macId);
                                   if(socket != null) {
                                       var jsonStrBuffer = new Buffer(jsonStr, 'utf8');
                                       socket.write(jsonStrBuffer);
                                       for (k in area_event.eventList) {
                                           if (area_event.eventList[k]['area id'] === areaIdArr) {
                                               area_event.eventList[k]['isPublish'] = true;
                                               break;
                                           }
                                       }
                                   }
                               }
                           }
                       });
               }

           }else if(libHelper.isFromBiggerThanTo(currentTime, endTime)){
               area_event.eventList.splice(x,1);
               var areaIdArr = jEvent["area id"];
               var strAreaId = areaIdArr.join(",");
               var condition = ' where areaid =\'' + strAreaId + '\'';
               if(resourceType === 'video'){
                    dbService.updateValue('spot_management','is_spot = "spot"',condition);
               }else if(resourceType === 'text'){
                   dbService.updateValue('textpush_management','status = 0 ',condition);
               }
               continue;
           }
           ++x;
       }

       //每日统计任务
       var today = libHelper.getCurrentTime(2);
       var from = new Date(today).getTime();
       if(from > area_event.yesterday){//跨天
           //统计昨天在线时间
           dbOperate.statisticsOnlineTime();

           //将昨天的最大在线个数赋值给今天
           dbOperate.updateCurrMaxOnline();

           //统计昨天播放时长和次数排名
           dbOperate.statisticsCurrRanking();

           //清空当天的播放统计表play_statistics
           //dbOperate.clearPlayStatistics();

           area_event.yesterday = from;
       }

       //每月统计任务
       var currMonth = new Date(libHelper.getCurrentTime(3)).getTime();
       if(currMonth > area_event.lastMonth ) {//跨月
           //area_event.lastMonth = 8;

           var myDate = new Date();
           var year = myDate.getFullYear();
           var month = parseInt(myDate.getMonth().toString()); //month是从0开始计数的，因此要 + 1,这里为了计算上个月，故没有加1
	   //如果month=0,说明现在是1月，所以要计算去年的12月
	   
	   if(month === 0){
		year -= 1;
		month = 12;
	   }else if (month < 10) {
               month = "0" + month.toString();
           }
           var lastMonth =  year.toString() + "/" + month.toString() ;

           dbOperate.statisticsMonthRanking(lastMonth);

           area_event.lastMonth = currMonth;
       }

    },10000);//10s
};

area_event.pushEvent = function(socket,macId){//logon and push event
    for(var x = 0;x<area_event.eventList.length;) {
        var jEvent = area_event.eventList[x];
        if(jEvent === undefined || jEvent === null){
            ++x;
            continue;
        }
        var endTime = jEvent["end date"];
        var startTime = jEvent["start date"];

        var currentTime = libHelper.getCurrentTime(1);
        if(libHelper.isFromBiggerThanTo(currentTime, startTime)){//ignore currentTime > endTime, for loop event process.
	    
	    //if haven't send push info, give to loop event process.
	    if(!jEvent['isPublish']){
		++x;
		continue;
	    }
            var areaIdArr = jEvent["area id"];
            var resourceType = jEvent["resource type"];
            var content = jEvent["content"];
			
            var from = new Date(currentTime).getTime();
            var to = new Date(endTime).getTime();

            var playTime = to - from;
            var strPlayTime;
            if (playTime < 0) {
                strPlayTime = '';
            }
            strPlayTime = playTime.toString();

            var videoId = parseInt(jEvent["id"]);
            var jsObj = {
                'type': "request",
                "cmd": "content embed",
                "parameters": {
                    "resource type": resourceType,
                    "id"        :videoId,
                    "content": content,
                    "playtime": strPlayTime / 1000 //秒数
                }
            };

            var jsonStr = JSON.stringify(jsObj);
            jsonStr += '\n';

            var condition = ' where mac = \'' + macId + '\'';
            var channelTableName = 'device_information';

            async.auto({
                    get_areaId: function(callback){
                        dbService.selectValue('area_id',channelTableName,condition,callback);
                    }
                },function(err, results) {
                    var areaId = results.get_areaId;
                    if(areaId != ''){
                        var strAreaId = areaIdArr.join("");
                        if(strAreaId.indexOf(areaId)>=0){
                            var jsonStrBuffer = new Buffer(jsonStr,'utf8');
                            socket.write(jsonStrBuffer );
                        }
                    }
            });
         }
         ++x;
    }
};

area_event.removePushedEvent = function(embedJObject,bIsPushed){

    var parametersObj = embedJObject;
    var type = parametersObj["resource type"];
    var idArr = parametersObj["area id"];

    for(var i = 0;i<area_event.eventList.length;) {
        var jEvent = area_event.eventList[i];
        if(jEvent === undefined || jEvent === null){
            ++i;
            continue;
        }
        var areaIdArr = jEvent["area id"];
        var resourceType = jEvent["resource type"];
        if((areaIdArr.toString() === idArr.toString()) && resourceType === type){
            area_event.eventList.splice(i,1);
            break;
        }else{
            ++i;
        }
    }

    if(bIsPushed){

        var jsObj = {
            'type': "request",
            "cmd": "cancel embed",
            "parameters": {
                "resource type": type
            }

        };

        var jsonStr = JSON.stringify(jsObj);
        jsonStr += '\n';

        for (j in idArr) {
            var areaId = idArr[j];
            var condition = ' where area_id = ' + areaId + '';
            var channelTableName = 'device_information';
            async.auto({
                    get_macArray: function(callback){
                        dbService.selectMulitValue('mac', channelTableName, condition, callback);
                    }
                },function(err, results) {
                    var rs1 = results.get_macArray;
                    if(rs1 != ''){
                        var macId;
                        for(x in rs1){
                            var tempResult = rs1[x];
                            macId = tempResult['mac'];
                            var socket = clientMac2Socket.findSocketByMacID(macId);
                            if(socket != null) {
                                var jsonStrBuffer = new Buffer(jsonStr, 'utf8');
                                socket.write(jsonStrBuffer);
                            }
                        }
                    }
                }
            );
        }
    }
};
