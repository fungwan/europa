/**
 * Created by Yatagaras on 2015/7/8.
 */
//配置信息
var config = {
    "host": {
        "resource": "/", //资源
        "service": {
            "primary": "/", //主服务
            "preview": "http://wx.51s.co/", //预览服务
            "download": "http://wx.51s.co:3002/",//下载服务
            "fullname":"http://wx.51s.co/"//二维码积分赠送
        } //服务相关
    }, //域名
    "themeName": localStorage.getItem("themeName") || "default",
    "language": localStorage.getItem("language") || navigator.language || navigator.systemLanguage,
    "formats": {
        "date": "YYYY-MM-DD",
        "time": "HH:mm",
        "datetime": "YYYY-MM-DD HH:mm",
        "s_date": "Y-m-d",
        "s_time": "H:i",
        "s_datetime": "Y-m-d H:i",
        "get": function (format, defaultValue) {
            if (format !== "get" && format in config.formats)
                return config.formats[format];
            else
                return format || defaultValue;
        }
    },
    "debug": true,
    "compression": ""
};

var _waitTimes = 0, _logId = 0, log = function (message) {
    if (config.debug) {
        if (typeof message === "string")
            console.log(String(++_logId) + ". " + message.toLowerCase());
        else
            console.log(message);
    }
};

var plugins = {
    "install": function (plugins, callback) {
        if (plugins) {
            if ($.type(plugins) == "string")
                plugins = [plugins];

            if ($.type(plugins) == "array") {
                var _config = {
                    paths: {},
                    shim: {}
                }, _ms = [];
                buildLibs(_ms, _config, plugins);

                require.config(_config);
                require(_ms, callback);
            }
        }
    },
    "moment": {
        "path": config.host.resource + "scripts/lib/moment.min"
    },
    "datagrid": {
        "path": config.host.resource + "scripts/lib/ex.datagrid.1.0.0",
        "shim": ["css!" + config.host.resource + "themes/{0}/datagrid.css", "popup"]
    },
    "chart": {
        "path": config.host.resource + "scripts/lib/chart/highcharts"
    },
    "chart3d": {
        "path": config.host.resource + "scripts/lib/chart/highcharts-3d",
        "shim": ["chart"]
    },
    "chartFull": {
        "path": config.host.resource + "scripts/lib/chart/highcharts-more",
        "shim": ["chart3d"]
    },
    "chartWithExport": {
        "path": config.host.resource + "scripts/lib/chart/modules/exporting",
        "shim": ["chart"]
    },
    "echarts": {
        "path": config.host.resource + "scripts/lib/echarts-all"
    },
    "uploadFile": {
        "path": config.host.resource + "scripts/lib/jquery.uploadfile.min"
    },
    "dateTimePicker": {
        "path": config.host.resource + "scripts/lib/datetimepicker",
        "shim": ["css!" + config.host.resource + "themes/{0}/datetimepicker.css", "popup", "moment"]
    },
    "colorPicker": {
        "path": config.host.resource + "scripts/lib/farbtastic/farbtastic",
        "shim": ["css!" + config.host.resource + "scripts/lib/farbtastic/farbtastic.css", "popup"]
    },
    "files": {
        "path": config.host.resource + "scripts/lib/ex.files"
    },
    "qrCode": {
        "path": config.host.resource + "scripts/lib/qrcode/jquery.qrcode.min"
    },
    "citypicker": {
        "path": config.host.resource + "scripts/lib/ex.cities",
        "shim": ["css!" + config.host.resource + "themes/{0}/citypicker.css", "popup"]
    },
    "mail": {
        "path": config.host.resource + "scripts/lib/ex.mail"
    }
};


function formatLib(libs) {
    $.each(libs, function (i, d) {
        if ((/^css!/ig).test(d))
            libs[i] = d.format(config.themeName) + "";
    });
}

function buildLibs(_ms, _config, libs) {
    if (_ms && _config && $.type(libs) == "array") {
        $.each(libs, function (i, d) {
            if (d in plugins && plugins[d] && !(/^css!/ig).test(d)) {
                var _lib = plugins[d];
                _ms.unshift(d);
                _config.paths[d] = _lib.path;
                if ("shim" in _lib && _lib.shim) {
                    var _t = $.type(_lib.shim);
                    if (_t === "array" || _t === "string") {
                        var _shims = _lib.shim;
                        if (_t == "string")
                            _shims = [_lib.shim];

                        formatLib(_shims);

                        _config.shim[d] = {
                            "deps": _shims
                        };

                        if (_shims && _shims.length > 0)
                            buildLibs(_ms, _config, _shims);
                    } else if ($.isPlainObject(_lib.shim))
                        _config.shim[d] = _lib.shim;
                }
            }
        });
    }
}

