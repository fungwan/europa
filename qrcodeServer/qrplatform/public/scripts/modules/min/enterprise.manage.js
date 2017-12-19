/**
 * Created by san on 2015/11/30.
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
            })
            loaded = true;
        }
    };

    return module;
});