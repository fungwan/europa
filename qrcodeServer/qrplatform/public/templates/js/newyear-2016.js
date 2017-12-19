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

// 大转盘
var bigWheel = (function () {
    var playing = false, playTime = null;

    var activityItems = [];

    var container = $("#lotteryContainer");

    var create = function () {
        if (!activityItems) return;
        playing = false;
        var items = activityItems;

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
            var tdeg = startDeg + degPer * i;
            var li = "<li style='transform: rotate({0}deg) skew({1}deg); -webkit-transform: rotate({0}deg) skew({1}deg); -moz-transform: rotate({0}deg) skew({1}deg); -ms-transform: rotate({0}deg) skew({1}deg);'></li><a href='#' style='transform: rotate({2}deg); -webkit-transform: rotate({2}deg); -moz-transform: rotate({2}deg); -ms-transform: rotate({2}deg);'>{3}</a>".format(tdeg, skewDeg, tdeg + degPer / 2, item.name);
            ul.append(li);
        });
        container.append($("<button value='bigWheel_play'></button>").css({
            width: size,
            height: size
        }));
    };

    var cal = function (lotteryIndex) {
        var toDeg = 0;
        if (lotteryIndex >= 0 && lotteryIndex < activityItems.length) {
            var num = activityItems.length, twice = false, laps = 8;
            if (num < 6) {
                twice = true;
                num *= 2;
            }

            if (playTime) {
                var times = new Date().getTime() - playTime,
                    deged = times * 0.72;
                    laps = Math.ceil(deged / 360) + 2;
                    if (laps < 8) laps = 8;
            }

            var deg = 360 / num, 
                shiftDeg = Math.round(deg * .2),
                startDeg = deg / 2,
                toDeg = (360 * laps) + deg * (activityItems.length - lotteryIndex) - (deg / 2) + (shiftDeg + Math.random() * (deg - shiftDeg * 2));

            if (twice) toDeg += (Math.random() > .5 ? 180 : 0);
        }
        return toDeg;
    };

    var play = function () {
        if (playing === true) return;
        playing = true;
        container.children("ul").stop(true).css("rotate", 0).transit({"rotate": 3600}, 20000, function (x, t, b, c, d) {
                playing = false;
                return c * (t /= d) * t * t * t + b;
            });
        // result(Math.floor(Math.random() * (activityItems.length)));
    };

    var result = function (index, animation, callback) {
        var deg = cal(index);
        if (animation !== false) {
           container.children("ul").stop(true)
           .transit({"rotate": deg}, 3000
                , function () {
                // 回调
                callback();
            });
        } else {
            container.children("ul").stop(true)
            .transit({"rotate": deg}, 3000
                , function () {}
                , function () {
                // 回调
                callback();
            });
        }
    };

    // 设置中奖项
    var setLottery = function (lotteryid, lotterytype, callback) {
        var index = -1;
        for (var i = 0; i < activityItems.length; i++) {
            var item = activityItems[i];
            // 如果lotterytype = thanks
            if (lotterytype == "thanks") {
                if (item.lotterytype && item.lotterytype == lotterytype) {
                    index = i;
                    break;
                }
            } else if (item.lotteryid == lotteryid) {
                index = i;
                break;
            }
        }
        result(index, true, callback);
    };

    return {
        setItems: function (items) {
            activityItems = items;
        },
        create: create,
        play: play,
        setLottery: setLottery
    };
}());

// 弹窗提示, 需要手动确认关闭
var messageModule = (function () {
    var _module = {};
    function showMessage () {
        $(document.body).addClass("message-picking");
    }
    function hideMessage (callback) {
        $(document.body).removeClass("message-picking");
        if (callback) {
            callback();
        }
    }
    // 弹窗提示信息
    _module.message = function (options) {
        var defaultOptions = {
            title: "消息提示",
            content: ""
        };
        options = $.extend({}, defaultOptions, options);
        $("#messagePickup .title").html(options.title);
        $("#messagePickup .content").html(options.content);
        showMessage();
        // 关闭事件
        $("#messagePickup .submit").off("click")
            .on("click", function () {
                hideMessage(options.callback);
            });
    };
    // 弹窗提示队列: 关闭一个窗口后弹窗另一个窗口
    _module.messageQueue = function (optionList) {
        var defaultOptions = {
            title: "消息提示",
            content: ""
        };
    };
    return _module;
}());

