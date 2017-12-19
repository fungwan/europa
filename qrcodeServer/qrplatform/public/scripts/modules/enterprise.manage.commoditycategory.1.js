/**
 * Created by 75339 on 2016/12/13.
 */

define(function () {
    var module = {}, loaded = false, dealerGroupList = null, customerGroupList = null, dealeres = null, grid = null;
    var currentManage = null;
    var dealerMessage = $("#dealerMessage"), customerMessage = $("#customerMessage"), message = null;
    var dealerGroupSelected = null, customerGroupSelected = null, dealerGroupChecked = null, customerGroupChecked = null;
    var currentGroup = null, currentGroupData = null;
    var _addDealerEnable = true, _addCutomerEnable = true, _isAdd = false;

    /**
     * 初始化经销商列表
     */
    function initDealerList() {
        dealerGroupList = $(".dealerGroupList").datagrid({
            idField: "id",
            selectCell: false,
            uri: "cgroup/list",
            pagination: {
                info: "<div style='padding-left: 32px'> 当前显示数量 <b style='font-size: 22px'>{end}</b> / 总数 <b style='font-size: 22px'>{total}</b></div>"
            },
            columns: [
                {checkbox: true},
                {
                    field: "groupname",
                    caption: "名称",
                    width: 200,
                    editable: true,
                    dataType: "string",
                    editor: {
                        type: "text",
                        params: {
                            "required": "required",
                            "maxlength": "20"
                        }
                    },
                    changed: updateGroupCheck
                },
                {
                    field: "groupdesc",
                    caption: "描述",
                    width: 600,
                    editable: true,
                    dataType: "string",
                    editor: {
                        type: "text",
                        params: {
                            "maxlength": "50"
                        }
                    },
                    changed: updateGroupCheck
                }

            ],
            params: {
                query: JSON.stringify({"grouptype": 1})
            },
            rowClicked: groupCheck
        });
    }


    /**
     * 对更新分组进行检验，如果不符合更新条件，则对用户进行提示
     * @param cell  当前编辑列对象
     * @param val 编辑后的文字
     * @param rowdata 当前编辑行的数据
     */
    function updateGroupCheck(cell, val, rowdata) {
        if (cell.attr("data-column") == "c1") {
            if (rowdata.groupid == "") {
                if (rowdata.groupname.trim() != val.trim()) {
                    if (currentManage == "dealerGroup") {
                        _addDealerEnable = true;
                    }
                    else if (currentManage == "customerGroup") {
                        _addCutomerEnable = true;
                    }
                }
                _isAdd = true;
            }
            else {
                _isAdd = false;
            }

            if (cell.find("input").hasClass("error")) {
                message.notice(false, "分组名不能为空，请重新输入");
                return;
            }
            if (rowdata.groupname.trim() == val.trim()) {
                return;
            }
            else {
                rowdata.groupname = val;
                updateGroup(cell, val, rowdata);
            }
        }
        else if (cell.attr("data-column") == "c2") {
            if (rowdata.groupid == "") {
                if (rowdata.groupdesc.trim() != val.trim()) {
                    if (currentManage == "dealerGroup") {
                        _addDealerEnable = true;
                    }
                    else if (currentManage == "customerGroup") {
                        _addCutomerEnable = true;
                    }
                }
                _isAdd = true;
            }
            else {
                _isAdd = false;
            }

            if (rowdata.groupdesc.trim() == val.trim()) {
                return;
            }
            else {
                if (rowdata.groupname == "请填写分组名称") {
                    message.notice(false, "请先为新分组命名。");
                    return;
                }
                rowdata.groupdesc = val;
                updateGroup(cell, val, rowdata);
            }

        }
    }

    /**
     * 批量删除分组，如果存在刚添加的新分组且并未保存的，也一并添加进去进行删除，
     * 只是后台并不进行该分组的删除，因为后台根本就没有。
     * 这样做只是为了让界面上添加的分组一起删除。
     */
    function deleteGroup() {
        dealerGroupChecked = grid.datagrid("getChecked");
        if (dealerGroupChecked.length == 1 && dealerGroupChecked[0].groupid == "") {
            deleteGroupSuccess();
            if (grid == dealerGroupList)
                _addDealerEnable = true;
            if (grid == customerGroupList)
                _addCutomerEnable = true;
            _isAdd = false;
            return;
        }
        var listid = [];
        $.each(dealerGroupChecked, function (i, v) {
            if (v.groupid == "" && grid == dealerGroupList) {
                _addDealerEnable = true;
                _isAdd = false;
            }
            else if (v.groupid == "" && grid == customerGroupList) {
                _addCutomerEnable = true;
                _isAdd = false;
            }
            listid.push(v.groupid);
        });
        if (listid.length == 0) {
            message.notice(false, "您没有选择要删除的组别,请重试。")
        }
        else {
            grid.action({
                url: "cgroup/deletegr",
                data: {
                    listid: JSON.stringify({
                        list: listid
                    })
                }
            }).then(deleteGroupSuccess, deleteGroupFail);
        }
    }

    /**
     * 成功删除分组，并在界面上将其删除
     * @param d
     */
    function deleteGroupSuccess(d) {
        grid.datagrid("removeCheckedRow");
        message.notice(true, "成功删除分组");
        if (grid.datagrid("getSelectedRow") == null) {
            currentGroupData = null;
        }
    }

    /**
     * 删除分组失败
     * @param error
     */
    function deleteGroupFail(error) {
        message.notice(false, "删除分组失败");
    }

    /**
     * 点击添加分组后，在界面上添加一个新分组
     * @param grid
     */
    function addGroup(grid) {
        if (grid == dealerGroupList) {
            if (_addDealerEnable === false) {
                message.notice(false, "请先填写新分组信息，填写后才能继续添加分组。");
                return;
            }
            //var groupid=core.uuid.get();
            dealerGroupList.datagrid("insertData", {
                groupid: "",
                groupname: "请填写分组名称",
                groupdesc: "请填写分组描述",
                grouptype: "1"

            });
            dealerGroupList.find(".content>.rows>.row").removeClass("selected").last().addClass("selected");
            dealerGroupSelected = dealerGroupList.find(".content>.rows>.row:last").data("d");
            currentGroupData = dealerGroupSelected;
            _addDealerEnable = false;
        }

        else if (grid == customerGroupList) {
            if (_addCutomerEnable === false) {
                message.notice(false, "请先填写新分组信息，填写后才能继续添加分组。");
                return;
            }
            customerGroupList.datagrid("insertData", {
                groupid: "",
                groupname: "请填写分组名称",
                groupdesc: "请填写分组描述",
                grouptype: "2"
            });
            customerGroupList.find(".content>.rows>.row").removeClass("selected").last().addClass("selected");
            customerGroupSelected = customerGroupList.find(".content>.rows>.row:last").data("d");
            currentGroupData = customerGroupSelected;
            _addCutomerEnable = false;
        }
    }

    /**
     * 点击保存按钮，对当前数据做验证，其实点击保存也就是失去当前编辑框的焦点
     * 所以调用的方法还是updateGroupCheck，只有在没有编辑的状态下，该函数才会起作用
     * 而没有编辑过，也就不存在保存的操作，所以只需要添加验证，给用户提示相应信息就行。
     */
    function saveChangeCheck() {
        if (currentGroupData == null) {
            message.notice(false, "您还未做任何修改，保存失败，请重试。");
            return;
        }
        if (currentGroupData.groupname == "请填写分组名称" && currentGroupData.groupid == "") {
            message.notice(false, "请先为新分组命名后才能保存。");
            return;
        }
    }


    /**
     * 更新分组
     * @param cell 当前编辑过的列
     * @param val 当前编辑的文字
     * @param rowdata 当前行的数据对象
     */
    function updateGroup(cell, val, rowdata) {
        currentGroup = cell.parent().parent();
        grid.action({
            url: "cgroup/update",
            data: {
                group: JSON.stringify(rowdata)
            }

        }, _isAdd).then(updateGroupSuccess, updateGroupFail);
    }

    /**
     * 更新成功
     * @param d
     */
    function updateGroupSuccess(d) {
        grid.datagrid("updateRow", currentGroup, d.data);
        var tipMessage = "";
        if (_isAdd) {
            tipMessage = "添加`" + d.data.groupname + "`分组成功！";
        }
        else {
            tipMessage = "修改`" + d.data.groupname + "`分组成功！";
        }
        message.notice(true, tipMessage);
        _isAdd = false;
    }

    /**
     * 更新失败
     * @param error
     */
    function updateGroupFail(error) {
        var tipMessage = "";
        if (_isAdd) {
            tipMessage = "添加分组失败！";
        }
        else {
            tipMessage = "修改分组失败！";
        }
        message.notice(false, tipMessage);
        _isAdd = false;
    }

    /**
     * 点击分组后，相应信息随之改变
     * @param e
     */
    function groupCheck(e) {
        if (!!dealerGroupList && currentManage == "dealerGroup") {
            dealerGroupSelected = dealerGroupList.datagrid("getSelected");
            currentGroupData = dealerGroupSelected;
        }
        if (!!customerGroupList && currentManage == "customerGroup") {
            customerGroupSelected = customerGroupList.datagrid("getSelected");
            currentGroupData = customerGroupSelected;
        }
    }

    /**
     * 根据查询条件获取经销商列表
     * @param e
     */
    function queryDealer(e) {
        var grouptype = "", nickname = "", button = $(e.currentTarget);
        if (button.attr("id") == "queryd") {
            grouptype = "1";
            nickname = $("#querydealer").val();
            message = dealerMessage;
        }
        else if (button.attr("id") == "queryc") {
            grouptype = "2";
            nickname = $("#querycustomer").val();
            message = customerMessage;
        }
        if (nickname == "") {
            grid.action({
                url: "cgroup/list",
                data: {
                    page: 1,
                    size: 10,
                    query: JSON.stringify({grouptype: grouptype})
                }
            }).then(function (d) {
                grid.datagrid("setData", d.data.data);
            }, function (error) {
                message.notice(false, error.message);
            });
        }
        else {
            grid.action({
                url: "cgroup/query",
                data: {
                    page: 1,
                    size: 10,
                    nickname: nickname,
                    query: JSON.stringify({grouptype: grouptype})
                }
            }).then(queryDealerSuccess, queryDealerFail);
        }
    }

    /**
     * 查询成功，并更新列表
     * @param d
     */
    function queryDealerSuccess(d) {
        grid.datagrid("setData", d.data.data);
        message.notice(true, "查询成功。");
    }

    /**
     * 更新失败
     * @param error
     */
    function queryDealerFail(error) {
        message.notice(false, error.message);
    }

    /**
     * 菜单点击，随之更改字段信息
     * @param e
     */
    function menuChange(e) {
        var t = $(this);
        $(t.siblings()).removeClass("selected");
        t.addClass("selected");
        if (t.attr("data-value") === "dealerGroup" && currentManage != "dealerGroup") {
            $("#" + currentManage).hide();
            $("#dealerGroup").fadeIn("0");
            $("#hand").animate({
                top: 120
            }, 100);
            currentManage = "dealerGroup";
            message = dealerMessage;
            grid = dealerGroupList;
            currentGroupData = dealerGroupSelected;
        }
        else if (t.attr("data-value") === "customerGroup" && currentManage != "customerGroup") {
            $("#" + currentManage).hide();
            $("#customerGroup").fadeIn("0", function () {
                $("this").css("display","flex !important");
                if (customerGroupList == null) {
                    initCustomerList();
                    grid = customerGroupList;
                }
            });

            $("#hand").animate({
                top: 184
            }, 100);

            currentManage = "customerGroup";
            message = customerMessage;
            grid = customerGroupList;
            currentGroupData = customerGroupSelected;
        }
    }

    module.init = function () {
        if (!loaded) {
            initDealerList();
            currentManage = "dealerGroup";
            message = dealerMessage;
            grid = dealerGroupList;
            //$(".menu").on("click", ".item", menuChange);
            $("#dealerGroupSave").unbind().click(saveChangeCheck);
            $("#customerGroupSave").unbind().click(saveChangeCheck);
            $("#dealerGroupAdd").unbind().click(function () {
                addGroup(dealerGroupList);
            });
            $("#customerGroupAdd").unbind().click(function () {
                addGroup(customerGroupList);
            });
            $("#customerGroupDelete").unbind().click(deleteGroup);
            $("#dealerGroupDelete").unbind().click(deleteGroup);
            $("#queryd").unbind().click(queryDealer);
            $("#queryc").unbind().click(queryDealer);
            loaded = true;
        }
    };

    return module;
})
;