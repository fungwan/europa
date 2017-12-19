/**
 * Created by shuwei on 15/12/14.
 */
//加载第三方模块
var uuid = require('node-uuid');
var moment = require('moment');
var eventproxy = require('eventproxy');
var request = require('request');

var returnData = require('../common/returnData');
var authen = require('../common/authenticater');
var wechat = require('../wechat/index');
var customer = require('./customer');
var pmodel = require('../models/vomodels/index');
var tool = require('../common/tool');
var logger = require('../common/logger');
var db = require('../common/db');
var config = require('../../config');
var cities = require('./cities');

//根据经纬度获取地理位置信息
function getaddress(lng, lat, cb) {
    if (!lng || !lat || (lng == 0 && lat == 0)) {
        logger.error(config.systemUser, '经纬度信息错误!');
        cb({ code: returnData.errorType.unknow, message: '经纬度信息错误!' }, null);
    }
    else {
        logger.info(null, '开始解析地理位置信息');
        var path = config.services.baidumap.url + config.services.baidumap.interfaces.geocoder;
        path = path.replace('{1}', lat);
        path = path.replace('{2}', lng);
        request({
            url: path,
            method: 'get'
        }, function (err, data) {
            if (err) {
                logger.error(config.systemUser, '解析地理位置信息失败！');
                logger.error(config.systemUser, JSON.stringify(err));
                cb({ code: returnData.errorType.unknow, message: err.message }, null);
            }
            else {
                data = data.body;
                data = data.replace('renderReverse&&renderReverse(', '');
                data = data.substr(0, data.length - 1);
                data = JSON.parse(data);
                if (data.stateus = 0) {
                    logger.error(null, '解析地理位置信息失败！错误码:' + data.stateus);
                    cb({ code: data.stateus, message: '解析地理位置信息失败！' }, null);
                }
                else {
                    logger.info(null, '解析地理位置信息成功!');
                    cb(null, data);
                }
            }
        });
    }
};

function makecustomer(webcus, custype, entid, lng, lat) {
    var cus = pmodel.customer.createnew();
    cus.custid = uuid.v4();
    cus.unionid = webcus.unionid;
    cus.entid = entid;
    cus.groupid = '';
    cus.nickname = webcus.nickname ? webcus.nickname : '';
    cus.sex = webcus.sex ? webcus.sex : 0;
    //cus.phone = '';
    cus.email = '';
    cus.birthday = '';
    cus.idcard = '';
    cus.country = webcus.country ? webcus.country : '';
    cus.province = webcus.province ? webcus.province : '';
    cus.city = webcus.city ? webcus.city : '';
    cus.address = '';
    cus.openid = webcus.openid;
    cus.zipcode = '';
    cus.custtype = custype;
    cus.groupname = '';
    cus.createtime = tool.date();
    cus.subscribe = webcus.subscribe;
    cus.lng = lng;
    cus.lat = lat;
    cus.edittime = tool.date();
    if (webcus.headimgurl)
        cus.headimgurl = webcus.headimgurl;
    formatArea(cus);
    return cus;
}

function convertcustomer(webcus, custype, entid, lng, lat, cb) {
    function getareacode(cust, loca) {

        function finishcode(err, coderec) {
            if (err) {
                cust.areacode = '0';//表示中国地区
                cb(null, cust);
            }
            else {
                coderec = coderec.data;
                if (!!coderec) {

                    cust.country = coderec.country ? coderec.country : cust.country;
                    cust.province = coderec.province ? coderec.province : cust.province;
                    cust.city = coderec.city ? coderec.city : cust.city;
                    cust.areacode = coderec.code ? coderec.code : cust.areacode;
                }
                cb(null, cust);
            }
        }

        var arg = {};
        arg.province = cust.province;
        if (cust.province.indexOf('北京') != -1 || cust.province.indexOf('天津') != -1 || cust.province.indexOf('上海') != -1 || cust.province.indexOf('重庆') != -1) {
            arg.city = null;
        }
        else {
            arg.city = cust.city;
        }

        arg.district = loca.addressComponent.district;
        cities.getCode(arg, finishcode);

    };

    var cus = makecustomer(webcus, custype, entid, lng, lat);
    getaddress(lng, lat, function (err, data) {
        if (err) {
            //cb(null, cus);
            getareacode(cus, { addressComponent: { district: null } });
        }
        else {
            cus.country = data.result.addressComponent.country;
            cus.province = data.result.addressComponent.province;
            cus.city = data.result.addressComponent.city;
            cus.address = data.result.formatted_address;
            getareacode(cus, data.result);
        }
    })

}

