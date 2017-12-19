/**
 * Created by shuwei on 2017/2/16.
 */
//加载第三方库
var uuid = require('node-uuid');
var eventproxy = require('eventproxy');
var sequelize = require('sequelize');
var Q = require('q');
var multiline = require('multiline');
var moment = require('moment');
//加载自定义库
var returnData = require('../common/returnData');
var db = require('../common/db');
var vo = require('../models/vomodels');
var logger = require('../common/logger');
var config = require('../../config');
var tool = require('../common/tool');
var sms = require('../common/smsmanage');
var mail = require('../common/email.js');
/**
 * 获取积分记录,web端和mobile共用接口
 * @param arg
 * @param cb
 */
function getPointRecord(arg, cb) {

    var custid = arg.custid.trim();
    var begtime = arg.begtime;
    var type = arg.type;
    var endtime = moment(arg.endtime).add(1, 'd').format(config.dateformat);
    var pagenumber = parseInt(arg.pagenumber);
    var pagerows = parseInt(arg.pagerows);
    var ep = new eventproxy();

    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname :arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();
    /*if (arg.currentuser && arg.currentuser.roleid === 'erathink') {
        custid = arg.custid.trim();
        var entid = arg.currentuser.entid;
    } else
        custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();*/

    var pointdb = db.models.propointdetail;

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/club/getPointRecord", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });

    var where = {custid: custid, pointtime: {$between: [begtime, endtime]}};
    if (type && type != '')
        where.changemode = type;


    //if (entid) where.entid = entid;

    pointdb.findAndCountAll({
        where: where,
        limit: pagerows,
        offset: (pagenumber - 1) * pagerows,
        order: [
            ['pointtime', 'DESC']
        ]
    }).then(function (result) {
        logger.info(useraccount, "获取积分列表成功!");
        cb(null, returnData.createData(result));
    }).catch(function (error) {
        logger.error(useraccount, "数据库propointdetail表查找失败");
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    });
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
};

//获取积分排名
function getPointRanking(arg, cb) {
    var page = arg.page || 1,
        size = arg.size || 10;
    page = tool.getInt(page);
    size = tool.getInt(size);

    var whereQuery = '';
    !!arg.custid ? whereQuery = ' WHERE custid =\'' + arg.custid + '\'' : whereQuery;

    var sql = 'SELECT rownum,custid,point from (select @rownum:=@rownum+1 AS rownum,custid,point from custextend ,(SELECT @rownum:=0) r ORDER BY point desc )b';
    var offset = ' limit ' + (page - 1) * size + ',' + size;
    !!arg.custid ? sql = sql + whereQuery : sql = sql + whereQuery + offset

    db.sequelize.query(sql).spread(function (result) {
        cb(null, returnData.createData(result));
    }).catch(function (error) {
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, error.message), null);
    });

    /*var custextenddb = db.models.custextend;
     custextenddb.findAndCountAll({
     attributes: ['custid', 'point','fullname'],
     offset: custextenddb.pageOffset(page, size),
     limit: size,
     order: 'point desc',
     }).then(function(data){
     var result = {};
     count = data.count;
     result.data = data.rows;
     result.totalpage = totalpage(count, size);
     result.page = page;
     result.size = size;
     result.totalsize = count;
     cb(null, returnData.createData(result));
     }).catch(function(error){
     logger.error('', err.message);
     cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
     })*/
}

//获取用户基本信息
function getCustInfo(arg, cb) {

    var custid = arg.custid.trim();
    var custdb = db.models.custextend;
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname :arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    var ep = new eventproxy();
    //参数检查
    if (!custid) {
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }

    //组装查询对象
    var queryobj = {
        custid: custid
    };

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/getCustInfo错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });


    //查找用户基本信息
    custdb.findOne({
        where: queryobj
    }).then(
        //查找成功函数
        function (result) {
            logger.info(useraccount, "customer查找成功");
            if (result)
                result.dataValues.paypassword = '';
            cb(null, returnData.createData(result));
        },
        //查找失败函数
        function (error) {
            logger.error(useraccount, "customer查找失败");
            ep.emit("error", error);
        }
    ).catch(function (error) {
        logger.error(useraccount, "数据库操作失败");
        ep.emit("error", error);
    });
}

/**
 * 获取订单列表
 * @param arg
 * @param cb
 */
