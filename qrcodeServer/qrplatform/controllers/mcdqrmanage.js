/**
 * Created by Erathink on 2016/12/13.
 */
//加载第三方库
var eventproxy = require('eventproxy');
var sequelize = require('sequelize');
var Q = require('q');
var multiline = require('multiline');
var uuid = require('node-uuid');
var moment = require('moment');
//加载自定义库
var returnData = require('../common/returnData');
var db = require('../common/db');
var vo = require('../models/vomodels');
var logger = require('../common/logger');
var tool = require('../common/tool');
var config = require('../../config');
var request = require('request');
var wechat = require('../wechat/index');
var projectstate = require('../models/vomodels/project').state;

var mail = require('../common/email.js');
var redis = require('redis');

/**
 * 获取商家的商品列表
 * @param arg
 * @param callback
 * @author baoyunfei
 * @modified
 * 1.修改商品列表返回的数据，包含关联的二维码信息 by fengyun
 */
function _getMcdList(arg, callback) {

    logger.info(arg.currentuser.useraccount, '******获取企业商品列表!******');

    if (!arg.currentuser) {
        cb(returnData.createError(returnData.errorType.account.unlogin, "当前用户未登录"));
        return;
    }

    var parm = arg.query;
    var queryCondition = ''; var iQueryBatchCode = false;
    if (parm != undefined && !tool.verifier.isEmptyString(parm)) {
        var queryobj = JSON.parse(parm);
        if (queryobj.mcdname) {
            queryCondition += " and mcdname like '%" + queryobj.mcdname + "%'";
        }

        if (queryobj.categoryid) {
            queryCondition += " and categoryid = '" + queryobj.categoryid + "'";
        }

        if (queryobj.mcddesc) {//query keyword
            queryCondition += " and mcddesc like '%" + queryobj.mcddesc + "%'";
        }

        if (queryobj.batchcode) {//query keyword
            queryCondition += " and batchcode = '" + queryobj.batchcode + "'";
            iQueryBatchCode = true;
        }

        if (tool.verifier.isEmptyString(queryCondition)) {
            callback(returnData.createError(returnData.errorType.paraerror, "参数错误"));
            return;
        }
    }

    var page = parseInt(arg.page) || 1;
    var size = parseInt(arg.size) || 10;
    var entid = arg.currentuser.entid;

    var v_merchandise = _getMcdView({ entid: entid });
    function _getMcdCount() {
        var deferrd = Q.defer();
        var sql = "select count(mcdid) as count from " + 'merchandise' + " as t where entid = '" + entid + "' and state != '0' " + queryCondition;
        db.sequelize.query(sql).spread(function (data, metadata) {
            deferrd.resolve(data[0].count);
        }, function (err) {
            deferred.reject(err);
        });
        return deferrd.promise;
    }

    if (iQueryBatchCode) {
        var sql = 'SELECT * from ' + v_merchandise + ' as t1';
        sql += ' RIGHT join (SELECT mcdid FROM proqrcodebatch WHERE batchcode ="' + queryobj.batchcode + '" AND entid = "' + entid + '" LIMIT 0,1) t2 on t1.mcdid = t2.mcdid';
        db.sequelize.query(sql).spread(function (data, metadata) {
            var result = {};
            result.data = data;
            result.totalpage = 1;
            result.page = page;
            result.size = size;
            result.totalsize = 1;
            callback(null, returnData.createData(result));
        }, function (err) {
            callback(returnData.createError(returnData.errorType.notexist, "未找到企业商品数据"), null);
        });
    } else {
        _getMcdCount().then(function (data) {

            var pageCounts = 1;
            var queryCounts = data;
            if (queryCounts > 0) {
                var over = (queryCounts) % size;
                over > 0 ? pageCounts = parseInt((queryCounts) / size) + 1 : pageCounts = parseInt((queryCounts) / size);
            }

            var sql = "select * from " + v_merchandise + " as t where state != '0' " + queryCondition + ' order by updatetime desc';
            var _page = page - 1;
            sql += ' limit ' + (_page * size) + ',' + size;
            db.sequelize.query(sql).spread(function (data, metadata) {
                var result = {};
                result.data = data;
                result.totalpage = pageCounts;
                result.page = page;
                result.size = size;
                result.totalsize = queryCounts;
                callback(null, returnData.createData(result));
            }, function (err) {
                callback(returnData.createError(returnData.errorType.notexist, "未找到企业商品数据"), null);
            });
        }, function (err) {
            callback(returnData.createError(returnData.errorType.notexist, "未找到企业商品数据"), null);
        });
    }
}
/**
 * 根据商品ID获取商品详情
 * @param arg
 * @param callback
 * @private
 */
function _getMcdById(arg, callback) {
    var user = "test_user";
    logger.info(user, '******获取指定商品!******');
    var mcd = db.models.merchandise;
    mcd.findOne({
        where: {
            // entid: arg.currentuser.entid,
            mcdid: arg.mcdId
        }
    }).then(function (data) {
        if (data) {
            logger.info(user, '******完成获取指定商品!******' + data);
            callback(null, returnData.createData(data));
        } else {
            logger.error(user, '******获取企业指定商品时出错!******');
            callback(returnData.createError(returnData.errorType.notexist, "未找到指定商品数据"), null);
        }
    }).catch(function (err) {
        logger.error(user, err.message);
        callback(returnData.createError(returnData.errorType.unknow, err.message), null);
    })
}
/**
 *保存或更新商品
 * @param arg
 * @param callback
 * @private
 */
