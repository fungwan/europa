/**
 * Created by shuwei on 15/12/23.
 */
var schedule = require('node-schedule');
var eventproxy = require('eventproxy');
var moment = require('moment');
var Sequelize = require('sequelize');

var config = require('../../config');
var logger = require('../common/logger');
var returndata = require('../common/returnData');
var projectstate = require('../models/projectstate');
var favoritesSchedule = require('./favoritesSchedule');
var mallOrderSchedule = require('./mallOrderSchedule');


var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
rule.hour = 0;
rule.minute = 1;

//预定功能(收藏夹定时检查)
var favoritesRule = '0 0 15 * * *';//30 15 8 * * *//每天的上午8点15分30秒触发
var mallOrderRule = '0 59 * * * *';//每小时触发

var job_resetno;
var job_updateprojectstate;
var job_updaterulestate;
var job_updateqouponstate;
var job_articlestate;
var job_favoritesstate;
var job_mallOrderState;

var sequelize = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password, {
    host: config.mysql.host,
    dialect: 'mysql',
    pool: config.mysql.pool,
    define: {
        freezeTableName: true,
        timestamps: true
    }
});


function padLeft(str, c, lenght) {
    if (str.length >= lenght)
        return str;
    else
        return padLeft(c + str, c, lenght);
};

function resetno(billdb) {
    var begtime = moment().format('YYYY-MM-DD');
    begtime = begtime + ' 00:00:00';
    var endtime = moment().add(1, 'days').format('YYYY-MM-DD');
    endtime = endtime + ' 00:00:00';
    billdb.findAll({
        where: {
            createtime: { $and: [{ $gte: begtime }, { $lte: endtime }] }
        },
        attributes: [
            [sequelize.fn('MAX', sequelize.col('billno')), 'billno']
        ]
    }
    ).then(function (result) {
        var now = moment();
        var nowstr = now.format('YYYYMMDD');
        var billno = nowstr + '0000000001';
        var maxno;
        if (result.length > 0) {
            maxno = result[0].billno;
        }
        global.billno = 1;
        if (maxno) {
            var time = maxno.substr(0, maxno.length - 10);
            if (time == nowstr) {
                var nustr = maxno.substr(maxno.length - 10, 10);
                var nu = parseInt(nustr);
                nu = nu + 1;
                global.billno = nu;
                billno = nowstr + padLeft(nu.toString(), '0', 10);
            }
        };
        global.datestr = nowstr;
        logger.info(null, '获取订单号成功,起始单号:' + billno);
    }).catch(function (err) {
        logger.error(null, '获取订单号失败!');
        logger.error(null, JSON.stringify(err));
    });
};

function getbillno(req, res) {
    var no = global.billno;
    if (no) {
        var str = global.datestr + padLeft(no.toString(), '0', 10);
        global.billno = no + 1;
        res.json(returndata.createData(str));
    }
    else {
        res.json(returndata.createError('unknow', '获取单号失败!'));
    }
};

function updateprojectstate(db) {
    var now = moment().format(config.dateformat);
    var fields = {
        state: projectstate.completed
    };

    db.findAll({
        where: {
            state: projectstate.start,
            enddate: { $lte: now }
        }
    }).then(function (res) {

        var projects = [];
        res.forEach(function (v, index, array) {
            var proele = v.get({ chain: true });
            projects.push(proele.projectid);
        });

        if (projects.length > 0) {

            db.update(fields, {
                where: {
                    projectid: {
                        $in: projects
                    }
                }
            }).then(function (data) {
                logger.info(config.systemUser, '更新活动状态已成功.当前时间超过结束时间，活动状态由start->completed');
            }).catch(function (error) {
                logger.error(config.systemUser, '更新活动状态失败.');
                logger.error(config.systemUser, error.message);
            })

            var dbctg2pro = sequelize.import("../models/ctg2project");
            dbctg2pro.update(fields, {
                where: {
                    projectid: {
                        $in: projects
                    }
                }
            }).then(function (data) {
                logger.info(config.systemUser, '更新活动关联商品类别表状态已成功.');
            }).catch(function (error) {
                logger.error(config.systemUser, '更新活动关联商品类别表状态失败.');
                logger.error(config.systemUser, error.message);
            })
        }

    }).catch(function (error) {
        logger.error(config.systemUser, '查询活动状态失败.');
        logger.error(config.systemUser, error.message);
    });
};