function getOrderList(arg, cb) {

    var custid = arg.custid.trim();
    var begtimestr = arg.begtime;
    var endtimestr = arg.endtime;
    var bt = moment(begtimestr).valueOf();
    var et = moment(endtimestr).add(1, 'd').valueOf();
    var state = arg.state;

    var pagenumber = parseInt(arg.pagenumber);
    var pagerows = parseInt(arg.pagerows);

    var orderdb = db.models.mallorder;
    var orderitemdb = db.models.mallorderdetail;
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname :arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    var ep = new eventproxy();
    //参数检查
    if (!custid) {
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }

    ep.on('ok', function (result) {
        logger.info(useraccount, "订单查找成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/getOrderList错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    ep.on('getorderlist', function (result) {
        if (result && result.rows.length > 0) {
            var list = result.rows;
            var count = result.rows.length;

            ep.after('finish', count, function () {
                result.imageurl = config.mall.productlistimageurl;
                result.imagestyle = config.mall.productlistimagestyle;
                ep.emit('ok', result);
            });

            try {
                list.forEach(function (item) {
                    item.dataValues.createtime = moment(item.dataValues.createtime).format('YYYY-MM-DD HH:mm:ss');
                    var id = item.orderid;
                    orderitemdb.findAll({
                        where: {orderid: id}
                    }).then(function (reslist) {
                        if (reslist)
                            item.dataValues.items = reslist;
                        else
                            item.dataValues.items = [];
                        ep.emit('finish')
                    }).catch(function (info) {
                        throw new Error(info);
                    })
                })
            } catch (error) {
                logger.error(useraccount, "数据库操作失败");
                ep.emit("error", error);
            };
        } else {
            ep.emit('ok', result);
        }
    });

    var where = '';
    if (state && state != '') {
        state = JSON.parse(state);
        where = {custid: custid, state: {$in: state}};

    } else {
        where = {custid: custid, createtime: {$between: [bt, et]}};
    }

    orderdb.findAndCountAll({
        where: where,
        limit: pagerows,
        offset: (pagenumber - 1) * pagerows,
        order: [
            ['createtime', 'DESC']
        ]
    }).then(function (result) {
        logger.info(useraccount, "获取订单列表成功!");
        ep.emit('getorderlist', result);
    }).catch(function (error) {
        logger.error(useraccount, "数据表mallorder查找失败");
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    });
}


function getOrderByid(arg, cb) {

    var orderid = arg.orderid.trim();
    var orderdb = db.models.mallorder;
    var orderitemdb = db.models.mallorderdetail;
    var adddb = db.models.custaddress;
    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "订单查找成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口cliub/getOrderByid错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    ep.on('getorder', function (result) {
        if (result) {
            orderitemdb.findAll({
                where: {orderid: result.orderid}
            }).then(function (reslist) {
                if (reslist)
                    result.items = reslist;
                else
                    result.items = [];
                ep.emit('ok', result);
            }).catch(function (error) {
                logger.error(useraccount, "数据库操作失败");
                ep.emit("error", error);
            });
        } else {
            ep.emit('ok', null);
        }
    });

    orderdb.findOne({
        where: {orderid: orderid}
    }).then(function (result) {
        logger.info(useraccount, "获取订单列表成功!");
        result = result.get({chain: true});
        result.imageurl = config.mall.productimageurl;
        result.imagestyle = config.mall.productimagestyle;
        ep.emit('getorder', result);
    }).catch(function (error) {
        logger.error(useraccount, "数据表mallorder查找失败");
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    });
}

/**
 * 获取中奖记录
 * @param arg
 * @param cb
 */
function getPrizeRecord(arg, cb) {
    var custid = arg.custid.trim();
    var begtimestr = arg.begtime;
    var endtimestr = arg.endtime;
    endtimestr = moment(endtimestr).add(1, "days").format('YYYY-MM-DD'); //查询结束时间增加1天，解决无法查询当天记录的bug
    var pagenumber = parseInt(arg.pagenumber);
    var pagerows = parseInt(arg.pagerows);

    var lodb = db.models.prolotteryrecord;
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname :arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    var ep = new eventproxy();
    //参数检查
    if (!custid) {
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }

    ep.on('ok', function (result) {
        logger.info(useraccount, "中奖记录查找成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/getPrizeRecord错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    var where = {
        custid: custid,
        rectime: {$between: [begtimestr, endtimestr]},
        lotteryid: {$ne: null},
        mallproducttype: {$ne: 'thanks'}
    };
    //if (entid) where.entid = entid;
    lodb.findAndCountAll({
        where: where,
        limit: pagerows,
        offset: (pagenumber - 1) * pagerows,
        order: [
            ['rectime', 'DESC']
        ]
    }).then(function (result) {
        ep.emit('ok', result);
    }).catch(function (error) {
        logger.error(useraccount, "数据表mallorder查找失败");
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    });
}

function getFocusList(arg, cb) {
    var custid = arg.custid.trim();
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname :arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "获取用户关注列表成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/getFocusList错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    db.sequelize.query('SELECT * FROM v_custfocus WHERE custid = :custid ', {
        replacements: {custid: custid},
        type: sequelize.QueryTypes.SELECT
    }).then(function (result) {
        ep.emit('ok', result);
    }).catch(function (error) {
        logger.error(useraccount, "数据表v_custfocus查找失败");
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    });
}

