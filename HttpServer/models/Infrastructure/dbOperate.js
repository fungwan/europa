/**
 * Created by fengyun on 14-6-18.
 */
var db = require("./dbService.js"),
    async = require('async'),
    libHelper = require('../../lib/time.js'),
    //logger = require('../../lib/log.js').logger;
    global = require('../common/errorCode.js').global;

var DEVICE_INFORMATION_TABLE = "device_information",
    EPG_AREA_MANAGE_TABLE ="epg_area_manage",
    EPG_TEMPLATE_TABLE = "epg_templet",
    VERSION_INFORMATION = "versioninfo";

var result = null;
var dbService =  db;
var templateId = '';

module.exports = dbOperate;

function dbOperate(){
}

dbOperate.prototype.isRegistered = function (macAddress,version,res){

    async.auto({

            get_data: function(callback){
                var condition = ' where mac =\'' + macAddress + '\'';
                dbService.selectValue('id',DEVICE_INFORMATION_TABLE,condition,callback);
            }

        },function(err, results) {
            var data = results.get_data;

            if (data === '' && data != global.ERROR_CRASHMYSQL && data!= global.ERROR_QUERYMYSQL && data!= undefined ){
                //如果没有找到相应设备，默认mac地址为：00-00-00-00-00-00
                data = '15'//15为默认的mac id值
                macAddress = '00-00-00-00-00-00';
            }

            var arg =  data;
            if (arg != '' && arg != global.ERROR_CRASHMYSQL && arg!= global.ERROR_QUERYMYSQL && arg!= undefined ) {

                logon(macAddress,version, res);

            } else {
                if (arg === ''){//can not find device
                    var errDevice = global.ERROR_NOREGISTER;
                    res.send(errDevice);
                }else{
                    res.send(arg);
                }
            }
            //emitter.emit('isRegistered',data);
        }
    );
};

