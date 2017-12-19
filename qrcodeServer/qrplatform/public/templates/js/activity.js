/**
 * Created by Yatagaras on 2017/3/17.
 */


String.prototype.format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
};
String.prototype.getParameter = function (key) {
    var re = new RegExp(key + '=([^&]*)(?:&)?');
    return this.match(re) && this.match(re)[1];
};
/**
 * 转换为货币格式
 * @param places 小数位
 * @param symbol 货币单位
 * @param thousand 千位分隔符
 * @param decimal 小数位分隔符
 * @returns {string}
 */
Number.prototype.formatMoney = function (places, symbol, thousand, decimal) {
    places = !isNaN(places = Math.abs(places)) ? places : 2;
    symbol = symbol !== undefined ? symbol : "¥";
    thousand = thousand || ",";
    decimal = decimal || ".";
    var number = this,
        negative = number < 0 ? "-" : "",
        i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
};

var _activitySteps = ['propoint', 'prosale', 'proquestion', 'prolottery', 'progift'],
    _needAddressActivityTypes = ['prolottery', 'progift'],
    _needPhoneActivityTypes = ['prolottery', 'progift'],
    _checkData = null,
    _needAddressState = 'normal',
    _summaryNeedPhonestate = 'normal',
    _productNamePaths = {
        'prolottery': 'mallproductname',
        'progift': 'mallproductname'
    };

var _body = null,
    _main = null,
    project = null,
    template = null,
    isPreview = ['phone', 'web'].indexOf(window.location.href.getParameter('preview')) >= 0,
    answerTypes = {
        "radio": "1",
        "checkbox": "2",
        "text": "3"
    },
    answerSeparator = "|",
    errorCodes = {
        unknown: "unknown",
        used: "used",
        outofdate: "outofdate",
        nolottery: "nolottery",
        noexists: "noexists",
        noproject: "noproject",
        badcode: "badcode",
        limit: "limit"
    },
    CONST_UUID_EMPTY = '00000000-0000-0000-0000-000000000000';


var messager = {
    element: null,
    inited: false,
    init: function () {
        if (!messager.inited) {
            messager.element = $('<div id="messager"><div class="content"></div></div>');
            _body.append(messager.element);
            messager.element.on('click', '.close', messager.close);
            messager.inited = true;
        }
    },
    error: function (content, title) {
        messager.init();
        if ($.isPlainObject(content)) {
            if (content.hasOwnProperty('code')) {
                title = '抱歉，无法参加活动';
                switch (content.code) {
                    case errorCodes.used:
                        content = "该二维码已经参与了活动，感谢您的参与！";
                        break;
                    case errorCodes.outofdate:
                        content = "活动还未开始或已经结束，感谢您的参与！";
                        break;
                    case errorCodes.nolottery:
                        content = "该活动奖项已派发完毕，感谢您的参与！";
                        break;
                    case errorCodes.noexists:
                        content = "该二维码不存在，感谢您的参与！";
                        break;
                    case errorCodes.noproject:
                        content = "暂无活动，感谢您的参与！";
                        break;
                    case errorCodes.badcode:
                        content = "格式未通过，感谢您的参与！";
                        break;
                    case errorCodes.limit:
                        content = "已超过参与活动次数，感谢您的参与！";
                        break;
                    default:
                        content = content.message || "发生未知错误，请重新扫描进行尝试！";
                        break;
                }
                content = '<span class="big-icon lottery_none"></span>' + content;
            } else {
                content = '<span class="big-icon lottery_none"></span>非常抱歉，访问服务器时出错了：<br />{0}<br /><br />请稍候重新扫码参与活动，非常感谢您的参与！'.format(content.responseText || content.message || content.msg || JSON.stringify(content));
                title = title || '糟糕，出错了！';
            }
        }
        messager.element.children('.content').html('<h1 class="error">{0}</h1><h3 class="error box box-tb">{1}</h3>'.format(title || '糟糕，出错了！', content || '非常抱歉，活动出错了，请重新扫描进行尝试！'));
        messager.show();
    },
    success: function (content, title) {
        if (typeof content === 'string' && $.trim(content) !== '') {
            messager.init();
            messager.element.children('.content').html('<h1 class="success">{0}</h1><h3 class="success box box-tb">{1}</h3>'.format(title || '恭喜您', content));
            messager.show();
        }
    },
    show: function () {
        messager.element.addClass('open');
    },
    close: function () {
        messager.element.removeClass('open');
    }
};

