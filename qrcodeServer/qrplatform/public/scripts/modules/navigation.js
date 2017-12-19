/**
 * Created by Yatagaras on 2015/12/30.
 */

/**
 * 用于生成导航
 */

define(function () {
    var _body = $(document.body), _nav = null, _account = null, _signFr = null, _footerHtml = null;

    var _url = window.location.href.split("/"), _pageName = _url[_url.length - 1].split(".")[0], toDirection = null;

    /**
     * 导航
     */
    var navigation = {
        /**
         * 菜单
         */
        "menus": {
            "home": {
                "caption": "首页",
                "url": "do.html"
            },
            "solution": null,
            "goodsmanage": null,
            "analysis": {
                "caption": "数据分析",
                "url": "analysis.html",
                "subMenu": [
                    {
                        "caption": "活动分析",
                        "url": "/app/#/analysis/activity"
                    },
                    {
                        "caption": "会员人数分析",
                        "url": "/app/#/analysis/member"
                    },
                    {
                        "caption": "订单分析",
                        "url": "/app/#/analysis/order"
                    },
                    {
                        "caption": "积分分析",
                        "url": "/app/#/analysis/point"
                    }
                ]
            }, "manage": {
                "caption": "消费者管理",
                "url": "managehome.html",
                "subMenu": [
                    {
                        "caption": "消费者分组管理",
                        "url": "/app/#/customer/group"
                    },
                    {
                        "caption": "消费者管理",
                        "url": "/app/#/customer/customer"
                    }
                ]
            }, "mallmanage": null,
            "managesalw": null,
            "sys": null,
            "account": null
        },
        "install": function (name, caption, url, subMenu) {
            if (_nav && name && _nav.children("li[data-module='{0}']".format(name)) == 0) {
                _nav.children().removeClass("selected");
                _nav.append('<li data-module="{0}" data-lang="{1}" class="{0} selected"></li>'.format(name, caption));
                core.language.install(_nav);
            }
        },
        /**
         * 初始化
         */
        "init": function () {
            var _headerHTML = $('<nav class="navbar">' +
                '<div class="navbar-header"></div>' +
                '<ul class="navbar-nav"></ul>' +
                '<div class="navbar-footer"></div>' +
                '</nav>');
            _body.prepend(_headerHTML);
            _nav = _headerHTML.find(".navbar-nav");
            _account = _headerHTML.find(".navbar-footer");
            console.log(navigation.menus)
            $.each(navigation.menus, function (key, n) {
                if (n) {
                    _nav.append('<li data-module="{0}" data-lang="{1}" class="{0}"></li>'.format(key, n.caption));
                    // if (n.subMenu){
                    //     for(var i=0;i<n.subMenu.length;i++){
                    //         $("#"+n).append(`<li><a href="${n.subMenu[i].url}">${n.subMenu[i].caption}</a><li>`)
                    //     }
                        
                    // }
                }


            });
            _headerHTML.on("click", "li", navigation.open).on("click", "button[value]", navigation.clicks);
            core.language.install(_nav);
            if (toDirection) {
                navigation.direction(toDirection);
                toDirection = null;
            }
        },
        /**
         * 打开页面
         */
        "open": function (e) {
            var t = $(e.currentTarget);
            v = t.attr("data-module");
            if (v && v in navigation.menus)
                window.location.href = navigation.menus[v].url;
        },
        /**
         * 指向到指定模块菜单
         * @param module
         */
        "direction": function (module) {
            if (_nav) {
                if (module && module in navigation.menus) {
                    _nav.children("li." + module).addClass("selected");
                }
            } else
                toDirection = module;
        },
        /**
         * 加入历史书签
         * @param data
         */
        "history": function (data, title, href) {
            if (history.pushState)
                history.pushState(data, title || document.title, href || location.href);
        },
        /**
         * 更改历史书签
         * @param data
         */
        "replace": function (data, title, href) {
            if (history.replaceState)
                history.replaceState(data, title || document.title, href || location.href);
        },
        /**
         * 点击事件
         */
        "clicks": function (e, o) {
            var v = o ? o.tag : $(e.currentTarget).val();
            switch (v) {
                case "in":
                    account.sign.in();
                    break;
                case "up":
                    account.sign.up();
                    break;
                case "confirm":
                    window.location.href = "confirm.html";
                    break;
                case "account":
                    window.location.href = "account.html";
                    break;
                case "exit":
                    $(document.body).action("logout").then(function () {
                        top.window.location.href = config.host.resource + "enterprise/do.html"
                    }, function (error) {
                        if (error.code == "unlogin") {
                            top.window.location.href = config.host.resource + "enterprise/do.html";
                        }
                    });
                    break;
                case "setPwd":
                    account.sign.reset();
                    break;
            }
        }
    };
    /**
     * 帐号相关， 包括登录、注册等
     */
    var account = {
        confirmed: false,
        updated: false,
        /**
         * 初始化帐号信息
         */
        "init": function () {
            $(document.body).action("checklogin", false).then(account.check.success, account.check.fail).always(account.check.completed);
        },
        /**
         * 检测帐号
         */
        "check": {
            "success": function (d) {
                if (d && d.data && d.data.useraccount) {
                    //TODO 权限管理
                    if (d.data.roleid == "admin") {
                        navigation.menus = {
                            "home": {
                                "caption": "首页",
                                "url": "do.html"
                            },
                            "solution": {
                                "caption": "营销方案",
                                "url": "solution.html"
                            },
                            "goodsmanage": {
                                "caption": "商品管理",
                                "url": "manage.mcdqr.html",
                                "subMenu": [
                                    {
                                        "caption": "商品分类管理",
                                        "url": "/app/#/commondity/category"
                                    },
                                    {
                                        "caption": "商品管理",
                                        "url": "/app/#/commondity/commondity"
                                    }
                                ]
                            },
                            "analysis": {
                                "caption": "数据分析",
                                "url": "analysis.html",
                                "subMenu": [
                                    {
                                        "caption": "活动分析",
                                        "url": "/app/#/analysis/activity"
                                    },
                                    {
                                        "caption": "会员人数分析",
                                        "url": "/app/#/analysis/member"
                                    },
                                    {
                                        "caption": "订单分析",
                                        "url": "/app/#/analysis/order"
                                    },
                                    {
                                        "caption": "积分分析",
                                        "url": "/app/#/analysis/point"
                                    }
                                ]
                            }, "manage": {
                                "caption": "消费者管理",
                                "url": "managehome.html",
                                "subMenu": [
                                    {
                                        "caption": "消费者分组管理",
                                        "url": "/app/#/customer/group"
                                    },
                                    {
                                        "caption": "消费者管理",
                                        "url": "/app/#/customer/customer"
                                    }
                                ]
                            }, "mallmanage": {
                                "caption": "商城管理",
                                "url": "/app/#/mall/manage",
                                "subMenu": [
                                    {
                                        "caption": "商品管理",
                                        "url": "/app/#/mall/manage/showproduct0"
                                    },
                                    {
                                        "caption": "订单管理",
                                        "url": "/app/#/mall/manage/showorder1"
                                    },
                                    {
                                        "caption": "评价管理",
                                        "url": "/app/#/mall/manage/showeva2"
                                    },
                                    {
                                        "caption": "礼券管理",
                                        "url": "/app/#/mall/manage/showqoupon3"
                                    },
                                    {
                                        "caption": "优惠券管理",
                                        "url": "/app/#/mall/manage/showCashCoupon4"
                                    },
                                    {
                                        "caption": "积分抽奖管理",
                                        "url": "/app/#/mall/manage/showlottery5"
                                    }
                                ]
                            }, "managesalw": {
                                "caption": "促销信息管理",
                                "url": "/app/#/sale/article",
                                "subMenu": [
                                    {
                                        "caption": "促销文章管理",
                                        "url": "/app/#/sale/article"
                                    },
                                    {
                                        "caption": "广告位管理",
                                        "url": "/app/#/sale/ad"
                                    }
                                ]
                            }, "sys": null
                        };
                    } else if (d.data.roleid == "erathink") {
                        navigation.menus = {
                            "home": {
                                "caption": "首页",
                                "url": "do.html"
                            },
                            "solution": {
                                "caption": "营销方案",
                                "url": "solution.html"
                            },
                            "goodsmanage": {
                                "caption": "商品管理",
                                "url": "manage.mcdqr.html",
                                "subMenu": [
                                    {
                                        "caption": "商品分类管理",
                                        "url": "/app/#/commondity/category"
                                    },
                                    {
                                        "caption": "商品管理",
                                        "url": "/app/#/commondity/commondity"
                                    }
                                ]
                            },
                            "analysis": {
                                "caption": "数据分析",
                                "url": "analysis.html",
                                "subMenu": [
                                    {
                                        "caption": "活动分析",
                                        "url": "/app/#/analysis/activity"
                                    },
                                    {
                                        "caption": "会员人数分析",
                                        "url": "/app/#/analysis/member"
                                    },
                                    {
                                        "caption": "订单分析",
                                        "url": "/app/#/analysis/order"
                                    },
                                    {
                                        "caption": "积分分析",
                                        "url": "/app/#/analysis/point"
                                    }
                                ]
                            }, "manage": {
                                "caption": "消费者管理",
                                "url": "managehome.html",
                                "subMenu": [
                                    {
                                        "caption": "消费者分组管理",
                                        "url": "/app/#/customer/group"
                                    },
                                    {
                                        "caption": "消费者管理",
                                        "url": "/app/#/customer/customer"
                                    }
                                ]
                            }, "mallmanage": {
                                "caption": "商城管理",
                                "url": "/app/#/mall/manage",
                                "subMenu": [
                                    {
                                        "caption": "商品管理",
                                        "url": "/app/#/mall/manage/showproduct0"
                                    },
                                    {
                                        "caption": "订单管理",
                                        "url": "/app/#/mall/manage/showorder1"
                                    },
                                    {
                                        "caption": "评价管理",
                                        "url": "/app/#/mall/manage/showeva2"
                                    },
                                    {
                                        "caption": "礼券管理",
                                        "url": "/app/#/mall/manage/showqoupon3"
                                    },
                                    {
                                        "caption": "优惠券管理",
                                        "url": "/app/#/mall/manage/showCashCoupon4"
                                    },
                                    {
                                        "caption": "积分抽奖管理",
                                        "url": "/app/#/mall/manage/showlottery5"
                                    }
                                ]
                            }, "managesalw": {
                                "caption": "促销信息管理",
                                "url": "/app/#/sale/article",
                                "subMenu": [
                                    {
                                        "caption": "促销文章管理",
                                        "url": "/app/#/sale/article"
                                    },
                                    {
                                        "caption": "广告位管理",
                                        "url": "/app/#/sale/ad"
                                    }
                                ]
                            }, "sys": {
                                "caption": "后台管理",
                                "url": "/app/#/sys/manage",
                                "subMenu": [
                                    {
                                        "caption": "用户管理",
                                        "url": "/app/#/sys/user"
                                    },
                                    {
                                        "caption": "财务管理",
                                        "url": "/app/#/sys/finance"
                                    },
                                    {
                                        "caption": "微信管理",
                                        "url": "/app/#/sys/wechat"
                                    },
                                    {
                                        "caption": "企业信息",
                                        "url": "/enterprise/account.html"
                                    }
                                ]
                            }
                        };
                    } else if (_pageName === "solution") {
                        window.location.href = "/404.html";
                    }
                    account.confirmed = d.data.confirmed;
                    account.updated = d.data.updateinfo;
                    window.localStorage.setItem("account-cache", d.data.useraccount);
                    if (!d.data.confirmed) {
                        if (_pageName != "confirm")
                            top.window.location = "confirm.html";
                    } else if (!d.data.updateinfo) {
                        if (_pageName != "account")
                            top.window.location = "account.html";
                    }

                    navigation.init();

                    account.sign.logged = true;
                    window.localStorage.setItem("account", d.data.useraccount);
                    window.localStorage.setItem("entid", d.data.entid);
                    var userBtn = $('<button class="wfico ico_user" id="account_mail"></button>');
                    if (!d.data.confirmed) {
                        userBtn.val("account").text(d.data.useraccount + " (未激活)");
                    } else {
                        userBtn.text(d.data.useraccount).attr({
                            "data-popup": "userMenus",
                            "data-type": "selector",
                            "data-popup-position": "fixed"
                        });

                        var userMenus = $("#userMenus");
                        if (userMenus.length == 0) {
                            userMenus = $("<div class='popup popupMenu dark-popupMenu' data-type='menu' id='userMenus'><button value='setPwd' class='ico_lock'>修改密码</button></div>");
                            userMenus.on("menuClick", navigation.clicks);
                            _body.append(userMenus);
                        }
                    }
                    // _account.empty().append(userBtn).append('<button value="event" class="wfico ico_mail">0</button>' +
                    //     '<button value="exit" class="wficoonly ico_exit"></button>');
                    _account.empty().append(userBtn).append('<button value="exit" class="wficoonly ico_exit"></button>');
                } else
                    account.check.fail();
            },
            "fail": function (err) {
                account.sign.logged = false;
                window.localStorage.removeItem("account");
                if ('forgetpwd'.indexOf(_pageName) < 0)
                    account.sign.in();
                /*_account.empty().append('<button value="in" class="btn_login" data-lang="登录"></button> <button value="up" class="btn_signup" data-lang="注册"></button>');
                 */
            },
            "completed": function () {
                core.language.install(_account);
                account.sign.trigger(window.localStorage.getItem("account"));
            }
        },
        /**
         * 登录与注册
         */
        "sign": {
            /**
             * 是否登录
             */
            logged: false,
            /**
             * 登录后执行回调
             */
            "events": {},
            /**
             * 检测窗口
             * @param action
             * @returns {boolean}
             */
            "check": function (action) {
                loader.open();
                if (!_signFr) {
                    _signFr = $('<iframe frameborder="0" src="{0}enterprise/sign.html" id="signFr"></iframe>'.format(config.host.resource));
                    _signFr.load(account.sign[action]);
                    _body.append(_signFr);
                    _signFr = _signFr.get(0);
                    return false;
                }
                return true;
            },
            /**
             * 登录
             */
            "in": function (message) {
                if (!account.sign.logged && account.sign.check("in")) {
                    if (_signFr.contentWindow.sign)
                        _signFr.contentWindow.sign.in.open(message);
                    else
                        localStorage.setItem("-account-action", "in");
                }
            },
            /**
             * 注册
             */
            "up": function () {
                if (!account.sign.logged && account.sign.check("up")) {
                    if (_signFr.contentWindow.sign)
                        _signFr.contentWindow.sign.up.open();
                    else
                        localStorage.setItem("-account-action", "up");
                }
            },
            /**
             * 重置密码
             */
            "reset": function () {
                if (account.sign.logged && account.sign.check("reset")) {
                    if (_signFr.contentWindow.sign)
                        _signFr.contentWindow.sign.reset.open();
                    else
                        localStorage.setItem("-account-action", "reset");
                }
            },
            /**
             * 打开窗口
             */
            "open": function () {
                loader.close();
                document.body.classList.add("signing");
            },
            /**
             * 关闭窗口
             */
            "close": function () {
                document.body.classList.remove("signing");
            },
            /**
             * 添加监听
             * @param key
             * @param fn
             */
            "listen": function (key, fn, checkLogged) {
                if (key && fn && $.type(key) === "string" && $.type(fn) === "function")
                    account.sign.events[key] = fn;
                if (checkLogged !== false && account.sign.logged)
                    fn(window.localStorage.getItem("account"));
            },
            /**
             * 移除监听
             * @param key
             */
            "removeListen": function (key) {
                if (key) {
                    if ($.type(key) === "string") key = [key];
                    if ($.type(key) === "array")
                        $.each(key, function (i, k) {
                            delete account.sign.events[k];
                        });
                }
            },
            /**
             * 执行回调
             * @param u
             */
            "trigger": function (u) {
                if (!u) return;
                $.each(account.sign.events, function (i, e) {
                    e(u);
                });
            }
        }
    };
    /**
     * 初始化foot的poweredby
     * @type {{init: Function}}
     */
    var footer = {
        "init": function () {
            _footerHtml = $('<div class="qr-footer">&copy;2015-2020 51s.co all rights reserved. Powered by ' +
                '<a href="http://www.erathink.com" target="_blank">Erathink Co.,Ltd.</a></div>');
            _body.append(_footerHtml);
            nav_windowSizeChange();
            $(window).resize(nav_windowSizeChange);
        }
    };

    /**
     * 分隔点
     * @type {{}}
     */
    var separation = {
        //初始化
        init: function () {
            if (!account.sign.logged) return false;
            separationSetting.elements = $("a[name='separation']");
            separationSetting.interval = setTimeout(separation.done, 2000);
            $(window).scroll(separation.stop);
        },
        //持续滚动至下个分隔点
        done: function () {
            $(window).unbind("scroll");
            if (separationSetting.interval) clearTimeout(separationSetting.interval);
            if (separationSetting.index < separationSetting.elements.length) {
                var offset = $(separationSetting.elements[separationSetting.index]).offset();
                $(document.body).stop(true).animate({ scrollTop: offset.top - _nav.outerHeight(true) }, 500, function () {
                    separationSetting.index++;
                    separationSetting.interval = setTimeout(separation.done, 2000);
                    $(window).scroll(separation.stop);
                });
            }
        },
        stop: function () {
            if (separationSetting.interval) clearTimeout(separationSetting.interval);
            $(document.body).stop(true);
        }
    }, separationSetting = {
        //分隔点集合
        elements: null,
        //当前分隔点序号
        index: 0,
        //Interval对象
        interval: null
    };

    function nav_windowSizeChange() {
        var scrollHeight = document.body.scrollHeight,
            clientHeight = document.body.clientHeight;
        console.log(scrollHeight + " : " + clientHeight);
        if (scrollHeight <= clientHeight) {
            _footerHtml.css({
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0
            });
        } else {
            _footerHtml.removeAttr("style");
        }
    }

    window.loader = {
        "open": function (message) {
            document.body.classList.add("loader");
        },
        "close": function () {
            document.body.classList.remove("loader");
        }
    };


    window.navigation = {
        "direction": navigation.direction,
        "history": navigation.history,
        "replace": navigation.replace,
        "install": navigation.install,
        "initFooter": footer.init
    };

    window.account = account;
    window.separation = separation;
    account.init();
});