function logon(macAddress,version,res){

    async.auto({
        /*get_areaId: function(callback){

            var condition = ' where mac =\'' + macAddress + '\'';
            dbService.selectValue('area_id',DEVICE_INFORMATION_TABLE,condition,callback);
        },

        get_deviceName: function(callback){

            var condition = ' where mac =\'' + macAddress + '\'';
            dbService.selectValue('address',DEVICE_INFORMATION_TABLE,condition,callback);
        },

        get_templateId : ['get_areaId',function(callback ,results) {
            var areaId = results.get_areaId;
            var condition = ' where area_id =\'' + areaId + '\'';
            dbService.selectValue('epg_templet_id',EPG_AREA_MANAGE_TABLE,condition,callback);
        }],

        get_uiId :['get_templateId',function(callback,results){
            templateId = results.get_templateId;
            var condition = ' where id =\'' + templateId + '\'';
            dbService.selectValue('ui_id',EPG_TEMPLATE_TABLE,condition,callback);
        }],

        get_updateStartupImage: function(callback){
            //dbService.selectValue('recent_online',DEVICE_INFORMATION_TABLE,'',callback);
            callback(null,true);
        },

        get_startupImage: ['get_updateStartupImage','get_templateId',function(callback ,results) {
            templateId = results.get_templateId;
            var isImgUpdate = results.get_updateStartupImage;

            if(!isImgUpdate){//do not update img
                callback(null, '');
            }else{
                var condition = ' where id =\'' + templateId + '\'';
                dbService.selectValue('startup_image',EPG_TEMPLATE_TABLE,condition,callback);
            }
        }],

        get_updateVersion: function(callback){
            dbService.selectValue('version',VERSION_INFORMATION,'',callback);
        },*/

        get_baseInfo: function(callback){

            /*
             SELECT epg_templet.id as epg_id,ui_id,startup_image ,address ,version,apklink
             from epg_templet,device_information ,versioninfo
             WHERE epg_templet.id =
             (SELECT epg_templet_id
             from epg_area_manage RIGHT JOIN
             (SELECT area_id from device_information WHERE mac = "00-22-F4-CE-C8-50") areaInId
             ON areaInId.area_id = epg_area_manage.area_id)
             and device_information.mac = "00-22-F4-CE-C8-50";
             */

            var sql = 'SELECT epg_templet.id as epg_id,ui_id,startup_image ,address ,version,apklink ';
            sql += 'from epg_templet,device_information ,versioninfo ';
            sql += 'WHERE epg_templet.id = ';
            sql += '(SELECT epg_templet_id ';
            sql += 'from epg_area_manage RIGHT JOIN ';
            sql += '(SELECT area_id from device_information WHERE mac = \"';
            sql += macAddress;
            sql += '\") areaInId ';
            sql += ' ON areaInId.area_id = epg_area_manage.area_id) ';
            sql += ' and device_information.mac = \"';
            sql += macAddress;
            sql += '\"';

            dbService.selectMoreValue(sql,callback);
        },
        get_apkLink: ['get_baseInfo',function(callback ,results) {

            var macArray = results["get_baseInfo"];
            if(macArray.length > 0) {
                var versionFromDB = macArray[0]['version'];
                var condition = ' where mac =\'' + macAddress + '\'';
                var updateData = 'recent_version = "' + versionFromDB + '"';

                if(versionFromDB.split('.').length == 3 && version.split('.').length == 3){
                    var firstBitFromDb = parseInt(versionFromDB.split('.')[0]);
                    var firstBitFromClient = parseInt(version.split('.')[0]);

                    if(firstBitFromClient < firstBitFromDb){
                        dbService.selectValue('apklink',VERSION_INFORMATION,'',callback);
                        dbService.updateValue(DEVICE_INFORMATION_TABLE,updateData,condition);
                    }else if(firstBitFromClient == firstBitFromDb){
                        var secBitFromDb = parseInt(versionFromDB.split('.')[1]);
                        var secBitFromClient = parseInt(version.split('.')[1]);

                        if(secBitFromClient < secBitFromDb){
                            dbService.selectValue('apklink',VERSION_INFORMATION,'',callback);
                            dbService.updateValue(DEVICE_INFORMATION_TABLE,updateData,condition);
                        }else if(secBitFromClient == secBitFromDb){
                            var thiBitFromDb = parseInt(versionFromDB.split('.')[2]);
                            var thiBitFromClient = parseInt(version.split('.')[2]);

                            if(thiBitFromClient < thiBitFromDb){
                                dbService.selectValue('apklink',VERSION_INFORMATION,'',callback);
                                dbService.updateValue(DEVICE_INFORMATION_TABLE,updateData,condition);
                            }else if(thiBitFromClient == thiBitFromDb){
                                callback(null, '');
                            }else{
                                callback(null, '');
                                console.info(versionFromDB +  ' from DB ');
                                console.info(version +  ' from Client ');
                                console.error('version error from client');
                            }
                        }else{
                            callback(null, '');
                            console.info(versionFromDB +  ' from DB ');
                            console.info(version +  ' from Client ');
                            console.error('version error from client');
                        }
                    }else{
                        callback(null, '');
                        console.info(versionFromDB +  ' from DB ');
                        console.info(version +  ' from Client ');
                        console.error('version error from client');
                    }
                }else{
                    callback(null, '');
                    console.info(versionFromDB +  ' from DB ');
                    console.info(version +  ' from Client ');
                    console.error('version format error: from db ' + versionFromDB.split('.').length + ',from client ' + version.split('.').length);
                }
            }
        }]

    },function(err, results) {

        if(err !== null){
            res.send(434);
            return;
        }

        var macArray = results["get_baseInfo"];
        var apkLink  = results['get_apkLink'];

        if(macArray.length > 0) {
            var dataObject = macArray[0];
            var epg_id              = dataObject['epg_id'];
            var ui_id               = dataObject['ui_id'];
            var startup_image       = dataObject['startup_image'];
            var address             = dataObject['address'];

            if(epg_id === ''){
                var errEpg = global.ERROR_NOEPG;
                res.send(errEpg);
            }else{
                //send success message
                var logonContent = {
                    "UI id"         :ui_id,
                    "template id"   :epg_id,
                    "startup image" :startup_image,
                    "apklink"       : apkLink,
                    "device name"   : address
                };

                var jsonStr = JSON.stringify(logonContent);
                jsonStr += '\n';

                res.send(jsonStr);
            }
        }

//        templateId      = results.get_templateId;
//        var uiId        = results.get_uiId;
//        var apkLink     = results.get_apkLink;
//        var startImg    = results.get_startupImage;
//        var address     = results.get_deviceName;
//
//        var arg1 = new Array(templateId,uiId,startImg,apkLink,address);
//
//        var epgId = '';
//        //arg1接收的是一个数组，包含4个元素，即epgid、Img、uid、apk、name
//        epgId = arg1[0];
//
//        if(epgId != '' && epgId != global.ERROR_CRASHMYSQL && epgId!= global.ERROR_QUERYMYSQL ){
//
//            var uid = '';
//            var apkLink = '';
//            var startImg = '';
//            var address = '';
//
//            //apk
//            if(arg1[3] == global.ERROR_CRASHMYSQL || arg1[3]== global.ERROR_QUERYMYSQL){
//                res.send(arg1[3]);
//                return;
//            }//arg1[3] == undefined ||
//            else{
//                if(arg1[3] == undefined)
//                    apkLink = '';
//                else
//                    apkLink = arg1[3];
//            }
//
//            //uid
//            if(arg1[1] == global.ERROR_CRASHMYSQL || arg1[1] == global.ERROR_QUERYMYSQL){
//                res.send(arg1[1]);
//                return;
//            }
//            else if(arg1[1] == undefined)
//                uid = '';
//            else
//                uid = arg1[1];
//
//            //Img
//            if(arg1[2] == global.ERROR_CRASHMYSQL || arg1[2] == global.ERROR_QUERYMYSQL){
//                res.send(arg1[2]);
//                return;
//            }
//            else if(arg1[2] == undefined)
//                startImg = '';
//            else
//                startImg = arg1[2];
//
//            //address
//            if(arg1[4] == global.ERROR_CRASHMYSQL || arg1[4] == global.ERROR_QUERYMYSQL){
//                res.send(arg1[4]);
//                return;
//            }
//            else if(arg1[4] == undefined)
//                address = '';
//            else
//                address = arg1[4];
//
//        }else{
//            if (epgId === ''){//can not find epg
//                var errEpg = global.ERROR_NOEPG;
//                res.send(errEpg);
//            }else{
//                res.send(arg);
//            }
//        }

    });
};