var component = {
    navigation: function (info) {
        if ($.isPlainObject(info) && !$.isEmptyObject(info)) {
            if (!info.record || info.record == '') {
                //如果没有对应的获取记录，则开始创建组件，组件分为可见（即得奖励）与不可见（手动获取奖励）.
                switch (info.name) {
                    case 'propoint':
                    case 'prosale':
                    case 'progift':
                        eval('component.immediately.{0}()'.format(info.name.replace(/^pro/, '')));
                        break;
                    case 'proquestion':
                    case 'prolottery':
                        if (component.responsively === false) {
                            eval('component.{0}.install()'.format(info.name.replace(/^pro/, '')));
                        }
                        break;
                }
            } else {
                component.summary.acquired[info.name] = info.record;
                component.check();
            }
        }
    },
    check: function () {
        component.summary.count++;
        if (component.summary.count === component.summary.total) {
            navigation('cmc');
        }
    },
    summary: {
        total: 0,
        count: 0,
        acquired: {}, //之前已经获得的奖励
        got: {}, //本次获得的
        get: function (k, r, current) {
            var cls = current !== true ? 'before' : '';
            switch (k) {
                case 'propoint':
                    return '<h3 class="point {0}">获得了 <i>{1}</i> 积分。</h3>'.format(cls, r.point);
                case 'prosale':
                    if (r.code === 'unfinished') {
                        return '<h3 class="sale">已经扫码 <i>{0}</i> 次，再扫码 <i>{1}</i> 次，可获得优惠</h3>'.format(r.scaned, r.total - r.scaned);
                    } else if (r.price != null) {
                        return '<h3 class="sale {0}">获得了 <i>{1}</i> 元满减优惠红包</h3>'.format(cls, r.price);
                    }
                    break;
                case 'progift':
                    //return '<h3 class="gift {0}">获得了活动赠送的价值 <i>{1}</i> 元的 <i>{2} * {3}</i></h3>'.format(cls, r.price * r.amount, r.mallproductname, r.amount);
                    return '<h3 class="gift {0}">获得了活动赠送的的 <i>{2} * {1}</i></h3>'.format(cls, r.mallproductname, r.amount);
                case 'prolottery':
                    if (r.lotteryid === CONST_UUID_EMPTY || (r.lotteryname === '谢谢参与' && r.price === 0)) {
                        return null;
                    } else {
                        return '<h3 class="lottery {0}">在抽奖活动中获得了 <i>{1}</i> 的 <i>{2} * {3}</i></h3>'.format(cls, r.lotteryname || r.name, r.mallproductname, r.amount);
                    }
                default:
                    return null;
            }
        }
    },
    immediately: {
        fail: function () {
            messager.error('<span class="big-icon lottery_none"></span>非常抱歉，参与活动失败了<br />感谢您的参与，请稍候重新扫描二维码重新参与<button data-tag="cmc">查看更多活动消息</button>');
        },
        point: function () {
            //获得积分
            $.ajax({
                url: '/qrcode/generatepoint',
                data: {qrcode: parent.activity.uuid},
                method: 'POST'
            }).then(function (d) {
                if ($.isPlainObject(d) && $.isPlainObject(d.data)) {
                    component.summary.got.propoint = d.data;
                    component.check();
                } else {
                    component.immediately.fail();
                }
            }, component.immediately.fail);
        },
        sale: function () {
            //获得满减
            $.ajax({
                url: '/qrcode/onsale',
                data: {qrcode: parent.activity.uuid},
                method: 'POST'
            }).then(function (d) {
                if ($.isPlainObject(d) && $.isPlainObject(d.data)) {
                    component.summary.got.prosale = d.data;
                    component.check();
                } else {
                    component.immediately.fail();
                }
            }, component.immediately.fail);
        },
        gift: function () {
            //获得礼物
            $.ajax({
                url: '/qrcode/gift',
                data: {qrcode: parent.activity.uuid},
                method: 'POST'
            }).then(function (d) {
                if ($.isPlainObject(d) && $.isPlainObject(d.data)) {
                    component.summary.got.progift = d.data;
                    component.check();
                } else {
                    component.immediately.fail();
                }
            }, component.immediately.fail);
        }
    },
    responsively: false,
    question: {
        element: null,
        install: function () {
            if (project.directory.indexOf(',proquestion') >= 0) {
                component.responsively = true;
                component.question.element = $('<form id="question" class="box box-tb"><div class="s_loading"></div></form>').css(template.question.style);
                _main.append(component.question.element);
                $.ajax({
                    url: '/project/lottery/get',
                    data: {
                        type: 'proquestion',
                        projectid: project.projectid
                    },
                    method: 'POST'
                }).then(function (d) {
                    if (d && d.data && d.data.config && $.isArray(d.data.config.qaitems)) {
                        component.question.element.empty();
                        $.each(d.data.config.qaitems, function (i, item) {
                            var li = $("<li><p>{0}</p></li>".format(item.name)).data("d", item),
                                answerBox = $("<div class='box box-tb'></div>"),
                                as = null;

                            li.append(answerBox);
                            switch (item.qatype) {
                                case answerTypes.radio:
                                    as = item.answer.split(answerSeparator);
                                    $.each(as, function (j, a) {
                                        answerBox.append("<input name='{0}' type='radio' id='_{0}_{1}' value='{2}' {3} required /><label class='box box-lr box-align-center' for='_{0}_{1}'>{2}</label>".format(item.qaid, j, a, j === 0 ? "checked" : ""));
                                    });
                                    break;
                                case answerTypes.checkbox:
                                    as = item.answer.split(answerSeparator);
                                    $.each(as, function (j, a) {
                                        answerBox.append("<input name='{0}' type='checkbox' id='_{0}_{1}' value='{2}' required /><label class='box box-lr box-align-center' for='_{0}_{1}'>{2}</label>".format(item.qaid, j, a));
                                    });
                                    break;
                                case answerTypes.text:
                                    answerBox.append("<input name='{0}' type='text' maxlength='100' placeholder='{1}' required />".format(item.qaid, item.answer || ""));
                                    break;
                            }
                            component.question.element.append(li);
                        });
                        component.question.element.append($('<button>{0}</button>'.format(template.question.submit.title || '提交问卷')).click(component.question.submit).css(template.question.submit.style));
                    } else {
                        messager.error('获取问卷信息失败，可能是服务器在开小差，请稍候重新扫码尝试。');
                    }
                }, messager.error);
            } else {
                component.lottery.install();
            }
        },
        uninstall: function () {
            component.question.element.stop(true, true).animate({height: 0, opacity: 0}, 375, function () {
                component.question.element.remove();
            });
        },
        submit: function () {
            if (isPreview) {
                component.question.finish();
            } else {
                var sa = component.question.element.serializeArray(), go = true;
                component.question.element.find("li").each(function (i, item) {
                    var li = $(item), d = li.data("d");
                    li.children("i").remove();
                    if (d) {
                        var fd = false;
                        $.each(sa, function (j, a) {
                            if (a.name == d.qaid) {
                                fd = true;
                                return false;
                            }
                        });
                        if (!fd) {
                            go = false;
                            li.append("<i></i>");
                            _main.scrollTop(li.offset().top);
                            return false;
                        }
                    }
                });
                if (go) {
                    tooltip.open('正在提交问卷中，请稍候');
                    $.ajax({
                        url: '/qrcode/qasave',
                        data: {
                            qrcode: parent.activity.uuid,
                            qa: JSON.stringify(sa)
                        },
                        method: 'POST'
                    }).then(component.question.finish, messager.error).always(tooltip.close);
                }
            }
            return false;
        },
        finish: function () {
            component.lottery.install(true);
            component.question.uninstall();
        }
    },
    lottery: {
        playing: false,
        playTime: null,
        items: null,
        size: 0,
        result: null,
        record: null,
        element: null,
        install: function (prevIsQuestion) {
            if (project.directory.indexOf(',prolottery') >= 0) {
                component.responsively = true;
                component.lottery.element = $('<div id="lottery"><div class="s_loading"></div></div>').css(template.lottery.style);
                _main.children('.title').after(component.lottery.element);
                $.ajax({
                    url: '/project/lottery/get',
                    data: {
                        type: 'prolottery',
                        projectid: project.projectid
                    },
                    method: 'POST'
                }).then(function (d) {
                    if (d && d.data && d.data.config && $.isArray(d.data.config.lotteryitems)) {
                        component.lottery.items = d.data.config.lotteryitems;
                        component.lottery.element.empty();
                        var items = d.data.config.lotteryitems, hasThanks = false;
                        $.each(items, function (i, item) {
                            if (item.mallproductid === 'thanks') {
                                hasThanks = true;
                                return false;
                            }
                        });
                        if (!hasThanks) {
                            items.push({
                                name: "谢谢参与",
                                //name: '20积分',
                                price: 0,
                                lotteryid: CONST_UUID_EMPTY
                            });
                        }

                        component.lottery.size = items.length;
                        if (component.lottery.size < 6) items = items.concat(items);
                        var size = Math.round($(window).width() * .9);
                        var ul = $("<ul></ul>").css({
                            position: "relative",
                            width: size,
                            height: size
                        });
                        component.lottery.element.append(ul);
                        var degPer = 360 / items.length, startDeg = -degPer / 2 + 90, skewDeg = 90 - degPer;
                        $.each(items, function (i, item) {
                            var tdeg = startDeg + degPer * i,
                                li = "<li style='transform: rotate({0}deg) skew({1}deg); -webkit-transform: rotate({0}deg) skew({1}deg); -moz-transform: rotate({0}deg) skew({1}deg); -ms-transform: rotate({0}deg) skew({1}deg);'></li><a href='#' style='transform: rotate({2}deg); -webkit-transform: rotate({2}deg); -moz-transform: rotate({2}deg); -ms-transform: rotate({2}deg);'>{3}</a>".format(tdeg, skewDeg, tdeg + degPer / 2, item.name);
                            ul.append(li);
                        });
                        component.lottery.element.append($("<button value='bigwheel_play'></button>").css({
                            width: size,
                            height: size
                        }).click(component.lottery.submit));
                    } else {
                        messager.error('获取抽奖信息失败，可能是服务器在开小差，请稍候重新扫码尝试。');
                    }
                });
            } else {
                if (prevIsQuestion === true) {
                    messager.success('<span class="big-icon thanks"></span>非常感谢您在百忙中参与我们的问卷调查活动，为我们提供宝贵的反馈和建议。<button data-tag="cmc">查看更多活动消息</button>', '提交成功');
                } else {
                    navigation('cmc');
                }
            }
        },
        submit: function () {
            if (component.lottery.playing === true) return;
            component.lottery.playing = true;
            if (isPreview === true) {
                component.lottery.playTime = null;
                component.lottery.element.children("ul").stop(true).css("rotate", 0);
                component.lottery.go(Math.floor(Math.random() * component.lottery.size));
            } else {
                component.lottery.element.children("ul").stop(true).css("rotate", 0).transit({"rotate": 43200}, 60000, function (x, t, b, c, d) {
                    return c * (t /= d) * t * t * t + b;
                });
                component.lottery.playTime = new Date().getTime();
                //请求接口产生实际的抽奖信息
                $.ajax({
                    method: "post",
                    url: "/qrcode/generate",
                    timeout: 30000,
                    data: {qrcode: parent.activity.uuid}
                }).then(component.lottery.go, component.lottery.fail);
            }
        },
        calc: function (inx) {
            var toDeg = 0;
            if (inx >= 0 && inx < component.lottery.size) {
                var num = component.lottery.size, twice = false, laps = 8;
                if (num < 6) {
                    twice = true;
                    num *= 2;
                }

                if (component.lottery.playTime) {
                    var times = new Date().getTime() - component.lottery.playTime, deged = times * 0.72;
                    laps = Math.ceil(deged / 360) + 2;
                    if (laps < 8) laps = 8;
                }

                var deg = 360 / num, shiftDeg = Math.round(deg * .2), startDeg = deg / 2;
                toDeg = (360 * laps) + deg * (component.lottery.size - inx) - (deg / 2) + (shiftDeg + Math.random() * (deg - shiftDeg * 2));

                if (twice) toDeg += (Math.random() > .5 ? 180 : 0);
            }
            return toDeg;
        },
        go: function (d, animation) {
            var inx = -1;
            if ($.isPlainObject(d)) {
                if ($.isArray(component.lottery.items) && d && $.isPlainObject(d.data)) {
                    component.lottery.record = d.data;
                    $.each(component.lottery.items, function (i, item) {
                        if (item.lotteryid === d.data.lotteryid || (d.data.price === 0 && item.lotteryid === CONST_UUID_EMPTY)) {
                            inx = i;
                            component.lottery.result = item;
                            return false;
                        }
                    });
                }
            } else if (d != null && !isNaN(d)) {
                inx = d;
                component.lottery.result = component.lottery.items[inx];
                component.lottery.record = component.lottery.result;
            }

            var deg = component.lottery.calc(inx);
            if (animation !== false)
                component.lottery.element.children("ul").stop(true).transit({"rotate": deg}, 3000, component.lottery.summary, function (x, t, b, c, d) {
                    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
                });
            else {
                container.children("ul").stop(true).css("rotate", deg);
                component.lottery.summary();
            }
        },
        fail: function (e) {
            component.lottery.items = null;
            component.lottery.result = null;
            component.lottery.element.remove();
            messager.error(e);
        },
        summary: function () {
            var title = '', content = '';
            if (!component.lottery.result || component.lottery.result.lotteryid === CONST_UUID_EMPTY || component.lottery.result.mallproductid === 'thanks') {
                 title = '非常抱歉';
                 content = '<span class="big-icon lottery_none"></span>很遗憾，本次抽奖没有中奖。<br />非常感谢您的参与，下次再接再厉。<button data-tag="cmc">查看更多活动消息</button>';
                //title = '',
                //    content = '<span class="big-icon" style="background-image: url(/templates/css/images/point.svg);"></span>恭喜您获赠积分<br />非常感谢您的参与，请前往积分商城使用积分！<button data-tag="cmc">查看更多活动消息</button>';
            } else {
                title = '';
                content = '<span class="big-icon" style="background-image: url(/templates/css/images/{0}.svg);"></span>恭喜您中奖了！非常感谢您的参与，您获得了：<b class="lottery-name">{1} ({2}*{3})</b><button data-tag="cmc">查看我的奖品</button>'.format(component.lottery.result.mallproducttype, component.lottery.result.name, component.lottery.result.mallproductname, component.lottery.result.prizecount);
            }
            component.summary.got.prolottery = component.lottery.record;

            messager.success(content, title);
        }
    },
    address: {
        container: null,
        selector: null,
        adder: null,
        addInfo: {
            country: null,
            province: null,
            city: null
        },
        inited: false,
        values: {},
        default: null,
        target: null,
        init: function (callback) {
            if (!component.address.inited) {
                var _panel = $('<div id="address-panel" class="box box-tb box-pack-end"></div>');
                component.address.selector = $('<div id="address-select" class="box box-tb box-align-center box-pack-center"><div class="options"></div></div>');
                /*component.address.adder = $('<div id="address-add"><div class="panels"><div class="header">添加收货信息</div><div class="country address-add-panel box box-tb"><b>请选择国家：</b><div class="list flex shrink"></div></div><div class="province address-add-panel box box-tb"><b>请选择省/直辖市：</b><div class="list flex shrink"></div></div><div class="city address-add-panel box box-tb"><b>请选择所在城市：</b><div class="list flex shrink"></div></div><div class="others address-add-panel"></div></div></div>');*/
                component.address.adder = $('<div id="address-add" class="box box-lr box-pack-end"><div class="panels box box-tb">' +
                    '<div class="header">添加收货信息</div>' +
                    '<div class="tip">请选择：</div>' +
                    '<div class="flex shrink box box-lr panel-items">' +
                    '<div class="country address-add-panel" data-tip="请选择国家"></div>' +
                    '<div class="province address-add-panel" data-tip="请选择省/直辖市"></div>' +
                    '<div class="city address-add-panel" data-tip="请选择城市"></div>' +
                    '<div class="other address-add-panel" data-tip="请填写以下信息："><form>' +
                    '<div class="adder-other-item"><input type="text" id="adder-contact" maxlength="10" required="required" tabindex="11" name="contact" placeholder="请输入收货人姓名" /><label for="adder-contact">收货人：</label></div>' +
                    '<div class="adder-other-item"><input type="tel" id="adder-tel" maxlength="11" required="required" tabindex="12" pattern="^\\\d{11}$" name="phone" placeholder="请输入收货人的联系电话" /><label for="adder-tel">联系电话：</label></div>' +
                    '<div class="adder-other-item"><input type="text" id="adder-city" required="required" readonly /><label for="adder-city">收货地址：</label></div>' +
                    '<div class="adder-other-item"><textarea id="adder-detail" maxlength="100" required="required" rows="6" tabindex="13" name="address"></textarea><label for="adder-detail">详细地址：</label></div>' +
                    '<input type="submit" style="display: none !important;" placeholder="请输入详细的收货地址" /></form></div>' +
                    '</div><div class="adder-commands box box-lr">' +
                    '<button class="previous flex">上一步</button>' +
                    '<button class="submit flex">完成</button>' +
                    '</div>' +
                    '</div></div>');
                component.address.container = $('<div id="address-editor" class="box box-tb"><h1>请填写收货信息</h1><h3>您在本次活动中获得了实物类型的商品，我们将按照您填写的收货信息进行发货，关注我们的公众号可以查看物流信息。</h3><div class="items box box-tb flex shrink"></div><div class="box box-lr command-buttons"><button id="address-add-btn" class="flex">添加收货信息</button><button id="address-submit-btn" class="flex">确认收货信息</button></div></div>');
                _body.append(_panel.append(component.address.container)).append(component.address.selector).append(component.address.adder);
                component.address.container.on('click', '.item', component.address.click);
                component.address.selector.on('click', '.option', component.address.change)
                    .on('click', '.add', component.address.add)
                    .on('click', component.address.cancel);
                component.address.adder.on('click', '.item', component.address.select).find('button.previous').on('click', component.address.back).next().on('click', function () {
                    component.address.adder.find('form').submit();
                });
                component.address.adder.find('form').on('submit', component.address.submit).on('invalid', 'input, textarea', function (e) {
                    alert('dsadasdsad' + Math.random() * 100);
                });
                $('#address-add-btn').on('click', function () {
                    component.address.target = null;
                    component.address.add();
                });
                $('#address-submit-btn').on('click', component.address.genOrder);
                component.address.load(callback);
            }
        },
        load: function (callback) {
            component.address.container.children('.items').empty().append('<div class="s_loading"></div>');
            $.ajax({
                url: '/shop/getAddressList',
                data: {
                    custid: parent.activity.custid
                },
                method: 'post'
            }).then(function (d) {
                if ($.isPlainObject(d) && $.isPlainObject(d.data) && $.isArray(d.data.addressList)) {
                    var _firstAddress = null;
                    component.address.inited = true;
                    component.address.values = {};
                    $.each(d.data.addressList, function (i, ad) {
                        component.address.values[ad.addid] = ad;
                        if (_firstAddress == null) {
                            _firstAddress = ad.addid;
                        }
                        if (ad.addid === d.data.defaultAddressId) {
                            component.address.default = ad.addid;
                        }
                    });
                    if (d.data.addressList.length > 0 && component.address.default == null) {
                        component.address.default = _firstAddress;
                    }
                    component.address.fill();
                    if ($.isFunction(callback)) {
                        callback();
                    }
                }
            });
        },
        fill: function () {
            if ($.isPlainObject(component.address.values)) {
                var str = '<div class="title box box-lr box-align-center">请选择收货信息：</div>';
                if ($.isEmptyObject(component.address.values)) {
                    str += '<div class="add box box-lr box-align-center">您当前没有任何收货信息，点击进行添加。</div>';
                } else {
                    $.each(component.address.values, function (id, v) {
                        str += '<div data-value="{0}" class="option box box-lr box-align-center"><span class="flex"><b>{1}　{2}</b><br />{3}{4}{5}</span></div>'.format(id, v.contact, v.phone, v.province, v.city, v.address);
                    });
                    str += '<div class="add box box-lr box-align-center">添加新的收货信息</div>';
                }
                var ops = component.address.selector.children('.options').html(str);
                ops.outerHeight(ops.get(0).scrollHeight);
            }
        },
        create: function (items) {
            if (component.address.inited) {
                if ($.isPlainObject(items) && !$.isEmptyObject(items)) {
                    var str = '';
                    $.each(items, function (k, item) {
                        str += '<div class="item box box-tb" data-type="{0}"><div class="product-name box box-lr box-align-start"><i class="flex shrink"></i><b>{1}</b><i class="flex shrink"></i></div><em class="box box-lr box-align-center"></em><em class="box box-lr box-align-center"></em><em class="box box-lr"></em></div>'.format(k, item[_productNamePaths[k]]);
                    });
                    component.address.container.children('.items').html(str);
                    component.address.check();
                }
            } else {
                component.address.init(function () {
                    component.address.create(items);
                });
            }
        },
        check: function () {
            if (component.address.default == null) {
                $('#address-submit-btn').hide();
                component.address.container.find('.item').addClass('address-empty');
            } else if (component.address.default != null) {
                $('#address-submit-btn').show();
                component.address.container.find('.item').each(function (i, el) {
                    component.address.set($(el), component.address.default);
                    /*$(el).attr('data-value', component.address.default.addid).children('em:first').html('<i>收货人：</i><span class="flex">{0}</span>'.format(component.address.default.contact)).next().html('<i>收货地址：</i><span class="flex">{1}{2}{3}<b class="tip">点击更换其他收货地址</b></span>'.format(component.address.default.country, component.address.default.province, component.address.default.city, component.address.default.address));*/
                });
            }
        },
        openAdder: function (name) {
            var target = component.address.adder.find('.' + name + ''),
                pos = target.position(),
                pis = component.address.adder.find('.panel-items');

            pis.stop(true, false).animate({scrollLeft: pos.left + pis.scrollLeft()}, 275);
            component.address.adder.find('.tip').text(target.attr('data-tip'));
            if (name === 'other') {
                component.address.adder.find('.submit').show();
                component.address.adder.find('form').get(0).reset();
                $('#adder-city').val('中国/{0}/{1}'.format(component.address.adder.find('.province > .selected').text(), component.address.adder.find('.city > .selected').text()));
            } else {
                component.address.adder.find('.submit').hide();
            }
        },
        loadCities: function (type, v) {
            if (type != null && v != null) {
                var target = component.address.adder.find('.' + type + '');

                var prevValue = null;
                if (type === 'province') {
                    prevValue = component.address.addInfo.country;
                } else if (type === 'city') {
                    prevValue = component.address.addInfo.province;
                }

                if (prevValue !== v) {
                    target.html('<div class="s_loading"></div>');

                    if (type === 'province') {
                        component.address.addInfo.country = v;
                    } else if (type === 'city') {
                        component.address.addInfo.province = v;
                    }
                    $.ajax({
                        url: '/cities/query',
                        data: {
                            parentCode: v
                        },
                        method: 'post'
                    }).then(function (d) {
                        if ($.isPlainObject(d) && $.isArray(d.data)) {
                            var str = '';
                            $.each(d.data, function (i, c) {
                                str += '<div class="item" data-type="{2}" data-value="{0}">{1}</div>'.format(c.code, c.name, type);
                            });
                            target.html(str);
                        }
                    });
                }

                if (type === 'province') {
                    component.address.adder.find('.previous').hide();
                } else if (type === 'city') {
                    component.address.adder.find('.previous').show().val('#address-adding/province/' + component.address.addInfo.country);
                }
            }
        },
        select: function (e) {
            if (e.currentTarget.dataset.type && e.currentTarget.dataset.value) {
                $(e.currentTarget).addClass('selected').siblings().removeClass('selected');
                if (e.currentTarget.dataset.type === 'province') {
                    hash.set('#address-adding/city/' + e.currentTarget.dataset.value);
                } else if (e.currentTarget.dataset.type === 'city') {
                    hash.set('#address-adding/other');
                    component.address.adder.find('.previous').val('#address-adding/city/' + component.address.addInfo.province);
                }
            }
        },
        click: function (e) {
            //window.location.hash = '#address-selecting';
            if ($.isEmptyObject(component.address.values)) {
                component.address.add();
            } else {
                component.address.target = $(e.currentTarget);
                component.address.selector.find('.option[data-value="{0}"]'.format(component.address.target.attr('data-value'))).addClass('selected').siblings().removeClass('selected');
                hash.set('#address-selecting');
            }
        },
        set: function (target, id) {
            if (target instanceof jQuery && $.isPlainObject(component.address.values) && component.address.values.hasOwnProperty(id)) {
                var ad = component.address.values[id];
                target.removeClass('address-empty').attr('data-value', id).children('em:first').html('<i>收货人：</i><span class="flex">{0}</span>'.format(ad.contact)).next().html('<i>联系电话：</i><span class="flex">{0}</span>'.format(ad.phone)).next().html('<i>收货地址：</i><span class="flex">{0}{1}{2}<b class="tip">点击更换其他收货信息</b></span>'.format(ad.province, ad.city, ad.address));
                $('#address-submit-btn').show();
            }
            component.address.target = null;
        },
        change: function (e) {
            var id = $(e.currentTarget).attr('data-value');
            component.address.set(component.address.target, id);
        },
        add: function (e) {
            hash.set('#address-adding/province');
            return false;
        },
        submit: function (e) {
            e.currentTarget.classList.remove('validatedForm');
            if (e.currentTarget.checkValidity()) {
                var vs = $(e.currentTarget).serializeArray();
                if ($.isArray(vs) && vs.length > 0) {
                    var addid = new Date().getTime(), res = {
                        addid: addid,
                        custid: parent.activity.custid,
                        country: '中国',
                        province: component.address.adder.find('.province > .selected').text(),
                        city: component.address.adder.find('.city > .selected').text()
                    };
                    $.each(vs, function (i, v) {
                        res[v.name] = v.value;
                    });
                    component.address.values[addid] = res;
                    component.address.fill();
                    component.address.cancel();

                    setTimeout(function () {
                        if (component.address.target != null) {
                            component.address.set(component.address.target, addid);
                        } else {
                            component.address.container.find('.item.address-empty').each(function (i, el) {
                                component.address.set($(el), addid);
                            });
                        }
                    }, 500);
                }
            } else {
                e.currentTarget.classList.add('validatedForm');
            }
            return false;
        },
        back: function (e) {
            hash.set(e.currentTarget.value);
            return false;
        },
        cancel: function () {
            window.history.back();
            return false;
        },
        genOrder: function () {
            var items = component.address.container.find('.item'), emptyItems = items.filter('.address-empty');
            if (emptyItems.length > 0) {
                alert('请设置您的收货信息。');
            } else {
                var inx = 0, count = items.length;

                function _gen_success(d) {
                    if (d && d.data) {
                        var item = items[inx],
                            addid = item.dataset.value;

                        if (addid !== d.data) {
                            items.filter('[data-value="{0}"]'.format(addid)).attr('data-value', d.data);
                            component.address.values[d.data] = component.address.values[addid];
                            delete component.address.values[addid];
                        }
                        $(item).remove();

                        inx++;
                        _gen();
                    } else {
                        _gen_failed();
                    }
                }

                function _gen_failed() {
                    messager.error('<span class="big-icon lottery_none"></span>提交收货信息时发生了错误，您可以点击“确认收货信息”进行重试。<br />点击“确定”关闭消息。<button data-tag="messagerClose">确定</button>', '确认收货信息失败');
                    hash.enabled = true;
                    component.address.container.children('.command-buttons').show().prev('.s_loading').remove();
                }

                function _gen() {
                    if (inx < count) {
                        var item = items[inx],
                            type = item.dataset.type,
                            addid = item.dataset.value;

                        if (addid && component.address.values.hasOwnProperty(addid)) {
                            $.ajax({
                                url: '/qrcode/genorder',
                                method: 'post',
                                data: {
                                    qrcode: parent.activity.uuid,
                                    type: type,
                                    address: JSON.stringify(component.address.values[addid])
                                }
                            }).then(_gen_success, _gen_failed);
                        } else {
                            _gen_failed();
                        }
                    } else {
                        $('#address-panel').remove();
                        component.address.selector.remove();
                        component.address.adder.remove();
                        messager.success('已经成功创建订单，我们将在7个工作日内进行发货，请您关注我们的公众号，可以即时查看订单状态和物流信息。<button data-tag="checkPhone">确定</button>', '确认收货信息成功');
                    }
                }

                hash.enabled = false;
                component.address.container.children('.command-buttons').hide().before('<div class="s_loading"></div>');
                _gen();
            }
        }
    },
    phone: {
        container: null,
        init: function (callback) {

        },
        create: function (items) {

        }
    }
};

