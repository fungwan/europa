/**
 * Created by taoj on 2015/12/22.
 */
var Q = require('q');
var moment = require('moment');
var eventproxy = require('eventproxy');
var logger = require('../common/logger');
var config = require('../../config');
var db = require('../common/db');
var sequelize = require('sequelize');
var common = require('../common/common');
var uuid = require('node-uuid');
/**
 * 产生随机数
 * @param min
 * @param max
 * @returns {*}
 */
function getRandom(min, max) {
    var range = max - min;
    var rand = Math.random();
    return (min + Math.round(rand * range));
}

/**
 * 根据qrid得到projectid
 * @param arg
 * @param callback
 * @return 
 * 
 *      {
 *          batchid:'',
 *          mcdid:'',
 *          mcdvo:Object,
 *          projectid:''
 *      }
 */
function getpidbyqrcode(qrcode) {

    /**
    * 验证是否存在,找到对应的projectid
    * 
    * 1.qrid -> batchid
    * 2.batchid ->mcdid
    * 3.mcdid -> category
    * 4.category -> project(state:start)
    */
    var obj = {};
    function getbatchid(qrcode) {
        var d = Q.defer();
        var qrdb = db.models.proqrcode;
        qrdb.findOne({
            where: {
                qrid: qrcode
            }
        }).then(function (res) {
            if (res) {
                var vo = res.get({ chain: true });
                obj.batchid = vo.batchid;
                d.resolve(obj);
            } else {
                var msg = '未找到对应二维码批次ID';
                logger.error(null, msg);
                d.reject("noexists");
            }
        }).catch(function (err) {
            d.reject(err.message);
        })
        return d.promise;
    }

    function getmcdid(obj) {
        var d = Q.defer();
        var batchdb = db.models.proqrcodebatch;
        batchdb.findOne({
            where: {
                batchid: obj.batchid
            }
        }).then(function (res) {
            if (res) {
                var vo = res.get({ chain: true });
                obj.mcdid = vo.mcdid;
                d.resolve(obj);
            } else {
                var msg = '未找到对应商品';
                logger.error(null, msg);
                d.reject("noexists");
            }
        }).catch(function (err) {
            d.reject(err.message);
        })
        return d.promise;
    }

    function getcategory(obj) {
        var d = Q.defer();
        var mcddb = db.models.merchandise;
        mcddb.findOne({
            where: {
                mcdid: obj.mcdid
            }
        }).then(function (res) {
            if (res) {
                var vo = res.get({ chain: true });
                obj.mcdvo = vo;
                d.resolve(obj);
            } else {
                var msg = '未找到对应商品类别';
                logger.error(null, msg);
                d.reject("noexists");
            }
        }).catch(function (err) {
            d.reject(err.message);
        })
        return d.promise;
    }

    function getprojectid(obj) {
        var d = Q.defer();
        var ctg2projectdb = db.models.ctg2project;
        ctg2projectdb.findOne({
            where: {
                categoryid: obj.mcdvo.categoryid,
                state: 'start'
            }
        }).then(function (res) {
            if (res) {
                var vo = res.get({ chain: true });
                obj.projectid = vo.projectid;
                d.resolve(obj);
            } else {
                var msg = '未找到正在进行的活动';
                logger.error(null, msg);
                d.reject("noproject");
            }
        }).catch(function (err) {
            d.reject(err.message);
        })
        return d.promise;
    }

    return getbatchid(qrcode)
        .then(getmcdid)
        .then(getcategory)
        .then(getprojectid);
}

/**
 * 验证qrcode是否格式错误
 * @param qrcode
 */
function isBadcode(qrcode) {
    var deferrd = Q.defer();
    //todo 验证二维码格式,返回解析后的qrid
    deferrd.resolve(qrcode);
    return deferrd.promise;
}
/**
 * qrcode是否存在,存在则返回qrcode对象
 * @param qrid
 * @returns {*|promise}
 */
