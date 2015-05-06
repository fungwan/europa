/**
 * Created by fengyun on 14-7-8.
 */
var events     = require('events');
var dbOperate = require('./dbOperate.js'),
global = require('../common/errorCode.js').global;

module.exports = netCmd_fetchContent;

var emitter         = new events.EventEmitter();
var _templateId     = '';
var _directoryId    = 0;
var _pageId         = 0;
var db              = new dbOperate();

function  netCmd_fetchContent(){

}

netCmd_fetchContent.prototype.HandleRequest = function(templateId,dirId,pageId,res){
    _directoryId = dirId;
    _pageId = pageId;
    _templateId = templateId;
    db.isHaveDirectoryIndex(dirId,templateId,pageId,res);

//    emitter.once('isDirExist', function (arg1){
//
//        if(arg1 == global.ERROR_CRASHMYSQL || arg1== global.ERROR_QUERYMYSQL || arg1 == global.ERROR_NODIR ){
//            res.send(arg1);
//            return;
//        }
//
//        db.getContentByParentId(dirId,templateId,pageId,emitter);
//
//        emitter.once('channelContent', function (arg1,arg2){
//
//            if( arg1 == global.ERROR_CRASHMYSQL || arg1 == global.ERROR_QUERYMYSQL) {
//                res.send(arg1);
//                return;
//            }
//
//            if(arg2 == global.ERROR_CRASHMYSQL || arg2 == global.ERROR_QUERYMYSQL){
//                res.send(arg2);
//                return;
//            }
//
//            var dir = arg1;
//            var file = arg2;
//            var content;
//            content = dir.concat(file);
//
//            content.sort(function(a,b){
//                return b.queue - a.queue;//a-b输出从小到大排序，b-a输出从大到小排序。
//            });
//
//            var jsObj = {
//                "content"   :  {
//                    "directoryid"   : _directoryId,
//                    "info"          : content
//                }
//            };
//
//            var jsonStr = JSON.stringify(jsObj);
//            jsonStr += '\n';
//
//            res.send(jsonStr );
//
//        });
//    });
};