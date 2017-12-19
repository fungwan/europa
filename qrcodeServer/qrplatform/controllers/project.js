/**
 * Created by taoj on 2015/12/14.
 */
//加载第三方模块
var uuid = require('node-uuid');
var moment = require('moment');
var Q = require("q");
var eventproxy = require('eventproxy');
var fs = require('fs');
var request = require('request');
//加载项目内部模块
var db = require('../common/db');
var logger = require('../common/logger');
var returnData = require('../common/returnData');
var vo = require('../models/vomodels');
var tool = require('../common/tool');
var config = require('../../config');
var rp = require('./rpproject');
var qa = require('./qaproject');
var point = require('./pointproject');
var onsale = require('./saleproject');
var gift = require('./giftproject');
var uploader = require('../common/uploader');
var mcdManager = require('./mcdqrmanage');

/**
 * 验证活动是否有相应的内容
 * @param id
 */
function verifyProjectStart(project) {
    var deferrd = Q.defer();

    /**
     * 验证红包
     * @private
     */
    function _vrpitems(pid, arrayType) {

        var deferrd = Q.defer();
        if (-1 === arrayType.indexOf(vo.project.lotterytypes.prolottery)) {
            deferrd.resolve(true);
        } else {
            var qrdb = db.models.prolottery;
            qrdb.findAll({
                where: { projectid: pid }
            }).then(function (res) {
                if (res.length > 0) {
                    deferrd.resolve(true);
                } else {
                    deferrd.reject(returnData.errorType.project.norpitem);
                }
            }).catch(function (err) {
                deferrd.reject(err.message);
            })
        }
        return deferrd.promise;
    }

    /**
     * 验证问卷是否设置题目
     * @private
     */
    function _vquestion(pid, arrayType) {
        var deferrd = Q.defer();
        if (-1 === arrayType.indexOf(vo.project.lotterytypes.proquestion)) {
            deferrd.resolve(true);
        } else {
            var qadb = db.models.proquestion;
            qadb.findAll({
                where: { projectid: pid }
            }).then(function (res) {
                if (res.length > 0) {
                    deferrd.resolve(true);
                } else {
                    deferrd.reject(returnData.errorType.project.noquestion);
                }
            }).catch(function (err) {
                deferrd.reject(err.message);
            })
        }

        return deferrd.promise;
    }

    /**
     * 验证积分是否设置积分
     * @private
     */
    function _vpoint(pid, arrayType) {
        var deferrd = Q.defer();
        if (-1 === arrayType.indexOf(vo.project.lotterytypes.propoint)) {
            deferrd.resolve(true);
        } else {
            var pointdb = db.models.propoint;
            pointdb.findAll({
                where: { projectid: pid }
            }).then(function (res) {
                if (res.length > 0) {
                    deferrd.resolve(true);
                } else {
                    deferrd.reject(returnData.errorType.project.nopoint);
                }
            }).catch(function (err) {
                deferrd.reject(err.message);
            });
        }
        return deferrd.promise;
    }

    /**
     * 验证满减是否设置满减
     * @private
     */
    function _vsale(pid, arrayType) {
        var deferrd = Q.defer();
        if (-1 === arrayType.indexOf(vo.project.lotterytypes.prosale)) {
            deferrd.resolve(true);
        } else {
            var sadb = db.models.prosale;
            sadb.findAll({
                where: { projectid: pid }
            }).then(function (res) {
                if (res.length > 0) {
                    deferrd.resolve(true);
                } else {
                    deferrd.reject(returnData.errorType.project.nopoint);
                }
            }).catch(function (err) {
                deferrd.reject(err.message);
            });
        }
        return deferrd.promise;
    }

    /**
 * 验证扫码送是否设置扫码送
 * @private
 */
    function _vgift(pid, arrayType) {
        var deferrd = Q.defer();
        if (-1 === arrayType.indexOf(vo.project.lotterytypes.progift)) {
            deferrd.resolve(true);
        } else {
            var giftdb = db.models.progift;
            giftdb.findAll({
                where: { projectid: pid }
            }).then(function (res) {
                if (res.length > 0) {
                    deferrd.resolve(true);
                } else {
                    deferrd.reject(returnData.errorType.project.nopoint);
                }
            }).catch(function (err) {
                deferrd.reject(err.message);
            });
        }
        return deferrd.promise;
    }


    if (project.directory === null || project.directory === '') {
        deferrd.reject(returnData.createError(returnData.errorType.project.notype));
    } else {
        var arrayType = project.directory.split(',');
        Q.all([_vrpitems(project.projectid, arrayType)
            , _vquestion(project.projectid, arrayType)
            , _vpoint(project.projectid, arrayType)
            , _vsale(project.projectid, arrayType)
            , _vgift(project.projectid, arrayType)]).then(function (value) {
                deferrd.resolve(true);
            }, function (err) {
                deferrd.reject(returnData.createError(returnData.errorType.refuse, err));
            });
    }
    return deferrd.promise;
}

/**
 * 根据活动内容判断该活动是否有关联的商品类别和二维码
 * @param project
 */
function verifyCategory(project) {
    var deferrd = Q.defer();
    (function () {
        var d = Q.defer();
        var categorydb = db.models.ctg2project;
        categorydb.findAll({
            attributes: ['categoryid'],
            where: {
                entid: project.entid,
                projectid: project.projectid
            }
        }).then(function (data) {
            d.resolve(data);
        }).catch(function (err) {
            d.reject(err.message);
        });
        return d.promise;
    })().then(function (data) {
        var ctgArray = [];
        data.forEach(function (v, index, array) {
            var ele = v.get({ chain: true });
            ctgArray.push(ele.categoryid);
        });
        var queryCtg = {};
        queryCtg.entid = project.entid;
        queryCtg.state = 'start';
        if (ctgArray.length > 0) {
            queryCtg.categoryid = {
                $in: ctgArray
            };
            var categorydb = db.models.ctg2project;
            categorydb.findAll({
                where: queryCtg
            }).then(function (data) {
                if (data.length > 0) {
                    logger.error(project.entname, '关联的商品类别正被其他活动启用中');
                    deferrd.reject(returnData.createError(returnData.errorType.project.categoryused));
                } else {
                    //获取活动关联的类别商品的二维码个数
                    var qrbatchdb = db.models.proqrcodebatch;
                    qrbatchdb.sum('amount', {
                        where: {
                            entid: project.entid,
                            categoryid: { $in: ctgArray }
                        }
                    }).then(function (qramounts) {
                        if (qramounts > 0) {
                            deferrd.resolve(qramounts);
                        } else {
                            logger.error(project.entname, '该类活动没有生成二维码');
                            deferrd.reject(returnData.createError(returnData.errorType.project.notenoughqramount));
                        }
                    }).catch(function (err) {
                        deferrd.reject(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message));
                    })
                }
            }).catch(function (err) {
                logger.error(project.entname, err.message);
                deferrd.reject(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message));
            });
        } else {
            logger.error(project.entname, '活动没有关联的商品类别');
            deferrd.reject(returnData.createError(returnData.errorType.project.nocategory));
        }
    }).catch(function (err) {
        deferrd.reject(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message));
    })

    return deferrd.promise;
}