function isExists(qrid) {
    var deferrd = Q.defer();
    var codedb = db.models.proqrcode;

    function success(code) {
        if (code) {
            //var data = code.get({ chain: true });
            var data = {
                qrid: qrid,
                projectid: code.projectid
            };
            deferrd.resolve(data);
        } else {
            deferrd.reject(common.errType.noexists);
        }
    };
    function fail(err) {
        deferrd.reject(/*common.errType.unknow*/err);
    };
    getpidbyqrcode(qrid).then(success).catch(fail);
    //codedb.findOne({ where: { 'qrid': qrid } }).then(success).catch(fail);
    return deferrd.promise;
}
/**
 *判断qrcode是否已抽奖,验证通过则正常返回true或已被当前用户使用则正常返回中奖纪录，中奖金额为0元时返回null，
 * 被其他人使用则以错误返回used
 * @param qrcode
 */
function isUsed(cust, qrid) {
    var deferrd = Q.defer();
    var recorddb = db.models.prolotteryrecord;

    function success(data) {
        if (!data) {
            deferrd.resolve({ name: 'prolottery', gen: false, record: '' });
            //deferrd.resolve(true);
        } else {
            if (data.custid === cust.custid) {
                //if (data.price === 0) data = null;
                //deferrd.resolve(data);
                var data = data.get({ chain: true });
                data["producttype"] = data.mallproducttype;
                deferrd.resolve({ name: 'prolottery', gen: true, record: data });
            } else {
                deferrd.reject(common.checkstate.used);
            }
        }
    };
    function fail(err) {
        deferrd.reject(common.errType.unknow);
    };
    recorddb.findOne({ where: { 'recid': qrid } }).then(success).catch(fail);
    return deferrd.promise;
}
/**
 * 验证活动有效期
 * @param projectid
 * @returns {*|promise}
 */
function isInDate(projectid) {
    var deferrd = Q.defer();
    var _project = global.lotterys[projectid];
    if (_project) {
        if (moment().isBetween(_project.begdate, _project.enddate)) {
            deferrd.resolve(true);
        } else {
            deferrd.reject(common.checkstate.outofdate);
        }
    } else {
        deferrd.reject(common.errType.noproject);
    }
    return deferrd.promise;
};
/**
 *检查是否有剩余奖项，有奖则返回true
 * @param qrcode
 */
function isHasLottery(projectid) {
    var deferrd = Q.defer();
    var _project = global.lotterys[projectid];
    if (_project && (_project.pond.length == 0 && _project.rulepond.length == 0)) {
        deferrd.reject(common.checkstate.nolottery);
    } else if (!_project) {
        deferrd.reject(common.errType.noproject);
    } else {
        deferrd.resolve(true);
    }
    return deferrd.promise;
}
/**
 * 产生奖项，并写入中奖纪录
 * @param cust
 * @param qrcode
 * @returns {*|promise}
 */