function updatearticlestate(db) {
    var now = moment().format(config.dateformat);
    var fields = {
        state: 1
    };

    db.update(fields,
        {
            where: {
                state: 0,
                publishtime: { $lte: moment().valueOf() }
            }
        }
    ).then(
        function (result) {
            fields.state = 2;
            db.update(fields, {
                where: {
                    outtime: { $lt: moment().valueOf() }
                }
            }).then(function () {
                logger.info(config.systemUser, '更新文章状态已成功.');
            }).catch(function (error) {
                logger.error(config.systemUser, '更新文章状态失败.');
                logger.error(config.systemUser, error.message);
            })
        },
        function (error) {
            logger.error(config.systemUser, '更新文章状态失败.');
            logger.error(config.systemUser, error.message);

        }
        ).catch(function (error) {
            logger.error(config.systemUser, '更新文章状态失败.');
            logger.error(config.systemUser, error.message);
        });
}

function updaterulestate(db) {
    var now = moment().format(config.dateformat);
    var fields = {
        state: "2"
    };

    db.update(fields,
        {
            where: {
                state: "1",
                endtime: { $lte: now }
            }
        }
    ).then(
        function (result) {
            logger.info(config.systemUser, '更新策略状态已成功.');
        },
        function (error) {
            logger.error(config.systemUser, '更新策略状态失败.');
            logger.error(config.systemUser, error.message);

        }
        ).catch(function (error) {
            logger.error(config.systemUser, '更新策略状态失败.' + billinfo.billno);
            logger.error(config.systemUser, error.message);
        });
}

function updateqouponstate(db) {
    var ep = new eventproxy();
    var now = moment().format(config.dateformat);
    var fields = {
        state: 'offshelf'
    };

    db.update(
        fields, {
            where: {
                state: 'sell',
                producttype: 'qoupon',
                validity_end: { $lte: now }
            }
        }).then(function (res) {
            //获取失效在售礼券成功
            //下架该部分礼券
            logger.info(config.systemUser, '自动下架礼券成功.');
        }).catch(function (err) {
            //获取失效在售礼券失败
            logger.error(config.systemUser, '自动下架礼券失败.');
            logger.error(config.systemUser, err.message);
        })


}

function init() {
    logger.info(config.systemUser, "数据库初始化表结构：bill");
    var dbbill = sequelize.import("../models/bill");
    var dbpro = sequelize.import("../models/project");
    var dbpd = sequelize.import("../models/mallproduct");
    var dbarticle = sequelize.import("../models/article");
    var dbrule = sequelize.import("../models/prolotteryrule");
    function doit() {
        job_resetno = schedule.scheduleJob(rule, function () {
            logger.info(null, '开始重新设置订单号.');
            resetno(dbbill);
        });
        resetno(dbbill);


        job_updateprojectstate = schedule.scheduleJob(rule, function () {
            logger.info(null, '开始更新活动状态.');
            updateprojectstate(dbpro);
        });
        updateprojectstate(dbpro);

        // job_articlestate = schedule.scheduleJob(rule, function () {
        //     logger.info(null, '开始更新文章状态.');
        //     updatearticlestate(dbarticle);
        // });
        // updatearticlestate(dbarticle);

        job_updateqouponstate = schedule.scheduleJob(rule, function () {
            logger.info(null, '开始更新礼券状态.');
            updateqouponstate(dbpd);
        });
        updateqouponstate(dbpd);

        job_updaterulestate = schedule.scheduleJob(rule, function () {
            logger.info(null, '开始更新策略状态.');
            updaterulestate(dbrule);
        });
        updaterulestate(dbrule)

        /*job_favoritesstate = schedule.scheduleJob(favoritesRule, function () {
            logger.info(null, '开始更新收藏夹状态.检查是否有需要推送的产品信息');
            favoritesSchedule.task(sequelize);
        });*/
        //favoritesSchedule.task(sequelize);

        job_mallOrderState = schedule.scheduleJob(mallOrderRule, function () {
            logger.info(null, '开始更新商城订单.检查是否有需要关闭的订单（超过2小时未支付的订单）');
            mallOrderSchedule.task(sequelize);
        });
        mallOrderSchedule.task(sequelize);

        
    }
    sequelize.sync().then(doit);
};



exports.getbillno = getbillno;
exports.init = init;