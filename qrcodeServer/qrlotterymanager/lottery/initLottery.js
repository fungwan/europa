/**
 * Created by Taoj on 2015/12/29.
 */
var Q = require('q');
var moment = require('moment');
var eventproxy = require('eventproxy');
var logger = require('../common/logger');
var config = require('../../config');
var db = require('../common/db');
var sequelize = require('sequelize');
var common = require('../common/common');

/**
 * 获取活动对应的奖项
 * @param projectid
 */
function getProjectLottery(pids) {
    var deferrd = Q.defer();
    var lotterydb = db.models.prolottery;
    lotterydb.findAll({
            where: {projectid: {$in: pids}},
            attributes: ['projectid', 'lotteryid', 'name',
                'prizecount', 'amount','price','summoney','mallproductname','mallproducttype','mallproductid']
        }
    ).then(function (data) {
            deferrd.resolve(data);
        }).catch(function (err) {
            deferrd.reject(err);
        });
    return deferrd.promise;
}
/**
 * 获取奖项对应的策略
 * @param projectid
 */
function getLotteryRule(pids) {
    var de = Q.defer();
    var ruledb = db.models.prolotteryrule;
    ruledb.findAll({
        where: {projectid: {$in: pids}, state: '1'}
    }).then(function (data) {
        de.resolve(data);
    }).catch(function (err) {
        de.reject(err);
    });
    return de.promise;
}
/**
 * 获取活动当前活动中奖数量
 * @param projectid
 */
function getLotteryRecordNum(pids) {
    var deferrd = Q.defer();
    var recdb = db.models.prolotteryrecord;
    recdb.findAll({
        where: {projectid: {$in: pids}},
        attributes: ['projectid', 'lotteryid', 'ruleid', [sequelize.fn('COUNT', sequelize.col('recid')), 'num']],
        group: "projectid,lotteryid,ruleid"
    }).then(function (data) {
        deferrd.resolve(data);
    }).catch(function (err) {
        deferrd.reject(err);
    });
    return deferrd.promise;
}
/**
 * 生成奖池数据
 * @param project
 * @param lottery
 * @param rule
 * @param record
 */
function generatePond(project, lottery, rule, record) {
    if (!(project.projectid in global.lotterys)) {
        global.lotterys[project.projectid] = project;
        //定义进度
        global.progress[project.projectid] = {};
        var _proPond = [];
        var _rulePond = [];
        for (var i in  lottery) {

            var lotteryele = lottery[i].get({chain:true});
            if (lotteryele.projectid === project.projectid) {
                //每一个奖项对应的已中奖数量
                var lotcount = 0;
                global.progress[project.projectid][lotteryele.lotteryid]={};
                //奖项对应的中奖纪录
                var recs = [];
                for (var r in record) {
                    var rec = record[r].get({chain:true});
                    if (rec.lotteryid === lotteryele.lotteryid) {
                        lotcount += rec.num;
                        recs.push(rec);
                    }
                }
                //奖项进度
                global.progress[project.projectid][lotteryele.lotteryid]["name"]=lotteryele.name;
                global.progress[project.projectid][lotteryele.lotteryid]["amount"]=lotteryele.amount;
                global.progress[project.projectid][lotteryele.lotteryid]["num"]=lotcount;
                //生成策略对应奖池
                var isrule = false;
                for (var r in rule) {
                    var rcount = 0;
                    if (rule[r].lotteryid === lotteryele.lotteryid) {
                        //计算rule对应的已中奖纪录
                        for (var inx in recs) {
                            if (recs[inx].ruleid === rule[r].ruleid) {
                                rcount += recs[inx].num;
                            }
                        }
                        //规则进度
                        global.progress[project.projectid][lotteryele.lotteryid][rule[r].ruleid]={};
                        global.progress[project.projectid][lotteryele.lotteryid][rule[r].ruleid]["amount"]=rule[r].amount;
                        global.progress[project.projectid][lotteryele.lotteryid][rule[r].ruleid]["num"]=rcount;
                        //生成规则奖池
                        var pcount = _rulePond.length;
                        for (var p = 0; p <  rule[r].amount - rcount - lotcount; p++) {
                            _rulePond.push({
                                id: p+pcount,
                                lotteryid: lotteryele.lotteryid,
                                name: lotteryele.name,
                                prizeid:lotteryele.mallproductid,
                                prizename:lotteryele.mallproductname,
                                prizetype:lotteryele.mallproducttype,
                                prizecount:lotteryele.prizecount,
                                price:lotteryele.price,
                                cost: lotteryele.summoney / lotteryele.amount / lotteryele.prizecount,                                
                                ruletype: rule[r].ruletype,
                                begtime: rule[r].begtime,
                                endtime: rule[r].endtime,
                                area: rule[r].area
                            });
                        }
                        isrule = true;
                    }
                }
                //生成普通奖池
                if (!isrule) {
                    var pondcount = _proPond.length;
                    for (var p = 0; p < lotteryele.amount - lotcount; p++) {
                        _proPond.push({
                            id: p+pondcount,
                            lotteryid: lotteryele.lotteryid,
                            name: lotteryele.name,
                            prizeid:lotteryele.mallproductid,
                            prizename:lotteryele.mallproductname,
                            prizetype:lotteryele.mallproducttype,
                            prizecount:lotteryele.prizecount,
                            price:lotteryele.price,
                            cost: lotteryele.summoney / lotteryele.amount / lotteryele.prizecount,
                            ruleid: null
                        });
                    }
                }
            }
        }
        global.lotterys[project.projectid]["rulepond"] = _rulePond;
        global.lotterys[project.projectid]["pond"] = _proPond;
    }
}
/**
 * 获取当前处于开始状态并且开始及结束日期之间包含今天的活动
 */