// 初始化模块
var baseModule = (function () {
    var _module = {};
    _module.show = function () {
        $("#base").addClass("opened");
    };
    _module.hide = function () {
        $("#base").removeClass("opened");
    };
    _module.setData = function (data) {
        $("#base .caption").text(data.shortname);
        $("#base .content").html(data.description.replace(/\n|\r|\n\r|\r\n/g, "<br />"));
    };
    _module.init = function () {
        $("#base button[value=next]").click(_module.next);
    };
    _module.next = function () {
        if (window.parent.baseinfo.data.checktel) {
            checktelModule.show();
        } else {
            giftModule.joinTheActivity();
        }
    };
    _module.init();
    return _module;
}());

// checktel 
var checktelModule = (function () {
    // 验证手机号
    function validatePhoneNum () {
        var phoneNum = $("#phoneNum").val();
        if (!(/^1[34578]\d{9}$/.test(phoneNum))) {
            $("#pickupMessage").text("请输入正确的手机号码");
            return false; 
        }
        $("#pickupMessage").text("");
        return true;
    }

    // 对验证码进行验证
    function validateCode () {
        var code = $("#phoneCode").val();
        if (!(/\d{4}/.test(code))) {
            $("#pickupMessage").text("请输入正确的验证码");
            return false; 
        }
        $("#pickupMessage").text("");
        return true;
    }

    // 获取验证码
    function initGetCode () {
        $("#sendCode").click(function () {
            if (!validatePhoneNum()) {
                return false;
            }
            $(this).prop("disabled", true);
            var countdown = 60;
            var countdownFun = function () {
                setTimeout(function () {
                    if (countdown > 0) {
                        $("#sendCode").text("{0}秒后重发".format(countdown));
                        countdown--;
                        countdownFun();
                    } else {
                        $("#sendCode").text("发送验证码".format(countdown));
                        $("#sendCode").prop("disabled", false);
                    }
                }, 1000);
            };
            $.ajax({
                method: "POST",
                url: "/sms/send",
                data: {
                    phone: $("#phoneNum").val()
                }
            }).then(function (resp) {
                countdownFun();
                if (!resp.data) {
                    window.parent.messager.open("验证码发送出错，请稍后扫码重试！");
                }
            }, function (error) {
                window.parent.messager.open("验证码发送出错，请稍后扫码重试！");
            });
        });
    }

    // 提交信息
    function initSubmitInfo () {
        $("#submitInfo").click(function () {
            if (!validatePhoneNum() || !validateCode()) {
                return false;
            }
            $.ajax({
                method: "POST",
                url: "/qrcode/updatephoneno",
                data: {
                    projectid: window.parent.baseinfo.data.projectid,
                    phone: $("#phoneNum").val(),
                    code: $("#phoneCode").val()
                }
            }).then(function (resp) {
                if (resp.data) {
                    _module.hide();
                    giftModule.joinTheActivity();
                } else {
                    window.parent.messager.open("手机号码验证出错，请稍后扫码重试！");
                }
            }, function (error) {
                window.parent.messager.open("手机号码验证出错，请稍后扫码重试！");
            });
        });
    }

    var _module = {};
    _module.show = function () {
        $(document.body).addClass("phone-picking");
        _module.init();
    };
    _module.hide = function () {
        $(document.body).removeClass("phone-picking");
    };
    _module.init = function () {
        initGetCode();
        initSubmitInfo();
    };
    return _module;
}());

