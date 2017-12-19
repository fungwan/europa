/**
 * Created by root on 15-11-30.
 */
var db = require('../common/db');
//加载第三方库
var eventproxy = require('eventproxy');
var sequelize = require('sequelize');
var moment = require('moment');
var multiline = require('multiline');

//加载自定义库
var returnData = require('../common/returnData');
var vo = require('../models/vomodels');
var logger = require('../common/logger');
var config = require('../../config');
var tool = require('../common/tool');
var Q = require("q");


/**
 * 获取奖项列表
 * @param arg
 * @param callback
 */
exports.lotterylist = function (arg, callback) {
    logger.info(arg.currentuser.useraccount, '******开始获取奖项列表!******');
    var lotterydb = db.models.prolottery;
    lotterydb.findAll({
        attributes: ['name', 'price'],
        where: { projectid: { $in: arg.projectid } },
        group: 'name,price',
        order: 'price desc'
    }).then(function (data) {
        if (data) {
            logger.info(arg.currentuser.useraccount, '******完成获取奖项列表!******' + data);
            callback(null, returnData.createData(data));
        } else {
            logger.error(arg.currentuser.useraccount, '******获取奖项列表时出错!******');
            callback(returnData.createError(returnData.errorType.notexist, "未找到奖项数据"), null);
        }
    }).catch(function (err) {
        logger.error(arg.currentuser.useraccount, err.message);
        callback(returnData.createError(returnData.errorType.unknow, err.message), null);
    })
}

exports.projprogress = function (arg, callback) {

    var _method = arg.method;

    var dateCondition = ''

    dateCondition = ' and rectime BETWEEN \'' + arg.begtime + '\' and \'' + arg.endtime + '\'';

    //获取活动参与的省份
    function getProvince() {

        var d = Q.defer();
        /*
         *
         * SELECT code,name from
         cities as t1
         RIGHT JOIN
         (SELECT DISTINCT LEFT(areacode,2) as areacode
         from v_scanrecord
         WHERE
         areacode != '' and entid ='dsds' and YEAR(rectime) = '2016') as t2
         ON
         t1.code = t2.areacode
         *
         * */

        var sql = "SELECT code,name from cities as t1 RIGHT JOIN (SELECT DISTINCT LEFT(areacode,2) as xcode";
        sql += " from v_scanrecord WHERE areacode != '' and entid = '" + arg.currentuser.entid + "'";
        sql += " and projectid = '" + arg.projectid + "'" + dateCondition + ") as t2 ON t1.code = t2.xcode";

        db.sequelize.query(sql, { type: db.sequelize.QueryTypes.SELECT })
            .then(function (provinces) {
                d.resolve(provinces);
            }).catch(function (err) {
                d.reject(err);
            });

        return d.promise;
    }

    function getInfo(data) {
        var d = Q.defer();
        var provincelist = data;
        if (0 === provincelist.length) {
            var emptyArray = [];
            d.resolve(emptyArray);
            return d.promise;
        }
        //获取去重后的活动
        var t = ' (SELECT * from v_scanrecord WHERE rectime in (SELECT MAX(rectime) from v_scanrecord GROUP BY projectid,custid,recid)) as t';
        var row2col = '';
        for (var i = 0; i < provincelist.length; ++i) {
            var ele = provincelist[i];
            row2col += "sum(CASE when (LEFT(areacode,2))= '" + ele.code + "'" + "then 1 else 0 end) as '" + ele.name + "',";
        }
        row2col = row2col.substr(0, row2col.length - 1);

        var ploydate = '';
        switch (_method) {
            case 'y':
                ploydate = "DATE_FORMAT(rectime,'%Y') as date ";
                break;
            case 'm':
                ploydate = "DATE_FORMAT(rectime,'%Y-%m') date ";
                break;
            case 'd':
                ploydate = "DATE_FORMAT(rectime,'%Y-%m-%d') date ";
                break;
            case 'q':
                ploydate = "CONCAT(YEAR(rectime),'-',quarter(rectime)) as date ";
                break;
            default:
                d.reject('unkonwn ploy method');
                return d.promise;
        }

        var sql = "select " + ploydate + ',' + row2col + ' from' + t + " WHERE areacode != '' and entid = '" + arg.currentuser.entid + "' and projectid = '" + arg.projectid + "'";
        sql += dateCondition + " group by date";

        db.sequelize.query(sql, { type: db.sequelize.QueryTypes.SELECT })
            .then(function (results) {
                d.resolve(results);
            }).catch(function (err) {
                d.reject(err);
            });

        return d.promise;
    }

    getProvince().then(getInfo).then(function (data) {
        callback(null, returnData.createData(data));
    }).catch(function (err) {
        callback(returnData.createError(returnData.errorType.unknow, err.message), null);
    });

}

exports.projeffect = function (arg, callback) {

    var _projectid = arg.projectid;

    var dateCondition = ''

    var dateCondition = ''

    dateCondition = ' and rectime BETWEEN \'' + arg.begtime + '\' and \'' + arg.endtime + '\'';

    var t = ' (SELECT * from v_scanrecord WHERE rectime in (SELECT MAX(rectime) from v_scanrecord GROUP BY projectid,custid,recid)) as t';
    /*SELECT t1.*,t2.name
    FROM
    (SELECT count(recid) as jcounts,(LEFT(areacode,2)) as bm FROM
    v_scanrecord
    WHERE YEAR(rectime) = '2016'
    and areacode != ''
    GROUP BY bm) as t1
    LEFT JOIN
    cities as t2
    ON
    bm = code*/

    var sql = "SELECT t1.*,t2.name FROM (SELECT count(recid) as scancounts,(LEFT(areacode,2)) as codevalue FROM " + t;
    sql += " where areacode != '' and projectid = '" + _projectid + "'and entid = '" + arg.currentuser.entid + "'" + dateCondition;
    sql += " GROUP BY codevalue) as t1 LEFT JOIN cities as t2 ON codevalue = code";

    db.sequelize.query(sql, { type: db.sequelize.QueryTypes.SELECT })
        .then(function (results) {
            callback(null, returnData.createData(results));
        }).catch(function (err) {
            callback(returnData.createError(returnData.errorType.unknow, err.message), null);
        });
}
/**
 * 获取红包活动进度
 * @param arg 参数{id:活动Id}
 * @param cb 返回值{id:活动Id,dataprogress:时间进度,lotteryprogress:抽奖进度,state:活动状态,lotterynum中奖数量，lotterymoney中奖金额，lotterymem中奖人数}
 */
function rqprogress(arg, cb) {
    logger.info(arg.currentuser.useraccount, "*开始获取红包活动进度信息分析");
    //state=project.state  活动状态取表project的state字段值
    //dataprogress=(now - project.begdate)/(project.enddate-project.begdate)  时间进度=(当前时间-开始时间）/(结束时间-开始时间)
    //lotteryprogress= 当前已抽奖数量/二维码生成数量
    var
        page = arg.page || 1,
        size = arg.size || 10;
    var lotterynum = 0,
        lotterymem = 0,
        lotterymoney = 0;
    var query = arg.query;
    if (!query)
        query = {};
    query.projectid = arg.id;
    var projectdb = db.models.project;
    var qrrecdb = db.models.prolotteryrecord;
    var proxy = new eventproxy();
    //错误处理err
    proxy.on("err", function (err) {
        logger.error(arg.currentuser.useraccount, '******获取中奖信息时出错!******');
        cb(returnData.createError(returnData.errorType.unknow, err.message), null);
    });
    //未找到数据
    proxy.on("nodata", function () {
        logger.error(arg.currentuser.useraccount, '******未找到数据!******');
        cb(returnData.createError(returnData.errorType.notexist, "未找到数据!"), null);
    });
    proxy.on('getcustnum', function (project) {
        qrrecdb.findAll({
            where: query,
            attributes: [
                'custid'
            ],
            group: 'custid'
        }).then(function (data) {
            if (data) {
                lotterymem = data.length;
                proxy.emit('getres', project);
            } else {
                proxy.emit('nodata');
            }
        }).catch(function (err) {
            proxy.emit('err', err);
        })
    })
    proxy.on('getrec', function (project) {
        qrrecdb.findAll({
            where: query,
            attributes: [
                'projectid',
                [db.sequelize.fn('COUNT', db.sequelize.col('recid')), 'lotterynum'],
                [db.sequelize.fn('SUM', db.sequelize.col('price')), 'lotterymoney']
            ],
            group: 'projectid'
        }).then(function (data) {
            if (data) {
                data = data[0].get({ chain: true });
                lotterymoney = data.lotterymoney;
                lotterynum = data.lotterynum;
                proxy.emit('getcustnum', project);
            } else {
                proxy.emit('nodata');
            }
        }).catch(function (err) {
            proxy.emit('err', err);
        })
    })
    proxy.on('getres', function (project) {
        var state = project.state;
        var dateprogress = 100 * (moment(tool.date()).diff(moment(project.begdate))) / (moment(project.enddate).diff(moment(project.begdate)));
        var lotteryprogress = 100 * lotterynum / project.qramounts;
        var res = {
            id: arg.id,//活动ID
            dateprogress: dateprogress,
            lotteryprogress: lotteryprogress,
            state: state,
            lotterynum: lotterynum,
            lotterymem: lotterymem,
            lotterymoney: lotterymoney
        }
        cb(null, returnData.createData(res));
    });
    projectdb.findOne({
        where: query
    }).then(function (project) {
        if (project) {
            if (moment(tool.date()).diff(moment(project.enddate)) > 0) {
                logger.error(arg.currentuser.useraccount, "活动日期错误");
                cb(returnData.createError("活动日期错误"), null);
            } else if (moment(tool.date()).diff(moment(project.begdate)) < 0) {
                logger.error(arg.currentuser.useraccount, "活动日期错误");
                cb(returnData.createError("活动日期错误"), null);
            } else if (project.type !== 'redpacket') {
                logger.error(arg.currentuser.useraccount, '******未找到红包数据!******');
                cb(returnData.createError("该活动不是红包活动!"), null);
            } else {
                proxy.emit('getrec', project);
            }
        } else {
            logger.error(arg.currentuser.useraccount, "活动不存在");
            cb(returnData.createError(returnData.errorType.notexist), null);
        }
    }).catch(function (err) {
        logger.error(arg.currentuser.useraccount, err.message);
        cb(returnData.createError(returnData.errorType.unknow), null);
    });
};

