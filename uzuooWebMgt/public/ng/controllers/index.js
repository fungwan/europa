'use strict';

angular.module('myApp').controller('IndexCtrl', ['$scope', '$location', '$rootScope','ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $rootScope.sideBarSelect = {
            firstClassSel: 'youzhu',
            secondSel: ''
        };
        $rootScope.qiniuUrl = "http://7xq9al.com2.z0.glb.qiniucdn.com/";
        $rootScope.defaultVerifiedImg = "images/avatar/defaultVerifiedImg.png";

        $scope.checkAll = function (attr) {
            var selectedAll = true;
            if (attr[0] && !attr[0].selected) {
                selectedAll = true;
            } else {
                selectedAll = false;
            }
            angular.forEach(attr, function (item) {
                item.selected = selectedAll;
            });
        }

        $scope.onShowModifyPwd = function () {
            $scope.passwordMgt = {
                oldPassword:'',
                newPassword:'',
                confirmPassword:'',
                errMsg:''
            }
        }

        $scope.onConfirmModifyPwd = function () {
            if ($scope.passwordMgt.newPassword !== '' && $scope.passwordMgt.newPassword === $scope.passwordMgt.confirmPassword) {
                var oldPassword = hex_md5($scope.passwordMgt.oldPassword);
                var password = hex_md5($scope.passwordMgt.newPassword);
                var obj = {
                    id:$rootScope.userInfo.id,
                    content:{
                        oldPW:oldPassword,
                        newPW:password
                    }
                }
                ApiService.post('/doUpdateUserPWById', obj, function (data) {
                    if (data.result == "success") {
                        $("#modify_account_pw_dlg").modal("hide");
                    } else {
                        $scope.passwordMgt.errMsg = "原密码填写错误！";
                    }
                }, function(errMsg) {
                    $scope.passwordMgt.errMsg = errMsg.message;
                });
            } else {
                $scope.passwordMgt.errMsg = "密码不能为空，并且密码必须一致！";
            }
        }


        //时间格式化
        $scope.timeToStr = function (timeStamp) {
            return getConvertTime(timeStamp);
        }

        function getConvertTime(timeStamp) {

            var myDate = new Date(timeStamp);
            var year = myDate.getFullYear();
            var month = parseInt(myDate.getMonth().toString()) + 1; //month是从0开始计数的，因此要 + 1
            if (month < 10) {
                month = "0" + month.toString();
            }
            var date = myDate.getDate();
            if (date < 10) {
                date = "0" + date.toString();
            }
            var hour = myDate.getHours();
            if (hour < 10) {
                hour = "0" + hour.toString();
            }
            var minute = myDate.getMinutes();
            if (minute < 10) {
                minute = "0" + minute.toString();
            }
            var second = myDate.getSeconds();
            if (second < 10) {
                second = "0" + second.toString();
            }

            var currentTime = year.toString() + "/" + month.toString() + "/" + date.toString() + " " + hour.toString() + ":" + minute.toString() + ":" + second.toString(); //以时间格式返回

            return currentTime;
        }
        
        //fix jequry 
        $scope.initPage = function () {
            //if ($rootScope.initPage == true) {
            $('#sidebar').css('min-height', '100%');
            $('#side-menu').metisMenu();
            $(window).on("load resize", function () {
                if ($(this).width() < 768) {
                    $('body').removeClass();
                    $('div.sidebar-collapse').addClass('collapse');
                } else {
                    $('body').addClass($.cookie('menu_style') + ' ' + $.cookie('header'));
                    $('div.sidebar-collapse').removeClass('collapse');
                    $('div.sidebar-collapse').css('height', 'auto');
                }

                if ($('#sidebar').height() > $('#page-wrapper').height()) {
                    $('#wrapper').css('height', $('#sidebar').height());
                }
            });



            //END CHECKBOX TABLE

          
            var flag;
            if ($('body').hasClass('sidebar-colors')) {
                flag = true;
            } else {
                flag = false;
            }
            $('#menu-toggle').toggle(
                function () {
                    if ($('#wrapper').hasClass('right-sidebar')) {
                        $('body').addClass('right-side-collapsed')
                        $('#sidebar .menu-scroll').css('overflow', 'initial');
                    } else {
                        if ($.cookie('menu_style')) {
                            $('body').addClass('sidebar-collapsed').removeClass($.cookie('menu_style'));
                            $('#sidebar .menu-scroll').css('overflow', 'initial');
                            // Remove slimscroll when collapsed
                            if ($.cookie('header') == 'header-fixed') {
                                // Use for menu style 1 & 2
                                if ($('body').hasClass('sidebar-collapsed')) {
                                    $('#side-menu').attr('style', '').parent('.slimScrollDiv').replaceWith($('#side-menu'));
                                } else {
                                    // Use for menu style 4
                                    setTimeout(function () {
                                        $('#side-menu').slimScroll({
                                            "height": $(window).height() - 50,
                                            'width': '250px',
                                            "wheelStep": 5
                                        });
                                        $('#side-menu').focus();
                                    }, 500)
                                }
                            }
                        } else {
                            $('body').addClass('sidebar-collapsed').removeClass($.cookie('menu_style'));
                            $('#sidebar .menu-scroll').css('overflow', 'initial');
                        }
                    }
                }, function () {
                    if ($('#wrapper').hasClass('right-sidebar')) {
                        $('body').removeClass('right-side-collapsed');
                        $('#sidebar .menu-scroll').css('overflow', 'hidden');
                    } else {
                        $('body').removeClass('sidebar-collapsed');
                        $('body').addClass($.cookie('menu_style'));
                        if ($.cookie('header') == 'fixed') {
                            $('#side-menu').addClass('sidebar-fixed');
                        }
                        // Add slimscroll when open and have cookie fixed
                        if ($.cookie('header') == 'header-fixed') {
                            if ($('body').hasClass('sidebar-collapsed')) {
                                // Use for menu style 1 & 2
                                $('#side-menu').attr('style', '').parent('.slimScrollDiv').replaceWith($('#side-menu'));
                            } else {
                                // Use for menu style 4
                                setTimeout(function () {
                                    $('#side-menu').slimScroll({
                                        "height": $(window).height() - 50,
                                        'width': '250px',
                                        "wheelStep": 5
                                    });
                                    $('#side-menu').focus();
                                }, 500)
                            }
                        }
                    }
                }
                );

            if ($('#wrapper').hasClass('right-sidebar')) {
                $('ul#side-menu li').hover(function () {
                    if ($('body').hasClass('right-side-collapsed')) {
                        $(this).addClass('nav-hover');
                    }
                }, function () {
                    if ($('body').hasClass('right-side-collapsed')) {
                        $(this).removeClass('nav-hover');
                    }
                });
            } else {
                $('ul#side-menu li').hover(function () {
                    if ($('body').hasClass('left-side-collapsed')) {
                        $(this).addClass('nav-hover');
                    }
                }, function () {
                    if ($('body').hasClass('left-side-collapsed')) {
                        $(this).removeClass('nav-hover');
                    }
                });
            }


            var $allDropdowns = $();

            // if instantlyCloseOthers is true, then it will instantly
            // shut other nav items when a new one is hovered over
            $.fn.dropdownHover = function (options) {

                // the element we really care about
                // is the dropdown-toggle's parent
                $allDropdowns = $allDropdowns.add(this.parent());

                return this.each(function () {
                    var $this = $(this),
                        $parent = $this.parent(),
                        defaults = {
                            delay: 500,
                            instantlyCloseOthers: true
                        },
                        data = {
                            delay: $(this).data('delay'),
                            instantlyCloseOthers: $(this).data('close-others')
                        },
                        settings = $.extend(true, {}, defaults, options, data),
                        timeout;

                    $parent.hover(function (event) {
                        // so a neighbor can't open the dropdown
                        if (!$parent.hasClass('open') && !$this.is(event.target)) {
                            return true;
                        }

                        if (settings.instantlyCloseOthers === true)
                            $allDropdowns.removeClass('open');

                        window.clearTimeout(timeout);
                        $parent.addClass('open');
                    }, function () {
                        timeout = window.setTimeout(function () {
                            $parent.removeClass('open');
                        }, settings.delay);
                    });

                    // this helps with button groups!
                    $this.hover(function () {
                        if (settings.instantlyCloseOthers === true)
                            $allDropdowns.removeClass('open');

                        window.clearTimeout(timeout);
                        $parent.addClass('open');
                    });

                    // handle submenus
                    $parent.find('.dropdown-submenu').each(function () {
                        var $this = $(this);
                        var subTimeout;
                        $this.hover(function () {
                            window.clearTimeout(subTimeout);
                            $this.children('.dropdown-menu').show();
                            // always close submenu siblings instantly
                            $this.siblings().children('.dropdown-menu').hide();
                        }, function () {
                            var $submenu = $this.children('.dropdown-menu');
                            subTimeout = window.setTimeout(function () {
                                $submenu.hide();
                            }, settings.delay);
                        });
                    });
                });
            };

            $(document).ready(function () {
                // apply dropdownHover to all elements with the data-hover="dropdown" attribute
                $('[data-hover="dropdown"]').dropdownHover();
            });
        }
        $scope.previewImg = function (src) {
            var popImg = "<img width='554' height='544' src=\'" + src + '\'/>';
            TINY.box.show(popImg, 0, 0, 0, 1)
        }
    }
]);

function cloneObj(obj) {
    var newO = {};

    if (obj instanceof Array) {
        newO = [];
    }
    for (var key in obj) {
        var val = obj[key];
        newO[key] = typeof val === 'object' ? arguments.callee(val) : val;
    }
    return newO;
};