function _saveOrUpdMcd(arg, callback) {

    if (!arg.currentuser) {
        cb(returnData.createError(returnData.errorType.account.unlogin, "当前用户未登录"));
        return;
    }

    if (!arg.categoryid) {
        callback(returnData.createError(returnData.errorType.mcdqrmanager.merchandise.nocategory, "新增商品没有关联类别"));
        return;
    }

    var state = arg.state ? arg.state : 1;
    var point = arg.point ? arg.point : 1;
    var time = moment().format('X');

    var merchandise = {
        mcdname: arg.mcdname,
        categoryid: arg.categoryid,
        entid: arg.currentuser.entid,
        point: point,
        mcddesc: arg.mcddesc,
        //price: arg.price,
        //mcdbrand: arg.mcdbrand,
        //creator: creator,
        //createtime: createtime,
        //updater: updater,
        //updatetime: updatetime,        
        state: state
    };

    var mcd = db.models.merchandise;
    var ep = new eventproxy();
    ep.on("updateMcd", function () {
        var mcdid = arg.mcdid ? arg.mcdid : uuid.v4();
        merchandise.mcdid = mcdid;
        /*var createtime = arg.createtime ? arg.createtime : moment().format('X');
         var updatetime = arg.updatetime ? arg.updatetime : moment().format('X');
         var creator = arg.creator ? arg.creator : arg.currentuser.useraccount;
         var updater = arg.updater ? arg.updater : arg.currentuser.useraccount;*/

        mcd.findOne({ where: { mcdname: arg.mcdname, entid: arg.currentuser.entid, state: '1', mcdid: { $ne: merchandise.mcdid } } }).then(function (res) {
            if (res) {
                callback(returnData.createError(returnData.errorType.exists, "新增商品名已经存在"));
            } else {
                merchandise.createtime = time;
                merchandise.updatetime = time;
                mcd.upsert(merchandise, {
                    where: {
                        mcdid: mcdid,
                        entid: arg.currentuser.entid
                    }
                }).then(function (data) {
                    if (data) {
                        logger.info(arg.currentuser.useraccount, '******创建商品成功!******');
                    } else {
                        logger.info(arg.currentuser.useraccount, '******更新商品成功!******');
                    }
                    callback(null, returnData.createData(true));
                }).catch(function (err) {
                    logger.error(config.systemUser, err.message);
                    callback(returnData.createError(returnData.errorType.unknow, err.message), null);
                })
            }
        })
    });

    if (!arg.mcdid) {
        var mcdid = arg.mcdid ? arg.mcdid : uuid.v4();
        merchandise.mcdid = mcdid;
        merchandise.createtime = time;
        merchandise.updatetime = time;
    } else {
        merchandise.updatetime = time;
    }

    ep.emit('updateMcd');
}
/**
 * 删除商品
 * @param arg
 * @param callback
 * @private
 */
function _delMcd(arg, callback) {
    if (!arg.currentuser) {
        cb(returnData.createError(returnData.errorType.account.unlogin, "当前用户未登录"));
        return;
    }
    logger.info(arg.currentuser.useraccount, '******删除商品!******');

    var mcd = db.models.merchandise;
    var listid = JSON.parse(arg.mcdId);
    var idList = listid.list;

    //查找对应的类别
    function isMapMcd() {
        var d = Q.defer();
        var mcddb = db.models.merchandise;
        mcddb.findAll({ attributes: ['categoryid'], where: { entid: arg.currentuser.entid, mcdid: { $in: idList } } }).then(function (res) {
            d.resolve(res);
        }).catch(function (err) { d.reject(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message)) })
        return d.promise;
    }

    var ctgs = [];
    //检查类别对应的活动状态
    function isMapProject(recv) {
        recv.forEach(function (v, index, array) {
            ctgs.push(v.get({ chain: true })['categoryid']);
        })
        if (0 == ctgs.length) {
            d.reject(returnData.createError(returnData.errorType.mcdqrmanager.merchandise.nocategory, '删除失败，要删除的商品没有对应的分类'));
            return d.promise;
        }
        var d = Q.defer();
        var ctg2Prjdb = db.models.ctg2project;
        ctg2Prjdb.findAll({ where: { entid: arg.currentuser.entid, categoryid: { $in: ctgs }, state: { $in: ['start', 'stop'] } } }).then(function (res) {
            res.length == 0 ? d.resolve(true) : d.reject(returnData.createError(returnData.errorType.mcdqrmanager.category.projectoccupied, '删除失败，该类别有关联的进行中的活动'));
        }).catch(function (err) { d.reject(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message)) })
        return d.promise;
    }

    isMapMcd().then(isMapProject).then(function (res) {

        var ctg2Prjdb = db.models.ctg2project;
        ctg2Prjdb.destroy(
            {
                where: {
                    entid: arg.currentuser.entid,
                    categoryid: { $in: ctgs }
                }
            }
        ).then(function (data) {
            logger.info(arg.currentuser.useraccount, '******删除ctg2project指定商品类别成功!******');
        }).catch(function (err) {
            logger.info(err.message, '******删除ctg2project指定商品类别失败!******');
        });

        var updatetime = arg.updatetime ? arg.updatetime : moment().format('X');

        db.sequelize.transaction({ autocommit: true }).then(function (t) {

            mcd.update({
                state: 0,
                updatetime: updatetime
            }, {
                    where: {
                        mcdid: { $in: idList },
                        entid: arg.currentuser.entid
                    },
                    transaction: t
                }).then(function (data) {

                    var qrcodebatchdb = db.models.proqrcodebatch;
                    qrcodebatchdb.update({ state: 0 }, { where: { mcdid: { $in: idList }}, transaction: t  }).then(function (res) {
                        callback(null, returnData.createData(true));
                        t.commit();
                    }).catch(function (err) {
                        callback(returnData.createError(returnData.errorType.unknow, err.message), null);
                        t.rollback();
                    })
                }).catch(function (err) {
                    logger.error(config.systemUser, err.message);
                    callback(returnData.createError(returnData.errorType.unknow, err.message), null);
                    t.rollback();
                })

        }).catch(function (err) {
            callback(returnData.createError(returnData.errorType.unknow, err.message), null);
        })

    }).catch(function (err) {
        callback(err, null);
    })
}
/**
 * 返回要添加的二维码批次号
 * @param arg
 * @param callback
 * @private
 */
