define("popup", function () {
    var module = {}, stopPropagation = false, popupSearchItems = {}, currentPopupSearchItems = null, specialKeyCodes = [27, 38, 40, 13];

    var _popupGlobal = {
        /**
         * 当前打开的Popup
         */
        current: null,
        /**
         * 打开的Popup的事件触发对象
         */
        source: null,
        /**
         * 当前打开的Popup的类型
         */
        currentType: null,
        /**
         * 当前对象原始信息
         */
        currentData: null,
        /**
         * 是否正在搜索中
         */
        searching: false,
        searcher: $("<div class='searchBar'><input type='text' class='search' /></div>"),
        searchingSelectedValue: null,
        /**
         * 移除全局点击关闭Popup事件
         */
        removePopupCloseEventListeners: function (el, eventName, fn) {
            if (!el) el = document.body;
            $(el).unbind(eventName, fn);

            var iframes = el.getElementsByTagName("iframe");
            if (iframes && iframes.length > 0) {
                $.each(iframes, function (i, dom) {
                    _popupGlobal.removePopupCloseEventListeners(dom.contentWindow.document.body, eventName, fn);
                });
            }
        },
        /**
         * 添加全局点击关闭Popup事件
         */
        addPopupCloseEventListeners: function (el, eventName, fn) {
            if (!el) el = document.body;
            $(el).unbind(eventName, fn).bind(eventName, fn);

            var iframes = el.getElementsByTagName("iframe");
            if (iframes && iframes.length > 0) {
                $.each(iframes, function (i, dom) {
                    _popupGlobal.addPopupCloseEventListeners(dom.contentWindow.document.body, eventName, fn);
                });
            }
        }
    };

    var _defaultPopupSetting = {
        source: null, //事件来源对象
        id: null, //弹出层ID
        alwaysOpen: false, //是否一直显示，直到再次点击打开者
        /*opening: null, //打开前触发事件，提供参数：弹出层对象，事件来源对象的值
         closed: null, //关闭后触发事件，提供参数：弹出层对象*/
        popupSetting: null //弹出层中的控件的设置
    };

    /**
     * 打开Popup
     * @param setting
     */
    function openPopup(setting) {
        try {
            if (setting) {
                var _setting = $.extend(true, {}, _defaultPopupSetting, setting);
                if (_setting.id) {
                    if (_setting.source && _setting.source.length > 0) {
                        closePopup();
                        var _pop = $("#" + _setting.id);
                        if (_pop.length > 0) {
                            _pop.data("setting", _setting);
                            var _val = _setting.source.cval();

                            _pop.triggerHandler("opening", _setting.source);

                            /*if (_setting.opening && $.type(_setting.opening) == "function")
                             _setting.opening(_setting.source, _pop, _val);*/

                            _popupGlobal.currentType = _pop.attr("data-type");

                            _popupGlobal.currentData = {
                                val: _val,
                                html: _setting.source.html()
                            };
                            _popupGlobal.searchingSelectedValue = _val;

                            _popupGlobal.current = _pop;
                            _popupGlobal.source = _setting.source;
                            _popupGlobal.current.addClass("openedPopup");
                            _setting.source.addClass("opened");

                            if (_popupGlobal.currentType) {
                                switch (_pop.attr("data-type").toLowerCase()) {
                                    case "selector":
                                        _pop.find("button").removeClass("selected");
                                        _pop.find("button[value=\"{0}\"]".format(_val)).addClass("selected");

                                        if (_pop.attr("data-searchable") == "true") {
                                            if (!_popupGlobal.searching) {
                                                var id = _pop.attr("id");
                                                if (id) {
                                                    if (id in popupSearchItems) {
                                                        currentPopupSearchItems = popupSearchItems[id];
                                                    } else {
                                                        currentPopupSearchItems = [];
                                                        _pop.find("button").each(function (i, dom) {
                                                            var t = $(dom), v = t.cval(), x = t.text();
                                                            if (v) {
                                                                currentPopupSearchItems.push({
                                                                    el: t,
                                                                    text: x.toLowerCase(),
                                                                    first: top.library.pinyin.getCamelChars(x).toLowerCase(),
                                                                    letter: top.library.pinyin.getFullChars(x).toLowerCase()
                                                                });
                                                            }
                                                        });
                                                        popupSearchItems[id] = currentPopupSearchItems;
                                                    }
                                                    _popupGlobal.searching = true;
                                                    _pop.prepend(_popupGlobal.searcher);
                                                    _popupGlobal.searcher.children("input").val("").focus();
                                                }
                                            }
                                        }
                                        updateVirtualScrollSetting();
                                        break;
                                    case "datepicker":
                                        var dt = _pop.data("dt"), d = _setting.source.cval(), fm = _setting.source.attr("data-format");
                                        if (dt) {
                                            if (fm && fm in config.formats) fm = config.formats["s_" + fm.replace("s_", "")];
                                            fm = fm || config.formats.s_date;
                                            var timepicker = _setting.source.attr("data-timepicker") === "true";
                                            var dp_options = {
                                                value: d,
                                                format: fm,
                                                formatDate: config.formats.s_date,
                                                formatTime: config.formats.s_time,
                                                step: Number(_setting.source.attr("data-step")) || 60,
                                                minDate: _setting.source.attr("data-mindate") || false,
                                                maxDate: _setting.source.attr("data-maxdate") || false,
                                                minTime: _setting.source.attr("data-mintime") || false,
                                                maxTime: _setting.source.attr("data-maxtime") || false,
                                                lang: config.language.toLowerCase().split("-")[0],
                                                timepicker: timepicker,
                                                onSelectDate: null,
                                                onSelectTime: null
                                            };
                                            if (timepicker)
                                                dp_options.onSelectTime = onDatePickerValueChanged;
                                            else
                                                dp_options.onSelectDate = onDatePickerValueChanged;
                                            if (_setting.source.data("_expands"))
                                                $.extend(true, dp_options, _setting.source.data("_expands"));
                                            dt.setOptions(dp_options);
                                        }
                                        break;
                                    case "colorpicker":
                                        d = _setting.source.cval() || "#ffffff";
                                        if (_pop.get(0).farbtastic)
                                            _pop.get(0).farbtastic.setColor(d);
                                        break;
                                    case "citypicker":
                                        _popupGlobal.currentData = null;
                                        d = _setting.source.cval();
                                        if (top.citypicker) {
                                            top.citypicker.navigateTo(d, updateVirtualScrollSetting);
                                        }
                                        break;
                                    case "tree":
                                        break;
                                    case "datagrid":
                                        break;
                                }
                            }

                            updatePopupPosition();

                            _popupGlobal.removePopupCloseEventListeners(null, "click.popup", closePopup);

                            if (!_setting.alwaysOpen)
                                _popupGlobal.addPopupCloseEventListeners(null, "click.popup", closePopup);

                            _setting.source.unbind("keydown.popup").unbind("keyup.popup");
                            /*_popupGlobal.removePopupCloseEventListeners(null, "keydown.popup", popupKeyDown);
                             _popupGlobal.removePopupCloseEventListeners(null, "keyup.popup", popupKeyUp);*/
                            _setting.source.bind("keydown.popup", popupKeyDown).bind("keyup.popup", popupKeyUp);
                            /*_popupGlobal.addPopupCloseEventListeners(null, "keydown.popup", popupKeyDown);
                             _popupGlobal.addPopupCloseEventListeners(null, "keyup.popup", popupKeyUp);*/
                        }
                    }
                } else
                    core.throw("The target layer must specify the id property.");
            }
        } catch (e) {
            core.throw(e.message);
        }
        return false;
    }

    /**
     * 关闭Popup
     */
    function closePopup(e) {
        if (_popupGlobal.current && !stopPropagation) {
            var _setting = _popupGlobal.current.data("setting");
            if (_setting) {
                if (_popupGlobal.currentData)
                    _popupGlobal.source.cval(_popupGlobal.currentData.val).html(_popupGlobal.currentData.html);

                switch (_popupGlobal.currentType) {
                    case "selector":
                        if (currentPopupSearchItems) {
                            $.each(currentPopupSearchItems, function (i, data) {
                                data.el.removeAttr("data-type");
                            });
                        }
                        break;
                }
                var _closePop = _popupGlobal.current.triggerHandler("closed", _setting.source);
                /*if (_setting && $.type(_setting.closed) == "function")
                 _handller = _setting.closed(_popupGlobal.current, _setting);*/

                if (_closePop !== false) {
                    _popupGlobal.current.removeClass("openedPopup").removeAttr("style");
                    _setting.source.removeClass("opened");
                    _popupGlobal.current = null;
                }
            }
            _popupGlobal.removePopupCloseEventListeners(null, "click.popup", closePopup);
            _popupGlobal.removePopupCloseEventListeners(null, "keydown.popup", popupKeyDown);
            _popupGlobal.removePopupCloseEventListeners(null, "keyup.popup", popupKeyUp);
        }
        _popupGlobal.searching = false;
        _popupGlobal.searcher.detach();
        stopPropagation = false;
        return false;
    }

    function popupKeyDown(e) {
        if (_popupGlobal.current) {
            switch (_popupGlobal.currentType) {
                case "selector":
                    if (e.keyCode == 27) {
                        closePopup(e);
                    }
                    break;
            }
        }
    }

    function popupKeyUp(e) {
        if (_popupGlobal.current) {
            switch (_popupGlobal.currentType) {
                case "selector":
                    var _selected = _popupGlobal.current.find("button.selected[data-type!=hidden]");
                    if (e.keyCode == 38) {
                        if (_selected.length > 0) {
                            var _prev = _selected.prevAll("button[data-type!=hidden]");
                            if (_prev.length == 0)
                                _prev = _popupGlobal.current.find("button[data-type!=hidden]:last");

                            if (_prev.length > 0) {
                                _prev = _prev.eq(0);
                                _selected.removeClass("selected");
                                _prev.addClass("selected");
                                _popupGlobal.searchingSelectedValue = _prev.cval();
                                _popupGlobal.source.html(_prev.html());
                                updateVirtualScrollSetting();
                            }
                        }
                    } else if (e.keyCode == 40) {
                        if (_selected.length > 0) {
                            var _next = _selected.nextAll("button[data-type!=hidden]");
                            if (_next.length == 0)
                                _next = _popupGlobal.current.find("button[data-type!=hidden]:first");

                            if (_next.length > 0) {
                                _next = _next.eq(0);
                                _selected.removeClass("selected");
                                _next.addClass("selected");
                                _popupGlobal.searchingSelectedValue = _next.cval();
                                _popupGlobal.source.html(_next.html());
                                updateVirtualScrollSetting();
                            }
                        }
                    } else if (e.keyCode == 13) {
                        _selected.trigger("click");
                        return false;
                    } else if (_popupGlobal.current.attr("data-searchable") == "true") {
                        if (_popupGlobal.searching) {
                            var _v = $.trim(_popupGlobal.searcher.children("input").val()).toLowerCase(), toSel = null;
                            if (_v) {
                                $.each(currentPopupSearchItems, function (i, data) {
                                    if (data.text.indexOf(_v) >= 0 || data.first.indexOf(_v) >= 0 || data.letter.indexOf(_v) >= 0) {
                                        data.el.removeAttr("data-type").removeClass("selected");
                                        if (data.el.cval() == _popupGlobal.searchingSelectedValue) {
                                            toSel = data.el.addClass("selected");
                                            _popupGlobal.source.html(data.el.html());
                                        }
                                    } else
                                        data.el.attr("data-type", "hidden").removeClass("selected");
                                });
                            } else {
                                $.each(currentPopupSearchItems, function (i, data) {
                                    data.el.removeAttr("data-type").removeClass("selected");
                                    if (data.el.cval() == _popupGlobal.currentData.val) {
                                        toSel = data.el.addClass("selected");
                                        _popupGlobal.source.html(data.el.html());
                                    }
                                });
                            }
                            if (!toSel) {
                                toSel = _popupGlobal.current.find("button[data-type!=hidden]:first");
                                if (toSel.length > 0) {
                                    toSel.addClass("selected");
                                    _popupGlobal.source.html(toSel.html());
                                } else
                                    _popupGlobal.source.html("");
                            }
                            updateVirtualScrollSetting();
                        }
                    }
                    break;
            }
        }
    }

    function preventBubble(e) {
        /*stopPropagation = true;*/
        e.stopPropagation();
        /*e.preventDefault();
         return false;*/
    }

    function updateVirtualScrollSetting() {
        var _selected = _popupGlobal.current.find("button.selected[data-type!=hidden]");
        _selected.each(function (i, dom) {
            var cur = $(dom), p = cur.parent(), st = cur.position().top + p.scrollTop();
            p.scrollTop(st);
        });
    }

    function updatePopupPosition(shift) {
        if (_popupGlobal.current) {
            var _setting = _popupGlobal.current.data("setting");
            if (_setting && _setting.source) {
                if (!shift)
                    shift = {left: 0, top: 0};
                else {
                    shift = {
                        left: shift.left - core.pageOffset.left,
                        top: shift.top - core.pageOffset.top
                    };
                }

                var _offset = _setting.source.offset(), _body = $(document.body);
                var _height = _setting.source.outerHeight(), _width = _setting.source.outerWidth(), _left = _offset.left + shift.left, _top = _offset.top + _height + shift.top;
                var _pop_width = _popupGlobal.current.outerWidth(), _pop_height = _popupGlobal.current.outerHeight();
                var maxh = "none", isup = false;

                var _position = _setting.source.attr("data-popup-position") || "absolute";
                if (_position === "fixed") {
                    _left -= document.body.scrollLeft;
                    _top -= document.body.scrollTop;
                }

                if (_left + _pop_width > document.body.scrollWidth)
                    _left = _left + _width - _pop_width;
                if (_left < 0) _left = 0;

                if (_top + _pop_height > document.body.scrollHeight) {
                    _top = _offset.top - _pop_height + shift.top;
                    isup = true;
                }

                if (_top < 0) {
                    _top = 0;
                    maxh = _offset.top + shift.top;
                }

                _popupGlobal.current.removeClass("uppopup");
                if (isup)
                    _popupGlobal.current.addClass("uppopup");

                _popupGlobal.current.css({
                    position: _position,
                    top: _top,
                    left: _left,
                    "min-width": _width,
                    "max-height": maxh
                });
            }
        }
    }

    function onDataPopupBinderClicked(e, _setting) {
        var s = $(e.currentTarget);
        if (s.hasClass("opened")) {
            closePopup();
        } else {
            var pid = s.attr("data-popup");
            if (pid) {
                var setting = {
                    source: s,
                    id: pid,
                    alwaysOpen: s.attr("data-alwaysopen")
                };
                $.extend(true, setting, _setting || s.data("setting"));

                openPopup(setting);
            }
        }
        return false;
    }

    function onSelectorSelectedItemChanged(e) {
        if (_popupGlobal.current) {
            var t = $(e.currentTarget), _v = t.cval(), _source = _popupGlobal.current.data("setting").source;
            if (_source) {
                var handled = _source.focus().cval(_v).trigger("change", _v);
                _source.html(t.html());
                _popupGlobal.currentData = null;
                if (handled !== true) closePopup();
            }
        }
    }


    function onMenuSelectedItemClicked(e) {
        if (_popupGlobal.current) {
            var t = $(e.currentTarget), _v = t.cval(), _source = _popupGlobal.current.data("setting").source;
            var handled = _popupGlobal.current.trigger("menuClick", {
                tag: _v,
                target: t,
                source: _source
            });

            if (handled !== true)
                closePopup();
        }
    }


    if (!_popupGlobal) {
        /**
         * Popup插件全局属性注册
         * @type {{current: null, removePopupCloseEventListeners: Function, addPopupCloseEventListeners: Function}}
         */
        _popupGlobal = {};
    }


    function onLanguageChanged() {
        closePopup();
        if (top.moment) {
            $("button[data-type='datepicker']").each(function (index, dom) {
                var t = $(this), d = t.cval();
                if (d) {
                    try {
                        t.text(top.moment(d).format(config.formats.get(t.attr("data-format"), "YYYY-MM-DD HH:mm:ss")));
                    } catch (e) {
                    }
                }
            });
        }
    }

    function initDatePickers() {
        var dps = $(".popup[data-type='datepicker']");
        if (dps.length > 0) {
            if ($.fn.datetimepicker) {
                dps.each(function (i, dom) {
                    var pop = $(dom), inner = $("<div></div>");
                    pop.append(inner);
                    inner.datetimepicker({
                        inline: true,
                        onGenerate: function () {
                            pop.data("dt", this);
                        }
                    });
                });
            } else
                plugins.install("dateTimePicker", initDatePickers);
        }
    }

    function onDatePickerValueChanged(v, input) {
        var _source = _popupGlobal.current.data("setting").source;
        if (_source) {
            var _fm = _source.attr("data-format");
            if (_fm && _fm in config.formats) _fm = config.formats[_fm];
            v = moment(v).format(_fm || config.formats.datetime);
            var handled = _source.cval(v).triggerHandler("change", v);
            _popupGlobal.currentData = null;
            if (handled !== true) closePopup();
        }
    }

    function initColorPickers() {
        var cps = $(".popup[data-type='colorpicker']");
        if (cps.length > 0) {
            if ($.fn.farbtastic) {
                cps.each(function (i, dom) {
                    $(dom).farbtastic(onColorPickerValueChanged);
                });
            }
        } else
            plugins.install("colorPicker", initColorPickers);
    }

    function onColorPickerValueChanged(color) {
        if (_popupGlobal.current) {
            var _source = _popupGlobal.current.data("setting").source;
            if (_source) {
                _source.css("backgroundColor", color).cval(color).triggerHandler("change", color);
                _popupGlobal.currentData = null;
            }
        }
    }

    function popupInit() {
        var _body = $(document.body);
        _body.off("click", "[data-popup]").on("click", "[data-popup]", onDataPopupBinderClicked).off("click.popup", ".popup").on("click.popup", ".popup", preventBubble);
        _body.off("click", ".popup[data-type=selector] button").on("click", ".popup[data-type=selector] button", onSelectorSelectedItemChanged);
        _body.off("click", ".popup[data-type=menu] button").on("click", ".popup[data-type=menu] button", onMenuSelectedItemClicked);
        initDatePickers();
        initColorPickers();
        core.language.change(onLanguageChanged);

        closePopup();
    }

    /**
     * 获取指定下拉框中指定值对应的项
     * @param popupName
     * @param val
     * @param source 请求者
     */
    function getPopupItem(popupId, val, source) {
        var _item = null;
        var _pop;
        if (popupId) {
            var _pop = $("#" + popupId);
            if (_pop.length > 0) {
                var popuptype = _pop.attr("data-type");
                switch (popuptype) {
                    case "selector":
                        _item = _pop.find("button[value='" + val + "']");
                        break;
                    case "citypicker":
                        if (source) _item = top.citypicker.getFull(source.attr("data-value", val));
                        break;
                    default:
                        _item = val;
                        break;
                }
            }
        }
        return _item;
    }

    module.init = popupInit;
    module.binder = onDataPopupBinderClicked;
    module.close = closePopup;
    module.open = openPopup;
    module.getItem = getPopupItem;
    module.updatePosition = updatePopupPosition;
    module.config = _popupGlobal;

    window.popup = module;
});
