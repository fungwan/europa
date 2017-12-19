window.APP = angular.module("APP", [
    "ngSanitize", 
    "ngRoute", 
    "infinite-scroll", 
    "ngAnimate", 
    "cp.ngConfirm", 
    "me-pageloading", 
    "ngFileUpload"
]);

window.APP.run([
    "$http",
    "$ngConfirmDefaults",
    "$location",
    "$rootScope",
    "CheckLoginService",
    "MessageService",
    function (
        $http,
        $ngConfirmDefaults,
        $location,
        $rootScope,
        CheckLoginService,
        MessageService) {
        $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";
        $ngConfirmDefaults.useBootstrap = false;
        // FIXME url权限控制 - 采用$location控制
        // 超级管理员 - erathink : 不做任何限制
        // admin系统管理员 : 限制后台管理
        var limitList = ["/sys/user"];
        var normallist = ["/sys/user", "/commondity/category", "/commondity/commondity", "/mall/manage", "/sale/article", "/commondity/ad", "/sys/finance"];
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            var user = $rootScope.user || {};
            if (user.roleid == "admin") {
                for (var i = 0; i < limitList.length; i++) {
                    if (next.originalPath == limitList[i]) {
                        event.preventDefault();
                        MessageService.error($rootScope, "你没有对应的权限进行访问！");
                        break;
                    }
                }
            } else if (user.roleid == "normal") {
                for (var i = 0; i < normallist.length; i++) {
                    if (next.originalPath == normallist[i]) {
                        event.preventDefault();
                        MessageService.error($rootScope, "你没有对应的权限进行访问！");
                        break;
                    }
                }
            }
        });
    }]);

