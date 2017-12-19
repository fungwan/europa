/**
 * Created by shuwei on 2017/3/1.
 */
var xml2js = require('xml2js');
var moment = require('moment');
var eventproxy = require('eventproxy');
var urlcoder = require('url');
var md5 = require('MD5');

var config = require('../../config');
var logger = require('../common/logger');
var db = require('../common/db');
var clube = require('./clubmanager');
var mallmgt = require('./mallmanageMobile');
var returnData = require('../common/returnData');

function createErrorMessage(res, error) {
    logger.error('微信事件', error.message);
    res.send('');
}

function createTextMessage(res, fromuser, touser, msg) {
    var data = '<xml><ToUserName><![CDATA[' + touser + ']]></ToUserName>' +
        '<FromUserName><![CDATA[' + fromuser + ']]></FromUserName>' +
        '<CreateTime>' + moment().format('X') + '</CreateTime>' +
        '<MsgType><![CDATA[text]]></MsgType><Content><![CDATA[' + msg + ']]></Content></xml>';
    logger.info('微信事件返回', data);
    res.end(data);
}

function createTextImageMessage(res, fromuser, touser, msginfo) {
    var data = '<xml><ToUserName><![CDATA[' + touser + ']]></ToUserName>' +
        '<FromUserName><![CDATA[' + fromuser + ']]></FromUserName>' +
        '<CreateTime>' + moment().format('X') + '</CreateTime>' +
        '<MsgType><![CDATA[news]]></MsgType>' +
        '<ArticleCount>' + msginfo.length + '</ArticleCount>' +
        '<Articles>';
    var style = config.mall.articleimagestyle;
    msginfo.forEach(function (info) {
        var url = encodeURI(info.url);

        var itemstr = '<item>' +
            '<Title><![CDATA[' + info.title + ']]></Title>' +
            '<Description><![CDATA[' + info.description + ']]></Description>' +
            '<PicUrl><![CDATA[' + config.mall.articleimageurl + info.picUrl + '-' + style + ']]></PicUrl>' +
            '<Url><![CDATA[' + url + ']]></Url>' +
            '</item>'
        data = data + itemstr;
        style = config.mall.articleimagesmallstyle;
    });
    data = data + '</Articles></xml>';
    logger.info('微信事件返回', data);
    res.send(data);
}

function onsubscribe(res, info) {
    var ep = new eventproxy();
    ep.on('ok', function (result) {
        logger.info(useraccount, "获取消息成功");
        cb(null, returnData.createData(result));
    });
    //错误处理
    ep.on("error", function (error) {
        createErrorMessage(res, error)
    });
    var ardb = db.models.article;
    ardb.findAll({
        attributes: { exclude: ['content'] },
        where: { state: 1, $or: [{ ishot: 1 }, { istop: 1 }] },
        limit: 8,
        order: [['createtime', 'DESC']]
    }).then(function (result) {
        if (result && result.length > 0) {
            var artlist = [];
            result.forEach(function (item) {
                var art = {
                    title: item.title,
                    description: item.summary,
                    picUrl: item.titleimageurl,
                    url: config.mall.articleUrl + item.artid
                };
                artlist.push(art);
            });
            createTextImageMessage(res, info.ToUserName, info.FromUserName, artlist);
        } else {
            createTextMessage(res, info.ToUserName, info.FromUserName, '感谢您关注万码易联,现在您可以开始查询或使用您的积分了!')
        }
    }).catch(function (error) {
        ep.emit('error', error);
    })
}

function getmyarticle(res, info) {
    var dbcust = db.models.customer;

    dbcust.findOne({
        where: { openid: info.FromUserName }
    }).then(function (userinfo) {
        if (userinfo) {
            var arg = {
                custid: userinfo.custid,
                pagenumber: '1',
                pagerows: '8'
            };
            clube.getarticle(arg, function (error, data) {
                if (error) {
                    createErrorMessage(res, error);
                } else {
                    data = data.data.rows;
                    var artlist = [];
                    data.forEach(function (item) {
                        var art = {
                            title: item.title,
                            description: item.summary,
                            picUrl: item.titleimageurl,
                            url: config.mall.articleUrl + item.artid
                        };
                        artlist.push(art);
                    });
                    if (artlist.length > 0) {
                        createTextImageMessage(res, info.ToUserName, info.FromUserName, artlist);

                    } else {
                        res.end('');
                    }
                }
            });
        } else {
            res.end('');
        }
    }).catch(function (error) {
        createErrorMessage(res, error);
    });

}

function getarticlebytype(res, info) {
    var arg = {
        adtype: info.adtype,
        state: '1'
    };
    clube.getAdList(arg, function (error, data) {
        if (error) {
            createErrorMessage(res, error);
        } else {
            data = data.data;
            var artlist = [];
            data.forEach(function (item) {

                var art = {
                    title: item.title,
                    description: item.summary,
                    picUrl: item.titleimageurl,
                    url: config.mall.articleUrl + item.artid
                };
                artlist.push(art);

            });
            if (artlist.length > 0) {
                createTextImageMessage(res, info.ToUserName, info.FromUserName, artlist);

            } else {
                res.end('');
            }
        }
    });

}