/**
 * 根据活动内容结算该笔活动商家需要支付的费用
 * @param project
 */
function settleProject(project, cb) {

    var arrayType = project.directory.split(',');
    var pid = project.projectid;
    /**
     * 红包结算
     * @private
     */
    function _vrpitems() {

        var deferrd = Q.defer();
        if (-1 === arrayType.indexOf(vo.project.lotterytypes.prolottery)) {
            deferrd.resolve(0);
        } else {
            var qrdb = db.models.prolottery;
            qrdb.sum('summoney', {
                where: { projectid: pid }
            }).then(function (res) {
                deferrd.resolve(res);
            }).catch(function (err) {
                deferrd.reject(err.message);
            })
        }
        return deferrd.promise;
    }

    /**
     * 满减结算
     * @private
     */
    function _vsale() {
        var deferrd = Q.defer();
        if (-1 === arrayType.indexOf(vo.project.lotterytypes.prosale)) {
            deferrd.resolve(0);
        } else {
            var sadb = db.models.prosale;
            sadb.findAll({
                where: { projectid: pid }
            }).then(function (res) {
                if (res.length > 0) {
                    var condition = res[0].get({ chain: true }).condition;
                    var redpacket = res[0].get({ chain: true }).redpacket;
                    var qramounts = project.qramounts;
                    var summoney = Math.ceil(qramounts / condition) * redpacket;
                    deferrd.resolve(summoney);
                } else {
                    deferrd.reject(returnData.errorType.project.nosale);
                }
            }).catch(function (err) {
                deferrd.reject(err.message);
            });
        }
        return deferrd.promise;
    }

    /**
     * 扫码送结算
     * @private
     */
    function _vgift() {
        var deferrd = Q.defer();
        if (-1 === arrayType.indexOf(vo.project.lotterytypes.progift)) {
            deferrd.resolve(0);
        } else {
            var giftdb = db.models.progift;
            giftdb.sum('summoney', {
                where: { projectid: pid }
            }).then(function (res) {
                deferrd.resolve(res);
            }).catch(function (err) {
                deferrd.reject(err.message);
            });
        }
        return deferrd.promise;
    }

    Q.all([_vrpitems(), _vsale(), _vgift()]).then(function (value) {
        var summoney = value[0] + value[1] + value[2];
        cb(null, { total: summoney });
    }).catch(function (err) {
        cb(err, '')
    });

}
/**
 * 根据企业id判断企业是否有余额开启红包活动
 * @param id
 */
function verifyBalance(id, project) {

    //当活动前置状态为editing时，验证所开始的活动涉及的总金额
    var deferrd = Q.defer();
    var entdb = db.models.sysenterprise;
    if (project.state === vo.project.state.editing) {
        logger.info(id, "验证企业余额：");
        entdb.findOne({ where: { entid: id } }).then(function (data) {
            if (data && data.balance > 0) {
                settleProject(project, function (err, settledata) {
                    if (err == null) {
                        var expectMoney = settledata.total;
                        if (expectMoney > data.balance) {
                            logger.info(id, "验证企业余额未通过");
                            deferrd.reject(returnData.createError(returnData.errorType.project.nomoney));
                        } else {
                            logger.info(id, "验证企业余额通过,扣除该企业余额");
                            var balance = 'balance - ' + expectMoney;
                            var updateBalancesql = 'UPDATE sysenterprise set balance = IF((' + balance + ') < 0,0,' + balance + ') WHERE entid = \'';
                            updateBalancesql += project.entid + '\'';
                            db.sequelize.query(updateBalancesql).spread(function (results, metadata) {
                                logger.info(project.entid, "更新企业余额成功。");
                                deferrd.resolve(true);
                            }, function (err) {
                                logger.info(project.entid, "更新企业余额失败：" + err.message);
                                deferrd.reject(returnData.createError(returnData.errorType.unknow, err.message));
                            });
                        }
                    } else {
                        deferrd.reject(returnData.createError(returnData.errorType.unknow, err.message));
                    }
                })
            } else {
                logger.info(id, "验证企业余额未通过");
                deferrd.reject(returnData.createError(returnData.errorType.project.nomoney));
            }
        }).catch(function (err) {
            logger.error(id, "验证企业余额出错：", err);
            deferrd.reject(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message));
        });
    } else {
        deferrd.resolve(true);
    }

    return deferrd.promise;
}
/**
 * 根据活动id获取活动基本信息
 * @param arg 参数
 * @param callback 回调函数
 * @returns {*|promise}
 */
function getProjectById(id, entid) {
    var prodb = db.models.project;
    var deferred = Q.defer();
    var query = {};
    query.$or = [{ projectid: id }, { qrid: id }];
    if (!!entid) {
        query.entid = entid;
    }
    prodb.findOne({ where: query }).then(function (data) {
        if (data) {
            deferred.resolve(data);
        } else {
            deferred.reject(new Error(returnData.errorType.notexist));
        }
    }).catch(function (err) {
        deferred.reject(err);
    });
    return deferred.promise;
}
/**
 * 对project/update对象进行参数验证，失败则返回参数验证失败,仅验证基本信息
 * @param project
 */
function verifyParam(project) {
    //验证项目名称
    if (!!project.name && project.name.length > 50) {
        return false;
    }
    //验证活动标题不能为空、去除空格后也不能为空
    if (!project.name) {
        return false;
    }
    if (project.name) {
        project.name = project.name.trim();
        if (!project.name) {
            return false;
        }
    }
    //验证projectid格式
    if (!!project.projectid && !tool.verifier.isUUID(project.projectid)) {
        return false;
    }
    //验证decription字符长度
    if (!!project.description && project.description.length > 1000) {
        return false;
    }

    //验证开始日期
    if (!project.begdate || (!!project.begdate && !tool.verifier.isDate(project.begdate))) {
        return false;
    }
    //验证结束日期
    if (!project.enddate || (!!project.enddate && !tool.verifier.isDate(project.enddate))) {
        return false;
    }
    //验证开始日期是否大于结束日期
    if (moment(project.begdate).diff(moment(project.enddate)) > 0) {
        return false;
    }

    //验证客户类型
    if (!!project.customertype && vo.project.custtypes.indexOf(project.customertype) === -1) {
        return false;
    }
    //验证shortname
    if (!!project.shortname && project.shortname.length > 20) {
        return false;
    }

    return true;
}

/**
 * 对project/update对象进行参数验证，失败则返回参数验证失败
 * @param project
 */

