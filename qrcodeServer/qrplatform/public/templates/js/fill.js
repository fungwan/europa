/**
 * Created by Yatagaras on 2015/11/17.
 */
var pageSetting = null, currentSetting = null, activityItems = null, currentLottery = null, currentStepName = null, container = null,
    colors = ["#111", "#222", "#333", "#444", "#555", "#666", "#777", "#888", "#999", "#aaa", "#bbb", "#ccc", "#ddd", "#eee", "#fff"];
var _emptyLotteryId = "00000000-0000-0000-0000-000000000000", _lotteryRecord = undefined, _phoneRecorded = false;
/**
 * 格式化字符串
 * @param args
 * @returns {String}
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
        }
        else {
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

/**
 * 清除区域中的数据
 * @returns {$}
 */
$.fn.clearData = function () {
    this.find("[name]").each(function (i, d) {
        var _t = $(this), _v = _t.attr("data-defaultvalue") || "";
        _t.html(_v);
    });
    return this;
};

/**
 * 绑定JSON数据到指定区域中
 * @param d
 * @returns {$}
 */
$.fn.parseData = function (d, path) {
    this.clearData();
    this.each(function (_i, _d) {
        var $t = $(this);
        if ($.type(d) == "object") {
            try {
                $.each(d, function (key, value) {
                    var tar = $t.find("[name='{0}{1}']".format(path || "", key));
                    if (tar.length > 0) {
                        if ($.type(value) == "object") {
                            tar.parseData(value, (path || "") + key + ".");
                        } else {
                            tar.val(value).html(value.replace(/\n|\r|\n\r|\r\n/g, "<br />"));
                        }
                    }
                });
            } catch (e) {
                core.throw(e.message);
            }
        }
    });
    return this;
};

/**
 * 填充设置内容
 * @param setting 设置内容
 * @param callback 回调
 */
function fill(setting, callback) {
    if (setting && $.isPlainObject(setting)) {
        currentSetting = $.extend(true, {}, _defaultSettings, setting);
        var el = $(document.body);
        el.removeAttr("style");
        //.parseData(currentSetting);

        //数据设置
        if (currentSetting && currentSetting.config && currentSetting.type in activityTypes) {
            var itemName = activityTypes[currentSetting.type].list;
            if (itemName && itemName in currentSetting.config)
                activityItems = currentSetting.config[itemName];
        }
        steps = activityTypes[currentSetting.type].steps;

        if (!currentSetting.shortname) currentSetting.shortname = "请在右侧输入标题";
        if (!currentSetting.description) currentSetting.description = "请在右侧输入活动说明";

        $.each(steps, function (i, s) {
            var _sbox = $(".page[data-step='{0}']".format(s));
            _sbox.parseData(currentSetting);
        });

        if (currentSetting.content)
            pageSetting = $.extend(true, {}, _defaultPageSetting, JSON.parse(currentSetting.content));
        else
            pageSetting = _defaultPageSetting;

        if (pageSetting.extend)
            applyExtendSetting(pageSetting.extend);
        /*
         //页面设置
         pageSetting = $.extend(true, {}, _defaultPageSetting, JSON.parse(currentSetting.content));
         if (pageSetting.backgroundColor) el.css("backgroundColor", pageSetting.backgroundColor);

         if (pageSetting.backgroundImage)
         el.css("backgroundImage", "url(" + pageSetting.backgroundImage + ")");
         else
         el.css("backgroundImage", "none");

         if (pageSetting.titleImage)
         $("#header").css("backgroundImage", "url(" + pageSetting.titleImage + ")");
         else
         $("#header").css("backgroundImage", "none");

         if (pageSetting.textColor) el.css("color", pageSetting.textColor);

         if (pageSetting.extend) applyExtendSetting(pageSetting.extend);*/

        if (isPreview || isPhonePreview) {
            $("#result-caption").text(resultSetting.caption[currentSetting.type]);
            $("#result-content").text(resultSetting.content[currentSetting.type]);
        }

        navigation();
        /*currentLotteryMode = ps.lotteryMode || "bigwheel";

         lotterys.set();*/

        if ($.type(callback) == "function") callback();
    }
}

/**
 * 导航
 * @param d
 */