/**
 * 获取登陆验证的URL
 * @param redirecturi 回调url
 * @param autocheck 是否自动跳转(true:自动跳转,false:用户授权后跳转,该方式可以获取更多用户信息)
 * @param statekey 回调url时需要加上的参数
 */
function getloginurl(arg, cb) {
    var redirect_uri = arg.redirecturi,
        autocheck = arg.autocheck,
        statekey = arg.statekey;
    var scop = 'snsapi_base';
    if (autocheck == false) {
        scop = 'snsapi_userinfo';
    }
    var res = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + config.wechat.appId + '&redirect_uri=' +
        redirect_uri + '&response_type=code&scope=' + scop + '&state=' + statekey + '#wechat_redirect';
    cb(null, returnData.createData(res));
};

function formatArea(cust) {
    
    //why did we del '省'? 
    if (cust.province && cust.province[cust.province.length - 1] == "省") {
        cust.province = cust.province.replace(/省/ig, "");
    }

    if (
        cust.city && !((cust.city.length > 1 && cust.city[cust.city.length - 1] === "市") ||
            (cust.city.length > 2 && (cust.city.substring(cust.city.length - 2, cust.city.length)) === "地区") ||
            (cust.city.length > 3 && (cust.city.substring(cust.city.length - 3, cust.city.length)) === "自治州"))
    ) {
        if(cust.city.indexOf('阿坝') == -1 && cust.city.indexOf('凉山') == -1) cust.city = cust.city + "市";
    }
}

/**
 * 手机端登录
 * @param arg
 * @param cb
 * @param req
 * @param res
 * @param next
 */