requirejs.onError = function (err) {
    console.log(err.requireType);
    if (err.requireType === 'timeout') {
        console.log('modules: ' + err.requireModules);
        window.location.reload();
    }
    return false;
};

/**
 * 初始化
 * @type {{basic: Function, plugin: Function, module: Function, completed: Function}}
 */
var initialization = {
    "loads": null,
    /**
     * 开始初始化
     */
    "done": function () {

        //设为加载状态
        document.body.classList.add("loading");

        log("Initialization...");
        var _config = {
            "paths": {
                "jquery": config.host.resource + "scripts/lib/jquery-2.1.4"
            },
            "map": {
                "*": {
                    "css": config.host.resource + "scripts/lib/require-css-master/css.min.js"
                }
            },
            "shim": {
                "jquery": {
                    "deps": ["css!" + config.host.resource + "themes/" + config.themeName + "/common.css"]
                }
            },
            waitSeconds: _waitTimes
        };

        log("load basic style...");
        require.config(_config);
        require(["jquery"], initialization.basic, initialization.fail);
    },
    "basic": function () {
        log("load basic style completed");

        var _config = {
            "paths": {
                "lang": config.host.resource + "scripts/lang/" + config.language.toLowerCase(),
                "core": config.host.resource + "scripts/lib/ex.core.1.1.0",
                "prototype": config.host.resource + "scripts/lib/prototype",
                "errorCodes": config.host.resource + "scripts/lib/errorCodes",
                "transit": config.host.resource + "scripts/lib/jquery.transit.min",
                "mouseWheel": config.host.resource + "scripts/lib/jquery.mousewheel.min",
                "popup": config.host.resource + "scripts/lib/ex.popup.1.0.0"
            },
            "shim": {
                "core": {
                    "deps": ["css!" + config.host.resource + "themes/" + config.themeName + "/base.css", "css!" + config.host.resource + "themes/" + config.themeName + "/se.css", "css!" + config.host.resource + "themes/" + config.themeName + "/ico.css", "lang"]
                },
                "mouseWheel": {
                    "deps": ["jquery"]
                }
            },
            waitSeconds: _waitTimes
        };

        log("Load core code...");
        initialization.loads = ["core", "popup", "prototype", "mouseWheel", "transit", "errorCodes", "lang"];

        if ($("#require").attr("data-navigation") !== "false") {
            _config.paths.navigation = config.host.resource + "scripts/modules/" + config.compression + "navigation";
            _config.shim.navigation = {
                "deps": ["core"]
            };
            initialization.loads.push("navigation");
        }

        require.config(_config);
        require(initialization.loads, initialization.plugin, initialization.fail);
    },
    /**
     * 插件
     */
    plugin: function () {
        log("Load core code completed.");

        core.language.install();

        initialization.loads = [];
        var _deps = $("#require").attr("data-deps");
        if (_deps) {
            var _config = {
                "paths": {},
                "shim": {},
                waitSeconds: _waitTimes
            };

            buildLibs(initialization.loads, _config, _deps.split(","));

            log("Load plugin...");
            require.config(_config);
            require(initialization.loads, initialization.module, initialization.fail);
        } else
            initialization.module();
    },
    /**
     * 模块
     */
    module: function () {
        var _args = arguments;
        $.each(initialization.loads, function (i, arg) {
            if (arg && !(arg in window) && _args[i])
                window[arg] = _args[i];
        });

        log("Load plugin completed.");

        initialization.loads = [];
        var _module = $("#require").attr("data-module");
        if (_module) {
            var _config = {
                paths: {},
                shim: {},
                waitSeconds: _waitTimes
            };

            _config.paths[_module] = config.host.resource + "scripts/modules/" + config.compression + _module;
            _config.shim[_module] = {
                deps: ["css!" + config.host.resource + "themes/" + config.themeName + "/modules/" + _module + ".css"]
            };

            log("Load module: {0} ...".format(_module));
            require.config(_config);
            require([_module], initialization.completed, initialization.fail);
        } else
            initialization.completed();
    },
    /**
     * 初始化完成
     * @param m
     */
    completed: function (m) {
        log("Load module completed.");

        //取消加载状态
        document.body.classList.remove("loading");
        log("Initialization completed.");

        //运行模块初始化
        if (m && m.init) {
            if (history.pushState)
                window.addEventListener("popstate", m.init);

            m.init();
        }

        if (window.navigation) {
            if (window.navigation.initFooter)
                window.navigation.initFooter();

            if (window.separation)
                window.separation.init();
        }

        if (window.popup)
            window.popup.init();
    },
    /**
     * 初始化失败
     * @param err
     */
    fail: function (err) {
        alert(JSON.stringify(err));
    }
};

initialization.done();