var hash = {
    enabled: true,
    setted: false,
    st: null,
    set: function (v) {
        try {
            if (hash.enabled === true) {
                if (hash.st != null) {
                    clearTimeout(hash.st);
                }
                if (hash.setted) {
                    window.history.back();
                }

                hash.st = setTimeout(function () {
                    window.location.hash = v;
                    hash.setted = true;
                }, 20);
            }
        } catch (e) {
        }
    }
};

var summaryNeedAddresses = {}, summaryNeedPhones = {};
// 分享获积分
function initShare(projectid, callback) {
    $.ajax({
        method: "POST",
        url: "/share/config",
        data: {
            projectid: projectid,
            update: true
        }
    }).then(function (resp) {
        if (resp && resp.data && resp.data.enable) {
            callback();
        }
    }).fail(function (jqXHR, type, msg) {
        console.error(msg);
    });
}

function navigation(e) {
    switch (typeof e === 'string' ? e : e.currentTarget.dataset.tag) {
        case 'cmc':
            messager.close();
            _body.removeAttr('style').addClass('cmc');
            var str1 = '', str2 = '', str = '';
            summaryNeedAddresses = {};
            summaryNeedPhones = {};
            if ($.isPlainObject(component.summary.got) && !$.isEmptyObject(component.summary.got)) {
                $.each(component.summary.got, function (k, r) {
                    var s = component.summary.get(k, r, true);
                    if (s != null && s !== '') {
                        if (_needAddressActivityTypes.indexOf(k) >= 0 && r.hasOwnProperty('state') && r.state === _needAddressState && r.mallproducttype === 'product') {
                            summaryNeedAddresses[k] = r;
                        }
                        if (_needPhoneActivityTypes.indexOf(k) >= 0 && r.hasOwnProperty('state') && r.state === _summaryNeedPhonestate && r.mallproducttype === 'cashcoupon') {
                            summaryNeedPhones[k] = r;
                        }
                        str1 += s;
                    }
                });
            }
            if ($.isPlainObject(component.summary.acquired) && !$.isEmptyObject(component.summary.acquired)) {
                $.each(component.summary.acquired, function (k, r) {
                    var s = component.summary.get(k, r, false);
                    if (s != null && s !== '') {
                        if (_needAddressActivityTypes.indexOf(k) >= 0 && r.hasOwnProperty('state') && r.state === _needAddressState && r.mallproducttype === 'product') {
                            summaryNeedAddresses[k] = r;
                        }
                        if (_needPhoneActivityTypes.indexOf(k) >= 0 && r.hasOwnProperty('state') && r.state === _summaryNeedPhonestate && r.mallproducttype === 'cashcoupon') {
                            summaryNeedPhones[k] = r;
                        }
                        str2 += s;
                    }
                });
            }
            if (str1 !== '' || str2 !== '') {
                if (str1 !== '') {
                    str = '<div class="summary box box-tb"><h1>以下是您参加本次活动获得的内容</h1>';
                    str += str1;
                }

                if (str2 !== '') {
                    if (str === '') {
                        str = '<div class="summary box box-tb"><h1>以下是您之前扫描该二维码获得的内容</h1>' + str2;
                    } else {
                        str += ('<em>以上内容是您本次扫码所获得的，下面是您之前扫描该二维码获得的</em>' + str2);
                    }
                }

                str += '</div>';
            }
            //window.localStorage.setItem('summary', str);
            _main.empty().append(str);
            if (!isPreview) {
                if (!$.isEmptyObject(summaryNeedAddresses)) {
                    component.address.create(summaryNeedAddresses);
                } else if (!$.isEmptyObject(summaryNeedPhones)) {
                    component.phone.create(summaryNeedPhones);
                }
            }
            _main.append('<img src="/templates/css/images/share.jpg" border="0" width="100%" />');

            // TODO 顶级跳转
            initShare(project.projectid, function () {
                var html = '<div class="share-container">'
                    + '<a class="share-link" href="/share/html/index.html?projectid='
                    + project.projectid
                    + '">分享活动获积分，前去分享></a>'
                    + '</div>';
                var summary = _main.find(".summary");
                if (summary.length == 1) {
                    summary.append(html);
                } else if (summary.length == 0) {
                    _main.prepend(html);
                }
            });

            top.document.title = '关注桑酒养性';
            //_main.remove();
            //top.window.location.href = '/templates/follow.html';
            break;
        case 'checkPhone':
            messager.close();
            if (!$.isEmptyObject(summaryNeedPhones)) {
                component.phone.create(summaryNeedPhones);
            }
            break;
        case 'messagerClose':
            messager.close();
            break;
    }
}

