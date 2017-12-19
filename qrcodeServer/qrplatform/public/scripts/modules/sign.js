/**
 * Created by Yatagaras on 2016/1/1.
 */

define(function () {
    if (top === self)
        window.location.href = "do.html";

    function onButtonClicked(e) {
        switch ($(e.currentTarget).attr("value")) {
            case "up":
                sign.up.open();
                break;
            case "in":
                sign.in.open();
                break;
            case "close":
                parent.window.account.sign.close();
                break;
            case "submit_in":
                sign.in.done(e);
                break;
            case "submit_up":
                sign.up.done(e);
                break;
            case "submit_reset":
                sign.reset.done(e);
                break;
            case "forgetpwd":
                parent.window.location.href = "forgetpwd.html";
                break;
        }
    }

    /**
     * 移动焦点到下一个控件
     * @param e
     */
    function focusNext(e) {
        var t = $(e.currentTarget);
        var n = t.next();
        while (n.length > 0 && !n.is("input") && !n.is("button")) {
            var _cn = getFormElement(n);
            if (!_cn)
                n = n.next();
            else
                n = _cn;
        }

        if (n.length > 0) {
            if (n.is("input"))
                n.focus();
            else if (n.is("button"))
                n.click();
        }
    }

    function getFormElement(dom) {
        var fe = null;
        dom.children().each(function (i, dom) {
            var el = $(dom);
            if (el.is("input") || el.is("button")) {
                fe = el;
                return false;
            } else
                fe = getFormElement(el);
        });
        return fe;
    }


    window.checkPass = function (v) {
        if (v.length > 5 && v.length <= 20) {
            if (!(/\d/ig.test(v) && /[a-z]/ig.test(v)))
                return "密码必须包含数字和字母";
        } else
            return "密码长度必须为6-20位";
    };

    window.checkPassConfirm = function (v, source) {
        var fp = source.prev().val();
        if (fp != v)
            return "两次输入的密码不同, 请重新输入";
    };


    window.sign = {
        "in": {
            "open": function (message) {
                document.body.classList.remove("up");
                document.body.classList.remove("reset");
                document.body.classList.add("in");
                $("#login-panel").clearError().find(".message").text(message || "");
                var _account = window.localStorage.getItem("account-cache");
                if (_account) {
                    $("#login-panel input[type=email]").val(_account);
                }
                $("#login-panel input:password").val("");
                parent.window.account.sign.open();
            },
            "done": function (e) {
                var t = $(e.currentTarget);
                res = $("#login-panel").serializeForm();
                if (res.hasError) {
                    $("#login-msg").notice(false, res.result);
                } else {
                    t.action({
                        url: "login",
                        data: res.result
                    }, false).then(sign.in.success, sign.in.fail);
                }
            },
            "success": function (d) {
                parent.window.account.sign.close();
                parent.window.account.init();
            },
            "fail": function (a) {
                var msg = "";
                switch (a.code) {
                    case errorCodes.account.locked:
                        msg = "帐号已经被锁定，请通过找回密码解锁";
                        break;
                    case errorCodes.account.disabled:
                        msg = "帐号已经被停用，请与我们联系";
                        break;
                    case errorCodes.refuse:
                        msg = a.message;
                        break;
                    default:
                        msg = "用户名或密码错误，请重新输入";
                        break;
                }
                $("#login-msg").notice(false, msg, 0);
            }
        },
        "up": {
            "open": function () {
                document.body.classList.remove("in");
                document.body.classList.remove("reset");
                document.body.classList.add("up");
                $("#reg-panel").clearData();
                parent.window.account.sign.open();
            },
            done: function (e) {
                var t = $(e.currentTarget);
                res = $("#reg-panel").serializeForm();
                if (res.hasError) {
                    $("#reg-msg").notice(false, res.result, 0);
                } else {
                    t.action({
                        url: "register",
                        data: res.result
                    }, false).then(sign.up.success, sign.up.error);
                }
            },
            "success": function (d) {
                if (d && d.data && d.data.useraccount) {
                    localStorage.setItem("pms-date", moment().valueOf());
                    localStorage.setItem("pms-suffix", d.data.useraccount.split("@")[1]);
                    parent.window.account.sign.close();
                    parent.window.account.init();
                    parent.window.location.href = "do.html";
                } else
                    sign.up.error();
            },
            "error": function (err) {
                $("#reg-msg").notice(false, err.message, 0);
            }
        },
        "reset": {
            "open": function () {
                document.body.classList.remove("in");
                document.body.classList.remove("up");
                document.body.classList.add("reset");
                $("#reset-panel").clearData();
                parent.window.account.sign.open();
            },
            done: function (e) {
                var t = $(e.currentTarget);
                res = $("#reset-panel").serializeForm();
                if (res.hasError) {
                    $("#reset-msg").notice(false, res.result, 0);
                } else if (res.result.userpwd === res.result.usernewpwd) {
                    $("#reset-msg").notice(false, "新密码不能与旧密码相同，请重新输入新密码。", 0);
                } else {
                    t.action({
                        url: "updatepwd",
                        data: res.result
                    }, false).then(sign.reset.success, sign.reset.error);
                }
            },
            "success": function (d) {
                if (d && d.data) {
                    $("#reset-panel-close").remove();
                    var msg = '密码修改成功，您需要重新进行登录，页面将在 {0} 秒后自动跳转至登录页面', time = 4, rm = $("#reset-panel .content").empty().text("正在注销，请稍候...");

                    function timer() {
                        time--;
                        rm.text(msg.format(time));
                        if (time === 0)
                            top.window.location.href = config.host.resource + "enterprise/do.html";
                    }

                    $("#reset-panel").action("logout").then(function () {
                        setInterval(timer, 1000);
                    });

                } else
                    sign.reset.error();
            },
            "error": function (err) {
                var msg = err ? err.message : "";
                if (err && err.code) {
                    switch (err.code) {
                        case errorCodes.notexist:
                            msg = "当前登录密码不正确，请重新输入";
                            break;
                    }
                }
                $("#reset-msg").notice(false, msg, 0);
            }
        },
        "exist": {
            "done": function (e) {
                $("#regSubmit").action({
                    url: "checkregist",
                    data: {useraccount: $(e.currentTarget).val()}
                }, {
                    enable: false,
                    message: "正在检测用户名"
                }, true).then(sign.exist.success, sign.exist.fail);
            },
            "success": function (d) {
                $("#regSubmit").prop("disabled", false);
            },
            "fail": function (err) {
                if (err.code === errorCodes.exists) {
                    $("#regAccount").setError("该邮箱已经被使用了，请选择其它邮箱");
                    $("#regSubmit").prop("disabled", true);
                }
            }
        }
    };

    function mailChanged() {
        $("#login-panel input, #reg-panel input, #reset-panel input").unenter().enter(focusNext);
    }

    function init() {
        $("input[type=email]").focus(mail.clearState).keyup(mail.update);
        $("input[type!=email]").focus(popup.close);
        $("#regAccount").blur(sign.exist.done);
        $(document.body).on("click", "button, a", onButtonClicked);
        $("#login-panel input, #reg-panel input, #reset-panel input").unenter().enter(focusNext);
        mail.updated = mailChanged;

        var action = localStorage.getItem("-account-action");
        if (action) sign[action].open();
        localStorage.removeItem("-account-action");
    }

    return {
        "init": init
    };
});