/**
 * 获取中奖情况分析信息
 * @param arg 参数{id:活动,areacode:区域,begtime:开始时间,endtime:结束时间}
 * @param cb 返回值
 * {id:活动Id,
 * recnumber:中奖数量,
 * recmoney:中奖金额,
 * recmember:中奖人数,
 * info:[
 *      {lotteryid:奖项编号,
 *      lotteryname:奖项名称,
 *      recnumber:中奖数量,
 *      recmoney:种奖金额
 *      }
 *      ]
 * }
 */
function lotteryanalyinfo(arg, cb) {
    arg.endtime = tool.queryenddate(arg.endtime);
    logger.info(arg.currentuser.useraccount, "*开始获取中奖进度信息分析");
    //中奖数量 recnumber=prolotteryrecord表中满足条件的记录总数
    //中奖金额 recmoney=prolotteryrecord表中满足条件的中奖金额合计（即sum(money)）
    //中奖人数 recmember=prolotteryrecord表中满足条件的客户数量（即按cusid分组后统计custid数量）
    //info 按lotteryid分组统计，
    var lotteryrecdb = db.models.prolotteryrecord;
    var proxy = new eventproxy;
    var areacode = arg.areacode;
    //var recnumber = 0;
    //var recmember = 0;
    //var recmoney = 0;
    var analydata = {};
    //var projectdb = db.models.project;
    var whereCondition = { "projectid": { $in: arg.id }, "rectime": { $and: [{ $gte: arg.begtime }, { $lte: arg.endtime }] } };
    if (arg.begtime > arg.endtime) {
        cb(returnData.createError(returnData.errorType.paraerror, "开始时间 > 结束时间"));
        logger.error(arg.currentuser.useraccount, "开始时间 > 结束时间");
        return;
    }
    var re = /[0-9]{2,}/g;
    if (areacode && areacode !== "0") {
        if (!re.test(areacode)) {
            cb(returnData.createError(returnData.errorType.paraerror), null);
            logger.error(arg.currentuser.useraccount, "areacode参数错误");
            return;
        } else {
            whereCondition.areacode = { '$like': arg.areacode + '%' };
        }
    };
    //if(areacode==="0"){
    //    areacode="";
    //    whereCondition.areacode = {'$like': arg.areacode + '%'};
    //}

    //错误处理err
    proxy.on("err", function (err) {
        logger.error(arg.currentuser.useraccount, '******获取中奖信息时出错!******');
        cb(returnData.createError(returnData.errorType.unknow, err.message), null);
    });
    //未找到数据
    proxy.on("nodata", function () {
        logger.error(arg.currentuser.useraccount, '******未找到数据!******');
        cb(returnData.createError(returnData.errorType.notexist, "未找到数据!"), null);
    });

    //获取中奖信息
    proxy.on('getlottery', function () {
        lotteryrecdb.findAll({
            where: whereCondition,
            attributes: [
                'price',
                'lotteryname',
                [db.sequelize.fn('COUNT', db.sequelize.col('recid')), 'recnumber'],
                [db.sequelize.fn('SUM', db.sequelize.col('price')), 'recmoney']
            ],
            group: 'price,lotteryname'
        }).then(function (result) {
            if (result) {
                logger.info("", "获取中奖红包记录：" + result);
                analydata.lotteryanaly = result;//.get({chain:true});
                cb(null, returnData.createData(analydata));
            }
            else {
                proxy.emit('nodata');
            }
        }).catch(function (err) {
            proxy.emit('err', err);
        });
    });

    //获取奖项设置信息
    proxy.on('getlotteryinfo', function (proid) {
        var lottdb = db.models.prolottery;
        lottdb.findAll({
            where: { projectid: proid }
        }).then(function (data) {
            analydata.lotteryinfo = data;//.get({chain:true});
            proxy.emit('getlottery');
        }).catch(function (err) {
            proxy.emit('err', err);
        });
    });

    proxy.emit('getlotteryinfo', arg.id);
};
/**
 * 获取中奖区域分析信息
 * @param arg 参数{id:活动,areacode:区域,begtime:开始时间,endtime:结束时间,lotteryid:奖项编号（空表示全部）}
 * @param cb 返回值
 * {id:活动Id,
 * info:[
 *      {areacode:区域编号,
 *      areaname:区域名称,
 *      recnumber:中奖数量,
 *      recmoney:种奖金额,
 *      detail:[
 *             {lotteryid:奖项编号,
 *              lotteryname:奖项名称,
 *              recnumber:中奖数量,
 *              recmoney:种奖金额
 *             }]
 *       }]
 * }
 */
function lotteryarea(arg, cb) {

    arg.endtime = tool.queryenddate(arg.endtime);
    logger.info(arg.currentuser.useraccount, "*开始获取中奖区域信息分析");
    var lotteryrecdb = db.models.prolotteryrecord;
    var recnumber = 0;
    var recmoney = 0;
    var lotteryid = arg.lotteryid || '';
    var areacode = arg.areacode;
    var analydata = {};
    analydata.id = arg.id;

    if (arg.begtime > arg.endtime) {
        cb(returnData.createError(returnData.errorType.paraerror, "开始时间 > 结束时间"));
        logger.error(arg.currentuser.useraccount, "开始时间 > 结束时间");
        return;
    }
    var whereCondition = { "projectid": { $in: arg.id }, "rectime": { $and: [{ $gte: arg.begtime }, { $lte: arg.endtime }] } };
    var re = /[0-9]{2,}/g;
    if (areacode && areacode !== "0") {
        if (re.test(areacode)) {
            whereCondition.areacode = { '$like': areacode + '%' };
        }
        else {
            cb(returnData.createError(returnData.errorType.paraerror), null);
            logger.error(arg.currentuser.useraccount, "areacode参数错误");
            return;
        }
    };
    if (areacode === "0") {
        areacode = "";
        whereCondition.areacode = { '$like': areacode + '%' };
    }
    //if (lotteryid) {
    //    if(tool.verifier.isUUID(lotteryid)) {
    //        whereCondition.lotteryid=lotteryid;
    //    }else {
    //        cb(returnData.createError(returnData.errorType.paraerror),null);
    //        return;
    //    }
    //}
    if (arg.lotteryname) {
        whereCondition.lotteryname = arg.lotteryname;
    };
    if (arg.lotteryprice) {
        whereCondition.price = arg.lotteryprice;
    };
    var proxy = new eventproxy();
    //错误处理err
    proxy.on("err", function (err) {
        logger.error(arg.currentuser.useraccount, '******获取获取中奖信息时出错!******');
        cb(returnData.createError(returnData.errorType.unknow, err.message), null);
    });
    //获取中奖信息
    proxy.on('getlottery', function () {
        var groupkey = 'province';
        var areacodelen = 2;
        if (areacode && areacode.length >= 2) {
            groupkey = 'city';
            areacodelen = 4;
        }
        lotteryrecdb.findAll({
            where: whereCondition,
            attributes: [
                [groupkey, 'areaname'],
                ['left(areacode,' + areacodelen + ')', 'newareacode'],
                'price',
                'lotteryname',
                [db.sequelize.fn('COUNT', db.sequelize.col('recid')), 'recnumber'],
                [db.sequelize.fn('SUM', db.sequelize.col('price')), 'recmoney']
            ],
            group: groupkey + ',price,lotteryname,newareacode'
        }).then(function (result) {
            if (result) {

                logger.info("", "获取中奖红包记录：" + result);
                for (var i in analydata.info) {
                    var temp = analydata.info[i];
                    temp.detail = [];
                    for (var j in result) {
                        var item = result[j].get({ chain: true });
                        if (item.areaname == temp.areaname) {
                            temp.detail.push(item);
                        }
                    }
                }
                cb(null, returnData.createData(analydata));
            }
            else {
                proxy.emit('nodata');
            }
        }).catch(function (err) {
            proxy.emit('err', err);
        });
    });

    //未找到数据
    proxy.on("nodata", function () {
        logger.error(arg.currentuser.useraccount, '******未找到数据!******');
        cb(returnData.createError(returnData.errorType.notexist, "未找到数据!"), null);
    });
    //获取中奖人数等数据
    proxy.on('getrec', function () {
        var groupkey = 'province';
        var areacodelen = 2;
        if (areacode && areacode.length >= 2) {
            groupkey = 'city';
            areacodelen = 4;
        }
        analydata.areatype = groupkey;
        lotteryrecdb.findAll({
            where: whereCondition,
            attributes: [
                [groupkey, 'areaname'],
                ['left(areacode,' + areacodelen + ')', 'newareacode'],
                [db.sequelize.fn('COUNT', db.sequelize.col('recid')), 'recnumber'],
                [db.sequelize.fn('SUM', db.sequelize.col('price')), 'recmoney']
            ],
            group: groupkey + ',newareacode',
            orderby: 'recnumber'
        }).then(function (data) {
            if (data) {
                logger.info("", "获取红包记录：" + data);
                analydata.info = [];
                for (var i in data) {
                    var temp = data[i].get({ chain: true });
                    analydata.info.push(temp);
                }
                proxy.emit('getlottery');
            } else {
                proxy.emit('nodata');
            }
        }).catch(function (err) {
            proxy.emit('err', err);
        });
    });
    proxy.emit('getrec');
};

