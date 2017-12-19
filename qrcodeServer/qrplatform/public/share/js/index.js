var appid = config.wechat.appid;

// 负责大部分逻辑以及frame子页面跳转
// 挂载在window上的属性以$开头
String.prototype.getParameter = function (key) {
    var re = new RegExp(key + "=([^&]*)(?:&)?");
    return this.match(re) && this.match(re)[1];
};


var messager = {};
/* 
 * 显示消息
 * message : 消息内容
 * duration : 持续时间，为0时将不会消失，直到被其他message覆盖
 */
messager.message = function (message, duration) {
    clearTimeout(messager.timeout);
    var defaultDuration = 2000;
    duration = duration === 0 ? 0 : (duration || defaultDuration);
    $(".message").text(message).fadeIn();
    if (duration) {
        messager.timeout = setTimeout(function () {
            $(".message").fadeOut();
        }, duration);
    }
};

/*
 * 清除消息
 */
messager.clear = function () {
    $(".message").fadeOut();
};


// 判断是否已授权 如果已授权返回code
function isAuth () {
    var code = window.location.href.getParameter("code");
    if (!!code && wx) {
        return code;
    } else {
        return false;
    }
}

// 微信授权, 对于已授权的直接进行返回code
function auth () {
    if (!isAuth()) {
        var reuri = encodeURIComponent(window.location.href);
        window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + appid + "&redirect_uri=" + reuri + "&response_type=code&scope=snsapi_userinfo&state=frist#wechat_redirect";
    } else {
        return isAuth();
    }
}

// 初始化微信SDK - 返回promise
function initWxSDK (code) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: "/mobile/getsign",
            method: "POST",
            data: {
                url: window.location.href
            }
        }).then(function (resp) {
            if (!resp || !resp.data) {
                reject(new Error("INITWXSDKERROR"));
            }
            var config = $.extend(true, {
                debug: false,
                jsApiList: [
                    "getLocation", 
                    "closeWindow", 
                    "onMenuShareTimeline", 
                    "onMenuShareAppMessage",
                    "onMenuShareQQ",
                    "onMenuShareWeibo",
                    "onMenuShareQZone"
                ]
            }, resp.data);
            wx.config(config);
            resolve(resp.data);
        }).fail(function (jqXHR, type, msg) {
            reject(new Error(msg));
        });
    });
}

// 检查用户是否登录
function checkLogin () {
    return new Promise(function (resolve, reject) {
        $.ajax({
            method: "POST",
            url: "/mobile/checklogin"
        }).then(function (resp) {
            if (resp.error && resp.error.code == "unlogin") {
                var thisurl = window.location.href;
                window.sessionStorage.setItem('thisurl', thisurl);
                window.location.href = "/mall/mobile/html/login.html";
            } else {
                resolve(resp.data);
            }
        }).fail(function (jqXHR, type, msg) {
            reject(new Error(msg));
        })
    })
}

// 注册分享功能
function initShare (recordid) {
    var config = {
        title: "分享获积分",
        link: window.location.protocol + "//" + window.location.host + "/share/html/index.html?recordid=" + recordid,
        desc: "分享获积分",
        success: function () {
            messager.message("分享成功");
        }
    };
    wx.ready(function () {
        // 获取“分享到朋友圈”按钮点击状态及自定义分享内容接口
        wx.onMenuShareTimeline(config);
        // 获取“分享给朋友”按钮点击状态及自定义分享内容接口
        wx.onMenuShareAppMessage(config);
        // 获取“分享到QQ”按钮点击状态及自定义分享内容接口
        wx.onMenuShareQQ(config);
        // 获取“分享到腾讯微博”按钮点击状态及自定义分享内容接口
        wx.onMenuShareWeibo(config);
        // 获取“分享到QQ空间”按钮点击状态及自定义分享内容接口
        wx.onMenuShareQZone(config);
    });
}

function init () {
    var code = auth();

    return initWxSDK(code).then(function () {
        return checkLogin();
    });
}

function loadHelpConfig (recordid) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            method: "POST",
            url: "/share/config",
            data: {
                recordid: recordid
            }
        }).then(function (resp) {
            var error;
            if (!resp) {
                error = new Error("GETCONFIGERROR");
            } else if (resp.error) {
                error = new Error(resp.error.code);
            } else if (!resp.data.enable) {
                error = new Error("SHAREDISABLED");
            }

            if (error) { 
                reject(error); 
            } else {
                resolve(resp.data);
            }
        }).fail(function (jqXHR, type, msg) {
            reject(new Error(msg));
        });
    });
}

function loadHelp (recordid) {
    return loadHelpConfig(recordid).then(function (config) {
        window.$config = config;
        initShare(recordid);
        if (config.isSelf) {
            loadPage("SHARE");
        } else {
            loadPage("HELP");
        }
    });
}

function loadShareConfig (projectid) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            method: "POST",
            url: "/share/config",
            data: {
                projectid: projectid,
                generate: true // 将会创建分享
            }
        }).then(function (resp) {
            var error;
            if (!resp) {
                error = new Error("GETCONFIGERROR");
            } else if (resp.error) {
                error = new Error(resp.error.code);
            } else if (!resp.data.enable) {
                error = new Error("SHAREDISABLED");
            } 

            if (error) {
                reject(error);
            } else {
                resolve(resp.data);
            }
        }).fail(function (jqXHR, type, msg) {
            reject(new Error(msg));
        })
    });
}

function loadShare (projectid) {
    return loadShareConfig(projectid).then(function (config) {
        window.$config = config;
        initShare(config.recordid);
        loadPage("SHARE");
    });
}

function loadPage (type) {
    messager.clear();

    var src;
    if (type == "ERROR") {
        src = "error.html";
    } else if (type == "SHARE") {
        src = "share.html";
    } else if (type == "HELP") {
        src = "help.html";
    }
    $("#page").attr("src", src);
}

$(function () {
    messager.message("加载中...", 0);

    var recordid = window.location.href.getParameter("recordid"),
        projectid = window.location.href.getParameter("projectid");

    init().then(function (userinfo) {
        if (recordid) {
            return loadHelp(recordid);
        } else {
            return loadShare(projectid);
        }
    }).catch(function (error) {
        window.$error = error;
        loadPage("ERROR");
    });
});