function _getAddQRbatch(arg, callback) {
    var user = "test_user";
    logger.info(user, '******生成添加的二维码批次号!******');
    var qrbatch = db.models.proqrcodebatch;
    var dt = moment().format('YYYYMMDDHHmmss');
    //var uid = uuid.v1();
    //var newbatchcode = arg.currentuser.entid.slice(0,3)+"-"+arg.mcdId.slice(0,3)+"-"+dt+"-"+uid.slice(0,8);
    var newbatchcode = dt;//+ "-" + uid.slice(0, 4);
    logger.info(user, '******生成批次号：' + newbatchcode + '******');
    callback(null, returnData.createData(newbatchcode));
}
/**
 * 获取指定商品所绑定的二维码批次
 * @param arg 如果QRbatch（批次号）参数不为空，则以QRbatch进行模糊查询；如果为空，则查询指定商品所有二维码的批次。
 * @param callback
 * @author baoyunfei
 * @modified
 * 1.修改二维码批次返回信息，包含各批次总数和可用数 by fengyun
 */
function _getMcdQRbatchList(arg, callback) {

    var page = parseInt(arg.page) || 1;
    var size = parseInt(arg.size) || 10;

    //var sql = "SELECT b.batchid,b.batchcode,b.createtime,b.amount,(CASE WHEN isnull(a.count) THEN 0 ELSE a.count END)as count from (SELECT 0 AS count,batchid FROM proqrcode WHERE state = 0 and batchid IN ( SELECT batchid FROM proqrcodebatch WHERE entid = '";
    var sql = 'SELECT batchid,batchcode,createtime,amount,0 as count from proqrcodebatch where entid = \''
    sql += arg.currentuser.entid + '\'';

    var queryCondition = "";
    var mcdid = arg.mcdId;
    queryCondition += " and mcdid = '" + mcdid + "'";
    sql += queryCondition;
    //sql += " GROUP BY batchid ) as a RIGHT JOIN (SELECT * from proqrcodebatch WHERE mcdid = '"  + mcdid + "') b ON a.batchid = b.batchid ";

    function _getQrBatchCount() {
        var deferrd = Q.defer();
        /*db.sequelize.query(sql).spread(function (data, metadata) {
            deferrd.resolve(data.length);
        }, function (err) {
            deferrd.reject(err);
        });*/
        deferrd.resolve(10);
        return deferrd.promise;
    }

    _getQrBatchCount().then(function (_data) {

        var pageCounts = 1;
        var queryCounts = _data;
        if (queryCounts > 0) {
            var over = (queryCounts) % size;
            over > 0 ? pageCounts = parseInt((queryCounts) / size) + 1 : pageCounts = parseInt((queryCounts) / size);
        }

        sql += ' ORDER BY createtime desc limit 0 ,10';
        //var _page = page - 1;
        //sql += ' limit ' + _page + ',' + size;
        db.sequelize.query(sql, { type: db.sequelize.QueryTypes.SELECT }).then(function (data, metadata) {

            //查询批次的生成情况
            var buffer = [], lens = data.length, batchCodeArray = [];
            if (0 == data.length) {
                var result = {};
                result.data = [];
                result.totalpage = 1;
                result.page = page;
                result.size = size;
                result.totalsize = 0;
                callback(null, returnData.createData(result));
                return;
            }
            for (var i = 0; i < data.length; ++i) {
                (function (results, l) {

                    var qrcodeuri = config.services.qrgenerator.url + config.services.qrgenerator.interfaces.qrcodeNew;

                    var amount = parseInt(results.amount);
                    var size = 0;
                    if (amount) {
                        if (amount >= 10000) {
                            size = config.qrcodesizemax;
                        } else {
                            size = config.qrcodesizemin;
                        }
                    }

                    request.post({
                        url: qrcodeuri,
                        form: { "batchid": results.batchid, "amount": amount, "size": size }
                    }, function (error, response, body) {
                        var eleobj = results;
                        if (!error && response.statusCode == 200) {
                            buffer.push(l);
                            d = JSON.parse(body);
                            delete d.data.url;
                            eleobj['progress'] = d.data.progress;
                            eleobj['key'] = d.data.key;
                        } else {
                            logger.error(arg.currentuser.useraccount, returnData.errorType.timeout);
                            eleobj['key'] = '-1';
                            eleobj['progress'] = '-1';
                            lens--;
                        }
                        batchCodeArray.push(eleobj);
                        if (buffer.length === lens) {
                            var result = {};
                            //由于异步获取二维码进度，导致二维码列表顺序不一致，故要再做排序
                            batchCodeArray = batchCodeArray.sort(function (a, b) {
                                return b.createtime - a.createtime
                            });
                            result.data = batchCodeArray;
                            result.totalpage = pageCounts;
                            result.page = page;
                            result.size = size;
                            result.totalsize = queryCounts;
                            callback(null, returnData.createData(result));
                        }

                    });


                })(data[i], i);
            }
        }, function (err) {
            callback(returnData.createError(returnData.errorType.notexist, "未找到企业商品二维码批次数据"), null);
        });
    }, function (err) {
        callback(returnData.createError(returnData.errorType.notexist, "未找到企业商品二维码批次数据"), null);
    });
}
/**
 * 给指定商品添加一个新批次的二维码
 * @param arg
 * @param callback
 * @auther baoyunfei
 * @private
 */
