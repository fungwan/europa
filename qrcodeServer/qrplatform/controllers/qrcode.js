/**
 * Created by taoj on 2015/12/24.
 */
var request = require('request');
var db = require('../common/db');
var returnData = require('../common/returnData');
var http = require('http');
var config = require('../../config');
var wxsender = require('./mobileapp');
var project = require('./project');
var eventporxy = require('eventproxy');
var logger = require('../common/logger');
var qa = require('./mobileqa');
var point = require('./mobilepoint');
var gift = require('./mobilegift');
var sale = require('./mobilesale');
var vo = require('../models/vomodels');
var sms = require('../common/smsmanage');
var Q = require("q");
var mallmanager = require('./mallmanageMobile');
var uuid = require('node-uuid');
var moment = require('moment');

/**
 * 根据qrid获取project信息
 * @param qrid
 */
function getProjectById(qrid, callback) {
    var qrdb = db.models.proqrcode;
    var proxy = new eventporxy();
    proxy.on("project", function (projectid) {
        var prodb = db.models.project;
        prodb.findOne({
            //attributes: ['projectid', 'type', 'times'],
            where: { projectid: projectid }
        }).then(function (d) {
            if (d) {
                callback(null, returnData.createData(d));
            } else {
                callback(returnData.createError(returnData.errorType.notexist), null);
            }
        });
    });

    getpidbyqrcode(qrid).then(function (res) {
        proxy.emit("project", res.projectid);
    }).catch(function (err) {
        callback(returnData.createError(returnData.errorType.notexist, err), null);
    });
}
/**
 * 扫码抽奖
 * @param arg
 * @param callback
 */
function generate(arg, callback) {
    var argdata = {};
    argdata["customer"] = JSON.stringify(arg.currentuser);
    argdata["qrcode"] = arg.qrcode;
    logger.info(arg.currentuser.custid, "请求generate开始：");
    var genLotteryurl = config.services.qrlotterymanager.url + config.services.qrlotterymanager.interfaces.genlottery;
    request.post({ url: genLotteryurl, form: argdata }, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            var d = JSON.parse(body);
            console.info(d);
            logger.info(arg.currentuser.custid, "请求generate完成！");
            if ("data" in d) {
                if (d.data.mallproducttype === vo.project.prizetype.redpacket) {
                    sendmoney(arg, function (err, data) {
                        if (err !== null) {
                            logger.error(arg.currentuser.openid, '红包发送失败，需要手动再次派送');
                        }
                    })
                }

                //setQrcodeStates(arg.qrcode, '1');
                callback(null, d);
            } else {
                callback(d, null);
            }
        } else {
            callback(returnData.createError(returnData.errorType.unknow, err.message), null);
        }
    });
}
/**
 * 发送红包
 * @param arg
 * @param callback
 */
function sendmoney(arg, callback) {
    var recdb = db.models.prolotteryrecord;

    function suc(data) {
        if (data) {
            if (arg.currentuser.openid === data.openid && data.price > 0 && data.state === "normal") {
                var senddata = {};
                senddata["openid"] = data.openid;
                senddata["amount"] = data.price * data.amount;
                senddata["billtype"] = "lottery";
                senddata["nickname"] = data.nickname;
                senddata["wishing"] = "恭喜获得红包";
                senddata["ip"] = "127.0.0.1";
                senddata["actname"] = data.projectname;
                senddata["remark"] = data.entname;
                senddata["sendname"] = data.projectname;
                wxsender.sendredpack(senddata, function (err, data) {
                    if (!err) {
                        var record = {};
                        record["recno"] = data.billno;
                        record["state"] = data.state;
                        var recdb = db.models.prolotteryrecord;
                        recdb.update(record, { where: { recid: arg.qrcode } }).then(function (affectedRows) {
                            //更新红包发送状态
                            logger.info(config.systemUser, affectedRows);
                        }).catch(function (errdata) {
                            logger.error(config.systemUser, errdata);
                        });
                        callback(null, returnData.createData(data));
                    } else {
                        callback(returnData.createError(err.code, err.message), null);
                    }
                });
            } else {
                callback(returnData.createError(returnData.createError(returnData.errorType.refuse)), null);
            }
        } else {
            callback(returnData.createError(returnData.errorType.notexist), null);
        }
    }

    function err(err) {
        callback(returnData.createError(returnData.errorType.unknow), null);
    }

    recdb.findOne({
        where: { recid: arg.qrcode }
    }).then(suc).catch(err);
}
/**
 * 检查qrcode状态，若返回成功则活动及企业信息
 * @param arg
 * @param callback
 */
