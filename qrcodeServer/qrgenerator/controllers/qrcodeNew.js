/**
 * Created by Erathink on 2016/12/21.
 */
/**
 * Created by ivan on 15/12/9.
 */
//第三方依赖
var qrcode = require('qrcode');
var fs = require('fs');
var eventproxy = require('eventproxy');
var uuid = require('node-uuid');
var redis = require('redis');
var Q = require("q");
var moment = require('moment');
var rmdir = require('rmdir');
//工具库依赖
var returnData = require('../common/returnData');
var logger = require('../common/logger');
var config = require('../../config');
var tool = require('../common/tool');
var archiver = require('../common/archiver');
var db = require('../common/db');
var vo = require('../models/vomodels');

var batchmap = {};

/**
 * Redis检查函数，返回Redis中查询结果，结果为null或记录结果
 * @param arg
 * @param callback
 * @returns {*|promise}
 * @private
 */
var _checkRedis = function (arg, callback) {
    var deferred = Q.defer();
    try {
        var batchid = arg.batchid;
        var client = redis.createClient(config.redis);
        client.auth(config.redis.auth);

        //Redis错误处理
        client.on("error", function (err) {
            logger.error(config.systemUser, "Redis:错误" + JSON.stringify(err), err);
            deferred.reject(returnData.errorType.dataBaseError.unknow);
        });

        client.hgetall("gen" + batchid, function (err, replies) {
            logger.info(config.systemUser, "Redis:新批次二维码【" + arg.batchid + "】查找到" + JSON.stringify(replies));
            if (replies) {
                logger.info(config.systemUser, JSON.stringify(replies));
                deferred.resolve(replies);
            }
            else {
                logger.info(config.systemUser, "Redis:新批次二维码【" + arg.batchid + "】记录未找到");
                deferred.resolve(null);
            }
            client.quit();
        });
    } catch (err) {
        deferred.reject(err);
    }
    return deferred.promise;
}

/**
 * 写入Redis
 * @param arg
 * @returns {*|promise}
 * @private
 */
var _writeRedis = function (arg) {
    var deferred = Q.defer();
    try {
        var batchid = arg.batchid;
        var client = redis.createClient(config.redis);
        client.auth(config.redis.auth);
        //Redis错误处理
        client.on("error", function (err) {
            logger.error(config.systemUser, "Redis:错误" + JSON.stringify(err), err);
            deferred.reject(returnData.errorType.dataBaseError.unknow);
        });
        var progress = arg.currentbatch / arg.batchnum;
        client.hmset("gen" + arg.batchid, "progress", progress, "url", arg.packurl, "key", arg.key, function (err, res) {
            logger.info(config.systemUser, "新批次二维码【" + arg.batchid + "】的key:" + arg.key);
            if (err) {
                deferred.reject(err);
                logger.error(config.systemUser, "新批次二维码【" + arg.batchid + "】的key信息写redis出错:" + JSON.stringify(err));
            } else {
                deferred.resolve(true);
                logger.info(config.systemUser, "新批次二维码【" + arg.batchid + "】" + "：批次" + arg.currentbatch + "的key信息写redis成功:" + JSON.stringify(res));
            }
            client.quit();
        });
    } catch (err) {
        deferred.reject(err);
    }
    return deferred.promise;
}

/**
 * 写入Mysql
 * @param block
 * @param arg
 * @returns {*|promise}
 * @private
 */
var _writesql = function (block, arg) {
    var deferred = Q.defer();
    var currentbatch = arg.currentbatch;

    try {
        var path = config.qrgenpath + "/" + arg.batchid + "/sql/" + arg.currentbatch + ".sql";
        //生成内容数组
        var contentblock = [];
        for (var i in block) {
            var s = block[i].replace(config.host + config.page.qrgen, '') + '\t' + block[i] + "\t" + arg.batchid + '\t' + "0";
            contentblock.push(s);
        }
        //写入文件
        fs.appendFile(path, contentblock.join("\r\n") + "\r\n", function (err) {
            if (err) {
                logger.error(config.systemUser, "qrcode _writesql写入出错");
                deferred.reject(new Error("qrcode _writesql写入出错"));
            }
            //load into Mysql
            var t = "LOAD DATA LOCAL INFILE '" + path + "' INTO TABLE " + config.qrgentable + ";";
            logger.info(config.systemUser, t);
            db.sequelize.query(t).spread(function (results, metadata) {
                deferred.resolve(currentbatch);
            },
                function (err) {
                    deferred.reject(err);
                });
        });
    } catch (err) {
        deferred.reject(err);
    }
    return deferred.promise;
}

/**
 * 打包文件
 * @param arg
 * @returns {*|promise}
 * @private
 */
