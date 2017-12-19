/**
 * Created by Yatagaras on 2015/9/14.
 */

define(function () {
    var module = {}, loaded = false;

    module.init = function () {
        if (!loaded) {
            loaded = true;
        }
    };

    return module;
});