function navigation(d) {
    if (currentSetting && (activityItems || d)) {
        if (d) activityItems = d.concat();
        if (currentSetting.type === activityTypes.redpacket.name && currentStepName == "lottery") {
            container = $("#lottery").removeAttr("style").removeAttr("class").empty();
            if (pageSetting.lotteryMode in _css)
                container.addClass(_css[pageSetting.lotteryMode]);

            switch (pageSetting.lotteryMode) {
                case "bigwheel":
                    bigWheel.create();
                    break;
                case "scratchcard":
                    scratchCard.create();
                    break;
                case "slotmachine":
                    slotMachine.create();
                    break;
            }
        } else if (currentSetting.type === activityTypes.question.name && currentStepName == "question") {
            container = $("#question").removeAttr("style").removeAttr("class").empty();
            question.create();
        }
    }
}


var lotterys = {
    /**
     * 获取奖项序号
     * @param d
     * @returns {*}
     */
    index: function (d) {
        var inx = null;
        if ($.isPlainObject(d)) {
            if (d.error) {
                fail(d.error);
                return;
            }
            _lotteryRecord = d.data;
            if (d.data) {
                $.each(activityItems, function (i, item) {
                    if (item.lotteryid === d.data.lotteryid) {
                        inx = i;
                        return false;
                    }
                });
            } else
                inx = activityItems.length - 1;
        } else if (!isNaN(d))
            inx = d;

        currentLottery = activityItems[inx];
        if (currentStepName !== "lottery") goStepByName("lottery");
        return inx;
    },
    /**
     * 当抽奖游戏结束时
     */
    stop: function () {
        if (isPreview || isPhonePreview) {
            _lotteryRecord = {state: lotteryStates.normal};
            bigWheel.playing = false;
        }

        if (_lotteryRecord && _lotteryRecord.state === lotteryStates.normal) {
            //如果中奖了，则设置信息采集页的内容
            var pu = $("#pickup");
            pu.parseData({
                content: activityTypes[currentSetting.type].contents.pickup.format(currentLottery.name, currentLottery.price.formatMoney()),
                phone: _lotteryRecord.phone || ""
            }).find(".title").html(activityTypes[currentSetting.type].captions.pickup.format(currentLottery.name))
                .find("button").html(activityTypes[currentSetting.type].buttons.pickup);

            var pt = pu.find(".info[name=phone]");
            pt.next().remove();
            $("#pick_checkcode").remove();
            $("#btn_sendmoney").prop("disabled", false);
            if (!_lotteryRecord.phone) {
                if (currentSetting.checktel === true) {
                    $("#btn_sendmoney").prop("disabled", true);
                    pt.after("<button class='info' value='sendCheckcode'>发送验证码</button>");
                    pt.parent().after("<input type='text' id='pick_checkcode' maxlength='4' class='info' placeholder='请输入收到的验证码' />");
                }
                $("#pickupMessage").hide();
            } else {
                pt.remove();
                $("#pickupMessage").remove();
                _phoneRecorded = true;
            }
        }

        switch (currentSetting.type) {
            case activityTypes.redpacket.name:
            case activityTypes.point.name:
                if (currentLottery.price <= 0) {
                    $("#result-caption").text(activityTypes[currentSetting.type].captions.result.none.format(currentLottery.name, currentLottery.price.formatMoney()));
                    $("#result-content").text(activityTypes[currentSetting.type].contents.result.none.format(currentLottery.name, currentLottery.price.formatMoney()));
                    goNext();
                } else if (currentLottery.price > 200) {
                    $("#result-caption").text(activityTypes[currentSetting.type].captions.result.top.format(currentLottery.name, currentLottery.price.formatMoney()));
                    $("#result-content").text(activityTypes[currentSetting.type].contents.result.top.format(currentLottery.name, currentLottery.price.formatMoney()));
                    goNext();
                } else {
                    $("#result-caption").text(activityTypes[currentSetting.type].captions.result.normal.format(currentLottery.name, currentLottery.price.formatMoney()));
                    $("#result-content").text(activityTypes[currentSetting.type].contents.result.normal.format(currentLottery.name, currentLottery.price.formatMoney()));
                    if (isPreview || isPhonePreview || _lotteryRecord.state === lotteryStates.normal)
                        setTimeout(function () {
                            document.body.classList.add("picking")
                        }, 500);
                    else
                        goNext();
                }
                break;
        }
    },
    /**
     * 当出奖项结果时
     * @param d
     * @param animate
     */
    result: function (d, animate) {
        if (currentSetting.type === activityTypes.redpacket.name) {
            switch (pageSetting.lotteryMode) {
                case "bigwheel":
                    bigWheel.result(d, animate);
                    break;
                case "scratchcard":
                    scratchCard.result(d, animate);
                    break;
                case "slotmachine":
                    slotMachine.result(d, animate);
                    break;
            }
        } else if (currentSetting.type === activityTypes.point.name)
            point.result(d, animate);
    }
};