function _addMcdQR(arg, callback) {

    var user = arg.currentuser.useraccount;

    var qrbatch = db.models.proqrcodebatch;
    var mcddb = db.models.merchandise;

    var qrNewbatch = arg;
    qrNewbatch.entid = arg.currentuser.entid;
    qrNewbatch.batchid = uuid.v4();
    qrNewbatch.creator = arg.currentuser.useraccount;
    qrNewbatch.createtime = arg.createtime ? arg.createtime : moment().format('X');
    qrNewbatch.state = 1;
    qrNewbatch.amount = arg.amount;//Math.ceil(parseInt(arg.amount) * config.qrpercent + parseInt(arg.amount));
    qrNewbatch.count = arg.amount;

    var proxy = new eventproxy();

    proxy.on('err', function (err) {
        logger.error(arg.currentuser.useraccount, '**' + err.message);
        callback(returnData.createError(returnData.errorType.unknow, err.message), null);
    });

    proxy.on('qrcode', function (data) {
        // var amount = Math.ceil(parseInt(data.amount) * config.qrpercent + parseInt(data.amount));
        var amount = parseInt(data.amount);
        var size = 0;
        if (amount) {
            if (amount >= 10000) {
                size = config.qrcodesizemax;
            } else {
                size = config.qrcodesizemin;
            }
            var qrcodeuri = config.services.qrgenerator.url + config.services.qrgenerator.interfaces.qrcodeNew;
            logger.info(data.batchid, "请求生成二维码数量：" + amount);
            function _response(error, response, body) {
                if (!error && response.statusCode == 200) {
                    if (body != undefined) {
                        d = JSON.parse(body);
                        if (d.error) {
                            logger.error("请求参数校验失败", d.error.message);
                            callback(returnData.createError(returnData.errorType.paraerror), null);
                        } else {
                            logger.info("获取进度和key成功", JSON.stringify(d));
                            d.data["batchid"] = data.batchid;
                            //d.data["state"] = arg.state;
                            d.data["gen"] = data.gen;
                            d.data["amount"] = amount;
                            if ("success" in d.data) {
                                d.data["progress"] = 0;
                                delete d.data.success;
                                d.data.gen = true;
                                d.data.date = moment().format("YYYY-MM-DD hh:mm:ss");
                                callback(null, d);
                                //判断商品关联的活动是否是开启，如果是，则需要插入lottery‘谢谢参与’个数，并更新奖池
                                proxy.emit('findCtg');

                            } else {
                                delete d.data.url;
                                callback(null, d);
                            }
                        }
                    } else {
                        callback(returnData.createError(returnData.errorType.unknow), null);
                    }
                } else {
                    callback(returnData.createError(returnData.errorType.timeout), null);
                }
            }
            request.post({
                url: qrcodeuri,
                form: { "batchid": data.batchid, "amount": amount, "size": size }
            }, _response);
        } else {
            logger.error(arg.currentuser.useraccount, '*请求生成的二维码数量为零*');
            callback(returnData.createError(returnData.errorType.notexist, '请求生成的二维码数量为零'), null);
        }
    });

    proxy.on('findCtg', function () {
        var _mcdid = arg.mcdid;
        mcddb.findOne({
            where: {
                mcdid: _mcdid
            }
        }).then(function (data) {
            var _resObj = data.get({ chain: true });
            var ctg = _resObj.categoryid;
            proxy.emit('getproject', ctg);

        }).catch(function (err) {
            logger.error(arg.currentuser.useraccount, "查找商品对应的类别出错：" + err.message);
        });
    });

    proxy.on('getproject', function (data) {
        var ctgid = data;
        var ctg2projectdb = db.models.ctg2project;
        ctg2projectdb.findOne({
            where: {
                categoryid: ctgid,
                state: projectstate.start
            }
        }).then(function (res) {
            if (res) {
                var _resObj = res.get({ chain: true });
                var projectdb = db.models.project;
                projectdb.findOne({
                    where: {
                        projectid: _resObj.projectid
                    }
                }).then(function (result) {
                    if (!result) return;
                    var _proResObj = result.get({ chain: true });
                    var cpType = _proResObj.directory === null ? cpType = '' : cpType = _proResObj.directory;
                    var arrayType = cpType.split(',');
                    if (-1 !== arrayType.indexOf('prolottery')) {
                        //写入lottery
                        proxy.emit('insertLottery', _resObj);
                    }
                }).catch(function (err) {
                    logger.error(arg.currentuser.useraccount, "查找商品关联的活动详细信息出错：" + err.message);
                })
            }
        }).catch(function (err) {
            logger.error(arg.currentuser.useraccount, "查找商品关联的活动出错：" + err.message);
        });
    });

    proxy.on('insertLottery', function (data) {

        var lotterydb = db.models.prolottery;
        var _projectid = data.projectid;

        var _lotteryvo = {
            lotteryid: uuid.v4(),
            projectid: _projectid,
            name: '谢谢参与',
            prizecount: 1,
            price: 0,
            mallproducttype: 'thanks',
            mallproductname: '谢谢参与',
            mallproductid: 'thanks',
            amount: qrNewbatch.amount,
            summoney: 0
        };

        lotterydb.create(_lotteryvo).then(function (res) {
            //更新奖池
            var syncurl = null;
            syncurl = config.services.qrlotterymanager.url + config.services.qrlotterymanager.interfaces.syncrulelottery;
            request.post({ url: syncurl, form: { "projectid": _projectid } }, function (err, response, body) {
                if (!err && response.statusCode == 200) {
                    var d = JSON.parse(body);
                    if (!!d.data) {
                        logger.info(arg.currentuser.useraccount, "追加二维码后，向奖池增加成功！");
                    } else {
                        logger.error(arg.currentuser.useraccount, "追加二维码后，向奖池增加失败！" + d.error.code);
                    }
                } else {
                    logger.error(arg.currentuser.useraccount, "追加二维码后，向奖池增加出错：" + err.message);
                }
            });
        }).catch(function (err) {
            logger.error(arg.currentuser.useraccount, "prolottery-插入谢谢参与奖项出错：" + err.message);
        });
    });

    mcddb.findOne({
        where: {
            mcdid: arg.mcdid,
            entid: arg.currentuser.entid
        }
    }).then(function (res) {

        if (res) {
            qrbatch.findOrCreate({
                defaults: arg,
                where: {
                    entid: qrNewbatch.entid,
                    mcdid: qrNewbatch.mcdid,
                    categoryid: res.get({ chain: true }).categoryid,
                    batchcode: qrNewbatch.batchCode
                }
            }).then(function (data) {
                proxy.emit("qrcode", data[0].dataValues);
            }).catch(function (err) {
                logger.error(user, err.message);
                callback(returnData.createError(returnData.errorType.unknow, err.message), null);
            });
        } else {
            callback(returnData.createError(returnData.errorType.unknow, '指定的商品不存在，创建二维码失败'), null);
        }

    }).catch(function (err) {
        callback(returnData.createError(returnData.errorType.unknow, err.message), null);
    });
}
/**
 * 删除指定商品若干批次的二维码
 * @param arg
 * @param callback
 * @private
 */
