String.prototype.getParameter = function (key) {
    var re = new RegExp(key + '=([^&]*)(?:&)?');
    return this.match(re) && this.match(re)[1];
};

var messager = (function () {
    return {
        open: function (message) {
            if (!document.body.classList.contains("loading"))
                document.body.classList.add("loading");
            $(".messager-content").html(message);
        },
        close: function () {
            document.body.classList.remove("loading");
        }
    };
}());

var qrcode = null;
var baseinfo = {};
var qrcodeinfo = {};
var logininfo = {};

// 异常处理
function failMsg (msg) {
    messager.open(msg || "未知错误，请重试！");
}

var activityModule = (function () {
    var _code = "",
        geoRequired = false,
        geo = {};
    var _module = {};
    _module.get = function (qrid, code) {
        var dtd = $.Deferred();
        if (qrid && code) {
            _code = code;
            messager.open("正在获取活动信息, 请稍后");
            $.ajax({
                method: "POST",
                url: "/qrcode/baseinfo",
                data: {qrcode: qrid}
            }).then(function (resp) {
                baseinfo = resp;
                dtd.resolve(resp);
            }, function (error) {
                dtd.reject(error);
            });
        } else {
            dtd.reject(new Error("invalid arguments"));
        }
        return dtd.promise();
    };
    _module.login = function() {
        $.ajax({
            method: "POST",
            url: "/mobile/login",
            data: {
                code: _code,
                entid: "0",
                custtype: "1",
                lng: geo.longitude,
                lat: geo.latitude
            }
        }).then(function (resp) {
            logininfo = resp;
            _module.check().then(function (resp) {
                if (!resp.error) {
                    messager.close();
                    $("#fr").attr("src", "templates/new-newyear-2016.html");
                } else {
                    if (resp.error.code == "limit") {
                        failMsg("已经超出参与该活动的次数限制！");
                    } else {
                        failMsg("活动未开启或该二维码已经被其他用户使用！");
                    }
                }
            });
        }, function (error) {
            failMsg("登录失败，请稍后重试！");
        });
    };
    _module.signin = function () {
        messager.open("正在进行登录, 请稍后");
        geo.latitude = 0;
        geo.longitude = 0;
        geo.speed = 0;
        geo.accuracy = 0;

        wx.getLocation({
            type: "wgs84",
            success: function (resp) {
                geo.latitude = resp.latitude;
                geo.longitude = resp.longitude;
                geo.speed = resp.speed;
                geo.accuracy = resp.accuracy;
                _module.login();
            },
            fali: function () {
                failMsg("地理信息获取失败！");
            },
            cancel: function () {
                failMsg("取消获取地理信息！");
            }
        });
    };
    _module.check = function () {
        messager.open("正在检测二维码, 请稍后");
        var dtd = $.Deferred();
        $.ajax({
            method: "POST",
            url: "/qrcode/checkqrcode",
            data: {
                qrcode: qrcode
            }
        }).then(function (resp) {
            qrcodeinfo = resp;
            dtd.resolve(resp);
        }, function (error) {
            failMsg("二维码信息获取失败，请稍后重试！");
            dtd.reject(error);
        });
        return dtd.promise();
    };
    // TODO 开始活动
    _module.done = function () {

    };
    return _module;
}());

var module = (function () {
    var _module = {};
    _module.initWxJDK = function (id, code) {
        $.ajax({
            url: "/mobile/getsign",
            method: "POST",
            data: {
                url: window.location.href
            }
        }).then(function (resp) {
            if (resp && resp.data) {
                wx.ready(function () {
                    activityModule.get(id, code).then(function (resp) {
                        activityModule.signin();
                    }, function (error) {
                        failMsg("获取活动信息失败！");
                        console.error("获取活动信息 error!");
                    });
                });
                wx.config($.extend(true, {
                    debug: false,
                    jsApiList: ["getLocation", "closeWindow"]
                }, resp.data));
            } else {
                console.error("initWxJDK error!");
            }
        }, function (error) {
            failMsg("微信SDK初始化失败！");
            console.error("initWxJDK error!");
        });
    };
    return _module;
}());

$(function () {
    var id = window.location.href.getParameter("id");
    if (id) {
        var re = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        if (re.test(id)) {
            var code = window.location.href.getParameter("code");
            if (!!code && wx) {
                qrcode = id;
                module.initWxJDK(id, code);
            } else {
                // 微信授权
                messager.open("需要微信授权, 将跳转至授权页面.");
                var reuri = encodeURIComponent(window.location.href);
                window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxaabcaab73e9592f6&redirect_uri=" + reuri + "&response_type=code&scope=snsapi_userinfo&state=frist#wechat_redirect";
            }
        } else {
            window.location.href = "templates/404.html";
        }
    } else {
        window.location.href = "templates/404.html";
    }
});