/**
 * 大转盘
 * @type {{playing: boolean, playTime: null, create: Function, cal: Function, play: Function, result: Function}}
 */
var bigWheel = {
    /**
     * 是否正在游戏
     */
    playing: false,
    /**
     * 游戏开始时间
     */
    playTime: null,
    /**
     * 创建活动界面
     */
    create: function () {
        if (!activityItems) return;
        bigWheel.playing = false;
        var items = activityItems;

        if (currentSetting.percent < 1) {
            items.push({
                name: "谢谢参与",
                price: 0,
                lotteryid: _emptyLotteryId
            });
        }

        if (items.length < 6) items = items.concat(items);
        var size = Math.round($(window).width() * .9);
        var ul = $("<ul></ul>").css({
            position: "relative",
            width: size,
            height: size
        });
        container.addClass("bigwheel").append(ul);
        var degPer = 360 / items.length, startDeg = -degPer / 2 + 90, skewDeg = 90 - degPer;
        $.each(items, function (i, item) {
            var tdeg = startDeg + degPer * i, li = "<li style='transform: rotate({0}deg) skew({1}deg); -webkit-transform: rotate({0}deg) skew({1}deg); -moz-transform: rotate({0}deg) skew({1}deg); -ms-transform: rotate({0}deg) skew({1}deg);'></li><a href='#' style='transform: rotate({2}deg); -webkit-transform: rotate({2}deg); -moz-transform: rotate({2}deg); -ms-transform: rotate({2}deg);'>{3}</a>".format(tdeg, skewDeg, tdeg + degPer / 2, item.name);
            ul.append(li);
        });
        container.append($("<button value='bigwheel_play'></button>").css({
            width: size,
            height: size
        }));
    },
    /**
     * 根据要求计算抽奖指示信息
     */
    cal: function (lotteryIndex) {
        var toDeg = 0;
        if (lotteryIndex >= 0 && lotteryIndex < activityItems.length) {
            var num = activityItems.length, twice = false, laps = 8;
            if (num < 6) {
                twice = true;
                num *= 2;
            }

            if (bigWheel.playTime) {
                var times = new Date().getTime() - bigWheel.playTime, deged = times * 0.72;
                laps = Math.ceil(deged / 360) + 2;
                if (laps < 8) laps = 8;
            }

            var deg = 360 / num, shiftDeg = Math.round(deg * .2), startDeg = deg / 2,
                toDeg = (360 * laps) + deg * (activityItems.length - lotteryIndex) - (deg / 2) + (shiftDeg + Math.random() * (deg - shiftDeg * 2));

            if (twice) toDeg += (Math.random() > .5 ? 180 : 0);
        }
        return toDeg;
    },
    /**
     * 开始抽奖
     */
    play: function () {
        if (bigWheel.playing === true) return;
        _lotteryRecord = undefined;
        bigWheel.playing = true;
        if (isPreview === true || isPhonePreview === true) {
            bigWheel.playTime = null;
            container.children("ul").stop(true).css("rotate", 0);
            bigWheel.result(Math.floor(Math.random() * (activityItems.length)));
        } else {
            container.children("ul").stop(true).css("rotate", 0).transit({"rotate": 43200}, 60000, function (x, t, b, c, d) {
                return c * (t /= d) * t * t * t + b;
            });
            bigWheel.playTime = new Date().getTime();
            //请求接口产生实际的抽奖信息
            $.ajax({
                method: "post",
                url: "/qrcode/generate",
                timeout: 30000,
                data: {qrcode: parent.activity.uuid}
            }).then(bigWheel.result, fail);
        }
    },
    /**
     * 中将结果
     * @param d
     * @param animation
     */
    result: function (d, animation) {
        var inx = lotterys.index(d);

        var deg = bigWheel.cal(inx);
        if (animation !== false)
            container.children("ul").stop(true).transit({"rotate": deg}, 3000, lotterys.stop, function (x, t, b, c, d) {
                return -c * ((t = t / d - 1) * t * t * t - 1) + b;
            });
        else {
            container.children("ul").stop(true).css("rotate", deg);
            lotterys.stop();
        }
    }
};