var _pack = function (arg) {
    var deferred = Q.defer();
    try {
        logger.info(config.systemUser, "新批次二维码【" + arg.batchid + "】正在打包");
        var folder = config.qrgenpath + "/" + arg.batchid;
        var destpath = config.qrgenpath + "/" + arg.batchid + ".zip";
        archiver.archivedir(folder, destpath).then(function (flag) {
            if (flag) deferred.resolve(destpath);
            else deferred.reject(new Error("压缩失败"));
        },
            function (err) {
                deferred.reject(err);
            });
    } catch (err) {
        deferred.reject(err);
    }
    return deferred.promise;
}

/**
 * 生成size条记录
 * @param size
 * @returns {Array}
 * @private
 */
var _genblock = function (size) {
    var batcharray = [];
    for (var i = 0; i < size; i++) {
        var name = uuid.v4();
        batcharray[i] = config.host + config.page.qrgen + name;
    }
    return batcharray;
}
/**
 * 二维码生成
 * @param arg
 * @private
 */
var _generator = function (arg) {
    //判断批次
    var ep = new eventproxy();
    if (arg.currentbatch == arg.batchnum) {
        arg.currentsize = arg.amount - (arg.currentbatch - 1) * arg.size
    }
    var block = _genblock(arg.currentsize);
    logger.info(config.systemUser, "开始新批次二维码【" + arg.batchid + "】的生产：" + arg.currentbatch + "/" + arg.batchnum + "，数量：" + arg.currentsize);
    if (arg.currentbatch == 1) _writeRedis(arg); //如果是第一批先写入数据库以免第一批还未完成时查询记录为空

    ep.all("txtgendone" + arg.batchid + "_" + arg.currentbatch, "picgendone" + arg.batchid + "_" + arg.currentbatch, "mysqldone" + arg.batchid + "_" + arg.currentbatch, function () {
        _writeRedis(arg).then(function (res) {
            arg.currentbatch += 1;
            if (arg.currentbatch <= arg.batchnum) _generator(arg);
            else {
                arg.currentbatch -= 1;
                logger.info(config.systemUser, "开始删除sql文件夹");
                rmdir(config.qrgenpath + "/" + arg.batchid + "/sql", function (err, dirs, files) {
                    logger.info(config.systemUser, "新批次二维码【" + arg.batchid + "】开始打包");
                    _pack(arg).then(
                        function (url) {
                            logger.info(config.systemUser, "新批次二维码【" + arg.batchid + "】打包完成");
                            arg.packurl = url;
                            logger.info(config.systemUser, "新批次二维码【" + arg.batchid + "】的url:" + arg.packurl);
                            arg.key = tool.genPwd(uuid.v4() + config.salt);
                            logger.info(config.systemUser, "新批次二维码【" + arg.batchid + "】的key:" + arg.key);
                            _writeRedis(arg);
                            delete batchmap[arg.batchid];
                        },
                        function (err) {
                            logger.error(config.systemUser, "新批次二维码【" + arg.batchid + "】打包出错", err);
                        }
                    );
                });
            }
        }).catch(function (err) {
            logger.error(config.systemUser, "新批次二维码【" + arg.batchid + "】写redis出错", err);
        })
    });

    //txt generate
    _txtgen(block, arg).then(function (data) {
        logger.info(config.systemUser, "新批次二维码【" + arg.batchid + "】批次" + data + "文本生成完成");
        ep.emit("txtgendone" + arg.batchid + "_" + arg.currentbatch);
    },
        function (err) {
            logger.error(config.systemUser, "error", err);
        });

    //pic generate
    if (arg.picflag) {
        _picgen(block, arg).then(function (data) {
            logger.info(config.systemUser, "新批次二维码【" + arg.batchid + "】批次" + data + "图片生成完成");
            ep.emit("picgendone" + arg.batchid + "_" + arg.currentbatch);
        },
            function (err) {
                logger.error(config.systemUser, "error", err);
            });
    }
    else {
        ep.emit("picgendone" + arg.batchid + "_" + arg.currentbatch);
    }

    _writesql(block, arg).then(function (data) {
        logger.info(config.systemUser, "新批次二维码【" + arg.batchid + "】批次" + data + "数据库写入完成");
        ep.emit("mysqldone" + arg.batchid + "_" + arg.currentbatch);
    },
        function (err) {
            logger.error(config.systemUser, "error", err);
        });
}

/**
 * 图片生成函数
 * @param block
 * @param path
 * @param arg
 * @returns {*|promise}
 * @private
 */
