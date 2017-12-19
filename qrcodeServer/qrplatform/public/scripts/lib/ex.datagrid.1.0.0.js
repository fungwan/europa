/**
 * 用于进行数据加载和展显的表格，该控件始终采取懒加载方式加载数据
 */
define(function () {
    var _g_datagrid_index = 1;

    $(window).unbind("resize.datagrid").bind("resize.datagrid", onWindowSizeChanged_datagrid_reize);

    function onWindowSizeChanged_datagrid_reize(e) {
        $("[data-role=datagrid]").datagrid("resize");
    }

    /**
     * 数据表格
     * setting, 数据表格的设置或数据表格支持的方法名
     * params, 如果setting为方法名，则该参数为方法提供的参数，否则无效
     */
    $.fn.datagrid = function () {
        var rv = this, args = arguments;
        this.each(function (i, d) {
            var paramLen = args.length;
            if (paramLen > 0) {
                var root = $(this).attr("data-role", "datagrid"); //获取数据表格根部
                var o = root.data("setting"), setting = args[0];
                if ($.type(setting) === "string") {
                    var rows = root.children(".content").children(".rows");
                    //如果setting参数为字符串，则认为在调用方法
                    switch (setting) {
                        case "resize":
                            if (paramLen > 1)
                                datagridResize(root, "width" in args[1] ? args[1].width : null, "height" in args[1] ? args[1].height : null);
                            else
                                datagridResize(root);
                            break;
                        case "options":
                            rv = o;
                            break;
                        case "getData":
                            rv = root.data("ds");
                            break;
                        case "insertData":
                            rows.children("span.empty").remove();
                            if (paramLen > 1 && o.data.collectionName && args[1]) {
                                var rowtemp = root.children(".template"),
                                    groupCount = rows.children(".groupRow").length, _d = args[1], _has2thParam = paramLen > 2 ? !!args[2] : false;

                                switch ($.type(_d)) {
                                    case "object":
                                        if (o.data.collectionName in _d) {
                                            try {
                                                _d = eval("_d." + o.data.collectionName);
                                            } catch (e) {
                                            }
                                            if ($.type(_d) != "array")
                                                _d = [];
                                        } else
                                            _d = [_d];
                                        break;
                                    case "array":
                                        break;
                                    default:
                                        _d = [];
                                        break;
                                }

                                var _ib = $.type(o.insertBefore) === "function";

                                $.each(_d, function (index, rowdata) {
                                    var dataInx = ++o.data.count;
                                    var row = rowtemp.clone().removeClass("template").addClass("row").attr("data-inx", dataInx);
                                    row.find(".rowHeader").attr("data-inx", dataInx);
                                    if (_ib) o.insertBefore(row, rowdata);
                                    datagridSetRowData(row, rowdata, o.columns);
                                    if (o.groupField && $.type(o.groupField) == "string" && o.groupField in rowdata) {
                                        var groupVal = rowdata[o.groupField];
                                        var groupRow = rows.children(".groupRow[data-val='{0}']".format(groupVal));
                                        if (groupRow.length > 0) {
                                            var lastdatarow = rows.children(".row[data-group='{0}']:last-child".format(groupRow.attr("data-groupindex")));
                                            if (lastdatarow.length > 0)
                                                lastdatarow.after(row.attr("data-group", groupCount));
                                            else
                                                groupRow.after(row.attr("data-group", groupCount));
                                        } else {
                                            var groupTxt = $.type(o.groupFormatter) == "function" ? o.groupFormatter(groupVal) : (o.groupField + ": " + groupVal);
                                            groupCount++;
                                            groupRow = $("<div class='groupRow' data-val='{0}' data-groupindex='{1}'>{2}</div>".format(groupVal, groupCount, groupTxt));
                                            rows.append(groupRow);

                                            groupRow.after(row.attr("data-group", groupCount));
                                        }
                                    } else
                                        rows.append(row);

                                    //查找checkbox列，如果有则格式化控件
                                    $.each(row.find(".checkboxcell"), function (i, dom) {
                                        var id = "chk_" + core.uuid.get().replace(/\-/g, ""), ck = $(dom);
                                        ck.children("input:checkbox").attr("id", id);
                                        ck.children("label").attr("for", id);
                                    });

                                });
                                var _rootdata = root.data("ds");
                                if (!_rootdata)
                                    root.data("ds", _d);
                                else
                                    _rootdata.push.apply(_rootdata, _d);
                            }

                            if (rows.children(".row").length == 0 && rows.children(".empty").length == 0) {
                                rows.append("<span class='ccBox flex empty'>{0}</span>".format(o.data.empty));
                                core.language.install(rows);
                            }

                            if (_has2thParam === true) {
                                //如果第二个参数为布尔值（真）时，自动选择加入的数据中的最后一个数据对应的行
                                root.datagrid("selectRow", _d[_d.length - 1]);
                            } else if ($.type(_has2thParam) === "function") {
                                //如果第二个参数为函数，则调用该函数，表示插入数据完成后的回调
                                _has2thParam();
                            }

                            break;
                        case "setData":
                            if (paramLen > 1) {
                                datagridEditors.onEditorBlur(null, false, false);

                                o.data.count = 0;
                                o.pagination.pageIndex = 0;
                                o.pagination.over = false;
                                o.error = "";
                                root.data("ds", null);
                                rows.empty();
                                rows.css("marginTop", 0);
                                root.datagrid("insertData", args[1], paramLen > 1 ? args[2] : null);
                            }
                            break;
                        case "prependData":
                            if (paramLen > 1 && args[1]) {
                                var infirstrow = true;
                                var rowtemp = root.children(".template");

                                var dataInx = ++o.data.count;
                                var row = rowtemp.clone().removeClass("template").addClass("row").attr("data-inx", dataInx);
                                if ($.type(o.insertBefore) === "function") o.insertBefore(row, rowdata);
                                datagridSetRowData(row, args[1], o.columns);

                                if (o.groupField && $.type(o.groupField) == "string" && o.groupField in args[1]) {
                                    var groupVal = rowdata[o.groupField];
                                    var groupRow = rowsview.children(".groupRow[data-val='{0}']".format(groupVal));
                                    if (groupRow.length > 0) {
                                        infirstrow = false;
                                        var groupIndex = groupRow.attr("data-group");
                                        groupRow.after(row.attr("data-group", groupIndex));
                                    }
                                }

                                if (infirstrow)
                                    rows.prepend(row);
                            }
                            break;
                        case "getSelected":
                            var sr = root.children(".content").children(".rows").children(".selected");
                            if (sr.length > 0)
                                rv = sr.eq(0).data("d");
                            else
                                rv = null;
                            break;
                        case "getSelectedRow":
                            var sr = root.children(".content").children(".rows").children(".selected");
                            if (sr.length > 0)
                                rv = sr.eq(0);
                            else
                                rv = null;
                            break;
                        case "getSelection":
                            var sr = root.children(".content").children(".rows").children(".selected");
                            rv = [];
                            $.each(sr, function (i, r) {
                                rv.push($(r).data("d"));
                            });
                            break;
                        case "getChecked":
                            var sr = root.children(".content").children(".rows").find(".checkboxcell > input:checkbox:checked");
                            rv = [];
                            $.each(sr, function (i, r) {
                                rv.push($(r).parent().parent().parent().data("d"));
                            });
                            break;
                        case "getCheckedCount":
                            rv = root.children(".content").children(".rows").find(".checkboxcell > input:checkbox:checked").length;
                            break;
                        case "updateSelectedRow":
                            if (paramLen > 1 && args[1]) {
                                var sr = root.children(".content").children(".rows").children(".selected");
                                if (sr.length > 0)
                                    datagridSetRowData(sr.eq(0), args[1], o.columns);
                                break;
                            }
                        case "updateRow":
                            if (paramLen > 2) {
                                if (args[2]) {
                                    var target = args[1];
                                    if (!isNaN(target))
                                        target = root.children(".content").children(".rows").children(".row[data-inx=" + target + "]");

                                    if ("length" in target && target.length > 0) datagridSetRowData(target, args[2], o.columns);
                                }
                            }
                            break;
                        case "removeSelectedRow":
                            datagridEditors.onEditorBlur(null, false, false);
                            var srs = root.children(".content").children(".rows").children(".selected"), ds = root.data("ds");
                            srs.each(function (_i, _row) {
                                var _rowdata = $(_row).data("d");
                                if (_rowdata && _rowdata.__rid) {
                                    $.each(ds, function (_j, _data) {
                                        if (_rowdata.__rid === _data.__rid) {
                                            ds.splice(_j, 1);
                                            return false;
                                        }
                                    });
                                }
                            });
                            srs.remove();

                            if (rows.children(".row").length == 0 && rows.children(".empty").length == 0) {
                                rows.append("<span class='ccBox flex empty'>{0}</span>".format(o.data.empty));
                                core.language.install(rows);
                            }
                            break;
                        case "removeCheckedRow":
                            datagridEditors.onEditorBlur(null, false, false);
                            var srs = root.children(".content").children(".rows").find(".checkboxcell > input:checkbox:checked").parentsUntil(".rows", ".row"), ds = root.data("ds");
                            $.each(srs, function (_i, _row) {
                                var _rowdata = $(_row).data("d");
                                if (_rowdata && _rowdata.__rid) {
                                    $.each(ds, function (_j, _data) {
                                        if (_rowdata.__rid === _data.__rid) {
                                            ds.splice(_j, 1);
                                            return false;
                                        }
                                    });
                                }
                            });
                            srs.remove();

                            if (rows.children(".row").length == 0 && rows.children(".empty").length == 0) {
                                rows.append("<span class='ccBox flex empty'>{0}</span>".format(o.data.empty));
                                core.language.install(rows);
                            }
                            break;
                        case "selectRow":
                            if (paramLen > 1 && args[1]) {
                                root.children(".content").find(".selected").removeClass("selected");
                                if (args[1] && o.idField) {
                                    var _idField = args[1];
                                    if ($.isPlainObject(_idField) && o.idField in _idField)
                                        _idField = _idField[o.idField];
                                    else
                                        _idField = String(_idField);

                                    var rowslist = root.children(".content").children(".rows").children(".row");
                                    rowslist.each(function (inx, dom) {
                                        var d = $(dom).data("d");
                                        if (d && o.idField in d && d[o.idField] === _idField) {
                                            var t = $(dom);
                                            t.find(".cell").eq(0).focus();
                                            t.trigger("click");
                                            return false;
                                        }
                                    });
                                }
                            } else {
                                root.children(".content").children(".rows").children(".row:first-child").trigger("click");
                            }
                            break;
                        case "clearSelection":
                            root.children(".content").find(".selected").removeClass("selected");
                            break;
                        case "clear":
                            o.pagination.pageIndex = 0;
                            o.pagination.over = false;
                            o.data.count = 0;
                            datagridEditors.onEditorBlur(null, false, false);
                            root.data("ds", null);
                            root.children(".content").children(".rows").empty();
                            break;
                        case "reload":
                            root.datagrid("clear");
                            if ($(".checkboxcol > input:checkbox:checked").length > 0)
                                $(".checkboxcol > input:checkbox:checked").prop("checked", false);
                            if (paramLen == 2 && args[1])
                                o.params = args[1];

                            loadData(root);
                            break;
                        case "message":
                            if (paramLen > 2)
                                root.children(".messager").notice(args[1], args[2], paramLen > 3 ? args[3] : null);

                            break;
                        case "updateColumn":
                            if (paramLen > 1) {
                                var cols = args[1];
                                if ($.type(cols) != "array") cols = [cols];
                                var columns = root.children(".header").children(".columns");
                                $.each(cols, function (inx, col) {
                                    if ($.type(col) == "object" && col.field) {
                                        $.each(o.columns, function (key, column) {
                                            if (col.field === column.field) {
                                                $.extend(true, column, col);
                                                columns.find("[data-column='{0}']".format(key)).html(column.caption);
                                                return false;
                                            }
                                        });
                                    }
                                });
                            }
                            break;
                        case "disableCommand":
                            if (paramLen > 1 && args[1]) {
                                var list = [];
                                if ($.type(args[1]) === "string")
                                    list.push(args[1]);
                                else if ($.type(args[1] === "array"))
                                    list = args[1];

                                if (list.length > 0) {
                                    var cmd = root.children(".header").children(".commands");
                                    $.each(list, function (i, c) {
                                        cmd.find("[value='{0}']".format(c)).prop("disabled", paramLen > 2 ? !!args[2] : true);
                                    });
                                }
                            }
                            break;
                    }
                } else {
                    try {
                        var rootId = _g_datagrid_index;
                        _g_datagrid_index++;
                        o = $.extend(true, {gid: rootId}, $.fn.datagrid.defaultOption, setting);
                        root.data("setting", o).attr("data-root", rootId);
                        root.empty(); //清除旧的数据表格

                        if (o.wrap !== true) root.addClass("nowrap");

                        //创建行模板
                        var template = $("<div class='template'><div class='frozen el'><div class='rowheader'></div></div><div class='free el'></div></div>");
                        root.append(template);

                        //创建表头
                        var header = $("<div class='header'></div>").attr("data-header", rootId);
                        root.append(header);

                        //创建命令栏
                        var returnCmds = datagridCommandCreate(o.commands, header);

                        //创建列
                        var columns = $("<div class='columns'><div class='frozen el'><div class='rowheader'></div></div><div class='free el'></div></div>").attr("data-columns", rootId);
                        header.append(columns);

                        //创建内容
                        var content = $("<div class='content' data-scroll-transform='true'></div>").attr("data-content", rootId);
                        root.append(content);

                        var rows = $("<div class='rows' data-scroll='xy' data-scroll-animate='false'></div>").attr("data-rows", rootId);
                        rows.unbind("scroll").bind("scroll", onRowsScroll);
                        content.append(rows);

                        //分析设置项，创建表头、行数据模板
                        var returnOption = datagridColumnCreate(null, o.columns, columns, template, false, rootId);
                        o.columns = returnOption.columns;

                        if (o.rowHeader === true) {
                            columns.addClass("columnsWithHeader");
                            rows.addClass("rowsWithHeader");
                            //var rhw = template.find(".rowheader").outerWidth();
                            var rhw = 32;
                            returnOption.rowMinWidth += rhw;
                            returnOption.frozenWidth += rhw;
                        }
                        //template.css("min-width", returnOption.rowMinWidth);

                        rows.attr({
                            "data-scroll-translate": "0,0,0," + returnOption.frozenWidth,
                            "data-scroll-offsetWidth": returnOption.rowMinWidth
                        });

                        var footer = $("<div class='footer'></div>").attr("data-footer", rootId);
                        root.append(footer.hide());

                        //创建消息栏
                        var messager = $("<div class='messager'></div>");
                        root.append(messager);

                        //注册事件
                        root.unbind().off();
                        root.on("change", ".rows > .row > .el .checkboxcell > input:checkbox", datagridRowCheckboxChanged);
                        root.on("click", ".rows > .row > .el > .cell", datagridCellClicked).on("keydown", ".rows > .row > .el > .cell", datagridCellKeyDown);
                        root.on("click", ".rows > .row", datagridRowClicked); // o.rowClicked
                        columns.off().on("change", ".checkboxcol > input:checkbox", datagridColumnCheckboxChanged);
                        columns.on("click", ".sort, .sort_desc, .sort_asc", datagridColumnClicked);

                        if (o.rowDblClicked && $.type(o.rowDblClicked) == "function")
                            root.on("dblclick", ".rows > .row", o.rowDblClicked);

                        root.on("click", ".editable label[data-role=checkboxLabel]", datagridEditors.checkbox.trigger);

                        core.language.install(root);

                        if (o.uri) loadData(root);
                    } catch (e) {
                        core.throw(e.message);
                    }
                    //否则为创建数据表格
                }
            }
        });
        return rv;
    };

    /**
     * 当数据视图滚动时
     * @param e
     * @param setting 滚动设置
     */
    function onRowsScroll(e, setting) {
        /* rows.attr("data-scroll-left", setting.scrollLeft);
         root.find("div.free").scrollLeft(setting.scrollLeft);*/
        /*if (setting) {
         if (setting.vertical) {
         if () {

         }
         } else {
         }
         }*/
        if (setting) {
            var rows = $(e.currentTarget), root = rows.parent().parent(), o = root.data("setting");
            if (!setting.vertical) {
                root.find(".free").scrollLeft(setting.scrollLeft);
                setting.handled = true;
            } else if (setting.vertical && !o.pagination.over) {
                var st = rows.scrollTop(), h = rows.outerHeight(true), ch = rows.get(0).scrollHeight;
                //if (st < h || st >= ch - h) {
                if (ch == h || st >= ch - h) {
                    loadData(root);
                }
            }
        }
        return false;
    }

    /**
     * 当点击表头时
     * @param e
     */
    function datagridColumnClicked(e) {
        var t = $(e.currentTarget), option = t.data("d");
        if (!option.checkbox && option.field && option.sortable) {
            var root = t.parentsUntil(".datagrid", ".header").parent(), o = root.data("setting");
            if (e.shiftKey) {
                sort.remove(t, o.sort, option);
            } else if (e.ctrlKey) {
                option.sort = option.sort !== "asc" ? "asc" : "desc";
                sort.update(t, o.sort, option);
            } else {
                option.sort = option.sort !== "asc" ? "asc" : "desc";
                sort.update(t, o.sort, option, true);
            }
            root.datagrid("clear");
            loadData(root);
        }
    }

    /**
     * 为数据表格重置大小
     * @param root 数据表格对象
     * @param w 新的宽度（无效值表示不重置宽度）
     * @param h 新的高度（无效值表示不重置高度）
     */
    function datagridResize(root, w, h) {
        if (root) {
            if (w && !isNaN(w) && w > 0)
                root.width(w);

            if (h && !isNaN(h) && h > 0)
                root.width(h);

            var content = root.children(".content"), rows = content.children(".rows");
            var rowsSize = {
                width: rows.outerWidth(),
                height: rows.outerHeight()
            }, contentSize = {width: content.outerWidth(), height: content.outerHeight()};
        }
    }


    /**
     * 当点击行复选框时触发
     * @param e
     */
    function datagridRowCheckboxChanged(e) {
        var t = $(e.currentTarget), cell = t.parent(),
            rows = cell.parent().parent().parent(), root = rows.parent().parent(),
            columns = root.children(".header").children(".columns");

        var column = cell.attr("data-column");
        if (column) {
            var count = rows.find("[data-column='{0}'] > input[type=checkbox]:enabled".format(column)).length,
                chkedcount = rows.find("[data-column='{0}'] > input[type=checkbox]:enabled:checked".format(column)).length;
            columns.find("[data-column='{0}'] > input[type=checkbox]:enabled".format(column)).prop("checked", count == chkedcount);
        }

        return false;
    }

    /**
     * 当点击表头筛选框时触发
     * @param e
     */
    function datagridColumnCheckboxChanged(e) {
        var t = $(e.currentTarget);
        if (t) {
            var col = t.parent(), root = col.parent().parent().parent().parent(),
                rows = root.children(".content").children(".rows"),
                checked = t.prop("checked"), o = root.data("setting");

            rows.find("[data-column='{0}'] > input[type=checkbox]:enabled".format(col.attr("data-column"))).prop("checked", checked);

            if ($.type(o.checkBoxChanged) === "function")
                o.checkBoxChanged(e);
        }

        return false;
    }

    /**
     * 数据表格的默认设置
     */
    $.fn.datagrid.defaultOption = {
        editable: true,
        uri: null, //加载数据的地址
        params: null, //加载数据时需要的参数，必须为JOSN对象
        columns: [], //表头
        rowHeader: true, //是否显示行头
        selectCell: false, //选择模式是否为单元格
        multiple: false, //是否允许多选
        selectionChanged: null, //当选择项发生变更时触发的事件，提供：事件源对象、行号、行数据
        idField: "__rid", //设置用于标识行唯一的字段名称
        groupField: null, //对数据进行分组的字段
        groupFormatter: null, //对分组头进行格式化，参数：分组值
        pagination: {
            on: true, //是否开启分页，默认开启，关闭将只能加载一次数据，要刷新数据需要手动调用加载数据的方法
            pageSizeParamName: "size", //接口接收每页获取数目的参数名
            pageSize: 20, //设置每次获取的页数
            pageIndexParamName: "page", //接口接收获取页面索引的参数名
            pageIndex: 0, //当前获取的页面索引
            pageCount: 1, //总页数
            info: "",
            over: false //是否到达最后一页
        }, //分页信息
        error: "",
        sort: [],
        sortParamName: "sort",
        loadCls: null, //加载数据时加载提示的样式名称（可自定义）,为null表示不显示加载提示
        loadMessage: "",
        loadSuccess: null,
        loadError: null,
        loadCompleted: null,
        wrap: true,
        valueChanged: null, //当数据发生变更时，参数：field, cellvalue, rowdata
        rowClicked: null, //当行点击时，参数：event
        rowDblClicked: null, //当行双击时，参数：event
        checkBoxChanged: null, //当表头复选框状态改变时
        commandClicked: null, //当命令项被点击时，若没有默认事件，则会尝试调用该方法
        rowBlur: null, //当行失去焦点时，参数：row
        focusedRowIndex: -1, //当前选择的行的行号
        checkOnClick: true, //当选择行时，勾选/取消勾选所在行复选框
        scrollover: null, //当纵向滚动至最后时，参数：event
        insertBefore: null, //当插入数据之前触发
        data: {
            count: 0, //总数据量
            empty: "<i data-lang='message.error.nodata'></i>", //列数据时显示的提示文本
            totalName: "data.total",
            collectionName: "data.data" //用于存储数据内容的集合名称
        }, //数据相关
        commands: {} //操作相关
    };

    /**
     * 数据表格的列的默认设置
     */
    $.fn.datagrid.columnDefaultOption = {
        field: "", //列字段名称
        caption: "", //列标题
        width: null, //宽度
        visibility: true, //是否显示该列
        ckeckbox: false,//是否表示为复选框
        virtualIndex: null,
        frozen: false,
        dataType: "string", //值类型
        style: {
            textAlign: "left",
            fontWeight: "lighter",
            fontStyle: "normal",
            fontSize: 13
        }, //自定义样式
        sortable: false,
        sort: "",
        cellStyle: {}, //自定义该列单元格样式
        editable: false, //是否允许编辑
        changed: null, //当此列中的单元格的值发生变更时触发（注意：是在更新数据表格单元格的值前触发）
        editor: {
            type: null,
            params: {},
            created: null //当编辑器创建成功后调用，提供编辑器对象、单元格数据和行数据，可以根据这些参数，设定编辑器相关属性
        }, //编辑器
        formatter: null, //列字段值格式化方法，提供：行号、列值、行值
        sub: null //该列的子列集合，如有子列，则该列的width、formatter, editer等部分属性无效
    };

    /**
     * 数据表格命令项默认设置
     * @type {{}}
     */
    $.fn.datagrid.commandDefaultOption = {
        params: null, //命令按钮的属性
        inline: false, //是否在每行后显示该命令
        event: null //点击该命令后执行的函数或系统提供的默认动作的字符串，提供两个参数，一个是事件对象，一个为当前行对象. 为空则尝试触发"commandClicked"。
    };

    /**
     * 查找数据表格的根元素
     * @param element
     */
    function findRoot(element) {
        return element.parents("[data-role=datagrid]");
    }

    /**
     * 生成一个UUID
     * @returns {string}
     */
    function uuid() {
        var d = new Date().getTime();
        var _uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return _uuid;
    }

    /**
     * 为数据行设置值
     * @param row 数据行
     * @param rowdata 数据
     * @param columnOptions 列属性集合
     */
    function datagridSetRowData(row, rowdata, columnOptions) {
        if (row && !rowdata)
            rowdata = row.data("d");

        if (row && rowdata && columnOptions) {
            if (!rowdata.__rid) rowdata.__rid = uuid();
            row.children(".el").children("div").each(function (index, cell) {
                var c = $(cell);
                var column = c.attr("data-column");
                var _v = "";
                if (column && column in columnOptions) {
                    var columnOption = columnOptions[column];
                    _v = rowdata[columnOption.field];
                    datagridSetCellData(c, columnOption, _v, rowdata);
                }
            });
            if (rowdata.__editable === false)
                row.addClass("uneditable");
            else
                row.removeClass("uneditable");

            if (rowdata.__checkable === false)
                row.addClass("uncheckable").find("input:checkbox").prop("disabled", true);
            else
                row.removeClass("uncheckable").find("input:checkbox").prop("disabled", false);

            row.data("d", rowdata);
        }
    }

    /**
     * 设置单元格数据
     * @param cell 单元格
     * @param columnOption 对应列设置
     * @param value 值
     * @param rowdata 所在行的值
     * @param update 标识该值是更新还是初始，默认为false,表示初始
     */
    function datagridSetCellData(cell, columnOption, value, rowdata, update) {
        if (cell && columnOption) {
            if (!cell.hasClass("editing")) {
                if (columnOption.checkbox !== true) {
                    var result = String(value);
                    var rewrite = true;
                    if (columnOption.editor && columnOption.editor.type == "checkbox") {
                        value ? cell.children("label").addClass("checkedlabel") : cell.children("label").removeClass("checkedlabel");
                        rewrite = false;
                        //result = "<label data-role='checkboxLabel' tabindex='1' class='" + (columnOption.editor.params.cls || "checkboxlabel") + " " + (value === true ? "checkedlabel" : "") + "' />";
                    } else if (columnOption.editor && columnOption.editor.type == "select") {
                        var _item = popup.getItem(columnOption.editor.params["data-popup"], value, cell);
                        if (_item) {
                            var _itemType = $.type(_item);
                            if (_itemType === "string") {
                                result = _item;
                            } else if (_itemType == "object" && _item.length > 0) {
                                result = _item.html();
                            }
                        }
                    } else if ($.type(columnOption.formatter) == "function")
                        result = columnOption.formatter(value, rowdata);

                    if (rewrite)
                        cell.html(String(result));
                }
            }

            if (update === true) {
                rowdata[columnOption.field] = value;
                /*if ($.type(columnOption.changed) == "function")
                 columnOption.changed(cell, value, rowdata);*/
            }
        }
    }

    /**
     * 当行容器滚动时触发
     * @param e
     */
    function datagridRowsScrolled(e) {
        var _rows = $(e.currentTarget);
        var _rowPointer = _rows.prev(".pointer");
        var _columns = _rows.parent().parent().children(".header").children(".columns");
        _rowPointer.scrollTop(_rows.scrollTop());
        _columns.scrollLeft(_rows.scrollLeft());
        return false;
    }

    /**
     * 当在表格中按下按键时
     * @param e
     */
    function datagridCellKeyDown(e) {
        var cell = $(e.currentTarget);
        if (e) {
            if (e.keyCode == 9) {
                var nextdom = null, option = findRoot(cell).data("setting"), rowchanged = false;
                if (e.shiftKey) {
                    if (option.selectCell)
                        nextdom = cell.prev();

                    if (!nextdom || nextdom.length == 0) {
                        var row = cell.parent().prev();
                        if (row.length == 0)
                            row = cell.parent().parent().children(".row:last-child");
                        rowchanged = true;

                        nextdom = row.children(".cell:last-child");
                    }
                } else {
                    if (option.selectCell)
                        nextdom = cell.next();

                    if (!nextdom || nextdom.length == 0) {
                        var row = cell.parent().next();
                        if (row.length == 0)
                            row = cell.parent().parent().children(".row:first-child");
                        rowchanged = true;

                        nextdom = row.children(".cell:first-child");
                    }
                }

                if (nextdom) {
                    nextdom.trigger("click");
                    if (rowchanged) nextdom.parent().trigger("click");
                }
                return false;
            } else if (e.keyCode == 32) {
                if (cell.hasClass("editable")) {
                    var label = cell.children("label[data-role='checkboxLabel']");
                    if (label.length > 0) {
                        label.trigger("click");
                        return false;
                    }
                }

            }
        }
    }

    /**
     * 当单元格点击时触发
     * @param e
     * @updatePrevious 是否更新上个选中单元格的数据
     */
    function datagridCellClicked(e, updatePrevious) {
        var cell = $(e.currentTarget);
        var row = cell.parent().parent();
        var rows = row.parent();
        var root = rows.parent().parent();
        var option = root.data("setting");

        if (option) {
            rows.find(".selected").each(function (index, dom) {
                var obj = $(this);
                if (obj.hasClass("cell")) {
                    //如果选择对象为单元格
                    obj.removeClass("selected");
                }
            });

            if (option.selectCell === true)
                cell.addClass("selected");

            var column = cell.attr("data-column");
            if (column in option.columns && option.columns[column]) {
                if (option.columns[column].checkbox === true)
                    cell.children("input:checkbox").focus();
                else if (!cell.hasClass("editing")) {
                    if (datagridEditors.onEditorBlur(e, false, updatePrevious !== false) && option.editable)
                        datagridOpenEditor(cell, option.columns[column]);
                }
            }
        }

        /*return false;*/
    }

    /**
     * 当点击行时触发
     * @param e
     * @returns {boolean}
     */
    function datagridRowClicked(e) {
        var row = $(e.currentTarget);
        var rows = row.parent();
        var root = rows.parent().parent();
        var option = root.data("setting");

        if (option) {
            var pwr = row, currentRowIndex = Number(row.attr("data-inx"));
            if (option.multiple) {
                row.toggleClass("selected");
                if (!row.hasClass("selected"))
                    pwr = rows.children(".selected");
            } else if (!row.hasClass("selected")) {
                rows.children().removeClass("selected");
                row.addClass("selected");
            }

            if (option.focusedRowIndex != currentRowIndex) {
                var focusedRow = rows.children(".row[data-inx='" + option.focusedRowIndex + "']").removeClass("focused");
                if (focusedRow.length > 0) {
                    if (option.rowBlur && $.type(option.rowBlur) == "function")
                        option.rowBlur(focusedRow);
                }

                option.focusedRowIndex = currentRowIndex;
                row.addClass("focused");
            }

            var s = $(e.target);
            if (!row.hasClass("uncheckable") && (option.checkOnClick || (s.is("label") && s.parent().hasClass("checkboxcell")))) {
                var ckb = row.find(".checkboxcell").children("input:checkbox"), ns = !ckb.prop("checked");
                ckb.prop("checked", ns).trigger("change");
            }

            if (option.rowClicked && $.type(option.rowClicked) == "function")
                option.rowClicked(e);
        }

        e.stopPropagation();
    }

    var datagridEditors = {
        currentEditor: null,
        currentEditingCell: null,
        currentEditingRowData: null,
        currentEditingColumnOption: null,
        text: null,
        checkbox: {
            trigger: function (e) {
                var label = $(e.currentTarget), cell = label.parent(), row = cell.parent().parent();
                cell.trigger("click", true);
                label.toggleClass("checkedlabel");
                var column = cell.attr("data-column"), root = row.parent().parent().parent(), rowData = row.data("d");
                var option = root.data("setting"), columnOption = option.columns[column], nv = label.hasClass("checkedlabel");
                rowData[columnOption.field] = nv;
                if ($.type(columnOption.changed) == "function")
                    columnOption.changed(cell, nv, rowData);
                //datagridEditors.onEditorBlur(e, true, true);
                return false;
            }
        },
        select: null,
        process: null,
        getEditor: function (editorType) {
            switch (editorType) {
                case "checkbox":
                    return datagridEditors.checkbox;
                case "select":
                    if (datagridEditors.select == null) {
                        datagridEditors.select = $("<button data-popup='' data-level=''></button>");
                        datagridEditors.select.unbind().bind("click", popup.binder);
                        /*datagridEditors.select.bind("valueChanged", function (e, item) {
                         datagridEditors.select.html(item.text);
                         });*/
                    }

                    return datagridEditors.select;
                    break;
                default:
                    if (datagridEditors.text == null) {
                        datagridEditors.text = $("<input type='text' data-role='text' />");
                    }

                    return datagridEditors.text;
            }
        },
        /**
         * 当编辑器失去焦点时
         * @param e
         * @param keepEditing 是否保持编辑状态
         * @param update 是否更新数据
         */
        onEditorBlur: function (e, keepEditing, update) {
            if (e && popup && popup.config.current) popup.close();

            var hasError = false, _editor = null;

            if (datagridEditors.currentEditingCell && datagridEditors.currentEditingColumnOption && datagridEditors.currentEditingRowData) {
                if ($.type(datagridEditors.currentEditingColumnOption.editor.type) == "string") {
                    var _val = null;

                    switch (datagridEditors.currentEditingColumnOption.editor.type) {
                        case "checkbox":
                            _val = datagridEditors.currentEditingCell.children("label").hasClass("checkedlabel");
                            break;
                        case "select":
                            _editor = datagridEditors.select;
                            _val = _editor.cval();
                            hasError = _editor.validation();
                            break;
                        default:
                            _editor = datagridEditors.text;
                            _val = _editor.cval();
                            hasError = _editor.validation();
                            break;
                    }

                    if (!hasError) {
                        if (keepEditing !== true) {
                            datagridEditors.currentEditingCell.removeClass("editing");
                            if (_editor) {
                                _editor.detach();
                                datagridEditors.currentEditor = null;
                            }
                        }
                        datagridSetCellData(datagridEditors.currentEditingCell, datagridEditors.currentEditingColumnOption, _val, datagridEditors.currentEditingRowData, update === true);
                    } else {
                        var root = _editor.parentsUntil(".datagrid", ".content").parent();
                        root.data("setting").error = _editor.data("tooltip");
                    }

                }
            }

            if (keepEditing !== true && !hasError)
                core.removeDocumentEventHandler(true, true, "click.datagridCellOutsideClick", datagridEditors.onEditorBlur);

            return !hasError;
        }
    };

    /**
     * 转换值
     * @param val
     * @param type
     * @returns {*}
     */
    function convertValue(val, type) {
        var rv = val;
        switch (type) {
            case "boolean":
                rv = !!val;
                break;
            case "numeric":
                rv = Number(val) || 0;
                break;
            default:
                rv = String(val);
                break;
        }
        return rv;
    }

    /**
     * 打开编辑器
     * @param cell 要进行编辑的单元格
     * @param columnOption 单元格对应列的属性
     */
    function datagridOpenEditor(cell, columnOption) {
        //如果列允许编辑
        if (columnOption.editable === true && columnOption.editor) {
            datagridEditors.currentEditingCell = cell;
            datagridEditors.currentEditingColumnOption = columnOption;
            var row = cell.parent().parent();
            if (row.hasClass("uneditable")) return;

            var rows = row.parent();
            var root = rows.parent().parent();

            //如果未设置编辑器类型，则默认为文本编辑器
            if (!columnOption.editor.type) columnOption.editor.type = "text";

            //如果编辑器为字符串，则表示使用控件提供的几类编辑器，如:text, checkbox, select, process等（如果无匹配则认为是text）
            try {
                if ($.type(columnOption.editor.type) == "string") {
                    var _rowData = row.data("d");
                    if (_rowData) {
                        datagridEditors.currentEditingRowData = _rowData;
                        var _editor = datagridEditors.getEditor(columnOption.editor.type);
                        if (_editor) {
                            switch (columnOption.editor.type) {
                                case "checkbox":
                                    cell.addClass("editing");
                                    cell.children("label").focus();
                                    var cb = cell.children("input:checkbox").unbind();
                                    if ($.extend(columnOption.changed) == "function")
                                        cb.click(columnOption.changed);
                                    break;
                                case "select":
                                    _editor.unbind("change").removeAttr("data-required data-expression data-valtype data-on data-popup data-level data-format data-input-name data-lang data-lang-alt data-lang-holder data-lang-name").attr(columnOption.editor.params).attr("data-input-name", columnOption.caption).html(cell.html()).cval(_rowData[columnOption.field]);

                                    _editor.bind("change", function (e, val) {
                                        var _val = convertValue(val, columnOption.dataType), updateRow = false;
                                        if ($.type(columnOption.changed) == "function")
                                            updateRow = !columnOption.changed(cell, _val, _rowData);

                                        if (updateRow === true)
                                            datagridSetRowData(row, _rowData, root.data("setting").columns);
                                        _rowData[columnOption.field] = _val;
                                    });

                                    cell.addClass("editing").empty().append(_editor);
                                    break;
                                default:
                                    _editor.removeAttr("data-required data-expression data-valtype data-on data-popup data-level data-format data-input-name data-lang data-lang-alt data-lang-holder data-lang-name").attr(columnOption.editor.params).attr("data-input-name", columnOption.caption);
                                    _editor.attr("type", columnOption.editor.type || "text");
                                    _editor.val(_rowData[columnOption.field]);
                                    cell.addClass("editing").empty().append(_editor);
                                    _editor.unbind("blur keypress.datagridEditor").bind("blur keypress.datagridEditor", function (e) {
                                        if (e.type === "keypress") {
                                            if (e.keyCode === 13 || e.keyCode === 9)
                                                $(e.currentTarget).blur();
                                        } else {
                                            var _val = convertValue(_editor.val(), columnOption.dataType), updateRow = false;
                                            if ($.type(columnOption.changed) == "function")
                                                updateRow = !columnOption.changed(cell, _val, _rowData);

                                            if (updateRow === true)
                                                datagridSetRowData(row, _rowData, root.data("setting").columns);
                                            _rowData[columnOption.field] = _val;
                                        }
                                    });

                                    break;
                            }

                            if ($.type(columnOption.editor.created) == "function")
                                columnOption.editor.created(_editor, _rowData[columnOption.field], _rowData);

                            switch (columnOption.editor.type) {
                                case "checkbox":
                                    break;
                                case "select":
                                    _editor.trigger("click");
                                    break;
                                default:
                                    _editor.focus().select();
                                    break;
                            }

                            datagridEditors.currentEditor = _editor;
                        }
                    }
                }

                core.removeDocumentEventHandler(true, true, "click.datagridCellOutsideClick", datagridEditors.onEditorBlur);
                core.addDocumentEventHandler(true, true, "click.datagridCellOutsideClick", datagridEditors.onEditorBlur);
            } catch (e) {
                core.throw(e.message);
            }
        }
    }

    /**
     * 默认加载数据的功能
     * @param root
     */
    function loadData(root) {
        if (root) {
            var option = root.data("setting");
            if (option.uri && option.pagination.over !== true) {
                var params = {
                    url: option.uri,
                    data: {}
                }, pageindex = 1;
                if (option.pagination.on === true) {
                    pageindex = params.data[option.pagination.pageIndexParamName] = option.pagination.pageIndex + 1;
                    params.data[option.pagination.pageSizeParamName] = option.pagination.pageSize;
                }
                if ($.type(option.sort) === "array" && option.sort.length > 0) {
                    params.data[option.sortParamName] = JSON.stringify(option.sort);
                }

                if (option.params) {
                    $.extend(true, params.data, option.params);
                }

                function loadDataSuccess(d) {
                    if ($.type(option.loadSuccess) != "function" || option.loadSuccess(d)) {
                        var ds = [];
                        var total;
                        try {
                            total = Number(eval("d." + option.data.totalName)) || 0;
                            ds = eval("d." + option.data.collectionName);
                        } catch (e) {
                        }

                        if ($.type(ds) == "array" && ds.length > 0) {
                            if (!total) total = ds.length;
                            root.datagrid(pageindex == 1 ? "setData" : "insertData", ds);
                            if (option.pagination.on === true && ds.length >= option.pagination.pageSize)
                                option.pagination.pageIndex = pageindex;
                            else
                                option.pagination.over = true;
                        } else {
                            if (!total) total = 0;
                            if (pageindex === 1)
                                root.datagrid("setData", []);
                            else
                                option.pagination.over = true;
                        }

                        var start = (pageindex - 1) * option.pagination.pageSize + 1,
                            end = pageindex * option.pagination.pageSize,
                            pages = Math.ceil(total / option.pagination.pageSize);
                        if (end > total)
                            end = total;

                        if (option.pagination.info) {
                            var footer = root.find(".footer").show(), message = option.pagination.info;
                            message = message.replace(/\{total\}/ig, total);
                            message = message.replace(/\{start\}/ig, start);
                            message = message.replace(/\{end\}/ig, end);
                            message = message.replace(/\{pages\}/ig, pages);
                            message = message.replace(/\{page\}/ig, pageindex);
                            message = message.replace(/\{pagesize\}/ig, option.pagination.pageSize);
                            footer.html(message);
                        } else {
                            root.find(".footer").hide();
                        }
                    }
                    core.updateVirtualScrollSetting();
                }

                function loadDataError(error) {
                    if ($.type(option.loadError) != "function" || option.loadError(error) !== false)
                        root.datagrid("message", false, error.message);
                }

                root.action(params, option.loadMessage || "message.loading.default").then(loadDataSuccess, loadDataError, option.loadCompleted);
            }
        }
    }

    /**
     * 创建数据表格命令栏
     * @param cmds 命令集
     * @param header 容器
     */
    function datagridCommandCreate(cmds, header) {
        //var rcmds = {};
        if (cmds) {
            var cmdbox = $("<div class='commands' data-command='{0}'></div>".format(header.attr("data-header"))), len = 0;
            $.each(cmds, function (i, cmd) {
                try {
                    if ($.type(cmd) == "string") {
                        var con = $(cmd);
                        if (con instanceof jQuery && con.length > 0) cmdbox.append(con);
                    } else if (cmd instanceof jQuery) {
                        cmdbox.append(cmd);
                    } else if ($.isPlainObject(cmd)) {
                        var o = $.extend(true, {}, $.fn.datagrid.commandDefaultOption, cmd);
                        btn = $("<button value='{0}'></button>".format(i)).attr(o.params);
                        cmdbox.append(btn);
                    }
                } catch (e) {
                }
                len++;
            });
            if (len > 0) {
                header.append(cmdbox);
                cmdbox.off().on("click", "button", onDatagridCommandItemClicked);
            }
        }
    }

    function onDatagridCommandItemClicked(e) {
        var cmdBox = $(e.delegateTarget), id = cmdBox.attr("data-command"), t = $(e.currentTarget), val = t.cval(), returnValue = false;
        if (id && val) {
            var root = $("[data-root='{0}']".format(id)), o = root.data("setting");
            if (o && o.commands) {
                if (val in o.commands) {
                    var cmd = o.commands[val];
                    if ($.isPlainObject(cmd) && cmd.event && $.type(cmd.event) == "function") {
                        returnValue = cmd.event(e, val) !== true;
                    }
                }
                if (!returnValue) {
                    if (o.commandClicked && $.type(o.commandClicked) == "function") {
                        returnValue = o.commandClicked(e, val);
                    }
                }
            }
        }
        return returnValue;
    }

    /**
     * 创建数据表格列、行数据模板
     * index: 列索引前辍
     * columns: 要创建的列的集合
     * container: 创建的列放置的容器
     * templateContainer: 创建的单元格数据模板放置的容器
     * id: 数据表格的ID
     */
    function datagridColumnCreate(index, columns, container, templateContainer, issub, id) {
        var _columnOptions = {}, _rowMinWidth = 0, _frozenWidth = 0, _o = container.parent().parent().data("setting");
        if ($.type(columns) == "array" && columns.length > 0 && container && container.length > 0) {
            $.each(columns, function (colindex, column) {
                var coloption = $.extend(true, {}, $.fn.datagrid.columnDefaultOption, column);
                var cinx = index != null ? (index + "_" + colindex) : ("c" + colindex);
                coloption.virtualIndex = cinx;
                var col = null, width = coloption.width || (coloption.checkbox === true ? 36 : (coloption.caption.length * 12 + 20));
                if (coloption.checkbox === true) {
                    var id = "chk_" + core.uuid.get().replace(/\-/g, "");
                    col = $("<div class='col checkboxcol' data-column='" + cinx + "'><input class='labelLinkCheckbox' id='" + id + "' type='checkbox' /><label for='" + id + "'></label></div>");
                } else {
                    col = $("<div class='col' data-column='" + cinx + "'><div>" + coloption.caption + "</div></div>").css(coloption.style);
                }
                col.data("d", coloption);
                sort.update(col, _o.sort, coloption);

                if (issub === true)
                    container.append(col);
                else {
                    if (coloption.frozen === true || coloption.checkbox === true)
                        container.children(".frozen").append(col);
                    else
                        container.children(".free").append(col);
                }

                if ($.type(coloption.sub) == "array" && coloption.sub.length > 0) {
                    var colsub = $("<div class='subcol'></div>");
                    col.append(colsub);
                    datagridColumnCreate(cinx, coloption.sub, colsub, templateContainer, true, id);
                } else {
                    col.outerWidth(width);
                    _rowMinWidth += width;
                    var celltemp = null;
                    if (coloption.checkbox === true)
                        celltemp = $("<div class='cell checkboxcell' data-column='" + cinx + "'   tabindex='1'><input class='labelLinkCheckbox' type='checkbox' /><label></label></div>");
                    else {
                        celltemp = $("<div class='cell" + (coloption.editable ? " editable" : "") + "' data-column='" + cinx + "'  tabindex='1'></div>").css(coloption.cellStyle);
                        if (coloption.editor && coloption.editor.type == "checkbox")
                            celltemp.append("<label data-role='checkboxLabel' class='" + (coloption.editor.params.class || "checkboxlabel") + "' />");
                    }
                    celltemp.outerWidth(width);

                    if (coloption.frozen === true || coloption.checkbox === true) {
                        templateContainer.children(".frozen").append(celltemp);
                        _frozenWidth += width;
                    } else
                        templateContainer.children(".free").append(celltemp);
                }
                _columnOptions[cinx] = coloption;
            });

            container.children(".free").append("<div class='col last'></div>");
            templateContainer.children(".free").append("<div class='cell last'></div>");
        }
        return {
            "columns": _columnOptions,
            "rowMinWidth": _rowMinWidth,
            "frozenWidth": _frozenWidth
        };
    }

    var sort = {
        find: function (list, field) {
            var v = null;
            if (field && $.type(list) === "array" && list.length > 0) {
                $.each(list, function (i, s) {
                    if (s.field === field) {
                        v = s;
                        return false;
                    }
                });
            }
            return v;
        },
        update: function (col, list, option, reset) {
            if (col && $.type(list) === "array") {
                if (!option) option = col.data("d");
                if (option && !option.checkbox && option.field && option.sortable) {
                    if (reset !== true) {
                        var _fsort = sort.find(list, option.field);
                        if (_fsort)
                            _fsort.type = option.sort;
                        else if (option.sort)
                            list.push({field: option.field, type: option.sort});
                    } else {
                        col.parent().parent().find(".col").each(function (i, dom) {
                            var t = $(dom), o = t.data("d");
                            if (o && o.field !== option.field) {
                                o.sort = "";
                                sort.render(t, o);
                            }
                        });
                        list.length = 0;
                        if (option.sort)
                            list.push({field: option.field, type: option.sort});
                    }
                    sort.render(col, option);
                }
            }
        },
        remove: function (col, list, option) {
            if (col && $.type(list) === "array" && list.length > 0) {
                if (!option) option = col.data("d");
                if (option && !option.checkbox && option.field) {
                    option.sort = "";
                    var inx = -1;
                    $.each(list, function (i, s) {
                        if (s.field === option.field) {
                            inx = i;
                            return false;
                        }
                    });
                    if (inx >= 0)
                        list.splice(inx);
                    sort.render(col, option);
                }
            }
        },
        render: function (col, option) {
            if (col) {
                if (!option) option = col.data("d");
                if (option) {
                    col.removeClass("sort sort_asc sort_desc");
                    if (option && !option.checkbox && option.field && option.sortable) {
                        switch (option.sort) {
                            case "asc":
                                col.addClass("sort_asc");
                                break;
                            case "desc":
                                col.addClass("sort_desc");
                                break;
                            default:
                                col.addClass("sort");
                                break;
                        }
                    }
                }
            }
        }
    };
});