// 积分赠送等
// 重构下
var giftModule = (function () {
    // 采用弹窗提示的方式提示用户
    var qrcode = window.parent.qrcode;
    var qrcodeinfo = window.parent.qrcodeinfo;
    // 队列
    var giftQueue = [];

    var giftItems = ["propoint", "prosale", "progift"];
    for (var i = 0; i < qrcodeinfo.data.length; i++) {
        var item = qrcodeinfo.data[i];
        if (!item.gen && giftItems.indexOf(item.name) != -1) {
            giftQueue.push(item.name);
        }
    }

    // 将progift移动到最后
    var index = giftQueue.indexOf("progift");
    if (index != -1) {
        giftQueue.splice(index, 1);
        giftQueue.push("progift");
    }

    // 请求活动: 积分赠送等
    function requestGift (name) {
        var dtd;
        if (name == "propoint") {
            dtd = $.Deferred();
            $.ajax({
                method: "POST",
                url: "/qrcode/generatepoint",
                data: {
                    qrcode: qrcode
                }
            }).then(function (resp) {
                if (!resp.data) {
                    window.parent.messager.open("获取积分出错，请稍后扫码重试！");
                    dtd.reject(new Error("获取积分出错"));
                } else {
                    dtd.resolve(resp);
                }
            }, function (error) {
                window.parent.messager.open("获取积分出错，请稍后扫码重试！");
                dtd.reject(error);
            });
        } else if (name == "progift") {
            dtd = $.Deferred();
            $.ajax({
                method: "POST",
                url: "/qrcode/gift",
                data: {
                    qrcode: qrcode
                }
            }).then(function (resp) {
                if (!resp.data) {
                    window.parent.messager.open("扫码即送出错，请稍后扫码重试！");
                    dtd.reject(new Error("扫码即送出错"));
                } else {
                    dtd.resolve(resp);
                }
            }, function (error) {
                window.parent.messager.open("扫码即送出错，请稍后扫码重试！");
                dtd.reject(error);
            });
        } else if (name == "prosale") {
            dtd = $.Deferred();
            $.ajax({
                method: "POST",
                url: "/qrcode/onsale",
                data: {
                    qrcode: qrcode
                }
            }).then(function (resp) {
                if (!resp.data) {
                    window.parent.messager.open("满减活动出错，请稍后扫码重试！");
                    dtd.reject(new Error("满减活动出错"));
                } else {
                    dtd.resolve(resp);
                }
            }, function (error) {
                window.parent.messager.open("满减活动出错，请稍后扫码重试！");
                dtd.reject(error);
            })
        }
        return dtd.promise();
    }

    function joinTheActivity (index) {
        var index = index || 0;
        var name = giftQueue[index];
        if (name) {
            requestGift(name).then(function (resp) {
                var title = "恭喜你", content,
                    callback = function () {
                        joinTheActivity(++index);
                    }
                if (name == "propoint") {
                    content = "获得活动赠送的"+ resp.data.point +"积分";
                } else if (name == "prosale") {
                    title = "满减信息";
                    if (resp.data && resp.data.price != undefined) {
                        content = "恭喜你，获得了 {0} 元的满减优惠红包。".format(resp.data.price);
                    } else if (resp.data && resp.data.code == "unfinished") {
                        content = "你已经扫码 {0} 次，再扫码 {1} 次，即可获得优惠。".format(resp.data.scaned, resp.data.total - resp.data.scaned);
                    }
                } else if (name == "progift") {
                    content = "获得活动赠送的总价值 {0} 元的 {1} * {2}".format(resp.data.price * resp.data.amount, resp.data.mallproductname, resp.data.amount);
                    if (resp.data.gifttype == "product") {
                        callback = function () {
                            baseModule.hide();
                            addressModule.show("progift", function () {
                                lotteryModule.show();
                            });
                        };
                    }
                }
                messageModule.message({
                    title: title,
                    content: content,
                    callback: callback
                });
            }, function (error) {

            });
        } else {
            // 进入抽奖环节
            baseModule.hide();
            lotteryModule.show();
        }
    }

    var _module = {};
    _module.joinTheActivity = joinTheActivity;
    return _module;
}());