window.setup = function (pro, callback) {
    template = {
        backgroundColor: '#fbd9b3',
        backgroundImage: 'url(/templates/css/images/info_background.jpg)', //backgroundImage: '-webkit-linear-gradient(top, #dee3e7, #f1f2f6)',
        title: {
            enable: true,
            style: {
                fontSize: 48,
                padding: 20,
                textAlign: 'center',
                color: 'white',
                fontWeight: 'bold',
                textShadow: '3px 3px 0 rgba(0, 0, 0, .3)',
                transformOrigin: '50% 0%',
                transform: 'rotateY(-20deg)'
            }
        },
        description: {
            enable: true,
            legend: {
                enable: false,
                style: {
                    color: '#fe4a56',
                    borderRadius: 3,
                    backgroundColor: 'white',
                    boxShadow: '2px 2px 0 2px rgba(0, 0, 0, .1)',
                    fontSize: 16,
                    padding: '5px 10px'
                }
            },
            style: {
                border: 'none',
                color: '#495060',
                margin: '0 0 2rem 0',
                padding: '10px 20px'
            }
        },
        question: {
            style: {
                margin: '10px 20px',
                boxShadow: '0 0 10px rgba(0, 0, 0, .2)',
                borderRadius: 5
            },
            submit: {
                title: '参与活动',
                style: {
                    backgroundColor: '#fe4a56'
                }
            }
        },
        lottery: {
            style: {
                margin: '0 1rem 1rem 1rem'
            }
        }
    };
    project = pro;

    if (typeof pro.content === 'string' && pro.content != '') {
        try {
            pro.content = JSON.parse(pro.content);
        } catch (e) {
        }
    }

    if ($.isPlainObject(pro.content) && !$.isEmptyObject(pro.content)) {
        $.extend(true, template, pro.content);
    }

    _body = $(document.body).css({
        'backgroundColor': template.backgroundColor,
        'backgroundImage': template.backgroundImage,
        backgroundRepeat: 'repeat-y',
        backgroundSize: 'contain',
        backgroundPosition: 'top left'
    }).on('click', 'button[data-tag]', navigation);
    _main = $('#main');
    messager.init();

    if (template.title.enable) {
        //var title = $('<div id="title"></div>').css(template.title.style).text(pro.shortname);
        var title = '<img class=title src="/templates/css/images/info_header.jpg" style="width: 100%;"/>'
        _main.append(title);
    }

    if (template.description.enable) {
        var fieldset = $('<fieldset id="description"></fieldset>').css(template.description.style).html(pro.description.replace(/\n|\r/g, '<br />'));
        if (template.description.legend.enable) {
            var legend = $('<legend></legend>').css(template.description.legend.style).text(template.description.legend.title || '活动说明');
            fieldset.prepend(legend);
        }
        _main.append(fieldset);
    }

    if (isPreview) {
        component.question.install();
    }

    if ($.isFunction(callback)) {
        callback();
    }
};