function checkqrcode(arg, callback) {
    var argdata = {};
    argdata["customer"] = JSON.stringify(arg.currentuser);
    argdata["qrcode"] = arg.qrcode;
    //todo id校验
    var proxy = new eventporxy();
    //完成对用户参加活动次数的检查
    proxy.on('checkuserlimitfinish', function (ids, proinfo, limitnu, userid, d, defer) {
        var recdb = db.models.prolotteryrecord;
        recdb.findAll(
            {
                attributes: ['projectid', [db.sequelize.fn('COUNT', db.sequelize.col('recid')), 'recnumber']],
                where: { projectid: { $in: ids }, custid: userid },
                group: 'projectid'
            }
        ).then(function (result) {
            if (result && result.length > 0) {
                var sumnu = 0;
                var pass = true;
                for (var k in result) {
                    var rec = result[k].get({ chain: true });
                    sumnu += rec.recnumber;
                    if (rec.projectid === proinfo.projectid) {
                        if (rec.recnumber >= proinfo.times && proinfo.times > 0) {
                            pass = false;
                        }
                    }
                }
                if (pass == true) {
                    if (sumnu >= limitnu && limitnu > 0) {
                        defer.reject(returnData.createError(returnData.errorType.mobile.limit));
                        //callback(returnData.createError(returnData.errorType.mobile.limit), '超过参加活动次数限制!');
                    } else {
                        defer.resolve(d);
                        //callback(null, d);
                    }
                } else {
                    defer.reject(returnData.createError(returnData.errorType.mobile.limit));
                    //callback(returnData.createError(returnData.errorType.mobile.limit), '超过参加活动次数限制!');
                }
            } else {
                defer.resolve(d);
                //callback(null, d);
            }
        }).catch(function (err) {
            defer.reject(err);
            //callback(returnData.createError(returnData.errorType.unknow), err.message);
        });
    });
    //检查用户是否可以参加活动
    proxy.on('checkuserlimit', function (proinfo, d, defer) {
        var userid = arg.currentuser.custid;
        var groupdb = db.models.projectgroup;
        groupdb.findOne({ where: { prolist: { $like: '%' + proinfo.projectid + '%' } } }).then(function (data) {
            var ids = [];
            if (data) {
                ids = JSON.parse(data.prolist);
                proxy.emit('checkuserlimitfinish', ids, proinfo, data.limitnumber, userid, d, defer);
            } else {
                if (proinfo.times && proinfo.times > 0) {
                    ids.push(proinfo.projectid);
                    proxy.emit('checkuserlimitfinish', ids, proinfo, 0, userid, d, defer);
                }
                else {
                    //callback(null, d);
                    defer.resolve(d);
                }
            }
        }).catch(function (err) {
            defer.reject(err);
            //callback(returnData.createError(returnData.errorType.unknow), err.message);
        });
    });
    //红包check
    function _checklottery(pro) {
        var defer = Q.defer();
        logger.info(arg.currentuser.custid, "请求checkqrcode开始：");
        var checkLotteryurl = config.services.qrlotterymanager.url + config.services.qrlotterymanager.interfaces.checklottery;
        request.post({ url: checkLotteryurl, form: argdata }, function (err, response, body) {
            if (!err && response.statusCode == 200) {
                var d = JSON.parse(body);
                console.info(d);
                logger.info(arg.currentuser.custid, "请求checkqrcode完成！");
                //获取活动信息
                if ("data" in d) {
                    defer.resolve(d.data);
                    //允许抽奖时，判断是否超过最大抽奖次数
                    /*if (d.data == true) {
                        //proxy.emit("checkuserlimit", pro, d, defer);
                        defer.resolve(d);
                    } else {
                        //callback(null, d);
                    }*/
                } else {
                    //callback(d, null);
                    defer.reject(d.error.code);
                }
            } else {
                //callback(returnData.createError(returnData.errorType.unknow, err), null);
                defer.reject(err);
            }
        });
        return defer.promise;
    }

    //从数据库验证qrcode是否存在,存在,再验证是否已被人使用，再验证是否过期
    getProjectById(arg.qrcode, function (err, d) {
        if (d) {
            var provo = d.data.get({ chain: true }); var lotteryCheckList = [];
            arg.project = provo;
            var directoystr = provo.directory === null ? directoystr = '' : directoystr = provo.directory;
            try {
                var arrayType = directoystr.split(',');
            } catch (error) {
                callback(returnData.createError(returnData.errorType.unknow, error), null);
                return;
            }

            var qrstate = false;
            proxy.on('contentcheck', function () {
                //todo common check
                for (var i = 0; i < arrayType.length; ++i) {
                    var type = arrayType[i];
                    if (type in vo.project.lotterytypes) {
                        //找到存在的奖项类型
                        switch (type) {
                            case vo.project.lotterytypes.prolottery:
                                lotteryCheckList.push(_checklottery(arg.project));
                                break;
                            case vo.project.lotterytypes.proquestion:
                                lotteryCheckList.push(qa.check(arg));
                                break;
                            case vo.project.lotterytypes.propoint:
                                lotteryCheckList.push(point.check(arg));
                                break;
                            case vo.project.lotterytypes.prosale:
                                lotteryCheckList.push(sale.check(arg));
                                break;
                            case vo.project.lotterytypes.progift:
                                lotteryCheckList.push(gift.check(arg));
                                break;
                        }
                    }
                }
                if (0 === lotteryCheckList.length) {
                    callback(returnData.createError(returnData.errorType.project.notype), null);
                } else {
                    Q.all(lotteryCheckList).then(function (value) {
                        if (qrstate) {//二维码被标记已扫
                            var hasRecord = false;
                            for (var x = 0; x < value.length; ++x) {
                                if (value[x].gen) {
                                    hasRecord = true;
                                    break;
                                }
                            }
                            if (hasRecord) {
                                callback(null, returnData.createData(value));
                            } else {
                                //todo 找到扫码记录本来对应的活动
                                logger.error(arg.currentuser.nickname, '二维码标记已扫，但查不到对应活动的二维码记录，说明二维码扫码异常');
                                callback(returnData.createError(returnData.errorType.mobile.used), '二维码已经使用');
                            }
                        } else {
                            callback(null, returnData.createData(value));
                        }
                    }).catch(function(err){
                        logger.error(arg.currentuser.nickname, '二维码检查异常：'+err);
                        callback(returnData.createError(err), null);
                    })
                }
            });

            //检查qrid的state，如果为1，但contentcheck执行后，发现对应的project没有1个lottery记录，则二维码异常
            proxy.on('statecheck', function () {
                var qrdb = db.models.proqrcode;
                qrdb.findOne({
                    attributes: ['state'],
                    where: {
                        qrid: arg.qrcode
                    }
                }).then(function (res) {
                    var vo = res.get({ chain: true });
                    var _state = vo.state;
                    if ('1' == _state) {
                        qrstate = true;
                    }

                    proxy.emit('contentcheck');

                }).catch(function (err) {
                    callback(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
                })
            });

            //focus brand
            var focusdb = db.models.custfocus;
            focusdb.findCreateFind({
                where: {
                    entid: provo.entid,
                    custid: arg.currentuser.custid
                },
                defaults: {
                    fid: uuid.v4(),
                    state: 'on',
                    focustime: new Date().getTime(),
                    entid: provo.entid,
                    custid: arg.currentuser.custid
                }
            }).then(function (res) { }).catch(function (err) {
                logger.error(arg.currentuser.nickname, '关注品牌出错，原因是：' + err.message);
            })

            //set entid on customer2map
            var custgroupmapdb = db.models.custgroupmap;
            custgroupmapdb.findCreateFind({
                where: {
                    entid: provo.entid,
                    custid: arg.currentuser.custid
                },
                defaults: {
                    id: uuid.v4(),
                    groupid: '',
                    entid: provo.entid,
                    custid: arg.currentuser.custid
                }
            }).then(function (res) { }).catch(function (err) {
                logger.error(arg.currentuser.nickname, '用户扫码更新企业id(custgroupmap)出错，原因是：' + err.message);
            })

            //check join times
            if (provo.times > 0) {
                var goaltimes = provo.times;
                var timessql = 'SELECT COUNT(DISTINCT recid) as counts from v_scanrecord WHERE projectid = \'';
                timessql += provo.projectid + '\'' + ' and custid = \'' + arg.currentuser.custid + '\'';
                db.sequelize.query(timessql, { type: db.sequelize.QueryTypes.SELECT })
                    .then(function (resarray) {
                        var times = resarray[0]['counts'];//实际参与次数
                        if (goaltimes >= (times + 1)) {
                            proxy.emit('statecheck');
                        } else {
                            logger.error(arg.currentuser.nickname, '超出参与活动次数');
                            callback(returnData.createError(returnData.errorType.mobile.limit, '超出参与活动次数'), null);
                        }
                    }).catch(function (err) {
                        logger.error(arg.currentuser.nickname, '查询扫码次数出错，原因是：' + err.message);
                        callback(returnData.createError(returnData.errorType.dataBaseError.unknow, err.message), null);
                    });
            } else {
                proxy.emit('statecheck');
            }
        } else {
            callback(returnData.createError(returnData.errorType.notexist), null);
        }
    });

}
/**
 * 根据qrid获取活动基本信息
 * @param arg
 * @param callback
 */
function baseinfo(arg, callback) {
    var proxy = new eventporxy();
    proxy.on('getent', function (project) {
        var entdb = db.models.sysenterprise;
        entdb.findOne({ where: { entid: project.data.entid } }).then(function (data) {
            project.data["ent"] = data;
            callback(null, returnData.createData(project.data));
        }).catch(function (err) {
            callback(returnData.createError(returnData.errorType.unknow), null);
        })
    });

    getpidbyqrcode(arg.qrcode).then(function (res) {
        arg.qrid = res.projectid;
        project.preview(arg, function (err, data) {
            //获取企业信息
            if (data) {
                proxy.emit('getent', data);
            } else {
                callback(returnData.createError(returnData.errorType.unknow, err), null);
            }
        });
    }).catch(function (err) {
        callback(returnData.createError(returnData.errorType.project.invaild, err), null);
    });
}
/**
 * 更新手机号
 * @param arg
 * @param cb
 */
function updatephoneno(arg, cb) {
    if (arg.currentuser) {
        function updatephone() {
            var dbuser = db.models.customer;
            dbuser.update({
                phone: arg.phone
            }, {
                    where: {
                        unionid: arg.currentuser.unionid
                    }
                }).then(
                function (result) {
                    logger.info(arg.currentuser.nickname, '更新客户手机号成功,新号码:' + arg.phone);
                    arg.currentuser.phone = arg.phone;
                    cb(null, returnData.createData(true));
                },
                function (error) {
                    logger.error(arg.currentuser.nickname, '更新客户手机号失败.');
                    logger.error(arg.currentuser.nickname, config.systemUser, error.stack);
                    cb(returnData.createError(returnData.errorType.unknow, error.message), null);
                })
        }
        function fail(err) {
            logger.error(null, err.message, err);
            cb(returnData.createError(returnData.errorType.mobile.badsmscode, err.message), null);
        }
        //判断是否验证手机号,若需验证则判断验证码
        var prodb = db.models.project;
        prodb.findOne({
            attributes: ['checktel'],
            where: { projectid: arg.projectid }
        }).then(function (d) {
            if (d) {
                updatephone();
                /*if (d.checktel == true) {
                    sms.valsms(arg.phone, arg.code).then(updatephone).catch(fail);
                } else {
                    updatephone();
                }*/
            } else {
                cb(returnData.createError(returnData.errorType.notexist), null);
            }
        });
    }
    else {
        logger.error(null, '用户未登录!');
        cb(returnData.createError(returnData.errorType.unlogin, '用户未登录!'), null);
    }
}
/**
 * 请求发送验证码
 * @param arg
 * @param callback
 */
function sendsms(arg, callback) {
    function success(data) {
        callback(null, returnData.createData(true));
    }

    //function fail(err){
    //    logger.error(null,err.message,err);
    //    callback(returnData.createError(returnData.errorType.unknow,'发送失败!'));
    //}
    if (arg.currentuser) {
        sms.sendsms(arg.phone).then(success).catch(success);
    }
    else {
        logger.error(null, '用户未登录!');
        callback(returnData.createError(returnData.errorType.unlogin, '用户未登录!'), null);
    }
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
                d.reject(msg);
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
                d.reject(msg);
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
                d.reject(msg);
            }
        }).catch(function (err) {
            d.reject(err.message);
        })
        return d.promise;
    }

    function getprojectid(obj) {
        var d = Q.defer();
        /*var ctg2projectdb = db.models.ctg2project;
        ctg2projectdb.findAll({
            where: {
                categoryid: obj.mcdvo.categoryid,
                state: vo.project.state.start
            }
        }).then(function (resArray) {
            if (resArray.length>0) {
                var res = resArray[0];
                var vo = res.get({ chain: true });
                obj.projectid = vo.projectid;
                d.resolve(obj);
            } else {
                var msg = '未找到正在进行的活动';
                logger.error(null, msg);
                d.reject(msg);
            }
        }).catch(function (err) {
            d.reject(err.message);
        })*/

        var querysql = "SELECT b.* from (SELECT * from ctg2project WHERE categoryid = '" + obj.mcdvo.categoryid + "')a ";
        querysql += 'LEFT JOIN project b ON a.projectid = b.projectid ORDER BY createtime desc';

        db.sequelize.query(querysql, { type: db.sequelize.QueryTypes.SELECT })
            .then(function (resArray) {
                if (resArray.length > 0) {
                    var iProjectStart = true;
                    for (var x = 0; x < resArray.length; ++x) {
                        var res = resArray[x];
                        if (res.state == vo.project.state.start) {
                            obj.projectid = res.projectid;
                            iProjectStart = false;
                            d.resolve(obj);
                            break;
                        }
                    }
                    if (iProjectStart) {//没有关联的开始中的活动信息，返回按时间顺序中的第一个活动
                        var res = resArray[0];
                        obj.projectid = res.projectid;
                        d.resolve(obj);
                    }
                } else {
                    var msg = '未找到关联的活动';
                    logger.error(null, msg);
                    d.reject(msg);
                }
            }).catch(function (err) {
                logger.error(null, err.message);
                d.reject(err.message);
            });


        return d.promise;
    }

    return getbatchid(qrcode)
        .then(getmcdid)
        .then(getcategory)
        .then(getprojectid);
}