var _picgen = function (block, arg) {
    var deferred = Q.defer();
    var ep = new eventproxy();
    try {
        var currentbatch = arg.currentbatch;
        var folder = config.qrgenpath + "/" + arg.batchid + "/pic";
        logger.info(config.systemUser, "新批次二维码【" + arg.batchid + "】开始图片生成：" + arg.currentbatch + "/" + arg.batchnum);
        //判断block是否为数组
        if (!tool.verifier.isArray(block)) {
            logger.error(config.systemUser, "qrcode _writetxt出错，参数block要求为数组:" + JSON.stringify(block));
            deferred.reject(new Error("qrcode _writetxt出错，参数block要求为数组:" + JSON.stringify(block)));
        } else {
            //写入文件
            for (var i in block) {
                var filename = block[i].replace(config.host + config.page.qrgen, '');
                var codeschema = {
                    text: block[i],
                    size: 512,
                    qrcodePath: folder + '/' + filename + '.png'
                    //browser: 'chrome'
                }
                qrcode.save(codeschema.qrcodePath, codeschema.text, { errorCorrectLevel: "max" }, function (error, written) {
                    if (error) {
                        logger.error(config.systemUser, "批次：" + arg.currentbatch + "出错！", error);
                        deferred.reject(error);
                        return;
                    }
                    ep.emit(arg.currentbatch + "done");
                });
            }
            ep.after(arg.currentbatch + "done", block.length, function () {
                deferred.resolve(currentbatch);
            });
        }
    } catch (err) {
        deferred.reject(err);
    }
    return deferred.promise;
}

/**
 * 文本生成函数
 * @param block
 * @param path
 * @param arg
 * @returns {*|promise}
 * @private
 */
var _txtgen = function (block, arg) {
    var deferred = Q.defer();
    try {
        var currentbatch = arg.currentbatch;
        var path = config.qrgenpath + "/" + arg.batchid + "/txt/" + arg.batchid + ".txt";
        logger.info(config.systemUser, "新批次二维码【" + arg.batchid + "】开始文本生成：" + arg.currentbatch + "/" + arg.batchnum);
        //判断block是否为数组
        if (!tool.verifier.isArray(block)) {
            logger.error(config.systemUser, "qrcode _writetxt出错，参数block要求为数组:" + JSON.stringify(block));
            deferred.reject(new Error("qrcode _writetxt出错，参数block要求为数组:" + JSON.stringify(block)));
        } else {
            //写入文件
            fs.appendFile(path, block.join("\n") + "\n", function (err) {
                if (err) {
                    logger.error(config.systemUser, "qrcode _writetxt文件写入出错");
                    deferred.reject(new Error("qrcode _writetxt文件写入出错"));
                } else {
                    deferred.resolve(currentbatch);
                }
            });
        }
    } catch (err) {
        deferred.reject(err);
    }
    return deferred.promise;
}

/**
 * 计算批次
 * @param amount 总数
 * @param size 每批次数量
 * @returns {number} 批次数量
 * @private
 */
var _batchcaculator = function (amount, size) {
    var batchnum = 1;
    if (amount % size == 0) {
        batchnum = Math.floor(amount / size);
    }
    else {
        batchnum = Math.floor(amount / size) + 1;
    }
    return batchnum;
}

var _mkfolder = function (batchid) {
    //创建文件夹
    //新批次二维码目录
    if (!fs.existsSync(config.qrgenpath + "/" + batchid))
        fs.mkdirSync(config.qrgenpath + "/" + batchid);

    //文本目录
    if (!fs.existsSync(config.qrgenpath + "/" + batchid + "/txt"))
        fs.mkdirSync(config.qrgenpath + "/" + batchid + "/txt");

    //图片目录
    if (!fs.existsSync(config.qrgenpath + "/" + batchid + "/pic"))
        fs.mkdirSync(config.qrgenpath + "/" + batchid + "/pic");

    //sql
    if (!fs.existsSync(config.qrgenpath + "/" + batchid + "/sql"))
        fs.mkdirSync(config.qrgenpath + "/" + batchid + "/sql");
}
/**
 * 生成二维码接口
 * @param arg
 * @param arg.batchid 新批次二维码ID
 * @param arg.amount 生成总数
 * @param arg.size 每批次数量，默认为100
 * @param arg.type 生成类型，enum [pic, txt]
 * @param cb 回调函数
 */
exports.gen = function (arg, cb) {
    //参数包装
    arg.batchnum = _batchcaculator(arg.amount, arg.size);
    arg.currentbatch = 1; //当前生产批次
    arg.packurl = '';
    arg.key = '';
    arg.currentsize = arg.size;
    arg.picflag = arg.amount > 100 ? false : true;

    //创建文件夹
    _mkfolder(arg.batchid);
    //Redis检查
    _checkRedis(arg).then(function (progress) {
        if (progress) { //Redis有记录，返回Redis记录
            cb(null, returnData.createData(progress));
            return;
        }
        if (!batchmap[arg.batchid]) {
            batchmap[arg.batchid] = true;
            _generator(arg);
        }
        cb(null, returnData.createData({ success: true }));
    },
        function (err) {
            logger.error(config.systemUser, "/qrcodeNew/gen接口出错：" + err, err);
            cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err));
        });
}

exports.get = function (arg, cb) {
}