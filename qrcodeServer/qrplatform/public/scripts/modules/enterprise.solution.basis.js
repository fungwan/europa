define(function () {
    var module = {}, loaded = false;
    var isEditing = false;

    function toFixed(input, len) {
        if (isNaN(input)) return "";
        len = len || 2;
        return Number(input).toFixed(len);
    }

    function noticeFail(err) {
        $("#attr-msg").notice(false, err.message || "保存活动方案设置失败！", -1);
    }

    function noticeSuccess() {
        $("#attr-msg").notice(true, "保存活动方案设置成功！");
    }

    function clearNotice() {
        $("#attr-msg").text("");
    }

    // 隐藏下一步和保存
    function hideNextAndSave() {
        $("button[value=save], button[value=next]").hide();
        $("button[value=prev]").off("click").unbind("click").on("click", function () {
            if (isEditing) {
                moduleManagement.lastStep();
            } else {
                moduleManagement.lastStepWithoutSave();
            }
        });
    }
    // 显示下一步和保存
    function showNextAndSave() {
        $("button[value=save], button[value=next]").show();
        $("button[value=prev]").off("click").unbind("click").on("click", function () {
            if (isEditing) {
                moduleManagement.lastStep();
            } else {
                moduleManagement.lastStepWithoutSave();
            }
        });
    }

    // 加载信息模块
    var loadModule = (function () {
        // 加载原有基础信息
        var _loadBasisData = function () {
            var dtd = $.Deferred();
            var projectid = $("#projectid").val();
            $("#attributesPanel").action({
                url: "project/get",
                data: {
                    projectid: projectid
                }
            }).then(function (resp) {
                dtd.resolve(resp);
            }, function (error) {
                dtd.reject(error);
            });
            return dtd.promise();
        };

        // 加载原有奖项配置信息
        var _loadLotteryData = function (type) {
            var dtd = $.Deferred();
            var projectid = $("#projectid").val();
            $("#attributesPanel").action({
                url: "project/lottery/get",
                data: {
                    type: type,
                    projectid: projectid
                }
            }).then(function (resp) {
                dtd.resolve(resp);
            }, function (error) {
                dtd.reject(error);
            });
            return dtd.promise();
        };

        return {
            loadBasisData: _loadBasisData,
            loadLotteryData: _loadLotteryData
        };
    }());

    // 基础信息模块
    var basisModule = (function () {
        // 创建活动时，初始化日期选择控件
        var _initEmptyDate = function () {
            var now = moment();
            var begdate = now.format(config.formats.date);
            var enddate = now.add(3, "M").format(config.formats.date);
            $("[name=begdate]").val(begdate).text(begdate);
            $("[name=enddate]").val(enddate).text(enddate);
        };

        // 初始化活动积分和满减优惠
        var _initPointAndPreferential = function () {
            $("#idPointType").change(function () {
                var value = $(this).val();
                if (value == "0") {
                    $(".point-container-group-value").show();
                } else {
                    $(".point-container-group-value").hide();
                }
            });
            // 参与活动获得积分checkbox
            $("#idPointGive").change(function () {
                var value = $(this).prop("checked");
                if (value) {
                    $(".point-container-group").show();
                    $("#idPointType").change();
                } else {
                    $(".point-container-group").hide();
                }
            });
            $("#idPointGive").change();
            // 参与购物满减checkbox
            $("#idPreferential").change(function () {
                var value = $(this).prop("checked");
                if (value) {
                    $(".preferential-container-group").show();
                } else {
                    $(".preferential-container-group").hide();
                }
            });
            $("#idPreferential").change();
        };

        // 保存营销活动基本信息
        // TODO 数据校验
        // @return promise
        var _saveBasisInfo = function () {
            var dtd = $.Deferred();
            var data = {
                projectid: $("#projectid").val(),
                name: $("[name=name]").val(),
                shortname: $("[name=shortname]").val(),
                begdate: $("[name=begdate]").val(),
                enddate: $("[name=enddate]").val(),
                content: "",
                templatename: "newyear-2016",
                georequired: $("[name=georequired]").prop("checked"),
                description: $("[name=description]").val(),

                // 目前不再使用这两个参数
                checktel: $("[name=checktel]").prop("checked"),
                // times: $("[name=times]").val()
            };
            // 判断起止时间是否合格
            var begdate = $("[name=begdate]").val(),
                enddate = $("[name=enddate]").val();

            if (moment(begdate) > moment(enddate)) {
                dtd.reject("DATE_ERROR");
                return dtd.promise();
            }

            $("#attributesPanel").action({
                url: "project/update",
                data: {
                    project: JSON.stringify(data)
                }
            }).then(function (resp) {
                dtd.resolve(resp);
            }, function (error) {
                dtd.reject(error);
            });
            return dtd.promise();
        };

        // 保存积分设置
        // TODO 数据校验
        var _savePoint = function () {
            var dtd = $.Deferred();
            var data = {
                projectid: $("#projectid").val(),
                type: "propoint", // 积分
                enable: $("#idPointGive").prop("checked"),
                config: {
                    pointitems: {
                        pointtype: $("#idPointType").val(), // 积分类型
                        point: parseInt($("#idPointValue").val() || 0) // 积分值,
                    }
                }
            };
            $("#attributesPanel").action({
                url: "project/lottery/update",
                data: {
                    lottery: JSON.stringify(data)
                }
            }).then(function (resp) {
                dtd.resolve(resp);
            }, function (error) {
                dtd.reject(error);
            });
            return dtd.promise();
        };

        // 保存满减信息
        // TODO 数据校验
        var _savePreferential = function () {
            var dtd = $.Deferred();
            var data = {
                projectid: $("#projectid").val(),
                type: "prosale", // 满减
                enable: $("#idPreferential").prop("checked"),
                config: {
                    saleitems: {
                        conditiontype: $("#idPreferentialType").val(), // 0: 全场, 1: 同类
                        condition: parseInt($("#idPreferentialCount").val() || 0),
                        redpacket: parseInt($("#idPreferentialAmount").val() || 0)
                    }
                }
            };
            $("#attributesPanel").action({
                url: "project/lottery/update",
                data: {
                    lottery: JSON.stringify(data)
                }
            }).then(function (resp) {
                dtd.resolve(resp);
            }, function (error) {
                dtd.reject(error);
            });
            return dtd.promise();
        };

        var _module = {};
        _module.show = function () {
            $("[data-step=base]").addClass("-se-in-scale");
        };
        _module.hide = function () {
            $("[data-step=base]").removeClass("-se-in-scale");
        };
        _module.init = function () {
            showNextAndSave();
            clearNotice();
            _initEmptyDate();
            _initPointAndPreferential();
            // 数据初始化...
            if ($("#projectid").val()) {
                loadModule.loadBasisData().then(function (resp) {
                    if (resp && resp.data) {
                        var begdate = resp.data.begdate.split(" ")[0];
                        var enddate = resp.data.enddate.split(" ")[0];

                        $("[name=name]").val(resp.data.name);
                        $("[name=shortname]").val(resp.data.shortname);
                        $("[name=begdate]").val(begdate).text(begdate);
                        $("[name=enddate]").val(enddate).text(enddate);
                        $("[name=georequired]").prop("checked", resp.data.georequired);
                        $("[name=description]").val(resp.data.description);
                        // 目前不再使用这两个参数
                        $("[name=checktel]").prop("checked", resp.data.checktel);
                        // $("[name=times]").val(resp.data.times);
                    };
                    return loadModule.loadLotteryData("propoint");
                }).then(function (resp) {
                    if (resp && resp.data) {
                        var config = resp.data.config;
                        resp.data.enable && ($("#idPointGive").prop("checked", true));
                        $("#idPointGive").change();

                        $("#idPointType").val(config.pointitems.pointtype);
                        if (config.pointitems.pointtype == "0") {
                            $("#idPointType").text("固定积分");
                        } else if (config.pointitems.pointtype == "1") {
                            $("#idPointType").text("商品预设积分");
                        } else if (config.pointitems.pointtype == "2") {
                            $("#idPointType").text("双倍商品积分");
                        }
                        resp.data.enable && ($("#idPointType").change());

                        $("#idPointValue").val(config.pointitems.point);
                    }
                    return loadModule.loadLotteryData("prosale");
                }, function (error) {
                    // 没有对应的配置
                    if (error.code == "notexist") {
                        $("#idPointGive").prop("checked", false);
                    }
                    return loadModule.loadLotteryData("prosale");
                }).then(function (resp) {
                    if (resp && resp.data) {
                        var config = resp.data.config;
                        resp.data.enable && ($("#idPreferential").prop("checked", true));
                        $("#idPreferential").change();

                        $("#idPreferentialType").val(config.saleitems.conditiontype);
                        if (config.saleitems.conditiontype == "0") {
                            $("#idPreferentialType").text("全场商品");
                        } else if (config.saleitems.conditiontype == "1") {
                            $("#idPreferentialType").text("同类商品");
                        }
                        $("#idPreferentialType").change();

                        $("#idPreferentialCount").val(config.saleitems.condition);
                        $("#idPreferentialAmount").val(config.saleitems.redpacket);
                    }
                }, function (error) {
                    if (error.code == "notexist") {
                        $("#idPreferential").prop("checked", false);
                    }
                });
            }
        };
        // save必须返回jquery defered;
        _module.save = function () {
            var dtd = $.Deferred();

            clearNotice();
            if ($("div[data-step=base]").find("div:not(hidden) input.error").length > 0) {
                var error = new Error("输入有误，请先进行修改！");
                noticeFail(error);
                dtd.reject(error);
                return dtd.promise();
            }

            _saveBasisInfo().then(function (resp) {
                $("#projectid").val(resp.data.projectid);
                return _savePoint();
            }).then(function (resp) {
                return _savePreferential();
            }).then(function (resp) {
                console.info("请求成功");
                dtd.resolve(resp);
            }).fail(function (error) {
                console.info("请求失败");

                if (error == "DATE_ERROR") {
                    noticeFail(new Error("活动起始时间应该小于或等于活动结束时间，请修改后重试！"));
                } else if (error.code == "exists") {
                    noticeFail(new Error("活动名称已被占用，请选择其他活动名称！"));
                } else {
                    noticeFail(new Error("保存活动方案设置失败，请检查参数后重试！"));
                }

                dtd.reject(error);
            });
            return dtd.promise();
        };
        return _module;
    }());

    // 活动商品分类选择模块
    var commondityModule = (function () {
        // 获取自定义商品分类列表
        var _loadCommondityList = function () {
            var dtd = $.Deferred();
            $("#attributesPanel").action({
                url: "mcdManage/getCategoryListEx",
                data: {
                    projectid: $("#projectid").val(),
                    page: 1,
                    size: 10000
                }
            }).done(function (resp) {
                dtd.resolve(resp);
            }).fail(function (error) {
                dtd.reject(error);
            });
            return dtd.promise();
        };

        // 获取已参与活动商品类别列表
        var _loadUsedCommondityList = function () {
            var dtd = $.Deferred();
            $("#attributesPanel").action({
                url: "mcdManage/getCtgListSelected",
                data: {
                    projectid: $("#projectid").val()
                }
            }).done(function (resp) {
                dtd.resolve(resp);
            }).fail(function (error) {
                dtd.reject(error);
            });
            return dtd.promise();
        };

        var _saveCommondity = function () {
            var dtd = $.Deferred();
            var ids = [];
            var items = $("[name=commondity]:checked");
            var len = items.length;
            for (var i = 0; i < len; i++) {
                ids.push($(items[i]).val());
            }
            if (ids.length == 0) {
                var error = new Error("请选择商品分类");
                noticeFail(error);
                dtd.reject(error);
                return dtd.promise();
            }
            $("#attributesPanel").action({
                url: "mcdManage/updateCtgListSelected",
                data: {
                    projectid: $("#projectid").val(),
                    ctgid: JSON.stringify({ list: ids })
                }
            }).done(function (resp) {
                dtd.resolve(resp);
            }).fail(function (error) {
                noticeFail("保存活动方案设置失败，请重试！");
                dtd.reject(error);
            });
            return dtd.promise();
        };

        var _module = {};
        _module.show = function () {
            $("[data-step=commondity]").addClass("-se-in-scale");
        };
        _module.hide = function () {
            $("[data-step=commondity]").removeClass("-se-in-scale");
        };
        _module.init = function () {
            clearNotice();
            // 判断是否编辑状态
            if (isEditing) {
                _loadCommondityList().then(function (resp) {
                    var html = "";
                    var len = resp.data.data.length;
                    for (var i = 0; i < len; i++) {
                        var categoryid = resp.data.data[i].categoryid,
                            name = resp.data.data[i].name;
                        html += '<div class="editorItem" style="min-width: 150px;">'
                            + '<input type="checkbox" class="labelLinkCheckbox"'
                            + ' data-type="bool" name="commondity" id="' + categoryid + '"'
                            + ' value="' + categoryid + '">'
                            + '<label for="' + categoryid + '">' + name + '</label>'
                            + '</div>';
                    }
                    if (html == "") {
                        html = "没有满足条件的商品分类";
                        hideNextAndSave();
                    } else {
                        showNextAndSave();
                    }
                    $("[data-step=commondity] > .editorGroup").html(html);
                    return _loadUsedCommondityList();
                }).then(function (resp) {
                    var len = resp.data.length;
                    for (var i = 0; i < len; i++) {
                        var categoryid = resp.data[i].categoryid;
                        $("#" + categoryid).prop("checked", true);
                    }

                    disableInput();
                }).fail(function (error) {
                    console.info(error);
                });
            } else {
                // 非编辑状态
                _loadUsedCommondityList().then(function (resp) {
                    var html = "";
                    var len = resp.data.length;
                    for (var i = 0; i < len; i++) {
                        var categoryid = resp.data[i].categoryid,
                            name = resp.data[i].mcdcategory ? resp.data[i].mcdcategory.name : "";
                        html += '<div class="editorItem" style="min-width: 150px;">'
                            + '<input type="checkbox" class="labelLinkCheckbox"'
                            + ' data-type="bool" name="commondity" id="' + categoryid + '"'
                            + ' value="' + categoryid + '" checked>'
                            + '<label for="' + categoryid + '">' + name + '</label>'
                            + '</div>';
                    }
                    if (html == "") {
                        html = "没有已选择的商品分类";
                        hideNextAndSave();
                    } else {
                        showNextAndSave();
                    }
                    $("[data-step=commondity] > .editorGroup").html(html);

                    disableInput();
                }).fail(function (error) {
                    console.log(error);
                });
            }
        };
        _module.save = function () {
            return _saveCommondity();
        };
        return _module;
    }());

    // 问卷调查模块
    var questionModule = (function () {
        // 初始化切换datagrid显示
        var _initToggleEnable = function () {
            $("#idQuestionEnable").change(function () {

                var value = $(this).prop("checked");
                if (value) {
                    $("#idQuestionDatagrid").show();
                } else {
                    $("#idQuestionDatagrid").hide();
                }
            });
            $("#idQuestionEnable").change();
        };

        // 问题datagrid模块
        var _datagridModule = (function () {
            // 空数据
            var dataList = [];
            // 元素
            var $element = $("#questionSet");
            // 初始化
            var _inited = false;
            // 最大序号
            var _maxOrder = 0;
            // 计算序号
            var _calculateOrder = function () {
                _maxOrder = 0;
                $.each(dataList, function (index, item) {
                    if ((Number(item.number) || 0) > _maxOrder) {
                        _maxOrder = item.number;
                    }
                });
            };
            // 生成默认记录
            var _genDefault = function () {
                return {
                    number: ++_maxOrder,
                    name: "输入问题内容",
                    qatype: "1",
                    answer: "输入答案"
                };
            };
            // 命令点击事件
            var _commandClick = function (event, value) {
                switch (value) {
                    case "add":
                        _calculateOrder();
                        $element.datagrid("insertData", _genDefault(), true);
                        break;
                    case "remove":
                        $element.datagrid("removeSelectedRow");
                        _calculateOrder();
                        $element.datagrid("disableCommand", "remove", true);
                        break;
                }
            };
            // 行点击事件
            var _rowClicked = function () {
                $element.datagrid("disableCommand", "remove", false);
            };
            // 更新序号
            var _updateOrder = function (cell, newValue, rowValue) {
                rowValue.number = newValue;
                _calculateOrder();
                return false;
            };
            // 更新问题
            var _updateQuestion = function (cell, newValue, rowValue) {
                rowValue.name = newValue;
                return false;
            };
            // 更新问题类型
            var _updateType = function (cell, newValue, rowValue) {
                rowValue.qatype = newValue;
                return false;
            };
            // 更新答案
            var _updateAnswer = function (cell, newValue, rowValue) {
                rowValue.answer = newValue;
                return false;
            };

            var _init = function () {
                if (_inited) {
                    return;
                }
                $element.datagrid({
                    columns: [
                        {
                            caption: "序号",
                            width: 50,
                            field: "number",
                            editable: isEditing,
                            dataType: "numeric",
                            editor: {
                                type: "number",
                                params: {
                                    required: "required",
                                    min: 1,
                                    max: 20,
                                    "data-validateKey": "integer"
                                }
                            },
                            changed: _updateOrder
                        },
                        {
                            caption: "问题",
                            width: 180,
                            field: "name",
                            editable: isEditing,
                            dataType: "string",
                            editor: {
                                type: "text",
                                params: {
                                    "required": "required",
                                    "maxlength": 50
                                }
                            },
                            changed: _updateQuestion
                        },
                        {
                            caption: "答题方式",
                            width: 80,
                            field: "qatype",
                            editable: isEditing,
                            dataType: "string",
                            editor: {
                                type: "select",
                                params: {
                                    "required": "required",
                                    "data-type": "selector",
                                    "data-popup": "answerTypes"
                                }
                            },
                            changed: _updateType
                        },
                        {
                            caption: "答案",
                            width: 200,
                            field: "answer",
                            editable: isEditing,
                            dataType: "string",
                            editor: {
                                type: "text",
                                params: {
                                    "required": "required",
                                    "maxlength": 500
                                }
                            },
                            changed: _updateAnswer
                        }
                    ],
                    commands: {
                        "operator": $("#questionOperator")
                    },
                    rowClicked: _rowClicked,
                    commandClicked: _commandClick,
                    data: {
                        empty: "点击添加按钮来增加问卷项，至少要有一个问卷项。"
                    }
                });
                $element.datagrid("setData", dataList);
                disableDatagridCommand($element);
                _inited = true;
            };

            // 返回问题数剧列表/init方法
            return {
                init: function () {
                    _init();
                },
                get data() {
                    return dataList;
                },
                // 设置数据
                setData: function (data) {
                    dataList = [];
                    $element.datagrid("setData", dataList);
                    for (var i = 0; i < data.length; i++) {
                        $element.datagrid("insertData", {
                            number: data[i].number,
                            name: data[i].name,
                            qatype: data[i].qatype,
                            answer: data[i].answer
                        });
                    }
                    disableDatagridClick($element);
                }
            };
        }());

        var _module = {};
        _module.show = function () {
            $("[data-step=question]").addClass("-se-in-scale");
        };
        _module.hide = function () {
            $("[data-step=question]").removeClass("-se-in-scale");
        };
        _module.init = function () {
            clearNotice();
            _initToggleEnable();
            _datagridModule.init();
            loadModule.loadLotteryData("proquestion").then(function (resp) {
                console.log(resp);
                var enable = resp.data.enable, config = resp.data.config;
                enable && ($("#idQuestionEnable").prop("checked", true));
                $("#idQuestionEnable").change();

                _datagridModule.setData(config.qaitems);
            }, function (error) {
                if (error.code == "notexist") {
                    $("#idQuestionEnable").prop("checked", false);
                }
            });
        };
        _module.save = function () {
            var dtd = $.Deferred();

            clearNotice();
            if ($("div[data-step=question]").find("input.error").length > 0) {
                var error = new Error("输入有误，请先进行修改！");
                noticeFail(error);
                dtd.reject(error);
                return dtd.promise();
            }

            var qaitems = [];
            var questionDataList = _datagridModule.data;
            for (var i = 0; i < questionDataList.length; i++) {
                qaitems.push({
                    number: questionDataList[i].number,
                    name: questionDataList[i].name,
                    qatype: questionDataList[i].qatype,
                    answer: questionDataList[i].answer
                });
            }

            var data = {
                projectid: $('#projectid').val(),
                type: "proquestion", // 问卷调查
                enable: $("#idQuestionEnable").prop("checked"),
                config: {
                    qaitems: qaitems
                }
            };
            if ($("#idQuestionEnable").prop("checked")) {
                if (data.config.qaitems.length == 0) {
                    $("#attr-msg").notice(false, "至少添加一个问卷项！", -1);
                    return;
                }
            }

            $("#attributesPanel").action({
                url: "project/lottery/update",
                data: {
                    lottery: JSON.stringify(data)
                }
            }).then(function (resp) {
                dtd.resolve(resp);
            }, function (error) {
                noticeFail(new Error("保存活动方案设置失败，请检查参数后重试！"));
                dtd.reject(error);
            });
            return dtd.promise();
        };
        return _module;
    }());

    // 抽奖模块
    var lotteryModule = (function () {
        var _initToggleEnable = function () {
            $("#idLotteryEnable").change(function () {
                var value = $(this).prop("checked");
                if (value) {
                    $(".js-lottery-group").removeClass("hidden");
                } else {
                    $(".js-lottery-group").addClass("hidden");
                }
            });
            $("#idLotteryEnable").change();
        };

        // 奖品datagrid模块
        var _prizeDatagridModule = (function () {
            var dataList = [];
            var $element = $("#prizeSet");
            var _inited = false;

            // 选中的奖品
            var _selectedPrize = {};

            // 显示奖品设置
            var _initSwitchPrize = function () {
                $element.on("click", ".hide-prize", function (event) {
                    $("#prizeSet").find("input").blur();
                    if ($("#prizeSet").find("input.error").length > 0) {
                        return false;
                    }
                    var productid = $(this).data("value");
                    var selectedItem = {};
                    for (var i = 0; i < dataList.length; i++) {
                        var item = dataList[i];
                        if (item.productid == productid) {
                            selectedItem = item;
                            break;
                        }
                    }
                    _selectedPrize = {
                        productid: selectedItem.productid,
                        productname: selectedItem.productname,
                        cost: selectedItem.cost,
                        count: selectedItem.count
                    };
                    $(".datagrid-group").show();
                    $(".prize-group").hide();
                    // 设置奖品
                    _datagridModule.setPrize(_selectedPrize);
                    _loadData();
                });
            };

            var _updateCount = function (cell, newValue, rowValue) {
                rowValue.count = newValue;
                return false;
            };

            var _initDatagrid = function () {
                if (_inited) {
                    return;
                }
                $element.datagrid({
                    idField: "productid",
                    columns: [
                        {
                            caption: "奖品名称",
                            width: 160,
                            field: "productname",
                            editable: false,
                            dataType: "string"
                        },
                        // 取消奖品总数的显示
                        // {
                        //     caption: "奖品总数",
                        //     width: 100,
                        //     field: "amount",
                        //     editable: false,
                        //     dataType: "numeric"
                        // },
                        {
                            caption: "奖品数量",
                            width: 120,
                            field: "count",
                            editable: true,
                            dataType: "numeric",
                            editor: {
                                type: "number",
                                params: {
                                    required: "required",
                                    min: 1,
                                    max: 10000,
                                    "data-validateKey": "integer"
                                },
                            },
                            changed: _updateCount
                        },
                        {
                            caption: "奖品价格",
                            width: 140,
                            field: "cost",
                            editable: false,
                            dataType: "numeric",
                            formatter: function (value, rowValue) {
                                return toFixed(value);
                            }
                        },
                        {
                            caption: "操作",
                            width: 100,
                            field: "opt",
                            editable: false,
                            dataType: "string",
                            formatter: function (value, rowValue) {
                                return '<a style="color:#1b88ee;text-decoration:none" href="javascript:;" class="hide-prize" data-value="' + rowValue.productid + '"><i class="wfico ico_submit" style="color:#1b88ee;"></i>点击确定</a>';
                            }
                        }
                    ]
                });
                $element.datagrid("setData", dataList);
                _initSwitchPrize();
                _inited = true;
            };
            var _loadData = function (updateData) {
                $("#attributesPanel").action({
                    url: "mall/pdtlist",
                    data: {
                        categoryid: "",
                        page: 1,
                        size: 10000,
                        query: JSON.stringify({
                            state: 'sell',
                            producttype: ['redpacket', 'cashcoupon', 'product', 'cinema', 'phone', 'net', 'point','discountcoupon']
                        })
                    }
                }).then(function (resp) {
                    if (resp && resp.data && resp.data.data) {
                        var data = resp.data.data;
                        dataList = [];
                        $element.datagrid("setData", dataList);
                        for (var i = 0; i < data.length; i++) {
                            $element.datagrid("insertData", {
                                productid: data[i].productid,
                                productimage: data[i].productimage,
                                productname: data[i].productname,
                                cost: data[i].cost,
                                amount: data[i].amount,
                                count: 1
                            }, true);
                        }
                        if (updateData) {
                            console.log(updateData);
                            $element.datagrid("selectRow", updateData.productid);
                            if ($element.datagrid("getSelectedRow")) {
                                var selectedData = $element.datagrid("getSelectedRow").data("d");
                                selectedData.count = updateData.count;
                                $element.datagrid("updateSelectedRow", selectedData);
                            }
                        }
                    }
                });
            };
            _initDatagrid();

            var _module = {
                load: _loadData
            };
            return _module;
        }());

        // datagrid模块
        var _datagridModule = (function () {
            var dataList = [];
            var $element = $("#lotterySet");
            var _inited = false;

            // 保证每个奖项的index不一致
            var _lotteryid = 0;

            var _genDefault = function () {
                return {
                    lotteryid: _lotteryid++,
                    mallproductid: "", // 商品编号
                    name: "奖项名称", // 奖项名称
                    prize: "点击设置奖品",
                    amount: 1, // 中奖人数量
                    cost: 0, // 奖品数量，不是价格
                    summoney: 0 // 奖项涉及金额
                };
            };

            var _commandClick = function (event, value) {
                switch (value) {
                    case "add":
                        $element.datagrid("insertData", _genDefault(), true);
                        break;
                    case "remove":
                        $element.datagrid("removeSelectedRow");
                        $element.datagrid("disableCommand", "remove", true);
                        break;
                }
            };

            var _rowClicked = function () {
                $element.datagrid("disableCommand", "remove", false);
            };

            var _updateName = function (cell, newValue, rowValue) {
                rowValue.name = newValue;
                return false;
            };

            var _updateAmount = function (cell, newValue, rowValue) {
                rowValue.amount = newValue;
                var summoney = rowValue.cost * rowValue.count * rowValue.amount;
                if (isNaN(summoney)) {
                    summoney = 0;
                } else if (summoney % 1 !== 0) {
                    summoney = summoney.toFixed(2);
                }
                rowValue.summoney = summoney;
                return false;
            };

            // 当前选中的奖项index
            var _currentId = null;
            // 注册切换到奖品选择事件
            var _initSwitchPrize = function () {
                $element.on("click", "a.show-prize", function (event) {
                    _currentId = $(event.target).data("value");
                    var mallproductid = $(event.target).data("productid");
                    var count = $(event.target).data("count");

                    clearNotice();
                    var lotteryData = _datagridModule.data;
                    for (var i = 0; i < lotteryData.length; i++) {
                        if (lotteryData[i].name.trim() == "") {
                            var error = new Error("请填写奖项名称，再设置奖品");
                            noticeFail(error);
                            return false;
                        }
                    }

                    $(".datagrid-group").hide();
                    $(".prize-group").show();
                    if (!mallproductid) {
                        _prizeDatagridModule.load();
                    } else {
                        var data = {
                            productid: mallproductid,
                            count: count
                        };
                        _prizeDatagridModule.load(data);
                    }

                });
            };

            var _init = function () {
                // 初始化datagrid: 添加奖项/删除奖项/修改奖项信息:名称/数量/对应奖品/说明信息
                if (_inited) {
                    return;
                }
                $element.datagrid({
                    columns: [
                        {
                            caption: "奖项名称",
                            width: 120,
                            field: "name",
                            editable: isEditing,
                            dataType: "string",
                            editor: {
                                type: "text",
                                params: {
                                    required: "required",
                                    maxlength: "10"
                                }
                            },
                            changed: _updateName
                        },
                        {
                            caption: "中奖数量",
                            width: 90,
                            field: "amount",
                            editable: isEditing,
                            dataType: "numeric",
                            editor: {
                                type: "number",
                                params: {
                                    required: "required",
                                    min: 1,
                                    max: 100000,
                                    "data-validateKey": "integer"
                                },
                                created: function () { }
                            },
                            changed: _updateAmount
                        },
                        {
                            caption: "奖品",
                            width: 180,
                            field: "prize",
                            editable: false,
                            dataType: "string",
                            formatter: function (value, rowValue) {
                                return '<a style="color:#1b88ee;text-decoration:none;" href="javascript:;" class="show-prize" data-value="' + rowValue.lotteryid + '" data-count="' + rowValue.count + '" data-productid="' + rowValue.mallproductid + '"><i class="wfico ico_edit" style="color:#1b88ee;"></i>' + value + '</a>';
                            },
                            changed: function () { }
                        },
                        {
                            caption: "奖项总金额",
                            width: 120,
                            field: "summoney",
                            editable: false,
                            dataType: "numeric",
                            formatter: function (value, rowValue) {
                                return toFixed(value);
                            }
                        }
                    ],
                    commands: {
                        "operator": $("#lotteryOperator"),
                        "counter": $("#lotteryCounter")
                    },
                    rowClicked: _rowClicked,
                    commandClicked: _commandClick,
                    data: {
                        empty: "点击添加按钮来增加奖项，至少要有一个奖项。"
                    }
                });
                $element.datagrid("setData", dataList);
                _initSwitchPrize();
                _inited = true;
                disableDatagridCommand($element);
            };

            // 设置奖品
            var _setPrize = function (prize) {
                for (var i = 0; i < dataList.length; i++) {
                    if (_currentId == dataList[i].lotteryid) {
                        var currentItem = dataList[i];
                        currentItem.mallproductid = prize.productid;
                        currentItem.mallproductname = prize.productname;
                        currentItem.cost = prize.cost;
                        currentItem.count = prize.count;
                        currentItem.prize = prize.productname + " * " + prize.count;
                        // 计算summoney
                        var summoney = prize.cost * currentItem.count * currentItem.amount;
                        if (isNaN(summoney)) {
                            summoney = 0;
                        } else if (summoney % 1 !== 0) {
                            summoney = summoney.toFixed(2);
                        }
                        currentItem.summoney = summoney;
                        $element.datagrid("setData", dataList);
                        break;
                    }
                }
            };

            return {
                init: function () {
                    _init();
                },
                get data() {
                    return dataList;
                },
                setPrize: _setPrize,
                setData: function (data) {
                    dataList = [];
                    $element.datagrid("setData", dataList);
                    for (var i = 0; i < data.length; i++) {
                        $element.datagrid("insertData", {
                            lotteryid: data[i].lotteryid,
                            mallproductid: data[i].mallproductid,
                            name: data[i].name,
                            number: data[i].number,
                            amount: data[i].amount,
                            cost: data[i].summoney / data[i].prizecount / data[i].amount,
                            count: data[i].prizecount,
                            summoney: data[i].summoney,
                            prize: data[i].mallproductname + " * " + data[i].prizecount
                        });
                    }
                    disableDatagridClick($element);
                }
            };
        }());

        var _module = {};
        _module.show = function () {
            $("[data-step=lottery]").addClass("-se-in-scale");
        };
        _module.hide = function () {
            $("[data-step=lottery]").removeClass("-se-in-scale");
        };
        _module.init = function () {
            clearNotice();
            _initToggleEnable();
            _datagridModule.init();

            loadModule.loadLotteryData("prolottery").then(function (resp) {
                var config = resp.data.config, enable = resp.data.enable;
                enable && ($("#idLotteryEnable").prop("checked", true));
                $("#idLotteryEnable").change();

                _datagridModule.setData(config.lotteryitems);
            }, function (error) {
                if (error.code == "notexist") {
                    $("#idLotteryEnable").prop("checked", false);
                }
            });
        };
        _module.save = function () {
            var dtd = $.Deferred();

            clearNotice();
            if ($("div[data-step=lottery]").find("input.error").length > 0) {
                var error = new Error("输入有误，请先进行修改！");
                noticeFail(error);
                dtd.reject(error);
                return dtd.promise();
            }

            var lotteryitems = [];
            var lotteryData = _datagridModule.data;
            var nameList = [];
            for (var i = 0; i < lotteryData.length; i++) {
                if (lotteryData[i].summoney == "0") {
                    var error = new Error("不允许设置金额为0的奖项");
                    noticeFail(error);
                    dtd.reject(error);
                    return dtd.promise();
                }
                if (nameList.indexOf(lotteryData[i].name) != -1) {
                    var error = new Error("不允许设置重复的奖项名称");
                    noticeFail(error);
                    dtd.reject(error);
                    return dtd.promise();
                } else {
                    nameList.push(lotteryData[i].name);
                }
                lotteryitems.push({
                    name: lotteryData[i].name,
                    mallproductid: lotteryData[i].mallproductid,
                    prizecount: lotteryData[i].count,
                    amount: lotteryData[i].amount,
                    summoney: lotteryData[i].summoney
                });
            }
            var data = {
                projectid: $("#projectid").val(),
                type: "prolottery", // 抽奖
                enable: $("#idLotteryEnable").prop("checked"),
                config: {
                    lotteryitems: lotteryitems
                }
            };
            $("#attributesPanel").action({
                url: "project/lottery/update",
                data: {
                    lottery: JSON.stringify(data)
                }
            }).then(function (resp) {
                clearNotice();
                dtd.resolve(resp);
            }, function (error) {
                noticeFail(new Error("保存活动方案设置失败，请检查参数后重试！"));
                dtd.reject(error);
            });
            return dtd.promise();
        };
        return _module;
    }());

    // 扫码送模块
    var giftModule = (function () {
        var _initToggleEnable = function () {
            $("#idGiftEnable").change(function () {
                var value = $(this).prop("checked");
                if (value) {
                    $("#idGiftDatagrid").show();
                } else {
                    $("#idGiftDatagrid").hide();
                }
            });
            $("#idGiftEnable").change();
        };

        // datagrid模块
        var _datagridModule = (function () {
            // 空数据
            var dataList = [];
            // 元素
            var $element = $("#giftSet");
            var _updateCount = function (cell, newValue, rowValue) {
                rowValue.count = newValue;
                return false;
            };
            // 初始化
            var _inited = false;
            var _init = function () {
                if (_inited) {
                    return;
                }
                $element.datagrid({
                    idField: "productid",
                    columns: [
                        {
                            field: "productname",
                            caption: "奖品名称",
                            width: 240,
                            editable: false,
                            dataType: "string"
                        },
                        // 取消奖品总数显示
                        // {
                        //     field: "amount",
                        //     caption: "奖品总数",
                        //     width: 120,
                        //     editable: false,
                        //     dataType: "numeric"
                        // },
                        {
                            field: "count",
                            caption: "奖品数量",
                            width: 140,
                            editable: isEditing,
                            dataType: "numeric",
                            editor: {
                                type: "number",
                                params: {
                                    required: "required",
                                    min: 1,
                                    max: 10000,
                                    "data-validateKey": "integer"
                                }
                            },
                            changed: _updateCount
                        },
                        {
                            field: "cost",
                            caption: "价格",
                            editable: false,
                            dataType: "numeric",
                            width: 140,
                            formatter: function (value, rowValue) {
                                return toFixed(value);
                            }
                        }
                        //,
                        // {
                        //     field: "opt",
                        //     caption: "操作",
                        //     width: 100,
                        //     editable: false,
                        //     dataType: "string",
                        //     formatter: function (value, rowValue) {
                        //         return '<a style="color:#1b88ee;text-decoration:none"><i class="wfico ico_submit" style="color:#1b88ee"></i>设为奖品</a>';
                        //     }
                        // }
                    ]
                });
                $element.datagrid("setData", dataList);
                disableDatagridCommand($element);
                _inited = true;
            };
            var _loadData = function () {
                $("#attributesPanel").action({
                    url: "mall/pdtlist",
                    data: {
                        categoryid: "",
                        page: 1,
                        size: 10000,
                        query: JSON.stringify({
                            state: 'sell',
                            producttype: ['redpacket', 'cashcoupon', 'product', 'cinema', 'phone', 'net', 'point','discountcoupon']
                        })
                    }
                }).then(function (resp) {
                    if (resp && resp.data && resp.data.data) {
                        var data = resp.data.data;
                        dataList = [];
                        $element.datagrid("setData", dataList);
                        for (var i = 0; i < data.length; i++) {
                            $element.datagrid("insertData", {
                                productid: data[i].productid,
                                productimage: data[i].productimage,
                                productname: data[i].productname,
                                cost: data[i].cost,
                                amount: data[i].amount,
                                count: 1
                            }, true);
                        }
                        loadModule.loadLotteryData("progift").then(function (resp) {
                            if (resp && resp.data) {
                                disableDatagridClick($element);
                                var config = resp.data.config, enable = resp.data.enable;

                                enable && ($("#idGiftEnable").prop("checked", true));
                                $("#idGiftEnable").change();
                                var selectedId = config.giftitems.mallproductid;
                                // $element.datagrid("selectRow", selectedId);
                                // FIXME 通过添加class来选中
                                var $rows = $element.children(".content").children(".rows").children(".row");
                                $rows.removeClass("selected");
                                for (var i = 0; i < $rows.length; i++) {
                                    var row = $rows[i];
                                    if ($(row).data("d").productid == selectedId) {
                                        $(row).addClass("selected");
                                        break;
                                    }
                                }
                                if ($element.datagrid("getSelectedRow")) {
                                    var selectedData = $element.datagrid("getSelectedRow").data("d");
                                    selectedData.count = config.giftitems.giftcount;
                                    $element.datagrid("updateSelectedRow", selectedData);
                                }
                            }
                        }, function (error) {
                            if (error.code == "notexist") {
                                $("#idGiftEnable").prop("checked", false);
                                $("#idGiftEnable").change();
                            }
                        });
                    }
                });
            };
            return {
                init: function () {
                    _init();
                    _loadData();
                },
                selectedData: function () {
                    return $element.datagrid("getSelected") || {};
                }
            };
        }());

        var _module = {};
        _module.show = function () {
            $("[data-step=gift]").addClass("-se-in-scale");
        };
        _module.hide = function () {
            $("[data-step=gift]").removeClass("-se-in-scale");
        };
        _module.init = function () {
            clearNotice();
            _initToggleEnable();
            _datagridModule.init();
        };
        _module.save = function () {
            var dtd = $.Deferred();

            clearNotice();
            if ($("div[data-step=gift]").find("input.error").length > 0) {
                var error = new Error("输入有误，请先进行修改！");
                noticeFail(error);
                dtd.reject(error);
                return dtd.promise();
            }

            var selectedData = _datagridModule.selectedData();
            var data = {
                projectid: $("#projectid").val(),
                type: "progift", // 扫码送
                enable: $("#idGiftEnable").prop("checked"),
                config: {
                    giftitems: {
                        giftcount: selectedData.count,
                        mallproductid: selectedData.productid
                    }
                }
            };
            $("#attributesPanel").action({
                url: "project/lottery/update",
                data: {
                    lottery: JSON.stringify(data)
                }
            }).then(function (resp) {
                dtd.resolve(resp);
            }, function (error) {
                noticeFail(new Error("保存活动方案设置失败，请检查参数后重试！"));
                dtd.reject(error);
            });
            return dtd.promise();
        };
        return _module;
    }());

    // 分享获积分模块
    var shareModule = (function () {
        var projectid,
            config;

        function validate(config) {
            if (!config.enable) return true;
            var sharePoint = config.sharePoint,
                shareMaxPoint = config.shareMaxPoint,
                helpPoint = config.helpPoint,
                helpMaxPoint = config.helpMaxPoint;

            var $sharePointInput = $("#idSharePoint"),
                $shareMaxPointInput = $("#idShareMaxPoint"),
                $helpPointInput = $("#idHelpPoint"),
                $helpMaxPointInput = $("#idHelpMaxPoint");

            if (sharePoint.trim() == "") {
                $sharePointInput.addClass("error");
                return "分享积分数量为必填项";
            } else if (!(sharePoint % 1 == 0 && 0 < sharePoint && sharePoint <= 100)) {
                $sharePointInput.addClass("error");
                return "分享积分数量为大于0小于等于100的整数";
            }

            if (shareMaxPoint.trim() == "") {
                $shareMaxPointInput.addClass("error");
                return "分享积分上限为必填项";
            } else if (!(shareMaxPoint % 1 == 0 && 0 < shareMaxPoint && shareMaxPoint <= 10000)) {
                $shareMaxPointInput.addClass("error");
                return "分享积分上限为大于0小于等于10000的整数";
            }

            if (Number(shareMaxPoint) < Number(sharePoint)) {
                $shareMaxPointInput.addClass("error");
                return "分享积分上限应该大于等于分享积分数量";
            }

            if (helpPoint.trim() == "") {
                $helpPointInput.addClass("error");
                return "助力积分数量为必填项";
            } else if (!(helpPoint % 1 == 0 && 0 < helpPoint && helpPoint <= 100)) {
                $helpPointInput.addClass("error");
                return "助力积分数量为大于0小于等于100的整数";
            }

            if (helpMaxPoint.trim() == "") {
                $helpMaxPointInput.addClass("error");
                return "助力积分上限为必填项";
            } else if (!(helpMaxPoint % 1 == 0 && 0 < helpMaxPoint && helpMaxPoint <= 10000)) {
                $helpMaxPointInput.addClass("error");
                return "助力积分上限为大于0小于等于10000的整数";
            }

            if (Number(helpMaxPoint) < Number(helpPoint)) {
                $helpMaxPointInput.addClass("error");
                return "助力积分上限应该大于等于助力积分数量";
            }

            return true;
        }

        var _module = {};
        _module.show = function () {
            $("[data-step=share]").addClass("-se-in-scale");
        };
        _module.hide = function () {
            $("[data-step=share]").removeClass("-se-in-scale");
        };
        _module.init = function () {
            projectid = $("#projectid").val();
            config = {
                projectid: projectid,
                enable: 0,
                sharePoint: 0,
                shareMaxPoint: 0,
                helpPoint: 0,
                helpMaxPoint: 0
            };
            // 初始化
            $("#idShareEnable").change(function () {
                var value = $(this).prop("checked");
                if (value) {
                    $("#shareContainer").show();
                } else {
                    $("#shareContainer").hide();
                    $("#idSharePoint").val(0);
                    $("#idShareMaxPoint").val(0);
                    $("#idHelpPoint").val(0);
                    $("#idHelpMaxPoint").val(0);
                }
            });

            $.ajax({
                method: "POST",
                url: "/share/config",
                data: {
                    projectid: projectid,
                    update: true
                }
            }).then(function (resp) {
                if (resp.data) {
                    config.enable = resp.data.enable;
                    config.sharePoint = resp.data.sharePoint;
                    config.shareMaxPoint = resp.data.shareMaxPoint;
                    config.helpPoint = resp.data.helpPoint;
                    config.helpMaxPoint = resp.data.helpMaxPoint;
                }
                $("#idShareEnable").prop("checked", config.enable);
                $("#idShareEnable").change();
                $("#idSharePoint").val(config.sharePoint);
                $("#idShareMaxPoint").val(config.shareMaxPoint);
                $("#idHelpPoint").val(config.helpPoint);
                $("#idHelpMaxPoint").val(config.helpMaxPoint);
            }).fail(function (jqXHR, type, msg) {
                console.error(msg);
            });
        };
        _module.save = function () {
            var dtd = $.Deferred();
            var config = {
                projectid: projectid,
                enable: $("#idShareEnable").prop("checked") ? 1 : 0,
                sharePoint: $("#idSharePoint").val(),
                shareMaxPoint: $("#idShareMaxPoint").val(),
                helpPoint: $("#idHelpPoint").val(),
                helpMaxPoint: $("#idHelpMaxPoint").val()
            };

            var message = validate(config);
            if (message !== true) {
                var error = new Error(message);
                dtd.reject(error);
                noticeFail(error);
            } else {
                $("#attributesPanel").action({
                    method: "POST",
                    url: "share/config/update",
                    data: config
                }).then(function (resp) {
                    clearNotice();
                    dtd.resolve(resp);
                }).fail(function (jqXHR, type, msg) {
                    dtd.reject(new Error(msg));
                });
            }

            return dtd.promise();
        };

        return _module;
    }());

    // 结束模块
    var finishModule = (function () {
        var _module = {};
        _module.show = function () {
            $("[data-step=finish]").addClass("-se-in-scale");
        };
        _module.hide = function () {
            $("[data-step=finish]").removeClass("-se-in-scale");
        };
        _module.init = function () {
            clearNotice();
        };
        _module.save = function () {
            var dtd = $.Deferred();
            dtd.resolve();
            return dtd.promise();
        };
        return _module;
    }());

    // 模块管理模块: 负责模块的切换, currentModule/nextModule/lastModule
    var moduleManagement = (function (moduleList) {
        var index = 0, currentModule, lastModule, nextModule;
        // index改变事件 
        var indexChange = function () {
            currentModule = moduleList[index],
                lastModule = moduleList[index - 1] || null,
                nextModule = moduleList[index + 1] || null;
            // 是否显示last/netxt
            if (index == 0) {
                $("button[value=prev]").hide();
            } else {
                $("button[value=prev]").show();
            }
            if (index == moduleList.length - 1) {
                $("button[value=next]").hide();
            } else {
                $("button[value=next]").show();
            }
        };
        // 用于初始化
        indexChange();

        return {
            get currentModule() {
                return currentModule;
            },
            get lastModule() {
                return lastModule;
            },
            get nextModule() {
                return nextModule;
            },
            nextStep: function () {
                if (nextModule) {
                    currentModule.save().then(function () {
                        currentModule.hide();
                        index += 1;
                        indexChange();
                        currentModule.show();
                        currentModule.init();
                    });
                } else {
                    currentModule.save();
                }
            },
            lastStep: function () {
                if (currentModule == commondityModule) {
                    var items = $("[name=commondity]:checked");
                    var len = items.length;
                    if (len == 0) {
                        currentModule.hide();
                        index -= 1;
                        indexChange();
                        currentModule.show();
                        currentModule.init();
                        return;
                    }
                }
                if (lastModule) {
                    currentModule.save().then(function () {
                        currentModule.hide();
                        index -= 1;
                        indexChange();
                        currentModule.show();
                        currentModule.init();
                    });
                } else {
                    currentModule.save();
                }
            },
            nextStepWithoutSave: function () {
                if (nextModule) {
                    currentModule.hide();
                    index += 1;
                    indexChange();
                    currentModule.show();
                    currentModule.init();
                }
            },
            lastStepWithoutSave: function () {
                if (lastModule) {
                    currentModule.hide();
                    index -= 1;
                    indexChange();
                    currentModule.show();
                    currentModule.init();
                }
            }
        };
    }([basisModule, commondityModule, questionModule, lotteryModule, giftModule, shareModule, finishModule]));

    var previewer = {
        frame: $('#previewFrame'),
        core: null,
        setup: function (pro) {
            if ($.isPlainObject(pro) && !$.isEmptyObject(pro)) {
                if (previewer.core == null) {
                    previewer.frame.unbind('load').load(function (e) {
                        previewer.core = e.currentTarget.contentWindow.window;
                        previewer.core.setup(pro);
                    }).attr('src', '/templates/index.html?preview=web');
                } else {
                    previewer.core.setup(pro);
                }
            }
        }
    };

    // 初始化可编辑环境
    function initEditEnv() {
        $("[value=save]").click(function () {
            moduleManagement.currentModule.save();
        });
        // 保存后进入下一step
        $("button[value=next]").click(function () {
            moduleManagement.nextStep();
        });
        $("button[value=prev]").on("click", function () {
            moduleManagement.lastStep();
        });
        // 返回列表
        $("[value=close]").click(function () {
            window.location.href = "solution.html";
        });
    }

    // 初始化不可编辑环境
    function initUnableEditEnv() {
        disableInput();

        $("[value=save]").hide();
        $("button[value=next]").on("click", function () {
            moduleManagement.nextStepWithoutSave();
        });
        $("button[value=prev]").on("click", function () {
            moduleManagement.lastStepWithoutSave();
        });
        $("[value=close]").on("click", function () {
            window.location.href = "solution.html";
        });
    };

    // 禁用输入项等
    function disableInput() {
        if (!isEditing) {
            $("input, textarea, button[data-type='datepicker'], button[data-type='selector']:not(#account_mail)").prop("disabled", true);
            $("label").addClass("disabled");
        }
    }

    // 禁用datagrid
    function disableDatagridCommand($element) {
        if (!isEditing) {
            $element.datagrid("disableCommand", "remove", true);
            $element.datagrid("disableCommand", "add", true);
        }
    }

    // 禁用datagrid点击事件
    function disableDatagridClick($element) {
        if (!isEditing) {
            // 取消点击事件
            $element.find("div").off("click").unbind("click");
            $element.off("click").unbind("click");
        }
    }

    module.init = function () {
        if (!loaded) {
            navigation.direction("solution");
            // 从localStorage中读取projectid
            var projectid = localStorage.getItem("ls_enterprise_solution");
            if (projectid) {
                $("#projectid").val(projectid);
            }

            // 进行判断是否能够编辑
            if (projectid) {
                $.ajax({
                    method: "POST",
                    url: "/project/get",
                    data: {
                        projectid: projectid
                    }
                }).then(function (resp) {
                    if (resp.data && resp.data.state != "editing") {
                        initUnableEditEnv();
                        previewer.setup(resp.data);
                    } else {
                        initEditEnv();
                        previewer.setup(resp.data);
                        isEditing = true;
                    }
                }, function (error) {
                    initUnableEditEnv();
                });
            } else {
                initEditEnv();
                isEditing = true;
            }

            moduleManagement.currentModule.show();
            moduleManagement.currentModule.init();

            loaded = true;
        }
    };

    return module;
});