var lotteryModule = (function () {
    var qrcode = window.parent.qrcode;
    var baseinfo = window.parent.baseinfo;
    var qrcodeinfo = window.parent.qrcodeinfo;

    var hasLottery = false;

    // 需判断是否开启抽奖和是否已抽奖
    function couldLottery () {
        var flag = false;
        for (var i = 0; i < qrcodeinfo.data.length; i++) {
            var item = qrcodeinfo.data[i];
            if (item.name == "prolottery" && item.gen == false) {
                flag = true;
                break;
            }
        }
        return flag;
    }

    // 获取奖项信息 
    function requestLottery () {
        var dtd = $.Deferred();
        $.ajax({
            method: "POST",
            url: "/project/lottery/get",
            data: {
                type: "prolottery",
                projectid: baseinfo.data.projectid
            }
        }).then(function (resp) {
            if (resp.data && resp.data.config && resp.data.config.lotteryitems) {
                resp.data.config.lotteryitems.push({
                    lotteryid: "",
                    lotterytype: "thanks",
                    name: "谢谢参与"
                });
                dtd.resolve(resp);
            } else {
                window.parent.messager.open("奖项加载失败，请稍后扫码重试!");
                dtd.reject(new Error("奖项加载失败"));          
            }
        }, function (error) {
            window.parent.messager.open("奖项加载失败，请稍后扫码重试!");
            dtd.reject(error);
        });
        return dtd.promise();
    };

    // 初始化大转盘
    function initBigWheel (lotteryItems) {
        bigWheel.setItems(lotteryItems);
        bigWheel.create();
        $("#lottery").on("click", "button[value=bigWheel_play]", function () {
            hasLottery = true;
            bigWheel.play();
            play().then(function (resp) {
                if (resp.data) {
                    // 选中奖品
                    var lotteryid = resp.data.lotteryid;
                    var lotterytype = resp.data.mallproducttype;
                    bigWheel.setLottery(lotteryid, lotterytype, function () {
                        var messageOptions = {
                            callback: function () {
                                _module.hide();
                                questionModule.show();
                            }
                        };
                        if (lotterytype == "thanks") {
                            messageOptions.title = "很遗憾";
                            messageOptions.content = "你没有抽中奖品, 请下次努力";
                        } else {
                            messageOptions.title = "恭喜你";
                            messageOptions.content = "抽中了总价值 {0} 元的 {1} * {2}".format(resp.data.amount * resp.data.price, resp.data.mallproductname, resp.data.amount);
                            if (lotterytype == "product") {
                                messageOptions.callback = function () {
                                    _module.hide();
                                    addressModule.show("progift", function () {
                                        questionModule.show();
                                    });
                                };
                            }
                        }
                        messageModule.message(messageOptions);
                    });
                } else {
                    window.parent.messager.open("抽奖出错，请稍后扫码重试！");
                }
            });
        });
    }; 

    // 抽奖
    function play () {
        var dtd = $.Deferred();
        $.ajax({
            method: "POST",
            url: "/qrcode/generate",
            data: {
                qrcode: qrcode
            }
        }).then(function (resp) {
            if (resp.data) {
                dtd.resolve(resp);
            } else {
                window.parent.messager.open("抽奖失败，请稍后扫码重试!");
                dtd.reject(new Error("抽奖失败"));
            }
        }, function (error) {
            window.parent.messager.open("抽奖失败，请稍后扫码重试!");
            dtd.reject(error);
        });
        return dtd.promise();
    };


    var _module = {};
    _module.show = function () {
        if (couldLottery()) {
             $("#lottery").addClass("opened");
            _module.init();
        } else {
            questionModule.show();
        }
    };
    _module.hide = function () {
        $("#lottery").removeClass("opened");
    };
    // 初始化
    _module.init = function () {
        requestLottery().then(function (resp) {
            initBigWheel(resp.data.config.lotteryitems);
        });
        $("#lottery button[value=next]").click(function () {
            if (!hasLottery) {
                // 提示还未抽奖
                return false;
            } else {
                _module.hide();
                questionModule.show();
            }
        });
    };

    return _module;
}());