function genlottery(cust, qrcode) {
    var deferrd = Q.defer();
    var customer = cust;
    var pro = global.lotterys[qrcode.projectid];

    /**
     * 写入中奖纪录
     * @param lottery
     * @private
     */
    function _writeRecord(lottery) {
        if (!!lottery) {
            try {
                //存入数据库
                var recdb = db.models.prolotteryrecord;
                var custextenddb = db.models.custextend;
                var pointdetaildb = db.models.propointdetail;
                var cashcoupondb = db.models.cashcoupon;
                var discountcoupondb = db.models.discountcoupon;
                var rec = {};
                rec["recid"] = qrcode.qrid;
                rec["projectid"] = qrcode.projectid;
                rec["entid"] = global.lotterys[qrcode.projectid].entid;
                //奖项
                rec["lotteryid"] = lottery.lotteryid;
                rec["lotteryname"] = lottery.name;//奖项名
                rec["mallproducttype"] = lottery.prizetype;//奖品类型
                if (rec.mallproducttype === common.project.type.redpacket) {
                    rec.price = lottery.cost;
                } else {
                    rec.price = lottery.price;
                }
                if (lottery.price > 0 && (lottery.prizetype === common.project.prizetype.product || lottery.prizetype === common.project.prizetype.redpacket)) {
                    rec["state"] = common.lotterystate.normal;
                } else {
                    rec["state"] = common.lotterystate.success;
                }
                rec["amount"] = lottery.prizecount;//奖品数量
                rec["mallproductname"] = lottery.prizename;//奖品名字
                rec["mallproductid"] = lottery.prizeid;
                rec["rectime"] = moment().format(config.dateformat);
                rec["nickname"] = customer.nickname;
                rec["custid"] = customer.custid;
                rec["phone"] = customer.phone;
                rec["country"] = customer.country;
                rec["province"] = customer.province;
                rec["city"] = customer.city;
                rec["openid"] = customer.openid;
                rec["ruleid"] = lottery.ruleid;
                rec["projectname"] = pro.shortname;
                rec["entname"] = pro.entname;
                rec["phone"] = customer.phone;
                rec["areacode"] = customer.areacode;                
            } catch (error) {
                if (lottery.ruleid) {
                    global.lotterys[qrcode.projectid].rulepond.push(lottery);
                } else {
                    global.lotterys[qrcode.projectid].pond.push(lottery);
                }
                logger.error(customer.nickname, "生成新抽奖记录失败,原因是："+error.message);
                deferrd.reject('unknow');return;
            }

            db.sequelize.transaction(function (t) {

                function creteRecord() {

                    var deferred = Q.defer();

                    recdb.create(rec,
                        { transaction: t }).then(function (res) {
                            //logger.info(customer.nickname, "生成抽奖记录成功。");
                            //计算进度
                            global.progress[qrcode.projectid][lottery.lotteryid].num += 1;
                            if (lottery.ruleid) {
                                global.progress[qrcode.projectid][lottery.lotteryid][lottery.ruleid].num += 1;
                            }

                            deferred.resolve(res.get({ chain: true }));

                        }).catch(function (error) {
                            if (lottery.ruleid) {
                                global.lotterys[qrcode.projectid].rulepond.push(lottery);
                            } else {
                                global.lotterys[qrcode.projectid].pond.push(lottery);
                            }
                            logger.error(customer.nickname, "生成新抽奖记录失败："+error.message);
                            deferred.reject('databaseError');
                        });

                    return deferred.promise;
                }

                var pointscore = 0;

                function updatedetail(recvo) {

                    var deferred = Q.defer();
                    var detailvo = {
                        detailid: uuid.v4(),
                        custid: customer.custid,
                        entid: recvo.entid,
                        pointchannel: recvo.recid,
                        point: pointscore,
                        pointtime: recvo.rectime,
                        changemode: 'prolottery',
                        remark: '扫码抽奖得积分'
                    };
                    pointdetaildb.create(detailvo, { transaction: t }).then(function (res) {
                        //logger.info(customer.nickname, "扫码抽奖-更新积分明细记录成功。");
                        deferred.resolve(res);
                    }).catch(function (error) {
                        logger.error(customer.nickname, "扫码抽奖-更新积分明细记录失败:"+error.message);
                        deferred.reject('databaseError');
                    });
                    return deferred.promise;
                }

                function updateextend() {

                    var deferred = Q.defer();

                    var updateExtendsql = 'UPDATE custextend set point = point + ' + /*rec.price * */rec.amount + ' where custid = \'';
                    updateExtendsql += customer.custid + '\'';
                    db.sequelize.query(updateExtendsql, { transaction: t }).spread(function (results, metadata) {
                        //logger.info(customer.nickname, "更新个人总积分成功。");
                        deferred.resolve(results);
                    }).catch(function (err) {
                        logger.error(customer.nickname, "更新个人总积分失败"+err.message);
                        deferred.reject('databaseError');
                    });

                    return deferred.promise;
                }

                function getcashcoupon() {
                    var d = Q.defer();
                    cashcoupondb.findAll({
                        where: {
                            state: 'normal',
                            productid: rec["mallproductid"]
                        },
                        limit: rec.amount
                    }).then(function (res) {
                        if (res.length > 0 && res.length == rec.amount) {
                            var cashvo = [];
                            for (var x = 0; x < res.length; ++x) {
                                cashvo.push(res[x].get({ chain: true }).url);
                            }
                            d.resolve(cashvo);
                        } else {
                            logger.error(customer.nickname, '未找到可用的优惠券，可能库存不足');
                            d.resolve([]);//需手动派送优惠券
                        }
                    }).catch(function (err) {
                        logger.error(customer.nickname, "查询可用的优惠券失败："+err.message);
                        d.reject('databaseError');
                    })
                    return d.promise;
                }

                function updatecashcoupon(cashvo) {

                    var d = Q.defer();
                    if (0 === cashvo.length) {
                        d.resolve(cashvo);
                    } else {
                        cashcoupondb.update({
                            owner: customer.custid,
                            usedate: moment().format('X'),
                            state: 'used'
                        }, {
                                where: {
                                    url: { $or: cashvo }
                                },
                                transaction: t
                            }).then(function (res) {
                                d.resolve(cashvo);
                            }).catch(function (err) {
                                logger.error(customer.nickname, '优惠券记录更新失败：' + JSON.stringify(err));
                                d.reject(returnData.errorType.dataBaseError.unknow);
                            });
                    }
                    return d.promise;
                }

                function updatecouponstock(cashvo) {

                    var d = Q.defer();
                    if (0 === cashvo.length) {
                        d.resolve(cashvo);
                    } else {
                        var updateExtendsql = 'UPDATE mallproduct set amount = amount - ' + rec.amount + ' where productid = \'' + rec.mallproductid + '\'';
                        db.sequelize.query(updateExtendsql, { transaction: t }).spread(function (results, metadata) {
                            //logger.info(customer.nickname, "更新优惠券库存成功。");
                            d.resolve(cashvo);
                        }).catch(function (err) {
                            logger.error(customer.nickname, "更新优惠券库存失败:"+err.message);
                            d.reject('databaseError');
                        });
                    }

                    return d.promise;

                }

                function updatelotteryrecord(cashvo) {

                    var d = Q.defer();
                    if (cashvo.length > 0) {
                        d.resolve(cashvo);
                    } else {
                        recdb.update({
                            'state': 'sendfalse'
                        }, {
                                where: {
                                    'recid': qrcode.qrid
                                },
                                transaction: t
                            }).then(function (res) {
                                d.resolve(cashvo);
                            }).catch(function (err) {
                                logger.error(customer.nickname, '更新奖品类型为优惠券的中奖纪录的状态失败：' + JSON.stringify(err));
                                d.reject(returnData.errorType.dataBaseError.unknow);
                            })
                    }
                    return d.promise;

                }
                
                function createDiscountCoupon() {
                    var deferred = Q.defer();
                    var discountArrarys = [];
                    for(var i  = 0; i < rec.amount ;++i){
                        var detailvo = {
                            id: uuid.v4(),
                            productid: lottery.prizeid,
                            productname: lottery.prizename,
                            createdate: moment().valueOf(),
                            ratio: lottery.price,
                            owner: customer.custid,
                            state: 0
                        };
                        discountArrarys.push(detailvo);
                    }
                    
                    discountcoupondb.bulkCreate(discountArrarys, { transaction: t }).then(function (res) {
                        deferred.resolve(res);
                    }).catch(function (error) {
                        logger.error(customer.nickname, "扫码送-折扣券创建失败");
                        deferred.reject(error.message);
                    });
                    return deferred.promise;
                }
            
                if (rec.mallproducttype === 'point') {
                    pointscore = /*rec.price **/ rec.amount;
                    return creteRecord()
                        .then(updatedetail)
                        .then(updateextend)
                        .then(setQrcodeStatesEx(qrcode.qrid, t));
                } else if (rec.mallproducttype === 'cashcoupon') {
                    return creteRecord()
                        .then(getcashcoupon)
                        .then(updatecashcoupon)
                        .then(updatecouponstock)
                        .then(updatelotteryrecord)
                        .then(setQrcodeStatesEx(qrcode.qrid, t));
                } else if(rec.mallproducttype === 'discountcoupon'){
                    return creteRecord()
                        .then(createDiscountCoupon)                        
                        .then(setQrcodeStatesEx(qrcode.qrid, t));
                } else {
                    return creteRecord()
                        .then(setQrcodeStatesEx(qrcode.qrid, t));
                }

            }).then(function (result) {
                deferrd.resolve(rec);
            }).catch(function (err) {
                deferrd.reject(err);
            });

        } else {
            deferrd.resolve(null);
        }
    };
    /**
     * 通过策略进行抽奖
     * @private
     */
    function _rulepond(rulepond) {
        var lottery = null;
        //纪录当前满足策略的中奖项
        var _rulepond = [];
        for (var i = 0; i < rulepond.length; i++) {
            //将满足条件的奖项加入
            if (moment().isBetween(rulepond[i].begtime, rulepond[i].endtime)) {
                if (!rulepond[i].area || rulepond[i] === "0" || (rulepond[i].area && customer.areacode && customer.areacode.indexOf(rulepond[i].area) === 0)) {
                    _rulepond.push(rulepond[i]);
                }
            }
        }
        //在满足当前中奖池随机取中奖项
        if (_rulepond.length > 0) {
            var r = getRandom(0, _rulepond.length - 1);
            //判断此策略规则是否随机产生奖项
            switch (_rulepond[r].ruletype) {
                case common.project.ruletype.random:
                    var rand = getRandom(0, 1);
                    if (rand === 1) lottery = _rulepond[r];
                    break;
                default:
                    lottery = _rulepond[r];
                    break;
            }
            //在策略奖池中删除奖项
            if (lottery) {
                var inx = global.lotterys[qrcode.projectid].rulepond.indexOf(lottery);
                if (inx > -1) {
                    global.lotterys[qrcode.projectid].rulepond.splice(inx, 1);
                }
                logger.info(customer.custid, '策略中奖：' + JSON.stringify(lottery));
            }
        }
        return lottery;
    };
    if (!!pro) {
        var lottery = null;
        //判断策略奖池是否有剩余奖项
        if (!!pro.rulepond && pro.rulepond.length > 0) {
            lottery = _rulepond(pro.rulepond);
        }
        if (!lottery) {
            logger.info(config.systemUser, "开始普通抽奖：" + global.lotterys[qrcode.projectid].pond.length);
            //判断奖池是否有剩余奖项
            if (!!pro.pond && pro.pond.length > 0) {
                //生成奖项 ，根据中奖率
                var r = getRandom(0, (pro.pond.length - 1));
                lottery = pro.pond[r];
                logger.info(customer.custid, '普通中奖：' + JSON.stringify(lottery));
                //移除奖池
                global.lotterys[qrcode.projectid].pond.splice(r, 1);
            }
        }
        //在奖池中删除并写入数据库
        if (lottery) {
            _writeRecord(lottery);
        } else {
            deferrd.reject(common.checkstate.nolottery);
        }
    } else {
        deferrd.reject(common.errType.noproject);
    }
    return deferrd.promise;
};

