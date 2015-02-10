/**
 * Created by fengyun on 14-6-18.
 */
var dbService = require("./dbService.js"),
    async = require('async'),
    libHelper = require('./lib_Helper.js');

var DEVICE_INFORMATION_TABLE = "device_information",
    EPG_AREA_MANAGE_TABLE ="epg_area_manage",
    EPG_TEMPLATE_TABLE = "epg_templet",
    CONTENT_SOURCE_TABLE = "channelcontent_source",
    ONLINE_STATISTICS_TABLE = "online_statistics",
    VERSION_INFORMATION = "versioninfo",
    EVERYDAY_PLAY_RANKING = 'everyday_play_ranking',
    EVERYMONTH_PLAY_RANKING = 'everymonth_play_ranking',
    PLAY_STATISTICS = 'play_statistics';

var result = null;

module.exports = dbOperate;

function dbOperate(){

    this.logon = function(macAddress){

        var condition = ' where mac =\'' + macAddress + '\'';
        //Update online ,recent_online
        dbService.updateValue(DEVICE_INFORMATION_TABLE,' online = 1',condition);

        var currentDate = libHelper.getCurrentTime(1);
        var updateData = 'recent_online = ' + currentDate;
        dbService.updateValue(DEVICE_INFORMATION_TABLE,updateData,condition);

    };

    this.logOff = function(macAddress,currTime){

        //var currTime = libHelper.getCurrentTime(1);
        var condition = ' where mac =\'' + macAddress + '\'';
        //看离线时间是否是今天，不是的话直接减0点，是的话，当前时间减最近在线时间

        async.auto({

            get_relTime: function (callback) {
                dbService.selectValueEx('recent_online,recent_offline,online_time', DEVICE_INFORMATION_TABLE, condition, callback);
            },
            set_onlineTime: ['get_relTime', function(callback, results){
                var recArray = results.get_relTime;
                if(recArray === '' || recArray === undefined){
                    return;
                }
                var recent_online = recArray['recent_online'];
                var recent_offline = recArray['recent_offline'];
                var online_time = recArray['online_time'];

                var tmp_Online;
                if(recent_offline === null || recent_offline === '' || recent_offline === undefined){
                    var myDate = new Date();

                    var hour = myDate.getHours();
                    tmp_Online = hour ;//hour

                }else{

                    var pos = recent_offline.indexOf(' ');
                    var tmp_offline = recent_offline.substr(0,pos);

                    var today = currTime;
                    var pos = today.indexOf(' ');
                    today = today.substring(0,pos);

                    if(tmp_offline === today ){
                        var from = new Date(currTime).getTime();
                        var to = new Date(recent_online).getTime();
                        tmp_Online = (from - to)/60000;//min

                    }else{
                        var myDate = new Date();
                        var hour = myDate.getHours();

                        tmp_Online = hour ;//hour
                    }
                }

                if(online_time === null || recent_offline === '' || recent_offline === undefined){
                    online_time = 0;
                }

                online_time += tmp_Online;

                //var updateData = 'online_time = '+ online_time;
                //dbService.updateValue(DEVICE_INFORMATION_TABLE,updateData,condition);

                var updateData = 'recent_offline = \'' + currTime + '\'' + ' ,online = 0, ' + 'online_time = '+ online_time;
                dbService.updateValue(DEVICE_INFORMATION_TABLE,updateData,condition);

            }]
        },function(err) {
            if(err !== null){
                return;
            }
        });

        //Update online ,recent_online
        //dbService.updateValue(DEVICE_INFORMATION_TABLE,'online = 0',condition);
    };

    //==================================================================
    //函数名：  statisticsOnlineCounts
    //作者：    andy.feng
    //日期：    2014-08-25
    //功能：    当一台终端登陆,统计最大在线个数,如果大于online_statistics表中的字段（max_onlineCounts）,则更新
    //输入参数： macAddress  终端的mac地址
    //返回值：  无
    //修改记录：
    //==================================================================

    this.statisticsOnlineCounts = function(macAddress){

        var condition = ' where mac =\'' + macAddress + '\'';
		dbService.updateValue(DEVICE_INFORMATION_TABLE,'online = 1',condition);
        var currentDate = libHelper.getCurrentTime(1);
        var updateData = ' recent_online = \'' + currentDate + '\',online = 1';
        dbService.updateValue(DEVICE_INFORMATION_TABLE,updateData,condition);

        var currDate = libHelper.getCurrentTime(2);
        async.auto({

                get_currOnlineCounts: function(callback){
                    var condition = ' where online = 1';
                    dbService.selectValue('COUNT(*)',DEVICE_INFORMATION_TABLE,condition,callback);//as currOnlineCounts
                },
                judge_currRecordExist: function(callback){//判断当前记录是否存在
                    var condition = ' where date = \'' + currDate + '\'';
                    dbService.selectValue('1',ONLINE_STATISTICS_TABLE,condition,callback);
                },
                set_online: ['get_currOnlineCounts','judge_currRecordExist', function(callback, results){

                    var onlineCounts = results.get_currOnlineCounts;
                    var isExitRow = results.judge_currRecordExist;
                    if(isExitRow === ''){
                        var column = 'date,avgOnlineTime,maxOnlineCounts';
                        var insertValues = '\'' + currDate + '\',0,' +onlineCounts + '';
                        dbService.insertValue(ONLINE_STATISTICS_TABLE,column,insertValues);
                    }else{
                        var condition1 = ' where date =\'' + currDate + '\'';

                        async.auto({
                            get_currMaxOnlineCounts: function(callback){
                                dbService.selectValue('maxOnlineCounts',ONLINE_STATISTICS_TABLE,condition1,callback);
                            },
                            judge_currOrMax: ['get_currMaxOnlineCounts',function(callback, results){
                                var maxOnline = results.get_currMaxOnlineCounts;
                                if(onlineCounts > maxOnline){
                                  var updateData =  'maxOnlineCounts = ' + onlineCounts;
                                  dbService.updateValue(ONLINE_STATISTICS_TABLE,updateData,condition1);
                                }
                            }]

                        },function(err1){
                            if(err1 !== null){
                                return;
                            }
                        });
                    }
                }]

            },function(err) {
                if(err !== null){
                    return;
                }
            }
        );
    };

    //==================================================================
    //函数名：  statisticsOnlineTime
    //作者：    andy.feng
    //日期：    2014-08-25
    //功能：    统计凌晨过后昨天所有设备的平均在线时长，然后插入/更新到记录每天在线平均时长的online_statistics表中
    //输入参数：
    //返回值：  无
    //修改记录：
    //==================================================================

    this.statisticsOnlineTime = function() {
        //dbService.setSessionPool(sessionPool);
        async.auto({

            get_currOnlineTime: function (callback) {
                var condition = ' where online = 1';
                dbService.selectMulitValue('mac,recent_online,online_time', DEVICE_INFORMATION_TABLE, condition, callback);
            },

            set_onlineTime: ['get_currOnlineTime', function (callback, results) {
                var recArray = results.get_currOnlineTime;
                for(x in recArray){
                    var tmp = recArray[x];
                    var recent_online = tmp['recent_online'];
                    var macAddress = tmp['mac'];
                    var condition = ' where mac =\'' + macAddress + '\'';
                    var from = new Date(libHelper.getCurrentTime(1)).getTime();
                    var to = new Date(recent_online).getTime();
                    var diffValue = from - to;
                    var initValue = 24 *60*60*1000;
                    if(diffValue >= initValue){//在线1天
                        dbService.updateValue(DEVICE_INFORMATION_TABLE,'online_time = 1440 ',condition);
                    }else{
                        diffValue = diffValue / 60000 //min
                        var onlineValue = tmp['online_time'];
                        if(onlineValue === '' || onlineValue === null || onlineValue === undefined){
                            onlineValue = 0;
                        }
                        diffValue += onlineValue;
                        var updateData = 'online_time = ' + diffValue;
                        dbService.updateValue(DEVICE_INFORMATION_TABLE,updateData,condition);
                    }
                }

                dbService.selectValueEx('COUNT(*),SUM(online_time)', DEVICE_INFORMATION_TABLE, '', callback);//as device_counts,SUM(online_time) as sum_onlineTime
            }],
            judge_currRecordExist: function(callback){//判断当前记录是否存在
                    var yesterdayDate = libHelper.GetDateStr(-1);
                    var condition = ' where date = \'' + yesterdayDate + '\' ';
                    dbService.selectValue('1',ONLINE_STATISTICS_TABLE,condition,callback);
            },
            sum_avgOnlineTime: ['set_onlineTime', 'judge_currRecordExist',function (callback,results) {
                var sum = results.set_onlineTime;
                if(sum === '' || sum === undefined){
                    return;
                }
                var devicesCounts = sum['COUNT(*)'];
                var sum_onlineTime = sum['SUM(online_time)'];
                var avg_onlineTime = sum_onlineTime / devicesCounts ;
                var isExitRow = results.judge_currRecordExist;
                var yesterdayDate = libHelper.GetDateStr(-1);
                var condition1 = ' where date =\'' + yesterdayDate + '\'';
                if(isExitRow === ''){
                    var column = 'date,avgOnlineTime,maxOnlineCounts';
                    var insertValues = '\'' + yesterdayDate + '\',' + avg_onlineTime+ ',0';
                    dbService.insertValue(ONLINE_STATISTICS_TABLE,column,insertValues);
                }else{
                    var updateData = 'avgOnlineTime = ' + avg_onlineTime;
                    dbService.updateValue(ONLINE_STATISTICS_TABLE,updateData,condition1);
                }

                dbService.updateValue(DEVICE_INFORMATION_TABLE,'online_time = 0','');
            }]

        },function(err) {
            if(err !== null){
                return;
            }
        });
    };

    //==================================================================
    //函数名：  statisticsPlay
    //作者：    andy.feng
    //日期：    2014-08-25
    //功能：    记录某节目的播放时长和次数，该信息由终端完整播放完一次节目后传回
    //输入参数： videoId   所播放节目的资源id
    //          playtime  该节目所播放时长
    //返回值：  无
    //修改记录：
    //==================================================================

    this.statisticsPlay = function(videoId,playtime){

        async.auto({
            judge_currVideoExist: function(callback){//判断当前视频是否有过播放
                var condition = ' where source_id = ' + videoId + ' ';
                dbService.selectValueEx('play_times,play_hours',PLAY_STATISTICS,condition,callback);//一条记录多个列
            },
            set_online: ['judge_currVideoExist', function(callback, results){
                var isExitRow = results.judge_currVideoExist;
                if(isExitRow === '' || isExitRow === undefined){
                    var column = 'source_id,play_times,play_hours';
                    var insertValues = videoId + ',1,' +playtime ;
                    dbService.insertValue(PLAY_STATISTICS,column,insertValues);
                }else{
                    var recent_online = isExitRow['play_times'];
                    var recent_offline = isExitRow['play_hours'];

                    //参数playtime是客户端传来的播放时长，注意区分time和times
                    var playTimes = parseInt(isExitRow['play_times']) + 1;
                    var playHours = parseFloat(isExitRow['play_hours']) + playtime;

                    var updateData =  'play_times = ' + playTimes + ',play_hours = ' + Math.floor(playHours);
                    var condition1 = ' where source_id = ' + videoId + ' ';
                    dbService.updateValue(PLAY_STATISTICS,updateData,condition1);
                }
            }]
        },function(err) {
            if(err !== null){
                return;
            }
        });
    };

    //==================================================================
    //函数名：  statisticsCurrRanking
    //作者：    andy.feng
    //日期：    2014-08-26
    //功能：    统计凌晨过后昨天所播放节目的时长和次数排名，并插入/更新到每天的播放台账表（everyday_play_statistics）中
    //输入参数：无
    //返回值：  无
    //修改记录：
    //         1.修改字段格式，去掉末尾的逗号 modify by andy.feng on 2014.09.04
    //==================================================================

    this.statisticsCurrRanking = function(){

        async.auto({

            get_currPlayTimesRanking: function (callback) {
                var condition = ' ORDER BY play_times DESC';
                dbService.selectMulitValue('source_id,play_times', PLAY_STATISTICS, condition, callback);
            },
            get_currPlayHoursRanking: function (callback) {
                var condition1 = ' ORDER BY play_hours DESC';
                dbService.selectMulitValue('source_id,play_hours', PLAY_STATISTICS, condition1, callback);
            },
            statistics_play: ['get_currPlayTimesRanking', 'get_currPlayHoursRanking',function (callback,results) {
                var playTimes = '';
                var rs1 = results.get_currPlayTimesRanking;

                if(rs1 != ''){
                    for(x in rs1){
                       var tempResult = rs1[x];
                        playTimes  += tempResult['source_id'] + ':' + tempResult['play_times'] + ',';//eg:3:456
                   }

                    playTimes = playTimes.substr(0,(playTimes.length - 1));
                    //console.log(playTimes);
                }

                var playHours = '';
                var rs2 = results.get_currPlayHoursRanking;

                if(rs2 != ''){
                    for(x in rs2){
                        var temp2Result = rs2[x];
                        playHours  += temp2Result['source_id'] + ':' + temp2Result['play_hours'] + ',';//eg:3:456
                    }

                    playHours = playHours.substr(0,(playHours.length - 1));
                    //console.log(playHours);
                }

                var yesterdayDate = libHelper.GetDateStr(-1);
                var column = 'date,ranking_playtimes,ranking_playhours';
                var insertValues = '"' + yesterdayDate + '";"' + playTimes+ '";"' + playHours + '"';
                dbService.replaceValue(EVERYDAY_PLAY_RANKING,column,insertValues,'date',0);
		
		//清空当天节目的播放记录（次数和时长）
		dbService.clearTable(PLAY_STATISTICS);
            }]
        },function(err) {
            if(err !== null){
                return;
            }
        });
    };

    //==================================================================
    //函数名：  clearPlayStatistics
    //作者：    andy.feng
    //日期：    2014-08-26
    //功能：    清空当天节目的播放记录（次数和时长）
    //输入参数：无
    //返回值：  无
    //修改记录：
    //==================================================================

    this.clearPlayStatistics = function(){
        dbService.clearTable(PLAY_STATISTICS);
    };

    //==================================================================
    //函数名：  statisticsMonthRanking
    //作者：    andy.feng
    //日期：    2014-08-26
    //功能：    凌晨过后如跨月，则统计上个月所播放节目的时长和次数排名，并插入/更新到每月的播放台账表（everyday_month_statistics）中
    //输入参数：lastMonth 上个月的月份 如，2014/08
    //返回值：  无
    //修改记录：
    //         1.考虑某一天记录为空的判断 modify by andy.feng on 2014.09.04
    //==================================================================

    this.statisticsMonthRanking = function(lastMonth){
        var condition = ' where date like \''+ lastMonth + '%\'';
        async.auto({

            get_monthPlayTimesRanking: function (callback) {

                dbService.selectMulitValue('ranking_playtimes', EVERYDAY_PLAY_RANKING, condition, callback);
            },
            get_monthPlayHoursRanking: function (callback) {

                dbService.selectMulitValue('ranking_playhours', EVERYDAY_PLAY_RANKING, condition, callback);
            },
            statistics_play: ['get_monthPlayTimesRanking', 'get_monthPlayHoursRanking',function (callback,results) {

                //解析過程：
                //一、12:34,76:30,2：17
                //二、split,過後，12:34
                //三、用一個新的數組存
                //四、每次疊加對應值

                var rs1 = results.get_monthPlayTimesRanking;
                var ranking_playTimes = '';

                if(rs1 != ''){
                    var arrOld = [];
                    for(x in rs1){
                        if(rs1[x]['ranking_playtimes'] === ''){
                            continue;
                        }else{
                            var tempResult = rs1[x]['ranking_playtimes'].split(',');//為第一步
                            for(y in tempResult){
                                var timesPos = tempResult[y].indexOf(':');
                                var idValue =tempResult[y].substr(0,timesPos);
                                if(arrOld[idValue] === undefined){//要考虑数组初始化时是undefined
                                    arrOld[idValue] = parseInt(tempResult[y].substr(timesPos + 1));
                                }else{
                                    arrOld[idValue] += parseInt(tempResult[y].substr(timesPos + 1));
                                }
                            }
                        }
                    }

                    var arrNew = [];
                    for(z in arrOld){
                        var elements = {"source_id"  : parseInt(z) ,"play_statistics" : arrOld[z] };
                        arrNew.push(elements);
                    }
                    arrNew.sort(function(a,b){
                        return b.play_statistics - a.play_statistics;
                    });

                    for(m in arrNew){
                        ranking_playTimes += arrNew[m]['source_id'].toString() + ':' +  arrNew[m]['play_statistics'].toString() + ',';
                    }
                    ranking_playTimes = ranking_playTimes.substr(0,ranking_playTimes.length-1);
                }

                var rs2 = results.get_monthPlayHoursRanking;

                var ranking_playHours = '';

                if(rs2 != ''){
                    var arrOld = [];
                    for(x in rs2){
                        if(rs2[x]['ranking_playhours'] === ''){
                            continue;
                        }else{
                            var tempResult = rs2[x]['ranking_playhours'].split(',');

                            for(y in tempResult){
                                var timesPos = tempResult[y].indexOf(':');
                                var idValue =tempResult[y].substr(0,timesPos);
                                if(arrOld[idValue] === undefined){//要考虑数组初始化时是undefined
                                    arrOld[idValue] = parseFloat(tempResult[y].substr(timesPos + 1));
                                }else{
									var sum = arrOld[idValue] + parseFloat(tempResult[y].substr(timesPos + 1));
                                    arrOld[idValue] = Math.floor(sum);//Math.floor是将小数点后面的数字全部忽略，这里忽略秒数合理
									//Math.round(sum* 100)/100为精确到两位
                                }
                            }
                        }
                    }

                    var arrNew = [];
                    for(z in arrOld){
                        var elements = {"source_id"  : parseInt(z) ,"play_statistics" : arrOld[z] };
                        arrNew.push(elements);
                    }
                    arrNew.sort(function(a,b){
                        return b.play_statistics - a.play_statistics;
                    });

                    for(m in arrNew){
                        ranking_playHours += arrNew[m]['source_id'].toString() + ':' +  arrNew[m]['play_statistics'].toString() + ',';
                    }
                    ranking_playHours = ranking_playHours.substr(0,ranking_playHours.length-1);
                }

                var column = 'date,ranking_playTimes,ranking_playHours';
                var insertValues = '"' + lastMonth + '";"' + ranking_playTimes+ '";"' + ranking_playHours +'"';
                dbService.replaceValue(EVERYMONTH_PLAY_RANKING,column,insertValues,'date',0);
            }]
        },function(err) {
            if(err !== null){
                return;
            }
        });
    };

    //==================================================================
    //函数名：  updateCurrMaxOnline
    //作者：    andy.feng
    //日期：    2014-08-26
    //功能：    凌晨过后，将今天的设备在线个数更新在最大在线个数中
    //输入参数：无
    //返回值：  无
    //修改记录：
    //==================================================================

    this.updateCurrMaxOnline = function(){
        var yesterdayDate = libHelper.GetDateStr(-1);

        async.auto({
            get_yesterdayMaxOnline: function (callback) {
                var condition = ' where online = 1';
                dbService.selectValue('COUNT(*)',DEVICE_INFORMATION_TABLE,condition,callback);//as currOnlineCounts
            }
        },function(err,results){

            if(err !== null){
                return;
            }
            var maxOnlineCounts = results.get_yesterdayMaxOnline;
            if(maxOnlineCounts == undefined || maxOnlineCounts === ''){
                maxOnlineCounts = '0';
            }

//            var condition = ' where date =\'' + yesterdayDate + '\'';
//            var updateData = 'maxOnlineCounts = ' + maxOnlineCounts;
//            dbService.updateValue(ONLINE_STATISTICS_TABLE,updateData,condition);

            var currDate = libHelper.getCurrentTime(2);

            var column = 'date,avgOnlineTime,maxOnlineCounts';
            var insertValues = '"' + currDate + '";0;' +maxOnlineCounts + '';
            dbService.replaceValue(ONLINE_STATISTICS_TABLE,column,insertValues,'date',0);
        })
    }
}

