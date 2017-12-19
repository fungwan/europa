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
            return {name: "Untitled", amount: 1, price: 1, summoney: 1};
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
                                    "data-required": true,
                                    "maxlength": "10"
                                }
                            }
                        },
                        {
                            caption: "数量",
                            width: 100,
                            field: "amount",
                            editable: true,
                            dataType: "numeric",
                            changed: lottery.updateAmount,
                            editor: {
                                type: "text",
                                params: {
                                    "data-required": true,
                                    "data-expression": "positiveNumber"
                                }
                            }
                        },
                        {
                            caption: "金额",
                            width: 100,
                            field: "price",
                            editable: true,
                            dataType: "numeric",
                            changed: lottery.updatePrice,
                            editor: {
                                type: "text",
                                params: {
                                    "data-required": true,
                                    "data-expression": "positiveNumber"
                                }
                            }
                        },
                        {caption: "小计", width: 150, field: "summoney", dataType: "numeric"}
                    ],
                    commands: {
                        "operator": $("#lotteryOperator"),
                        "counter": $("#lotteryCounter")
                    },
                    commandClicked: lottery.oper,
                    data: {
                        empty: "点击添加按钮来增加奖项，至少要有一个奖项。"
                    }
                });
                lotterySetLoaded = true;
            }

            if (currentSetting) {
                lottery.cal();
                lottery.container.datagrid("setData", currentSetting.config.rpitems);
            }
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

            $.each(currentSetting.config.rpitems, function (i, item) {
                lottery.total += item.summoney;
                lottery.amounts += item.amount;
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
         * 更新信息
         */
        updateInfo: function () {
            $("#lotteryPriceTotal").text(lottery.total.formatMoney());
            $("#lotteryPercent").attr("data-tip", Math.round(lottery.percent * 100) + "%");
            $("#lotteryQrcodeTotal").text("(奖次){0} ÷ (中奖率){1} ≈ {2}".format(lottery.amounts, lottery.percent, Math.ceil(lottery.amounts / lottery.percent)));
        },
        /**
         * 更新游戏内容
         */
        updateGame: function (cell, newValue, rowValue) {
            if (rowValue)
                rowValue.name = newValue;

            if (frame.get(0).contentWindow.lotterys)
                frame.get(0).contentWindow.lotterys.set(currentSetting.config.rpitems);
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
                    lottery.container.datagrid("removeSelectedRow");
                    lottery.cal();
                    break;
                case "strategy":
                    strategy.open();
                    break;
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
                                type: "text",
                                params: {
                                    "data-required": true,
                                    "data-expression": "int",
                                    "maxlength": 2
                                }
                            }
                        },
                        {
                            caption: "问题",
                            width: 200,
                            field: "name",
                            editable: true,
                            dataType: "string",
                            editor: {
                                type: "text",
                                params: {
                                    "data-required": true,
                                    "maxlength": 200
                                }
                            }
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
                                    "data-required": true,
                                    "data-type": "selector",
                                    "data-popup": "answerTypes"
                                }
                            }
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
                                    "data-required": true,
                                    "maxlength": 300
                                }
                            }
                        }
                    ],
                    commands: {
                        "operator": $("#questionOperator")
                    },
                    commandClicked: question.oper,
                    data: {
                        empty: "点击添加按钮来增加问卷项，至少要有一个问卷项。"
                    }
                });
                questionSetLoaded = true;
            }

            if (currentSetting) {
                question.cal();
                question.container.datagrid("setData", currentSetting.config.qaitems);
            }
        },
        /**
         * 对问题序号进行计算
         */
        cal: function () {
            question.maxOrder = 0;
            $.each(currentSetting.config.qaitems, function (i, item) {
                if (item.number > question.maxOrder) question.maxOrder = item.number;
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
         * 更新游戏内容
         */
        updateGame: function () {
            if (frame.get(0).contentWindow.lotterys)
                frame.get(0).contentWindow.lotterys.set(currentSetting.config.qaitems);
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
         * 生成默认的策略
         */
        default: function () {
            var now = moment();
            return {
                area: "1101",
                begtime: now.format(config.formats.datetime),
                endtime: now.add(1, "d").format(config.formats.datetime),
                amount: 1,
                state: "1",
                ruletype: "1"
            };
        },
        /**
         * 打开策略设定
         */
        open: function () {
            if (!strategy.loaded) {
                strategy.container = $("#strategyList");
                strategy.container.datagrid({
                    columns: [{
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
                        width: 160,
                        field: "begtime",
                        editable: true,
                        dataType: "string",
                        editor: {
                            type: "select",
                            params: {
                                "data-required": true,
                                "data-type": "datepicker",
                                "data-popup": "datepicker",
                                "data-level": "top",
                                "data-format": config.formats.datetime,
                                "data-expression": "enterprise.solution.detail.check.strategyBegTime"
                            }
                        }
                    }, {
                        caption: "结束时间",
                        width: 160,
                        field: "endtime",
                        editable: true,
                        dataType: "string",
                        editor: {
                            type: "select",
                            params: {
                                "data-required": true,
                                "data-type": "datepicker",
                                "data-popup": "datepicker",
                                "data-level": "top",
                                "data-format": config.formats.datetime,
                                "data-expression": "enterprise.solution.detail.check.strategyEndTime"
                            }
                        }
                    }, {
                        caption: "数量",
                        width: 80,
                        field: "amount",
                        editable: true,
                        dataType: "numeric",
                        editor: {
                            type: "text",
                            params: {
                                "data-required": true,
                                "data-expression": "int",
                                "data-expression": "enterprise.solution.detail.check.strategyAmount"
                            }
                        }
                    }, {
                        caption: "方式",
                        width: 120,
                        field: "ruletype",
                        editable: true,
                        dataType: "string",
                        editor: {
                            type: "select",
                            params: {
                                "data-required": true,
                                "data-type": "selector",
                                "data-popup": "ruleTypes"
                            }
                        }
                    }],
                    commands: {
                        "operator": $("#strategyOperator")
                    },
                    commandClicked: strategy.oper,
                    data: {
                        empty: "目前还未对当前奖项设置策略。"
                    }
                });
                $("#lotterySelector").change(strategy.load);
                strategy.loaded = true;
            }
            if (currentSetting && currentSetting.config) {
                var itemsName = activityTypes[parent.enterprise.solution.currentType].list;
                if (itemsName) {
                    var _items = currentSetting.config[itemsName];
                    if ($.type(_items) == "array" && _items.length > 0) {
                        var ll = $("#lotteryList").empty(), citem = $("#lotterySet").datagrid("getSelected");
                        $.each(_items, function (i, item) {
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
        /**
         * 加载指定奖项的策略
         * @param e
         * @param val
         */
        load: function (e, val) {
            var _rules = null;
            if (val) {
                if ($.type(val) === "string") {
                    var itemsName = activityTypes[parent.enterprise.solution.currentType].list;
                    if (itemsName) {
                        var _items = currentSetting.config[itemsName];
                        if ($.type(_items) == "array" && _items.length > 0) {
                            $.each(_items, function (i, d) {
                                if (d.__rid === val) {
                                    if (!d.lotteryrule) d.lotteryrule = [];
                                    _rules = d.lotteryrule;
                                }
                            });
                        }
                    }
                } else
                    _rules = val;

                strategy.container.datagrid("setData", _rules);
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
                    break;
                case "remove":
                    strategy.container.datagrid("removeSelectedRow");
                    break;
                default:
                    return true;
            }
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
        if (parent.enterprise.solution.current) {
            $("#preview").action({
                url: "project/get",
                data: {projectid: parent.enterprise.solution.current}
            }).then(fillSolution, closeDetail);
        } else {
            var now = moment();
            currentSetting = {
                percent: 1,
                type: parent.enterprise.solution.currentType,
                begdate: now.format(config.formats.date),
                enddate: now.add(3, 'M').format(config.formats.date),
                customertype: 1,
                templatename: "newyear-2016"
            };
            fillSolution({data: currentSetting});
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
                var ps = footer.serializeForm(false);
                $.extend(true, res.result, {
                    content: JSON.stringify(ps.result)
                });
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

        document.body.classList.remove("strategy");
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
            top.enterprise.editing.solutionDetail = "活动方案设置：" + (d.data.name || "Untitled");
            currentSetting = d.data;
            currentSteps = activityTypes[currentSetting.type].steps;
            setPreviewQRCode(d.data.qrid);
            $("#baseAttribute").parseData(currentSetting);
            $.each(currentSteps, function (i, c) {
                $(".attribute[data-step='{0}']".format(c)).parseData(currentSetting);
            });
            setTemplate();
        }
    }

    /**
     * 关闭方案详细面板
     * @param err
     */
    function closeDetail(err) {
        delete top.enterprise.editing["solutionDetail"];
        parent.enterprise.solution.openPage();
    }

    /**
     * 当预览页面加载完成时
     * @param e
     */
    function onPreviewFrameLoaded(e) {
        if (currentSetting) {
            if (activityTypes[currentSetting.type].lottery === true)
                $("#lotteryModeSet").show();
            else
                $("#lotteryModeSet").hide();

            if (!currentSetting.content)
                footer.parseData(frame.get(0).contentWindow._defaultPageSetting);
            else
                footer.parseData(JSON.parse(currentSetting.content));

            updatePreview();
            goStep(0);
        }
    }

    /**
     * 跳至指定步骤
     * @param step boolean|int, true表示下一步, false表示上一下, int表示要跳至的步骤序号
     */
    function goStep(step) {
        if (!($.type(currentSteps) === "array") || currentSteps.length === 0) return;
        var newStepInx = currentStepInx;
        if (step === true) newStepInx++;
        else if (step === false) newStepInx--;
        else if (!isNaN(step)) newStepInx = step;
        var newStepName = currentSteps[newStepInx];
        if (newStepInx >= 0 && newStepInx < currentSteps.length && newStepName !== currentStepName) {
            $(".prev").prop("disabled", newStepInx === 0);
            $(".next").prop("disabled", newStepInx === currentSteps.length - 1);

            var inCls = newStepInx < currentStepInx ? "-se-in-slide-left" : "-se-in-slide-right",
                outCls = newStepInx < currentStepInx ? "-se-out-slide-right" : "-se-out-slide-left";
            if (currentAttributePanel) currentAttributePanel.removeAllClass().addClass("attribute").addClass(outCls);

            frame.get(0).contentWindow.goStep(newStepInx);

            currentStepInx = newStepInx;
            currentStepName = newStepName;
            currentAttributePanel = attrs.children("[data-step='{0}']".format(newStepName)).removeAllClass().addClass("attribute").addClass(inCls);
            set.init(newStepName);
        }
    }

    /**
     * 当点击页面上的按钮时
     * @param e
     */
    function onButtonClicked(e) {
        switch ($(e.currentTarget).val()) {
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
        }
    }

    module.init = function () {
        if (!loaded) {
            lottery.init();
            $("#lotteryPercent").mousemove(lottery.updatePercent);
            $("#phoneColors").on("click", "> button", onPhoneColorChanged);
            $(".attribute button, .attribute input, .attribute textarea, .footer button, .footer input, .footer textarea").on("change", updatePreview);
            $(document.body).on("click", "button", onButtonClicked);
            frame.load(onPreviewFrameLoaded);
            timer();
            loaded = true;
        }
        getSolution();
    };

    /**
     * 检验
     * @type {{}}
     */
    module.check = {
        /**
         * 策略开始日期检测
         */
        "strategyBegTime": function (v, t) {
            if (currentSetting) {
                if (v < currentSetting.begdate)
                    return "策略的开始时间不能小于活动的开始时间";
                else if (v > currentSetting.enddate)
                    return "策略的开始时间不能在于活动的结束时间";
                else {
                    var rowData = t.parentsUntil(".rows", ".row").data("d");
                    if (rowData.endtime < v) {
                        return "开始时间不能小于结束时间";
                    }
                }
            }
            return "";
        }
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

    module.goStep = goStep;

    return module;
});