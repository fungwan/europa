/**
 * Created by Yatagaras on 2015/9/14.
 */

define(function () {
    var module = {}, loaded = false, ps = $("#pages"), navMenus = $("#menus");

    /**
     * 初始化模块
     */
    function init() {
        if (!loaded) {
            $(document.body).on("click", "button", onButtonClicked);
            $(".navbar-nav").on("click", "li", onNavMenuClicked).children("li:first").trigger("click");
            loaded = true;
        }
    }

    /**
     * 当点击按钮时
     * @param e
     * @returns {boolean}
     */
    function onButtonClicked(e) {
        var v = $(e.currentTarget).val();
        switch (v) {
            case "enterprise":
                window.location.href = "enterprise/do.html?p=login";
                break;
        }
        return false;
    }

    /**
     * 当点击导航菜单时
     * @param e
     * @returns {boolean}
     */
    function onNavMenuClicked(e) {
        /*var t = $(e.currentTarget), v = t.attr("data-module");
        if (!t.hasClass("selected") && v) {
            t.addClass("selected").siblings().removeClass("selected");
            installPage(v);
        }
        return false;*/
    }


    module.init = init;

    return module;
});