dbOperate.prototype.logOff = function (macAddress){

    var condition = ' where mac =\'' + macAddress + '\'';
    //Update online ,recent_online
    dbService.updateValue(DEVICE_INFORMATION_TABLE,'online = 0',condition);

    var currTime = libHelper.getCurrentTime(1);
    var updateData = 'recent_offline = \'' + currTime + '\'';
    dbService.updateValue(DEVICE_INFORMATION_TABLE,updateData,condition);
};

dbOperate.prototype.updateScreenshot = function(fileName,macId){
    var condition = ' where mac =\'' + macId + '\'';
    var updateData = 'screenshot = \'' + fileName+ '\'';
    dbService.updateValue(DEVICE_INFORMATION_TABLE,updateData,condition);
};

dbOperate.prototype.getChannelList = function(templateId,res){
    async.auto({
            get_channel: function (callback) {

                var channelTable = "epg_channel_";
                channelTable += templateId;

                var condition = '  WHERE parentID = 0 ORDER BY queue';
                dbService.selectMulitValue('id,title,queue,description,resource',channelTable,condition,callback);

            }
        },
        function(err, results) {

            if(err !== null){
                res.send(results.get_channel);
                //emitter.emit('getChannel_finished',results.get_channel);
            }else{

                var recArray = results.get_channel;
                var content = [];
                for(x in recArray) {
                    var resultSet = {};
                    resultSet = {"index":recArray[x].id,"title":recArray[x].title,"queue":recArray[x].queue,
                        "description":recArray[x].description,"resource":recArray[x].resource};
                    content.push(resultSet);
                }

                var jsObj = {
                    "content":content
                };

                var jsonStr = JSON.stringify(jsObj);
                jsonStr += '\n';

                res.send(jsonStr);
                //emitter.emit('getChannel_finished',content);
            }
        });
};

