/**
 * Created by san on 2015/11/26.
 */
define(function () {
    var module = {}, loaded = false,
        reSendBtn = $("button.send"), toMailBtn = $("button.go"),
        reTimes = 0, timer_si = null, msg = $("#message");

    function onButtonClicked(e) {
        switch ($(e.currentTarget).val()) {
            case "send":
                if (window.localStorage.getItem("account"))
                    resendMail();
                else
                    top.enterprise.login("激活帐号需要您先进行登录", resendMail);
                break;
            case "tomail":
                var _mail = (window.localStorage.getItem("account") || "").split("@");
                if (_mail.length == 2)
                    window.open(top.enterprise.mail.query(_mail[1]), "_blank");
                break;
            case "go":
                top.enterprise.uninstallMenu("confirm");
                break;
        }
        return false;
    }

    function resendMail() {
        msg.text("");
        reSendBtn.action("remail", false).then(resetTimer, confirmFail);
    }

    function activeAccount(key) {
        if (!!key) {
            toMailBtn.detach();
            reSendBtn.action({
                url: "confirm",
                data: {"ukey": key}
            }, {
                enable: false,
                message: "正在激活您的帐号"
            }).then(confirmSuccess, confirmFail);
        } else
            confirmFail();
    }

    function confirmSuccess(d) {
        msg.text("恭喜，您的帐号已经成功激活！");
        $("#sendMailCmds").empty().append("<button value='go' class='send'>我知道了</button>");
    }

    function confirmFail(err) {
        var canRemail = false;
        if (err && err.code) {
            msg.text(err.message);
            switch (err.code) {
                case top.errorCodes.account.confirmed:
                    $("#sendMailCmds").empty().append("<button value='go' class='send'>我知道了</button>");
                    break;
                default:
                    canRemail = true;
                    break;
            }
        } else {
            msg.text("");
            canRemail = true;
        }

        if (canRemail) {
            $("#sendMailCmds").append(toMailBtn);
            checkTimer();
        }
    }

    function init() {
        if (!loaded) {
            top.enterprise.installMenu("confirm", "帐号激活", true);
            var key = window.location.href.getParameter("ukey");
            if (key) {
                activeAccount(key);
            } else
                confirmFail();

            $(document.body).on("click", "button", onButtonClicked);
            loaded = true;
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