function login(arg, cb, req, res, next) {
    var code = arg.code;
    var proxy = new eventproxy();


    //成功获取用户信息,完成session记录与返回
    proxy.on('finish', function (info, exinfo) {
        //写session
        info.extend = exinfo;
        req.body.username = info.openid;
        req.body.password = 'erathink_password';
        if (global.customers) {
            global.customers[info.openid] = info;
        }
        else {
            global.customers = {};
            global.customers[info.openid] = info;
        }
        function backuser(err) {
            if (err) {
                cb(returnData.createError(returnData.errorType.unknow, err, message), null);
            }
            else {
                logger.info('sys', JSON.stringify(info));
                cb(null, returnData.createData(info));
            }
        };
        authen.authenticate('local')(req, res, backuser);

    });

    proxy.on('addextend', function (custinfo) {
        var ex = {
            custid: custinfo.custid,
            point: 0,
            fullname: custinfo.nickname,
            phone: custinfo.phone,
            leve: 0
        }
        var custdb = db.models.custextend;
        custdb.findOrCreate({
            where: { custid: ex.custid },
            defaults: ex
        }).spread(function (data, created) {
            proxy.emit("finish", custinfo, data);
        }).catch(function (err) {
            logger.error(custinfo.nickname, '客户信息写入数据库失败!');
            logger.error(custinfo.nickname, err.stack);
            cb(returnData.createError(returnData.errorType.unknow), null);
        });
    });

    proxy.on('addgroup', function (custinfo) {
        var custgroup = {
            id: uuid.v4(),
            custid: custinfo.custid,
            entid: custinfo.entid
        }
        var custdb = db.models.custgroupmap;
        custdb.findOrCreate({
            where: { custid: custgroup.custid, entid: custgroup.entid },
            defaults: custgroup
        }).spread(function (data, created) {
            proxy.emit("addextend", custinfo);
        }).catch(function (err) {
            logger.error(custinfo.nickname, '客户信息写入数据库失败!');
            logger.error(custinfo.nickname, err.stack);
            cb(returnData.createError(returnData.errorType.unknow), null);
        });
    });

    //将用户信息写入数据库
    proxy.on('savecustomer', function (custinfo) {
        var cust = custinfo;
        formatArea(cust);
        var customer = db.models.customer;
        customer.findOrCreate({
            //where: {entid: cust.entid, unionid: cust.unionid, custtype: cust.custtype},  //老版本
            where: { unionid: cust.unionid, custtype: cust.custtype },
            defaults: cust
        })
            .spread(function (data, created) {
                if (created) {
                    logger.info(cust.nickname, '客户信息更新数成功!');
                    if (cust.entid && cust.entid != '' && cust.entid != '0') {
                        proxy.emit("addgroup", cust);
                    } else {
                        proxy.emit("addextend", cust);
                    }
                } else {
                    cust.createtime = data.creatime;
                    cust.custid = data.custid;
                    cust.entid = data.entid;
                    customer.update(
                        cust,
                        //{where:{entid: cust.entid,unionid:cust.unionid,custtype:cust.custtype}}
                        { where: { custid: cust.custid } }
                    ).then(function () {
                        logger.info(cust.nickname, '客户信息更新数成功!');
                        if (cust.entid && cust.entid != '' && cust.entid != '0') {
                            proxy.emit("addgroup", cust);
                        } else {
                            proxy.emit("finish", cust);
                        }
                    }).catch(function (error) {
                        logger.error(cust.nickname, '客户信息更新数失败!');
                        logger.error(cust.nickname, error.stack);
                        cb(returnData.createError(returnData.errorType.unknow), null);
                    })
                }
            }).catch(function (err) {
                logger.error(cust.nickname, '客户信息写入数据库失败!');
                logger.error(cust.nickname, err.stack);
                cb(returnData.createError(returnData.errorType.unknow), null);
            });
    });

    //获取微信web 版用户信息
    proxy.on('getwebuser', function (webtoken, subscribe) {
        wechat.usermanager.getwebuser(webtoken.access_token, webtoken.openid, function (err, info) {
            if (err) {
                logger.error(config.systemUser, '获取微信web 版用户信息失败!');
                logger.error(config.systemUser, JSON.stringify(err.stack));
                cb(returnData.createError(err.code, err.message), null);
            }
            else {
                logger.info(config.systemUser, '获取微信web 版用户信息成功!');
                info.subscribe = subscribe;
                convertcustomer(info, arg.custtype, arg.entid, arg.lng, arg.lat, function (err, cusinfo) {
                    proxy.emit('savecustomer', cusinfo);
                });
            }
        });
    });

    //获取微信完整版用户信息
    proxy.on('getinfofromwechat', function (webtoken) {
        wechat.tokenmanager.gettoken(webtoken, function (err, token) {
            if (err) {
                logger.error(config.systemUser, '获取token信息失败!');
                logger.error(config.systemUser, err.stack);
                cb(returnData.createError(err.code, err.message), null);
            }
            else {
                token = JSON.parse(token);
                var openid = webtoken.openid;
                var tokencode = token.access_token;
                wechat.usermanager.getuser(tokencode, openid, function (err, info) {
                    if (err) {
                        logger.error(config.systemUser, '获取微信完整版用户信息失败!');
                        logger.error(config.systemUser, err.message);
                        cb(returnData.createError(err.code, err.message), null);
                    }
                    else {
                        logger.info(null, '获取微信完整版用户信息成功!');
                        var cusinfo = makecustomer(info, arg.custtype, arg.entid, arg.lng, arg.lat);
                        if (cusinfo.subscribe == 0) {
                            proxy.emit('getwebuser', webtoken, cusinfo.subscribe);
                        }
                        else {
                            convertcustomer(cusinfo, arg.custtype, arg.entid, arg.lng, arg.lat, function (err, cusinfobc) {
                                proxy.emit('savecustomer', cusinfobc);
                            });
                        }

                    }
                })
            }
        });
    });

    proxy.on('updateinfo', function (cust, webtoken) {
        var edittime = moment(cust.edittime, config.dateformat).add(15, 'days');
        var nowtime = moment();
        //如果修改时间已过去15天以上则重新获取用户信息,否则直接返回
        if (edittime.isBefore(nowtime)) {// || cust.openid != webtoken.openid
            proxy.emit('getinfofromwechat', webtoken);
        }
        else {
            proxy.emit('finish', cust);
        }

    });


    //查询数据库用户信息
    proxy.on('getinfo', function (webtoken) {
        //检查数据库中是否存在用户
        var cu = {};
        cu.unionid = webtoken.unionid;
        cu.entid = arg.entid;
        cu.custtype = arg.custtype;
        function getbyentanduidSuccess(err, result) {
            if (err) {
                logger.error(config.systemUser, '查询用户信息时出错!********', err);
                //logger.error(config.systemUser,JSON.stringify(err.stack));
                cb(err, null);
                return;
            }
            else {
                var cust = result.data;

                if (cust) {
                    proxy.emit('updateinfo', cust, webtoken);
                }
                else {
                    proxy.emit('getinfofromwechat', webtoken);
                }
            }
        }

        customer.getbyentanduid(cu, getbyentanduidSuccess);

        //proxy.emit('getinfofromwechat', webtoken);

    });

    //获取用户登陆凭证
    wechat.usermanager.getwebtoken(code, function (err, webtoken) {
        if (err) {
            cb(returnData.createError(err.code, err.message), null);
            return;
        }
        else {
            proxy.emit('getinfo', webtoken);
        }
    });
};