function _delMcdQR(arg, callback) {

    logger.info("", '******删除指定批次二维码!******');
    if (!arg.currentuser) {
        cb(returnData.createError(returnData.errorType.account.unlogin, "当前用户未登录"));
        return;
    }

    var listid = JSON.parse(arg.listid);
    var list = listid.list;

    var qrcodebatchdb = db.models.proqrcodebatch;
    qrcodebatchdb.destroy(
        {
            where: {
                entid: arg.currentuser.entid,
                batchid: { $in: list }
            },
        }
    ).then(function (data) {
        logger.info(arg.currentuser.useraccount, '******删除指定批次二维码!******');
    }).catch(function (err) {
        logger.info(err.message, '******删除指定批次二维码失败!******');
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
    });

    var qrcodedb = db.models.proqrcode;
    qrcodedb.destroy(
        {
            where: {
                batchid: { $in: list }
            },
        }
    ).then(function (data) {
        logger.info(arg.currentuser.useraccount, '******删除指定批次二维码!******');
    }).catch(function (err) {
        logger.info(err.message, '******删除指定批次二维码失败!******');
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
    });

    cb(null, returnData.createData(true));
}


/**
 * 获取商品类别列表
 * @param arg
 * @param callback
 * @author fengyun
 */
function _getCategoryList(arg, cb) {

    var page = parseInt(arg.page) || 1;
    var size = parseInt(arg.size) || 10;
    var query = tool.isEmptyObject(arg.query) ? '' : arg.query;
    var queryobj = {};

    logger.info(arg.currentuser.useraccount, '******获取商品类别列表******');
    if (!arg.currentuser) {
        cb(returnData.createError(returnData.errorType.account.unlogin, "当前用户未登录"));
        return;
    }

    if (!tool.verifier.isEmptyString(query)) {
        queryobj = JSON.parse(query)
    }
    queryobj.entid = arg.currentuser.entid;
    queryobj.name = queryobj.name === undefined ? '' : queryobj.name;
    queryobj.state = queryobj.state === undefined ? '1' : queryobj.state;
    var categorydb = db.models.mcdcategory;
    categorydb.findAndCountAll({
        where: {
            name: {
                $like: '%' + queryobj.name + '%'
            },
            state: queryobj.state,
            entid: queryobj.entid,
        },
        order: [['createtime', 'DESC']],
        offset: (page - 1) * size,
        limit: size
    }).then(function (data) {
        if (data) {
            var result = {};
            count = data.count;
            result.data = data.rows;
            result.totalpage = totalpage(count, size);
            result.page = page;
            result.size = size;
            result.totalsize = count;
            cb(null, returnData.createData(result));
        } else {
            logger.error(arg.currentuser.useraccount, '******获取商品类别列表出错!******');
            cb(returnData.createError(returnData.errorType.notexist, "未找到商品类别列表"), null);
        }
    }).catch(function (err) {
        logger.error(arg.currentuser.useraccount, err.message);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
    });
}

/**
 * 获取商品类别列表(针对营销活动)
 * @param arg
 * @param callback
 * @author fengyun
 */
