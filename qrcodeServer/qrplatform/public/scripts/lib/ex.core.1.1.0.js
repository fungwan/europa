/**
 * Created by Yatagaras on 2015/12/30.
 */

/**
 * Created by Yatagaras on 2015/7/8.
 */
define(["jquery"], function () {

    /**
     * 定义语言包
     * @type {*|null}
     * @private
     */
    var _lang = {
        pack: top.languagePack || null,
        get: function (path, defaultString) {
            var rv = defaultString || "";
            if (_lang.pack) {
                try {
                    rv = eval("_lang.pack.{0}".format(path));
                } catch (e) {
                }
            }

            return rv;
        }
    };

    /**
     * 定义正则表达式
     * @type {{color: RegExp, number: RegExp, int: RegExp, account: RegExp}}
     * @private
     */
    var _regexps = {
        "color": /^(#[a-fA-F0-9]{3})|(#[a-fA-F0-9]{6})$/ig,
        "number": /^\-?\d+(\.\d+)?$/ig,
        "positiveNumber": /^\d+(\.\d+)?$/ig,
        "int": /^\-?\d+$/ig,
        "positiveInteger": /^\d+$/ig,
        "account": /^[a-zA-Z_]\w{2,14}[a-zA-Z0-9_]$/ig,
        "ip": /^((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d)(.((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d)){3}$/ig,
        "host": /^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+.?$/ig,
        "url": new RegExp('^((https|http|ftp|rtsp|mms)?://)'
            + '?(([0-9a-z_!~*\'().&=+$%-]+: )?[0-9a-z_!~*\'().&=+$%-]+@)?' //ftp的user@
            + '(([0-9]{1,3}.){3}[0-9]{1,3}' // IP形式的URL- 199.194.52.184
            + '|' // 允许IP和DOMAIN（域名）
            + '([0-9a-z_!~*\'()-]+.)*' // 域名- www.
            + '([0-9a-z][0-9a-z-]{0,61})?[0-9a-z].' // 二级域名
            + '[a-z]{2,6})' // first level domain- .com or .museum
            + '(:[0-9]{1,4})?' // 端口- :80
            + '((/?)|' // a slash isn't required if there is no file name
            + '(/[0-9a-z_!~*\'().;?:@&=+$,%#-]+)+/?)$', "ig"),
        "mail": /^[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?$/ig,
        "tel": /(^\d{11}$)|(^((\+?86)|(\(\+86\)))?(\d{3,4})?(\-|\s)?\d{7,8}((\-|\s)\d{3,4})?$)/ig,
        "pass": /^\S{6,16}$/ig,
        "pxsize": /^\d+px$/ig
    };

    $.isNull = function (obj) {
        return obj === undefined || obj === null;
    };

    /**
     * 设置区域中表单元素的可用状态
     * @param enable 可用状态
     * @returns {$}
     */
    $.fn.setFormEnabled = function (enable) {
        this.find("input, select, button, textarea").prop("disabled", enable === false);
        return this;
    };


    $.fn.setFormReadonly = function (readonly) {
        this.find("input,textarea").prop("readonly", readonly === true);
        this.find("button").prop("disabled", readonly === true);
        return this;
    };


    /**
     * 为对象设定错误消息
     * @param msg
     * @returns {$}
     */
    $.fn.setError = function (msg) {
        //this.get(0).reportValidity();
        this.removeClass("error").addClass("error").attr("title", "").data("tooltip", msg);
        return this;
    };

    /**
     * 清除对象的错误消息
     * @param msg
     * @returns {$}
     */
    $.fn.clearError = function () {
        this.removeClass("error").data("tooltip", "");
        this.find(".error").removeClass("error").data("tooltip", "");
        return this;
    };

    /**
     * 在指定目标上显示通知消息
     * @param type 消息类型 {boolean, string, null}
     * @param message 消息内容
     * @param duration 显示时长
     */
    $.fn.notice = function (type, message, duration) {
        this.each(function (i, d) {
            var t = $(d);
            var si = t.data("notice_si");
            if (si) clearTimeout(si);

            var cls = "";
            switch (type) {
                case true:
                    cls = "_notice_success";
                    break;
                case false:
                    cls = "_notice_error";
                    break;
                default:
                    cls = "_notice_" + type;
                    break;
            }
            _core.language.install(t.removeAllClass().addClass("_notice").addClass(cls).html(message).fadeIn("fast"));
            if (!duration || (!isNaN(duration) && duration > 0)) {
                si = setTimeout(function () {
                    t.fadeOut("fast");
                }, duration || 5000);
                t.data("notice_si", si);
            }
        });
    };

    /**
     * 清除对象的错误消息
     * @param e
     */
    function clearError(e) {
        $(e.currentTarget).clearError();
        return false;
    }

    /**
     * 获取检测要求
     * @returns {{caption: (*|{empty, type, field}|string), required: boolean, action: (*|{empty, type, field}|string), on: boolean, target: (*|{empty, type, field}|string)}}
     */
    $.fn.getExpressions = function () {
        //_settingStr template: data-validate="require,action,on,target"
        var _caption = this.attr("data-input-name") || "", _id = this.attr("id"), _langkey = "";
        if (_id) {
            var _label = $("label[for={0}]".format(_id));
            _langkey = _label.attr("data-lang") || _label.attr("data-lang-name");
            if (!_langkey) _caption = _label.text();
        }

        if (!_langkey) _langkey = this.attr("data-lang-name");
        if (_langkey) _caption = "<span data-lang='{0}'></span>".format(_langkey);

        return {
            caption: _caption,
            required: this.attr("required"),
            pattern: this.attr("data-expression") || "",
            on: !this.attr("novalidate")
        };
    };


    /**
     * 序列化区域
     * @param validation
     * @returns {{hasError: boolean, result: {}}}
     */
    $.fn.serializeForm = function (validation) {
        var res = {
            hasError: false,
            result: {}
        };

        var validate = validation !== false;

        var msg = "";
        var msgspliter = "";

        try {
            if (this != null) {

                if (validate) {
                    this.find("input, select, textarea,button").each(function (i, d) {
                        var $t = $(this);
                        if ($t.validation()) {
                            msg = msg + msgspliter + $t.data("tooltip");
                            msgspliter = " , ";
                        }
                    });
                }

                if (msg == "") {
                    res.result = {};
                    this.find("[name]").each(function (inx, dom) {
                        var _t = $(this), _n = _t.attr("name");
                        if (_n) {
                            var _ns = _n.split("."), _nsnum = _ns.length, _inx = 0;
                            if (_nsnum > 1) {
                                var _res = res.result;
                                while (_inx < _nsnum - 1) {
                                    var _cn = _ns[_inx];
                                    if (!(_cn in _res)) _res[_cn] = {};
                                    _res = _res[_cn];
                                    _inx++;
                                }
                                _cn = _ns[_inx];
                                if (_t.is("input:radio")) {
                                    var _val = _t.cval();
                                    if (_val === null && _res[_cn] !== null) _val = _res[_cn];
                                    _res[_cn] = _val;
                                } else
                                    _res[_cn] = _t.cval();
                            } else {
                                if (_t.is("input:radio")) {
                                    var _val = _t.cval();
                                    if (!_val && res.result[_n]) _val = res.result[_n];
                                    res.result[_n] = _val;
                                } else
                                    res.result[_n] = _t.cval();
                            }
                        }
                    });
                } else {
                    throw new Error(msg);
                }
            }
        } catch (e) {
            res.hasError = true;
            res.result = e.message;
        }

        return res;
    };

    /**
     * 获取或设置指定对象的值
     * @param val
     */
    $.fn.cval = function () {
        var _vt = this.attr("data-prop");
        if (arguments.length == 0) {
            var v = "";
            if (_vt)
                v = this.attr(_vt);
            else {
                if (this.is("input:checkbox, input:radio")) {
                    if (this.attr("data-type") === "bool")
                        v = this.prop("checked");
                    else
                        v = this.prop("checked") ? this.val() : "";
                } else if (this.is("input:text, input:password, input:hidden, input[type=email], input[type=number], input[type=datetime], input[type='datetime-local'], input[type=color], input[type=range], input[type=date], input[type=month], input[type=time], input[type=week], input[type=tel], input[type=url], input:button, input:image, textarea"))/*button,*/
                    v = this.val();
                else if (this.is("button")) {
                    try {
                        var bdt = this.attr("data-type");
                        v = this.val();
                        switch (bdt) {
                            case "datepicker":
                                v = top.moment(v).format(config.formats.get(this.attr("data-format"), "YYYY-MM-DD HH:mm"));
                                break;
                        }
                    } catch (e) {
                    }
                } else if (this.attr("data-role") === "datagrid") {
                    v = this.datagrid("getData");
                } else
                    v = this.attr("data-value") || this.html();
            }
            return v;
        } else {
            var val = arguments[0];
            if (_vt)
                this.attr(_vt, val);
            else if (this.is("input:checkbox, input:radio")) {
                this.each(function (i, dom) {
                    var _t = $(dom);
                    if (_t.attr("data-type") === "bool")
                        _t.prop("checked", !!val);
                    else
                        _t.prop("checked", String(val) == (_t.val() || "true"));
                });
            } else if (this.is("input:text, input:password, input:hidden, input[type=email], input[type=number], input[type=datetime], input[type='datetime-local'], input[type=color], input[type=date], input[type=month], input[type=time], input[type=week], input[type=tel], input[type=url], input:button, input:image, textarea"))
                this.val(val);
            else if (this.is("input[type=range]"))
                this.val(val).trigger("mousemove");
            else if (this.is("button")) {
                try {
                    var bdt = this.attr("data-type"), format = config.formats.get(this.attr("data-format"), "YYYY-MM-DD HH:mm:ss");
                    this.val(val);
                    switch (bdt) {
                        case "datepicker":
                            this.text(moment(val).format(format));
                            break;
                        case "colorpicker":
                            this.css("backgroundColor", val || "#ffffff");
                            break;
                        case "citypicker":
                            top.citypicker.getFull(this);
                            break;
                        case "imagepicker":
                            if (val)
                                this.css("backgroundImage", "url({0})".format(val));
                            else
                                this.css("backgroundImage", "none");
                            break;
                        case "selector":
                            if (popup) {
                                var _item = popup.getItem(this.attr("data-popup"), val, this), result = "";
                                if (_item) {
                                    var _itemType = $.type(_item);
                                    if (_itemType === "string") {
                                        result = _item;
                                    } else if (_itemType == "object" && _item.length > 0) {
                                        result = _item.html();
                                    }
                                }
                                this.html(result);
                            }
                            break;
                        default:
                            break;
                    }
                } catch (e) {
                    this.val(val);
                }
            } else if (this.attr("data-role") === "datagrid") {
                v = this.datagrid("setData", val || []);
            } else
                this.html(val);

            /*var handled = this.triggerHandler("change", val);
             if (typeof handled === "boolean") return handled;*/
            return this;
        }
    };


    /**
     * 在指定对象上显示加载动画
     * @param messagekey
     * @param cls
     * @param less
     * @returns {XMLList|*}
     */
    $.fn.loader = function (messagekey, cls, less) {
        cls = cls || "spinnerLoader";
        var id = _core.uuid.get().replace(/\-/g, "");

        var lb = $("<div data-role='loader' id='lel_" + id + "' class='" + cls + "' data-lang='" + (messagekey || "") + "'></div>");
        this.append(lb);

        if (messagekey) lb.html(core.language.get(messagekey) || "Loading...");
        lb.fadeIn();

        if (less === false) {
            var mark = $("#" + id);
            if (mark.length == 0) {
                mark = $("<div id='m_lel_" + id + "' class='topperMasker'></div>");
                $(document.body).append(mark);
            }
            mark.show();
        }

        return lb;
    };

    $.fn.closeLoader = function () {
        var t = this;
        $("#m_" + t.attr("id")).remove();
        this.fadeOut("fast", function () {
            t.remove();
        });
    };

    /**
     * 移除对象上所有的样式类名
     * @returns {$}
     */
    $.fn.removeAllClass = function () {
        this.each(function (i, d) {
            $(this).attr("class", function (i, cls) {
                return cls ? cls.replace(/[^\s]+\s?/g, '') : "";
            });
        });
        return this;
    };

    function patternValidation(t, v, pattern) {
        var errorMsg = "";
        if (pattern) {
            if (pattern in _regexps) {
                _regexps[pattern].lastIndex = 0;
                if (!_regexps[pattern].test(v))
                    errorMsg = "<span data-lang='{0}'></span>".format("system.validation.notvalidated");
            } else {
                try {
                    errorMsg = eval(pattern + "(v, t)") || "";
                } catch (e) {
                }
            }
        }
        return errorMsg;
    }

    /**
     * 检测对象的值是否合格
     * @param e
     */
    $.fn.validation = function () {
        var t = this;

        if (t.length == 0) return;
        if (t.hasClass("error")) return true;

        var hasError = false;
        var v = this.cval();

        if (t.is("input") || t.is("select") || t.is("textarea")) {
            var dom = t.get(0), domType = t.attr("type");
            if ("radio,checkbox,hidden,file".indexOf(domType) < 0)
                dom.value = $.trim(v);

            if (!dom.checkValidity()) {
                hasError = true;
                this.setError(validateMessage.get(dom));
            } else if (t.attr("data-expression")) {
                var errorMsg = patternValidation(t, v, t.attr("data-expression"));
                //var errorMsg = eval(t.attr("data-expression") + "(v, t)") || "";
                if (errorMsg) {
                    hasError = true;
                    this.setError(errorMsg);
                }
            }
        } else if (t.is("div.datagrid")) {
            hasError = t.data("setting").hasError;
        } else {
            //获取检测要求
            var es = t.getExpressions();
            if (!es || !es.on || (!es.required && !es.pattern)) return false;

            this.clearError();
            if (es.required && (v == null || v == undefined || $.trim(v) == "")) {
                hasError = true;
                this.setError(es.caption.replace("<br />", "") + "<span data-lang='{0}'></span>".format("system.validation.isrequired"));
            }
            if (!hasError && $.type(es.pattern) == "string" && es.pattern != "") {
                var errorMsg = patternValidation(t, v, es.pattern);
                hasError = errorMsg != "";
                if (hasError)
                    this.setError(es.caption.replace("<br />", "") + errorMsg);
            }
        }

        if (!hasError) t.clearError();

        return hasError;
    };

    function validation(e) {
        var t = $(e.currentTarget), v = t.val();
        if (t.attr("data-type") == "numeric") {
            v = v.replace(/\.$/g, "");
            t.val(v);
        } else if (t.is("input[type=number]")) {
            t.val(Number(v) || Number(t.attr("min")) || 0);
        }
        t.validation();
        return false;
    }


    /**
     * 清除区域中的数据
     * @returns {$}
     */
    $.fn.clearData = function () {
        this.find("[name]").each(function (i, d) {
            var _t = $(this), _v = _t.attr("data-defaultvalue") || "";
            _t.cval(_v);
        }).clearError();
        return this;
    };


    /**
     * 绑定JSON数据到指定区域中
     * @param d 数据
     * @param path 路径
     * @param clear 是否清除旧数据
     * @returns {$}
     */
    $.fn.parseData = function (d, path, clear) {
        if (clear !== false) this.clearData().clearError();
        this.each(function (_i, _d) {
            var $t = $(this);
            if ($.type(d) == "object") {
                try {
                    $.each(d, function (key, value) {
                        if ($.type(value) == "object") {
                            $t.parseData(value, (path || "") + key + ".", false);
                        } else {
                            var tar = $t.find("[name='{0}{1}']".format(path || "", key));
                            tar.cval(value);
                        }
                    });
                } catch (e) {
                    core.throw(e.message);
                }
            }
        });
        return this;
    };

    $.fn.maskerLayer = function () {
        var rv = this, args = arguments;
        this.each(function (inx, dom) {
            var parlen = args.length, t = $(dom);
            if (parlen > 0) {
                var p1 = args[0];
                if ($.type(p1) == "string") {
                    switch (p1) {
                        case "event":
                            var commands = null;
                            if (parlen > 1)
                                commands = args[1];
                            t.data("commandEvents", commands);
                            break;
                        case "disableEvent":
                            if (parlen > 1) {
                                var commandNames = args[1],
                                    tcmd = t.children(".maskLayerContent").children(".command");
                                if ($.type(commandNames) == "string") commandNames = [commandNames];
                                if ($.type(commandNames) == "array") {
                                    $.each(commandNames, function (i, cn) {
                                        tcmd.children("button[value='{0}']".format(cn)).prop("disabled", true);
                                    });
                                }
                            }
                            break;
                        case "enableEvent":
                            if (parlen > 1) {
                                var commandNames = args[1],
                                    tcmd = t.children(".maskLayerContent").children(".command");
                                if ($.type(commandNames) == "string") commandNames = [commandNames];
                                if ($.type(commandNames) == "array") {
                                    $.each(commandNames, function (i, cn) {
                                        tcmd.children("button[value='{0}']".format(cn)).prop("disabled", false);
                                    });
                                }
                            }
                            break;
                        case "open":
                            t.addClass("openedMaskLayer");
                            break;
                        case "close":
                            t.removeClass("openedMaskLayer");
                            break;
                        case "toggle":
                            t.toggleClass("openedMaskLayer");
                            break;
                    }
                }
            }
        });

        return rv;
    };

    function onMaskerLayerCommandItemClicked(e) {
        var t = $(e.currentTarget), v = t.val(), closeLayer = true, tar = t.parentsUntil(".maskLayer", ".maskLayerContent").parent();
        if (v && tar) {
            var cmds = tar.data("commandEvents");
            if (cmds && v in cmds && $.type(cmds[v]) == "function")
                closeLayer = cmds[v](e) !== false;
        }

        if (closeLayer)
            tar.removeClass("openedMaskLayer");
    }

    var _g_maskLayerDraggingEl = null, _g_maskLayer_originalPosition, _g_maskLayer_mousePosition, _g_maskLayer_range, _g_maskLayer_dragEl;

    function onMaskerLayerTitleMoving(e) {
        if (_g_maskLayerDraggingEl) {
            var shiftX = e.originalEvent.pageX - _g_maskLayer_mousePosition.x, shiftY = e.originalEvent.pageY - _g_maskLayer_mousePosition.y;
            var newml = _g_maskLayer_originalPosition.left + shiftX, newmt = _g_maskLayer_originalPosition.top + shiftY;
            if (newml < _g_maskLayer_range[0])
                newml = _g_maskLayer_range[0];
            else if (newml > _g_maskLayer_range[1])
                newml = _g_maskLayer_range[1];

            if (newmt < _g_maskLayer_range[2])
                newmt = _g_maskLayer_range[2];
            else if (newmt > _g_maskLayer_range[3])
                newmt = _g_maskLayer_range[3];

            _g_maskLayerDraggingEl.css({
                translate: [newml, newmt]
            });
        }
        return false;
    }

    function onMaskerLayerTitleDragStart(e) {
        top.$(document.body).unbind("dragover", onMaskerLayerTitleMoving).bind("dragover", onMaskerLayerTitleMoving);
        var t = $(e.currentTarget);
        _g_maskLayerDraggingEl = t.parent().addClass("dragging");

        var trs = _g_maskLayerDraggingEl.css('translate');
        if (trs) trs = trs.split(","); else trs = [0, 0];

        var w = _g_maskLayerDraggingEl.outerWidth(), h = _g_maskLayerDraggingEl.outerHeight(), ww = $(window).width(), wh = $(window).height(),
            hw = Math.round((ww - w) / 2), hh = Math.round((wh - h) / 2);
        _g_maskLayer_range = [-hw, hw, -hh, hh];

        _g_maskLayer_originalPosition = {
            left: parseInt(trs[0]) || 0,
            top: parseInt(trs[1]) || 0
        };
        _g_maskLayer_mousePosition = {
            x: e.originalEvent.pageX,
            y: e.originalEvent.pageY
        };

        if (!_g_maskLayer_dragEl) {
            _g_maskLayer_dragEl = $("<div class='position: absolute; top: -20px; left: -20px; width: 10px; height: 10px; background-color: transparent;'>&nbsp;</div>");
            $(document.body).append(_g_maskLayer_dragEl);
            _g_maskLayer_dragEl = _g_maskLayer_dragEl.get(0);
        }

        e.originalEvent.dataTransfer.effectAllowed = "move";
        e.originalEvent.dataTransfer.setDragImage(_g_maskLayer_dragEl, e.originalEvent.layerX, e.originalEvent.layerY);
    }

    function onMaskerLayerTitleDragEnd(e) {
        if (_g_maskLayerDraggingEl)
            _g_maskLayerDraggingEl.removeClass("dragging");
        _g_maskLayerDraggingEl = null;
        top.$(document.body).unbind("dragover", onMaskerLayerTitleMoving);
        return false;
    }


    function togglePanel(e) {
        var t = $(e.currentTarget), tarId = t.attr("data-panel");
        if (tarId) {
            var tar = $("#" + tarId);
            if (tar.length > 0) {
                if (tar.hasClass("maskLayer"))
                    tar.maskerLayer("toggle");
                else
                    tar.toggleClass("collapse expand");

                $(window).trigger("resize");
            }
        }
    }

    /**
     * 显示提示文本
     * @param e
     * @returns {boolean}
     */
    function openTooltip(e) {
        var t = $(this);
        var tooltip = t.data("tooltip") || $.trim(t.attr("title"));
        if (tooltip != "") {
            t.attr("title", "").data("tooltip", tooltip);
            core.tooltip.open(e, tooltip);
        }
    }

    /**
     * 隐藏提示文本
     * @param e
     * @returns {boolean}
     */
    function closeTooltip(e) {
        core.tooltip.close(e);
    }

    var fullScreenApi = {
            supportsFullScreen: false,
            isFullScreen: function () {
                return false;
            },
            requestFullScreen: function () {
            },
            cancelFullScreen: function () {
            },
            fullScreenEventName: '',
            prefix: ''
        },
        browserPrefixes = 'webkit moz o ms khtml'.split(' ');

    // check for native support
    if (typeof document.cancelFullScreen != 'undefined') {
        fullScreenApi.supportsFullScreen = true;
    } else {
        // check for fullscreen support by vendor prefix
        for (var i = 0, il = browserPrefixes.length; i < il; i++) {
            fullScreenApi.prefix = browserPrefixes[i];

            if (typeof document[fullScreenApi.prefix + 'CancelFullScreen'] != 'undefined') {
                fullScreenApi.supportsFullScreen = true;

                break;
            }
        }
    }

    // update methods to do something useful
    if (fullScreenApi.supportsFullScreen) {
        fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';

        fullScreenApi.isFullScreen = function () {
            switch (this.prefix) {
                case '':
                    return document.fullScreen;
                case 'webkit':
                    return document.webkitIsFullScreen;
                default:
                    return document[this.prefix + 'FullScreen'];
            }
        }
        fullScreenApi.requestFullScreen = function (el) {
            return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
        }
        fullScreenApi.cancelFullScreen = function (el) {
            return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
        }
    }

    $.fn.fullScreen = function (change) {
        this.each(function (i, dom) {
            if (fullScreenApi.supportsFullScreen) {
                var current = fullScreenApi.isFullScreen();
                if (current)
                    fullScreenApi.cancelFullScreen();
                else
                    fullScreenApi.requestFullScreen(dom);

                if ($.type(change) === "function")
                    change(!current);
            }
        });
    }

    // export api
    window.fullScreenApi = fullScreenApi;


    /**
     *
     * @param ajaxSetting string|object 如果有传此参数，为字符串时则表示采用默认Ajax设置，并且值为请求地址，如果为Object，则表示采用该设置（包括请求地址）
     * @param loadSetting string|bool|object 如果无此参数，则采用默认加载动画。如果为字符串，则值为动画要显示的消息；如果为false, 则表示不显示动画; 如果为true, 则表示动画模式为Modalless；如果为Object，则表示采用该设置
     * @param firstComplete bool 默认为false, 为真时表示在请求完成后首先执行complete，否则在执行完success或fail后再执行complete
     * @returns {*}
     */
    $.fn.action = function (ajaxSetting, loadSetting, firstComplete) {
        var defer = $.Deferred();
        if (this.length > 0 && ajaxSetting) {
            var t = this.eq(0), loader, xhr = t.data("xhr"), ot, otip, ocls;
            if (xhr) {
                xhr.abort();
                t.removeData("xhr");
                return t.action(ajaxSetting, loadSetting, firstComplete);
            } else {
                var ao, lo, loader;
                if ($.type(ajaxSetting) == "string")
                    ao = $.extend(true, {}, $.fn.action.defaultAjaxSetting, {url: ajaxSetting});
                else if ($.isPlainObject(ajaxSetting) && ajaxSetting.url)
                    ao = $.extend(true, {}, $.fn.action.defaultAjaxSetting, ajaxSetting);
                else
                    defer.reject();

                if ($.type(loadSetting) == "string")
                    lo = $.extend(true, {}, $.fn.action.defaultLoadSetting, {message: loadSetting});
                else if (loadSetting === false)
                    lo = $.extend(true, {}, $.fn.action.defaultLoadSetting, {enable: false});
                else if (loadSetting === true)
                    lo = $.extend(true, {}, $.fn.action.defaultLoadSetting, {modalless: false});
                else if ($.isPlainObject(loadSetting))
                    lo = $.extend(true, {}, $.fn.action.defaultLoadSetting, loadSetting);
                else
                    lo = $.fn.action.defaultLoadSetting;

                if (lo.enable === true)
                    loader = t.loader(lo.message || "", "spinnerLoader", lo.modalless || false);
                else if (t.is("button")) {
                    ot = t.html();
                    otip = t.data("tooltip") || "";
                    ocls = t.attr("class");
                    t.html("<div class='loader'><div class='spinner'><i></i></div></div>").data("tooltip", lo.message || "").prop("disabled", true).removeClass("class").addClass("processing");
                }

                ao.url = getServiceFullUrl(ao.url);

                function _done(data) {
                    if (config.debug) {
                        log("request: " + ao.url);
                        log(data);
                    }
                    if (checkData(data, _fail)) {
                        if (firstComplete === true) _always();
                        defer.resolve(data);
                        if (firstComplete !== true) _always();
                    }
                }

                function _fail(a) {
                    if ("statusText" in a && a.statusText == "abort") {
                        defer = null;
                    } else {
                        var err = {code: a.code ? a.code : "unknow", message: ""};
                        try {
                            if (a) {
                                if ($.type(a) == "object")
                                    err.message = a.stack || a.responseText || a.message;

                                if ($.type(err.message) == "string") {
                                    var _err = JSON.parse(err.message.replace(/^"(.*)"$/ig, "$1").replace(/\\"/ig, '"'));
                                    if (_err && _err.error) err = _err.error;
                                }
                            }
                        } catch (e) {
                        }
                        if (!err.message) err.message = "服务器连接失败，请稍候重试";

                        if (firstComplete === true) _always();
                        defer.reject(err);
                        if (firstComplete !== true) _always();
                    }
                }

                function _always() {
                    t.removeData("xhr");
                    if (loader)
                        loader.closeLoader();
                    else if (t.is("button"))
                        t.html(ot).data("tooltip", otip).prop("disabled", false).removeClass("processing").addClass(ocls);
                    defer.always();
                }

                xhr = $.ajax(ao).done(_done).fail(_fail);
                t.data("xhr", xhr);
            }
        }

        return defer;
    };
    $.fn.action.defaultAjaxSetting = {
        type: "post"
    };
    $.fn.action.defaultLoadSetting = {
        enable: true,
        modalless: false,
        message: ""
    };


    $.fn.enter = function (event) {
        function _listenEnterKey(e) {
            if (e.keyCode === 13 || e.keyCode === 108 && $.type(event) === "function")
                event(e);
        }

        return this.unbind("keyup.enter").bind("keyup.enter", _listenEnterKey);
    };
    $.fn.unenter = function () {
        return this.unbind("keyup.enter");
    };


    function checkData(data, error) {
        var ok = true, msg = "";
        if (data) {
            if (data.error) {
                ok = false;
                var msg = data.error;

                if (msg && $.type(msg) == "object" && "stack" in msg)
                    msg = "<p><b>{0}</b></p>{1}".format(msg.message, msg.stack);

                if ($.type(error) == "function")
                    error(msg);
                else
                    core.throw(msg);
            }
        } else
            ok = false;

        return ok;
    }

    function getServiceFullUrl(url) {
        return config.host.service.primary + url;
    }

    var _core = {
        plugin: {},
        preventBubble: function (e) {
            e.stopPropagation();
            e.preventDefault();
            return false;
        }
        /*pageOffset: {left: 0, top: 0},
         updateOffset: function () {
         if (window.frameElement && window.frameElement.id) {
         var _coffset = parent.$("#" + window.frameElement.id).offset();
         _core.pageOffset.left = parent.core.pageOffset.left + _coffset.left;
         _core.pageOffset.top = parent.core.pageOffset.top + _coffset.top;
         }
         }*/
    };

    $.fn.updateOffset = function () {
        this.each(function (i, dom) {
            if (dom && dom.contentWindow && dom.contentWindow.core)
                dom.contentWindow.core.updateOffset();
        });
    };


    /**
     * 当标签页切换时
     * @param e
     */
    function tabItemChanged(e, always) {
        var t = $(e.currentTarget);
        if (!t.hasClass("selected") || always == true) {
            var p = t.parent(), _val = t.attr("value");
            p.children().removeClass("selected");
            t.addClass("selected");
            var c = p.siblings(".tabContent");
            c.children().removeClass("selected");
            var tar = c.children(".{0}".format(_val)).addClass("selected");
            if (popup.config && popup.config.current)
                top.popup.updatePosition();
            p.triggerHandler("change", {
                tag: _val,
                target: tar
            });
        }
        e.stopImmediatePropagation();
        return false;
    }


    //-------------------------------------event listeners ---------------------------------------------


    /**
     * 添加全局事件侦听器
     * @private
     */
    function __addEventListeners() {
        var root = $(document.body);
        root.on("mouseenter", "[title]", openTooltip).on("mouseleave mousedown", "[title]", closeTooltip);
        root.on("focus", "input, textarea", clearError).on("blur", "input:enabled, textarea:enabled", validation).on("change", "input[type=file]", validation);
        root.on("click", "ul.tab > li", tabItemChanged).on("click", "[data-panel]", togglePanel);

        root.on("dragstart", ".maskLayerContent > .title", onMaskerLayerTitleDragStart).on("dragend", ".maskLayerContent > .title", onMaskerLayerTitleDragEnd);
        root.on("click", ".maskLayerContent .command > button[value], .maskLayerContent .commands > button[value]", onMaskerLayerCommandItemClicked);

        $(window).resize(windowSizeChanged);

        if (navigator.userAgent.match(/mobile/i)) {

        } else {
            root.updateScroll();
        }
    }

    //--------------------------------------page-------------------------------------------
    /*
     function getHistoryURL(id) {
     var lurl = window.location.href.split("?");
     return lurl[0] + "?" + id;
     }*/
    /*
     /!**
     * 加载一个页面到Iframe中并显示该Iframe, 关闭该窗口之前显示的Iframe
     * @param setting iframe设置
     * @param openTrans 显示当前Iframe使用的动画，默认为从右侧滑入
     * @param closeTrans 隐藏之前Iframe使用的动画，默认为从左侧滑出
     *!/
     $.fn.loadPage = function (setting, openTrans, closeTrans) {
     var o = $.extend(true, {}, $.fn.loadPage.defaultSetting, setting);
     if (this.length == 1) {
     if (o && o.id) {
     var newPage = $("#" + o.id);
     if (newPage.length == 0 && o.url) {
     if (!o.loader && top.library.sys.fixedLoader)
     top.document.body.classList.add("loading");

     var _page_el = document.createElement("iframe");
     _page_el.setAttribute("frameBorder", "0");
     _page_el.setAttribute("id", o.id);
     _page_el.setAttribute("src", o.url);
     _page_el.setAttribute("style", "transform: translateY(-100%)");
     var _page = $(_page_el);
     _page.data("openSetting", {
     container: this,
     setting: setting,
     openTrans: openTrans,
     closeTrans: closeTrans
     });

     if (o.history && support.history)
     window.history.pushState({
     setting: setting,
     selector: this.selector
     }, '', o.id ? getHistoryURL(o.id) : "");

     this.append(_page_el);
     } else {
     var currentPageId = this.data("currentPageId"), currentPage = $("#" + currentPageId);
     if (o.id != currentPageId) {
     this.data("currentPageId", o.id);
     if (currentPage.length == 1)
     currentPage.seElement(closeTrans || "-se-out-slide-left");
     }
     if (o.loader)
     o.loader.closeLoader();
     else if (top.library.sys.fixedLoader)
     top.document.body.classList.remove("loading");

     if (this.find("#" + o.id).length == 0) this.append(newPage);

     newPage.seElement(openTrans || "-se-out-slide-right");
     var dom = newPage.get(0);
     if (dom.contentWindow.core) {
     try {
     setTimeout(dom.contentWindow.core.updateOffset, 1000);
     var mpath = dom.contentWindow.$("#require").attr("data-module");
     eval("dom.contentWindow." + mpath + ".init()");
     } catch (err) {
     }
     }


     if (o.history && support.history)
     window.history.replaceState({
     setting: setting,
     selector: this.selector
     }, '', o.id ? getHistoryURL(o.id) : "");
     }
     }
     } else {
     core.throw("Development error: The container to load the page can only be a single.");
     if (o.completed && $.type(o.completed) == "function")
     o.completed();
     }
     return this;
     };

     /!**
     * 卸载一个模块页面
     * @param id 模块ID
     * @param autoChange 是否自动显示其它模块，默认不显示
     * @returns {$}
     *!/
     $.fn.unloadPage = function (id, autoChange) {
     var t = this.find("#" + id), cpid = this.data("currentPageId");
     if (t.length > 0) {
     t.remove();
     if (autoChange === true && id === cpid) {
     var np = this.find("iframe[id]:first");
     if (np.length > 0) {
     this.loadPage({
     id: np.attr("id")
     });
     }
     }
     }
     return this;
     };

     $.fn.loadPage.defaultSetting = {
     id: null,
     url: null,
     duration: 200,
     easing: "linear",
     completed: null,
     loader: null,
     history: false
     };*/

    $.fn.seElement = function (cls) {
        this.removeAttr("style");
        this.each(function (i, dom) {
            $.each(dom.classList, function (i, c) {
                if (c.indexOf("-se-") >= 0)
                    dom.classList.remove(c);
            });
            dom.classList.add(cls);
        });
    };

    /*
     _core.showPage = function (pageId) {
     if (pageId) {
     var page = $("#" + pageId);
     if (page.length > 0) {
     var o = page.data("openSetting");
     if (o) {
     o.container.loadPage(o.setting, o.openTrans, o.closeTrans);
     page.removeData("openSetting");
     } else {
     page.seElement("-se-in-slide-right");
     var dom = page.get(0);
     if (dom && dom.contentWindow) {
     var mpath = dom.contentWindow.$("#require").attr("data-module");
     if (mpath) eval("dom.contentWindow." + mpath + ".init()");

     if (dom.contentWindow.core && dom.contentWindow.core.updateOffset)
     setTimeout(dom.contentWindow.core.updateOffset, 1000);
     }
     }
     }
     }
     };*/


    $.fn.shortMessage = function (settings, duration) {
        if (settings) {
            if ($.type(settings) === "string")
                settings = {
                    message: settings
                };

            if ($.isPlainObject(settings)) {
                var o = $.extend(true, {}, $.fn.shortMessage.defaultSettings, settings);
                if (!isNaN(duration)) o.duration = duration;
                if (o.duration > 0 && o.duration < 1000) a.duration = 1000;
                this.each(function (i, dom) {
                    var t = $(dom), box = t.children(".shortMessage");
                    if (box.length == 0) {
                        box = $("<div class='shortMessage'><p>{0}</p></div>".format(o.message));
                        t.append(box);
                        box.css({"translateY": 200, opacity: 0}).transit({y: 0, opacity: 1}, 200);
                    } else {
                        box.children("p").html(o.message);
                    }

                    var si = t.data("si");
                    if (si) clearTimeout(si);

                    function closeShortMessage() {
                        box.stop(true).transit({y: -200, opacity: 0}, 200, function () {
                            box.remove();
                        });
                    }

                    if (o.duration > 0) {
                        si = setTimeout(closeShortMessage, o.duration);
                        t.data("si", si);
                    }
                });
            }
        }
    };

    $.fn.shortMessage.defaultSettings = {
        top: 0,
        duration: 3000,
        message: ""
    };


    var _horizontalVisualScroll = $("<div class='horizontalVirtualScroll'><div class='thumb horizontalVirtualScrollThumb' draggable='true'></div></div>"),
        _verticalVisualScroll = $("<div class='verticalVisualScroll'><div class='thumb verticalVisualScrollThumb' draggable='true'></div></div>"),
        _verticalVisualScrollThumb = _verticalVisualScroll.children(".thumb"),
        _horizontalVisualScrollThumb = _horizontalVisualScroll.children(".thumb"),
        _visualDragImage = $("<div style='position: absolute; top: -100px; left: -100px; width: 10px; height: 10px;'></div>"),
        _currentLinkScrollId = null, _currentLinkScrollEl = null,
        _currentLinkScrollSetting = {
            horizontal: false,
            vertical: false,
            marginLeft: 0,
            marginTop: 0,
            marginRight: 0,
            marginBottom: 0,
            scrollMaxLeft: 0,
            scrollMaxTop: 0,
            trackWidth: 0,
            trackHeight: 0,
            thumbWidth: 0,
            thumbHeight: 0,
            width: 0,
            height: 0,
            scrollWidth: 0,
            scrollHeight: 0,
            residualWidth: 0,
            residualHeight: 0,
            scrollToTop: 0,
            scrollToLeft: 0,
            animate: true,
            translateLeft: 0,
            translateRight: 0,
            translateTop: 0,
            translateBottom: 0,
            originalX: 0,
            originalY: 0,
            originalThumbX: 0,
            originalThumbY: 0
        };

    _verticalVisualScroll.click(onVerticalVirtualScrollTrackClicked);
    _verticalVisualScrollThumb.bind({
        dragstart: onVirtualScrollThumbDragStart,
        dragend: onVirtualScrollThumbDragEnd
    });
    _horizontalVisualScroll.click(onHorizontalVirtualScrollTrackClicked);
    _horizontalVisualScrollThumb.bind({
        dragstart: onVirtualScrollThumbDragStart,
        dragend: onVirtualScrollThumbDragEnd
    });

    $(document.body).append(_visualDragImage);

    $.fn.updateScroll = function () {
        this.off("mouseover", "[data-scroll]").off("mouseleave", "[data-scroll]").off("mousewheel", "[data-scroll]").off("click", "[data-scroll]").off("keyup", "[data-scroll]");
        this.on("mouseover", "[data-scroll]", onVirtualScrollTargetMouseOver).on("mouseleave", "[data-scroll]", onVirtualScrollTargetMouseLeave);
        this.on("mousewheel", "[data-scroll]", onVirtualScrollTargetMouseWheel).on("click", "[data-scroll]", updateVirtualScrollSetting);
        this.on("keyup", "[data-scroll]", updateVirtualScrollSetting);
    };

    function updateVirtualScrollSetting() {
        if (_currentLinkScrollEl) {
            var dir = _currentLinkScrollEl.attr("data-scroll").toLowerCase(), position = _currentLinkScrollEl.attr("data-scroll-position"), clip = _currentLinkScrollEl.get(0).getBoundingClientRect();

            var _dst = false, e = _currentLinkScrollEl;
            while (!_dst && !e.is("body")) {
                _dst = e.attr("data-scroll-transform") === "true";
                if (_dst) {
                    e.css("transform", "translateZ(0)");
                    clip = {
                        top: 0,
                        left: 0,
                        right: _currentLinkScrollEl.width(),
                        bottom: _currentLinkScrollEl.height()
                    };
                }
                e = e.parent();
            }

            position = position ? position.toLowerCase() : "";
            _currentLinkScrollSetting.animate = _currentLinkScrollEl.attr("data-scroll-animate") !== "false";
            _currentLinkScrollSetting.horizontal = false;
            _currentLinkScrollSetting.vertical = false;

            var translate = _currentLinkScrollEl.attr("data-scroll-translate"), translates = [0];
            if (translate) {
                try {
                    eval("translates = new Array(" + translate + ")");
                } catch (e) {
                }
            }
            var translateLength = translates.length;
            _currentLinkScrollSetting.translateTop = translates[0];
            _currentLinkScrollSetting.translateRight = translates[1 % translateLength];
            _currentLinkScrollSetting.translateBottom = translates[2 % translateLength];
            _currentLinkScrollSetting.translateLeft = translates[3 % translateLength];

            if (dir.indexOf("x") > -1) {
                _currentLinkScrollSetting.width = _currentLinkScrollEl.outerWidth() - _currentLinkScrollSetting.translateLeft - _currentLinkScrollSetting.translateRight;
                var _w = _currentLinkScrollEl.get(0).scrollWidth, _cw = Number(_currentLinkScrollEl.attr("data-scroll-offsetWidth"));
                if (!isNaN(_cw)) _w = _cw;
                _currentLinkScrollSetting.scrollWidth = _w - _currentLinkScrollSetting.translateLeft - _currentLinkScrollSetting.translateRight;
                if (_currentLinkScrollSetting.scrollWidth > _currentLinkScrollSetting.width) {
                    _currentLinkScrollSetting.scrollMaxLeft = _currentLinkScrollSetting.scrollWidth - _currentLinkScrollSetting.width;
                    _currentLinkScrollEl.css("transform", "").append(_horizontalVisualScroll);
                    _currentLinkScrollSetting.horizontal = true;
                }
            }
            if (dir.indexOf("y") > -1) {
                _currentLinkScrollSetting.height = _currentLinkScrollEl.outerHeight() - _currentLinkScrollSetting.translateTop - _currentLinkScrollSetting.translateBottom;
                var _h = _currentLinkScrollEl.get(0).scrollHeight, _ch = Number(_currentLinkScrollEl.attr("data-scroll-offsetHeight"));
                if (!isNaN(_ch)) _h = _ch;
                _currentLinkScrollSetting.scrollHeight = _h - _currentLinkScrollSetting.translateTop - _currentLinkScrollSetting.translateBottom;
                if (_currentLinkScrollSetting.scrollHeight > _currentLinkScrollSetting.height) {
                    _currentLinkScrollSetting.scrollMaxTop = _currentLinkScrollSetting.scrollHeight - _currentLinkScrollSetting.height;
                    _currentLinkScrollEl.css("transform", "").append(_verticalVisualScroll);
                    _currentLinkScrollSetting.vertical = true;
                }
            }

            _currentLinkScrollSetting.scrollToTop = Number(_currentLinkScrollEl.attr("data-scroll-top")) || _currentLinkScrollEl.scrollTop();
            _currentLinkScrollSetting.scrollToLeft = Number(_currentLinkScrollEl.attr("data-scroll-left")) || _currentLinkScrollEl.scrollLeft();

            if (_currentLinkScrollSetting.horizontal) {
                if (_currentLinkScrollSetting.vertical) _currentLinkScrollSetting.width -= _verticalVisualScroll.width();
                _horizontalVisualScroll.css({
                    display: "block",
                    position: "fixed",
                    top: position.indexOf("top") > -1 ? (clip.top + _currentLinkScrollSetting.translateTop) : (clip.bottom - _horizontalVisualScroll.height() - _currentLinkScrollSetting.translateBottom),
                    left: clip.left + (position.indexOf("left") > -1 ? _verticalVisualScroll.width() : 0) + _currentLinkScrollSetting.translateLeft,
                    width: _currentLinkScrollSetting.width
                }).stop(true).animate({opacity: 1}, 200);
                _currentLinkScrollSetting.marginLeft = parseInt(_horizontalVisualScrollThumb.css("marginLeft")) + parseInt(_horizontalVisualScroll.css("paddingLeft"));
                _currentLinkScrollSetting.marginRight = parseInt(_horizontalVisualScrollThumb.css("marginRight")) + parseInt(_horizontalVisualScroll.css("paddingRight"));
                _currentLinkScrollSetting.trackWidth = Math.floor(_currentLinkScrollSetting.width - _currentLinkScrollSetting.marginLeft - _currentLinkScrollSetting.marginRight);
                _currentLinkScrollSetting.thumbWidth = Math.floor(_currentLinkScrollSetting.trackWidth * (_currentLinkScrollSetting.width / _currentLinkScrollSetting.scrollWidth));
                _currentLinkScrollSetting.residualWidth = _currentLinkScrollSetting.trackWidth - _currentLinkScrollSetting.thumbWidth;
                _horizontalVisualScrollThumb.width(_currentLinkScrollSetting.thumbWidth);
                var to = _currentLinkScrollSetting.residualWidth * (_currentLinkScrollSetting.scrollToLeft / _currentLinkScrollSetting.scrollMaxLeft);
                _horizontalVisualScrollThumb.css("x", to);
            } else
                _horizontalVisualScroll.detach();

            if (_currentLinkScrollSetting.vertical) {
                if (_currentLinkScrollSetting.horizontal) _currentLinkScrollSetting.height -= _horizontalVisualScroll.height();
                _verticalVisualScroll.css({
                    display: "block",
                    position: "fixed",
                    top: clip.top + (position.indexOf("top") > -1 ? _horizontalVisualScroll.height() : 0) + _currentLinkScrollSetting.translateTop,
                    left: position.indexOf("left") > -1 ? (clip.left + _currentLinkScrollSetting.translateLeft) : ( clip.right - _verticalVisualScroll.width() - _currentLinkScrollSetting.translateRight),
                    height: _currentLinkScrollSetting.height
                }).stop(true).animate({opacity: 1}, 200);
                _currentLinkScrollSetting.marginTop = parseInt(_verticalVisualScrollThumb.css("marginTop")) + parseInt(_verticalVisualScroll.css("paddingTop"));
                _currentLinkScrollSetting.marginBottom = parseInt(_verticalVisualScrollThumb.css("marginBottom")) + parseInt(_verticalVisualScroll.css("paddingBottom"));
                _currentLinkScrollSetting.trackHeight = Math.floor(_currentLinkScrollSetting.height - _currentLinkScrollSetting.marginTop - _currentLinkScrollSetting.marginBottom);
                _currentLinkScrollSetting.thumbHeight = Math.floor(_currentLinkScrollSetting.trackHeight * (_currentLinkScrollSetting.height / _currentLinkScrollSetting.scrollHeight));
                _currentLinkScrollSetting.residualHeight = _currentLinkScrollSetting.trackHeight - _currentLinkScrollSetting.thumbHeight;
                _verticalVisualScrollThumb.height(_currentLinkScrollSetting.thumbHeight);
                var to = _currentLinkScrollSetting.residualHeight * (_currentLinkScrollSetting.scrollToTop / _currentLinkScrollSetting.scrollMaxTop);
                _verticalVisualScrollThumb.css("y", to);
            } else
                _verticalVisualScroll.detach();
        }
    }

    _core.updateVirtualScrollSetting = updateVirtualScrollSetting;

    function onVirtualScrollThumbDragStart(e) {
        var t = $(e.currentTarget), ish = t.hasClass("horizontalVirtualScrollThumb");
        _currentLinkScrollSetting.originalX = ish ? e.originalEvent.screenX : -1;
        _currentLinkScrollSetting.originalThumbX = ish ? (parseInt(t.css("x")) || 0) : 0;
        _currentLinkScrollSetting.originalY = ish ? -1 : e.originalEvent.screenY;
        _currentLinkScrollSetting.originalThumbY = ish ? 0 : (parseInt(t.css("y")) || 0);
        e.originalEvent.dataTransfer.dropEffect = "move";
        e.originalEvent.dataTransfer.setDragImage(_visualDragImage.get(0), e.originalEvent.layerX, e.originalEvent.layerY);
        _core.addDocumentEventHandler(true, true, "dragover", onVirtualScrollDragOver);
    }

    function onVirtualScrollThumbDragEnd(e) {
        _core.removeDocumentEventHandler(true, true, "dragover", onVirtualScrollDragOver);
        return false;
    }

    function onVirtualScrollDragOver(e) {
        var to = 0;
        if (_currentLinkScrollSetting.originalX > -1) {
            to = _currentLinkScrollSetting.originalThumbX + (e.originalEvent.screenX - _currentLinkScrollSetting.originalX);
            horizontalVirtualScrollTo(to, false);
        } else if (_currentLinkScrollSetting.originalY > -1) {
            to = _currentLinkScrollSetting.originalThumbY + ( e.originalEvent.screenY - _currentLinkScrollSetting.originalY);
            verticalVirtualScrollTo(to, false);
        }
        return false;
    }

    function onVirtualScrollTargetMouseOver(e) {
        var t = $(e.currentTarget), _sid = t.attr("data-scrollid");
        if (!_sid) {
            _sid = core.uuid.get();
            t.attr("data-scrollid", _sid);
            t.css("overflow", "hidden");
        }
        if (!_currentLinkScrollId || _currentLinkScrollId != _sid) {
            _currentLinkScrollId = _sid;
            _currentLinkScrollEl = t;
            updateVirtualScrollSetting();
        }
        return false;
    }

    function onVirtualScrollTargetMouseWheel(e, delta) {
        if (_currentLinkScrollEl) {
            if (!e.shiftKey && _currentLinkScrollSetting.vertical) {
                var oldst = _currentLinkScrollSetting.scrollToTop;
                _currentLinkScrollSetting.scrollToTop -= delta * 200;
                if (_currentLinkScrollSetting.scrollToTop < 0) _currentLinkScrollSetting.scrollToTop = 0;
                if (_currentLinkScrollSetting.scrollToTop > _currentLinkScrollSetting.scrollMaxTop) _currentLinkScrollSetting.scrollToTop = _currentLinkScrollSetting.scrollMaxTop;
                if (_currentLinkScrollSetting.vertical) {
                    var thumbto = Math.floor(_currentLinkScrollSetting.scrollToTop / _currentLinkScrollSetting.scrollMaxTop * _currentLinkScrollSetting.residualHeight);
                    if (_currentLinkScrollSetting.animate)
                        _verticalVisualScrollThumb.stop(true).transit({y: thumbto}, Math.abs(oldst - _currentLinkScrollSetting.scrollToTop), "linear");
                    else
                        _verticalVisualScrollThumb.css({y: thumbto});
                }

                verticalScrollTo();
                return false;
            } else if (_currentLinkScrollSetting.horizontal) {
                var oldst = _currentLinkScrollSetting.scrollToLeft;
                _currentLinkScrollSetting.scrollToLeft -= delta * 200;
                if (_currentLinkScrollSetting.scrollToLeft < 0) _currentLinkScrollSetting.scrollToLeft = 0;
                if (_currentLinkScrollSetting.scrollToLeft > _currentLinkScrollSetting.scrollMaxLeft) _currentLinkScrollSetting.scrollToLeft = _currentLinkScrollSetting.scrollMaxLeft;
                if (_currentLinkScrollSetting.horizontal) {
                    var thumbto = Math.floor(_currentLinkScrollSetting.scrollToLeft / _currentLinkScrollSetting.scrollMaxLeft * _currentLinkScrollSetting.residualWidth);
                    if (_currentLinkScrollSetting.animate)
                        _horizontalVisualScrollThumb.stop(true).transit({x: thumbto}, Math.abs(oldst - _currentLinkScrollSetting.scrollToLeft), "linear");
                    else
                        _horizontalVisualScrollThumb.css({x: thumbto});
                }

                horizontalScrollTo();
                return false;
            }
        }
    }

    function onVirtualScrollTargetMouseLeave(e) {
        _currentLinkScrollEl = null;
        _currentLinkScrollId = null;
        _horizontalVisualScroll.stop(true).animate({
            opacity: 0
        }, 200, function () {
            _horizontalVisualScroll.detach();
        });
        _verticalVisualScroll.stop(true).animate({
            opacity: 0
        }, 200, function () {
            _verticalVisualScroll.detach();
        });
    }

    function onVerticalVirtualScrollTrackClicked(e) {
        if (_currentLinkScrollId) {
            var thumbTo = 0;
            if (e.target.classList.contains("thumb"))
                thumbTo = e.originalEvent.offsetY + parseInt($(e.target).css("y")) - _currentLinkScrollSetting.thumbHeight / 2;
            else
                thumbTo = e.originalEvent.offsetY - _currentLinkScrollSetting.marginTop - _currentLinkScrollSetting.thumbHeight / 2;
            verticalVirtualScrollTo(thumbTo);
            return false;
        }
    }

    function verticalVirtualScrollTo(thumbTo, _animate) {
        _animate = _animate !== false;
        if (thumbTo < 0) thumbTo = 0;
        if (thumbTo > _currentLinkScrollSetting.residualHeight) thumbTo = _currentLinkScrollSetting.residualHeight;
        _currentLinkScrollSetting.scrollToTop = _currentLinkScrollSetting.scrollMaxTop * (thumbTo / _currentLinkScrollSetting.residualHeight);
        if (_currentLinkScrollSetting.animate && _animate)
            _verticalVisualScrollThumb.stop(true).transit({y: thumbTo}, 200, "linear");
        else
            _verticalVisualScrollThumb.css("y", thumbTo);
        verticalScrollTo(_animate);
    }

    function verticalScrollTo(_animate) {
        _animate = _animate !== false;
        if (_currentLinkScrollEl) {
            var setting = {
                vertical: true,
                handled: false,
                scrollTop: _currentLinkScrollSetting.scrollToTop
            };
            _currentLinkScrollEl.trigger("scroll", setting);

            if (!setting.handled) {
                if (_currentLinkScrollSetting.animate && _animate)
                    _currentLinkScrollEl.stop(true).animate({scrollTop: _currentLinkScrollSetting.scrollToTop}, 200, "linear");
                else
                    _currentLinkScrollEl.scrollTop(_currentLinkScrollSetting.scrollToTop);
            } else {
                _currentLinkScrollEl.attr("data-scroll-top", _currentLinkScrollSetting.scrollToTop);
            }
        }
    }


    function onHorizontalVirtualScrollTrackClicked(e) {
        if (_currentLinkScrollId) {
            var thumbTo = 0;
            if (e.target.classList.contains("thumb"))
                thumbTo = e.originalEvent.offsetX + parseInt($(e.target).css("x")) - _currentLinkScrollSetting.thumbWidth / 2;
            else
                thumbTo = e.originalEvent.offsetX - _currentLinkScrollSetting.marginLeft - _currentLinkScrollSetting.thumbWidth / 2;
            horizontalVirtualScrollTo(thumbTo);
            return false;
        }
    }

    function horizontalVirtualScrollTo(thumbTo, _animate) {
        _animate = _animate !== false;
        if (thumbTo < 0) thumbTo = 0;
        if (thumbTo > _currentLinkScrollSetting.residualWidth) thumbTo = _currentLinkScrollSetting.residualWidth;
        _currentLinkScrollSetting.scrollToLeft = _currentLinkScrollSetting.scrollMaxLeft * (thumbTo / _currentLinkScrollSetting.residualWidth);
        if (_currentLinkScrollSetting.animate && _animate)
            _horizontalVisualScrollThumb.stop(true).transit({x: thumbTo}, 200, "linear");
        else
            _horizontalVisualScrollThumb.css("x", thumbTo);
        horizontalScrollTo(_animate);
    }

    function horizontalScrollTo(_animate) {
        _animate = _animate !== false;
        if (_currentLinkScrollEl) {
            var setting = {
                vertical: false,
                handled: false,
                scrollLeft: _currentLinkScrollSetting.scrollToLeft
            };
            _currentLinkScrollEl.trigger("scroll", setting);

            if (!setting.handled) {
                if (_currentLinkScrollSetting.animate && _animate)
                    _currentLinkScrollEl.stop(true).animate({scrollLeft: _currentLinkScrollSetting.scrollToLeft}, 200, "linear");
                else
                    _currentLinkScrollEl.scrollLeft(_currentLinkScrollSetting.scrollToLeft);
            } else {
                _currentLinkScrollEl.attr("data-scroll-left", _currentLinkScrollSetting.scrollToLeft);
            }
        }
    }


    /**
     * 使用form方式请求
     * @param url
     * @param data
     */
    _core.post = function (url, data) {
        if (url && $.isPlainObject(data)) {
            var form = document.createElementNS("http://www.w3.org/1999/xhtml", "form");
            form.setAttribute("action", url);
            form.setAttribute("method", "post");
            document.body.appendChild(form);

            $.each(data, function (key, d) {
                var _c = document.createElementNS("http://www.w3.org/1999/xhtml", "input");
                _c.setAttribute("type", "hidden");
                _c.setAttribute("name", key);
                _c.setAttribute("value", d);
                form.appendChild(_c);
            });

            form.submit();
            document.body.removeChild(form);
        }
    };

    //-----------------------------------messager-----------------------------------------
    function onMessageCommandItemClicked(e) {
        var t = $(e.currentTarget);
        var cmd = t.parent().data("events"), el = t.parent().parent().parent(), _key = t.val(), event = null, handled = true;
        if ($.type(cmd) == "array")
            event = cmd[Number(_key)].event;
        else
            event = cmd[_key].event;

        if (event)
            handled = event(e, el) !== false;

        if (handled)
            _core.message.close(el);
    }

    _core.message = {
        defaultSetting: {
            icon: "ico_error",
            title: "Message",
            content: "No message.",
            command: null
        },
        confirm: function (title, content, submit) {
            _core.message.open({
                icon: "ico_confirm",
                title: title,
                content: content,
                command: {
                    submit: {
                        attr: {
                            "class": "wfico ico_submit",
                            "data-lang": "commands.submit"
                        },
                        event: submit
                    },
                    cancel: {
                        attr: {
                            "class": "wfico ico_cancel",
                            "data-lang": "commands.cancel"
                        }
                    }
                }
            });
        },
        open: function (settig) {
            var _setting = $.extend(true, {}, _core.message.defaultSetting, settig);
            var _el = $("<div class='messageBox'></div>");
            var _box = $("<div class='box'></div>");
            var _title = $("<div class='title'></div>").html(_setting.title);
            if (_setting.icon) _title.addClass("wfico").addClass(_setting.icon);
            var _content = $("<div class='content'></div>").html(_setting.content);

            _el.append(_box);
            _box.append(_title).append(_content);

            if (_setting.command) {
                var _command = $("<div class='commands'></div>").data("events", _setting.command);
                _box.append(_command);
                try {
                    for (var key in _setting.command) {
                        var btn = $("<button></button>").val(key);
                        if (_setting.command[key].attr) btn.attr(_setting.command[key].attr);
                        _command.append(btn);
                    }
                    _command.off().on("click", "button", onMessageCommandItemClicked);
                } catch (e) {

                }
            }

            $(document.body).append(_el);
            _el.addClass("openedMessageBox");
            _core.language.install(_el);

            return _el;
        },
        close: function (el) {
            if (el) {
                el.removeClass("openedMessageBox");
                setTimeout(function () {
                    el.remove();
                }, 200);
            }
        }
    };

    _core.throw = function (message, otherSetting) {
        var setting = {
            icon: "ico_error",
            title: "<span data-lang='message.error.caption'></span>",
            content: message,
            command: {
                "submit": {
                    attr: {
                        "data-lang": "commands.ok",
                        "class": "wfico ico_submit"
                    }
                }
            }
        };
        if (otherSetting) $.extend(true, setting, otherSetting);
        _core.message.open(setting);
    };


    /*
     //--------------------------------------broadcast-----------------------------------------

     var _broadcastListenEvent = {};

     _core.broadcast = {
     //侦听广播
     listen: function (key, fn) {
     var listening = false;
     if ($.type(key) == "string" && fn) {
     key = $.trim(key);
     if (key) {
     var fntype = $.type(fn);
     if (fntype == "function") {
     _broadcastListenEvent[key] = fn;
     listening = true;
     }
     }
     }

     if (!listening) core.throw("Javascript: Listening to broadcast failure.");
     },
     //取消侦听
     cancelListen: function (key) {
     if ($.type(key) == "string") {
     key = $.trim(key);
     if (key && key in _broadcastListenEvent)
     delete _broadcastListenEvent[key];
     }
     },
     //发送广播
     send: function () {
     if (arguments.length > 0) {
     var key = arguments[0];
     if ($.type(key) == "string") {
     key = $.trim(key);
     if (key && key in _broadcastListenEvent) {
     var fn = _broadcastListenEvent[key];
     if ($.type(fn) == "function")
     fn.apply(this, arguments);
     }

     var _arg = arguments;

     $("iframe").each(function (i, ifr) {
     if (ifr && ifr.contentWindow && ifr.contentWindow.core && ifr.contentWindow.core.broadcast)
     ifr.contentWindow.core.broadcast.send.apply(this, _arg);
     });
     }
     }
     }
     };*/


    _core.uuid = {
        /**
         * 创建一个新的UUID
         * @returns {string}
         */
        get: function () {
            var d = new Date().getTime();
            var _uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
            });
            return _uuid;
        },
        /**
         * 创建一个短格式的UUID
         * @returns {XML|void|string}
         */
        short: function () {
            return uuid.create().replace(/\-/ig, "");
        }
    };


    //-----------------------------------------tooltip------------------------------------------

    function checkTooltipPosition(x, y) {
        var pos = {"left": x + _core.tooltip.shift.left, "top": y + _core.tooltip.shift.top + 30};
        var _tw = _core.tooltip.el.outerWidth();
        var _th = _core.tooltip.el.outerHeight();
        if (pos.left + _tw > document.body.scrollWidth - 10)
            pos.left = _core.windowSize.width - 10 - _tw;
        if (pos.top + _th > document.body.scrollHeight - 10)
            pos.top -= (_th + 40);
        return pos;
    }

    _core.tooltip = {
        init: function () {
            if (!_core.tooltip.el) {
                var _commonHTML = '<div id="fixedLoader"><ul><li></li><li></li><li></li><li></li><li></li><li></li></ul><span id="fixedLoaderMsg">Now loading...</span></div><div id="tooltiper">&nbsp;</div>';
                $(document.body).append(_commonHTML);
                _core.tooltip.el = $("#tooltiper");
            }
        },
        //显示提示内容的元素
        el: null,
        //位移
        shift: {
            left: 0,
            top: 0
        },
        //当前显示提示的目标
        target: null,
        //打开提示框
        open: function (e, msg) {
            if (!_core.tooltip.el) return false;
            _core.tooltip.target = $(e.currentTarget);
            _core.tooltip.el.html(msg);
            core.language.install(_core.tooltip.el);
            _core.tooltip.el.css(checkTooltipPosition(e.pageX, e.pageY)).stop(true, true).fadeIn("fast");
            _core.tooltip.target.unbind("mousemove.tooltip").bind("mousemove.tooltip", _core.tooltip.moving);
        },
        //移动提示框
        moving: function (e) {
            if (!_core.tooltip.el) return false;
            _core.tooltip.el.css(checkTooltipPosition(e.pageX, e.pageY));
        },
        //关闭提示框
        close: function (e) {
            if (_core.tooltip.target)
                _core.tooltip.target.unbind("mousemove.tooltip");
            if (_core.tooltip.el)
                _core.tooltip.el.stop(true, true).fadeOut("fast");
        }
    };

    _core.tooltip.init();


    //-------------------------------------language-------------------------------------

    var _language_changeEvents = [];

    _core.language = {
        "install": function (container) {
            if (languagePackage) {
                log("install language...");

                if (!container) container = $(document.body);

                //元素内容
                container.find("[data-lang]").each(function (index, dom) {
                    var t = $(this);
                    var key = t.attr("data-lang");
                    t.html(core.language.get(key));
                });
                //元素提示内容
                container.find("[data-lang-alt]").each(function (index, dom) {
                    var t = $(this);
                    var key = t.attr("data-lang-alt");
                    t.attr("title", "").data("tooltip", core.language.get(key));
                });
                //表单占位内容
                container.find("[data-lang-holder]").each(function (index, dom) {
                    var t = $(this);
                    var key = t.attr("data-lang-holder");
                    t.attr("placeholder", core.language.get(key));
                });
                //表单名称
                container.find("[data-lang-name]").each(function (index, dom) {
                    var t = $(this);
                    var key = t.attr("data-lang-name");
                    t.attr("data-input-name", core.language.get(key));
                });

                log("install language completed.");
            }
        },
        "get": function (key) {
            try {
                var keys = key.split("+");
                keys = $.map(keys, function (k) {
                    return eval("languagePackage." + k) || k;
                });
                return keys.join("");
            } catch (m) {
                return key;
            }
        },
        change: function (fn) {
            if ($.type(fn) == "function")
                _language_changeEvents.push(fn);
        }
    };

    /**
     * 更换语言包
     */
    _core.changeLanguagePackage = function () {
        _core.language.install();
        $("iframe").each(function (index, ifr) {
            try {
                if (ifr.contentWindow && ifr.contentWindow.core.changeLanguagePackage)
                    ifr.contentWindow.core.changeLanguagePackage();
            } catch (e) {
            }
        });
    };

    _core.addDocumentEventHandler = function (iscallparent, iscallchildren, eventName, handler) {
        $(document).unbind(eventName).bind(eventName, handler);

        if (iscallparent === true) {
            if (parent != self)
                parent.core.addDocumentEventHandler(true, false, eventName, handler);
        }

        if (iscallchildren === true) {
            $("iframe").each(function (i, d) {
                if (d.contentWindow.core && d.contentWindow.core.addDocumentEventHandler)
                    d.contentWindow.core.addDocumentEventHandler(false, true, eventName, handler);
            });
        }
    };

    _core.removeDocumentEventHandler = function (iscallparent, iscallchildren, eventName, handler) {
        $(document).unbind(eventName);

        if (iscallparent === true) {
            if (parent != self)
                parent.core.removeDocumentEventHandler(true, false, eventName, handler);
        }

        if (iscallchildren === true) {
            $("iframe").each(function (i, d) {
                if (d.contentWindow.core && d.contentWindow.core.removeDocumentEventHandler)
                    d.contentWindow.core.removeDocumentEventHandler(false, true, eventName, handler);
            });
        }
    };

    _core.windowSize = {
        width: 0,
        height: 0
    };

    /**
     * 当窗口大小发生改变时
     * @param e
     */
    function windowSizeChanged(e) {
        _core.windowSize.width = $(window).width();
        _core.windowSize.height = $(window).height();
    }

    windowSizeChanged();
    __addEventListeners();

    window.core = _core;

    return _core;
});