/**
 * 刮刮卡
 * @type {{}}
 */
var scratchCard = {
    create: function () {
        if (!activityItems) return;
        var size = $(window).width();
        var sub = $("<div><span style='line-height: {1}px;'></span><img id='scratchCardRedux' width='{2}' height='{1}' src='css/images/{0}/redux.jpg' /></div>".format(currentSetting.templatename, size / 2, size)).css({
            position: "relative",
            width: size,
            height: size / 2
        });
        container.addClass("scratchcard").append(sub);
        if (isPreview === true || isPhonePreview === true)
            scratchCard.result(Math.floor(Math.random() * (activityItems.length)));
        else if (!currentLottery) {
            $.ajax({
                method: "post",
                url: "/qrcode/generate",
                data: {qrcode: parent.activity.uuid}
            }).then(scratchCard.result, fail);
        }
    },
    result: function (d, animation) {
        var inx = lotterys.index(d);
        if (!currentLottery) return;
        container.find("span").text(currentLottery.name);
        if (animation !== false) {
            $("#scratchCardRedux").eraser({
                completeRatio: .6,
                completeFunction: lotterys.stop
            });
        } else {
            $("#scratchCardRedux").remove();
            lotterys.stop();
        }
    }
};

var slotMachine = {
    playing: false,
    /**
     * 游戏开始时间
     */
    playTime: null,
    height: 0,
    amount: 0,
    index: 0,
    create: function () {
        if (!activityItems) return;
        slotMachine.playing = false;
        slotMachine.index = 0;
        var maxPrice = 0;
        $.each(activityItems, function (i, a) {
            var p = Number(a.price) || 0;
            if (p > maxPrice) maxPrice = p;
        });
        slotMachine.amount = String(maxPrice).length;
        if (slotMachine.amount < 3) slotMachine.amount = 3;

        var size = $(window).width(), innerSize = Math.round(size * .9);

        var box = $("<div class='box box-lr'></div>").css("width", innerSize);
        container.addClass("slotmachine box box-lr box-align-center box-pack-center").css("width", size).append(box);
        for (var i = 0; i < slotMachine.amount; i++) {
            box.prepend("<div class='flex'></div>");
        }
        slotMachine.height = box.children("div:first").outerWidth(true);
        box.css("width", slotMachine.height * slotMachine.amount).children("div").css({
            backgroundSize: slotMachine.height + "px " + (slotMachine.height * 10) + "px",
            width: slotMachine.height,
            height: slotMachine.height
        });

        container.append($("<button value='slotmachine_play'></button>"));
    },
    cal: function (lotteryIndex) {
        var degs = [];
        if (lotteryIndex >= 0 && lotteryIndex < activityItems.length) {
            var bw = "0000000000000000000000000000";
            var price = String(activityItems[lotteryIndex].price), lap = 4;

            if (price.length < slotMachine.amount) price = bw.substr(0, slotMachine.amount - price.length) + price;

            if (slotMachine.playTime) {
                var times = new Date().getTime() - slotMachine.playTime, py = times * (slotMachine.height / 100);
                lap = Math.ceil(py / (slotMachine.height * 10)) + 2;
                if (lap < 4) lap = 4;
            }

            for (var i = slotMachine.amount; i > 0; i--) {
                var _i = i - 1;
                var pinx = Number(price.substr(_i, 1)) || 0;
                degs[_i] = slotMachine.height * lap * 10 + (10 - pinx) * slotMachine.height;
            }
        }
        return degs;
    },
    play: function () {
        if (slotMachine.playing === true) return;
        _lotteryRecord = undefined;
        slotMachine.playing = true;
        if (isPreview === true || isPhonePreview === true) {
            slotMachine.playTime = null;
            container.children(".box").children("div").stop(true).css("backgroundPositionY", "0");
            slotMachine.result(Math.floor(Math.random() * (activityItems.length)));
        } else {
            //box.children("div")
            container.children(".box").children("div").each(function (i, dom) {
                $(dom).stop(true).css({
                    "backgroundPositionY": 0
                }).transit({
                    "backgroundPositionY": slotMachine.height * 300,
                    "delay": i * 200
                }, 30000, function (x, t, b, c, d) {
                    return c * (t /= d) * t * t * t + b;
                });
            });

            slotMachine.playTime = new Date().getTime();
            //请求接口产生实际的抽奖信息
            $.ajax({
                method: "post",
                url: "/qrcode/generate",
                data: {qrcode: parent.activity.uuid}
            }).then(slotMachine.result, fail);
        }
    },
    result: function (d, animation) {
        var inx = lotterys.index(d);

        function rec() {
            slotMachine.index++;
            if (slotMachine.index == slotMachine.amount)
                lotterys.stop();
        }

        var degs = slotMachine.cal(inx);
        if (animation !== false) {
            container.children(".box").children("div").each(function (i, dom) {
                $(dom).stop(true).transit({
                    "backgroundPositionY": degs[i],
                    delay: (slotMachine.amount - 1 - i) * 200
                }, 3000, rec, function (x, t, b, c, d) {
                    return -c * ((t = t / d - 1) * t * t * t - 1) + b;
                });
            });
        } else {
            container.children(".box").children("div").each(function (i, dom) {
                $(dom).stop(true).css("backgroundPositionY", degs[i]);
            });
            lotterys.stop();
        }
    }
};

