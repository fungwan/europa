/**
 * Created by san on 2015/11/26.
 */

define(function () {
    var module = {}, loaded = false, key = null;
    reSendBtn = $("button.send"), toMailBtn = $("button.go"),
        msg = $("#message"), reTimes = 0, timer_si = null, smc = $("#sendMailCmds");

    /**
     * 重新提出申请
     */
    function resendMail() {
        var res = $(document.body).serializeForm();
        if (res.hasError) {
            msg.notice(false, res.result);
        } else {
            $(document.body).action({
                url: "findpwd",
                data: res.result
            }, {
                enable: false,
                message: "正在发送邮件"
            }).then(resetTimer, confirmFail);
        }
    }


    /**
     * 检查申请
     * @param key
     */
    function confirmApply() {
        if (!!key) {
            toMailBtn.detach();
            reSendBtn.action({
                url: "findpwdconfirm",
                data: {"ukey": key}
            }, {
                enable: false,
                message: "正在验证信息"
            }, true).then(confirmSuccess, confirmFail);
        } else
            confirmFail();
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

    function confirmSuccess(d) {
        msg.notice("tip", "", 1);
        $("h1").text("重置您的密码");
        $("h3").html("请输入您的新密码，密码为6至20位，并且必须包含英文字母和数字。");
        $("#email").after('<div class="buttonGroup vButtonGroup">' +
            '<input type="password" name="password" maxlength="20" placeholder="请输入新的密码" data-lang-name="登录密码" required data-expression="checkPass" />' +
            '<input type="password" maxlength="20" placeholder="请再次输入密码" data-lang-name="确认密码" required data-expression="checkPassConfirm" />' +
            '</div>');
        $("#email").remove();
        reSendBtn.val("submit").text("保存密码");
        $(window).resize();
    }

    /**
     * 验证失败
     * @param err
     */
    function confirmFail(err) {
        var canRemail = false;
        if (err && err.code) {
            msg.notice(false, err.message, 0);
            switch (err.code) {
                case errorCodes.account.unlock:
                    smc.empty().append("<button value='go' class='send'>我知道了</button>");
                    break;
                case errorCodes.notexist:
                    msg.notice(false, "该账户还未注册，请重新输入正确账户或创建新账户！");
                    break;
                case errorCodes.account.disabled:
                    msg.notice(false, "该账户已被禁用，请联系我们的工作人员！");
                    break;
                default:
                    canRemail = true;
                    break;
            }
        } else {
            msg.notice("tip", "", 1);
            canRemail = true;
        }

        if (canRemail) {
            $("#email").attr("data-on", "true").show();
            $("#sendMailCmds").append(toMailBtn);
            checkTimer();
        }
    }

    /**
     * 重置密码
     */
    function resetPassword() {
        if (!!key) {
            $("#email").attr("data-on", "false");
            var res = $(document.body).serializeForm();
            if (res.hasError) {
                msg.notice(true, res.result);
            } else {
                reSendBtn.action({
                    url: "updatepwdbykey",
                    data: $.extend(res.result, {ukey: key})
                }, {
                    enable: false,
                    message: "正在重置密码"
                }).then(resetPasswordSuccess);
            }
        }
    }

    function signIned() {
        window.location.href = "do.html";
    }

    function resetPasswordSuccess(d) {
        account.sign.listen("account-sign-in", signIned);
        account.sign.in();
    }

    function init() {
        if (!loaded) {

            key = window.location.href.getParameter("ukey");
            if (key) {
                $("#email").hide();
                confirmApply();
            } else {
                $(document.body).parseData({
                    useraccount: window.location.href.getParameter("mail") || ""
                });
                confirmFail();
            }

            $(document.body).on("click", "button", onButtonClicked);
            loaded = true;
            navigation.install("forgetpwd", "找回密码", "");
        }
    }

    function onButtonClicked(e) {
        switch ($(e.currentTarget).val()) {
            case "send":
                resendMail();
                break;
            case "tomail":
                var res = $(document.body).serializeForm();
                if (!res.hasError) {
                    var _mail = res.result.useraccount.split("@");
                    if (_mail.length == 2)
                        window.open(mail.query(_mail[1]), "_blank");
                }
                break;
            case "go":
                top.enterprise.uninstallMenu("confirm");
                break;
            case "submit":
                resetPassword();
                break;
        }
    }


    /**
     * 检测计时器
     */
    function checkTimer() {
        var pmsd = moment(parseInt(window.localStorage.getItem("pms-date"), 10)), nd = moment();
        reTimes = Math.ceil(nd.diff(pmsd) / 1000);
        timer();
    }

    /**
     * 重启计时器
     * @param d
     */
    function resetTimer(d) {
        msg.notice(true, "邮件发送成功，请查收！");
        window.localStorage.setItem("pms-date", moment().valueOf());
        reTimes = 0;
        timer();
    }

    /**
     * 开始计时
     */
    function timer() {
        if (reSendBtn) {
            clearTimeout(timer_si);
            if (reTimes < 60) {
                reSendBtn.text("{0}秒后可以重新发送邮件".format(60 - reTimes)).prop("disabled", true);
                reTimes++;
                timer_si = setTimeout(timer, 1000);
            } else
                reSendBtn.text("发送邮件").prop("disabled", false);
        }
    }

    module.init = init;
    return module;
});