dbOperate.prototype.isHaveDirectoryIndex = function(dirId,templateId,pageId,res){
    var channelTableName;

    channelTableName = "epg_channel_";
    channelTableName += templateId;

    async.auto({

            judge_dir: function(callback){
                var condition = ' where id =\'' + dirId + '\'';
                dbService.selectValue('title',channelTableName,condition,callback);
            }

        },function(err, results) {

            var isDir = results.judge_dir;
            if(err !== null){
                res.send(isDir);
                return;
            }else{
                pageId *= 20;
                var listNumbers = '20';
                async.auto({
                    get_directory : function(callback){

                        //var condition = ' where parentID =\'' + dirID + '\'';
                        var condition = ' where parentID =\'' + dirId + '\' ORDER BY queue limit ' + pageId + ',' + listNumbers;
                        var channelTableName = 'epg_channel_' + templateId;

                        dbService.selectMulitValue('id,title,queue,description,resource',channelTableName,condition,callback);
                    },

                    get_epgContent : function(callback){

                        var channelTableName = 'epg_channelcontent_' + templateId;
                        var multiSql = 'SELECT id,title,description,resource,stream AS urls,editor,updatetime,queue,t1.source_type as type \
                from (SELECT source_id, source_type,queue from ' + channelTableName +  ' WHERE parentID = ' + dirId + '  ORDER BY queue  DESC LIMIT ' + pageId + ',' + listNumbers + ') t1\
                inner JOIN source_video  t2 on t1.source_type = "video" where t1.source_id = t2.id\
                UNION\
                SELECT id,title,description,resource,img_urls AS urls,editor,updatetime,queue,t1.source_type as type  \
                from (SELECT source_id, source_type,queue from ' + channelTableName +  ' WHERE parentID = ' + dirId + ' ORDER BY queue  DESC LIMIT ' + pageId + ',' + listNumbers + ') t1\
                inner JOIN source_img  t3 on t1.source_type = "img" where t1.source_id = t3.id\
                UNION\
                SELECT id,title,description,resource,document_urls AS urls,editor,updatetime,queue,t1.source_type as type  \
                from (SELECT source_id, source_type,queue from ' + channelTableName +  ' WHERE parentID = ' + dirId + '  ORDER BY queue DESC LIMIT ' + pageId + ',' + listNumbers + ') t1\
                inner JOIN source_document  t4 on t1.source_type = "document" where t1.source_id = t4.id\
                UNION\
                SELECT id,title,description,resource,webpage_urls AS urls,editor,updatetime,queue,t1.source_type as type  \
                from (SELECT source_id, source_type,queue from ' + channelTableName +  ' WHERE parentID = ' + dirId + '  ORDER BY queue DESC LIMIT ' + pageId + ',' + listNumbers + ') t1\
                inner JOIN source_web  t5 on t1.source_type = "web" where t1.source_id = t5.id\
                UNION\
                SELECT id,title,description,resource,stream_page AS urls,editor,updatetime,queue,t1.source_type as type  \
                from (SELECT source_id, source_type,queue from ' + channelTableName +  ' WHERE parentID = ' + dirId + '  ORDER BY queue DESC LIMIT ' + pageId + ',' + listNumbers + ') t1\
                inner JOIN carousel  t6 on t1.source_type = "carousel" where t1.source_id = t6.id \
                UNION\
                SELECT id,title,news_content AS description,news_picture AS resource,news_streamPath AS urls,editor,updatetime,queue,t1.source_type as type  \
                from (SELECT source_id, source_type,queue from ' + channelTableName +  ' WHERE parentID = ' + dirId + '  ORDER BY queue DESC LIMIT ' + pageId + ',' + listNumbers + ') t1\
                inner JOIN source_news  t7 on t1.source_type = "news_templet" where t1.source_id = t7.id ';

                        /*
                         SELECT id,title,description,resource,stream_page AS urls,editor,updatetime,queue,t1.source_type as type
                         from (SELECT source_id, source_type,queue from epg_channelcontent_7 WHERE parentID = 18  ORDER BY queue LIMIT 0,20 ) t1
                         inner JOIN source_video  t2 on t1.source_type = 'video' where t1.source_id = t2.id
                         UNION

                         SELECT id,title,description,resource,img_urls AS urls,editor,updatetime,queue,t1.source_type as type
                         from (SELECT source_id, source_type,queue from epg_channelcontent_7 WHERE parentID = 18  ORDER BY queue LIMIT 0,20 ) t1
                         inner JOIN source_img  t3 on t1.source_type = 'img' where t1.source_id = t3.id
                         UNION

                         SELECT id,title,description,resource,document_urls AS urls,editor,updatetime,queue,t1.source_type as type
                         from (SELECT source_id, source_type,queue from epg_channelcontent_7 WHERE parentID = 18  ORDER BY queue LIMIT 0,20 ) t1
                         inner JOIN source_document   t4 on t1.source_type = 'document' where t1.source_id = t4.id
                         UNION

                         SELECT id,title,description,resource,webpage_urls AS urls,editor,updatetime,queue,t1.source_type as type
                         from (SELECT source_id, source_type,queue from epg_channelcontent_7 WHERE parentID = 18  ORDER BY queue LIMIT 0,20 ) t1
                         inner JOIN source_web  t5 on t1.source_type = 'web' where t1.source_id = t5.id
                         UNION

                         SELECT id,title,description,resource,stream_page  AS urls,editor,updatetime,queue,t1.source_type as type
                         from (SELECT source_id, source_type,queue from epg_channelcontent_7 WHERE parentID = 18  ORDER BY queue LIMIT 0,20 ) t1
                         inner JOIN carousel  t6 on t1.source_type = 'carousel' where t1.source_id = t6.id
                         UNION

                         SELECT id,title,news_content AS description,news_picture AS resource,news_streamPath AS urls,editor,updatetime,queue,t1.source_type as type
                         from (SELECT source_id, source_type,queue from epg_channelcontent_7 WHERE parentID = 18  ORDER BY queue LIMIT 0,20 ) t1
                         inner JOIN source_news t7 on t1.source_type = 'news_templet' where t1.source_id = t7.id;
                         */

                        dbService.selectMoreValue(multiSql,callback);
                    }

                },function(err, results) {
                    if(err !== null){
                        res.send(global.ERROR_CRASHMYSQL);
                        //emitter.emit('channelContent',global.ERROR_CRASHMYSQL,global.ERROR_CRASHMYSQL);
                    }else{
                        var dirArray = results["get_directory"];
                        var directory = [];
                        for(x in dirArray) {
                            var resultSet = {};
                            resultSet = {"type":"dir","index":dirArray[x].id,"title":dirArray[x].title,"queue":dirArray[x].queue,
                                "description":dirArray[x].description,"resource":dirArray[x].resource,"urls":''};
                            directory.push(resultSet);
                        }

                        var fileArray = results["get_epgContent"];
                        var fileContent = [];
                        for(y in fileArray) {
                            var resultSet = {};
                            resultSet = {"type":fileArray[y].type,"index":fileArray[y].id,"title":fileArray[y].title,"queue":fileArray[y].queue,
                                "description":fileArray[y].description,"resource":fileArray[y].resource,"urls":fileArray[y].urls};
                            fileContent.push(resultSet);
                        }

                        var content;
                        content = directory.concat(fileContent);
                        content.sort(function(a,b){
                            return b.queue - a.queue;//a-b输出从小到大排序，b-a输出从大到小排序。
                        });

                        var jsObj = {
                            "content"   :  {
                                "directoryid"   : dirId,
                                "info"          : content
                            }
                        };

                        var jsonStr = JSON.stringify(jsObj);
                        jsonStr += '\n';

                        res.send(jsonStr);
                        //emitter.emit('channelContent',directory,fileContent);
                    }

                });
            }

            //emitter.emit('isDirExist', isDir);
        }
    );
};