/**
 * 问卷活动
 * @type {{}}
 */
var question = {
    /**
     * 创建问卷
     */
    create: function () {
        var ul = $("<ul></ul>");
        container.addClass("question").append(ul);
        $.each(activityItems, function (i, item) {
            var li = $("<li><p>{0}</p></li>".format(item.name)).data("d", item), answerBox = $("<div></div>");
            li.append(answerBox);
            switch (item.qatype) {
                case answerTypes.radio:
                    var as = item.answer.split(answerSeparator);
                    $.each(as, function (j, a) {
                        answerBox.append("<input name='{0}' type='radio' id='_{0}_{1}' value='{2}' {3} required /><label for='_{0}_{1}'>{2}</label>".format(item.qaid, j, a, j === 0 ? "checked" : ""));
                    });
                    break;
                case answerTypes.checkbox:
                    var as = item.answer.split(answerSeparator);
                    $.each(as, function (j, a) {
                        answerBox.append("<input name='{0}' type='checkbox' id='_{0}_{1}' value='{2}' required /><label for='_{0}_{1}'>{2}</label>".format(item.qaid, j, a));
                    });
                    break;
                case answerTypes.text:
                    answerBox.append("<input name='{0}' type='text' maxlength='100' placeholder='{1}' required />".format(item.qaid, item.answer || ""));
                    break;
            }
            ul.append(li);
        });
    },
    /**
     * 提交问卷
     */
    submit: function () {
        var sa = $("#question").serializeArray(), go = true;
        container.find("li").each(function (i, item) {
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
                    container.scrollTop(li.position().top);
                    return false;
                }
            }
        });
        if (go) {
            if (!isPreview && !isPhonePreview) {
                if (sa.length > 0) {
                    top.messager.open("正在保存问卷，请稍候");
                    $.ajax({
                        method: "post",
                        url: "/qrcode/qasave",
                        data: {qrcode: parent.activity.uuid, qa: JSON.stringify(sa)}
                    }).then(question.result(), fail);
                }
            } else
                question.result();
        }
    },
    /**
     * 提交结果
     */
    result: function (d) {
        if (d && d.error)
            fail(d.error);
        else {
            $("#result-caption").text(activityTypes.question.captions.result);
            $("#result-content").text(activityTypes.question.contents.result);
            goNext();
        }
    }
};

