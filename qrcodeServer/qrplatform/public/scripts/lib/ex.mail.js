/**
 * Created by Yatagaras on 2016/1/1.
 */

define(function() {

    var ms = $("#mailSelector");

    /**
     * 邮箱操作类
     * @type {{host: *[], inputtedStr: string, cleatState: Function, update: Function}}
     */
    window.mail = {
        /**
         * 邮箱域名
         */
        host: [{
            suffix: "126.com",
            host: "http://www.126.com"
        }, {
            suffix: "163.com",
            host: "http://www.163.com"
        }, {
            suffix: "qq.com",
            host: "http://mail.qq.com"
        }, {
            suffix: "sina.com",
            host: "http://mail.sina.com"
        }, {
            suffix: "sohu.com",
            host: "http://mail.sohu.com"
        }, {
            suffix: "yahoo.com",
            host: "http://mail.yahoo.com"
        }, {
            suffix: "hotmail.com",
            host: "http://www.hotmail.com"
        }, {
            suffix: "msn.com",
            host: "http://mail.msn.com"
        }, {
            suffix: "erathink.com",
            host: "http://mail.erathink.com"
        }],
        /**
         * 当前已输入字符
         */
        inputtedStr: "",
        /**
         * 正在更改文本
         */
        changing: false,
        /**
         * 清除输入状态
         * @param e
         */
        clearState: function (e) {
            mail.inputtedStr = "";
        },
        /**
         * 当邮箱列表更新时触发
         */
        updated: null,
        /**
         * 更新邮箱列表
         * @param e
         */
        update: function (e) {
            if (!e.ctrlKey) {
                var t = $(e.currentTarget), v = t.val(), l = 0;
                popup.config.currentData = null;
                if (v != mail.inputtedStr) {
                    mail.inputtedStr = v;
                    if (v) {
                        var s = v.split("@");
                        ms.empty();
                        if ((s.length == 1 || (s.length == 2 && s[1] == "")) && s[0]) {
                            $.each(mail.host, function (i, m) {
                                ms.append("<button value='{0}'>{0}</button>".format(s[0] + "@" + m.suffix));
                                l++;
                            });
                        } else if (s.length == 2) {
                            $.each(mail.host, function (i, m) {
                                if (m.suffix.indexOf(s[1]) >= 0) {
                                    ms.append("<button value='{0}'>{0}</button>".format(s[0] + "@" + m.suffix));
                                    l++;
                                }
                            });
                        }
                    }

                    if (l > 0) {
                        popup.open({
                            source: t,
                            id: "mailSelector"
                        });
                        popup.updatePosition(e.view.core.pageOffset);
                        ms.children("button:first").addClass("selected");
                    } else
                        popup.close();

                    if ($.type(mail.updated) == "function") mail.updated();
                }
            }
        },
        /**
         * 检测帐号是否存在
         */
        checkExist: function (p, v) {
            p.find("button.submit").action({
                url: "checkregist",
                data: {useraccount: v}
            }, {
                enable: false,
                message: "正在检测用户名"
            }).then(null, mail.checkExistFail);
        },
        /**
         * 检测帐号是否存在失败
         */
        checkExistFail: function (err) {
            if (err.code === top.errorCodes.exists)
                $("#reg-panel input[name=useraccount]").setError("该邮箱已经被使用了，请选择其它邮箱");
        },
        /**
         * 查找指定后辍的邮箱信息
         * @param suffix
         */
        query: function (suffix) {
            var rv = "http://mail." + suffix;
            $.each(mail.host, function (i, h) {
                if (h.suffix === suffix) {
                    rv = h.host;
                    return false;
                }
            });
            return rv;
        }
    };
});