function verifyParamold(project) {
    //验证项目名称
    if (!!project.name && project.name.length > 50) {
        return false;
    }
    //验证活动标题不能为空、去除空格后也不能为空
    if (!project.name) {
        return false;
    }
    if (project.name) {
        project.name = project.name.trim();
        if (!project.name) {
            return false;
        }
    }
    //验证projectid格式
    if (!!project.projectid && !tool.verifier.isUUID(project.projectid)) {
        return false;
    }
    //验证decription字符长度
    if (!!project.description && project.description.length > 200) {
        return false;
    }
    //验证活动类别type不能为空
    if (!project.type) {
        return false;
    }
    //验证开始日期
    if (!project.begdate || (!!project.begdate && !tool.verifier.isDate(project.begdate))) {
        return false;
    }
    //验证结束日期
    if (!project.enddate || (!!project.enddate && !tool.verifier.isDate(project.enddate))) {
        return false;
    }
    //验证开始日期是否大于结束日期
    if (moment(project.begdate).diff(moment(project.enddate)) > 0) {
        return false;
    }
    //验证中奖率
    if (project.type === vo.project.type.redpacket && !!project.percent && !tool.verifier.isFloat(project.percent)) {
        return false;
    }
    //验证客户类型
    if (!!project.customertype && vo.project.custtypes.indexOf(project.customertype) === -1) {
        return false;
    }
    //验证shortname
    if (!!project.shortname && project.shortname.length > 20) {
        return false;
    }
    //验证奖项设置
    if ("config" in project) {
        if ("qaitems" in project.config) {
            for (var i in project.config.qaitems) {
                if (project.config.qaitems[i].answer)
                    project.config.qaitems[i].answer = project.config.qaitems[i].answer.trim();
                if (project.config.qaitems[i].name)
                    project.config.qaitems[i].name = project.config.qaitems[i].name.trim();
                //验证问卷编号，验证为uuid
                if (project.config.qaitems[i].qaid && !tool.verifier.isUUID(project.config.qaitems[i].qaid)) {
                    return false;
                }
                if ((project.config.qaitems[i].number && project.config.qaitems[i].number > 100) || (project.config.qaitems[i].number && project.config.qaitems[i].number < 1)) {
                    return false;
                }
                //验证问卷名称字符，必填且不能超50
                if (!project.config.qaitems[i].name || (!!project.config.qaitems[i].name && project.config.qaitems[i].name.length > 50)) {
                    return false;
                }
                //验证问卷答案字符，必填且不能超500
                if (!project.config.qaitems[i].answer || (!!project.config.qaitems[i].answer && project.config.qaitems[i].answer.length > 500)) {
                    return false;
                }
                //问卷类型
                if (!project.config.qaitems[i].qatype || (!!project.config.qaitems[i].qatype && !tool.verifier.isInteger(project.config.qaitems[i].qatype))) {
                    return false;
                }
                //问卷序号
                if (!project.config.qaitems[i].number || (!!project.config.qaitems[i].number && !tool.verifier.isInteger(project.config.qaitems[i].number))) {
                    return false;
                }
            }
        }
        if ("pointitems" in project.config) {
            if (project.config.pointitems && project.config.pointitems > 10000) {
                return false;
            }
            //积分量
            if (!project.config.pointitems || (!!project.config.pointitems && !tool.verifier.isInteger(project.config.pointitems))) {
                return false;
            }
        }
        if ("rpitems" in project.config) {
            var rpnames = [];
            for (var i in project.config.rpitems) {
                //验证奖项名称是否重复,提出空格
                if (rpnames.indexOf(project.config.rpitems[i].name.trim()) > -1) {
                    return false;
                } else {
                    rpnames.push(project.config.rpitems[i].name.trim());
                }
                //验证奖项名称字符，必填且不能超10
                if (!project.config.rpitems[i].name || (!!project.config.rpitems[i].name && project.config.rpitems[i].name.length > 10)) {
                    return false;
                }
                //验证奖项编号是否为UUID
                if (project.config.rpitems[i].lotteryid && !tool.verifier.isUUID(project.config.rpitems[i].lotteryid)) {
                    return false;
                }

                if (!("price" in project.config.rpitems[i]) || !tool.verifier.isFloat(project.config.rpitems[i].price)) {
                    return false;
                }
                //奖项单个金额，必填必须为数值
                if (project.config.rpitems[i].price < 0) {
                    return false;
                }
                //奖项个数，必填且为整数
                if (!project.config.rpitems[i].amount || (!!project.config.rpitems[i].amount && !tool.verifier.isInteger(project.config.rpitems[i].amount))) {
                    return false;
                }
                //奖项规则验证
                if ("lotteryrule" in project.config.rpitems[i]) {
                    var ruleamount = 0;
                    for (var j in project.config.rpitems[i].lotteryrule) {
                        //生效开始时间，必填 时间格式
                        if (!tool.verifier.isDateTime(project.config.rpitems[i].lotteryrule[j].begtime)) {
                            return false;
                        }
                        //生效结束时间，必填 时间格式
                        if (!tool.verifier.isDateTime(project.config.rpitems[i].lotteryrule[j].endtime)) {
                            return false;
                        }
                        //验证开始日期是否大于结束日期
                        if (moment(project.config.rpitems[i].lotteryrule[j].begtime).diff(moment(project.config.rpitems[i].lotteryrule[j].endtime)) > 0) {
                            return false;
                        }
                        //奖项策略对应奖项数量
                        if (!tool.verifier.isInteger(project.config.rpitems[i].lotteryrule[j].amount) || parseInt(project.config.rpitems[i].lotteryrule[j].amount) > parseInt(project.config.rpitems[i].amount) || project.config.rpitems[i].lotteryrule[j].amount <= 0) {
                            return false;
                        }
                        //奖项类型，必填
                        if (!project.config.rpitems[i].lotteryrule[j].ruletype || vo.project.ruletypes.indexOf(project.config.rpitems[i].lotteryrule[j].ruletype) === -1) {
                            return false;
                        }
                        //判断策略状态
                        if (!project.config.rpitems[i].lotteryrule[j].state || vo.project.rulestates.indexOf(project.config.rpitems[i].lotteryrule[j].state) === -1) {
                            return false;
                        }
                        ruleamount += parseInt(project.config.rpitems[i].lotteryrule[j].amount);
                    }
                    //判断策略设置中奖数量是否比奖项对应的总个数比较
                    if (ruleamount > parseInt(project.config.rpitems[i].amount)) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

/**
 * 对project/list对象进行参数验证，失败则返回参数验证失败
 * @param project
 */
function verifylistParam(query) {
    //验证开始日期
    if (!!query.begdate && !tool.verifier.isDate(query.begdate)) {
        return false;
    }
    //验证结束日期
    if (!!query.enddate && !tool.verifier.isDate(query.enddate)) {
        return false;
    }
    if (!!query.begdate && !!query.enddate) {
        if (moment(query.begdate).diff(moment(query.enddate)) > 0) {
            return false;
        }
    }
    return true;
}

function getThanksJoinAmounts(entid, projectid) {

    var d = Q.defer();

    //找到指定活动关联的商品类型
    function findCtgs() {
        var d = Q.defer();
        var ctg2projectdb = db.models.ctg2project;
        ctg2projectdb.findAll({
            where: {
                projectid: projectid
            }
        }).then(function (res) {
            if (res.length > 0) {
                var ctgArray = [];
                for (var i = 0; i < res.length; ++i) {
                    var ctgInstance = res[i].get({ 'chain': true });
                    ctgArray.push(ctgInstance.categoryid);
                }
                d.resolve(ctgArray);
            } else {
                d.reject(returnData.createError(returnData.errorType.project.nocategory, ''), null);
            }
        }).catch(function (err) {
            d.reject(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
        });
        return d.promise;
    }

    //获取总二维码个数
    function getTotalAmounts(ctgArray) {
        var d = Q.defer();
        var amountsInfo = {}; amountsInfo.totalAmounts = 0;
        if (ctgArray.length == 0) {
            d.resolve(amountsInfo);
        } else {

            var tmp = '';
            for (var i = 0; i < ctgArray.length; ++i) {
                tmp += "'" + ctgArray[i] + "',";
            }

            tmp = tmp.substr(0, tmp.length - 1);
            var v_merchandise = mcdManager.getMcdView({ entid: entid });
            //var t = 'SELECT count(qrid) as count from proqrcode where batchid in (SELECT batchid from proqrcodebatch where categoryid in ('
            //t += tmp + ')) and state = 0';            
            var t = 'SELECT sum(count) as count from proqrcodebatch where categoryid in ('
            t += tmp + ') and state = 1';
            db.sequelize.query(t, { type: db.sequelize.QueryTypes.SELECT })
                .then(function (res) {
                    amountsInfo.totalAmounts = res[0].count;
                    d.resolve(amountsInfo);
                }).catch(function (err) {
                    d.reject(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
                });
        }
        return d.promise;
    }

    //获取已经设置好的中奖个数
    function getLotteryAmounts(amountsInfo) {

        var d = Q.defer();
        var lotterydb = db.models.prolottery;
        lotterydb.sum('amount', {
            where: {
                projectid: projectid
            }
        }).then(function (res) {
            amountsInfo.lotteryAmounts = res;
            d.resolve(amountsInfo);
        }).catch(function (err) {
            d.reject(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
        });

        return d.promise;
    }

    function getFinallyAmounts(amountsInfo) {

        var d = Q.defer();
        var thanksJoinAmounts = amountsInfo.totalAmounts - amountsInfo.lotteryAmounts;
        if (thanksJoinAmounts < 0) {
            logger.error(config.systemUser, '二维码个数不够');
            d.reject(returnData.createError(returnData.errorType.project.notenoughqramount));
        } else {
            var _returnData = {
                projectid: projectid,
                amount: thanksJoinAmounts
            };

            d.resolve(_returnData);
        }
        return d.promise;
    }

    findCtgs()
        .then(getTotalAmounts)
        .then(getLotteryAmounts)
        .then(getFinallyAmounts)
        .then(function (res) {
            d.resolve(res);
        }, function (err) {
            d.reject(err);
        }).catch(function (err) {
            d.reject(err);
        });

    return d.promise;

}

/**
 * 更改活动状态
 * @param id 活动id
 * @param state 需要更改的状态
 * @param pstate 更改的前置状态(如将当前数据数据变更为start，则需要该活动当前的状态为editing或stop)
 * @param callback 回调函数
 */
function updateProjectStateById(project, entid, state, pstate, callback) {
    var proxy = new eventproxy();
    proxy.on('update', function (data) {
        if (data) {
            if (pstate.indexOf(data.state) > -1) {
                var preState = data.state;
                data.state = state;
                var arrayType = [];
                arrayType = data.directory.split(',');

                //如果是抽奖类型，则要计算‘谢谢参与的个数’，同时并更新奖池数据
                var lotteryitem = false;
                db.sequelize.transaction(function (t) {
                    /**
                     * 更新活动与商品类型的关系映射表
                     */
                    function updateCtg2Project() {
                        var d = Q.defer();
                        var ctg2projectdb = db.models.ctg2project;
                        ctg2projectdb.update({ state: data.state }, {
                            where: {
                                projectid: data.projectid
                            },
                            transaction: t
                        }).then(function (res) {
                            d.resolve(true);
                        }).catch(function (err) {
                            d.reject(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
                        });
                        return d.promise;
                    }

                    function projectStateSave() {
                        var d = Q.defer();
                        var projectdb = db.models.project;
                        projectdb.update(data, { where: { projectid: data.projectid }, transaction: t }).then(function (res) {
                            d.resolve(data);
                        }).catch(function (err) {
                            d.reject(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
                        });
                        return d.promise;
                    }

                    function insertThanksJoinAmounts(vo) {
                        var d = Q.defer();
                        if (0 === vo.amount) {
                            d.resolve(true);
                            return d.promise;
                        }
                        var lotterydb = db.models.prolottery;

                        var lotteryvo = {
                            lotteryid: uuid.v4(),
                            projectid: vo.projectid,
                            name: '谢谢参与',
                            prizecount: 1,
                            price: 0,
                            mallproducttype: 'thanks',
                            mallproductname: '谢谢参与',
                            mallproductid: 'thanks',
                            amount: vo.amount,
                            summoney: 0
                        };

                        lotterydb.create(lotteryvo, { transaction: t }).then(function (res) {
                            d.resolve(res);
                        }).catch(function (err) {
                            d.reject(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
                        })

                        return d.promise;
                    }

                    if ((-1 !== arrayType.indexOf(vo.project.lotterytypes.prolottery))
                        && state === vo.project.state.start
                        && (preState === vo.project.state.editing)) {
                        lotteryitem = true;
                        return getThanksJoinAmounts(entid, data.projectid)
                            .then(insertThanksJoinAmounts)
                            .then(projectStateSave)
                            .then(updateCtg2Project)
                    } else {
                        return projectStateSave()
                            .then(updateCtg2Project)
                    }

                }).then(function (result) {                    
                    if (lotteryitem) syncLotteryPond(data.projectid, state);
                    callback(null, returnData.createData({ projectid: data.projectid, state: state/*, gen: data.gen*/ }));
                }).catch(function (err) {
                    callback(err, null);
                });

            } else {
                logger.info(data.name, '******更改活动状态失败!******');
                callback(returnData.createError(returnData.errorType.refuse, '更改活动状态失败!'), null);
            }
        } else {
            logger.info(config.systemUser, '******没有该活动数据!******');
            callback(returnData.createError(returnData.errorType.notexist, '未找到活动数据'), null);
        }
    });
    proxy.on('error', function (errCode, err) {
        if (err && typeof err === "error") {
            logger.error(config.systemUser, err.message);
        }
        callback(returnData.createError(returnData.errorType.refuse, '更改活动状态失败!'), null);
    });
    proxy.emit('update', project.get({ chain: true }));
}
/**
 * 在活动开始或停止时，向奖池同步
 * @param id
 */
function syncLotteryPond(id, state) {
    var syncurl = null;
    switch (state) {
        case vo.project.state.start:
            syncurl = config.services.qrlotterymanager.url + config.services.qrlotterymanager.interfaces.start;
            break;
        case vo.project.state.stop:
            syncurl = config.services.qrlotterymanager.url + config.services.qrlotterymanager.interfaces.stop;
            break;
        default:
            return;
    }
    request.post({ url: syncurl, form: { "projectid": id } }, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            var d = JSON.parse(body);
            if (!!d.data) {
                logger.info(id, "向奖池增加成功！" + state);
            } else {
                logger.info(id, "向奖池增加失败：" + d + state);
            }
        } else {
            logger.error(id, "向奖池增加出错：" + state, err);
        }
    });
}
/**
 * 获取活动列表
 * @param arg
 * @param callback
 */
exports.prolist = function (arg, callback) {
    logger.info(arg.currentuser.useraccount, '******开始获取活动列表!******');
    var projectdb = db.models.project;
    projectdb.findAll({
        attributes: ['projectid', 'name', 'type'],
        where: { entid: arg.currentuser.entid },
        order: 'createtime desc'
    }).then(function (data) {
        if (data) {
            logger.info(arg.currentuser.useraccount, '******完成获取活动列表!******' + data);
            callback(null, returnData.createData(data));
        } else {
            logger.error(arg.currentuser.useraccount, '******获取活动列表时出错!******');
            callback(returnData.createError(returnData.errorType.notexist, "未找到活动数据"), null);
        }
    }).catch(function (err) {
        logger.error(arg.currentuser.useraccount, err.message);
        callback(returnData.createError(returnData.errorType.unknow, err.message), null);
    })
}
/**
 * 获取活动列表
 * @param arg
 * @param callback
 */
exports.list = function (arg, callback) {
    logger.info(arg.currentuser.useraccount, '******开始获取红包活动数据列表!******');
    var projectdb = db.models.project;
    var proxy = new eventproxy();
    var query = {};
    if (!!arg.query && !tool.verifier.isEmptyString(arg.query)) {
        try {
            query = JSON.parse(arg.query)
            for (var obj in query) {
                if (!query[obj] || !query[obj].trim()) {
                    delete query[obj];
                }
            }
        } catch (error) {
            logger.error(arg.currentuser.useraccount, "解析参数query出错：" + query);
            callback(returnData.createError(returnData.errorType.paraerror, "参数错误"));
            return;
        }
    }
    var page = arg.page || 1,
        size = arg.size || 10;
    page = tool.getInt(page);
    size = tool.getInt(size);
    query.entid = arg.currentuser.entid;

    if (query.key) {
        query.key = query.key.replace(/%/ig, "\\%").replace(/_/ig, "\\_");
        query.key = query.key.trim();
        if (!!query.key) {
            query.$or = [{ name: { $like: '%' + query.key + '%' } }, { description: { $like: '%' + query.key + '%' } }];
        }
        delete query.key;
    }
    proxy.on('error', function (errCode, err) {
        if (err && typeof err === "error") {
            logger.error(config.systemUser, err.message);
        }
        callback(returnData.createError(errCode), null);
    });
    function _getProject() {
        if (query.enddate) {
            query.enddate = { $lt: tool.queryenddate(query.enddate) };
        }
        if (query.begdate) {
            query.begdate = { $gte: query.begdate };
        }
        projectdb.findAndCountAll({
            attributes: ['projectid', 'name', 'begdate', 'enddate', 'description', 'type', 'state', 'qramounts', 'percent', 'customertype', 'qrid', 'progress', 'gen'],
            where: query,
            offset: projectdb.pageOffset(page, size),
            limit: size,
            order: 'createtime desc'
        }).then(function (data) {
            if (data) {
                logger.info(arg.currentuser.useraccount, '******完成获取活动数据列表!******');
                result = {};
                count = data.count;
                result.data = data.rows;
                result.totalpage = totalpage(count, size);
                result.page = page;
                result.size = size;
                result.totalsize = count;
                callback(null, returnData.createData(result));
            } else {
                logger.error(arg.currentuser.useraccount, '******获取活动数据列表时出错!******');
                callback(returnData.createError(returnData.errorType.notexist, "未找到活动数据"), null);
            }
        }).catch(function (err) {
            logger.error(arg.currentuser.useraccount, err.message);
            callback(returnData.createError(returnData.errorType.unknow, err.message), null);
        })
    }

    //先验证参数然后执行保存
    if (verifylistParam(query)) {
        _getProject();
    } else {
        callback(returnData.createError(returnData.errorType.project.badparam), null);
    }

    logger.info(arg.currentuser.useraccount, '******完成查询活动数据!******');
}
/**
 * 获取单个红包活动基本信息
 * @param arg
 * @param callback
 */
exports.getold = function (arg, callback) {
    logger.info(arg.currentuser.useraccount, '******开始获取单个活动数据!******');
    var proxy = new eventproxy();
    proxy.on('getdata', function (data) {
        if (!data) {
            proxy.emit('error', returnData.errorType.notexist);
        } else {
            data = data.get({ chain: true });
            switch (data.type) {
                case vo.project.type.redpacket:
                    rp.get(data, callback);
                    break;
                case vo.project.type.question:
                    qa.get(data, callback);
                    break;
                case vo.project.type.point:
                    point.get(data, callback);
                    break;
                default:
                    proxy.emit("error", returnData.errorType.project.notype);
                    break;
            }
        }
    })
    proxy.on('error', function (errCode, err) {
        if (err && typeof err === "error") {
            logger.error(config.systemUser, err.message);
        }
        callback(returnData.createError(errCode), null);
    });
    //获取数据
    getProjectById(arg.projectid, arg.currentuser.entid).then(function (data) {
        proxy.emit('getdata', data);
    }, function (err) {
        proxy.emit('error', returnData.errorType.unknow, err);
    });
    logger.info(arg.currentuser.useraccount, '******获取单个活动数据完成!******');
}

/**
 * 获取单个红包活动基本信息，不包含奖项的配置信息
 * @param arg
 * @param callback
 */
exports.get = function (arg, cb) {

    var proxy = new eventproxy();

    proxy.on('error', function (errCode, err) {
        var errmsg = '获取指定活动出错';
        logger.error(arg.currentuser.useraccount, '******' + errmsg + '*****' + err.message);
        cb(returnData.createError(errCode, err.message), null);
    });

    proxy.on("nodata", function () {
        var errmsg = '未找到指定的活动';
        logger.error(arg.currentuser.useraccount, '******' + errmsg + '*****活动ID:' + arg.projectid);
        cb(returnData.createError(returnData.errorType.notexist, errmsg), null);
    });

    var prodb = db.models.project;

    getProjectById(arg.projectid, arg.currentuser.entid).then(function (data) {
        if (data) {
            cb(null, returnData.createData(data));
        } else {
            proxy.emit('nodata', returnData.errorType.notexist);
        }
    }, function (err) {
        proxy.emit('error', returnData.errorType.unknow, err);
    });
}

/**
 * 获取不同类型的奖项配置内容信息
 * @param arg
 * @param callback
 */
exports.lotteryget = function (arg, callback) {

    if (!arg.currentuser) {
        arg.currentuser = {};
        arg.currentuser.useraccount = 'previewUser';
    }
    logger.info(arg.currentuser.useraccount, '******开始获取单个活动不同类型的奖项配置数据!******');

    var lotterytype = arg.type;

    var projectdb = db.models.project;
    projectdb.findOne({
        where: { projectid: arg.projectid }
    }).then(function (data) {
        if (data) {
            try {
                var projectinfo = data.get({ chain: true });
                var cpType = projectinfo.directory === null ? cpType = '' : cpType = projectinfo.directory;
                var arrayType = cpType.split(','); projectinfo.lotteryState = true;
                if (-1 === arrayType.indexOf(lotterytype)) {
                    projectinfo.lotteryState = false;
                }
                projectinfo.currentuser = arg.currentuser;
                switch (lotterytype) {
                    case vo.project.lotterytypes.progift:
                        gift.get(projectinfo, callback);
                        break;
                    case vo.project.lotterytypes.prolottery:
                        rp.get(projectinfo, callback);
                        break;
                    case vo.project.lotterytypes.propoint:
                        point.get(projectinfo, callback);
                        break;
                    case vo.project.lotterytypes.proquestion:
                        qa.get(projectinfo, callback);
                        break;
                    case vo.project.lotterytypes.prosale:
                        onsale.get(projectinfo, callback);
                        break;
                    default:
                        callback(returnData.createError(returnData.errorType.project.notype, '不存在的奖项类型'), null);
                        break;
                }
            } catch (err) {
                callback(returnData.createError(returnData.errorType.unknow, err), null);
            }


        } else {
            callback(returnData.createError(returnData.errorType.project.notype, '不存在的奖项类型'), null);
        }
    }).catch(function (err) {
        callback(returnData.createError(returnData.errorType.unknow, err), null);
    })
}

/**
 *更新不同类型的奖项配置内容信息
 * @param arg
 * @param callback
 */
exports.lotteryupdate = function (arg, cb) {

    var proxy = new eventproxy();

    proxy.on('error', function (err) {
        var errmsg = '更新活动奖项配置出错';
        logger.error(arg.currentuser.useraccount, '******' + errmsg + '*****' + err);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err), null);
    });

    try {
        var pro = JSON.parse(arg.lottery);
    } catch (error) {
        cb(returnData.createError(returnData.errorType.verifyError.formatError, error.message), null);
        return;
    }

    var projectid = pro.projectid;
    if (!(pro.type in vo.project.lotterytypes)) {
        cb(returnData.createError(returnData.errorType.project.notype, '没有指定的奖项类型'), null);
        return;
    }

    var projectdb = db.models.project;

    projectdb.findOne({ where: { projectid: projectid } }).then(function (data) {
        if (data) {
            var _resObj = data.get({ chain: true });
            pro.directory = _resObj.directory;
            pro.state = _resObj.state;
            pro.percent = _resObj.percent;
            if (_resObj.state === vo.project.state.editing) {
                switch (pro.type) {
                    case vo.project.lotterytypes.progift:
                        gift.update(pro, arg.currentuser, cb);
                        break;
                    case vo.project.lotterytypes.prolottery:
                        rp.update(pro, arg.currentuser, cb);
                        break;
                    case vo.project.lotterytypes.propoint:
                        point.update(pro, arg.currentuser, cb);
                        break;
                    case vo.project.lotterytypes.proquestion:
                        qa.update(pro, arg.currentuser, cb);
                        break;
                    case vo.project.lotterytypes.prosale:
                        onsale.update(pro, arg.currentuser, cb);
                        break;
                    default:
                        cb(returnData.createError(returnData.errorType.project.notype, '没有指定的奖项类型'), null);
                        break;
                }
                return;
            } else if (_resObj.state === vo.project.state.start && pro.type === vo.project.lotterytypes.prolottery) {
                rp.update(pro, arg.currentuser, cb);//活动开始的情况下，可以更新抽奖活动的中奖策略
            } else {
                cb(returnData.createError(returnData.errorType.refuse, '活动已启动不能更新'), null);
            }
        } else {
            cb(returnData.createError(returnData.errorType.notexist, '没有找到对应活动'), null);
        }
    }, function (err) {
        proxy.emit('error');
    });
}
/**
 * 更新活动的基本信息(不包含奖项配置信息)
 * @param arg
 * @param callback
 */
exports.update = function (arg, cb) {

    var proxy = new eventproxy();

    proxy.on('error', function (errCode, err) {
        var errmsg = '更新指定活动出错';
        logger.error(arg.currentuser.useraccount, '******' + errmsg + '*****' + err);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, err), null);
    });

    try {
        var pro = JSON.parse(arg.project);
    } catch (error) {
        cb(returnData.createError(returnData.errorType.verifyError.formatError, error.message), null);
        return;
    }

    function _saveProject() {
        var projectdb = db.models.project;
        var projectvo = pro;
        projectvo.entid = arg.currentuser.entid;
        projectvo.begdate = tool.begdate(projectvo.begdate);
        projectvo.enddate = tool.enddate(projectvo.enddate);
        projectvo.description = !projectvo.description ? "" : projectvo.description;
        projectvo.qramounts = !projectvo.qramounts ? 0 : projectvo.qramounts;
        projectvo.times = !projectvo.times ? 0 : projectvo.times;
        projectvo.percent = !projectvo.percent ? 0 : projectvo.percent;
        projectvo.projectid = !projectvo.projectid ? uuid() : projectvo.projectid;
        projectvo.state = vo.project.state.editing;
        projectvo.creater = arg.currentuser.userid;
        projectvo.createtime = tool.date();
        projectvo.entname = arg.currentuser.entname;
        projectvo.customertype = '1';//1:消费者
        projectvo.qrid = Date.now();

        projectdb.findOrCreate({ where: { projectid: projectvo.projectid }, defaults: projectvo })
            .spread(function (data, created) {
                if (created) {
                    cb(null, returnData.createData(projectvo));
                } else {
                    delete projectvo.qrid;
                    data = data.get({ chain: true });
                    if (data.state === vo.project.state.editing) {
                        projectvo.creater = data.creater;
                        projectvo.createtime = data.createtime;
                        projectvo.updater = arg.currentuser.useraccount;
                        projectvo.updatetime = tool.date();
                        projectdb.update(projectvo, { where: { projectid: projectvo.projectid } }).then(function () {
                            cb(null, returnData.createData(projectvo));
                        });
                    } else {
                        logger.info(arg.currentuser.useraccount, data.projectid + '活动已启动不能更新!');
                        cb(returnData.createError(returnData.errorType.refuse, '活动已启动不能更新'), null);
                    }
                }
            });
    }

    //对同一个企业下的活动，活动名称不能相同
    proxy.on('checkproname', function () {
        var prodb = db.models.project;
        prodb.findAll({
            where: {
                entid: arg.currentuser.entid,
                name: pro.name,
                projectid: { $ne: pro.projectid }
            }
        }).then(function (data) {
            if (data.length) {
                cb(returnData.createError(returnData.errorType.exists,'不能创建重复的活动名'), null);
            } else {
                if (pro.projectid) {
                    getProjectById(pro.projectid, arg.currentuser.entid).then(function (data) {
                        if (data) {
                            _saveProject();
                        } else {
                            proxy.emit('error', returnData.errorType.notexist);
                        }
                    }, function (err) {
                        proxy.emit('error', returnData.errorType.unknow, err);
                    });
                } else {
                    _saveProject();
                }
            }
        }).catch(function (err) {
            cb(returnData.createError(returnData.errorType.dataBaseError.unknow), null);
        })
    });

    //先验证参数然后执行保存
    if (verifyParam(pro)) {
        proxy.emit('checkproname');
    } else {
        cb(returnData.createError(returnData.errorType.project.badparam), null);
    }
}

/**
 * 更新活动的基本信息
 * @param arg
 * @param callback
 */
exports.updateold = function (arg, callback) {
    logger.info(arg.currentuser.useraccount, '******开始更新活动数据!******');
    var proxy = new eventproxy();
    proxy.on('update', function (data) {
        switch (data.type) {
            case vo.project.type.redpacket:
                rp.update(data, arg.currentuser, callback);
                break;
            case vo.project.type.question:
                qa.update(data, arg.currentuser, callback);
                break;
            case vo.project.type.point:
                point.update(data, arg.currentuser, callback);
                break;
            default:
                proxy.emit("error", returnData.errorType.project.notype);
                break;
        }
    });
    proxy.on('error', function (errCode, err) {
        if (err && typeof err === "error") {
            logger.error(config.systemUser, err.message);
        }
        callback(returnData.createError(errCode), null);
    });
    var pro = JSON.parse(arg.project);

    function _saveProject() {
        if (pro.projectid) {
            getProjectById(pro.projectid, arg.currentuser.entid).then(function (data) {
                if (data) {
                    proxy.emit("update", pro);
                } else {
                    proxy.emit('error', returnData.errorType.notexist);
                }
            }, function (err) {
                proxy.emit('error', returnData.errorType.unknow, err);
            });
        } else {
            proxy.emit("update", pro);
        }
    }

    //对同一个企业下的活动，活动名称不能相同
    proxy.on('checkproname', function () {
        var prodb = db.models.project;
        prodb.findAll({
            where: {
                entid: arg.currentuser.entid,
                name: pro.name,
                projectid: { $ne: pro.projectid }
            }
        }).then(function (data) {
            if (data.length) {
                callback(returnData.createError(returnData.errorType.project.badparam), null);
            } else {
                _saveProject();
            }
        }).catch(function (err) {
            callback(returnData.createError(returnData.errorType.dataBaseError.unknow), null);
        })
    })
    //先验证参数然后执行保存
    if (verifyParam(pro)) {
        proxy.emit('checkproname');
    } else {
        callback(returnData.createError(returnData.errorType.project.badparam), null);
    }
    //verifyParam(pro).then(_saveProject, function (errCode) {
    //    proxy.emit('error', errCode)
    //}).catch();
}


/**
 * 删除红包活动数据
 * @param arg
 * @param callback
 */
exports.delete = function (arg, callback) {
    logger.info(arg.currentuser.useraccount, '******删除单个活动数据!******');
    var proxy = new eventproxy();
    proxy.on('delete', function (data) {
        if (!data) {
            proxy.emit('error', returnData.errorType.notexist);
        } else {
            //只允许在editing时删除活动数据
            if (data.state === vo.project.state.editing) {

                db.sequelize.transaction(function (t) {

                    function delProject() {
                        var deferred = Q.defer();
                        var cvPorject = deepCopy(data.get({ chain: true }));
                        var projectdb = db.models.project;
                        projectdb.destroy(
                            { where: { projectid: data.projectid }, transaction: t }
                        ).then(function (delpro) {
                            function response(err, result) {
                                if (err !== null) {
                                    logger.error(arg.currentuser.useraccount, err.error.message);
                                }
                            }
                            rp.delete(cvPorject, response);
                            qa.delete(cvPorject, response);
                            point.delete(cvPorject, response);
                            onsale.delete(cvPorject, response);
                            gift.delete(cvPorject, response);
                            deferred.resolve(true);
                        }).catch(function (err) {
                            logger.error(arg.currentuser.useraccount, '删除商品类别活动映射表出错:' + err.message);
                            deferred.reject(returnData.errorType.refuse);
                        })

                        return deferred.promise;
                    }

                    function delCtg2Project() {
                        //删除映射表ctg2project关联的ctg
                        var deferred = Q.defer();
                        var ctg2projectdb = db.models.ctg2project;
                        ctg2projectdb.destroy(
                            { where: { projectid: data.projectid }, transaction: t }
                        ).then(function (delpro) {
                            deferred.resolve(true);
                        }).catch(function (err) {
                            logger.error(arg.currentuser.useraccount, '删除商品类别活动映射表出错:' + err.message);
                            deferred.reject(returnData.errorType.refuse);
                        })
                        return deferred.promise;
                    }

                    return delProject().then(delCtg2Project);

                }).then(function (result) {
                    callback(null, returnData.createData(true));
                }).catch(function (err) {
                    proxy.emit("error", returnData.errorType.refuse);
                });

            } else {
                proxy.emit("error", returnData.errorType.refuse);
            }
        }
    })
    proxy.on('error', function (errCode, err) {
        if (err && typeof err === "error") {
            logger.error(config.systemUser, err.message);
        }
        callback(returnData.createError(errCode), null);
    });
    getProjectById(arg.projectid, arg.currentuser.entid).then(function (data) {
        proxy.emit('delete', data);
    }, function (err) {
        proxy.emit('error', returnData.errorType.unknow, err);
    });
}

/**
 * 开始红包活动(手动开始红包活动)
 * @param arg
 * @param callback
 */
exports.start = function (arg, callback) {
    logger.info(arg.currentuser.useraccount, '******开启单个活动!******');
    getProjectById(arg.projectid, arg.currentuser.entid).then(function (data) {
        //开始活动时检测是否具备活动开始条件
        var project = data.get({ chain: true });
        //验证活动结束日期是否已经过期
        if (moment().diff(moment(project.enddate)) > 0) {
            logger.info(project.projectid, "活动结束日期小于当前日期，不能start！");
            callback(returnData.createError(returnData.errorType.project.outofdate), null);
            return;
        }

        //验证活动是否关联商品类别
        verifyCategory(project).then(function (qramouts) {
            //判断企业余额是否大于0
            project.qramounts = qramouts;
            /*verifyBalance(arg.currentuser.entid, project).then(function () {

            }).catch(function (err) {
                callback(err, null);
            });*/

            //验证活动是否设置对应的内容
            verifyProjectStart(project).then(function () {
                var pstate = [vo.project.state.editing, vo.project.state.stop];
                updateProjectStateById(data, arg.currentuser.entid, vo.project.state.start, pstate, callback);
            }).catch(function (err) {
                callback(err, null);
            });
        }).catch(function (err) {
            callback(err, null);
        });

    }, function (err) {
        callback(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
    });
}
/**
 * 停止红包活动(手动停止红包活动)
 * @param arg
 * @param callback
 */
exports.stop = function (arg, callback) {
    logger.info(arg.currentuser.useraccount, '******停止单个活动!******');
    //定义改变的前置状态
    getProjectById(arg.projectid, arg.currentuser.entid).then(function (data) {
        var project = data.get({ chain: true });
        verifyBalance(arg.currentuser.entid, project).then(function () {
            var pstate = [vo.project.state.start];
            updateProjectStateById(data, arg.currentuser.entid, vo.project.state.stop, pstate, callback);
        }).catch(function (err) {
            callback(err, null);
        });
    }).catch(function () {
        callback(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
    })

}
/**
 * 二维码预览
 * @param arg
 * @param callback
 */
exports.preview = function (arg, cb) {
    var proxy = new eventproxy();

    proxy.on('error', function (errCode, err) {
        var errmsg = '获取指定活动出错';
        logger.error(arg.currentuser.useraccount, '******' + errmsg + '*****' + err.message);
        cb(returnData.createError(errCode, err.message), null);
    });

    proxy.on("nodata", function () {
        var errmsg = '未找到指定的活动';
        logger.error(arg.currentuser.useraccount, '******' + errmsg + '*****活动ID:' + arg.projectid);
        cb(returnData.createError(returnData.errorType.notexist, errmsg), null);
    });

    var prodb = db.models.project;

    getProjectById(arg.qrid).then(function (data) {
        if (data) {
            cb(null, returnData.createData(data));
        } else {
            proxy.emit('nodata', returnData.errorType.notexist);
        }
    }, function (err) {
        proxy.emit('error', returnData.errorType.unknow, err);
    });
}

/*
 *请求生成二维码
 */
exports.reqcode = function (arg, callback) {
    logger.info(arg.currentuser.useraccount, '***开始请求生成二维码***');
    var proxy = new eventproxy();
    proxy.on('qrcode', function (data) {
        var amount = 0;
        if (data.type === vo.project.type.question) {
            amount = parseInt(data.qramounts);
        } else {
            amount = Math.ceil(parseInt(data.qramounts) * config.qrpercent + parseInt(data.qramounts));
        }
        var size = 0;
        if (amount) {
            if (amount >= 10000) {
                size = config.qrcodesizemax;
            } else {
                size = config.qrcodesizemin;
            }
            var qrcodeuri = config.services.qrgenerator.url + config.services.qrgenerator.interfaces.qrcode;
            logger.info(data.projectid, "请求生成二维码数量：" + amount);
            function _response(error, response, body) {
                if (!error && response.statusCode == 200) {
                    if (body != undefined) {
                        d = JSON.parse(body);
                        if (d.error) {
                            logger.error("请求参数校验失败", d.error.message);
                            callback(returnData.createError(returnData.errorType.paraerror), null);
                        } else {
                            logger.info("获取进度和key成功", JSON.stringify(d));
                            d.data["projectid"] = data.projectid;
                            d.data["state"] = data.state;
                            d.data["gen"] = data.gen;
                            if ("success" in d.data) {
                                d.data["progress"] = 0;
                                delete d.data.success;
                                data.gen = true;
                                data.save().then(function () {
                                    d.data.gen = true;
                                    callback(null, d);
                                }).catch(function (er) {
                                    callback(null, d);
                                });
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
                form: { "projectid": data.projectid, "amount": amount, "size": size }
            }, _response);
        } else {
            logger.error(arg.currentuser.useraccount, '*请求生成的二维码数量为零*');
            callback(returnData.createError(returnData.errorType.notexist, '请求生成的二维码数量为零'), null);
        }
    })
    proxy.on('err', function (err) {
        logger.error(arg.currentuser.useraccount, '**' + err.message);
        callback(returnData.createError(returnData.errorType.unknow, err.message), null);
    });
    getProjectById(arg.projectid, arg.currentuser.entid).then(function (data) {

        //只能在开启或生成的时候请求生成二维码
        if (data.state === vo.project.state.start) {
            //调用生成二维码服务
            proxy.emit("qrcode", data);
        } else {
            callback(returnData.createError(returnData.errorType.refuse), null);
        }
    }).catch(function (err) {
        proxy.emit('err', err);
    });
}


exports.uploadbackground = function (arg, cb, req, res) {
    var form = uploader.createUpload(req, res);


    var flist = [];
    //form.on('end',function(){
    //    cb(null,returnData.createData(null,newPath));
    //});
    form.parse(req, function (err, fields, files) {

        if (err) {
            cb(returnData.createError(returnData.errorType.unknow, '上传失败!'), null);
            return;
        }

        for (var k in files) {
            var newname = uuid.v4();
            var ext = uploader.getfileext(files[k].name);
            var temp = {};
            temp.key = k;
            temp.path = config.upload.uploaddir.replace(config.staticPath + '/', '') + '/' + newname + ext;
            flist.push(temp);
            fs.renameSync(files[k].path, config.upload.uploaddir + '/' + newname + ext);  //重命名
        }

        cb(null, returnData.createData(flist));
        //fs.renameSync(files.fulAvatar.path, newPath);  //重命名
    });

};
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
 * 对象克隆
 * @param total
 * @param size
 * @returns {number}
 */
function deepCopy(source) {
    var result = {};
    for (var key in source) {
        result[key] = (typeof source[key] === 'object' && source[key] !== null) ? deepCoyp(source[key]) : source[key];
    }
    return result;
}