function doclick(res, info) {
    switch (info.EventKey) {
        case 'club_msg':
            info.adtype = 'clube_onsale';
            getarticlebytype(res, info);
            break;
        case 'clube_hot':
            info.adtype = 'clube_hot';
            getarticlebytype(res, info);
            break;
        default:
            res.end('');
            break;
    }

}

function doevent(res, info) {
    switch (info.Event) {
        case 'subscribe':
            info.adtype = 'focus';
            getarticlebytype(res, info);
            break;
        case 'unsubscribe':
            createTextMessage(res, info.ToUserName, info.FromUserName, '期待您的再次关注!');
            break;
        case 'CLICK':
            doclick(res, info);
            break;
        default:
            res.send('');
            break;
    }
}

function dotxt(res, info) {
    switch (info.Content) {
        case 'my':
            info.adtype = 'focus';
            getarticlebytype(res, info);
            break;
        default:
            res.send('');
            break;
    }
}

function onrecivemessage(req, res) {
    var body = req.body;
    var parser = new xml2js.Parser({ trim: true, explicitArray: false, explicitRoot: false });
    parser.parseString(body, function (error, result) {
        if (error) {
            logger.error('微信事件', '报文解析错误!' + error.measage);
        }
        else {
            logger.info('微信事件', body);
            switch (result.MsgType) {
                case 'event':
                    doevent(res, result);
                    break;
                case 'text':
                    dotxt(res, result);
                    break;
                default:
                    res.send('');
                    break;
            }
        }
    });
}

function sendaritcl(req, res) {
    var openid = req.body.openid;
    getmyarticle(res, { FromUserName: openid, ToUserName: 'test' });
}

var buildXML = function (json) {
    var builder = new xml2js.Builder();
    return builder.buildObject(json);
};

var parseXML = function (xml, fn) {
    var parser = new xml2js.Parser({ trim: true, explicitArray: false, explicitRoot: false });
    parser.parseString(xml, fn || function (err, result) { });
};

var gensign = function (param) {

    var querystring = Object.keys(param).filter(function (key) {
        return param[key] !== undefined && param[key] !== '' && ['pfx', 'partner_key', 'sign', 'key'].indexOf(key) < 0;
    }).sort().map(function (key) {
        return key + '=' + param[key];
    }).join("&") + "&key=" + config.wechat.partner_key;

    return md5(querystring).toUpperCase();
};

function paynotify(req, res) {

    var orderbm = '';//商户订单号
    var paycb = function (msg, res) {
        if (msg.return_code == 'SUCCESS' && msg.result_code == 'SUCCESS') {
            logger.info('paynotify', '商户订单号:' + orderbm + '支付成功...');
            res.end(buildXML({ xml: { return_code: 'SUCCESS' } }));

        } else {
            logger.info('paynotify', '商户订单号:' + orderbm + '支付失败...');
            res.end(buildXML({ xml: { return_code: 'FAIL' } }));
        }
    }

    var xml = req.body || req.rawBody;
    parseXML(xml, function (err, msg) {
        if (err == null) {
            //检查对应业务订单数据的状态，判断该通知是否已经处理，如果处理直接返回成功
            orderbm = msg.out_trade_no;
            var orderdb = db.models.mallorder;
            orderdb.findOne({
                where: {
                    orderbm: orderbm
                }
            }).then(function (results) {
                if (results) {
                    var ordervo = results.get({ chainL: true });
                    if (ordervo.state == 0/*待付款*/) {
                        //校验签名，验证是否存在数据劫持
                        var recvSign = msg.sign;
                        delete msg['sign'];
                        var makedSign = gensign(msg);
                        if (makedSign != recvSign) {
                            logger.info(req.ip, '存在数据劫持,并进行了签名更改...');
                            res.json(returnData.createError('refused', '非法请求'));
                            return;
                        }
                        //异步处理订单状态和财务日志
                        mallmgt.doOrderPayResult(ordervo, msg);

                        //ack回微信支付
                        paycb(msg, res);
                    } else {
                        logger.info('paynotify', '处理微信支付回调重复通知');
                        paycb(msg, res);
                    }
                } else {
                    logger.info('paynotify', '支付了一个db里orderid不存在的订单，可能为测试订单,结果为:' + msg.return_code);
                    paycb(msg, res);
                }
            });
        } else {
            logger.info('paynotify', '接收到微信支付回调通知，但系统内部xml解析错误' + err.message);
            res.end(buildXML({ xml: { return_code: 'FAIL' } }));
        }
    });
}

exports.onrecivemessage = onrecivemessage;
exports.sendaritcl = sendaritcl;
exports.paynotify = paynotify;