/**
 * 积分活动
 * @type {{}}
 */
var point = {
    /**
     * 领取积分
     */
    receive: function () {
        if (!isPreview && !isPhonePreview) {
            top.messager.open("正在领取积分，请稍候");
            $.ajax({
                method: "post",
                url: "/qrcode/generatepoint",
                data: {qrcode: parent.activity.uuid}
            }).then(point.result, fail);
        } else
            point.result();
    },
    /**
     * 领取结果
     */
    result: function (d) {
        if (d && d.error)
            fail(d.error);
        else {
            $("#result-caption").text(activityTypes.point.captions.result);
            $("#result-content").text(activityTypes.point.contents.result.format(d && d.data ? d.data.point : currentSetting.config.pointitems));
            goStepByName(activityTypes.point.steps[activityTypes.point.steps.length - 1]);
        }
    }
};


function goStep(step, synchronous) {
    if (isNaN(step)) step = 0;
    if (step >= 0 || step < steps.length) {
        if (isPreview && synchronous === true)
            parent.enterprise.solution.detail.goStep(step);
        var newStepName = steps[step];
        if (newStepName)
            goStepByName(newStepName);
    }
}

function goStepByName(stepName) {
    if (stepName !== currentStepName) {
        if (!isPreview && !isPhonePreview) top.messager.close();
        $(".page").removeClass("opened");
        $("[data-step='{0}']".format(stepName)).addClass("opened");
        currentStepName = stepName;
        navigation();
        document.body.classList.remove("picking");
        _windowSizeChanged();
    }
}

function goNext() {
    goStep(steps.indexOf(currentStepName) + 1, true);
}

function goPrev() {
    goStep(steps.indexOf(currentStepName) - 1, true);
}

/**
 * 当发生错误时
 * @param err
 */
function fail(err) {
    goStepByName("result");
    var title = '', content = '';
    if (err && err.code) {
        title = '非常抱歉';
        switch (err.code) {
            case errorCodes.used:
                if (currentSetting && currentSetting.type === activityTypes.question.name) {
                    title = activityTypes.question.captions.result;
                    content = activityTypes.question.contents.result;
                } else
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
                content = "该活动未启用或已停止，感谢您的参与！";
                break;
            case errorCodes.badcode:
                content = "格式未通过，感谢您的参与！";
                break;
            case errorCodes.limit:
                content = "已超过参与活动次数，感谢您的参与！";
                break;
            default:
                content = err.message || "发生未知错误，请重新扫描进行尝试！";
                break;
        }
    } else {
        content = "连接服务器失败，请重新扫描二维码进行尝试！";
    }

    if ($.isPlainObject(content))
        content = "发生未知错误，请重新扫描进行尝试！";

    $("#result-caption").text(title);
    $("#result-content").text(content);

    top.messager.close();
}

var send = {
    code: {
        time: 0,
        si: null,
        element: null,
        interval: function (times) {
            if (times) {
                if (send.code.si)
                    clearTimeout(send.code.si);
                send.code.time = times;
            }
            send.code.time--;
            if (send.code.time > 0) {
                send.code.element.prop("disabled", true).text(send.code.time + "秒后重发");
                send.code.si = setTimeout(send.code.interval, 1000);
            } else {
                send.code.element.prop("disabled", false).text("发送验证码");
            }
        },
        done: function (e) {
            if (send.code.time === 0) {
                var phone = getPhone();
                if (phone) {
                    send.code.element = $(e.currentTarget);
                    $("#btn_sendmoney").prop("disabled", false);
                    if (isPreview || isPhonePreview) {
                        $("#pick_checkcode").val("8888");
                    } else {
                        $.ajax({
                            method: "post",
                            url: "/sms/send",
                            data: {phone: phone}
                        });
                    }
                    send.code.interval(60);
                }
            }
        }
    },
    phone: function (phone, code, callback) {
        top.messager.open("正在验证信息，请稍候");
        $.ajax({
            method: "post",
            url: "/qrcode/updatephoneno",
            data: {
                phone: phone,
                projectid: currentSetting.projectid,
                code: code
            }
        }).then(callback, function (err) {
            top.messager.close();
            $("#pickupMessage").show().text("验证信息失败！");
        });
    },
    money: function (d) {
        if (!isPreview && !isPhonePreview) {
            if (d && d.error) {
                top.messager.close();
                $("#pickupMessage").show().text(d.error.code === "badsmscode" ? "验证码错误,请重新输入！" : "验证信息失败！");
            } else {
                top.messager.open("正在发送红包，请稍候");
                $.ajax({
                    method: "post",
                    url: "/qrcode/send",
                    data: {qrcode: parent.activity.uuid}
                }).then(goNext, fail);
            }
        } else {
            goNext();
        }
    }
};