function getStartingProjects(pid) {
    var deferrd = Q.defer();
    var proxy = new eventproxy();
    var projectdb = db.models.project;
    var query = {};
    //加载状态为start的红包活动，不判定时间
    query.state = common.project.state.start;
    //query.type =  common.project.type.redpacket;
    if (!!pid) query.projectid = pid;
    function success(project, lottery, rule, record) {
        //格式{projectid:{project对象},lottery:[{id:id,name:name,amount:amount,donenum:donenum,num:num}]}
        for (var i in project) {
            generatePond(project[i].get({chain: true}), lottery, rule, record);
        }
        //处理成功返回true
        deferrd.resolve(true);
    }
    function fail(err) {
        deferrd.reject(err);
    }
    proxy.on('getrule', function (proid) {
        getLotteryRule(proid).then(function (data) {
            proxy.emit('rule', data);
        }).catch(fail);
    });
    proxy.on('getlottery', function (proid) {
        getProjectLottery(proid).then(function (data) {
            proxy.emit('lottery', data);
        }).catch(fail);
    });
    proxy.on('getrecord', function (proid) {
        getLotteryRecordNum(proid).then(function (data) {
            proxy.emit('record', data);
        }).catch(fail);
    });
    function prosuc(data) {
        if(!!pid && data.length===0){
            deferrd.reject(common.errType.noproject);
        }
        proxy.emit('project', data);
        //处理数据形成查询后续数据的条件
        var pids = [];
        for (var i in data) {
            pids.push(data[i].projectid);
        }
        proxy.emit('getlottery', pids);
        proxy.emit('getrule', pids);
        proxy.emit('getrecord', pids);
    }
    proxy.on('getproject', function () {
        projectdb.findAll({
            where: query,
            attributes: ['projectid', 'entid', 'shortname', 'name', 'percent', 'customertype', 'begdate', 'enddate', 'entname']
        }).then(prosuc).catch(fail);
    });
    proxy.all('project', 'lottery', 'rule', 'record', success);
    proxy.emit('getproject');
    return deferrd.promise;
};
/**
 * 通过id获取活动并向活动全局列表增加
 * @param pid
 */
function startProjectById(pid) {
    logger.info(pid, "start:" + pid);
    var deferrd = Q.defer();
    //根据id获取
    var _project = global.lotterys[pid];
    if (_project) {
        logger.info(config.systemUser,pid+'has exists!');
        deferrd.reject(common.errType.hasexists);
    } else {
        return getStartingProjects(pid);
    }
    return deferrd.promise;
}
/**
 * 通过id获取活动并向活动全局列表删除
 * @param pid
 */
function stopProjectById(pid) {
    logger.info(pid, "stop:" + pid);
    var deferrd = Q.defer();
    var _project = global.lotterys[pid];
    if (_project) {
        delete global.lotterys[pid];
        deferrd.resolve(pid);
    } else {
        logger.info(config.systemUser,pid+'not exists!');
        deferrd.reject(common.errType.noexists);
    }
    return deferrd.promise;
}


exports.getStartingProjects = getStartingProjects;
exports.start = startProjectById;
exports.stop = stopProjectById;
