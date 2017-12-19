window.APP.directive('mPagination', function() {
    return {
        restrict: 'EA',
        scope: {
            mRecordTotal: '=',
            mPageNum:     '=',
            mPageCount:   '=',
            mEventName:   '@',
            mPageClick:   '&',
            mGoPage:      '&'
        },
        replace: true,
        templateUrl: 'views/directiveTemplates/pagination.html',
        controller: function($scope, $element, $attrs, $transclude) {
            // 生成分页按钮逻辑
            function initPageBtns() {
                var buttonNum = 5,
                    startNum = 1,
                    endNum = buttonNum,
                    midNum = parseInt(endNum / 2),
                    pageNum = $scope.mPageNum,
                    pageCount = $scope.mPageCount;

                if (pageNum > midNum) {
                    startNum = pageNum - midNum;
                    endNum = pageNum + midNum;
                }

                if (endNum > pageCount) {
                    startNum = pageCount - (buttonNum - 1);
                    endNum = pageCount;
                }

                if (startNum < 1) {
                    startNum = 1;
                }

                $scope.showPageNums = [];
                for (var i = startNum; i <= endNum; i++) {
                    $scope.showPageNums.push(i);
                }
            }
            initPageBtns();
            $scope.goPage = function(pageNum) {
                if (pageNum != 0 && pageNum != $scope.mPageCount + 1 && pageNum != $scope.pageNum) {
                    // 指令冒泡页码变化
                    $scope.$emit($scope.mEventName, pageNum);
                }
            };
        }
    };
});

// dropdown指令
window.APP.directive('mDropdown', function() {
    return {
        restrict: "EA",
        replace: true,
        transclude: {
            text: "mDropdownText",
            menu: "mDropdownMenu"
        },
        templateUrl: 'views/directiveTemplates/dropdown.html',
        controller: function($scope, $element, $attrs, $transclude) {
            var $container = $(".container");
            $scope.showDropDownMenu = function($event) {
                var $dropdown = $($event.currentTarget);
                if ($dropdown.hasClass("show")) {
                    $dropdown.removeClass("show");
                    $container.css("cssText", "height: auto !important");
                } else {
                    $dropdown.addClass("show");
                    $dropdownMenu = $dropdown.find(".dropdown-menu");
                    var diffHeight = $dropdownMenu.outerHeight() + $dropdownMenu.offset().top - $container.height();
                    if (diffHeight > 0) {
                        console.log(diffHeight);
                        var height = $container.height() + diffHeight;
                        console.log(height);
                        $container.css("cssText", "height: " + height + "px !important");
                    }
                }
            };
            $scope.closeDropDownMenu = function($event) {
                var $dropdown = $($event.currentTarget);
                $dropdown.removeClass("show");
            };
        }
    };
});

// message提示指令
window.APP.directive('mMessage', function($timeout, $animate) {
    return {
        restrict: 'EA',
        replace: true,
        scope: {
            mImgSrc: "@",
            mMessageContent: "@",
            mMessageClose: "@",
            mDuration: '@'
        },
        templateUrl: 'views/directiveTemplates/message.html',
        link: function($scope, $element, $attrs, $transclude) {
            var $body = $element.parent();
            $animate.enter($element, $body, $body.children(":last"));
            // 判断显示关闭按钮
            $scope.showClose = function() {
                return $scope.mMessageClose === "true";
            };
            // 关闭事件
            $scope.close = function() {
                $animate.leave($element);
            };
            // 延时关闭
            var duration = parseInt($scope.mDuration);
            if (duration > 0) {
                var timer = $timeout(function() {
                    $scope.close();
                }, duration);
            }
        }
    };
});

// analysis.tab指令
window.APP.directive("mTab", function() {
    return {
        restrict: "EA",
        replace: true,
        scope: {
            mTabItems: '='
        },
        templateUrl: 'views/directiveTemplates/analysis.tab.html',
        controller: function($scope, $element, $attrs, $transclude) {
            $scope.selectedItem = $scope.mTabItems[0];
            $scope.selectItem = function(item) {
                $scope.selectedItem = item;
            };
        }
    };
});

//对话框
window.APP.directive('mConfirm', function() {
    return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'views/directiveTemplates/confirm.html',
        controller: function($scope, $element, $attrs, $transclude) {
            $scope.confirmClose = function() {
                $(".confirm").remove();
            };
            $scope.confirm = function() {
                $scope.confirmClose();
                $scope.confirmSure();
            }
        }
    };
});