function getPhone() {
    var re = /^0?(1[0-9]{2})[0-9]{8}$/ig,
        phone = $("#pickup .info[name=phone]").val();

    if (phone) {
        if (re.test(phone)) {
            return phone;
        } else {
            $("#pickupMessage").show().text("手机号码格式错误！");
        }
    } else {
        $("#pickupMessage").show().text("请填写您的手机号码！");
    }
    return null;
}

function onButtonClicked(e) {
    if (extendElementEditing) return false;
    var v = $(e.currentTarget).val();
    switch (v) {
        case "bigwheel_play":
            bigWheel.play();
            break;
        case "slotmachine_play":
            slotMachine.play();
            break;
        case "sendCheckcode":
            $("#pickupMessage").hide();
            send.code.done(e);
            break;
        case "sendMoney":
            $("#pickupMessage").hide();
            var phone = getPhone(), jx = true, code = null;
            //收集电话信息
            if (phone || _phoneRecorded) {
                if (currentSetting.checktel === true && !_phoneRecorded) {
                    code = $("#pick_checkcode").val();
                    if (!(/^\w{4}$/ig.test(code))) {
                        $("#pickupMessage").show().text("请输入您收到的验证码！");
                        jx = false;
                    }
                }
                if (jx) {
                    if (isPreview || isPhonePreview) {
                        goNext();
                    } else {
                        if (_phoneRecorded)
                            send.money();
                        else
                            send.phone(phone, code, send.money);
                    }
                }
            }
            break;
        case "sendAnswer":
            question.submit();
            break;
        case "sendPoint":
            point.receive();
            break;
        case "close":
            if (!isPreview && !isPhonePreview)
                top.wx.closeWindow();
            break;
        default:
            var step = Number(v);
            if (!isNaN(step)) {
                if (isPreview)
                    parent.enterprise.solution.detail.goStep(step);
                else
                    goStep(step);
            }
            break;
    }
}

var isPreview = false, isPhonePreview = false;
/*

 function getExtendSetting() {
 return extendSettings
 /!*var _setting = {};
 $(".resize[id][data-resizeable=true]").each(function (i, dom) {
 var t = $(dom), id = t.attr("id");
 if (id) {
 _setting[id] = {
 id: id,
 heightPercent: Math.round(t.height() / t.parent().height() * 1000) / 10
 };
 }
 });
 _setting = $.extend(true, {}, extendSettings, _setting);
 return _setting;*!/
 }
 */

var _currentResizeElement = null, _elementOrignalHeight = 0,
    _resizePageY, _minHeight = 0, _100Height, _maxHeight,
    _resizerExtendSetting = null, _resizing = false;
function onResizeListenerMouseDown(e) {
    var t = $(e.currentTarget), id = t.attr("id");
    if (id) {
        _elementOrignalHeight = t.outerHeight();
        if (e.offsetY >= _elementOrignalHeight - 10 && e.offsetY <= _elementOrignalHeight) {
            _resizing = true;
            _100Height = $(window).height();
            _minHeight = Math.ceil(_100Height / 5);
            _maxHeight = Math.floor(_100Height / 2);
            _currentResizeElement = t;
            _resizerExtendSetting = pageSetting.extend[id];
            _resizePageY = e.pageY;
            $(document.body).addClass("resizing").unbind("mousemove.resizeListener").bind("mousemove.resizeListener", onResizeElement);
            $(document.body).unbind("mouseup.resizeListener").bind("mouseup.resizeListener", removeResizeListener);
        }
    }
}

