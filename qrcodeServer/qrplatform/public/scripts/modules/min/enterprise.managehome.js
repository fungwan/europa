/**
 * Created by san on 2015/12/28.
 */

define(function () {
    var module = {}, loaded = false;

    module.init = function () {
        if (!loaded) {
            $("#dealer").click(function (e) {
                window.location.href="manage.dealer.html";
            });
            $("#customer").click(function (e) {
                window.location.href="manage.customer.html"
            });
            $("#group").click(function (e) {
                window.location.href="dictionary.html"
            })
            loaded = true;
        }
    };

    return module;
});