window.APP.controller("navbarCtrl", [
    "$scope",
    "PostService",
    "CheckLoginService",
    "UtilService",
    "MessageService",
    function (
        $scope,
        PostService,
        CheckLoginService,
        UtilService,
        MessageService) {
        $scope.menuItems = [{
            title: "首页",
            isLink: false,
            href: "/enterprise/do.html"
        },
        {
            title: "数据分析",
            isLink: false,
            href: "/enterprise/analysis.html",
            subMenus: [{
                title: "活动分析",
                href: "/app/#/analysis/activity"
            },
            {
                title: "会员人数分析",
                href: "/app/#/analysis/member"
            },
            {
                title: "订单分析",
                href: "/app/#/analysis/order"
            },
            {
                title: "积分分析",
                href: "/app/#/analysis/point"
            }
            ]
        },
        {
            title: "消费者管理",
            isLink: false,
            href: "/enterprise/managehome.html",
            subMenus: [{
                title: "消费者分组管理",
                href: "/app/#/customer/group"
            },
            {
                title: "消费者管理",
                href: "/app/#/customer/customer"
            }
            ]
        }
        ];
        $scope.clickMenu = function (menu) {
            if (menu.isLink) {
                return;
            }
            if (menu.subMenus != undefined) {
                $scope.openedMenu == menu ? ($scope.openedMenu = null) : ($scope.openedMenu = menu);
            } else {
                $scope.selectedMenu = menu;
                $scope.selectedSubMenu = null;
            }
        };
        // 点击subMenu
        $scope.clickSubMenu = function ($event, subMenu, menu) {
            // 取消冒泡
            $event.stopPropagation();

            $scope.selectedMenu = menu;
            $scope.selectedSubMenu = subMenu;
        };
        CheckLoginService.userPromise.then(function (user) {
            // TODO 权限管理
            if (user.roleid == 'admin') {

                $scope.menuItems.splice(1, 0, {
                    title: "营销方案",
                    isLink: false,
                    href: "/enterprise/solution.html"
                }, {
                        title: "商品管理",
                        isLink: false,
                        href: "/enterprise/manage.mcdqr.html",
                        subMenus: [{
                            title: "商品分类管理",
                            href: "/app/#/commondity/category"
                        },
                        {
                            title: "商品管理",
                            href: "/app/#/commondity/commondity"
                        }
                        ]
                    });
                $scope.menuItems.splice(5, 0,
                    {
                        title: "商城管理",
                        isLink: false,
                        href: "/app/#/mall/manage",
                        subMenus: [{
                            title: "商品管理",
                            href: "/app/#/mall/manage/showproduct0"
                        },
                        {
                            title: "订单管理",
                            href: "/app/#/mall/manage/showorder1"
                        },
                        {
                            title: "评价管理",
                            href: "/app/#/mall/manage/showeva2"
                        },
                        {
                            title: "礼券管理",
                            href: "/app/#/mall/manage/showqoupon3"
                        },
                        {
                            title: "优惠券管理",
                            href: "/app/#/mall/manage/showCashCoupon4"
                        },
                        {
                            title: "积分抽奖管理",
                            href: "/app/#/mall/manage/showlottery5"
                        }
                        ]
                    }, {
                        title: "促销信息管理",
                        isLink: false,
                        href: "/app/#/sale/article",
                        subMenus: [{
                            title: "促销文章管理",
                            href: "/app/#/sale/article"
                        },
                        {
                            title: "广告位管理",
                            href: "/app/#/sale/ad"
                        }
                        ]
                    },
                    {
                        title: "企业信息",
                        isLink: false,
                        href: "/enterprise/account.html"
                    })
            } else if (user.roleid == 'erathink') {
                $scope.menuItems.splice(1, 0, {
                    title: "营销方案",
                    isLink: false,
                    href: "/enterprise/solution.html"
                }, {
                        title: "商品管理",
                        isLink: false,
                        href: "/enterprise/manage.mcdqr.html",
                        subMenus: [{
                            title: "商品分类管理",
                            href: "/app/#/commondity/category"
                        },
                        {
                            title: "商品管理",
                            href: "/app/#/commondity/commondity"
                        }
                        ]
                    });
                $scope.menuItems.splice(5, 0,
                    {
                        title: "商城管理",
                        isLink: false,
                        href: "/app/#/mall/manage",
                        subMenus: [{
                            title: "商品管理",
                            href: "/app/#/mall/manage/showproduct0"
                        },
                        {
                            title: "订单管理",
                            href: "/app/#/mall/manage/showorder1"
                        },
                        {
                            title: "评价管理",
                            href: "/app/#/mall/manage/showeva2"
                        },
                        {
                            title: "礼券管理",
                            href: "/app/#/mall/manage/showqoupon3"
                        },
                        {
                            title: "优惠券管理",
                            href: "/app/#/mall/manage/showCashCoupon4"
                        },
                        {
                            title: "积分抽奖管理",
                            href: "/app/#/mall/manage/showlottery5"
                        }]
                    }, {
                        title: "促销信息管理",
                        isLink: false,
                        href: "/app/#/sale/article",
                        subMenus: [{
                            title: "促销文章管理",
                            href: "/app/#/sale/article"
                        },
                        {
                            title: "广告位管理",
                            href: "/app/#/sale/ad"
                        }
                        ]
                    },
                    {
                        title: "后台管理",
                        isLink: false,
                        href: "/app/#/sys/manage",
                        subMenus: [{
                            title: "用户管理",
                            href: "/app/#/sys/user"
                        }, {
                            title: "财务管理",
                            href: "/app/#/sys/finance"
                        },
                        {
                            title: "微信管理",
                            href: "/app/#/sys/wechat"
                        },
                        {
                            title: "企业信息",
                            href: "/enterprise/account.html"
                        }
                        ]
                    })
            }
            $scope.user = user;
        });
        $scope.logout = function () {
            UtilService.startLoading();
            PostService.request("/logout").then(function (data) {
                window.location.href = "/";
            }).catch(function (error) {
                MessageService.error($scope, "登出失败，请稍后重试！");
            }).finally(function () {
                UtilService.stopLoading();
            });
        };
    }
]);

/*
 * 模糊查询字符串转义
 * 用于将包含%之类的字符串进行转义
 * 使其在进行模糊查询时可以被查询出来
 */
window.likeQueryEscape = function (input) {
    if (typeof input != "string") return "";

    // I don't know why doesn't it work!
    // Please don't change it!
    var output = input.replace(/\\/g, "\\\\")
        .replace(/_/g, "\\_")
        .replace(/%/g, "\\%");
    return output;
};