function onResizerMouseOver(e) {
    if (extendElementEditing || _resizing) return false;
    e.currentTarget.classList.add("resize");
    e.stopPropagation();
}

function onResizerMouseOut(e) {
    if (extendElementEditing || _resizing) return false;
    e.currentTarget.classList.remove("resize");
    e.stopPropagation();
}

function onEditorMouseOver(e) {
    if (extendElementEditing || _resizing) return false;
    e.currentTarget.classList.add("editable");
    e.stopPropagation();
}

function onEditorMouseOut(e) {
    if (extendElementEditing || _resizing) return false;
    e.currentTarget.classList.remove("editable");
    e.stopPropagation();
}

function onResizeElement(e) {
    if (_currentResizeElement) {
        var nh = _elementOrignalHeight + (e.pageY - _resizePageY);
        if (nh < _minHeight) nh = _minHeight;
        if (nh > _maxHeight) nh = _maxHeight;
        if (_resizerExtendSetting)
            _resizerExtendSetting.heightPercent = Math.round(nh / _100Height * 10000) / 100;
        _currentResizeElement.height(nh);
    }
}

function removeResizeListener() {
    _resizing = false;
    $(document.body).removeClass("resizing").unbind("mousemove.resizeListener");
}

var extendElementEditing = false, currentEditingExtendElement;

function editExtendElement(e) {
    var t = $(e.currentTarget), id = t.attr("id");
    if (extendElementEditing && id !== currentEditingExtendElement.attr("id")) {
    } else {
        if (pageSetting && pageSetting.extend && id) {
            if (t.hasClass("editing")) {
                cancelEditExtendElement();
            } else {
                var partSetting = {id: id};
                extendElementEditing = true;
                currentEditingExtendElement = t.addClass("editing");
                if (id in pageSetting.extend)
                    partSetting = pageSetting.extend[id];

                parent.editExtendElement(partSetting);
            }
        }
        e.stopPropagation();
    }
}

function cancelEditExtendElement(cancelParentEditing) {
    if (currentEditingExtendElement) {
        extendElementEditing = false;
        currentEditingExtendElement.removeClass("editing editable resize resizing");
        applyExtendSetting(pageSetting.extend);
        if (cancelParentEditing !== false)
            parent.cancelEditExtendElement(false);
    }
}

function applyExtendSetting(setting, apply) {
    if ($.isPlainObject(setting)) {
        if (apply === true)
            $.extend(true, pageSetting.extend, setting);

        $.each(setting, function (key, o) {
            var el = null;
            if (key === "body")
                el = $(document.body);
            else
                el = $("#" + key);

            if (el.length > 0) {
                $.each(o, function (k, v) {
                    switch (k) {
                        case "heightPercent":
                            el.css("height", v + "%");
                            break;
                        case "backgroundImage":
                            el.css("backgroundImage", v ? "url(" + v + ")" : "none");
                            break;
                        case "backgroundColor":
                            el.css("backgroundColor", v || "#ffffff");
                            break;
                        case "color":
                            el.css("color", v || "#ffffff");
                            break;
                    }
                });
            }
        });
    }
}

$(function () {
    isPreview = window.location.href.getParameter("isPreview") === "true";
    isPhonePreview = window.location.href.getParameter("isPhonePreview") === "true";
    if (isPreview === true) {
        var resizeables = $("[id][data-resizeable=true]"),
            editables = $("[id][data-editable=true]");
        resizeables.bind({
            "mouseover.resizer": onResizerMouseOver,
            "mouseout.resizer": onResizerMouseOut,
            "mousedown.resizeListener": onResizeListenerMouseDown
        });
        editables.bind({
            "mouseover.editor": onEditorMouseOver,
            "mouseout.editor": onEditorMouseOut,
            "dblclick.editor": editExtendElement
        });
    }
    /*if (isPreview === "true") {
     $(".resizeable").addClass("resize");
     } else if (isPhonePreview === "true") {
     /!*$.ajax({
     method: "POST",
     url: "/readconfig",
     success: function (d) {
     fill("home", JSON.parse(JSON.parse(d)));
     }
     });*!/
     }*/
    $(document.body).on("click", "button", onButtonClicked);
    $(window).resize(_windowSizeChanged);
    _windowSizeChanged();
});