/**
 * 获取中奖时间分析信息
 * @param arg 参数{id:活动,areacode:区域,begtime:开始时间,endtime:结束时间,lotteryid:奖项编号（空表示全部）,grouptype:分组方式}
 * @param cb 返回值
 * {id:活动Id,
 * grouptype:分组方式,
 * info:[
 *     {groupvalue:分组值
*       lotterynumber:中奖数量,
*       lotterymoney:种奖金额
 *       }
 *     ]
 * }
 * 说明：grouptype取值：days(按天分组统计),months(按月分组统计)
 */
function lotterydate(arg, cb) {
    arg.endtime = tool.queryenddate(arg.endtime);
    logger.info(arg.currentuser.useraccount, "*开始分析中奖信息");
    var lotteryrecdb = db.models.prolotteryrecord;
    var grouptype = "";
    if (arg.grouptype) {
        grouptype = arg.grouptype;
    }
    var whereCondition = { "projectid": { $in: arg.id }, "rectime": { $and: [{ $gte: arg.begtime }, { $lte: arg.endtime }] } },
        attributes = [["year(rectime)", "y"], ["month(rectime)", "m"], [db.sequelize.fn('COUNT', db.sequelize.col('recid')), 'num'], [db.sequelize.fn('SUM', db.sequelize.col('price')), 'recmoney']],
        gp = "y,m", orderby = "y,m asc";

    if (arg.areacode) {
        if (arg.areacode === "0") {
            arg.areacode = "";
        }
        whereCondition.areacode = { $like: arg.areacode + "%" };
    };
    if (arg.lotteryname) {
        whereCondition.lotteryname = arg.lotteryname;
    };
    if (arg.lotteryprice) {
        whereCondition.price = arg.lotteryprice;
    };

    if (arg.grouptype && arg.grouptype == "days") {
        attributes = [["year(rectime)", "y"], ["month(rectime)", "m"], ["day(rectime)", "d"], [db.sequelize.fn('COUNT', db.sequelize.col('recid')), 'num'], [db.sequelize.fn('SUM', db.sequelize.col('price')), 'recmoney']];
        gp = "y,m,d";
        orderby = "y,m,d asc"
    }
    if (arg.begtime > arg.endtime) {
        cb(returnData.createError(returnData.errorType.paraerror, "开始时间 > 结束时间"));
        logger.error(arg.currentuser.useraccount, "开始时间 > 结束时间");
        return;
    }
    var proxy = new eventproxy();
    proxy.on('getrec', function () {
        lotteryrecdb.findAll({
            where: whereCondition,
            attributes: attributes,
            group: gp,
            orderby: orderby
        }).then(function (data) {
            if (data.length == 0) {
                var res = {};
                data = [];
                res = {
                    id: arg.id,
                    grouptype: grouptype,
                    info: data
                }
                cb(null, returnData.createData(res));
            }
            else {
                var jugdata = data[0].get({ chain: true });
                if (jugdata.num) {
                    var res = {};
                    res = {
                        id: arg.id,
                        grouptype: grouptype,
                        info: data
                    }
                    cb(null, returnData.createData(res));
                } else {
                    var res = {};
                    data = [];
                    res = {
                        id: arg.id,
                        grouptype: grouptype,
                        info: data
                    }
                    cb(null, returnData.createData(res));
                }
            }
        }).catch(function (err) {
            proxy.emit('err', err);
        })
    })
    //错误处理err
    proxy.on("err", function (err) {
        logger.error(arg.currentuser.useraccount, '******获取中奖信息时出错!******');
        cb(returnData.createError(returnData.errorType.unknow, err.message), null);
    });
    //未找到数据
    proxy.on("nodata", function () {
        logger.error(arg.currentuser.useraccount, '******未找到数据!******');
        cb(returnData.createError(returnData.errorType.notexist, "未找到数据!"), null);
    });
    proxy.emit('getrec');
};

/**
 * 获取中奖次数分析信息
 * @param arg 参数{id:活动,areacode:区域,begdate:开始时间,enddata:结束时间,lotteryid:奖项编号（空表示全部）,topnumber:最大记录条数}
 * @param cb 返回值
 * {id:活动Id,
 * info:[
 *     {custid:用户id,
 *      cunam:姓名,
 *      cuphone:电话,
 *      areacode:区域编码
*       lotterynumber:中奖数量,
*       lotterymoney:种奖金额
 *       }
 *     ]
 * }
 */
function lotterytimes(arg, cb) {
    arg.endtime = tool.queryenddate(arg.endtime);
    logger.info(arg.currentuser.useraccount, "*开始获取中奖次数信息分析");
    var areacode = arg.areacode;
    var lotteryid = arg.lotteryid || '';
    var topnumber = arg.topnumber || 10;
    var custdb = db.models.customer;
    var lotteryrecdb = db.models.prolotteryrecord;
    var ids = [];
    var proxy = new eventproxy();
    var whereCondition = { "projectid": { $in: arg.id }, "rectime": { $and: [{ $gte: arg.begtime }, { $lte: arg.endtime }] } };
    if (arg.begtime > arg.endtime) {
        cb(returnData.createError(returnData.errorType.paraerror, "开始时间 > 结束时间"));
        logger.error(arg.currentuser.useraccount, "开始时间 > 结束时间");
        return;
    }
    if (areacode) {
        if (areacode === "0") areacode = "";
        whereCondition.areacode = { $like: areacode + "%" };
    };
    if (arg.lotteryname) {
        whereCondition.lotteryname = arg.lotteryname;
    };
    if (arg.lotteryprice) {
        whereCondition.price = arg.lotteryprice;
    };
    proxy.on('getrec', function () {
        lotteryrecdb.findAll({
            where: whereCondition,
            attributes: [
                'custid',
                'areacode',
                'nickname',
                [db.sequelize.fn('COUNT', db.sequelize.col('recid')), 'recnumber'],
                [db.sequelize.fn('SUM', db.sequelize.col('price')), 'recmoney']
            ],
            group: 'custid,areacode,nickname',
            order: "recnumber desc"
        }).then(function (result) {
            if (result) {
                var res = {};
                var info = [];
                info = result;
                var infotop = [];
                topnumber = topnumber < info.length ? topnumber : info.length;
                for (var i = 0; i < topnumber; i++) {
                    logger.info("", info[i]);
                    infotop.push(info[i]);
                }
                res = {
                    id: arg.id,
                    info: infotop
                }
                cb(null, returnData.createData(res));
            }
            else {
                proxy.emit('nodata');
            }
        }).catch(function (err) {
            proxy.emit('err', err);
        });
    })
    //错误处理err
    proxy.on("err", function (err) {
        logger.error(arg.currentuser.useraccount, '******获取中奖信息时出错!******');
        cb(returnData.createError(returnData.errorType.unknow, err.message), null);
    });
    //未找到数据
    proxy.on("nodata", function () {
        logger.error(arg.currentuser.useraccount, '******未找到数据!******');
        cb(returnData.createError(returnData.errorType.notexist, "未找到数据!"), null);
    });
    proxy.emit('getrec');
};


