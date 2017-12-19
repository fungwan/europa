/**
 * Created by Yatagaras on 2015/12/2.
 */
define(function () {
    var module = {}, loaded = false, qrCodeSize = 120, generalizeHeight = 0, list = $("#list"), node = null, currentButton = null,
        projectItemTemplate = '<div class="item {0}" data-id="{7}" data-state="{1}">' +
            '<h1>{2}</h1>' +
            '<h3>{3}</h3>' +
            '<div class="horizontalFlexBox iac">' +
            '<div class="verticalFlexBox flex">' +
            '<div class="progress">' +
            '<button class="time" name="starttime" value="{4}" data-lang-alt="开始时间"></button>' +
            '<progress min="0" step=".01" max="100" value="{6}" title="时间进度: {6}%"></progress>' +
            '<button class="time" name="endtime" value="{5}" data-lang-alt="结束时间"></button>' +
            '</div><div class="cmd">' +
            '</div>' +
            '</div>' +
            '<div class="qrcode"></div>' +
            '</div>' +
            '</div>';
    //{0}: 状态Code, {1}: 状态文本, {2}: 活动名称, {3}: 活动介绍, {4}: 开始时间, {5}: 结束时间, {6}: 活动进度

    var deletePorjectId = null;

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
                // $("#activityMenus input:checked").prop("checked", false);
                query.reset();
                query.params = res.result;
                query.get();
            }
            query.close();
        },
        /**
         * 根据条件获取记录
         */
        get: function () {
            if (query.inProgress || query.overload) return false;
            if (query.page === 1)
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
            if (query.page === 1)
                list.empty();
            if (d && d.data && d.data.data && $.type(d.data.data) == "array") {
                if (d.data.data.length > 0) {
                    $.each(d.data.data, function (i, item) {
                        var dom = $(projectItemTemplate.format(item.state, '', item.name, item.description, item.begdate, item.enddate, 0, item.projectid));
                        dom.data("d", item);
                        list.append(dom);
                        updateProjectState(dom);
                    });
                    query.page++;
                } else {
                    query.overload = true;
                }
                query.check();
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
        },
        check: function () {
            list.children(".empty").remove();
            if (list.children(".item").length == 0)
                list.append('<div class="empty ccBox"><h1>未找到活动方案，点击“+”立刻开始创建</h1><button value="create" class="wficoonly ico_add"></button></div>');
        }
    };

    function updateProjectState(dom, data, request) {
        if (dom) {
            var _d = dom.data("d");
            if (data) {
                _d.state = data.state || _d.state;
                _d.gen = data.gen || false;
            }

            var cmd = dom.removeAllClass().addClass("item").addClass(_d.state).find(".cmd").empty();
            var passedHours = moment().diff(moment(_d.begdate), 'hours');
            if (passedHours > 0) {
                var pr = dom.find("progress"), pb = pr.parent().removeClass("indate outdate");
                var countHours = moment(_d.enddate).diff(moment(_d.begdate), 'hours');
                if (passedHours < countHours) {
                    var txt = Math.round(passedHours / countHours * 10000) / 100;
                    pr.val(txt).data("tooltip", "时间进度: " + txt + "%");
                    pb.addClass("indate");
                } else {
                    pr.val("100").data("tooltip", "时间进度: 100%");
                    pb.addClass("outdate");
                }
            }
            switch (_d.state) {
                case activityStates.editing.code:
                    cmd.append("<button value='start' class='wficoonly ico_play' title='开始活动'></button><button value='delete' class='wficoonly ico_remove' title='删除活动'></button>");
                    break;
                case activityStates.start.code:
                    if (data && data.key)
                        cmd.append("<button value='stop' class='wficoonly ico_stop' title='停止活动'></button>");
                    else
                        cmd.append("<button value='stop' class='wficoonly ico_stop' title='停止活动'></button>");
                    break;
                case activityStates.gen.code:
                    break;
                case activityStates.stop.code:
                    cmd.append("<button value='start' class='wficoonly ico_play' title='开启活动'></button>");
                    break;
                case activityStates.completed.code:
                    break;
            }

            dom.find(".qrcode").empty().qrcode({
                text: config.host.service.preview + "p.html?id=" + _d.qrid,
                width: qrCodeSize,
                height: qrCodeSize,
                background: "transparent",
                foreground: activityStates[_d.state].color,
                correctLevel: 1
            });

            if (request !== false)
                generator.request(_d.projectid);
        }
    }

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
        request: function (id, ignore) {
            var _q = null;
            if (!(id in generator.queue)) {
                var item = list.children(".item[data-id='{0}']".format(id));
                if (item && item.length > 0) {
                    var _d = item.data("d");
                    if (ignore === true || _d.gen === true) {
                        var _btn = item.find("button[value=generator]").addClass("processing").html("<div class='spinner'><i></i></div>");
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
                    //var key = d.data.key;
                    //if (!!key && key !== "") {
                    var _p = Number(d.data.progress) || 0;
                    if (_p < 1) {
                        _q.object.attr("data-process", (_p * 100).toFixed(1) + "%");
                        _q.st = setTimeout(function () {
                            generator.request(d.data.projectid);
                        }, generator.interval);
                    } else if (!!d.data.key && d.data.key !== "") {
                        _q.result = d.data;
                        updateProjectState(_q.item, d.data, false);
                    }
                    //}
                    /*else {
                     //generator.request(d.data.projectid);
                     _q.st = setTimeout(function () {
                     generator.request(d.data.projectid);
                     }, generator.interval);
                     }*/
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
            var info = $(e.currentTarget).data("d");
            if (info)
                localStorage.setItem("ls_enterprise_solution", info.projectid);
            else
                localStorage.removeItem("ls_enterprise_solution");

            window.location.href = "solution.detail.html";
            return false;
        },
        confirm: function (item, state, title, content, url, callback) {
            var data = item.data("d");
            // if (state && data.state === state) {
            if (state) {
                core.message.open({
                    icon: "ico_confirm",
                    title: title,
                    content: content.format(data.name),
                    command: {
                        submit: {
                            attr: {
                                "class": "wfico ico_submit",
                                "data-lang": "commands.confirm"
                            },
                            event: function () {
                                if (url == "project/start" || url == "project/stop" || url == "project/delete") {
                                    $("#listView").loader("", "", false);
                                }
                                item.action({
                                    url: url,
                                    data: {
                                        projectid: data.projectid
                                    }
                                }, false).then(callback, solution.fail).always(function () {
                                    if (url == "project/start" || url == "project/stop" || url == "project/delete") {
                                        $(".topperMasker, .spinnerLoader").remove();
                                    }
                                });
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
            } else {
                if (url == "project/start" || url == "project/stop" || url == "project/delete") {
                    $("#listView").loader("", "", false);
                }
                item.action({
                    url: url,
                    data: {
                        projectid: data.projectid
                    }
                }, false).then(callback, solution.fail).always(function () {
                    if (url == "project/start" || url == "project/stop" || url == "project/delete") {
                        $(".topperMasker, .spinnerLoader").remove();
                    }
                });
            }
        },
        /**
         * 对方案进行操作
         * @param e
         * @returns {boolean}
         */
        oper: function (e) {
            var t = $(e.currentTarget), v = t.val(), item = t.parentsUntil("#list", ".item"), d = item.data("d");
            if (d && d.projectid) {
                switch (v) {
                    case "start":
                        solution.confirm(item, activityStates.editing.code, "开始活动确认", "您正准备开始活动： {0} ，活动将更改为“进行中”状态，此状态下不能再修改活动内容和设置。<br />您确定要开始此活动吗？", "project/start", solution.started);
                        break;
                    case "generator":
                        generator.request(d.projectid, true);
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
                    case "delete":
                        deletePorjectId = d.projectid;
                        solution.confirm(item, activityStates.editing.code, "删除活动确认", "您正准备删除活动： {0} ，删除后将无法恢复。<br />您确定要删除此活动吗？", "project/delete", solution.deleted);
                        break;
                    case "stop" :
                        solution.confirm(item, activityStates.stop.code, "停止活动确认", "您正准备停止活动： {0} ，停止后终端用户将无法参与该活动，直到您在设置的活动时间内重新开启活动。<br />您确定要停止此活动吗？", "project/stop", solution.stopped);
                        break;
                }
            }
            return false;
        },
        /**
         * 活动已开始
         * @param d
         */
        started: function (d) {
            if (d && d.data && d.data.projectid) {
                var item = list.children(".item[data-id='{0}']".format(d.data.projectid));
                updateProjectState(item, d.data);
                generator.request(d.data.projectid);
            }
        },
        /**
         * 活动已停止
         * @param d
         */
        stopped: function (d) {
            if (d && d.data && d.data.projectid) {
                var item = list.children(".item[data-id='{0}']".format(d.data.projectid));
                updateProjectState(item, d.data);
                generator.request(d.data.projectid);
            }
        },
        /**
         * 活动已删除
         * @param d
         */
        deleted: function (d) {
            if (d && d.data && d.data.projectid)
                list.children(".item[data-id='{0}']".format(d.data.projectid)).remove();
            query.check();
            if (d && d.data == true && deletePorjectId) {
                list.children(".item[data-id='{0}']".format(deletePorjectId)).remove();
                deletePorjectId = null;
            }
        },
        /**
         * 出错
         * @param err
         */
        fail: function (err) {
            if (err && err.code) {
                var message = "";
                switch (err.code) {
                    case errorCodes.outofdate:
                        message = "该活动设置的结束日期已到，无法进行该操作";
                        break;
                    case errorCodes.norpitem:
                        message = "该活动没有设置奖项，无法进行该操作";
                        break;
                    case errorCodes.noquestion:
                        message = "该活动没有设置问卷题目，无法进行该操作";
                        break;
                    case errorCodes.nopoint:
                        message = "该活动没有设置积分额度，无法进行该操作";
                        break;
                    case errorCodes.nomoney:
                        message = "您的帐户余额不足，无法操作该活动";
                        break;
                    case "categoryused":
                        message = "该活动对应的商品分类已经被其他活动使用，无法进行该操作";
                        break;
                    case "nocategory":
                        message = "该活动没有对应的商品分类，无法进行该操作";
                        break;
                    case "notenoughqramount":
                        message = "该活动没有足够的二维码，无法进行该操作，请先生成二维码";
                        break;
                    case "notype":
                        message = "该活动没有设置活动配置项，请至少选择一条活动配置项";
                        break;
                    default:
                        message = "出错了，请稍后再试";
                        break;
                }
                if (message) core.throw(message, {
                    title: "操作失败"
                });
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
                //typer.close();
                break;
            case "create":
                solution.open(e);
                break;

        }
        return false;
    }

    function onExtendMenuClicked(e, d) {
        switch (d.tag) {
            case "solution_create":
                solution.open(e);
                break;
            case "solution_query":
                query.open(e);
                break;
            case "solution_help":
                help.open(e);
                break;
        }
    }

    function onMainScrolled(e) {
        var st = $(document.body).scrollTop();
        if (st > generalizeHeight)
            document.body.classList.add("viewModel");
        else
            document.body.classList.remove("viewModel");

        if (st == document.body.scrollHeight - document.body.clientHeight)
            query.get();
    }

    module.init = function () {
        if (!loaded) {
            navigation.direction("solution");
            generalizeHeight = $("#generalize").outerHeight(true);
            $(document.body).on("click", "button", onButtonClick);
            $(window).scroll(onMainScrolled);
            $("[name='base-type']").change(query.done);
            list.on("click", ".item button", solution.oper);
            list.on("click", ".item", solution.open);

            $("#activityExtendMenu").bind("menuClick", onExtendMenuClicked);

            account.sign.listen("get_sign_in", query.done);
            loaded = true;
        }
    };

    return module;
});