/**
 * 获取可用的支付单号
 * @param cb
 */
function getbillno(cb) {
    logger.info(null, '请求订单号!');
    var path = config.services.billnoserver.url + config.services.billnoserver.interfaces.getbillno;
    request({
        url: path,
        method: 'post'
    }, function (err, data) {
        if (err) {
            logger.error(config.systemUser, '获取订单号失败！');
            logger.error(config.systemUser, JSON.stringify(err));
            cb({ code: returnData.errorType.unknow, message: err.message }, null);
        }
        else {
            data = JSON.parse(data.body);
            if (data.error) {
                logger.error(config.systemUser, '获取订单号失败！' + data.error.message);
                cb(data.error, null);
            }
            else {
                data = data.data;
                logger.info(config.systemUser, '获取token成功!');
                cb(null, data);
            }
        }
    });
}

function resendredpack(arg, cb) {
    var proxy = new eventproxy();
    var bno = arg.billno;
    //创建订单
    var bill = {};
    bill.billno = bno;
    bill.billtype = arg.billtype;
    bill.resultcode = '';
    bill.openid = arg.openid;
    bill.amount = arg.amount;
    bill.createtime = tool.date();
    bill.submittime = '';
    bill.sendtime = '';//支付时间
    bill.listid = '';
    bill.state = 'normal';//状态 0:未提交 1:已支付  2:支付失败
    var billdb = db.models.bill;


    proxy.on('updatebill', function (billinfo) {
        //var sendtime = moment(billinfo.sendtime, 'YYYYMMDDhhmmss');
        var fields = {
            resultcode: billinfo.resultcode,
            state: billinfo.state,
            listid: billinfo.listid,
            sendtime: billinfo.sendtime,
            submittime: billinfo.submittime
        };

        billdb.update(fields,
            {
                where: { billno: billinfo.billno }
            }
        ).then(
            function (result) {
                logger.info(config.systemUser, '更新订单状态成功,单号:' + billinfo.billno);
                cb(null, billinfo);
            },
            function (error) {
                logger.error(config.systemUser, '更新订单状态失败,单号:' + billinfo.billno);
                logger.error(config.systemUser, config.systemUser, JSON.stringify(error));
                cb(null, billinfo);
            }
            ).catch(function (error) {
                logger.error(config.systemUser, '更新订单状态失败,单号:' + billinfo.billno);
                logger.error(config.systemUser, config.systemUser, JSON.stringify(error));
                cb(null, billinfo);
            });
    });

    proxy.on('submit', function (ops, billno) {
        //提交发送申请
        ops.amount = ops.amount * 100;
        var opts = {
            nick_name: "",
            send_name: ops.sendname,
            re_openid: ops.openid,
            total_amount: ops.amount,
            max_value: ops.amount,
            min_value: ops.amount,
            total_num: 1,
            wishing: ops.wishing,
            client_ip: ops.ip,
            act_name: ops.actname,
            remark: ops.remark,
            billno: billno
        };
        wechat.paymanager.sendredpack(opts, function (err, result) {
            bill.submittime = tool.date();
            if (err) {
                logger.error(config.systemUser, '微信端红包发送失败,单号:' + bill.billno);
                logger.error(config.systemUser, JSON.stringify(err));
                bill.resultcode = err.code + ':' +err.message;
                bill.state = 'sendfalse';
            }
            else {
                logger.info(config.systemUser, '微信端红包发送成功,单号:' + bill.billno);
                bill.resultcode = 'success';
                bill.state = 'success';
                bill.listid = result.send_listid;
                bill.sendtime = tool.date();
            }
            ;
            proxy.emit('updatebill', bill);
        })
    });

    proxy.on('createbill', function () {
        billdb.create(
            bill
        ).then(function () {
            logger.info(config.systemUser, '创建订单成功,单号:' + bill.billno);
            proxy.emit('submit', arg, bno);
        }).catch(function (err) {
            logger.error(config.systemUser, '创建订单失败,单号:' + bill.billno);
            logger.error(config.systemUser, JSON.stringify(err));
            cb(err, null);
        });
    });

    billdb.findOne({
        where: { billno: bill.billno }
    }).then(function (result) {
        if (result) {
            proxy.emit('submit', arg, bno);
        } else {
            proxy.emit('createbill');
        }
    }).catch(function (error) {
        cb(error, null);
    });



}