window.check = function (d) {
    if (d === false) {
        navigation('cmc');
    } else if ($.isArray(d)) {
        if ($.isPlainObject(project) && !$.isEmptyObject(project)) {
            component.summary.total = d.length;
            component.summary.count = 0;
            var infos = {};
            $.each(d, function (_i, _d) {
                if ($.isPlainObject(_d)) {
                    infos[_d.name] = _d;
                }
            });

            $.each(_activitySteps, function (i, sn) {
                //循环步骤，检查是否有对应活动信息，如果有对应活动，才进行处理，否则跳过此步骤。
                if (infos.hasOwnProperty(sn) && project.directory.indexOf(',' + sn) >= 0) {
                    component.navigation(infos[sn]);
                }
            });
        } else {
            _checkData = d;
        }
    }
};

window.onhashchange = function () {
    try {
        var hashs = window.location.hash.split('/');
        component.address.selector.removeClass('opened');
        component.address.adder.removeClass('opened');
        switch (hashs[0]) {
            case '#address-selecting':
                component.address.selector.addClass('opened');
                break;
            case '#address-adding':
                component.address.adder.addClass('opened');
                if (hashs.length > 1) {
                    if (hashs[1] !== 'other') {
                        component.address.loadCities(hashs[1], hashs.length > 2 ? hashs[2] : '0');
                    }
                    component.address.openAdder(hashs[1]);
                }
                break;
            default:
                hash.setted = false;
                break;
        }
    } catch (e) {
        alert(e.message);
    }
};