/**
 * Created by Yatagaras on 2015/12/2.
 */
define(function () {
    var module = {}, loaded = false, timer_si = null,
        attrs = $(".attributes"), footer = $(".footer"), frame = $("#previewFrame"),
        currentSetting = null,
        currentStepInx = null,
        currentStepName = null,
        currentSteps = [],
        currentAttributePanel = null;

    var lotterySetLoaded = false, pointSetLoaded = false, questionSetLoaded = false;

    /**
     * 设定编辑器
     * @type {{}}
     */
    var set = {
        /**
         * 初始化指定的设定编辑器
         * @param setName
         * @param items
         */
        init: function (setName, items) {
            switch (setName) {
                case "lottery":
                    $("#lotteryModes").parseData({"lotteryMode": frame.get(0).contentWindow.pageSetting.lotteryMode || "bigwheel"});
                    lottery.init(items);
                    break;
                case "question":
                    question.init(items);
                    break;
            }
        }
    };

    /**
     * 奖项设定
     */
    var lottery = {
        /**
         * 容器
         */
        container: $("#lotterySet"),
        /**
         * 派送金额
         */
        total: 0,
        /**
         * 派送奖次
         */
        amounts: 0,
        /**
         * 中奖率
         */
        percent: 1,
        /**
         * 生成默认奖项内容
         * @returns {{name: string, amount: number, price: number, summoney: number}}
         */
        default: function () {
            return {name: "奖项名称", amount: 1, price: 1, summoney: 1, number: 0};
        },
        /**
         * 初始编辑器以及数据
         */
        init: function () {
            if (!lotterySetLoaded) {
                lottery.container.datagrid({
                    columns: [
                        {
                            caption: "奖项名称",
                            width: 150,
                            field: "name",
                            editable: true,
                            dataType: "string",
                            changed: lottery.updateGame,
                            editor: {
                                type: "text",
                                params: {
                                    "required": "required",
                                    "maxlength": "10"
                                }
                            }
                        },
                        {
                            caption: "数量",
                            width: 80,
                            field: "amount",
                            editable: true,
                            dataType: "numeric",
                            changed: lottery.updateAmount,
                            editor: {
                                type: "number",
                                params: {
                                    "required": "required",
                                    "min": 1,
                                    "max": 1000000
                                },
                                created: lottery.check.amount
                            }
                        },
                        {
                            caption: "已中奖",
                            width: 80,
                            field: "number",
                            dataType: "numeric"
                        },
                        {
                            caption: "金额",
                            width: 80,
                            field: "price",
                            editable: true,
                            dataType: "numeric",
                            changed: lottery.updatePrice,
                            editor: {
                                type: "number",
                                params: {
                                    "required": "required",
                                    "min": 1,
                                    "max": 10000
                                }
                            }
                        },
                        {caption: "小计", width: 120, field: "summoney", dataType: "numeric"}
                    ],
                    commands: {
                        "operator": $("#lotteryOperator"),
                        "counter": $("#lotteryCounter")
                    },
                    rowClicked: lottery.rowClicked,
                    commandClicked: lottery.oper,
                    data: {
                        empty: "点击添加按钮来增加奖项，至少要有一个奖项。"
                    }
                });
                lotterySetLoaded = true;
            }

            if (currentSetting) {
                if (currentSetting.state !== activityStates.editing.code) {
                    var opt = lottery.container.datagrid("options");
                    opt.editable = false;
                    opt.rowClicked = null;
                }

                lottery.cal();
                lottery.container.datagrid("setData", currentSetting.config.rpitems);
            }
        },
        rowClicked: function () {
            lottery.container.datagrid("disableCommand", "remove", false);
        },
        /**
         * 对奖项金额、数量等进行计算
         */
        cal: function () {
            lottery.total = 0;
            lottery.amounts = 0;
            if (!currentSetting.config)
                currentSetting.config = {};

            if (!currentSetting.config.rpitems)
                currentSetting.config.rpitems = [];

            lottery.container.datagrid("disableCommand", "strategy", currentSetting.config.rpitems.length == 0);

            $.each(currentSetting.config.rpitems, function (i, item) {
                lottery.total += parseInt(item.summoney);
                lottery.amounts += parseInt(item.amount);
            });
            lottery.updateInfo();
            lottery.updateGame();
        },
        /**
         * 更新奖项数量
         * @param cell 单元格
         * @param newValue 单元格新值
         * @param rowValue 行数据
         */
        updateAmount: function (cell, newValue, rowValue) {
            lottery.total -= rowValue.summoney;
            lottery.amounts -= rowValue.amount;
            rowValue.summoney = rowValue.price * newValue;
            lottery.total += rowValue.summoney;
            lottery.amounts += newValue;
            lottery.updateInfo();
            return false;
        },
        /**
         * 更新奖项金额
         * @param cell 单元格
         * @param newValue 单元格新值
         * @param rowValue 行数据
         */
        updatePrice: function (cell, newValue, rowValue) {
            lottery.total -= rowValue.summoney;
            rowValue.summoney = newValue * rowValue.amount;
            lottery.total += rowValue.summoney;
            lottery.updateInfo();
            return false;
        },
        /**
         * 更新中奖率
         * @param e
         */
        updatePercent: function (e) {
            lottery.percent = Number($(e.currentTarget).val()) || 1;
            lottery.updateInfo();
        },
        /**
         * 当手动更改中奖率时更新range控件
         */
        updatePercentNumber: function (e) {
            var v = e.currentTarget.value;
            if (v == "")
                e.currentTarget.value = v = 100;
            var lp = document.getElementById("lotteryPercent");
            lp.value = Number(v) / 100;
            lottery.updatePercent({
                currentTarget: lp
            });
            return false;
        },
        /**
         * 更新信息
         */
        updateInfo: function () {
            $("#lotteryPriceTotal").text(lottery.total.formatMoney());
            $("#lotteryPercentNumber").val((lottery.percent * 100).toFixed(4));
            //$("#lotteryPercent").attr("data-tip", Math.round(lottery.percent * 100) + "%");
            $("#lotteryQrcodeTotal").text("二维码数量: {0}".format(Math.ceil(lottery.amounts / lottery.percent))).data("tooltip", "(奖次){0} ÷ (中奖率){1} ≈ {2}".format(lottery.amounts, lottery.percent, Math.ceil(lottery.amounts / lottery.percent)));
        },
        /**
         * 更新游戏内容
         */
        updateGame: function (cell, newValue, rowValue) {
            if (rowValue)
                rowValue.name = newValue;

            if (frame.get(0).contentWindow.navigation)
                frame.get(0).contentWindow.navigation(currentSetting.config.rpitems);
        },
        /**
         * 奖项操作
         * @param e
         * @param val
         */
        oper: function (e, val) {
            switch (val) {
                case "add":
                    lottery.container.datagrid("insertData", lottery.default(), true);
                    lottery.cal();
                    break;
                case "remove":
                    lottery.container.datagrid("removeSelectedRow").datagrid("selectRow");
                    lottery.cal();
                    break;
                case "strategy":
                    strategy.open();
                    break;
            }
        },
        /**
         * 检查编辑器
         */
        check: {
            amount: function (editor, val, rowValue) {
                if (rowValue.lotteryrule) {
                    var strAmounts = 0;
                    $.each(rowValue.lotteryrule, function (i, rule) {
                        strAmounts += Number(rule.amount) || 0;
                    });
                    var used = Number(rowValue.number);
                    if (strAmounts < used) strAmounts = used;
                    if (strAmounts < 1) strAmounts = 1;
                    editor.attr("min", strAmounts);
                }
            }
        }
    };

    /**
     * 问卷设定
     */
    var question = {
        /**
         * 容器
         */
        container: $("#questionSet"),
        /**
         * 问卷当前最大序号
         */
        maxOrder: 0,
        /**
         * 生成默认记录
         */
        default: function () {
            question.maxOrder++;
            return {
                number: question.maxOrder,
                name: "输入问题内容",
                qatype: "1",
                answer: "输入答案"
            };
        },
        /**
         * 初始编辑器以及数据
         */
        init: function () {
            if (!questionSetLoaded) {
                question.container.datagrid({
                    columns: [
                        {
                            caption: "序号",
                            width: 50,
                            field: "number",
                            editable: true,
                            dataType: "numeric",
                            editor: {
                                type: "number",
                                params: {
                                    "required": "required",
                                    "min": 0,
                                    "maxlength": 2
                                }
                            },
                            changed: question.updateOrder
                        },
                        {
                            caption: "问题",
                            width: 180,
                            field: "name",
                            editable: true,
                            dataType: "string",
                            editor: {
                                type: "text",
                                params: {
                                    "required": "required",
                                    "maxlength": 300
                                }
                            },
                            changed: question.updateQuestion
                        },
                        {
                            caption: "答题方式",
                            width: 80,
                            field: "qatype",
                            editable: true,
                            dataType: "string",
                            editor: {
                                type: "select",
                                params: {
                                    "required": "required",
                                    "data-type": "selector",
                                    "data-popup": "answerTypes"
                                }
                            },
                            changed: question.updateType
                        },
                        {
                            caption: "答案",
                            width: 200,
                            field: "answer",
                            editable: true,
                            dataType: "string",
                            editor: {
                                type: "text",
                                params: {
                                    "required": "required",
                                    "maxlength": 500
                                }
                            },
                            changed: question.updateAnswer
                        }
                    ],
                    commands: {
                        "operator": $("#questionOperator")
                    },
                    rowClicked: question.rowClicked,
                    commandClicked: question.oper,
                    data: {
                        empty: "点击添加按钮来增加问卷项，至少要有一个问卷项。"
                    }
                });
                questionSetLoaded = true;
            }

            if (currentSetting) {
                if (currentSetting.state !== activityStates.editing.code) {
                    var opt = question.container.datagrid("options");
                    opt.editable = false;
                    opt.rowClicked = null;
                }
                question.cal();
                question.container.datagrid("setData", currentSetting.config.qaitems);
            }
        },
        rowClicked: function () {
            question.container.datagrid("disableCommand", "remove", false);
        },
        /**
         * 对问题序号进行计算
         */
        cal: function () {
            question.maxOrder = 0;
            $.each(currentSetting.config.qaitems, function (i, item) {
                if ((Number(item.number) || 0) > question.maxOrder) question.maxOrder = item.number;
            });
            question.updateGame();
        },
        /**
         * 奖项操作
         * @param e
         * @param val
         */
        oper: function (e, val) {
            switch (val) {
                case "add":
                    question.container.datagrid("insertData", question.default(), true);
                    question.cal();
                    break;
                case "remove":
                    question.container.datagrid("removeSelectedRow");
                    question.cal();
                    break;
            }
        },
        /**
         * 更新序号
         * @param cell 单元格
         * @param newValue 单元格新值
         * @param rowValue 行数据
         */
        updateOrder: function (cell, newValue, rowValue) {
            rowValue.number = newValue;
            question.cal();
            return false;
        },
        /**
         * 更新问题
         * @param cell 单元格
         * @param newValue 单元格新值
         * @param rowValue 行数据
         */
        updateQuestion: function (cell, newValue, rowValue) {
            rowValue.name = newValue;
            question.updateGame();
            return false;
        },
        /**
         * 更新答案
         * @param cell 单元格
         * @param newValue 单元格新值
         * @param rowValue 行数据
         */
        updateAnswer: function (cell, newValue, rowValue) {
            rowValue.answer = newValue;
            question.updateGame();
            return false;
        },
        /**
         * 更新问题类型
         * @param cell 单元格
         * @param newValue 单元格新值
         * @param rowValue 行数据
         */
        updateType: function (cell, newValue, rowValue) {
            rowValue.qatype = newValue;
            question.updateGame();
            return false;
        },
        /**
         * 更新游戏内容
         */
        updateGame: function () {
            if (frame.get(0).contentWindow.navigation)
                frame.get(0).contentWindow.navigation(currentSetting.config.qaitems);
        }
    };

    /**
     * 策略设定
     */
    var strategy = {
        container: null,
        /**
         * 是否已经加载组件
         */
        loaded: false,
        /**
         * 数据
         */
        data: null,
        /**
         * 当前奖项数据
         */
        lottery: null,
        /**
         * 生成默认的策略
         */
        default: function () {
            if (currentSetting) {
                return {
                    area: "0",
                    begtime: moment(currentSetting.begdate).startOf("day").format(config.formats.datetime),
                    endtime: moment(currentSetting.enddate).endOf("day").format(config.formats.datetime),
                    amount: 1,
                    number: 0,
                    state: "1",
                    ruletype: "1"
                };
            } else
                return null;
        },
        /**
         * 打开策略设定
         */
        open: function () {
            if (!strategy.loaded) {
                strategy.container = $("#strategyList");
                strategy.container.datagrid({
                    columns: [{
                        checkbox: true
                    }, {
                        caption: "地区",
                        width: 240,
                        field: "area",
                        editable: true,
                        dataType: "string",
                        editor: {
                            type: "select",
                            params: {
                                "data-type": "citypicker",
                                "data-popup": "citypicker",
                                "data-level": "top"
                            }
                        }
                    }, {
                        caption: "开始时间",
                        width: 200,
                        field: "begtime",
                        editable: true,
                        dataType: "string",
                        editor: {
                            type: "select",
                            params: {
                                "required": "required",
                                "data-type": "datepicker",
                                "data-popup": "datepicker",
                                "data-level": "top",
                                "data-format": "datetime",
                                "data-timepicker": "true",
                                "data-step": 10
                            },
                            created: strategy.check.beginDate
                        }
                    }, {
                        caption: "结束时间",
                        width: 200,
                        field: "endtime",
                        editable: true,
                        dataType: "string",
                        editor: {
                            type: "select",
                            params: {
                                "required": "required",
                                "data-type": "datepicker",
                                "data-popup": "datepicker",
                                "data-level": "top",
                                "data-format": "datetime",
                                "data-timepicker": "true",
                                "data-step": 10
                            },
                            created: strategy.check.endDate
                        }
                    }, {
                        caption: "数量",
                        width: 80,
                        field: "amount",
                        editable: true,
                        dataType: "numeric",
                        editor: {
                            type: "number",
                            params: {
                                "required": "required",
                                "min": 1
                            },
                            created: strategy.check.amount
                        },
                        changed: strategy.updateAmount
                    }, {
                        caption: "已中奖数量",
                        width: 80,
                        field: "number",
                        editable: false,
                        dataType: "numeric"
                    }, {
                        caption: "方式",
                        width: 120,
                        field: "ruletype",
                        editable: true,
                        dataType: "string",
                        editor: {
                            type: "select",
                            params: {
                                "required": "required",
                                "data-type": "selector",
                                "data-popup": "ruleTypes"
                            }
                        }
                    }],
                    commands: {
                        "operator": $("#strategyOperator")
                    },
                    rowClicked: strategy.rowClicked,
                    commandClicked: strategy.oper,
                    insertBefore: function (row, rowdata) {
                        if (rowdata.state != "1") {
                            rowdata.__editable = false;
                            rowdata.__checkable = false;
                        }
                        if (Number(rowdata.number) > 0)
                            rowdata.__checkable = false;
                    },
                    data: {
                        empty: "目前还未对当前奖项设置策略。"
                    }
                });
                $("#lotterySelector").on("change", strategy.load);
                strategy.loaded = true;
            }
            if (currentSetting && currentSetting.config) {
                var itemsName = activityTypes[currentSetting.type].list;
                if (itemsName) {
                    strategy.data = $.map(currentSetting.config[itemsName], function (obj) {
                        return $.extend(true, {}, obj);
                    });
                    if ($.type(strategy.data) == "array" && strategy.data.length > 0) {
                        var ll = $("#lotteryList").empty(), citem = $("#lotterySet").datagrid("getSelected");
                        $.each(strategy.data, function (i, item) {
                            var isCur = (citem === null && i === 0) || citem.__rid === item.__rid;
                            if (isCur) {
                                $("#lotterySelector").cval(item.__rid).html(item.name);
                                citem = item;
                                strategy.load(null, item.__rid);
                            }
                            ll.append("<button value='{0}' class='{2}'>{1}</button>".format(item.__rid, item.name, isCur ? "selected" : ""));
                        });
                        document.body.classList.add("strategy");
                    }
                }
            }
        },
        rowClicked: function () {
            strategy.container.datagrid("disableCommand", "remove", strategy.container.datagrid("getCheckedCount") == 0);
        },
        /**
         * 加载指定奖项的策略
         * @param e
         * @param val
         */
        load: function (e, val) {
            strategy.container.datagrid("disableCommand", "remove");
            var _rules = null;
            if (val) {
                if ($.type(val) === "string") {
                    if (strategy.data) {
                        $.each(strategy.data, function (i, d) {
                            if (d.__rid === val) {
                                strategy.lottery = d;
                                if (!d.lotteryrule) d.lotteryrule = [];
                                _rules = d.lotteryrule;
                            }
                        });
                    }
                } else
                    _rules = val;

                strategy.container.datagrid("setData", _rules);
                strategy.cal();
            }
        },
        /**
         * 对策略进行操作
         * @param e
         * @param val
         * @returns {boolean}
         */
        oper: function (e, val) {
            switch (val) {
                case "add":
                    strategy.container.datagrid("insertData", strategy.default(), true);
                    strategy.cal();
                    break;
                case "remove":
                    strategy.container.datagrid("removeCheckedRow");
                    strategy.container.datagrid("disableCommand", "remove", strategy.container.datagrid("getCheckedCount") == 0);
                    strategy.cal();
                    break;
                default:
                    return true;
            }
        },
        /**
         * 检查编辑器
         */
        check: {
            /**
             * 数量设置检查
             * @param editor
             * @param val
             * @param rowValue
             */
            amount: function (editor, val, rowValue) {
                if (rowValue.number > 0) editor.attr("min", rowValue.number);
                var max = (Number(strategy.lottery.amount) - Number(strategy.lottery.number)) || 1;
                $.each(strategy.lottery.lotteryrule, function (i, rule) {
                    if (rowValue.__rid !== rule.__rid)
                        max -= Number(rule.amount) || 0;
                });
                editor.attr("max", max);
            },
            minDate: "",
            maxDate: "",
            /**
             * 开始日期检查
             * @param editor
             * @param val
             * @param rowValue
             */
            beginDate: function (editor, val, rowValue) {
                strategy.check.minDate = moment(currentSetting.begdate).startOf("day");
                strategy.check.maxDate = moment(rowValue.endtime);
                if (rowValue.number > 0) strategy.check.maxDate = moment(rowValue.begtime);
                var timeRange = strategy.check.timeRange(rowValue.begtime);
                var setting = {
                    "data-mindate": strategy.check.minDate.format(config.formats.date),
                    "data-maxdate": strategy.check.maxDate.format(config.formats.date)
                };
                editor.data("_expands", {
                    "onSelectDate": strategy.check.timeRange
                });
                if (timeRange.minTime) setting["data-mintime"] = timeRange.minTime;
                if (timeRange.maxTime) setting["data-maxtime"] = timeRange.maxTime;
                editor.attr(setting);
            },
            /**
             * 结束日期检查
             * @param editor
             * @param val
             * @param rowValue
             */
            endDate: function (editor, val, rowValue) {
                strategy.check.minDate = moment(rowValue.begtime);
                strategy.check.maxDate = moment(currentSetting.enddate).endOf("day");
                if (rowValue.number > 0) strategy.check.minDate = moment(rowValue.endtime);
                var timeRange = strategy.check.timeRange(rowValue.endtime);
                var setting = {
                    "data-mindate": strategy.check.minDate.format(config.formats.date),
                    "data-maxdate": strategy.check.maxDate.format(config.formats.date)
                };
                editor.data("_expands", {
                    "onSelectDate": strategy.check.timeRange
                });
                if (timeRange.minTime) setting["data-mintime"] = timeRange.minTime;
                if (timeRange.maxTime) setting["data-maxtime"] = timeRange.maxTime;
                editor.attr(setting);
            },
            /**
             * 时间范围检查
             * @param date
             * @param $i
             */
            timeRange: function (date, $i) {
                var res = {minTime: false, maxTime: false};
                if (date) {
                    var _d = moment(date).format(config.formats.date);
                    if (_d === strategy.check.minDate.format(config.formats.date)) res.minTime = strategy.check.minDate.format(config.formats.time);
                    if (_d === strategy.check.maxDate.format(config.formats.date)) res.maxTime = strategy.check.maxDate.format(config.formats.time);
                }
                if ($i && popup.config.current) {
                    var dt = popup.config.current.data("dt");
                    res.value = date;
                    if (dt && dt.setOptions)
                        dt.setOptions(res);
                } else
                    return res;
            }
        },
        cal: function () {
            if (strategy.lottery) {
                var usedAmount = 0;
                $.each(strategy.lottery.lotteryrule, function (i, rule) {
                    usedAmount += Number(rule.amount) || 0;
                });
                $("#strategy_add").prop("disabled", usedAmount >= Number(strategy.lottery.amount) - Number(strategy.lottery.number));
            }
        },
        /**
         * 更新数量
         * @param cell
         * @param newValue
         * @param rowValue
         * @returns {boolean}
         */
        updateAmount: function (cell, newValue, rowValue) {
            rowValue.amount = newValue;
            strategy.cal();
        }
    };

    /**
     * 时间
     */
    function timer() {
        if (timer_si)
            clearTimeout(timer_si);

        var d = moment(), remainingtime = 60 - d.second();
        $("#currentTime").text(d.format("HH:mm"));
        timer_si = setTimeout(timer, remainingtime * 1000);
    }

    /**
     * 当电话颜色发生改变
     * @param e
     */
    function onPhoneColorChanged(e) {
        var t = $(e.currentTarget), c = t.val();
        if (c) {
            t.addClass("selected").siblings().removeClass("selected");
            $("#phone").removeAllClass().addClass(c);
        }
    }

    /**
     * 更新预览内容
     */
    function updatePreview() {
        var res = getSolutionDetail(false);
        if (res && res.result) {
            $("#caption").text(res.result.shortname || "");
            try {
                document.getElementById("previewFrame").contentWindow.fill(res.result);
                /*document.getElementById("previewFrame").contentWindow.pageSetting(res.result);*/
            } catch (e) {
            }
        }
    }

    /**
     * 获取当前方案详细
     */
    function getSolution() {
        var id = localStorage.getItem("ls_enterprise_solution");
        if (id) {
            $("#preview").action({
                url: "project/get",
                data: {projectid: id}
            }).then(fillSolution, closeDetail);
        } else {
            document.body.classList.add("selecting");
            $("[name='_tb_type']").change(createSolution);
        }
    }

    /**
     * 创建新方案
     * @param e
     */
    function createSolution(e) {
        var v = $(e.currentTarget).val();
        if (v) {
            var now = moment();
            currentSetting = {
                percent: 1,
                type: v,
                begdate: now.format(config.formats.date),
                enddate: now.add(3, 'M').format(config.formats.date),
                customertype: 1,
                templatename: "newyear-2016",
                georequired: false,
                checktel: true,
                times: 0,
                config: {
                    rpitems: [],
                    qaitems: [],
                    pointitems: 1
                },
                state: "editing",
                qramounts: 1
            };
            fillSolution({data: currentSetting});
            document.body.classList.remove("selecting");
        }
    }

    /**
     * 获取方案内容
     * @param valition 是否验证内容
     * @param success 成功
     * @param fail 失败
     */
    function getSolutionDetail(valition) {
        valition = valition !== false;

        var res = null, hasError = false;
        if (currentSteps.length > 0) {
            res = $("#baseAttribute").serializeForm(false);
            $.each(currentSteps, function (i, s) {
                var _cr = $(".attribute[data-step='{0}']".format(s)).serializeForm(valition);
                if (_cr.hasError) {
                    hasError = true;
                    res = _cr;
                    res.step = i;
                    return false;
                } else
                    $.extend(true, res.result, _cr.result);
            });

            if (!hasError) {
                var ps = frame.get(0).contentWindow.pageSetting;
                if (ps) {
                    if (res.result.lotteryMode)
                        ps.lotteryMode = res.result.lotteryMode;

                    $.extend(true, res.result, {
                        content: JSON.stringify(ps)
                    });
                } else
                    res.result.content = currentSetting.content;
            }
        }
        return res;
    }

    /**
     * 保存方案
     */
    function saveSolution(e) {
        var res = getSolutionDetail(true);
        if (res) {
            if (res.hasError) {
                goStep(res.step);
                saveSolutionFailed({
                    code: top.errorCodes.unknow,
                    message: res.result
                });
            } else {
                $(e.currentTarget).action({
                    url: "project/update",
                    data: {
                        project: JSON.stringify(res.result)
                    }
                }, {
                    enable: false,
                    message: "正在保存"
                }).then(saveSolutionSuccess, saveSolutionFailed);

            }
        }
    }

    /**
     * 保存方案成功
     * @param d
     */
    function saveSolutionSuccess(d) {
        $("#attr-msg").notice(true, "保存活动方案设置成功！");
        if (d && d.data && d.data.projectid) {
            $("#projectid").val(d.data.projectid);
            setPreviewQRCode(d.data.qrid);
        }
    }

    /**
     * 保存方案失败
     * @param d
     */
    function saveSolutionFailed(err) {
        $("#attr-msg").notice(false, err.message || "保存活动方案设置失败！", -1);
    }

    /**
     * 应用模板
     */
    function setTemplate() {
        var oldTemplate = frame.data("currentTemplate");
        if (oldTemplate != currentSetting.templatename) {
            frame.data("currentTemplate", currentSetting.templatename);
            frame.attr("src", config.host.resource + "templates/" + currentSetting.templatename + ".html?isPreview=true");
        } else
            onPreviewFrameLoaded();
    }

    /**
     * 填充方案内容
     * @param d
     */
    function fillSolution(d) {
        if (d && d.data) {
            currentSetting = d.data;
            currentSteps = activityTypes[currentSetting.type].steps;
            setPreviewQRCode(d.data.qrid);
            $("#baseAttribute").parseData(currentSetting);
            $.each(currentSteps, function (i, c) {
                $(".attribute[data-step='{0}']".format(c)).parseData(currentSetting);
            });
            if (currentSetting.state !== activityStates.editing.code) {
                $(".attribute").setFormReadonly(true);
            }
            setTemplate();
            checkProjectDateRange();
        }
    }

    /**
     * 关闭方案详细面板
     * @param err
     */
    function closeDetail(err) {
        window.location.href = "solution.html";
    }

    /**
     * 当预览页面加载完成时
     * @param e
     */
    function onPreviewFrameLoaded(e) {
        if (currentSetting) {
            /*if (activityTypes[currentSetting.type].lottery === true)
             $("#lotteryModeSet").show();
             else
             $("#lotteryModeSet").hide();*/
            /*
             var _df = frame.get(0).contentWindow._defaultPageSetting;
             if (!currentSetting.content)
             footer.parseData(_df);
             else {
             var _ps = JSON.parse(currentSetting.content);
             if (_ps.extend) frame.get(0).contentWindow.applyExtendSetting(_ps.extend);
             footer.parseData($.extend(true, {}, _df, _ps));
             }*/

            updatePreview();
            goStep(0);
        }
    }

    /**
     * 跳至指定步骤
     * @param step boolean|int, true表示下一步, false表示上一下, int表示要跳至的步骤序号
     */
    function goStep(step) {
        /*if ($("input,textarea").hasClass("error")){
         $("#attr-msg").notice(false,"请先正确填写所有选项，才能进行下一步。")
         return
         }*/
        if (!($.type(currentSteps) === "array") || currentSteps.length === 0) return;
        var newStepInx = currentStepInx;
        if (step === true) newStepInx++;
        else if (step === false) newStepInx--;
        else if (!isNaN(step)) newStepInx = step;
        var newStepName = currentSteps[newStepInx];

        if (newStepInx >= 0 && newStepInx < currentSteps.length && newStepName !== currentStepName) {
            if (currentStepName) {
                var re = attrs.children("[data-step='{0}']".format(currentStepName)).serializeForm();
                if (re.hasError) {
                    $("#attr-msg").notice(false, re.result);
                    return false;
                }
            }

            $(".prev").prop("disabled", newStepInx === 0);
            $(".next").prop("disabled", newStepInx === currentSteps.length - 1);

            var inCls = "-se-in-scale",
                outCls = "-se-out-scale";
            if (currentAttributePanel) currentAttributePanel.removeAllClass().addClass("attribute").addClass(outCls);

            frame.get(0).contentWindow.goStep(newStepInx);

            currentStepInx = newStepInx;
            currentStepName = newStepName;
            currentAttributePanel = attrs.children("[data-step='{0}']".format(newStepName)).removeAllClass().addClass("attribute").addClass(inCls);
            set.init(newStepName);
        }
    }

    function checkProjectDateRange(e) {
        if (currentSetting.type === activityTypes.redpacket.name) {
            if (e) {
                var _t = $(e.currentTarget), _name = _t.attr("name");
                if (_name && _name in currentSetting)
                    currentSetting[_name] = _t.val();
            }

            var maxDate = moment(currentSetting.enddate).format(config.formats.date), minDate = moment(currentSetting.begdate).format(config.formats.date);
            var items = currentSetting.config[activityTypes[currentSetting.type].list];
            var _pbd = $("[data-role='project_begdate']").removeAttr("data-maxdate"),
                _ped = $("[data-role='project_enddate']").removeAttr("data-mindate");
            if ($.type(items) == "array") {
                $.each(items, function (j, item) {
                    $.each(item.lotteryrule, function (k, rule) {
                        var _bt = moment(rule.begtime).format(config.formats.date), _et = moment(rule.endtime).format(config.formats.date);
                        if (maxDate == false || maxDate > _bt) maxDate = _bt;
                        if (minDate == false || minDate < _et) minDate = _et;
                    });
                });
            }

            if (maxDate !== false)
                _pbd.attr("data-maxdate", maxDate);

            if (minDate !== false)
                _ped.attr("data-mindate", minDate);
        }

    }

    /**
     * 当点击页面上的按钮时
     * @param e
     */
    function onButtonClicked(e) {
        var t = $(e.currentTarget);
        v = t.val();
        switch (v) {
            case "prev":
                goStep(false);
                break;
            case "next":
                goStep(true);
                break;
            case "save":
                saveSolution(e);
                break;
            case "close":
                closeDetail();
                break;
            case "qrcode":
                t.toggleClass("detail");
                core.removeDocumentEventHandler(true, true, "click.qrcodePreview", closeQRCode);
                if (t.hasClass("detail"))
                    core.addDocumentEventHandler(true, true, "click.qrcodePreview", closeQRCode);
                return false;
                break;
            case "submitStrategy":
                try {
                    var items = currentSetting.config[activityTypes[currentSetting.type].list];
                    $.each(strategy.data, function (i, d) {
                        $.each(items, function (j, item) {
                            if (d.__rid === item.__rid) {
                                item.lotteryrule = d.lotteryrule;
                            }
                        });
                    });
                    checkProjectDateRange();
                } catch (e) {
                }
                document.body.classList.remove("strategy");
                break;
            case "cancelStrategy":
                document.body.classList.remove("strategy");
                break;
            case "save-extend":
                updateExtendElement(true);
                cancelEditExtendElement();
                break;
            case "cancel-extend":
                cancelEditExtendElement();
                break;
        }
    }

    function closeQRCode() {
        $("#preview_qrcode").removeClass("detail");
    }


    function clearImages(e, source) {
        $(e.currentTarget).clearData();
        if (source) {
            var bi = $(source).css("backgroundImage"), matchs = /^url\("?([^"]+)"?\);?$/ig.exec(bi);
            if (matchs && matchs.length > 1)
                $("#internetFileSelector").val(matchs[1]);
        }
        $("#localFileSelector").fileSelector("clear");
        $("#pictureSelectorTab_Internet").click();
        return false;
    }

    function onInternetImageChanged(e) {
        popup.config.currentData = null;
        popup.config.source.cval($(e.currentTarget).val());
        popup.close();
        updateExtendElement();
    }

    function onLocalFileUploaded(d) {
        if (d && d.data && $.type(d.data) === "array" && d.data.length > 0) {
            popup.config.currentData = null;
            popup.config.source.cval(config.host.resource + d.data[0].path);
            popup.close();
            updateExtendElement();
        }
    }

    function removeImage(e) {
        popup.config.currentData = null;
        popup.config.source.cval("");
        popup.close();
        updateExtendElement();
        return false;
    }

    module.init = function () {
        if (!loaded) {
            navigation.direction("solution");
            lottery.init();
            question.init();
            $("#lotteryPercent").mousemove(lottery.updatePercent);
            $("#lotteryPercentNumber").blur(lottery.updatePercentNumber);
            $("#phoneColors").on("click", "> button", onPhoneColorChanged);
            $("#attributes button, #attributes input, #attributes textarea").on("change", updatePreview);
            $("#extendSetting button").on("change", updateExtendElement);
            $(document.body).on("click", "button", onButtonClicked);
            $("[data-role='project_begdate'], [data-role='project_enddate']").on("change", checkProjectDateRange);

            $("#pictureSelector").bind("opening", clearImages);
            $("#internetFileSelector").change(onInternetImageChanged);
            $("#localFileSelector").fileSelector({
                accept: "image/*",
                name: "localImage",
                upload: {
                    enable: true,
                    url: "project/uploadimage",
                    success: onLocalFileUploaded,
                    fail: null
                },
                maxSize: 2048000,
                attr: {
                    url: {
                        placeholder: "选择选择本地图片"
                    },
                    uploader: {
                        "data-lang": "上传"
                    }
                }
            });
            $("#clearPicture").click(removeImage);

            frame.load(onPreviewFrameLoaded);
            timer();
            loaded = true;
        }
        getSolution();
    };


    /**
     * 设置预览用二维码
     * @param c
     */
    function setPreviewQRCode(c) {
        if (c) {
            $("#preview_qrcode").prop("disabled", false);
            $("#previewQRCodeImg").empty().qrcode({
                text: config.host.service.preview + "p.html?id=" + c,
                width: 200,
                height: 200,
                background: "transparent",
                correctLevel: 1
            });
        } else {
            $("#preview_qrcode").prop("disabled", true);
        }
    }

    /**
     * 更新页面元素
     * @param apply 是否应用当前设置
     */
    function updateExtendElement(apply) {
        var res = $("#extendSetting").serializeForm(false);
        if (res.result && res.result.id) {
            var setting = {};
            setting[res.result.id] = res.result;
            frame.get(0).contentWindow.applyExtendSetting(setting, apply);
        }
    }

    function editExtendElement(setting) {
        if (setting) {
            $(document.body).addClass("extending");
            $("#extendSetting").parseData(setting);
        }
    }

    function cancelEditExtendElement(cancelState) {
        $(document.body).removeClass("extending");
        if (cancelState !== false)
            frame.get(0).contentWindow.cancelEditExtendElement(false);
    }

    module.goStep = goStep;

    window.enterprise = {
        solution: {
            detail: module
        }
    };

    window.editExtendElement = editExtendElement;
    window.cancelEditExtendElement = cancelEditExtendElement;

    return module;
});