function _getCategoryListEx(arg, cb) {

    var page = parseInt(arg.page) || 1;
    var size = parseInt(arg.size) || 10;
    //var query = tool.isEmptyObject(arg.query) ? '' : arg.query;
    //var queryobj = {};

    logger.info(arg.currentuser.useraccount, '******获取商品类别列表******');
    if (!arg.currentuser) {
        cb(returnData.createError(returnData.errorType.account.unlogin, "当前用户未登录"));
        return;
    }

    //if (!tool.verifier.isEmptyString(query)) {
    //    queryobj = JSON.parse(query)
    //}
    //queryobj.entid = arg.currentuser.entid;
    //queryobj.name = queryobj.name === undefined ? '' : queryobj.name;

    function getOccupyCtg() {
        var d = Q.defer();
        var categorydb = db.models.ctg2project;
        categorydb.findAll({
            attributes: ['categoryid'],
            where: {
                entid: arg.currentuser.entid,
                projectid: { $ne: arg.projectid },
                $or: [/*{ state: 'editing' },*/ /*{ state: 'start' }*/]
            },
            offset: (page - 1) * size,
            limit: size
        }).then(function (data) {
            d.resolve(data);
        }).catch(function (err) {
            d.reject(err.message);
        });

        return d.promise;
    }

    getOccupyCtg().then(function (data) {

        var ctgArray = [];
        data.forEach(function (v, index, array) {
            var ele = v.get({ chain: true });
            ctgArray.push(ele.categoryid);
        });


        var queryCtg = {};
        queryCtg.entid = arg.currentuser.entid;
        if (ctgArray.length > 0) {
            queryCtg.categoryid = {
                $notIn: ctgArray
            }
        }
        queryCtg.state = '1';
        var categorydb = db.models.mcdcategory;
        categorydb.findAndCountAll({
            where: queryCtg
        }).then(function (data) {
            if (data) {
                var result = {};
                count = data.count;
                result.data = data.rows;
                result.totalpage = totalpage(count, size);
                result.page = page;
                result.size = size;
                result.totalsize = count;
                cb(null, returnData.createData(result));
            } else {
                logger.error(arg.currentuser.useraccount, '******获取商品类别列表出错!******');
                cb(returnData.createError(returnData.errorType.notexist, "未找到商品类别列表"), null);
            }
        }).catch(function (err) {
            logger.error(arg.currentuser.useraccount, err.message);
            cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
        });
    }).catch(function (err) {
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
    });
}

/**
 * 获取已参加活动的商品类别列表
 * @param arg
 * @param callback
 * @author fengyun
 */
function _getCtgListSelected(arg, cb) {

    var queryobj = {};

    logger.info(arg.currentuser.useraccount, '******获取已参加商品类别列表******');
    if (!arg.currentuser) {
        cb(returnData.createError(returnData.errorType.account.unlogin, "当前用户未登录"));
        return;
    }

    queryobj.entid = arg.currentuser.entid;
    //queryobj.state = projectstate.editing;
    queryobj.projectid = arg.projectid;

    var categorydb = db.models.ctg2project;
    categorydb.findAll({
        where: queryobj,
        include: {
            model: db.models.mcdcategory,
            required: true
        }
    }).then(function (data) {
        if (data) {
            cb(null, returnData.createData(data));
        } else {
            logger.error(arg.currentuser.useraccount, '******获取已参加商品类别列表出错!******');
            cb(returnData.createError(returnData.errorType.notexist, "未找到商品类别列表"), null);
        }
    }).catch(function (err) {
        logger.error(arg.currentuser.useraccount, err.message);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
    });
}

/**
 * 更新已参加活动的商品类别列表
 * @param arg
 * @param callback
 * @author fengyun
 */
function _updateCtgListSelected(arg, cb) {

    var queryobj = {};

    logger.info(arg.currentuser.useraccount, '******获取已参加商品类别列表******');
    if (!arg.currentuser) {
        cb(returnData.createError(returnData.errorType.account.unlogin, "当前用户未登录"));
        return;
    }

    var categorydb = db.models.ctg2project;

    try {
        var ctgid = JSON.parse(arg.ctgid);
    } catch (error) {
        cb(returnData.createError(returnData.errorType.verifyError.formatError, error.message), null);
        return;
    }

    var list = ctgid.list;
    if (!list instanceof Array) {
        cb(returnData.createError(returnData.errorType.verifyError.formatError, '待更新的活动关联类别不是数组'), null);
        return;
    }
    queryobj.entid = arg.currentuser.entid;
    queryobj.projectid = arg.projectid;
    queryobj.state = projectstate.editing;

    db.sequelize.transaction(function (t) {

        function del() {
            var deferred = Q.defer();
            categorydb.destroy({
                where: queryobj,
                transaction: t
            }).then(function (res) {
                deferred.resolve(res);
            }, function (err) {
                deferred.reject(err);
            });

            return deferred.promise;
        }

        var records = [];
        for (var i = 0; i < list.length; i++) {
            var ele = {
                id: uuid.v4(),
                entid: arg.currentuser.entid,
                categoryid: list[i],
                projectid: arg.projectid,
                state: projectstate.editing
            }

            records.push(ele);
        }

        function create(data) {
            var deferred = Q.defer();
            categorydb.bulkCreate(records, { transaction: t }).then(function (res) {
                deferred.resolve(res);
            }, function (err) {
                deferred.reject(err);
            });

            return deferred.promise;
        }

        return del().then(create)

    }).then(function (result) {
        //auto commit  
        cb(null, returnData.createData(true));
    }).catch(function (err) {
        //auto rollback  
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
    });
}

