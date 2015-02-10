/**
 * Created by fengyun on 2014/7/14.
 */
var events      = require('events'),
    fs          = require('fs'),
    dbOperate   = require('./dbOperate.js'),
    conf        = require('../../conf'),
    async	= require('async');
    global      = require('../common/errorCode.js').global;

module.exports = captureScreenshot;
var db      = new dbOperate();
function  captureScreenshot(){

};

captureScreenshot.prototype.HandleRequest = function(req,res){
    var obj = req.files.thumbnail;
    if(obj !== undefined || obj !== null){
        //正确收到截图
        //1.读取收到的截图的默认tmp路径（后面拷贝到des路径需用到）
        var tmp_path = obj.path;
        var file_name = obj.name;
        //'/home/productions/programs/apache-tomcat-7.0.55/webapps/ROOT/resource/devices/screenshot/'
        //新路径根据实际情况修改  //"public/images/"+obj.name;
        var new_path = conf.screenshotPath +'/' + obj.name;
        //2.查找截图文件夹中相同macID的文件名
        async.auto({

            //2.1首先扫描截图文件夹，查找是否有与上传的图片的相同macId
            scanFolder: function(callback){
                var path = conf.screenshotPath;
                var macRecvShotID = file_name.substr(0,file_name.indexOf('_'));
                scanFolder(path,macRecvShotID,callback);
            },
            //2.2找到旧的截图文件删除，没有亦可新建
            processFile: ['scanFolder',function(callback ,results) {
                if(results.scanFolder){
                    var readStream = fs.createReadStream(tmp_path);
                    var writeStream = fs.createWriteStream(new_path);
                    writeStream.on('error',function(data){
                        console.error('des path :' + new_path + ' not exist! the reason that ' + data);
                        res.send(global.ERROR_FAILSCREENSHOT);
                    });
                    readStream.pipe(writeStream);
                    readStream.on('end', function() {
                        fs.unlinkSync(tmp_path);
                        var macRecvShotID = file_name.substr(0,file_name.indexOf('_'));
                        file_name = conf.nginxUrl + '/' + conf.relativePath + '/' + file_name;
                        db.updateScreenshot(file_name, macRecvShotID);
                        res.send(200);
                    });
                }
            }]
        },function(err, results) {
            if(err !== null){
                //截图失败
                res.send(global.ERROR_FAILSCREENSHOT);
                return;
            }
        });
    }else{
        console.error(new Date() + '收取截图出错');
        res.send(global.ERROR_FAILSCREENSHOT);
    }
};

function scanFolder(path,uploadMacId,callback){
    fs.readdir(path, function(err,files){
	if(err){
	    console.error(new Date() + ' 路径有错:' + path);
	    callback(err,false);
	    return;
	}else{
	    files.forEach(function(item) {  
		var tmpPath = path + '/' + item;
		fs.stat(tmpPath, function(err1, stats) {  
                    if (err1) {  
                        console.error(new Date() + 'stat error:' +  tmpPath);
			callback(err,false);
			return;
                    } else {  
                        if (stats.isDirectory()) {  //如果是目录再进行递归处理,这里不考虑递归
                            //scanFolder(tmpPath);  
                        } else {
                            //文件处理,截取mac地址，匹配是否符合进行删除  
			    var macRecvShotID = item.substr(0,item.indexOf('_'));
			    if(macRecvShotID === uploadMacId){
				//找到该设备的旧的截图文件,并删除
				fs.unlink(tmpPath,function(err){
				    if(err){
					console.error('del fault: ' + err);
					//虽然删除就图片失败，但是忽略它，不要影响新的截图显示
				    }
				    callback(null,true);
				    return;
				});
			    }
			}  
                    }  
                })  
	    })
	    callback(null,true);
	    return;
	}
    })
};