/**
 * 发送红包
 * @param {}
 * @param cb(返回订单信息,为空表示订单创建失败)
 */
function sendredpack(arg, cb) {
    logger.info(null, '开始生成红包订单!');

    //var proxy = new eventproxy();
    getbillno(function (err, bno) {
        if (err) {
            cb(err, null);
        } else {
            arg.billno = bno;
            resendredpack(arg, cb);
        }

    });


};

/**
 * 获取红包信息
 * @param mch_billno
 */
function getredpackinfo(billno, cb) {
    logger.info('获取红包信息!');
    wechat.paymanager.getredpack(billno, cb);
};

/**
 * 付款
 * @param mch_billno
 * @param openid
 * @param money
 * @param cb
 */
function pay(arg, money, cb) {
    logger.info('开始生成转账订单!');

    var proxy = new eventproxy();
    getbillno(function (err, bno) {
        if (err) {
            cb(err, null);
        } else {
            //创建订单
            var bill = {};
            bill.billno = bno;
            bill.billtype = arg.billtype;
            bill.resultcode = '';
            bill.openid = arg.openid;
            bill.amount = arg.amount;
            bill.createtime = tool.date();
            bill.submittime = '';
            bill.sendtime = '';//支付时间
            bill.listid = '';
            bill.state = 'normal';//状态 0:未提交 1:已支付  2:支付失败
            var billdb = db.models.bill;
            billdb.create(
                bill
            ).then(function () {
                logger.info(config.systemUser, '创建订单成功,单号:' + billinfo.billno);
                proxy.emit('submit', arg, bno);
            }).catch(function (err) {
                logger.error(config.systemUser, '创建订单失败,单号:' + billinfo.billno);
                logger.error(config.systemUser, JSON.stringify(err));
                cb(err, null);
            });

            proxy.on('submit', function (ops, billno) {
                //提交发送申请
                var opts = {
                    partner_trade_no: billno,
                    openid: ops.openid,
                    amount: ops.amount,
                    desc: ops.desc,
                    spbill_create_ip: ops.ip
                };
                wechat.paymanager.paymoney(opts, function (err, result) {
                    bill.submittime = tool.date();
                    if (err) {
                        logger.error(config.systemUser, '转账失败,单号:' + billinfo.billno);
                        logger.error(config.systemUser, JSON.stringify(err));
                        bill.resultcode = err.code + ':' +err.message;
                        bill.state = 'sendfaile';
                    }
                    else {
                        logger.info(config.systemUser, '转账送成功,单号:' + billinfo.billno);
                        bill.resultcode = 'success';
                        bill.state = 'finish';
                        bill.listid = result.send_listid;
                        bill.sendtime = tool.date();
                    }
                    ;
                    proxy.emit('updatebill', bill);
                })
            });

            proxy.on('updatebill', function (billinfo) {
                //var sendtime = moment(billinfo.sendtime, 'YYYYMMDDHHmmSS');
                var fields = {
                    resultcode: billinfo.resultcode,
                    state: billinfo.state,
                    listid: billinfo.listid,
                    sendtime: billinfo.sendtime,
                    submittime: billinfo.submittime
                };

                billdb.update(fields,
                    {
                        where: { billno: billinfo.billno }
                    }
                ).then(
                    function (result) {
                        logger.info(config.systemUser, '更新订单状态成功,单号:' + billinfo.billno);
                        cb(null, billinfo);
                    },
                    function (error) {
                        logger.error(config.systemUser, '更新订单状态失败,单号:' + billinfo.billno);
                        logger.error(config.systemUser, JSON.stringify(error));
                        cb(null, billinfo);
                    }
                    ).catch(function (error) {
                        logger.error(config.systemUser, '更新订单状态失败,单号:' + billinfo.billno);
                        logger.error(config.systemUser, JSON.stringify(error));
                        cb(null, billinfo);
                    });
            });

        }

    });
};