var questionModule = (function () {
    var qrcode = window.parent.qrcode;
    var baseinfo = window.parent.baseinfo;
    var qrcodeinfo = window.parent.qrcodeinfo;

    // 需判断是否开启问卷调查和是否已提交答案
    function couldQuestion () {
        var flag = false;
        for (var i = 0; i < qrcodeinfo.data.length; i++) {
            var item = qrcodeinfo.data[i];
            if (item.name == "proquestion" && item.gen == false) {
                flag = true;
                break;
            }
        }
        return flag;
    }

    function requestQuestion () {
        var dtd = $.Deferred();
        $.ajax({
            method: "POST",
            url: "/project/lottery/get",
            data: {
                type: "proquestion",
                projectid: baseinfo.data.projectid
            }
        }).then(function (resp) {
            if (resp.data) {
                dtd.resolve(resp);
            } else {
                window.parent.messager.open("问卷加载失败，请稍后扫码重试!");
                dtd.reject(new Error("问卷加载失败"));            
            }
        }, function (error) {
            window.parent.messager.open("问卷加载失败，请稍后扫码重试!");
            dtd.reject(error);
        });
        return dtd.promise();
    }

    // 初始化问题
    function initQuestions (qaitems) {
        var contentHtml = "";
        // 遍历问题，生成html
        for (var i = 0; i < qaitems.length; i++) {
            var question = qaitems[i];
            contentHtml += "<li><p>" + question.name + "</p><div>";
            var answers = question.answer.split("|");
            if (question.qatype == "3") {
                // input
                contentHtml += "<input type='text' name='"+ question.qaid +"' placeholder='"+ question.answer +"' required>";
                continue;
            }
            for (var j = 0; j < answers.length; j++) {
                var answer = answers[j];
                if (question.qatype == "1") {
                    // singleSelect
                    contentHtml += "<input type='radio' name='{0}' id='_{0}_{1}' value='{2}' {3} required><label for='_{0}_{1}'>{2}</label>".format(question.qaid, j, answer, j === 0 ? "checked": "");
                } else if (question.qatype == "2") {
                    // multiSelect
                    contentHtml += "<input type='checkbox' name='{0}' id='_{0}_{1}' value='{2}' required><label for='_{0}_{1}'>{2}</label>".format(question.qaid, j, answer);
                }
            }
        }
        $("#question .content ul").html(contentHtml);
    }

    // 提交问卷
    function submitQuestion () {
        var sa = $("#questionForm").serializeArray();
        console.log(sa);
        if (sa.length > 0) {
            window.parent.messager.open("正在保存问卷，请稍后");
            $.ajax({
                method: "POST",
                url: "/qrcode/qasave",
                data: {
                    qrcode: qrcode,
                    qa: JSON.stringify(sa)
                }
            }).then(function (resp) {
                if (resp.data) {
                    window.parent.messager.close();
                    _module.hide();
                    finishModule.show();
                } else {
                    window.parent.messager.open("保存问卷失败，请稍后扫码重试!");                  
                }
            }, function (error) {
                window.parent.messager.open("保存问卷失败，请稍后扫码重试!");
            });
        }
    }

    var _module = {};
    _module.show = function () {
        if (couldQuestion()) {
            $("#question").addClass("opened");
            _module.init();
        } else {
            finishModule.show();
        }
        
    };
    _module.hide = function () {
        $("#question").removeClass("opened");
    };
    _module.init = function () {
        requestQuestion().then(function (resp) {
            var qaitems = resp.data.config.qaitems;
            initQuestions(qaitems);
            $("#question button[value=next]").click(submitQuestion);
        });
    };

    return _module;
}());

var finishModule = (function () {
    var _module = {};
    _module.show = function () {
        $("#finish").addClass("opened");
    };
    _module.hide = function () {
        $("#finish").removeClass("opened");
    }
    return _module;
}());

