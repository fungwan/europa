/**
 * Created by fengyun on 2016/12/13.
 */

define(function () {

    var module = {}, loaded = false, mcdCategoryList = null, grid = null;
    var currentManage = null;
    var categoryMessage = $("#categoryMessage"), message = null;
    var siderbar = $(".popAddCategory"),mask = $(".mask");
    var categoryGroupSelected = null, categoryGroupChecked = null;
    var currentGroup = null, currentGroupData = null;
    var _addCategoryEnable = true, _isAdd = false;

    /**
     * 初始化商品类别列表
     */
    function initCategoryList() {
        mcdCategoryList = $(".mcdCategoryList").datagrid({
            idField: "id",
            selectCell: false,
            uri: "mcdManage/getCategoryList",//cgroup/list
            pagination: {
                info: "<div style='padding-left: 32px'> 当前显示数量 <b style='font-size: 22px'>{end}</b> / 总数 <b style='font-size: 22px'>{total}</b></div>"
            },
            columns: [
                {checkbox: true},
                {
                    field: "name",
                    caption: "类别名称",
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
                    field: "categorydesc",
                    caption: "类别描述",
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
            /*params: {
                query: JSON.stringify({"grouptype": 1})
            },*/
            rowClicked: groupCheck
        });
    }


    /**
     * 对更新类别进行检验，如果不符合更新条件，则对用户进行提示
     * @param cell  当前编辑列对象
     * @param val 编辑后的文字
     * @param rowdata 当前编辑行的数据
     */
    function updateGroupCheck(cell, val, rowdata) {
        if (cell.attr("data-column") == "c1") {
            if (rowdata.categoryid == "") {
                if (rowdata.name.trim() != val.trim()) {
                    if (currentManage == "categoryGroup") {
                        _addCategoryEnable = true;
                    }
                }
                _isAdd = true;
            }
            else {
                _isAdd = false;
            }

            if (cell.find("input").hasClass("error")) {
                message.notice(false, "类别名不能为空，请重新输入");
                return;
            }
            if (rowdata.name.trim() == val.trim()) {
                return;
            }
            else {
                rowdata.name = val;
                updateGroup(cell, val, rowdata);
            }
        }
        else if (cell.attr("data-column") == "c2") {
            if (rowdata.categoryid == "") {
                if (rowdata.categorydesc.trim() != val.trim()) {
                    if (currentManage == "categoryGroup") {
                        _addCategoryEnable = true;
                    }
                }
                _isAdd = true;
            }
            else {
                _isAdd = false;
            }

            if (rowdata.categorydesc.trim() == val.trim()) {
                return;
            }
            else {
                if (rowdata.name == "请填写类别名称") {
                    message.notice(false, "请先为新类别命名。");
                    return;
                }
                rowdata.categorydesc = val;
                updateGroup(cell, val, rowdata);
            }

        }
    }

    /**
     * 批量删除类别，如果存在刚添加的新类别且并未保存的，也一并添加进去进行删除，
     * 只是后台并不进行该类别的删除，因为后台根本就没有。
     * 这样做只是为了让界面上添加的类别一起删除。
     */
    function deleteGroup() {
        categoryGroupChecked = grid.datagrid("getChecked");
        if (categoryGroupChecked.length == 1 && categoryGroupChecked[0].categoryid == "") {
            deleteGroupSuccess();
            if (grid == mcdCategoryList)
                _addCategoryEnable = true;
            if (grid == customerGroupList)
                _addCutomerEnable = true;
            _isAdd = false;
            return;
        }
        var listid = [];
        $.each(categoryGroupChecked, function (i, v) {
            if (v.categoryid == "" && grid == mcdCategoryList) {
                _addCategoryEnable = true;
                _isAdd = false;
            }
            else if (v.categoryid == "" && grid == customerGroupList) {
                _addCutomerEnable = true;
                _isAdd = false;
            }
            listid.push(v.categoryid);
        });
        if (listid.length == 0) {
            message.notice(false, "您没有选择要删除的类别,请重试。")
        }
        else {
            grid.action({
                url: "mcdManage/delCategory",
                data: {
                    listid: JSON.stringify({
                        list: listid
                    })
                }
            }).then(deleteGroupSuccess, deleteGroupFail);
        }
    }

    /**
     * 成功删除类别，并在界面上将其删除
     * @param d
     */
    function deleteGroupSuccess(d) {
        grid.datagrid("removeCheckedRow");
        message.notice(true, "成功删除类别");
        if (grid.datagrid("getSelectedRow") == null) {
            currentGroupData = null;
        }
    }

    /**
     * 删除类别失败
     * @param error
     */
    function deleteGroupFail(error) {
        message.notice(false, "删除类别失败");
    }

    function addGroupCheck() {

        var res = siderbar.serializeForm();
        if (res.hasError) {
            $("#category-empty-msg").notice(false, res.result);
            return;
        } 

        var b = $(document.body);
        b.action({
            url: "mcdManage/getCategoryList",
            data: {
                query: JSON.stringify({"name": $("#categoryName").val()}),
                page:"1",
                size:"10"
            }
        }, false).then(function(result){
            var data = result.data.data;
            if(data.length > 0 ){
                $("#category-exist-msg").notice(false, "该商品类别已经存在");
                return;
            }

            addGroup();
        });

    }
    /**
     * 点击添加类别后，在界面上添加一个新类别
     * @param grid
     */
    function addGroup() {

        console.log($("#categoryDesc").val());

        var s = $("#save");
        s.action({
            url: "mcdManage/saveOrUpdCategory",
            data: {
                categoryInfo: JSON.stringify({ 
                    "categoryid":"",
                    "name": $("#categoryName").val(),
                    "categorydesc": $("#categoryDesc").val()
                })
            }
        }, false).then(function(result) {
            var data = result.data;
            mcdCategoryList.datagrid("insertData", data);
            mcdCategoryList.find(".content>.rows>.row").removeClass("selected").last().addClass("selected");
            categoryGroupSelected = mcdCategoryList.find(".content>.rows>.row:last").data("d");
            currentGroupData = categoryGroupSelected;
            _addCategoryEnable = false;

            mask.fadeOut();
            siderbar.css({ "right": -500 });
        });
    }

    /**
     * 更新类别
     * @param cell 当前编辑过的列
     * @param val 当前编辑的文字
     * @param rowdata 当前行的数据对象
     */
    function updateGroup(cell, val, rowdata) {
        currentGroup = cell.parent().parent();
        grid.action({
            url: "mcdManage/saveOrUpdCategory",
            data: {
                categoryInfo: JSON.stringify(rowdata)
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
            tipMessage = "添加`" + d.data.groupname + "`类别成功！";
        }
        else {
            tipMessage = "修改`" + d.data.groupname + "`类别成功！";
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
            tipMessage = "添加类别失败！";
        }
        else {
            tipMessage = "修改类别失败！";
        }
        message.notice(false, tipMessage);
        _isAdd = false;
    }

    /**
     * 点击类别后，相应信息随之改变
     * @param e
     */
    function groupCheck(e) {
        if (!!mcdCategoryList && currentManage == "categoryGroup") {
            categoryGroupSelected = mcdCategoryList.datagrid("getSelected");
            currentGroupData = categoryGroupSelected;
        }
    }

    /**
     * 根据查询条件获取经销商列表
     * @param e
     */
    function queryCategory(e) {
        var grouptype = "", nickname = "", button = $(e.currentTarget);
        if (button.attr("id") == "queryd") {
            grouptype = "1";
            nickname = $("#queryCategory").val();
            message = categoryMessage;
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

    
    module.init = function () {
        if (!loaded) {
            initCategoryList();
            currentManage = "categoryGroup";
            message = categoryMessage;
            grid = mcdCategoryList;
            $("#save").unbind().click(function () {
                addGroupCheck();
            });
            $("#categotyGroupAdd").click(function () {
                //$(".popAddCategory").stop().animate({ 'right': '0' }, 500);
                mask.fadeIn();
                siderbar.css({"right":0});
            });
            $("#cancel").click(function () {
                //$(".popAddCategory").stop().animate({ 'right': '-500px' }, 500);
                mask.fadeOut();
                siderbar.css({"right":-500});
            });
            $("#categoryGroupDelete").unbind().click(deleteGroup);

            //$("#queryd").unbind().click(queryCategory);
            loaded = true;
        }
    };

    return module;
})
;