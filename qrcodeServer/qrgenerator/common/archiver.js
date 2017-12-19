/**
 * Created by ivan on 15/12/15.
 */
var archiver = require('archiver');
var fs = require('fs');
var Q = require("q");
var tool = require('./tool');
var p = require('path');

exports.archivefiles = function(fslist, dest){
    var list = [];
    var deferred = Q.defer();
    try{
        if(!!fslist && typeof fslist == "string") {
            list.push(fslist);
        }
        if(!!fslist && tool.verifier.isArray(fslist)) {
            list = fslist;
        }

        if(list.length == 0){
            deferred.reject(new Error("文件压缩入参文件名为空"));
            return deferred;
        }

        if(!dest || typeof dest != "string" || dest.length<=0) {
            deferred.reject(new Error("文件压缩地址为空"));
            return deferred;
        }

        var output = fs.createWriteStream(dest);
        var zipArchiver = archiver('zip');
        zipArchiver.pipe(output);
        for(var i=0; i < list.length; i++) {
            //将被打包文件的流添加进archiver对象中
            zipArchiver.append(fs.createReadStream(list[i]), {name: p.basename(list[i])});
        }
        //打包
        zipArchiver.finalize();
        deferred.resolve(true);
    }catch(err){
        deferred.reject(err);
    }
    return deferred.promise;
}

exports.archivedir = function(src, dest) {
    var deferred = Q.defer();
    try{
        var output = fs.createWriteStream(dest);
        var zipArchiver = archiver('zip');
        zipArchiver.pipe(output);
        zipArchiver.directory(src, src.replace(p.dirname(src),''));
        zipArchiver.finalize();
        deferred.resolve(true);
    }catch(err){
        deferred.reject(err);
    }
    return deferred.promise;
}