// 收获地址模块
var addressModule = (function () {
    var qrcode = window.parent.qrcode;
    var logininfo = window.parent.logininfo;

    var _type = null;
    var addressList = null;
    var defaultAddressId = null;
    var _callback = function () {};

    var _module = {};
    _module.show = function (type, callback) {
        $("#addressSelect").addClass("opened");
        _module.load();
        _module.init();

        _type = type;
        _callback = callback;
    };
    _module.hide = function () {
        $("#addressSelect").removeClass("opened");
    };
    _module.load = function () {
        $.ajax({
            method: "POST",
            url: "/shop/getAddressList",
            data: {
                custid: logininfo.data.custid
            }
        }).then(function (resp) {
            if (!resp.data) {
                window.parent.messager.open("收货地址加载失败，请稍后扫码重试!");
                return;
            }
            var content = "";
            addressList = resp.data.addressList;
            defaultAddressId = resp.data.defaultAddressId;

            for (var i = 0; i < addressList.length; i++) {
                var address = addressList[i];
                var fragment = "<li class='address-item'>"
                            + "<div class='contact-info'>"
                            + "<span class='contact-name'>{0}</span>"
                            + "<span class='contact-phone'>{1}</span>"
                            + "</div>"
                            + "<div class='address-info'>"
                            + "<span class='address'>{2}</span>"
                            + "</div>"
                            + "<div class='operation'>"
                            + "<div class='select'>"
                            + "<input type='radio' id='{3}' name='address' value='{3}' {4}>"
                            + "<label for={3}>选择该地址</label></div>"
                            + "<div class='action'>"
                            + "<span class='action-edit' data-value='{3}'>"
                            + "<i class='fa fa-pencil'></i>"
                            + "编辑</span>"
                            + "<span class='action-remove' data-value='{3}'>"
                            + "<i class='fa fa-trash'></i>"
                            + "删除</span>"
                            + "</div></div></li>";
                content += fragment.format(address.contact, address.phone, address.province + address.city + address.address, address.addid, address.addid == resp.data.defaultAddressId ? "checked": "");
            }
            $(".address-list").html(content);
        }, function (error) {
            window.parent.messager.open("收货地址加载失败，请稍后扫码重试!");
        });
    };
    _module.init = function () {
        // 提交订单
        $("#addressSelect button[value=submit]").click(function () {
            var selectedAddress;
            var selectedAddressId = $("input[name=address]:checked").val();
            for (var i = 0; i < addressList.length; i++) {
                var address = addressList[i];
                if (address.addid == selectedAddressId) {
                    selectedAddress = address;
                    break;
                }   
            }

            $.ajax({
                method: "POST",
                url: "/qrcode/genorder",
                data: {
                    qrcode: qrcode,
                    type: _type,
                    address: JSON.stringify(selectedAddress)
                }
            }).then(function (resp) {
                if (resp.data) {
                    _module.hide();
                    _callback();
                } else {
                    window.parent.messager.open("订单提交失败，请稍后扫码重试!");            
                }
            }, function (error) {
                window.parent.messager.open("订单提交失败，请稍后扫码重试!");
            });
        });
        // 删除地址
        $("#addressSelect .address-list").on("click", ".action-remove", function () {
            var addid = $(this).data("value");
            var custid = logininfo.data.custid;
            $.ajax({
                method: "POST",
                url: "/shop/delAddress",
                data: {
                    custid: custid,
                    address: addid
                }
            }).then(function (resp) {
                if (resp.data) {
                    _module.load();
                } else {
                    window.parent.messager.open("地址删除失败，请稍后扫码重试!");                
                }
            }, function (error) {
                window.parent.messager.open("地址删除失败，请稍后扫码重试!");
            });
        });
        // 编辑地址
        $("#addressSelect .address-list").on("click", ".action-edit", function () {
            var addid = $(this).data("value");
            var data = {};
            for (var i = 0; i < addressList.length; i++) {
                var address = addressList[i];
                if (address.addid == addid) {
                    data.addid = addid;
                    data.contact = address.contact;
                    data.phone = address.phone;
                    data.provinceCity = address.province + "/" + address.city;
                    data.address = address.address;
                    data.default = (defaultAddressId == addid);
                    break;
                }
            }
            addressEditModule.setData(data);
            addressEditModule.show();
        });
        // 新增地址
        $("#addressSelect button[value=add]").click(function () {
            addressEditModule.setData({});
            addressEditModule.show();
        });
    };
    return _module;
}());

