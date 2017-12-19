/**
 * Created by Yatagaras on 2015/9/14.
 */
var checkPass, checkPassConfirm;

define(function () {
    var module = {}, loaded = false;

    function init() {
        navigation.direction("home");
        if (!loaded) {
            var p = window.location.href.getParameter("p");
            switch (p) {
                case "login":
                    account.sign.in();
                    break;
            }
            loaded = true;
        }
    }

    module.init = init;

    return module;
});