/**
 * 请求生成实物订单
 * @param arg
 * @param callback
 */
function genorder(arg, callback) {

    var recdbmodel = {};
    var orderinfo = '';
    var custid = arg.currentuser.custid;
    var address = arg.address;
    var qrcode = arg.qrcode;
    var useraccount = arg.currentuser.nickname;

    switch (arg.type) {
        case vo.project.lotterytypes.prolottery:
            recdbmodel = db.models.prolotteryrecord;
            orderinfo = '抽奖获得实物奖品';
            break;
        case vo.project.lotterytypes.progift:
            recdbmodel = db.models.progiftrecord;
            orderinfo = '扫码送获得实物奖品';
            break;
        default:
            recdbmodel = ''
    }

    if ('string' === typeof recdbmodel) {
        callback(returnData.createError(returnData.errorType.project.notype, '生成订单时请求奖项类型出错!'), null);
        return;
    }

    function getlotteryinfo() {
        var d = Q.defer();
        recdbmodel.findOne({
            where: {
                recid: qrcode
            }
        }).then(function (res) {
            if (res) {
                var rec = res.get({ chain: true });
                if (rec.mallproducttype === vo.project.prizetype.product || rec.mallproducttype === vo.project.prizetype.product) {
                    if (rec.state == 'normal') {
                        d.resolve(rec);
                    } else {
                        logger.error(useraccount, '不能重复提交已成功的实物订单');
                        d.reject(returnData.errorType.refuse);
                    }
                } else {
                    logger.error(useraccount, '找到对应的中奖纪录，但该中奖纪录不是对应的实物，所以拒绝生成订单');
                    d.reject(returnData.errorType.notexist);
                }

            } else {
                logger.error(useraccount, '未找到对应的中奖纪录');
                d.reject(returnData.errorType.notexist);
            }

        }).catch(function (err) {
            d.reject(err.message);
        });
        return d.promise;
    }

    function callGenOrder(recinfo) {

        var d = Q.defer();
        try {
            address = JSON.parse(address);
            if (/^\d+$/ig.test(address.addid)) {
                address.addid = null;
            }
        } catch (err) {
            logger.error(useraccount, '用户收货地址解析错误');
            d.reject(err.message);
        }

        var productid = recinfo.mallproductid;
        var number = recinfo.amount;
        var remark = orderinfo;
        mallmanager.creategiftorder(arg, custid, address, productid, number, remark, function (err, data) {
            if (err === null) {
                d.resolve(data.data.addid);
            } else {
                d.resolve('normal');
            }
        });
        return d.promise;
    }

    function updateRecordState(data) {

        var d = Q.defer();
        if (data !== 'normal') {
            var d = Q.defer();
            recdbmodel.update({
                'state': 'success'
            }, {
                    where: {
                        'recid': qrcode
                    }
                }).then(function (res) {
                    d.resolve(data);
                }).catch(function (err) {
                    logger.error(useraccount, err.message);
                    d.reject(err.message);
                })
        } else {
            d.reject('false');
        }
        return d.promise;
    }

    getlotteryinfo()
        .then(callGenOrder)
        .then(updateRecordState)
        .then(function (res) {
            callback(null, returnData.createData(res));
        }).catch(function (err) {
            logger.error(useraccount, err);
            callback(returnData.createError(returnData.errorType.mobile.unknow, err), null);
        });
}

