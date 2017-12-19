/**
 * Created by san on 2015/11/26.
 */

define(function () {
    var module = {}, loaded = false, key = null;
    reSendBtn = $("button.send"), toMailBtn = $("button.go"),
        msg = $("#message"), reTimes = 0, timer_si = null;

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
            }).then(confirmSuccess, confirmFail);
        } else
            confirmFail();
    }


    function confirmSuccess(d) {
        msg.notice("tip", "", 1);
        $("h1").text("重置您的密码");
        $("h3").html("请输入您的新密码，密码为6至20位，并且必须包含英文字母和数字。");
        $("#email").after('<div class="buttonGroup vButtonGroup">' +
            '<input type="password" name="password" maxlength="20" placeholder="请输入新的密码" data-lang-name="登录密码" data-required="true" data-expression="top.checkPass" />' +
            '<input type="password" maxlength="20" placeholder="请再次输入密码" data-lang-name="确认密码" data-required="true" data-expression="top.checkPassConfirm" />' +
            '</div>');
        reSendBtn.val("submit").text("保存密码");
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
                case top.errorCodes.account.unlock:
                    $("#sendMailCmds").empty().append("<button value='go' class='send'>我知道了</button>");
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

    function resetPasswordSuccess(d) {
        top.enterprise.login();
        top.enterprise.uninstallMenu("forgetpwd");
    }

    function init() {
        if (!loaded) {
            top.enterprise.installMenu("forgetpwd", "找回密码", true);

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
                        window.open(top.enterprise.mail.query(_mail[1]), "_blank");
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