function setQrcodeStatesEx(qrcode, tran) {

    var d = Q.defer();

    var qrdb = db.models.proqrcode;
    qrdb.update({
        state: '1'
    }, {
            where: {
                qrid: qrcode,
                state: 0
            },
            transaction: tran
        }).then(function (res) {
            if (res[0] == 0) {
                d.resolve(true);
            } else {
                qrdb.findOne({
                    where: {
                        qrid: qrcode
                    },
                    transaction: tran
                }).then(function (res) {
                    var obj = res.get({ chain: true });
                    var batchid = obj.batchid;
                    var updateExtendsql = 'UPDATE proqrcodebatch set count = count - 1 where batchid = \'';
                    updateExtendsql += batchid + '\'';
                    db.sequelize.query(updateExtendsql, { transaction: tran }).spread(function (results, metadata) {
                        //logger.info('sys', "扫码后更新批次号对应可用二维码个数成功。");
                        d.resolve(true);
                    }).catch(function (err) {
                        logger.error('sys', "扫码后更新批次号对应可用二维码个数失败，原因是：" + err.message);
                        d.reject('databaseError');
                    });
                }).catch(function (err) {
                    logger.error('sys', '扫码后查找二维码对应的批次号失败，原因是:' + err.message);
                    d.reject('databaseError');
                })
            }
        }).catch(function (err) {
            logger.error('sys', '扫码后更改该码状态失败，原因是:' + err.message);
            d.reject('databaseError');
        })

    return d.promise;
}