function getsign(arg, cb) {
    var url = arg.url;
    wechat.tokenmanager.getsign(url, function (err, data) {
        if (err) {
            cb(returnData.createError(err.code, err.message), null);
        }
        else {
            cb(null, returnData.createData(data));
        }
    });
}

function checklogin(arg, cb, req, res) {
    var useraccount = !!req.user ? req.user : null;
    if (useraccount) {
        cb(null, returnData.createData(useraccount));
    } else {
        cb(returnData.createError('unlogin', '未登录'), null);
    }
}

/* 
 * 公众号内h5页面调用测试支付接口
 * @param mch_billno
 * @param openid
 * @param money
 * @param cb
 */
function mmppay(req,res) {
    console.log('DSDS');
    var getpayparamsurl = config.services.wxpayserver.url + config.services.wxpayserver.interfaces.getParams;
    var mchorderno = 'ER2017050900000061';//moment().format('YYYYMMDD')+Math.random().toString().substr(2, 10);
    var userip = req.ip.match(/\d+\.\d+\.\d+\.\d+/)[0];
    console.log(req.body.openid);
    var opt = {
        "body": "螺蛳粉",
        "out_trade_no": mchorderno,
        "total_fee": 1,
        "spbill_create_ip": userip,
        "notify_url": config.services.wxpayserver.notifyurl,
        "openid": req.body.openid
    }
    request.post({ url: getpayparamsurl, form: opt }, function (err, response, body) {
        if (!err && response.statusCode == 200) {
            var d = JSON.parse(body);
            res.json(d);
        } else {
            res.json(returnData.createError('unkonw', err.message));
        }
    });
}

exports.login = login;
exports.sendredpack = sendredpack;
exports.resendredpack = resendredpack;
exports.getredpackinfo = getredpackinfo;
exports.pay = pay;
exports.getsign = getsign;
exports.checklogin = checklogin;
exports.getbillno = getbillno;
exports.mmppay = mmppay;
