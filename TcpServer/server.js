/**
 * Created by fengyun on 14-6-17.
 */
var net                 = require('net'),
    poolCluster         = require('./mySQLPool.js'),
    dbService           = require("./dbService.js"),
    C_logOn             = require("./netCmd_logon.js"),
    C_logOff            = require("./netCmd_logoff.js"),
    C_dbOperate         = require("./dbOperate.js"),
    C_deviceInfo        = require("./device_info.js"),
    area_event          = require('./area_event.js'),
    C_contentEmbed      = require('./netCmd_contentEmbed.js'),
    C_cancelEmbed       = require('./netCmd_cancelEmbed.js');
    C_captureScreenshot = require('./netCmd_captureScreenshot.js'),
    clientMac2Socket    = require('./clientMac2Socket.js'),
    C_statisticsPlay    = require('./netCmd_statisticsPlay');

var PORT = 6868;

//mysql pool
dbService.setSessionPool(poolCluster);

//init session pool
var dbOperate = new C_dbOperate();

//init operator class
var logOn             = new C_logOn();
var logOff            = new C_logOff();
var contentEmbed      = new C_contentEmbed();
var captureScreenshot = new C_captureScreenshot();
var statisticsPlay    = new C_statisticsPlay();
var cancelEmbed       = new C_cancelEmbed();

//start event listener
area_event.openTimer();

var server = net.createServer(function(sock) {

    console.log('CONNECTED: ' +
        sock.remoteAddress + ':' + sock.remotePort);

    var device_info  = new C_deviceInfo();

    sock.on('data', function(data) {

        //这里忽略了收包不完整的情况，因暂时未找到end的响应
        //正确做法每次触发data后，用数组存放，待收取完整触发end后，再进行处理 TODO
        //由于此处每次包量较小，所以假定每次的data触发都是完整的JSON格式
        //另外有可能出现收取多个完整JSON格式组合的数据包

        var recv = data.toString();
        var pos = 0;
        while((pos = recv.lastIndexOf('JSON')) !== -1)
        {
            var jsonStr = recv.substr(pos);

            //process data filed
            var length = jsonStr.length - 12;
            var jsonStr = jsonStr.substr(12,length);
            var jsonObj = null;

            try{
                jsonObj = JSON.parse(jsonStr);
            }catch (err){
                console.error('json format error! ' + jsonStr);
                return;
            }
            var szCmdName = jsonObj.cmd;
            if(szCmdName === "log on" ){
                //record macID
                var jsonParObj = jsonObj.parameters;
                var macID = jsonParObj.id;
                device_info.setMacID(macID);
                console.log(new Date() + 'recv logon request by socket from '+ macID);
                logOn.HandleRequest(sock,jsonStr,dbOperate);
            }else if(szCmdName === "log off"){
                var offlineID =  device_info.getMacID();
                logOff.HandleRequest(sock,jsonStr,dbOperate,offlineID);
            }else if(szCmdName === "content embed"){
                contentEmbed.HandleRequest(sock,jsonStr);
            }else if(szCmdName === "capture screenshot"){
                console.log('recv screenshot request from web');
                captureScreenshot.HandleRequest(jsonStr);
            }else if(szCmdName === "statistics play"){
                var jsonParObj = jsonObj.parameters;
                var videoID = jsonParObj.id;
                var playtime = jsonParObj.playtime;
                statisticsPlay.HandleRequest(videoID,playtime,dbOperate);
            }else if(szCmdName === "cancel embed"){
                cancelEmbed.HandleRequest(sock,jsonStr);
            }else if(szCmdName === "keep alive"){

                //心跳包
                var jsObj = {
                    'type' : "response",
                    "cmd": "keep alive",
                    "parameters": ''
                };

                var jsonStr = JSON.stringify(jsObj);
                jsonStr += '\n';
                var jsonStrBuffer = new Buffer(jsonStr,'utf8');

                sock.write(jsonStrBuffer );

                //write keep alive time
                var curTime = new Date().getTime();
                var macID =  device_info.getMacID();
                clientMac2Socket.setKeepAliveByMacID(macID,curTime);
            }

            //important step, involved dead loop！！！
            recv = recv.substr(0,pos);
        }
    });

    /*sock.on('end',function(){
     console.log('FIN emmit end event!');
     });*/

    sock.on('close', function() {
        var offlineID =  device_info.getMacID();
        if(offlineID === null){
            //说明是web终端关闭的socket
            console.log('rec from web quit !');
        }else{
            console.log(offlineID + ' Normal CLOSED');
            logOff.HandleRequest(dbOperate,offlineID);
        }
    });

    sock.on('error',function(data){
        console.error("Socket error: " + data);
    });

}).listen(PORT);

//服务器监听事件
server.on('listening',function(){
    console.log('                        ');
    console.log('                                  _oo0oo_');
    console.log('                                 088888880');
    console.log('                                 88" . "88');
    console.log('                                 (| -_- |)');
    console.log('                                  0\\ = /0');
    console.log('                                  0\\ = /0');
    console.log('                             .\' \\\\|     |// \'.');
    console.log('                            / \\\\|||  :  |||// \\');
    console.log('                           /_ ||||| -:- |||||- \\');
    console.log('                          |   | \\\\\\  -  /// |   |');
    console.log('                          | \_|  \'\'\---/\'\'  |_/ |');
    console.log('                          \  .-\__  \'-\'  __/-.  /');
    console.log('                        ___\'. .\'  /--.--\  \'. .\'___');
    console.log('                     ."" \'<  \'.___\_<|>_/___.\' >\'  "".');
    console.log('                    | | : \'-  \'.;\'\ _ /\';.\'/ - \' : | |');
    console.log('                    \  \ \'_.   \_ __\ /__ _/   .-\' /  /');
    console.log('                =====\'-.____\'.___ \_____/___.-\'____.-\'=====');
    console.log('                                  \'=---=\'');
    console.log('                                           ');
    console.log('              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    console.log('                        佛祖保佑    TcpServer    永不死机');
    console.log('                        心外无法    fungwan      法外无心');
    console.log('                        ');
    console.info("                        Tcp server listening:" + server.address().port);
});

//服务器错误事件
server.on("error",function(exception){
    console.error("server error:" + exception);
});