/**
 * 获取调查问卷进度
 * @param arg 参数{id:活动,areacode:区域}
 * @param cb 返回值
 * {id:活动Id,
 * info:活动信息,
 * datanumber:答题人数总量,
 * newnumber:新增答题人数,
 * completion:完成率
 * }
 */
//TODO 区域未实现，现在还没这需求
//TODO 浏览数量未实现
function qaprogress(arg, cb) {
    var proid = arg.id;
    var qadb = db.models.proqarecord,
        prodb = db.models.project;
    var countall = 0, countnow = 0, counttoday = 0;
    var currenttime = moment(), time = currenttime.format(config.dateformat);
    var currenttimebeforeOne = moment().startOf('day').format(config.dateformat);

    var ep = new eventproxy();
    var entid = !!arg.currentuser ? arg.currentuser.entid : null;
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;
    var data = {};

    ep.on("findoneproject", function (result) {
        if (!result || tool.isEmptyObject(result)) {
            //未找到对象
            logger.error(useraccount, "调用/analyze/qaprogress接口时，projectid:" + proid + "在数据库中未找到");
            cb(null, returnData.createData(result));
            //cb(returnData.createError(returnData.errorType.notexist, "活动信息未找到"));
        }
        else {
            result = result.get({ chain: true });
            data.info = result;
            var totletime = moment(result.enddate, config.dateformat).diff(moment(result.begdate, config.dateformat));
            var passtime = moment().diff(moment(result.begdate, config.dateformat));
            data.completion = passtime / totletime;
            logger.info(useraccount, "获取活动问卷预计总数成功");
        }
    });
    ep.on("countall", function (result) {
        if (!result) {
            //未找到对象
            logger.error(useraccount, "调用/analyze/qaprogress接口时，countAll:获取失败");
            cb(null, returnData.createData(result));
            //cb(returnData.createError(returnData.errorType.notexist, "当前活动总量未找到"));
        }
        else {
            if (result) {
                countnow = result.length;
            }
            data.datanumber = countnow;
            logger.info(useraccount, "获取当前问卷总数成功");
        }
    });
    ep.on("counttodayall", function (result) {
        if (!result) {
            //未找到对象
            logger.error(useraccount, "调用/analyze/qaprogress接口时，counttoday:获取失败");
            cb(null, returnData.createData(result));
            //cb(returnData.createError(returnData.errorType.notexist, "当天活动总量未找到"));
        }
        else {
            if (result) {
                counttoday = result.length;
            }
            data.newnumber = counttoday;
            logger.info(useraccount, "获取当天问卷总数成功");
        }
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/analyze/qaprogress错误", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });

    ep.all("countall", "findoneproject", "counttodayall", function () {
        cb(null, returnData.createData(data));
    });

    //检查entid是否有值，赋值
    if (!entid) {
        cb(returnData.createError(returnData.errorType.unknow, "当前用户未登录"));
        return;
    }
    if (!proid) {
        cb(returnData.createError(returnData.errorType.unknow, "参数id错误"));
        return;
    }

    prodb.findOne({
        where: { projectid: proid }
    }).then(function (result) {
        ep.emit("findoneproject", result);
    },
        function (error) {
            logger.error(useraccount, proid + "数据库project表查找失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        }
        ).catch(function (error) {
            logger.error(useraccount, proid + "数据库project表查找失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });

    qadb.findAll({
        where: { projectid: proid },
        attributes: [
            'custid'
        ],
        group: 'custid,projectid'
    }).then(
        function (result) {
            logger.info(useraccount, "获取当前总记录数成功");
            ep.emit("countall", result);
        },
        function (error) {
            logger.error(useraccount, "获取proqarecord总记录数失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        }
        ).catch(function (error) {
            logger.error(useraccount, "获取proqarecord总记录数失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });

    qadb.findAll({
        where: { answertime: { $and: [{ $gte: currenttimebeforeOne }, { $lte: time }] }, projectid: proid },
        attributes: [
            'custid'
        ],
        group: 'custid,projectid'
    }).then(
        function (result) {
            logger.info(useraccount, "获取今天总记录数成功");
            ep.emit("counttodayall", result);
        },
        function (error) {
            logger.error(useraccount, "获取今天proqarecord总记录数失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        }
        ).catch(function (error) {
            logger.error(useraccount, "获取今天proqarecord总记录数失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });

};

/**
 * 获取问卷问题列表
 * @param arg 参数 {id:活动id}
 * @param cb 返回值
 * {id：活动id，
 * qalist:[
 *          {
 *              qaid:问题id,
 *              name:问题名称，
 *              answer：问题答案选项，
 *              qatype：问题类型，
 *              number：问题题号
 *          }
 *          ]
 * }
 */
function qalist(arg, cb) {
    var proid = arg.id;
    var entid = !!arg.currentuser ? arg.currentuser.entid : null;
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;
    var data = {};
    var ep = new eventproxy();
    var qadb = db.models.proquestion;

    if (!entid) {
        cb(returnData.createError(returnData.errorType.unknow, "当前用户未登陆"));
        logger.error(useraccount, "当前用户未登陆");
        return;
    }
    if (!proid) {
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        logger.error(useraccount, "参数id错误");
        return;
    }
    data.projectid = proid;
    //获取问卷活动列表
    ep.on('getlist', function () {
        qadb.findAll({
            where: { projectid: proid },
            order: 'number'
        }).then(
            function (result) {
                logger.info(useraccount, "获取问题列表成功");
                ep.emit("qalist", result);
            },
            function (error) {
                logger.error(useraccount, "获取问题列表失败");
                error.errortype = returnData.errorType.dataBaseError.unknow;
                ep.emit("error", error);
            }
            ).catch(function (error) {
                logger.error(useraccount, "获取问题列表失败");
                error.errortype = returnData.errorType.dataBaseError.unknow;
                ep.emit("error", error);
            })
    });
    ep.on("qalist", function (result) {
        if (!result || tool.isEmptyObject(result)) {
            //未找到对象
            logger.error(useraccount, "调用/analyze/qalist接口时，问题列表不存在");
            cb(null, returnData.createData(result));
            //cb(returnData.createError(returnData.errorType.notexist, "问题列表不存在"));
        }
        else {
            data.qalist = result;
            cb(null, returnData.createData(data));
            logger.info(useraccount, proid + "问题列表返回成功");
        }
    });
    ep.on("error", function (error) {
        logger.error(useraccount, "调用/analyze/qalist接口出错", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });
    ep.emit('getlist');
}


/**
 * 问卷区域分析——获取各省问卷数量
 * @param arg 参数{id:活动,begtime:开始时间,endtime:结束时间}
 * @param cb 返回值
 * {id:活动Id,
 * areainfo:[
 *     {
 *      areaname:区域名,
 *      datanumber:数据数量
 *       }
 *     ]
 * }
 */

function qaanalyze(arg, cb) {
    arg.endtime = tool.queryenddate(arg.endtime);
    var proid = arg.id, begtime = arg.begtime, endtime = arg.endtime;
    var qadb = db.models.proqarecord, prodb = db.models.project;
    var ep = new eventproxy();
    var entid = !!arg.currentuser ? arg.currentuser.entid : null;
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;
    var data = {};
    var areacode = '';
    if (arg.areacode)
        areacode = arg.areacode;
    if (areacode === "0") {
        areacode = '';
    }
    //检查entid是否有值，赋值
    if (!entid) {
        cb(returnData.createError(returnData.errorType.unknow, "当前用户未登录"));
        return;
    }
    if (!proid) {
        cb(returnData.createError(returnData.errorType.unknow, "参数id错误"));
        return;
    }
    if (begtime > endtime) {
        cb(returnData.createError(returnData.errorType.paraerror, "开始时间 > 结束时间"));
        logger.error(arg.currentuser.useraccount, "开始时间 > 结束时间");
        return;
    }
    //获取区域数据
    ep.on('getlist', function () {
        var groupkey = 'province';
        var areacodelen = 2;
        if (areacode && areacode.length >= 2) {
            groupkey = 'city';
            areacodelen = 4;
        }
        data.areatype = groupkey;

        qadb.findAll({
            where: { projectid: proid, answertime: { $and: [{ $gte: begtime }, { $lte: endtime }] }, areacode: { $like: areacode + '%' } },
            attributes: [
                [groupkey, 'areaname'],
                ['left(areacode,' + areacodelen + ')', 'newareacode'],
                ['COUNT(DISTINCT(custid))', 'num']
            ],
            group: groupkey + ',newareacode',
            order: "num asc"
        }).then(
            function (result) {
                logger.info(useraccount, "获取各省问卷信息成功");
                ep.emit("getareaqa", result);
            },
            function (error) {
                logger.error(useraccount, "获取各省问卷信息失败.");
                error.errortype = returnData.errorType.dataBaseError.unknow;
                ep.emit("error", error);
            }
            );
    })
    ep.on("getareaqa", function (result) {
        if (!result || tool.isEmptyObject(result)) {
            //未找到对象
            logger.info(useraccount, "调用/analyze/qaanalyze接口时，问卷分析结果未找到");
            data.areainfo = [];
            cb(null, returnData.createData(null));
            //cb(returnData.createError(returnData.errorType.notexist, "问卷分析结果未找到"));
        }
        else {
            data.projectid = proid;
            data.areainfo = result;
            logger.info(useraccount, "成功返回问卷分析结果");
            cb(null, returnData.createData(data));
        }
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/analyze/qaanalyze错误");
        cb(returnData.createError(error.errortype, "数据库错误"));
    });
    ep.emit('getlist');

};

/**
 * 问卷走势分析
 * @param arg 参数{id:活动,areacode:区域,begtime:开始时间,endtime:结束时间,grouptype:分组方式}
 * @param cb 返回值
 * {id:活动Id,
 * areainfo:[
 *     {areacode:区域编码,
 *      areaname:区域名,
 *      datanumber:数据数量
 *       }
 *     ]
 * }
 */
function qaanalyzenum(arg, cb) {
    arg.endtime = tool.queryenddate(arg.endtime);
    var proid = arg.id, begtime = arg.begtime, endtime = arg.endtime, grouptype = arg.grouptype;
    var areacode = '';
    if (arg.areacode) {
        areacode = arg.areacode;
        if (areacode === "0") {
            areacode = "";
        }
    }

    var qadb = db.models.proqarecord;
    var ep = new eventproxy();
    var entid = !!arg.currentuser ? arg.currentuser.entid : null;
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;
    var queryobj = {}, whereobj = {};
    //检查entid是否有值，赋值
    if (!entid) {
        cb(returnData.createError(returnData.errorType.unknow, "当前用户未登录"));
        return;
    }
    if (!proid) {
        cb(returnData.createError(returnData.errorType.unknow, "参数id错误"));
        return;
    }
    if (begtime > endtime) {
        cb(returnData.createError(returnData.errorType.paraerror, "开始时间 > 结束时间"));
        logger.error(arg.currentuser.useraccount, "开始时间 > 结束时间");
        return;
    }
    if (grouptype === "months") {
        queryobj = {
            attr: [['year(answertime)', 'year'], ['month(answertime)', 'month'], ['COUNT(DISTINCT(custid))', 'num']],
            group: 'year,month',
            order: 'year,month asc'
        };
    }
    else if (grouptype === 'days') {
        queryobj = {
            attr: [['year(answertime)', 'year'], ['month(answertime)', 'month'], ['day(answertime)', 'day'], ['COUNT(DISTINCT(custid))', 'num']],
            group: 'year,month,day',
            order: 'year,month,day asc'
        }
    }
    if (!areacode) {
        whereobj = {
            projectid: proid,
            answertime: { $and: [{ $gte: begtime }, { $lte: endtime }] }
        }
    }
    else {
        whereobj = {
            projectid: proid,
            areacode: { $like: areacode + "%" },
            answertime: { $and: [{ $gte: begtime }, { $lte: endtime }] }
        }
    }
    //获取列表
    ep.on('getlist', function () {
        qadb.findAll({
            attributes: queryobj.attr,
            where: whereobj,
            group: queryobj.group,
            order: queryobj.order
        }).then(
            function (result) {
                logger.info(useraccount, "获取各省问卷分析-区域分析数量成功");
                ep.emit("getareaqanum", result);
            },
            function (error) {
                logger.error(useraccount, "获取各省问卷分析-区域分析数量失败.");
                error.errortype = returnData.errorType.dataBaseError.unknow;
                ep.emit("error", error);
            }
            );
    })
    //返回结果
    ep.on("getareaqanum", function (result) {
        if (!result || tool.isEmptyObject(result)) {
            //未找到对象
            logger.info(useraccount, "调用/analyze/qaanalyzenum接口时，问卷分析-区域分析数量结果未找到");
            cb(null, returnData.createData([]));
            //cb(returnData.createError(returnData.errorType.notexist, "问卷分析-区域分析数量结果未找到"));
        }
        else {
            cb(null, returnData.createData(result));
            logger.info(useraccount, "成功返回问卷分析-区域分析数量结果");
        }
    });

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/analyze/qaanalyzenum错误");
        cb(returnData.createError(error.errortype, "数据库错误"));
    });
    ep.emit('getlist');
};


/**
 * 答题分析
 * @param arg 参数{id:活动,areacode:区域,begtime:开始时间,endtime:结束时间,questions:[题号]}
 * @param cb 返回值
 * {id:活动Id,
 * info:[
 *          qaid:题号,
 *          qaname:题目标题,
 *          answernumber:回答总数
 *          answers:[
 *              answerid:答案id,
 *              answermessage:答案描述,
 *              number:数量
 *          ]
 *      ]
 * }
 */
function answeranalyze(arg, cb) {

    var details = JSON.parse(arg.details);
    details.endtime = tool.queryenddate(details.endtime);
    var projectid = details.id, areacode = details.areacode, begtime = details.begtime, endtime = details.endtime, questions = details.questions;
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;
    var ep = new eventproxy();
    var pqdb = db.models.proqarecord;
    var whereobj = {};
    var analydata = {};
    var questionnu = 0;
    var ids = [];
    if (!questions || !tool.verifier.isArray(questions) || questions.length == 0) {
        logger.error(useraccount, "接口/analyze/answeranalyze参数questions错误：" + questions);
        cb(returnData.createError(returnData.errorType.paraerror, "参数questions错误"));
        return;
    }
    if (questions && questions.length > 0) {
        for (var i in questions) {
            ids.push(questions[i]);
        }
    }
    if (!projectid || !begtime || !endtime || tool.verifier.isEmptyString(projectid) || tool.verifier.isEmptyString(begtime) || tool.verifier.isEmptyString(endtime)) {
        logger.error(useraccount, "接口/analyze/answeranalyze参数projectid 、begtime、endtime错误：" + projectid + begtime + endtime);
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误."));
        return;
    }
    if (begtime > endtime) {
        cb(returnData.createError(returnData.errorType.paraerror, "开始时间 > 结束时间"));
        logger.error(arg.currentuser.useraccount, "开始时间 > 结束时间");
        return;
    }
    if (areacode === "0") {
        areacode = "";
    }
    if (areacode == null || areacode == undefined) {
        logger.error(useraccount, "接口/analyze/answeranalyze参数areacode错误：" + areacode);
        cb(returnData.createError(returnData.errorType.paraerror, "参数areacode错误"));
        return;
    }
    else if (areacode.trim() == "") {
        whereobj = {
            projectid: projectid,
            answertime: { $and: [{ $gte: begtime }, { $lte: endtime }] }
        };
    }
    else if (!!areacode) {
        whereobj = {
            projectid: projectid,
            areacode: { $like: areacode + "%" },
            answertime: { $and: [{ $gte: begtime }, { $lte: endtime }] }
        }
    }
    //获取问卷数据
    ep.on('getlist', function () {
        var questdb = db.models.proquestion;
        questdb.findAll({
            where: {
                projectid: projectid,
                qaid: { $in: ids }
            }
        }).then(function (result) {
            if (result) {
                logger.info(useraccount, "获取活动答题列表成功");
                analydata.info = [];
                ep.emit("getanswer", result);
            } else {
                logger.error(useraccount, "未找到问卷数据.");
                cb(returnData.createError(returnData.errorType.notexist), null);
            }
        }).catch(function (error) {
            logger.error(useraccount, "获取活动答题列表错误.");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });

    });

    //获取答案数据
    ep.on('getanswer', function (result) {
        questionnu = result ? result.length : 0;
        ep.on('answerfinish', function (resultdata, qas) {
            var qaid = resultdata[0] ? resultdata[0].answerid : null;
            if (qaid) {
                for (var index in qas) {
                    var qa = qas[index];
                    if (qa.qaid == qaid) {
                        qa.recmember = 0;
                        for (var i in resultdata) {
                            var tempan = resultdata[i];
                            qa.answers.push(tempan);
                            qa.recmember = qa.recmember + tempan.number;
                        }
                        break;
                    }
                }
            }
        });
        ep.after("answerfinish", questionnu, function () {
            cb(null, returnData.createData(analydata));
        });

        for (var i in result) {
            var qa = result[i].get({ chain: true });
            qa.answers = [];
            qa.recmember = 0;
            whereobj.qaid = qa.qaid;
            analydata.info.push(qa);
            pqdb.findAll({
                attributes: [
                    ['answer', 'answermessage'],
                    ['qaid', 'answerid'],
                    [db.sequelize.fn('COUNT', db.sequelize.col('recid')), 'number']
                ],
                where: whereobj,
                group: 'answer,qaid',
                order: 'answer,qaid asc'
            }).then(function (resultdata) {
                var tempdata = [];
                for (var key in resultdata) {
                    tempdata.push(resultdata[key].get({ chain: true }));
                }
                ep.emit('answerfinish', tempdata, analydata.info);
            }).catch(function (error) {
                logger.error(useraccount, "获取活动答题统计错误.");
                error.errortype = returnData.errorType.dataBaseError.unknow;
                ep.emit("error", error);
            });
        }
    });

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/analyze/answeranalyze错误", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });

    analydata.id = details.id;
    ep.emit('getlist');
}

/**
 * 用户区域分析
 * @param arg 参数{areacode:区域,begtime:开始时间,endtime:结束时间}
 * @param cb 返回值
 * {areacode:分析区域,
 * number:总人数,
 * info:{
 *       areacode:区域码
 *       areaname:区域名
 *       number:用户数
 *      }
 * }
 */
function customerarea(arg, cb) {
    arg.endtime = tool.queryenddate(arg.endtime);
    var begtime = arg.begtime, endtime = arg.endtime, areacode = arg.areacode;
    if (!begtime || !endtime || !tool.verifier.isDate(begtime) || !tool.verifier.isDate(endtime)) {
        cb(returnData.createError(returnData.errorType.paraerror, "时间参数错误"));
        logger.error(arg.currentuser.useraccount, "时间参数错误");
        return;
    }
    if (begtime > endtime) {
        cb(returnData.createError(returnData.errorType.paraerror, "开始时间 > 结束时间"));
        logger.error(arg.currentuser.useraccount, "开始时间 > 结束时间");
        return;
    }
    var canalysis = db.models.customer, entid = arg.currentuser.entid;
    if (!entid) {
        cb(returnData.createError(returnData.errorType.paraerror, "企业ID错误"));
        logger.error(arg.currentuser.useraccount, "企业ID错误");
        return;
    }
    var whereCondition = {
        "entid": entid,
        "createtime": { $and: [{ $gte: begtime }, { $lte: endtime }] }
    };
    var grouptype = "province", re = /[0-9]{2,}/g;
    var areacodelen = 2;
    if (areacode && areacode !== "0") {
        if (!re.test(areacode)) {
            cb(returnData.createError(returnData.errorType.paraerror, "areacode参数错误"));
            logger.error(arg.currentuser.useraccount, "areacode参数错误");
            return;
        } else {
            if (areacode.length >= 2) {
                grouptype = "city";
                areacodelen = 4;
            } else {
                grouptype = "province";
            }
            whereCondition.areacode = { $like: areacode + "%" };

        }
    }
    if (areacode === "0") {
        areacode = "";
        whereCondition.areacode = { $like: areacode + "%" };
    }
    canalysis.findAll({
        attributes: [
            [grouptype, 'areaname'],
            ['left(areacode,' + areacodelen + ')', 'newareacode'],
            [sequelize.fn('COUNT', sequelize.col('custid')), 'num']
        ],
        where: whereCondition,
        group: grouptype + ',newareacode',
        order: "num desc"
    }).then(
        function (result) {
            logger.info('', "获取消费者分布区域信息");
            cb(null, returnData.createData(result));
        }, function (error) {
            logger.error(config.systemUser, "应用程序错误，数据库查找失败");
            cb(returnData.createError(returnData.errorType.unknow, error.message), null);
        }
        );

}

/**
 * 用户走时分析
 * @param arg 参数{areacode:区域,begtime:开始时间,endtime:结束时间,grouptype:分组方式}
 * @param cb 返回值
 * {[
 * groupvalue:分组值,
 * number:用户数
 * ]
 * }
 * 说明：groupType取值：date(按天分组统计),month(按月分组统计)
 */
function customerdate(arg, cb) {
    arg.endtime = tool.queryenddate(arg.endtime);
    var begtime = arg.begtime, endtime = arg.endtime, areacode = arg.areacode, grouptype = arg.grouptype;
    if (!begtime || !endtime || !tool.verifier.isDate(begtime) || !tool.verifier.isDate(endtime)) {
        cb(returnData.createError(returnData.errorType.paraerror, "时间参数错误"));
        logger.error(arg.currentuser.useraccount, "时间参数错误");
        return;
    }
    if (begtime > endtime) {
        cb(returnData.createError(returnData.errorType.paraerror, "开始时间 > 结束时间"));
        logger.error(arg.currentuser.useraccount, "开始时间 > 结束时间");
        return;
    }
    var canalysis = db.models.customer, entid = arg.currentuser.entid;
    if (!entid) {
        cb(returnData.createError(returnData.errorType.paraerror, "entid参数错误"));
        logger.error(arg.currentuser.useraccount, "entid参数错误");
        return;
    }
    var whereCondition = {
        "entid": entid,
        "createtime": { $and: [{ $gte: begtime }, { $lte: endtime }] }
    },
        attributes = [["year(createtime)", "y"], ["month(createtime)", "m"], [sequelize.fn('COUNT', sequelize.col('entid')), 'num']],
        gp = "y,m", orderby = "y,m asc";
    var re = /[0-9]{2,}/g;
    if (areacode && areacode !== "0") {
        if (!re.test(areacode)) {
            cb(returnData.createError(returnData.errorType.paraerror, "areacode参数错误"));
            logger.error(arg.currentuser.useraccount, "areacode参数错误");
            return;
        } else {
            whereCondition.areacode = { $like: areacode + "%" }
        }
    }
    if (areacode === "0") {
        areacode = "";
        whereCondition.areacode = { $like: areacode + "%" }
    }
    var _re = /\bdays\b|\bmonths\b/;
    if (grouptype != undefined) {
        if (!_re.test(grouptype)) {
            cb(returnData.createError(returnData.errorType.paraerror, "grouptype参数错误"));
            logger.error(arg.currentuser.useraccount, "grouptype参数错误");
            return;
        } else {
            if (grouptype && grouptype == "days") {
                attributes = [["year(createtime)", "y"], ["month(createtime)", "m"], ["day(createtime)", "d"], [sequelize.fn('COUNT', sequelize.col('entid')), 'num']];
                gp = "y,m,d";
                orderby = "y,m,d asc"
            }
        }
    }
    canalysis.findAll({
        attributes: attributes,
        where: whereCondition,
        group: gp,
        order: orderby
    }).then(
        function (result) {
            logger.info('', "获取消费者增量走势信息");
            cb(null, returnData.createData(result));
        }, function (error) {
            logger.error(config.systemUser, "应用程序错误，数据库查找失败");
            cb(returnData.createError(returnData.errorType.unknow, error.message), null);
        }
        );
}

var totalpage = function (total, size) {
    var page = 0;
    var num = Number(total) / Number(size);
    if (parseInt(num) == num)
        page = num;
    else
        page = Math.floor(num) + 1;
    return page;
};

/**
 * 用户人数分析
 * @param arg 参数{areacode:区域}
 * @param cb 返回值
 */
function customernumbers(arg, cb) {

    var page = arg.page || 1,
        size = arg.size || 10;
    page = tool.getInt(page);
    size = tool.getInt(size);

    var categoryFilter = '';
    !!arg.categoryid ? categoryFilter = ' WHERE categoryid = "' + arg.categoryid + '" ' : categoryFilter;

    var areaFilter = '', groupFilter = '';
    groupFilter = ' SUBSTR(areacode, 1, 4)';
    if (!!arg.areacode) {
        areaFilter = ' where areacode like "' + arg.areacode + '%" ';
    }

    var minpoint = 0, maxpoint = 0;
    var pointQuery = '';
    arg.minpoint ? minpoint = arg.minpoint : minpoint;
    arg.maxpoint ? maxpoint = arg.maxpoint : maxpoint;

    if (maxpoint < minpoint && (0 != minpoint && 0 != maxpoint)) {
        cb(returnData.createError(returnData.errorType.paraerror, '查询最大积分值小于最小积分值'), null);
        return;
    } else if (0 == maxpoint && minpoint > 0) {
        pointQuery = '( point >= ' + minpoint + ') ';
    } else if (0 == minpoint && maxpoint > 0) {
        pointQuery = '( point <= ' + maxpoint + ') ';
    } else if (maxpoint >= minpoint && 0 != maxpoint && 0 != minpoint) {
        pointQuery = '( point >= ' + minpoint + ' and point <= ' + maxpoint + ') ';
    }

    if ('' == areaFilter && '' != pointQuery) {
        pointQuery = ' where ' + pointQuery
    } else if ('' != areaFilter && '' != pointQuery) {
        pointQuery = ' and ' + pointQuery;
    }

    var origquery = multiline(function () {/*
        SELECT a.*,b.full from (
            SELECT #groupFilter# as areacode,sum(point) s_point, count(custid) s_custid from (
            SELECT * from (
            SELECT custid,areacode from v_scanrecord 
            WHERE
            projectid in (
            SELECT projectid from ctg2project 
            #categoryFilter#)
            GROUP BY custid,areacode
            ) t1
            LEFT JOIN
            (SELECT custid _custid,point from custextend) t2
            ON
            t1.custid = t2._custid)t
            #areaFilter#
            #pointQuery#
            GROUP BY #groupFilter#) a
            LEFT JOIN
            cities as b
            on 
            a.areacode = b.`code`
            limit #offset#, #limit#
     */
    });

    var countquery = multiline(function () {/*
        SELECT count(areacode) as total,sum(s_custid) sum_cust  from (
            SELECT a.*,b.full from (
                SELECT #groupFilter# as areacode,sum(point) s_point, count(custid) s_custid from (
                SELECT * from (
                SELECT custid,areacode from v_scanrecord 
                WHERE
                projectid in (
                SELECT projectid from ctg2project 
                #categoryFilter#)
                GROUP BY custid,areacode) t1
                LEFT JOIN
                (SELECT custid _custid,point from custextend) t2
                ON
                t1.custid = t2._custid)t
                #areaFilter#
                #pointQuery#
                GROUP BY #groupFilter#) a
                LEFT JOIN
                cities as b
                on 
                a.areacode = b.`code`
        )e
     */
    });

    origquery = origquery.replace('#categoryFilter#', categoryFilter)
        .replace('#areaFilter#', areaFilter)
        .replace('#pointQuery#', pointQuery)
        .replace('#offset#', (page - 1) * size)
        .replace('#limit#', size)
        .replace(/#groupFilter#/g, groupFilter);

    countquery = countquery.replace('#categoryFilter#', categoryFilter)
        .replace('#areaFilter#', areaFilter)
        .replace('#pointQuery#', pointQuery)
        .replace(/#groupFilter#/g, groupFilter);


    function _combine(total, list) {
        var data = {};
        data.page = arg.page || 1;
        data.size = arg.size || 10;
        data.total = total[0].total,
            data.totalpage = totalpage(total[0].total, data.size);
        data.data = list;
        data.sumcust = total[0].sum_cust;
        cb(null, returnData.createData(data));
    }

    function _fail(err) {
        logger.error(arg.currentuser.useraccount, "/cusomer/customernumbers", err.message);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow), "数据库错误:" + err.message);
    }

    var ep = new eventproxy();

    //注册最后处理事件
    ep.all('total', 'list', _combine);

    db.sequelize.query(countquery).spread(function (result, metadata) {
        ep.emit('total', result);
    }, _fail);

    db.sequelize.query(origquery).spread(function (result, metadata) {
        ep.emit('list', result);
    }, _fail);
}

/**
 * 订单分析
 * @param arg 参数{areacode:区域}
 * @param cb 返回值
 */
function orderanalyze(arg, cb) {

    var page = arg.page || 1,
        size = arg.size || 10;
    page = tool.getInt(page);
    size = tool.getInt(size);

    var productFilter = '';
    !!arg.productid ? productFilter = ' WHERE mcdid = "' + arg.productid + '" ' : productFilter;

    var areaFilter = '', groupFilter = '';
    groupFilter = ' SUBSTR(areacode, 1, 4) ';
    if (!!arg.areacode) {
        areaFilter = ' where areacode like "' + arg.areacode + '%" ';
    }

    var bt = 0, et = 0;
    var dateQuery = '';
    try {
        arg.begtime ? bt = moment(arg.begtime).valueOf() : bt;
        arg.endtime ? et = moment(arg.endtime).add(1, 'd').valueOf() : et;

        if (et < bt && (0 != bt && 0 != et)) {
            cb(returnData.createError(returnData.errorType.paraerror, '查询结束时间小于开始时间'), null);
            return;
        } else if (0 == et && bt > 0) {
            dateQuery = ' and createtime > ' + bt;
        } else if (0 == bt && et > 0) {
            dateQuery = ' and createtime < ' + et;
        } else if (et >= bt && 0 != et && 0 != bt) {
            dateQuery = 'and createtime >= ' + bt + ' and createtime <= ' + et;
        }
    } catch (error) {
        cb(returnData.createError(returnData.errorType.paraerror, '订单查询时间解析出错'), null);
        return;
    }

    var pricerule = 'b.tickmoney * 100';//红包商品特殊处理
    if(arg.productid && arg.productid == '002'){
        pricerule = 'b.price';
    }

    var origquery = multiline(function () {/*
        SELECT c.*, d.full from (
        SELECT #groupFilter# as areacode,count(DISTINCT orderid) as s_order,sum(point) as s_point from (
        SELECT t1.*,t2.areacode
        from (
        SELECT a.orderid,mcdid,custid,b.createtime,#pricerule# as point 
        from 
        (SELECT * from mallorderdetail #productFilter#) a
        inner JOIN
        (SELECT * from mallorder where state != 4 and state != 100) as b
        ON
        a.orderid = b.orderid
        where 1= 1 #dateQuery#) t1
        LEFT JOIN
        (SELECT custid,areacode from customer) t2
        ON
        t1.custid = t2.custid)t
        #areaFilter#
        GROUP BY  #groupFilter#
        limit #offset#, #limit#)c
        LEFT JOIN
        cities d
        ON
        c.areacode = d.code
     */
    });

    var countquery = multiline(function () {/*
        SELECT count(areacode) as total ,sum(s_order) as sum_order, sum(s_point) as sum_point from (
        SELECT c.*, d.full from (
        SELECT #groupFilter# as areacode,count(DISTINCT orderid) as s_order,sum(point) as s_point from (
        SELECT t1.*,t2.areacode
        from (
        SELECT a.orderid,mcdid,custid,b.createtime,#pricerule# as point 
        from 
        (SELECT * from mallorderdetail #productFilter#) a
        inner JOIN
        (SELECT * from mallorder where 1 = 1
        #dateQuery# and state != 4 and state != 100) as b
        ON
        a.orderid = b.orderid) t1
        LEFT JOIN
        (SELECT custid,areacode from customer) t2
        ON
        t1.custid = t2.custid)t
        #areaFilter#
        GROUP BY  #groupFilter#)c
        LEFT JOIN
        cities d
        ON
        c.areacode = d.code
        )e
     */
    });

    origquery = origquery.replace('#productFilter#', productFilter)
        .replace('#pricerule#', pricerule)
        .replace('#areaFilter#', areaFilter)
        .replace('#dateQuery#', dateQuery)
        .replace('#offset#', (page - 1) * size)
        .replace('#limit#', size)
        .replace(/#groupFilter#/g, groupFilter);

    countquery = countquery.replace('#productFilter#', productFilter)
        .replace('#pricerule#', pricerule)
        .replace('#areaFilter#', areaFilter)
        .replace('#dateQuery#', dateQuery)
        .replace(/#groupFilter#/g, groupFilter);

    function _combine(total, list) {
        var data = {};
        data.page = arg.page || 1;
        data.size = arg.size || 10;
        data.total = total[0].total,
            data.totalpage = totalpage(total[0].total, data.size);

            data.sumorder = total[0].sum_order;
            data.sumpoint = total[0].sum_point;
        data.data = list;
        cb(null, returnData.createData(data));
    }

    function _fail(err) {
        logger.error(arg.currentuser.useraccount, "/analyze/orderanalyze", err.message);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow), "数据库错误:" + err.message);
    }

    var ep = new eventproxy();

    //注册最后处理事件
    ep.all('total', 'list', _combine);

    db.sequelize.query(countquery).spread(function (result, metadata) {
        ep.emit('total', result);
    }, _fail);

    db.sequelize.query(origquery).spread(function (result, metadata) {
        ep.emit('list', result);
    }, _fail);
}

/**
 * 所选时间段积分分析
 */
function pointcomponent(arg, cb) {

    var areaFilter = '', groupFilter = '';
    groupFilter = ' SUBSTR(areacode, 1, 4) ';
    if (!!arg.areacode) {
        areaFilter = ' where areacode like "' + arg.areacode + '%" ';
    }

    var bt = 0, et = 0;
    var dateQuery = '';
    try {
        arg.begtime ? bt = moment(arg.begtime).format('X') : bt;
        arg.endtime ? et = moment(arg.endtime).add(1, 'd').format('X') : et;

        if (et < bt && (0 != bt && 0 != et)) {
            cb(returnData.createError(returnData.errorType.paraerror, '查询结束时间小于开始时间'), null);
            return;
        } else if (0 == et && bt > 0) {
            dateQuery = ' and UNIX_TIMESTAMP(pointtime) > ' + bt;
        } else if (0 == bt && et > 0) {
            dateQuery = ' and UNIX_TIMESTAMP(pointtime) < ' + et;
        } else if (et >= bt && 0 != et && 0 != bt) {
            dateQuery = 'and  (UNIX_TIMESTAMP(pointtime) >= ' + bt + ' and UNIX_TIMESTAMP(pointtime) <= ' + et + ')';
        }
    } catch (error) {
        cb(returnData.createError(returnData.errorType.paraerror, '订单查询时间解析出错'), null);
        return;
    }

    var getquery = multiline(function () {/*
        SELECT #groupFilter# as areacode,sum(point) get_point from (
        select a.*,b.areacode from (
        SELECT 
        custid,sum(point) point
        from propointdetail
        where 
        changemode not in ('order','out','pointlottery')#产生渠道        
        #dateQuery#
        GROUP BY custid) a 
        LEFT JOIN customer b
        on 
        a.custid = b.custid)c
        #areaFilter#
        GROUP BY #groupFilter#
     */
    });

    var costquery = multiline(function () {/*
        SELECT #groupFilter# as areacode,sum(point) cost_point from (
        select a.*,b.areacode from (
        SELECT 
        custid,sum(point) point
        from propointdetail
        where 
        changemode in ('order','out','pointlottery')#消费渠道
        #dateQuery#
        GROUP BY custid) a 
        LEFT JOIN customer b
        on 
        a.custid = b.custid)c
        #areaFilter#
        GROUP BY #groupFilter#
     */
    });

    getquery = getquery.replace('#areaFilter#', areaFilter)
        .replace('#dateQuery#', dateQuery)
        .replace(/#groupFilter#/g, groupFilter);

    costquery = costquery.replace('#areaFilter#', areaFilter)
        .replace('#dateQuery#', dateQuery)
        .replace(/#groupFilter#/g, groupFilter);

    function _combine(get, cost) {
        var _getPoint = 0;
        for(var m = 0; m < get.length;m++){
            _getPoint += get[m].get_point;
        }

        var _costPoint = 0;
        for(var m = 0; m < cost.length;m++){
            _costPoint += cost[m].cost_point;
        }

        var result = {
            'get_point':_getPoint,
            'cost_point':_costPoint
        }

        cb(null, returnData.createData(result));
    }

    function _fail(err) {
        //logger.error(arg.currentuser.useraccount, "/analyze/orderanalyze", err.message);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow), "数据库错误:" + err.message);
    }

    var ep = new eventproxy();

    //注册最后处理事件
    ep.all('get', 'cost', _combine);

    db.sequelize.query(getquery).spread(function (result, metadata) {
        ep.emit('get', result);
    }, _fail);

    db.sequelize.query(costquery).spread(function (result, metadata) {
        ep.emit('cost', result);
    }, _fail);
}

/**
 * 总积分分析/概况，与时间段选取无关
 */
function pointcomponentoverview(arg, cb) {

    var areaFilter = '', groupFilter = '';
    groupFilter = ' SUBSTR(areacode, 1, 4) ';
    if (!!arg.areacode) {
        areaFilter = ' where areacode like "' + arg.areacode + '%" ';
    }

    var totalquery = multiline(function () {/*
        SELECT #groupFilter# as areacode,sum(point) total_point from (
        select a.*,b.areacode from (
        SELECT 
        custid,sum(point) point
        from custextend GROUP BY custid)a 
        LEFT JOIN customer b
        on 
        a.custid = b.custid)c
        #areaFilter#
        GROUP BY #groupFilter#
     */
    });

    var getquery = multiline(function () {/*
        SELECT #groupFilter# as areacode,sum(point) get_point from (
        select a.*,b.areacode from (
        SELECT 
        custid,sum(point) point
        from propointdetail
        where 
        changemode not in ('order','out','pointlottery')#产生渠道
        GROUP BY custid) a 
        LEFT JOIN customer b
        on 
        a.custid = b.custid)c
        #areaFilter#
        GROUP BY #groupFilter#
     */
    });

    var costquery = multiline(function () {/*
        SELECT #groupFilter# as areacode,sum(point) cost_point from (
        select a.*,b.areacode from (
        SELECT 
        custid,sum(point) point
        from propointdetail
        where 
        changemode in ('order','out','pointlottery')#消费渠道
        #dateQuery#
        GROUP BY custid) a 
        LEFT JOIN customer b
        on 
        a.custid = b.custid)c
        #areaFilter#
        GROUP BY #groupFilter#
     */
    });

    function _combine(get, cost,total) {
        var _getPoint = 0;
        for(var m = 0; m < get.length;m++){
            _getPoint += get[m].get_point;
        }

        var _costPoint = 0;
        for(var m = 0; m < cost.length;m++){
            _costPoint += cost[m].cost_point;
        }
        var _totalPoint = 0;
        for(var m = 0; m < total.length;m++){
            _totalPoint += total[m].total_point;
        }

        var result = {
            'get_point':_getPoint,
            'cost_point':_costPoint,
            'total_point':_getPoint + _costPoint
        }

        cb(null, returnData.createData(result));
    }

    totalquery = totalquery.replace('#areaFilter#', areaFilter)
        .replace(/#groupFilter#/g, groupFilter);

    getquery = getquery.replace('#areaFilter#', areaFilter)
        .replace(/#groupFilter#/g, groupFilter);

    costquery = costquery.replace('#areaFilter#', areaFilter)
        .replace(/#groupFilter#/g, groupFilter);

    function _fail(err) {
        logger.error(arg.currentuser.useraccount, "/analyze/pointcomponentoverview", err.message);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow), "数据库错误:" + err.message);
    }

    var ep = new eventproxy();

    //注册最后处理事件
    ep.all('get', 'cost','total', _combine);

    db.sequelize.query(getquery).spread(function (result, metadata) {
        ep.emit('get', result);
    }, _fail);

    db.sequelize.query(costquery).spread(function (result, metadata) {
        ep.emit('cost', result);
    }, _fail);

    db.sequelize.query(totalquery).spread(function (result, metadata) {
        ep.emit('total', result);
    }, _fail);
}

/*产生积分的走势*/
function pointgentrade(arg, cb) {

    var areaFilter = '';
    if (!!arg.areacode) {
        areaFilter = ' where areacode like "' + arg.areacode + '%" ';
    }

    var bt = 0, et = 0;
    var dateQuery = '';
    try {
        arg.begtime ? bt = moment(arg.begtime).format('X') : bt;
        arg.endtime ? et = moment(arg.endtime).add(1, 'd').format('X') : et;

        if (et < bt && (0 != bt && 0 != et)) {
            cb(returnData.createError(returnData.errorType.paraerror, '查询结束时间小于开始时间'), null);
            return;
        } else if (0 == et && bt > 0) {
            dateQuery = ' and UNIX_TIMESTAMP(pointtime) > ' + bt;
        } else if (0 == bt && et > 0) {
            dateQuery = ' and UNIX_TIMESTAMP(pointtime) < ' + et;
        } else if (et >= bt && 0 != et && 0 != bt) {
            dateQuery = 'and  (UNIX_TIMESTAMP(pointtime) >= ' + bt + ' and UNIX_TIMESTAMP(pointtime) <= ' + et + ')';
        }
    } catch (error) {
        cb(returnData.createError(returnData.errorType.paraerror, '订单查询时间解析出错'), null);
        return;
    }

    var orginquery = multiline(function () {/*
        SELECT DATE_FORMAT(pointtime,'%Y%m%d') days,sum(point) point from 
        (SELECT a.*,b.areacode FROM
        propointdetail a
        LEFT JOIN
        customer b
        ON
        a.custid = b.custid
        #areaFilter#)c
        WHERE
        changemode not in ('order','out','pointlottery')
        #dateQuery#
        GROUP BY days
     */
    });

    orginquery = orginquery.replace('#areaFilter#', areaFilter)
        .replace('#dateQuery#', dateQuery);

    function _combine(list) {
        cb(null, returnData.createData(list));
    }

    function _fail(err) {
        logger.error(arg.currentuser.useraccount, "/analyze/orderanalyze", err.message);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow), "数据库错误:" + err.message);
    }

    var ep = new eventproxy();

    //注册最后处理事件
    ep.all('gen', _combine);

    db.sequelize.query(orginquery).spread(function (result, metadata) {
        ep.emit('gen', result);
    }, _fail);
}

exports.rqprogress = rqprogress;
exports.lotteryanalyinfo = lotteryanalyinfo;
exports.lotteryarea = lotteryarea;
exports.lotterydate = lotterydate;
exports.lotterytimes = lotterytimes;
exports.qaprogress = qaprogress;
exports.qaanalyze = qaanalyze;
exports.qalist = qalist;
exports.qaanalyzenum = qaanalyzenum;
exports.answeranalyze = answeranalyze;
exports.customerarea = customerarea;
exports.customerdate = customerdate;
exports.customernumbers = customernumbers;
exports.orderanalyze = orderanalyze;
exports.pointcomponent = pointcomponent;
exports.pointcomponentoverview = pointcomponentoverview;
exports.pointgentrade = pointgentrade;
//test commit