/**
 * 检查二维码状态
 * @param customer
 * @param qrcode
 * @returns {*|promise}
 */
function checkLottery(customer, qrcode) {
    var deferrd = Q.defer();
    isBadcode(qrcode).then(isExists).then(function (d) {
        check(customer, d).then(function (data) {
            deferrd.resolve(data);
        }).catch(function (err) {
            deferrd.reject(err);
        });
    }).catch(function (err) {
        deferrd.reject(err);
    });
    return deferrd.promise;
}
/**
 * 执行check
 * @param customer
 * @param qrcode
 * @returns {*|promise}
 */
function check(customer, qrcode) {
    var deferrd = Q.defer();
    var proxy = new eventproxy();
    proxy.on("fail", function (err) {
        logger.error(customer.custid, "check:" + err);
        deferrd.reject(err);
    });
    proxy.on("used", function (d) {
        logger.info(customer.custid, "check:" + JSON.stringify(d));
        deferrd.resolve(d);
    });
    //验证是否有剩余奖项
    proxy.on("ishaslottery", function () {
        isHasLottery(qrcode.projectid).then(function () {
            logger.info(customer.custid, "check success!");
            deferrd.resolve(true);
        }).catch(function (err) {
            proxy.emit("fail", err);
        });
    });
    //验证是否过期
    proxy.on("isindate", function () {
        isInDate(qrcode.projectid).then(function () {
            proxy.emit("ishaslottery");
        }).catch(function (err) {
            proxy.emit("fail", err);
        });
    });
    //验证是否使用
    isUsed(customer, qrcode.qrid).then(function (d) {
        //若返回不为true时表示已被使用则返回
        if (typeof d !== "boolean") {
            proxy.emit("used", d);
        } else {
            proxy.emit("isindate");
        }
    }).catch(function (err) {
        proxy.emit("fail", err);
    });
    return deferrd.promise;
}
/**
 * 抽奖
 * @param customer
 * @param qrcode
 * @returns {*|promise}
 */
function generateLottery(customer, qrcode) {
    var deferrd = Q.defer();

    function _genlottery(arg) {
        genlottery(customer, arg).then(function (data) {
            logger.info(customer.custid, "生成抽奖完成");
            deferrd.resolve(data);
        }).catch(function (err) {
            logger.error(customer.custid, "生成抽奖失败:" + err);
            deferrd.reject(err);
        });
    }

    isBadcode(qrcode).then(isExists).then(function (d) {
        check(customer, d).then(function (data) {
            //check通过，执行抽奖
            if (data && !data.gen) {
                _genlottery(d);
            } else {
                //表示已中奖
                deferrd.resolve(data);
            }
        }).catch(function (err) {
            deferrd.reject(err);
        });
    }).catch(function (err) {
        logger.error(customer.custid, "generate:" + err);
        deferrd.reject(err);
    });
    return deferrd.promise;
};
exports.checkLottery = checkLottery;
exports.generateLottery = generateLottery;