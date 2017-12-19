 // 通用工具服务
 // startLoading
 // stopLoading 
 // lockBodyScroll (锁定body的滚动条)
 // unlockBodyScroll (取消锁定body的滚动条)
 window.APP.factory("UtilService", ["$animate", function ($animate) {
    var service = {};

    function getScrollbarWidth () {
        var oP = document.createElement('p'),
            styles = {
                width: '100px',
                height: '100px',
                overflowY: 'scroll'
            },
            i, scrollbarWidth;

        for (i in styles) oP.style[i] = styles[i];
        document.body.appendChild(oP);
        scrollbarWidth = oP.offsetWidth - oP.clientWidth;
        oP.remove();
        return scrollbarWidth;
    }

    var scrollbarWidth = getScrollbarWidth();

    service.lockBodyScroll = function () {
        $("html").css("overflow", "hidden");
        // 判断body是否有滚动条
        if(document.body.style.overflow != "hidden" 
            && document.body.scroll != "no" 
            && document.body.scrollHeight > document.body.offsetHeight) {
             $("body").css("border-right", scrollbarWidth + "px solid transparent");
        }
    };

    service.unlockBodyScroll = function () {
        $("html").css("overflow", "");
        $("body").css("border-right", "");
    };

    var loadingHtml = '<div class="shade global-loading">'
                    + '<div class="loading-container">'
                    + '<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>'
                    + '</div>'
                    + '</div>';

    service.startLoading = function () {
        var $body = $("body");
        this.lockBodyScroll();
        $(".shade").css("background", "transparent");
        $animate.enter($(loadingHtml), $body, $($body[0].lastChild));
    };

    service.stopLoading = function () {
        this.unlockBodyScroll();
        $animate.leave($(".global-loading"));
        $(".shade").css("background", "");
    };

    return service;
 }]);