/**
 * 设置二维码状态
 * @param arg
 * @param callback
 */
function setQrcodeStates(qrcode, state) {

    var qrdb = db.models.proqrcode;
    qrdb.update({
        state: state
    }, {
            where: {
                qrid: qrcode,
                state: 0
            }
        }).then(function (res) {
            qrdb.findOne({
                where: {
                    qrid: qrcode
                }
            }).then(function (res) {
                var obj = res.get({ chain: true });
                var batchid = obj.batchid;
                var updateExtendsql = 'UPDATE proqrcodebatch set count = count - 1 where batchid = \'';
                updateExtendsql += batchid + '\'';
                db.sequelize.query(updateExtendsql).spread(function (results, metadata) {
                    logger.info('sys', "扫码后更新批次号对应可用二维码个数成功。");
                }).catch(function (err) {
                    logger.error('sys', "扫码后更新批次号对应可用二维码个数失败，原因是：" + err.message);
                });
            }).catch(function (err) {
                logger.error('sys', '扫码后查找二维码对应的批次号失败，原因是:' + err.message);
            })
        }).catch(function (err) {
            logger.error('sys', '扫码后更改该码状态失败，原因是:' + err.message);
        })
}


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
                        logger.info('sys', "扫码后更新批次号对应可用二维码个数成功。");
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
 * 获取优惠券
 * @param arg
 * @param callback
 */