function getContentByParentId(dirID,templateId,pageId,res){
    pageId *= 20;
    var listNumbers = '20';
    async.auto({
        get_directory : function(callback){

            //var condition = ' where parentID =\'' + dirID + '\'';
            var condition = ' where parentID =\'' + dirID + '\' ORDER BY queue limit ' + pageId + ',' + listNumbers;
            var channelTableName = 'epg_channel_' + templateId;

            dbService.selectMulitValue('id,title,queue,description,resource',channelTableName,condition,callback);
        },

        get_epgContent : function(callback){

            var channelTableName = 'epg_channelcontent_' + templateId;
            var multiSql = 'SELECT id,title,description,resource,stream AS urls,editor,updatetime,queue,t1.source_type as type \
                from (SELECT source_id, source_type,queue from ' + channelTableName +  ' WHERE parentID = ' + dirID + '  ORDER BY queue  DESC LIMIT ' + pageId + ',' + listNumbers + ') t1\
                inner JOIN source_video  t2 on t1.source_type = "video" where t1.source_id = t2.id\
                UNION\
                SELECT id,title,description,resource,img_urls AS urls,editor,updatetime,queue,t1.source_type as type  \
                from (SELECT source_id, source_type,queue from ' + channelTableName +  ' WHERE parentID = ' + dirID + ' ORDER BY queue  DESC LIMIT ' + pageId + ',' + listNumbers + ') t1\
                inner JOIN source_img  t3 on t1.source_type = "img" where t1.source_id = t3.id\
                UNION\
                SELECT id,title,description,resource,document_urls AS urls,editor,updatetime,queue,t1.source_type as type  \
                from (SELECT source_id, source_type,queue from ' + channelTableName +  ' WHERE parentID = ' + dirID + '  ORDER BY queue DESC LIMIT ' + pageId + ',' + listNumbers + ') t1\
                inner JOIN source_document  t4 on t1.source_type = "document" where t1.source_id = t4.id\
                UNION\
                SELECT id,title,description,resource,webpage_urls AS urls,editor,updatetime,queue,t1.source_type as type  \
                from (SELECT source_id, source_type,queue from ' + channelTableName +  ' WHERE parentID = ' + dirID + '  ORDER BY queue DESC LIMIT ' + pageId + ',' + listNumbers + ') t1\
                inner JOIN source_web  t5 on t1.source_type = "web" where t1.source_id = t5.id\
                UNION\
                SELECT id,title,description,resource,stream_page AS urls,editor,updatetime,queue,t1.source_type as type  \
                from (SELECT source_id, source_type,queue from ' + channelTableName +  ' WHERE parentID = ' + dirID + '  ORDER BY queue DESC LIMIT ' + pageId + ',' + listNumbers + ') t1\
                inner JOIN carousel  t6 on t1.source_type = "carousel" where t1.source_id = t6.id \
                UNION\
                SELECT id,title,news_content AS description,news_picture AS resource,news_streamPath AS urls,editor,updatetime,queue,t1.source_type as type  \
                from (SELECT source_id, source_type,queue from ' + channelTableName +  ' WHERE parentID = ' + dirID + '  ORDER BY queue DESC LIMIT ' + pageId + ',' + listNumbers + ') t1\
                inner JOIN source_news  t7 on t1.source_type = "news_templet" where t1.source_id = t7.id ';

            /*
             SELECT id,title,description,resource,stream_page AS urls,editor,updatetime,queue,t1.source_type as type
             from (SELECT source_id, source_type,queue from epg_channelcontent_7 WHERE parentID = 18  ORDER BY queue LIMIT 0,20 ) t1
             inner JOIN source_video  t2 on t1.source_type = 'video' where t1.source_id = t2.id
             UNION

             SELECT id,title,description,resource,img_urls AS urls,editor,updatetime,queue,t1.source_type as type
             from (SELECT source_id, source_type,queue from epg_channelcontent_7 WHERE parentID = 18  ORDER BY queue LIMIT 0,20 ) t1
             inner JOIN source_img  t3 on t1.source_type = 'img' where t1.source_id = t3.id
             UNION

             SELECT id,title,description,resource,document_urls AS urls,editor,updatetime,queue,t1.source_type as type
             from (SELECT source_id, source_type,queue from epg_channelcontent_7 WHERE parentID = 18  ORDER BY queue LIMIT 0,20 ) t1
             inner JOIN source_document   t4 on t1.source_type = 'document' where t1.source_id = t4.id
             UNION

             SELECT id,title,description,resource,webpage_urls AS urls,editor,updatetime,queue,t1.source_type as type
             from (SELECT source_id, source_type,queue from epg_channelcontent_7 WHERE parentID = 18  ORDER BY queue LIMIT 0,20 ) t1
             inner JOIN source_web  t5 on t1.source_type = 'web' where t1.source_id = t5.id
             UNION

             SELECT id,title,description,resource,stream_page  AS urls,editor,updatetime,queue,t1.source_type as type
             from (SELECT source_id, source_type,queue from epg_channelcontent_7 WHERE parentID = 18  ORDER BY queue LIMIT 0,20 ) t1
             inner JOIN carousel  t6 on t1.source_type = 'carousel' where t1.source_id = t6.id
             UNION

             SELECT id,title,news_content AS description,news_picture AS resource,news_streamPath AS urls,editor,updatetime,queue,t1.source_type as type
             from (SELECT source_id, source_type,queue from epg_channelcontent_7 WHERE parentID = 18  ORDER BY queue LIMIT 0,20 ) t1
             inner JOIN source_news t7 on t1.source_type = 'news_templet' where t1.source_id = t7.id;
             */

            dbService.selectMoreValue(multiSql,callback);
        }

    },function(err, results) {
        if(err !== null){
            res.send(global.ERROR_CRASHMYSQL);
            //emitter.emit('channelContent',global.ERROR_CRASHMYSQL,global.ERROR_CRASHMYSQL);
        }else{
            var dirArray = results["get_directory"];
            var directory = [];
            for(x in dirArray) {
                var resultSet = {};
                resultSet = {"type":"dir","index":dirArray[x].id,"title":dirArray[x].title,"queue":dirArray[x].queue,
                    "description":dirArray[x].description,"resource":dirArray[x].resource,"urls":''};
                directory.push(resultSet);
            }

            var fileArray = results["get_epgContent"];
            var fileContent = [];
            for(y in fileArray) {
                var resultSet = {};
                resultSet = {"type":fileArray[y].type,"index":fileArray[y].id,"title":fileArray[y].title,"queue":fileArray[y].queue,
                    "description":fileArray[y].description,"resource":fileArray[y].resource,"urls":fileArray[y].urls};
                fileContent.push(resultSet);
            }

            var content;
            content = directory.concat(fileContent);
            content.sort(function(a,b){
                return b.queue - a.queue;//a-b输出从小到大排序，b-a输出从大到小排序。
            });

            var jsObj = {
                "content"   :  {
                    "directoryid"   : dirID,
                    "info"          : content
                }
            };

            var jsonStr = JSON.stringify(jsObj);
            jsonStr += '\n';

            res.send(jsonStr );
            //emitter.emit('channelContent',directory,fileContent);
		}

    });

};