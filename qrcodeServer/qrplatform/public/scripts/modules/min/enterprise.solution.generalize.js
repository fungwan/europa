/**
 * Created by Yatagaras on 2015/12/2.
 */
define(function () {
    var module = {}, loaded = false, qrCodeSize = 120, generalizeHeight = 0, list = $("#list"),
        projectItemTemplate = '<div class="item {0}" data-id="{7}" data-state="{1}">' +
            '<h1>{2}</h1>' +
            '<h3>{3}</h3>' +
            '<div class="horizontalFlexBox iac">' +
            '<div class="verticalFlexBox flex">' +
            '<div class="progress">' +
            '<button class="time" name="starttime" value="{4}" data-lang-alt="开始时间"></button>' +
            '<progress max="100" value="{6}" title="完成进度: {6}%"></progress>' +
            '<button class="time" name="endtime" value="{5}" data-lang-alt="结束时间"></button>' +
            '</div><div class="cmd"><button value="generator" data-role="generator" class="wficoonly ico_th" title="生成二维码"></button>' +
            '</div>' +
            '</div>' +
            '<div class="qrcode"></div>' +
            '</div>' +
            '</div>';
    //{0}: 状态Code, {1}: 状态文本, {2}: 活动名称, {3}: 活动介绍, {4}: 开始时间, {5}: 结束时间, {6}: 活动进度

    /**
     * 查询方案对象
     * @type {{open: Function}}
     */
    var query = {
        /**
         * 高级查询是否加载完成
         */
        loaded: false,
        /**
         * 查询条件
         */
        params: null,
        /**
         * 正在查询过程中
         */
        inProgress: false,
        /**
         * 下次要加载的页面
         */
        page: 1,
        /**
         * 要加载记录数
         */
        size: 10,
        /**
         * 是否已经全部加载完成
         */
        overload: false,
        /**
         * 重置参数
         */
        reset: function () {
            query.params = {
                begdate: '',
                enddate: '',
                key: '',
                state: '',
                type: ''
            };
            query.page = 1;
            query.overload = false;
        },
        /**
         * 打开高级查询
         */
        open: function () {
            if (query.inProgress) return false;
            if (!query.loaded) {
                var _query = {
                    begdate: moment().subtract(3, "M").format(config.formats.date),
                    enddate: moment().format(config.formats.date)
                };
                $("#searchBox").parseData(_query);
                query.loaded = true;
            }
            $(document.body).addClass("searching");
            return false;
        },
        /**
         * 关闭高级查询
         */
        close: function () {
            $(document.body).removeClass("searching");
        },
        /**
         * 执行基础查询
         * @param e
         */
        done: function (e) {
            if (query.inProgress) return false;
            query.inProgress = true;
            query.reset();
            query.params.type = $("[name='base-type']:checked").val();
            $("#_m_query").prop("checked", false);
            query.get();
        },
        /**
         * 执行高级查询
         */
        advance: function () {
            if (query.inProgress) return false;
            var res = $("#searchBox").serializeForm();
            if (!res.hasError) {
                query.inProgress = true;
                $("[name='base-type']").prop("checked", false);
                $("#_m_query").prop("checked", true);
                query.params = res.result;
                query.get();
            }
            query.close();
        },
        /**
         * 根据条件获取记录
         */
        get: function () {
            generator.clear();
            list.action({
                url: "project/list",
                data: {
                    "query": JSON.stringify(query.params),
                    "page": query.page,
                    "size": query.size
                }
            }).then(query.success, query.fail).always(query.complete);
        },
        /**
         * 获取记录成功
         * @param d
         */
        success: function (d) {
            if (d && d.data && d.data.data && $.type(d.data.data) == "array") {
                if (query.page === 1)
                    list.empty();
                $.each(d.data.data, function (i, item) {
                    var dom = $(projectItemTemplate.format(item.state, '', item.name, item.description, item.begdate, item.enddate, 0, item.projectid));
                    dom.data("d", item);
                    list.append(dom);
                    var cmd = dom.find(".cmd"), color = "transparent";
                    switch (item.state) {
                        case activityStates.editing.code:
                            cmd.append("<button value='delete' class='wficoonly ico_remove' title='删除活动'></button>".format(item.projectid));
                            break;
                        case activityStates.start.code:
                            cmd.append("<button value='delete' class='wficoonly ico_stop' title='停止活动'></button>".format(item.projectid));
                            break;
                        case activityStates.stop.code:
                            cmd.append("<button value='play' class='wficoonly ico_play' title='开启活动'></button>");
                            break;
                        case activityStates.completed.code:
                            break;
                    }

                    dom.find(".qrcode").qrcode({
                        text: config.host.service.preview + "p.html?id=" + item.qrid,
                        width: qrCodeSize,
                        height: qrCodeSize,
                        background: "transparent",
                        foreground: activityStates[item.state].color,
                        correctLevel: 1
                    });

                    generator.request(item.projectid);
                });
            } else
                query.overload = true;
        },
        /**
         * 获取记录失败
         * @param err
         */
        fail: function (err) {

        },
        complete: function () {
            query.inProgress = false;
            core.updateVirtualScrollSetting
        }
    };

    /**
     * 二维码生成
     * @type {{}}
     */
    var generator = {
        /**
         * 更新进度的时间间隔
         */
        interval: 2000,
        /**
         * 默认配置
         */
        defaultSetting: {
            st: null,
            item: null,
            object: null,
            result: null,
            state: null
        },
        /**
         * 队列
         */
        queue: {},
        /**
         * 清除队列
         */
        clear: function () {
            $.each(generator.queue, function (key, q) {
                if (q.st) clearTimeout(q.st);
                delete generator.queue[key];
            });
        },
        /**
         * 查询进度
         * @param id 活动ID
         */
        request: function (id) {
            var _q = null;
            if (!(id in generator.queue)) {
                var item = list.children(".item[data-id='{0}']".format(id));
                if (item && item.length > 0) {
                    var _d = item.data("d");
                    if (_d.state === "start") {
                        var _btn = item.find("button[data-role=generator]").addClass("processing").html("<div class='spinner'><i></i></div>");
                        _q = generator.queue[id] = $.extend(true, {}, generator.defaultSetting, {
                            item: item,
                            object: _btn,
                            state: _d.state
                        });
                    }
                }
            } else
                _q = generator.queue[id];

            if (_q) {
                if (_q.st) clearTimeout(_q.st);
                _q.item.action({
                    url: "project/reqcode",
                    data: {
                        projectid: id
                    }
                }, false).then(generator.progress, function (err) {
                    _q.object.removeClass("processing").html("").addClass("error").attr("title", "获取/生成二维码失败").data("tooltip", "获取/生成二维码失败");
                });
            }
        },
        /**
         * 进度
         * @param d
         */
        progress: function (d) {
            if (d && d.data && d.data.projectid) {
                if (d.data.projectid in generator.queue) {
                    var _q = generator.queue[d.data.projectid];
                    if (d.data.progress < 1) {
                        _q.object.attr("data-process", (d.data.progress * 100).toFixed(1) + "%");
                        _q.st = setTimeout(function () {
                            generator.request(d.data.projectid);
                        }, generator.interval);
                    } else {
                        _q.result = d.data;
                        _q.object.removeClass("processing ico_th").addClass("ico_download").val("download").html("").attr("title", "下载二维码").data("tooltip", "下载二维码");
                    }
                }
            }
        }
    };

    /**
     * 方案对象
     * @type {{open: Function}}
     */
    var solution = {
        /**
         * 打开方案
         * @param e
         * @returns {boolean}
         */
        open: function (e) {
            var info = $(e.currentTarget).data("d"), openable = true;
            if (info) {
                parent.enterprise.solution.current = info.projectid;
                parent.enterprise.solution.currentType = info.type;
            } else {
                parent.enterprise.solution.current = null;
                if (query.params && query.params.type)
                    parent.enterprise.solution.currentType = query.params.type;
                else {
                    alert("请选选择一种类型");
                    openable = false;
                }
            }
            if (openable) parent.enterprise.solution.openPage("detail");
            return false;
        },
        /**
         * 对方案进行操作
         * @param e
         * @returns {boolean}
         */
        oper: function (e) {
            var t = $(e.currentTarget), v = t.val(), item = t.parentsUntil("#list", ".item"), d = item.data("d");
            if (d) {
                switch (v) {
                    case "generator":
                        core.message.open({
                            icon: "ico_confirm",
                            title: "生成活动二维码",
                            content: "您正准备生成活动： {0} 的二维码，活动将更改为“进行中”状态，此状态下不能再修改活动内容和设置。<br />您确定要开始生成二维码吗？".format(d.name),
                            command: {
                                submit: {
                                    attr: {
                                        "class": "wfico ico_submit",
                                        "data-lang": "commands.confirm"
                                    },
                                    event: function () {
                                        item.action({
                                            url: "project/reqcode",
                                            data: {
                                                projectid: d.projectid
                                            }
                                        }, false).then(solution.start);
                                    }
                                },
                                cancel: {
                                    attr: {
                                        "class": "wfico ico_cancel",
                                        "data-lang": "commands.cancel"
                                    }
                                }
                            }
                        });
                        break;
                    case "download":
                        if (d.projectid in generator.queue) {
                            var _q = generator.queue[d.projectid];
                            if (_q.result) {
                                core.post(config.host.service.download, {
                                    key: _q.result.key,
                                    projectid: _q.result.projectid
                                });
                            }
                        }
                        break;
                }
            }
            return false;
        },
        /**
         * 开始活动
         * @param d
         */
        start: function (d) {
            if (d && d.data && d.data.projectid) {
                var item = list.children(".item[data-id='{0}']".format(d.data.projectid));
                var _d = item.data("d");
                item.removeAllClass().addClass("item").addClass(d.data.state);
                _d.state = d.data.state;
                item.find(".qrcode").empty().qrcode({
                    text: config.host.service.preview + "p.html?id=" + _d.qrid,
                    width: qrCodeSize,
                    height: qrCodeSize,
                    background: "transparent",
                    foreground: activityStates[d.data.state].color,
                    correctLevel: 1
                });
                generator.request(d.data.projectid);
            }
        }
    };

    /**
     * 帮助对象
     * @type {{}}
     */
    var help = {
        /**
         * 打开帮助说明
         */
        open: function () {
            document.body.classList.add("help");
            return false;
        },
        /**
         * 关闭帮助说明
         */
        close: function () {
            document.body.classList.remove("help");
            return false;
        }
    };

    function onButtonClick(e) {
        switch ($(e.currentTarget).val()) {
            case "detail":
                parent.enterprise.solution.openPage("detail");
                break;
            case "submitSearch":
                query.advance();
                break;
            case "closeBox":
                query.close();
                help.close();
                break
        }
        return false;
    }

    function onMainScrolled(e) {
        var st = $(e.currentTarget).scrollTop();
        if (st > generalizeHeight)
            document.body.classList.add("viewModel");
        else
            document.body.classList.remove("viewModel");
    }

    module.init = function () {
        if (!loaded) {
            generalizeHeight = $("#generalize").outerHeight(true);
            $(document.body).on("click", "button", onButtonClick);
            $("#_m_create").click(solution.open);
            $("#_m_query").click(query.open);
            $("#_m_help").click(help.open);
            $("[name='base-type']").change(query.done);
            $("#main").scroll(onMainScrolled);
            list.on("click", "button", solution.oper);
            list.on("click", ".item", solution.open);

            core.broadcast.listen("logged", query.get);

            query.done();
            loaded = true;
        }
    };

    return module;
});