function getCashCoupon(arg, cb) {

    var recdbmodel = {};
    var custid = arg.currentuser.custid;//;
    var qrcode = arg.qrcode;
    var phone = arg.phone;
    var useraccount = arg.currentuser.nickname;
    var cashcoupondb = db.models.cashcoupon;
    var productdb = db.models.mallproduct;
    switch (arg.type) {
        case vo.project.lotterytypes.prolottery:
            recdbmodel = db.models.prolotteryrecord;
            break;
        case vo.project.lotterytypes.progift:
            recdbmodel = db.models.progiftrecord;
            break;
        default:
            recdbmodel = ''
    }

    if ('string' === typeof recdbmodel) {
        cb(returnData.createError(returnData.errorType.project.notype, '请求发送优惠券出错!'), null);
        return;
    }

    function getlotteryinfo() {
        var d = Q.defer();
        recdbmodel.findOne({
            where: {
                recid: qrcode
            }
        }).then(function (res) {
            if (res) {
                var rec = res.get({ chain: true });
                if (rec.mallproducttype === vo.project.prizetype.cashcoupon || rec.mallproducttype === vo.project.prizetype.cashcoupon) {
                    if (rec.state == 'normal') {
                        d.resolve(rec);
                    } else {
                        logger.error(useraccount, '不能重复提交已成功的优惠券发放');
                        d.reject(returnData.errorType.refuse);
                    }
                } else {
                    logger.error(useraccount, '找到对应的中奖纪录，但该中奖纪录不是对应的优惠券，所以拒绝派发');
                    d.reject(returnData.errorType.notexist);
                }

            } else {
                logger.error(useraccount, '未找到对应的中奖纪录');
                d.reject(returnData.errorType.notexist);
            }

        }).catch(function (err) {
            d.reject(err.message);
        });
        return d.promise;
    }

    function getcashcoupon() {
        var d = Q.defer();
        cashcoupondb.findOne({
            where: {
                state: 'normal'
            },
            limit: 1
        }).then(function (res) {
            if (res) {
                var cashvo = res.get({ chain: true });
                d.resolve(cashvo);
            } else {
                logger.error(useraccount, '未找到可用的优惠券，可能库存不足');
                d.reject(returnData.errorType.mallmanager.understock);
            }
        }).catch(function (err) {
            d.reject(err.message);
        })
        return d.promise;
    }

    function updatecashcoupon(cashvo) {

        var d = Q.defer();
        //开启创建订单事物
        db.sequelize.transaction({
            autocommit: true
        }).then(function (tran) {
            cashcoupondb.update({
                owner: custid,
                usedate: moment().format('X'),
                state: 'used'
            }, {
                    where: {
                        url: cashvo.url
                    },
                    transaction: tran
                }).then(function (res) {
                    d.resolve(cashvo, tran);
                }).catch(function (err) {
                    logger.error(useraccount, '优惠券记录更新失败：' + JSON.stringify(err));
                    tran.rollback();
                    d.reject(returnData.errorType.dataBaseError.unknow);
                });
        })
        return d.promise;
    }

    function updatelotteryrecord(cashvo, tran) {

        var d = Q.defer();
        recdbmodel.update({
            'state': 'success'
        }, {
                where: {
                    'recid': qrcode
                },
                transaction: tran
            }).then(function (res) {
                d.resolve(cashvo, tran);
            }).catch(function (err) {
                logger.error(useraccount, '更新奖品类型为优惠券的中奖纪录的状态失败：' + JSON.stringify(err));
                tran.rollback();
                d.reject(returnData.errorType.dataBaseError.unknow);
            })
        return d.promise;

    }


    function updatecouponstock(cashvo, tran) {

        var d = Q.defer();
        var updateExtendsql = 'UPDATE mallproduct set amount = amount - 1 where productid = \'' + cashvo.productid + '\'';
        db.sequelize.query(updateExtendsql, { transaction: tran }).spread(function (results, metadata) {
            logger.info(useraccount, "更新优惠券库存成功。");
            d.resolve(results);
        }).catch(function (err) {
            logger.error(useraccount, "更新优惠券库存失败");
            tran.rollback();
            d.reject(err.message);
        });

        return d.promise;

    }

    function sendcashcoupon(cashvo, tran) {

        var d = Q.defer();
        var couponUrl = cashvo.url;
        // 发送优惠券信息
        sms.sendCashCouponSms(phone, couponUrl).then(function (res) {
            d.resolve(cashvo);
            tran.commit();
        }).catch(function (err) {
            logger.error(useraccount, '优惠短信发送失败：' + JSON.stringify(err));
            tran.rollback();
            d.reject('SENDFAIL');
        });
        return d.promise;
    }

    sms.valsms(arg.phone, arg.smscode)
        .then(getlotteryinfo)
        .then(getcashcoupon)
        .then(updatecashcoupon)
        .then(updatelotteryrecord)
        .then(updatecouponstock)
        .then(sendcashcoupon)
        .then(function (res) {
            cb(null, returnData.createData(res));
        }).catch(function (err) {
            logger.error(useraccount, err);
            var code = 'unknow';
            if (err == 'understock') code = 'understock';
            cb(returnData.createError(code, err), null);
        });


    /*updatecashcoupon({url:'ER201705250000001314'})
    .then(updatelotteryrecord)
    .then(updatecouponstock)
    .then(sendcashcoupon)
    .then(function (res) {
        cb(null, returnData.createData(res));
    }).catch(function (err) {
        logger.error(useraccount, err);
        cb(returnData.createError('unknow', err), null);
    });*/
}

exports.baseinfo = baseinfo;
exports.checkqrcode = checkqrcode;
exports.generate = generate;
exports.sendmoney = sendmoney;
exports.generatepoint = point.generate;
exports.saveqa = qa.save;
exports.updatephoneno = updatephoneno;
exports.sendsms = sendsms;
exports.getpidbyqrcode = getpidbyqrcode;
exports.onsale = sale.generate;
exports.gift = gift.generate;
exports.genorder = genorder;
exports.setQrcodeStatesEx = setQrcodeStatesEx;
exports.getCashCoupon = getCashCoupon;