/**
 * 新增或更新商品类别
 * @param arg
 * @param callback
 * @author fengyun
 */
function _saveOrUpdCategory(arg, cb) {

    var ep = new eventproxy();
    var categorydb = db.models.mcdcategory;
    var categoryInput = arg.categoryInfo;
    var categoryInfo = {};
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;

    if (!!categoryInput) {
        try {
            categoryInfo = JSON.parse(categoryInput);
        } catch (error) {
            logger.error(useraccount, "新增类别参数解析失败");
            error.code = returnData.errorType.paraerror;
            ep.emit("error", error);
            return;
        }
    }

    /**
     * 添加类别
     */
    ep.on("addCategory", function (categoryInfo) {
        var categoryid = uuid.v4();
        categorydb.create({
            categoryid: categoryid,
            name: categoryInfo.name,
            categorydesc: categoryInfo.categorydesc,
            entid: arg.currentuser.entid,
            parentid: "",
            creator: useraccount,
            createtime: new Date().getTime(),
            updater: useraccount,
            updatetime: new Date().getTime(),
            state: "1"
        }).then(function (result) {
            logger.info(useraccount, "添加类别" + categoryInfo.name + "成功");
            var data = result.get({ chain: true });
            cb(null, returnData.createData(data));
        }, function (error) {
            logger.error(useraccount, "添加类别" + categoryInfo.name + "失败");
            error.code = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        }).catch(function (error) {
            logger.error(useraccount, "添加类别" + categoryInfo.name + "失败");
            error.code = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });
    });

    /**
     *更新类别
     */
    ep.on("updateCategoty", function (categoryInfo) {

        categorydb.findOne({ where: { name: categoryInfo.name, entid: arg.currentuser.entid, state: '1', categoryid: { $ne: categoryInfo.categoryid } } }).then(function (res) {
            if (res) {
                cb(returnData.createError(returnData.errorType.exists, "类别名已经存在"));
            } else {
                categorydb.update(
                    {
                        name: categoryInfo.name,
                        categorydesc: categoryInfo.categorydesc,
                        updater: useraccount,
                        updatetime: new Date().getTime(),
                    },
                    { where: { categoryid: categoryInfo.categoryid } }
                ).then(function (result) {
                    logger.info(useraccount, "更新类别" + categoryInfo.name + "成功！");
                    cb(null, returnData.createData(categoryInfo));
                }).catch(function (error) {
                    logger.error(useraccount, "更新类别" + categoryInfo.name + "失败");
                    error.errortype = returnData.errorType.dataBaseError.unknow;
                    ep.emit("error", error);
                })
            }
        })
    });

    ep.on("error", function (error) {
        logger.error(useraccount, "接口/mcdcategory/saveOrUpd错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    if (categoryInfo.categoryid == "") {
        logger.info(useraccount, "开始添加类别" + categoryInfo.name);
        //检查是否有相同的类别名
        categorydb.findOne({ where: { name: categoryInfo.name, entid: arg.currentuser.entid, state: '1' } }).then(function (res) {
            if (res) {
                cb(returnData.createError(returnData.errorType.exists, "类别名已经存在"));
            } else {
                ep.emit("addCategory", categoryInfo);
            }
        })
    }
    else {
        logger.info(useraccount, "开始更新类别信息" + categoryInfo.name);
        ep.emit("updateCategoty", categoryInfo);
    }
}

/**
 * 删除指定商品类别
 * @param arg
 * @param callback
 * @author fengyun
 */
function _delCategory(arg, cb) {
    logger.info("", '******删除指定商品类别!******');
    if (!arg.currentuser) {
        cb(returnData.createError(returnData.errorType.account.unlogin, "当前用户未登录"));
        return;
    }

    var listid = JSON.parse(arg.listid);
    var list = listid.list;

    //该类别下是否有商品关联
    function isMapMcd() {
        var d = Q.defer();
        var mcddb = db.models.merchandise;
        mcddb.findAll({ where: { categoryid: { $in: list }, state: '1' } }).then(function (res) {
            res.length == 0 ? d.resolve(true) : d.reject(returnData.createError(returnData.errorType.mcdqrmanager.category.mcdoccupied, '删除失败，该类别有关联的商品'));
        }).catch(function (err) { d.reject(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message)) })
        return d.promise;
    }
    //该类别是否正关联进行中的活动
    function isMapProject() {
        var d = Q.defer();
        var ctg2Prjdb = db.models.ctg2project;
        ctg2Prjdb.findAll({ where: { entid: arg.currentuser.entid, categoryid: { $in: list }, state: { $in: ['start', 'stop'] } } }).then(function (res) {
            res.length == 0 ? d.resolve(true) : d.reject(returnData.createError(returnData.errorType.mcdqrmanager.category.projectoccupied, '删除失败，该类别有关联的进行中的活动'));
        }).catch(function (err) { d.reject(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message)) })
        return d.promise;
    }

    isMapMcd().then(isMapProject).then(function (data) {

        var ctg2Prjdb = db.models.ctg2project;
        ctg2Prjdb.destroy(
            {
                where: {
                    entid: arg.currentuser.entid,
                    categoryid: { $in: list }
                }
            }
        ).then(function (data) {
            logger.info(arg.currentuser.useraccount, '******删除ctg2project指定商品类别成功!******');
        }).catch(function (err) {
            logger.info(err.message, '******删除ctg2project指定商品类别失败!******');
        });

        var categorydb = db.models.mcdcategory;
        categorydb.update({ state: '0' },
            {
                where: {
                    entid: arg.currentuser.entid,
                    categoryid: { $in: list }
                }
            }
        ).then(function (data) {
            logger.info(arg.currentuser.useraccount, '******删除指定商品类别成功!******');
            cb(null, returnData.createData(true));
        }).catch(function (err) {
            logger.info(err.message, '******删除指定商品类别失败!******');
            cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
        });
    }).catch(function (err) {
        logger.info('******删除指定商品类别失败!******');
        cb(err, null);
    })
}