function beginExchangePoint(arg, cb) {

    var custid = arg.custid;
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname :arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    var point = {
        recid: uuid.v4(),
        custid: custid,
        point: arg.point.trim(),
        outtime: moment().add(1, 'hour').valueOf(),
        recvcustid: '',
        recvtime: null,
        state: 0,
        message: arg.message.trim(),

    };

    //var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;
    var pointdb = db.models.pointexchange;
    var custdb = db.models.custextend;

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "新增积分赠送记录成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/beginExchangePoint错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    ep.on('create', function () {
        pointdb.create(point).then(function (result) {
            ep.emit('ok', result);
        }).catch(function (error) {
            logger.error(useraccount, "新增积分赠送记录失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });
    });


    custdb.findOne({
        where: {custid: point.custid}
    }).then(function (result) {
        if (result && result.point >= point.point) {
            ep.emit('create');
        } else {
            logger.error(useraccount, "用户积分不足");
            cb(returnData.createError(returnData.errorType.account.pointerror, "用户积分不足"));
        }

    }).catch(function (error) {
        logger.error(useraccount, "查询用户信息失败");
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    });
}

function finishPointExchange(arg, cb) {
    var exchangeid = arg.exchangeid.trim();
    var reciveCustId = arg.custid.trim();

    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname :arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    var pointdb = db.models.pointexchange;
    var custdb = db.models.custextend;
    var recdb = db.models.propointdetail;
    var custinfodb = db.models.customer;
    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "新增积分赠送记录成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/beginExchangePoint错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    ep.on('finishchange', function (pointexchangerec) {
        var exrec = pointexchangerec;
        db.sequelize.transaction({
            autocommit: true
        }).then(function (tran) {
            exrec.recvcustid = reciveCustId;
            exrec.recvtime = moment().valueOf();
            exrec.state = 1;

            ep.on('rollback', function (error) {
                tran.rollback();
                ep.emit('error', error);
            });

            ep.on('getcust', function () {
                custinfodb.findOne({
                    where: {custid: pointexchangerec.custid},
                    transaction: tran
                }).then(function (result) {
                    tran.commit();
                    pointexchangerec.dataValues.custname = result.nickname;
                    ep.emit('ok', pointexchangerec);
                }).catch(function (error) {
                    logger.error(useraccount, "禅心用户名称失败");
                    error.errortype = returnData.errorType.dataBaseError.unknow;
                    ep.emit("rollback", error);
                });
            });


            ep.on('createrec2', function () {
                var prec = {
                    detailid: uuid.v4(),
                    custid: reciveCustId,
                    pointchannel: 'pointexchange',
                    point: exrec.point,
                    pointtime: moment().format(config.dateformat),
                    changemode: 'in',
                    remark: '积分赠送记录(接收)'
                };
                recdb.create(prec, {
                    transaction: tran
                }).then(function (result) {
                    ep.emit('getcust');
                }).catch(function (error) {
                    logger.error(useraccount, "新增积分赠送记录(接收)失败");
                    error.errortype = returnData.errorType.dataBaseError.unknow;
                    ep.emit("rollback", error);
                });

            });

            ep.on('createrec1', function () {
                var prec = {
                    detailid: uuid.v4(),
                    custid: exrec.custid,
                    pointchannel: 'pointexchange',
                    point: 0 - exrec.point,
                    pointtime: moment().format(config.dateformat),
                    changemode: 'out',
                    remark: '积分赠送记录(赠予)'
                };
                recdb.create(prec, {
                    transaction: tran
                }).then(function (result) {
                    ep.emit('createrec2', result);
                }).catch(function (error) {
                    logger.error(useraccount, "新增积分赠送记录（赠予）失败");
                    error.errortype = returnData.errorType.dataBaseError.unknow;
                    ep.emit("rollback", error);
                });

            });

            ep.on('editreccustpoint', function () {
                db.sequelize.query("update custextend set point=point+" + exrec.point + " where custid='" + reciveCustId + "'", {
                    transaction: tran
                }).spread(function (result) {
                    ep.emit('createrec1');
                }).catch(function (error) {
                    logger.error(useraccount, "修改接收人积分失败");
                    error.errortype = returnData.errorType.dataBaseError.unknow;
                    ep.emit("rollback", error);
                });
            });

            ep.on('editcustpoint', function () {
                db.sequelize.query("update custextend set point=point-" + exrec.point + " where custid='" + exrec.custid + "'", {
                    transaction: tran
                }).spread(function (result) {
                    ep.emit('editreccustpoint');
                }).catch(function (error) {
                    logger.error(useraccount, "修改赠予人积分失败");
                    error.errortype = returnData.errorType.dataBaseError.unknow;
                    ep.emit("rollback", error);
                });


            });

            pointdb.update(exrec.dataValues, {
                where: {recid: exchangeid},
                transaction: tran
            }).then(function (resExRec) {
                ep.emit('editcustpoint');

            }).catch(function (error) {
                logger.error(useraccount, "修改积分赠送记录失败!");
                error.errortype = returnData.errorType.dataBaseError.unknow;
                ep.emit("rollback", error);
            });

        }).catch(function (error) {
            logger.error(useraccount, "启动事务失败!");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });
    });

    ep.on('checkpoint', function (pointrecord) {
        custdb.findOne({
            where: {custid: pointrecord.custid}
        }).then(function (result) {
            if (result && result.point >= pointrecord.point) {
                ep.emit('finishchange', pointrecord);
            } else {
                logger.error(useraccount, "用户积分不足");
                cb(returnData.createError(returnData.errorType.account.pointerror, "用户积分不足"));
            }

        }).catch(function (error) {
            logger.error(useraccount, "查询用户信息失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });

    });


    pointdb.findOne({
        where: {recid: exchangeid, outtime: {$gt: moment().valueOf()}, state: 0}
    }).then(function (result) {
        if (result) {
            ep.emit('checkpoint', result);
        } else {
            logger.error(useraccount, "积分赠送已失效!");
            cb(returnData.createError(returnData.errorType.club.pointExchangeError, "积分赠送已失效"));
        }
    }).catch(function (error) {
        logger.error(useraccount, "查询积分换购信息失败");
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    });
}

function getWaitEval(arg, cb) {
    var custid = arg.custid.trim();
    var pagenumber = parseInt(arg.pagenumber);
    var pagerows = parseInt(arg.pagerows);

    var orderdb = db.models.mallorder;
    var orderitemdb = db.models.mallorderdetail;
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname :arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    var ep = new eventproxy();
    //参数检查
    if (!custid) {
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }

    ep.on('ok', function (result) {
        logger.info(useraccount, "订单查找成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/getWaitEval错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    ep.on('getorderlist', function (result) {
        if (result && result.rows.length > 0) {
            var list = result.rows;
            var count = result.rows.length;

            ep.after('finish', count, function () {
                ep.emit('ok', result);
            });

            try {
                list.forEach(function (item) {
                    item.dataValues.createtime = moment(item.dataValues.createtim).format('YYYY-MM-DD HH:mm:ss');
                    var id = item.orderid;
                    orderitemdb.findAll({
                        where: {orderid: id}
                    }).then(function (reslist) {
                        if (reslist)
                            item.dataValues.items = reslist;
                        else
                            item.dataValues.items = [];
                        ep.emit('finish')
                    }).catch(function (info) {
                        throw new Error(info);
                    })
                })
            } catch (error) {
                logger.error(useraccount, "数据库操作失败");
                ep.emit("error", error);
            };
        } else {
            ep.emit('ok', result);
        }
    });

    orderdb.findAndCountAll({
        where: {custid: custid, state: {$notIn: [0, 1, 2, 4, 100]}, evalstate: 0,producttype:"product"},
        limit: pagerows,
        offset: (pagenumber - 1) * pagerows,
        order: [
            ['createtime', 'DESC']
        ]
    }).then(function (result) {
        logger.info(useraccount, "获取订单列表成功!");
        ep.emit('getorderlist', result);
    }).catch(function (error) {
        logger.error(useraccount, "数据表mallorder查找失败");
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    });
}

/**
 * 获取用户关注的文章
 * @param arg
 */
function getarticle(arg, cb) {
    var custid = arg.custid.trim();
    var entid = arg.entid;
    var pagenumber = parseInt(arg.pagenumber);
    var pagerows = parseInt(arg.pagerows);

    var foudb = db.models.custfocus;
    var acdb = db.models.article;
    var useraccount = 'sys'; //!!arg.currentuser ? arg.currentuser.nickname : null;
    // if(arg.currentuser && arg.currentuser.roleid==='erathink')
    //     custid = arg.custid.trim();
    // else
    //     custid=!!arg.currentuser.custid ? arg.currentuser.custid : arg.currentuser.userid;

    var ep = new eventproxy();
    //参数检查
    if (!custid) {
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }

    ep.on('ok', function (result) {
        logger.info(useraccount, "订单查找成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/getWaitEval错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    ep.on('getlist', function (entids) {
        var ops = {
            where: {entid: {$in: entids}, state: 1},
            limit: pagerows,
            order: [
                ['publishtime', 'DESC']
            ],
            offset: (pagenumber - 1) * pagerows
        };

        acdb.findAndCountAll(ops).then(function (result) {
            ep.emit('ok', result);
        }).catch(function (error) {
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });


    });


    if (entid && entid != '') {
        var entids = [];
        entids.push(entid);
        ep.emit('getlist', entids);

    } else {
        foudb.findAll({
            where: {custid: custid, state: 'on'}
        }).then(function (result) {
            var entids = [];
            if (result && result.length > 0) {
                result.forEach(function (f) {
                    entids.push(f.entid);
                })
            }
            ep.emit('getlist', entids);
        }).catch(function (error) {
            logger.error(useraccount, "数据表custfocus查找失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });
    }
}

/**
 * 创建文章
 * @param arg
 * @param cb
 */
function createAritle(arg, cb) {
    //var custid = arg.custid.trim();
    var artinput = arg.article;
    var article = JSON.parse(artinput);

    article.createtime = moment().valueOf();
    article.state = 0;
    article.recivetype = 0;
    article.outtime = moment().valueOf();
    article.publishtime = moment().valueOf();
    var entid = !!arg.currentuser.entid ? arg.currentuser.entid : '';
    article.entid = entid;

    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;
    var acdb = db.models.article;

    var ep = new eventproxy();
    ep.on('ok', function (result) {
        logger.info(useraccount, "文章创建成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/createAritle错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    if (article.artid && article.artid != '') {
        acdb.findOne({
            where: {artid: article.artid}
        }).then(function (result) {
            if (result) {
                article.createtime = result.createtime;
                article.state = 0;
                acdb.update(article, {
                    where: {artid: article.artid}
                }).then(function (r2) {
                    ep.emit('ok', r2);
                }).catch(function (error2) {
                    ep.emit("error", error2);
                })
            } else {
                cb(returnData.createError(returnData.errorType.dataBaseError.notfind, "未找到待修改文章!"));
            }
        }).catch(function (error) {
            ep.emit("error", error);
        });

    } else {
        article.artid = uuid.v4();
        acdb.create(article).then(function (result) {
            ep.emit('ok', result);
        }).catch(function (error) {
            ep.emit("error", error);
        });
    }
}

/**
 * 获取置顶文章
 * @param arg
 * @param cb
 */
function gettoparticle(arg, cb) {

    var limit = arg.limit;
    limit = tool.getInt(limit);

    var acdb = db.models.article;
    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "获取置顶新闻成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/gettoparticle错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    acdb.findAll({
        where: {istop: 1, state: 1},
        limit: limit,
        attributes: {exclude: ['content']},
        order: [
            ['publishtime', 'DESC']
        ]
    }).then(function (result) {
        ep.emit('ok', result);
    }).catch(function (error) {
        ep.emit("error", error);
    });
}

function getarticlebyentid(arg, cb) {
    var entid = arg.entid;
    var pagenumber = parseInt(arg.pagenumber);
    var pagerows = parseInt(arg.pagerows);
    var key = arg.key;
    var begtime = arg.begtime;
    var endtime = arg.endtime;
    var state = arg.state;


    var acdb = db.models.article;
    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;


    if (!arg.currentuser.entid)
        entid = arg.entid.trim();
    else {
        entid = arg.currentuser.entid;
    }

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "文章列表查找成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/getWaitEval错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    var ops = {
        attributes: {exclude: ['content']},
        where: {entid: entid, state: {$ne: '2'}},
        limit: pagerows,
        offset: (pagenumber - 1) * pagerows,
        order: [
            ['publishtime', 'DESC']
        ]
    };

    if (key && key != '') {
        ops.where['title'] = {$like: '%' + key + '%'}
    }

    if (begtime && begtime != '') {
        begtime = moment(begtime).valueOf();
        endtime = moment(endtime).add(1, 'd').valueOf();
        ops.where['createtime'] = {$between: [begtime, endtime]}
    }

    if (state && state != '') {
        ops.where['state'] = state;
    };

    acdb.findAndCountAll(ops).then(function (result) {
        ep.emit('ok', result);
    }).catch(function (error) {
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    });
}

function delarticle(arg, cb) {

    var id = arg.artid;
    var acdb = db.models.article;
    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info(useraccount, "获取置顶新闻成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/gettoparticle错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    acdb.update({state: 2}, {
        where: {artid: id}
    }).then(function (result) {
        ep.emit('ok', result);
    }).catch(function (error) {
        ep.emit("error", error);
    });
}

function getarticlebyid(arg, cb) {

    var id = arg.artid;
    var acdb = db.models.article;
    var ep = new eventproxy();
    var useraccount = 'sys';
    ep.on('ok', function (result) {
        logger.info(useraccount, "获取新闻成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/getarticlebyid错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    acdb.findOne({
        where: {artid: id}
    }).then(function (result) {
        ep.emit('ok', result);
    }).catch(function (error) {
        ep.emit("error", error);
    });
}

function changefocusstate(arg, cb) {

    var id = arg.id;
    var state = arg.state;

    var acdb = db.models.custfocus;
    var ep = new eventproxy();

    var useraccount = 'sys';

    ep.on('ok', function (result) {
        logger.info(useraccount, "修改关注状态成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/changefocusstate错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    acdb.update({state: state}, {
        where: {fid: id}
    }).then(function (result) {
        ep.emit('ok', result);
    }).catch(function (error) {
        ep.emit("error", error);
    });
}

function getlotteryrecord(arg, cb) {

    var pagenumber = parseInt(arg.pagenumber);
    var pagerows = parseInt(arg.pagerows);
    var only = arg.only;

    var ep = new eventproxy();

    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname :arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();


    var sql = "select * from v_sacnrecord_dis where custid='" + custid + "' order by rectime desc limit " + (pagenumber - 1) * pagerows + "," + pagerows;

    if (only) {
        sql = "select * from prolotteryrecord where custid='" + custid + "' and price>0  order by rectime desc limit " + (pagenumber - 1) * pagerows + "," + pagerows;

    }

    ep.on('ok', function (result) {
        logger.info(useraccount, "获取扫码记录成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/getlotteryrecord错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    db.sequelize.query(sql, {type: sequelize.QueryTypes.SELECT}).then(function (result) {
        ep.emit('ok', result);
    }).catch(function (error) {
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    });
}

function sendsms(arg, cb) {
    var phone = arg.phone;
    var qrcode = sms.sendsms(phone);
    cb(null, returnData.createData(qrcode));
}

function sendSetPhoneSms(arg, cb) {
    var phone = arg.phone;
    var qrcode = sms.sendSetInfosms(phone, '电话号码');
    cb(null, returnData.createData(qrcode));
}

function getAdList(arg, cb) {
    var adtype = arg.adtype;
    var state = arg.state;
    var now = moment().format('YYYYMMDD');
    now = moment(now, 'YYYYMMDD').valueOf();

    var sql = "select * from v_advertisement where endtime>=" + now + "  and adtype='" + adtype + "' order by begtime";
    if (state != null && state != '')
        sql = "select * from v_advertisement where state=" + state + " and begtime<=" + now + " and endtime>=" + now + " and adtype='" + adtype + "' order by begtime";

    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info('sys', "获取广告列表成功");
        // logger.info('sys', result);
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error('sys', "接口club/getAdList错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    db.sequelize.query(sql, {type: sequelize.QueryTypes.SELECT}).then(function (result) {
        // logger.info('sys', result);
        logger.info('sys', now);
        ep.emit('ok', result);
    }).catch(function (error) {
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    });
}


function delAdItem(arg, cb) {
    var adid = arg.adid;

    var addb = db.models.advertisement;
    var ep = new eventproxy();

    ep.on('ok', function (result) {
        logger.info('sys', "删除广告成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error('sys', "接口club/delAdItem错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    addb.destroy({
        where: {adid: adid}
    }).then(function (result) {
        ep.emit("ok", result);
    }).catch(function (error) {
        ep.emit("error", error);
    });
}

function addAdItem(arg, cb) {
    var adtype = arg.adtype;
    var artid = arg.artid;
    var begtime = arg.begtime;
    var endtime = arg.endtime;

    var addb = db.models.advertisement;
    var ep = new eventproxy();

    ep.on('ok', function (result) {
        //logger.info(useraccount, "新增广告成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        //logger.error(useraccount, "接口club/addAdItem错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    ep.on("update", function (dbinfo) {
        addb.update({begtime: begtime, endtime: endtime}, {
            where: {adid: dbinfo.adid}
        }).then(function (result) {
            ep.emit('ok', result);
        }).catch(function (error) {
            ep.emit("error", error);
        });
    });

    ep.on("new", function () {
        var ad = {
            adid: uuid.v4(),
            artid: artid,
            begtime: begtime,
            endtime: endtime,
            adtype: adtype
        };
        addb.create(ad).then(function (result) {
            ep.emit('ok', result);
        }).catch(function (error) {
            ep.emit("error", error);
        });
    });

    addb.findOne({
        where: {artid: artid, adtype: adtype}
    }).then(function (result) {
        if (result) {
            ep.emit("update", result);
        } else {
            ep.emit("new");
        }
    }).catch(function (error) {
        ep.emit("error", error);
    });
}

function publishAritle(arg, cb) {
    //var custid = arg.custid.trim();
    var articleid = arg.artid;

    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;
    var acdb = db.models.article;

    var ep = new eventproxy();
    ep.on('ok', function (result) {
        logger.info(useraccount, "文章发布成功!");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/publishAritle错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    if (articleid && articleid != '') {
        acdb.findOne({
            where: {artid: articleid}
        }).then(function (result) {
            if (result) {
                var article = result;

                article.state = 1;
                acdb.update(article.dataValues, {
                    where: {artid: article.artid}
                }).then(function (r2) {
                    ep.emit('ok', article.dataValues);
                }).catch(function (error2) {
                    ep.emit("error", error2);
                })

            } else {
                cb(returnData.createError(returnData.errorType.dataBaseError.notfind, "未找到待发布文章!"));
            }
        }).catch(function (error) {
            ep.emit("error", error);
        });

    } else {
        cb(returnData.createError(returnData.errorType.dataBaseError.notfind, "未找到待发布文章!"));
    }
}

function getselfqoupon(arg, cb) {
    var page = arg.page || 1,
        size = arg.size || 10;
    page = tool.getInt(page);
    size = tool.getInt(size);
    var ep = new eventproxy();

    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname :arg.currentuser.useraccount;
    var custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    var sql = "SELECT mallproduct.*," +
        "qoupon.qouponid," +
        "qoupon.createdate," +
        "qoupon.`owner`," +
        "qoupon.usedate," +
        "qoupon.state " +
        "FROM qoupon JOIN mallproduct ON qoupon.productid = mallproduct.productid " +
        "where qoupon.owner='" + custid + "' and qoupon.state='normal' order by qoupon.createdate desc limit " + (page - 1) * size + "," + size;

    ep.on('ok', function (result) {
        logger.info(useraccount, "查询个人优惠券列表成功!");
        var data = {};
        data.page = page;
        data.size = size;
        data.result = result;
        cb(null, returnData.createData(data));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/getselfqoupon错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    db.sequelize.query(sql, {type: sequelize.QueryTypes.SELECT}).then(function (result) {
        ep.emit('ok', result);
    }).catch(function (error) {
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    });

}

function getselfqouponrecord(arg, cb) {

    var custid = '';
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname :arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    var begtime = arg.begtime;
    var endtime = arg.endtime;
    var usetype = arg.usetype;


    var ep = new eventproxy();
    var useraccount = !!arg.currentuser ? arg.currentuser.nickname : null;

    ep.on('ok', function (result) {
        logger.info(useraccount, "获取礼券使用记录成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口getqouponrecord错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    var sequelize = db.sequelize;

    var sql = "select  qouponrecord.*," +
        "customer.nickname," +
        "customer.country," +
        "customer.province," +
        "customer.city," +
        "customer_alias1.nickname AS recivername, " +
        "qoupon.productid," +
        "mallproduct.productname," +
        "mallproduct.productimage " +
        "FROM qouponrecord JOIN customer ON qouponrecord.`user` = customer.custid " +
        "JOIN qoupon on qoupon.qouponid=qouponrecord.qouponid " +
        "JOIN mallproduct on mallproduct.productid = qoupon.productid " +
        "left JOIN customer AS customer_alias1 ON qouponrecord.reciver = customer_alias1.custid " +
        " where (qouponrecord.user='" + custid + "' or qouponrecord.reciver='" + custid + "')";

    var whereCondition = '';
    if (begtime) {
        var begMoment = moment(begtime);
        if (begMoment.isValid()) {
            whereCondition += ' and qouponrecord.usetime >= ' + begMoment.format('x');
        }
    }

    if (endtime) {
        var endMoment = moment(endtime);
        if (endMoment.isValid()) {
            var _endtime = parseInt(endMoment.format('x')) + 24*60*60*1000-1
            whereCondition += ' and qouponrecord.usetime <= ' + _endtime;
        }
    }

    if (usetype) {
        whereCondition += " and qouponrecord.usetype = '" + usetype + "'";
    }

    var page = tool.getInt(arg.page);
    var size = tool.getInt(arg.size);
    var begindex = size * (page - 1);

    var orderCondition = ' order by qouponrecord.usetime desc limit ' + begindex + ',' + size;

    sql += whereCondition;
    sql += orderCondition;

    ep.on('getsum', function (datalist) {
        var sumsql = "select count(1) as con,sum(price) as price,sum(cost) as cost from qouponrecord where  (qouponrecord.user='" + custid + "' or qouponrecord.reciver='" + custid + "') ";
        sumsql = sumsql + whereCondition;
        sequelize.query(sumsql, {
            type: 'SELECT'
        }).then(function (data) {
            var resdata = {
                count: data[0].con,
                price: data[0].price,
                cost: data[0].cost,
                items: datalist
            };
            ep.emit('ok', resdata);
        }).catch(function (error) {
            logger.error(error);
            ep.emit('error', error);
        });

    });

    sequelize.query(sql, {
        type: 'SELECT'
    }).then(function (data) {
        ep.emit('getsum', data);
    }).catch(function (error) {
        logger.error(error);
        ep.emit('error', error);
    });

}

function getselfcashcoupon(arg, cb) {
    var page = arg.page || 1,
        size = arg.size || 10;

    page = tool.getInt(page);
    size = tool.getInt(size);

    var ep = new eventproxy();

    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname :arg.currentuser.useraccount;
    var custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    //resolved          
    ep.on('ok', function (res) {
        logger.info(useraccount, "查询个人优惠券列表成功!");
        var data = {
            page: page,
            size: size,
            count: res.count,
            rows: res.rows
        };
        cb(null, returnData.createData(data));
    });
    //rejected
    ep.on("error", function (error) {
        logger.error(useraccount, "接口club/getselfcashcoupon错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });

    //TODO
    var cpdb = db.models.cashcoupon;
    cpdb.findAndCountAll({
        where: {
            owner: custid,
            state: 'used',
        },
        offset: cpdb.pageOffset(page, size),
        limit: size,
        order: [
            ['usedate', 'DESC']
        ],
        include: {
            model: db.models.mallproduct,
            required: true
        }
    }).then(function (res) {
        ep.emit('ok', res);
    }).catch(function (error) {
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    });
}

function deletecashcoupon(arg, cb) {
    var couponid = arg.couponid;

    var custid = '';
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname :arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    var coupondb = db.models.cashcoupon;
    var ep = new eventproxy();

    ep.on('ok', function (res) {
        cb(null, returnData.createData(res));
    });

    ep.on('error', function (error) {
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, '数据库错误'));
    });

    ep.on('update', function (dbinfo) {
        coupondb.update(
            {state: 'delete'},
            {where: {couponid: dbinfo.couponid}}
        ).then(function (res) {
            ep.emit('ok', res);
        }).catch(function (error) {
            ep.emit('error', error);
        })
    })

    coupondb.findOne({
        where: {couponid: couponid, owner: custid}
    }).then(function (res) {
        if (!!res) {
            ep.emit('update', res);
        } else {
            ep.emit('error', '优惠券不属于该用户')
        }
    }).catch(function (error) {
        ep.emit('error', error);
    })
}

function custsign(arg,cb){
    var custid = '';
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname :arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    var getpoint = 1;
    var ep = new eventproxy();
    var signdb = db.models.singrecord;
    var custdb = db.models.custextend;
    var pointdb = db.models.propointdetail;

    var custpintinfo = null;

    ep.on('ok', function (res) {
        cb(null, returnData.createData(res));
    });

    ep.on('error', function (error) {
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, '数据库错误'));
    });

    ep.on('getinfo', function () {
        if (custpintinfo) {
            var countsql = 'select count(1) as cnumber from custextend where point>=' + custpintinfo.point;
            db.sequelize.query(countsql).then(function (result1) {
                var res = {
                    point: custpintinfo.point,
                    getpoint: getpoint,
                    order: result1[0][0].cnumber || 1
                };
                ep.emit('ok', res);
            }).catch(function (error) {
                ep.emit('error', error);
            });
        } else {
            cb(returnData.createError(returnData.errorType.dataBaseError.unknow, '找不到用户信息!'));
        }
    });

    ep.on('getsignpoint', function () {
        db.sequelize.transaction({
            autocommit: true
        }).then(function (tran) {
            ep.on('rollback', function (error, errcode, errmsg) {
                tran.rollback();
                if (error) {
                    logger.error(useraccount, "接口custsign错误", error);
                    ep.emit('error', error);
                } else {
                    logger.error(useraccount, errmsg);
                    cb(returnData.createError(errcode, errmsg));
                }

            });

            ep.on('savesignrec', function () {
                var rec = {
                    signid: uuid.v4(),
                    custid: custid,
                    signdate: moment().format('YYYY-MM-DD'),
                    point: getpoint
                };
                signdb.create(rec, {
                    transaction: tran
                }).then(function () {
                    tran.commit();
                    ep.emit('getinfo');
                }).catch(function (error) {
                    ep.emit('rollback', error);
                });
            });

            ep.on('savepointrec', function () {
                var rec = {
                    detailid: uuid.v4(),
                    custid: custid,
                    pointchannel: 'sign',
                    point: getpoint,
                    pointtime: moment().format(config.dateformat),
                    changemode: 'sign',
                    remark: '签到送积分'
                };
                pointdb.create(rec, {
                    transaction: tran
                }).then(function () {
                    ep.emit('savesignrec');
                }).catch(function (error) {
                    ep.emit('rollback', error);
                });
            });

            var updateExtendsql = 'UPDATE custextend set point = point + ' + getpoint + ' where custid = \'' + custid + '\'';
            db.sequelize.query(updateExtendsql, {transaction: tran}).spread(function (results, metadata) {
                custpintinfo.point=custpintinfo.point+getpoint;
                ep.emit('savepointrec');
            }).catch(function (error) {
                ep.emit('rollback', returnData.errorType.dataBaseError.unknow, error.message);
            });

        }).catch(function (error) {
            ep.emit('error', error);
        });

    });

    ep.on('getsign', function () {
        signdb.findOne({
            where: {custid: custid, signdate: moment().format('YYYY-MM-DD')}
        }).then(function (result) {
            if (result) {
                ep.emit('getinfo');
            } else {
                ep.emit('getsignpoint');
            }
        }).catch(function (error) {
            ep.emit('error', error);
        });

    });

    custdb.findOne({
        where: {custid: custid}
    }).then(function (result) {
        custpintinfo = result.dataValues;
        ep.emit('getsign');
    }).catch(function (error) {
        ep.emit('error', error);
    });
}

/**
 * 
 * 设置预定通知开启与否
 * 
 * @param isEnable
 * 0:未启用，1:启用
 * 
 */
function updateFavoritesNotify(arg, cb) {
    
    if (!arg.currentuser.custid) {
		cb(returnData.createError(returnData.errorType.refuse), null)
		return;
	}

	var isEnable = arg.isEnable || 0;
	var custid = arg.currentuser.custid;
	var custdb = db.models.custextend;
	custdb.update({
		favoritesnotify: arg.isEnable
	}, {
		where: {
			custid: custid
		}
	}).then(function (res) {
		cb(null, true);
	}).catch(function (err) {
		cb(returnData.createError('databaseError', "数据库错误"));
	})
}

function applyJoin(arg,cb){
    
	var targetAccount = config.applyEmail;
    
	var userinfo = {};
	userinfo.name = arg.name;
    userinfo.sex = arg.sex;
    userinfo.phone= arg.phone;
	userinfo.email = arg.email;
	userinfo.method = arg.method;
	userinfo.city = arg.city;

    mail.sendApplyJoinMail(targetAccount, userinfo);
    
    cb(null, returnData.createData(true));
}

module.exports = {
    getPointRecord: getPointRecord,
    getCustInfo: getCustInfo,
    getPointRanking: getPointRanking,
    getOrderList: getOrderList,
    getPrizeRecord: getPrizeRecord,
    getOrderByid: getOrderByid,
    getFocusList: getFocusList,
    beginExchangePoint: beginExchangePoint,
    finishPointExchange: finishPointExchange,
    getWaitEval: getWaitEval,
    getarticle: getarticle,
    createAritle: createAritle,
    gettoparticle: gettoparticle,
    getarticlebyentid: getarticlebyentid,
    delarticle: delarticle,
    getarticlebyid: getarticlebyid,
    changefocusstate: changefocusstate,
    getlotteryrecord: getlotteryrecord,
    sendsms: sendsms,
    getAdList: getAdList,
    addAdItem: addAdItem,
    delAdItem: delAdItem,
    publishAritle: publishAritle,
    sendSetPhoneSms: sendSetPhoneSms,
    getselfqoupon: getselfqoupon,
    getselfqouponrecord: getselfqouponrecord,
    getselfcashcoupon: getselfcashcoupon,
    deletecashcoupon: deletecashcoupon,
    custsign: custsign,
    updateFavoritesNotify:updateFavoritesNotify,
    applyJoin:applyJoin
};