// 收货地址编辑模块
var addressEditModule = (function () {
    // 切换到form
    function goForm () {
        $(".address-province,.address-city").css({
            display: "none"
        });
        $(".address-form").css({
            display: ""
        });
    }

    // 切换到省份
    function goProvince () {
        $(".address-form,.address-city").css({
            display: "none"
        });
        $(".address-province").css({
            display: ""
        });
    }

    // 切换到城市
    function goCity () {
        $(".address-form,.address-province").css({
            display: "none"
        });
        $(".address-city").css({
            display: ""
        });
    }

    var _module = {};
    _module.show = function () {
        $(".layer,.main").css({
            display: "none"
        });
        $(document.body).css({
            "background-color": "#FFF"
        });
        $(".address-content").css({
            display: "block"
        });
    };
    _module.hide = function () {
        $(".layer,.main").css({
            display: ''
        });
        $(document.body).css({
            "background-color": "rgb(188, 0, 0)"
        });
        $(".address-content").css({
            display: "none"
        });
    };
    _module.init = function () {
        // 加载省份信息
        $(".form-item.area-item").click(function () {
            $.ajax({
                method: "POST",
                url: "/cities/detail",
                data: {
                    keyword: 51
                }
            }).then(function (resp) {
                var provinces = resp.data && resp.data.province && (resp.data.province.list) || [];
                var contentHtml = "";

                for (var i = 0; i < provinces.length; i++) {
                    var province = provinces[i];
                    var fragment = "<li class='address-province-item' data-value='{0}'>"
                                + "<span>{1}</span>"
                                + "<i class='fa fa-angle-right'></i>"
                                + "</li>";
                    contentHtml += fragment.format(province.code, province.name);
                }
                $(".address-province-list").html(contentHtml);
                goProvince();
            });
        });
        // 选择省份:加载城市信息
        $(".address-province").on("click", ".address-province-item", function () {
            var parentCode = $(this).data("value");
            $.ajax({
                method: "POST",
                url: "/cities/query",
                data: {
                    parentCode: parentCode
                }
            }).then(function (resp) {
                var cities = resp.data || [];
                var contentHtml = "";

                for (var i = 0; i < cities.length; i++) {
                    var city = cities[i];
                    var fragment = "<li class='address-city-item' data-value='{0}' data-full='{1}'>"
                                + "<span>{2}</span>"
                                + "<i class='fa fa-angle-right'></i>"
                                + "</li>";
                    contentHtml += fragment.format(city.code, city.full, city.name);
                }
                $(".address-city-list").html(contentHtml);
                goCity();
            });
        });
        // 选择城市
        $(".address-city").on("click", ".address-city-item", function () {
            var full = $(this).data("full");
            $(".form-item.area-item .area-text").text(full);
            goForm();
        });
        // 取消
        $(".btn-form[value=cancel]").click(function () {
            _module.hide();
        });
        // 提交
        $(".btn-form[value=submit]").click(function () {
            var provinceCity = $(".area-text").text();
            var province = provinceCity.split("/")[0],
                city = provinceCity.split("/")[1];

            var address = {
                custid: window.parent.logininfo.data.custid,
                address: $("#address").val(),
                phone: $("#phone").val(),
                contact: $("#contact").val(),
                country: "中国",
                defaultAddressId: $("#default").prop("checked"),
                province: province,
                city: city
            };
            if ($("#addid").val() != "") {
                address.addid = $("#addid").val();
            }

            $.ajax({
                method: "POST",
                url: "/shop/updateAddress",
                data: {
                    address: JSON.stringify(address)
                }
            }).then(function (resp) {
                if (resp.data) {
                    _module.hide();
                    addressModule.load();
                } else {
                    window.parent.messager.open("地址保存失败，请稍后扫码重试!");       
                }
            }, function (error) {
                window.parent.messager.open("地址保存失败，请稍后扫码重试!");
            });
        });
    };
    _module.setData = function (data) {
        data = data || {};
        $("#addid").val(data.addid || "");
        $("#contact").val(data.contact || "");
        $("#phone").val(data.phone || "");
        $(".area-text").text(data.provinceCity || "");
        $("#address").val(data.address || "");
        $("#default").prop("checked", data.default || false);
    };
    // _module.show();
    _module.init();
    return _module;
}());

$(function () {
    baseModule.setData(window.parent.baseinfo.data);
});