/**
 * 总行数计算
 * @param total
 * @param size
 * @returns {number}
 */
var totalpage = function (total, size) {
    var page = Math.floor(Number(total) / Number(size));
    if (Number(total) % Number(size) > 0) page++;
    return page;
}

/**
 * 获取商家的商品列表视图查询sql语句，可供其他联合查询作sql拼接
 * @param arg
 * @param callback
 * @author fengyun
 * @modified
 */
function _getMcdView(arg, cb) {

    var entCondition = '';
    var entid = arg.entid;
    if (entid != '') {
        entCondition = " where entid = '" + entid + "' ";
    }

    //sum(CASE WHEN isnull(c.count) THEN 0 ELSE c.count END) AS count
    //left join(SELECT count(qrid) AS count,batchid FROM proqrcode WHERE state = 0 GROUP BY batchid) as c
    //on b.batchid = c.batchid

    var viewquery = multiline(function () {/*
     (select a.mcdid,a.mcdname,a.categoryid,a.entid,a.price,a.point,
     a.mcdbrand,a.creator,a.createtime,a.updater,a.updatetime,a.mcddesc,a.state,d.name as categoryname,
     sum(CASE WHEN isnull(b.amount) THEN 0 ELSE b.amount END) AS amount,
     0 AS count
     from (SELECT * from merchandise
     #entCondition#) as a
     left join
     mcdcategory as d ON a.categoryid = d.categoryid
     left join(SELECT mcdid,sum(amount) AS amount,batchcode,batchid FROM proqrcodebatch GROUP BY mcdid,batchid) as b
     on a.mcdid = b.mcdid
     GROUP BY
     mcdid,mcdname,categoryid,categoryname,entid,price,point,mcdbrand,creator,createtime,updater,updatetime,mcddesc,state)
     */
    });

    viewquery = viewquery.replace('#entCondition#', entCondition);
    return viewquery;
}

var _checkRedis = function (projectid, callback) {
    var deferred = Q.defer();
    try {
        var client = redis.createClient(config.redis);
        client.auth(config.redis.auth);
        //Redis错误处理
        client.on("error", function (err) {
            logger.error(config.systemUser, "Redis:错误" + JSON.stringify(err), err);
            deferred.reject(returnData.errorType.dataBaseError.unknow); //TODO:此处应该返回为Error
        });

        client.hgetall("gen" + projectid, function (err, replies) {
            logger.info(config.systemUser, "Redis:项目【" + projectid + "】查找到" + JSON.stringify(replies));
            if (replies) {
                logger.info(config.systemUser, JSON.stringify(replies));
                deferred.resolve(replies);
            }
            else {
                logger.info(config.systemUser, "Redis:项目【" + projectid + "】记录未找到");
                deferred.resolve(null);
            }
            client.quit();
        });
    } catch (err) {
        deferred.reject(err);
    }
    return deferred.promise;
};

function _sendMcdQREmail(arg, cb) {
    if (!arg.currentuser) {
        cb(returnData.createError(returnData.errorType.account.unlogin, "当前用户未登录"));
        return;
    }

    var batchid = arg.batchid || "";
    var key = arg.key || "";
    // 发送的文件名
    var filename = (arg.batchcode || "package") + ".zip";

    // 校验
    if (String(key) == "" || String(batchid) == "") {
        cb(returnData.createError(returnData.errorType.verifyError.unknow, "参数错误"));
        return;
    }
    // 获取文件路径
    _checkRedis(batchid).then(function (data) {
        if (!data) {
            cb(returnData.createError(returnData.errorType.notexist, "记录未找到"));
            return;
        }
        if (key == data.key) {
            var attachments = [{
                filename: filename,
                path: data.url
            }];
            mail.sendMcdQRMail(arg.currentuser.useraccount, attachments);
            cb(null, returnData.createData(true));
        } else {
            cb(returnData.createError(returnData.errorType.unknow, "key错误"));
            return;
        }
    }).catch(function (error) {
        console.log(error);
        cb(returnData.createError(returnData.errorType.unknow, "redis查询错误"));
        return;
    });
}



exports.getMcdList = _getMcdList;
exports.getMcdById = _getMcdById;
exports.saveOrUpdMcd = _saveOrUpdMcd;
exports.delMcd = _delMcd;
exports.getMcdQRbatchList = _getMcdQRbatchList;
exports.addMcdQR = _addMcdQR;
exports.delMcdQR = _delMcdQR;
exports.getAddQRbatch = _getAddQRbatch;
exports.getCategoryList = _getCategoryList;
exports.getCategoryListEx = _getCategoryListEx;
exports.getCtgListSelected = _getCtgListSelected;
exports.updateCtgListSelected = _updateCtgListSelected;
exports.saveOrUpdCategory = _saveOrUpdCategory;
exports.delCategory = _delCategory;
exports.getMcdView = _getMcdView;
exports.sendMcdQREmail = _sendMcdQREmail;