/**
 * Created by san on 2015/12/2.
 */

define(function () {
    var module = {}, loaded = false, dealerGroupList = null, customerGroupList = null, dealeres = null;
    var currentManage = null;
    var dealerMessage = $("#dealerMessage"), customerMessage = $("#customerMessage");
    var dealerGroupSelected = null, customerGroupSelected = null, dealerGroupChecked = null, customerGroupChecked = null;

    function initDealerList() {
        dealerGroupList = $(".dealerGroupList").datagrid({
            idField: "id",
            selectCell: false,
            data: {
                empty: "<i data-lang='manage.role.empty'></i>",
                collectionName: "data.data"
            },
            /*     pagination: {
             on: false,
             pageIndexParamName: "page",
             pageSizeParamName: "limit"
             },*/
            uri: "cgroup/list",
            commands: [{
                params: {
                    value: "delete",
                    class: "wficoonly ico_remove customer"
                },
                inline: true
            }, {
                params: {
                    value: "add",
                    class: "wficoonly ico_add"
                },
                inline: true
            }],

            commandClicked: function (e, val) {
                switch (val) {
                    case "add":
                        addGroup(dealerGroupList);
                        break;
                    case "delete":
                        deleteGroup(dealerGroupList);
                        break;

                }
            },
            columns: [
                {checkbox: true},
                {
                    field: "groupname",
                    caption: "名称",
                    width: 150,
                    editable: true
                },
                {
                    field: "groupdesc",
                    caption: "描述",
                    width: 500,
                    editable: true
                }

            ],
            params: {
                query: JSON.stringify({"grouptype": 1})
            },
            rowClicked: changeGroupCheck

        });
    }

    function initCustomerList() {
        customerGroupList = $(".customerGroupList").datagrid({
            idField: "id",
            selectCell: false,
            data: {
                empty: "<i data-lang='manage.role.empty'></i>",
                //collectionName: "data.data"
            },

            uri: "cgroup/list",
            commands: [{
                params: {
                    value: "delete",
                    class: "wficoonly ico_remove dealer"
                },
                inline: true
            }, {
                params: {
                    value: "add",
                    class: "wficoonly ico_add"
                },
                inline: true
            }],
            commandClicked: function (e, val) {
                switch (val) {
                    case "delete":
                        deleteGroup(customerGroupList);
                        break;
                    case "add":
                        addGroup(customerGroupList);
                        break;
                }
            },
            columns: [
                {checkbox: true},
                {
                    field: "groupname",
                    caption: "名称",
                    width: 150,
                    editable: true
                    //changed:getNewData
                },
                {
                    field: "groupdesc",
                    caption: "描述",
                    width: 600,
                    editable: true
                    //changed:getNewData
                }

            ],
            rowClicked: changeGroupCheck,
            params: {
                query: JSON.stringify({"grouptype": 2})
            }
        });

    }


    function deleteGroup(grid) {
        //var groupid = grid.datagrid("removeCheckedRow");
        if (grid == dealerGroupList) {
            dealerGroupChecked = dealerGroupList.datagrid("getChecked");
            var listid = [];
            $.each(dealerGroupChecked, function (i, v) {
                listid.push(v.groupid);
            })
            if (listid.length == 0) {
                dealerMessage.notice(false, "您没有选择要删除的组别,请重试。")
            }
            else {
                grid.action({
                    url: "cgroup/deletegr",
                    data: {
                        listid: JSON.stringify({
                            list: listid
                        })
                    }
                }).then(deleteDealerGroupSuccess, deleteDealerGroupFail);
            }
        }

        else if (grid == customerGroupList) {
            customerGroupChecked = customerGroupList.datagrid("getChecked");
            var listid = [];
            $.each(customerGroupChecked, function (i, v) {
                listid.push(v.groupid);
            })
            if (listid.length == 0) {
                customerMessage.notice(false, "您没有选择要删除的组别,请重试。")
            }
            else {
                grid.action({
                        url: "cgroup/deletegr",
                        data: {
                            listid: JSON.stringify({
                                list: listid
                            })
                        }
                    }
                ).then(deleteCustomerGroupSuccess, deleteCustomerGroupFail);
            }
        }
    }

    function deleteDealerGroupSuccess(d) {
        dealerGroupList.datagrid("removeCheckedRow");
        dealerMessage.notice(true, "成功删除该分组");
    }

    function deleteCustomerGroupSuccess(d) {
        customerGroupList.datagrid("removeCheckedRow");
        customerMessage.notice(true, "成功删除该分组");
    }

    function deleteDealerGroupFail(error) {
        dealerMessage.notice(false, error.message);
    }

    function deleteCustomerGroupFail(error) {
        customerMessage.notice(false, error.message);
    }


    function addGroup(grid) {
        if (grid == dealerGroupList) {
            dealerGroupChecked = dealerGroupList.datagrid("insertData", {
                groupid: "add",
                groupname: "请填写组名称",
                groupdesc: "请填写组描述",
                grouptype: "1"
            });
        }

        else if (grid == customerGroupList) {
            customerGroupChecked = customerGroupList.datagrid("insertData", {
                groupid: "add",
                groupname: "请填写组名称",
                groupdesc: "请填写组描述",
                grouptype: "2"
            });
        }
    }

    function groupUpdate(e) {
        var t = $(this);
        if (t.attr("id") === "dealerGroupSave") {
            dealerGroupSelected = dealerGroupList.datagrid("getSelected");
            if (!dealerGroupSelected) {
                dealerMessage.notice(false, "您还未选择需要保存的分组。")
            }
            else {
                dealerGroupList.action({
                    url: "cgroup/update",
                    data: {
                        group: JSON.stringify(dealerGroupSelected)
                    }

                }).then(updateDealerGroupSuccess, updateDealerGroupFail);
            }
        }
        else if (t.attr("id") === "customerGroupSave") {
            customerGroupSelected = customerGroupList.datagrid("getSelected");
            if (!customerGroupSelected) {
                customerMessage.notice(false, "您还未选择需要保存的分组。")
            }
            else {
                customerGroupList.action({
                    url: "cgroup/update",
                    data: {
                        group: JSON.stringify(customerGroupSelected)
                    }
                }).then(updateCustomerGroupSuccess, updateCustomerGroupFail);
            }
        }
    }

    function updateDealerGroupSuccess(d) {
        dealerGroupList.datagrid("updateSelectedRow", d.data);
        dealerMessage.notice(true, "修改成功！");
    }

    function updateCustomerGroupSuccess(d) {
        dealerGroupList.datagrid("updateSelectedRow", d.data);
        customerMessage.notice(true, '修改成功');
    }

    function updateDealerGroupFail(error) {
        dealerMessage.notice(false, "修改失败:" + error.message);
    }

    function updateCustomerGroupFail(error) {
        customerMessage.notice(false, '修改失败:' + error.message);
    }

    /**
     * 对于分组进行判断，必须有选择经销商才能进行分组
     * @param e
     */
    function changeGroupCheck(e) {
        if (!!dealerGroupList)
            dealerGroupSelected = dealerGroupList.datagrid("getSelected");
        if (!!customerGroupList)
            customerGroupSelected = customerGroupList.datagrid("getSelected");
    }


    /**
     * 根据查询条件获取经销商列表
     * @param e
     */
    function queryDealer(e) {
        var res = $(".topTool").serializeForm();
        if (res.hasError) {

        }
        else {
            $(document.body).action({
                url: "",
                data: res.result
            }).then();
        }

    }


    module.init = function () {
        if (!loaded) {
            initDealerList();
            currentManage = "dealerGroup";
            $(".menu").on("click", ".item", function (e) {
                var t = $(this);
                $(t.siblings()).removeClass("selected");
                t.addClass("selected");
                if (t.attr("data-value") === "dealerGroup" && currentManage != "dealerGroup") {
                    $("#" + currentManage).hide();
                    $("#dealerGroup").fadeIn(200);
                    currentManage = "dealerGroup";
                }
                else if (t.attr("data-value") === "customerGroup" && currentManage != "customerGroup") {
                    $("#" + currentManage).hide();
                    $("#customerGroup").fadeIn("100", function () {
                        if (customerGroupList == null)
                            initCustomerList();
                    });
                    currentManage = "customerGroup";
                }
            });
            $("#dealerGroupSave").unbind().click(groupUpdate);
            $("#customerGroupSave").unbind().click(groupUpdate);
            $("#dealerGroupAdd").unbind().click(function () {
                addGroup(dealerGroupList);
            });
            $("#customerGroupAdd").unbind().click(function () {
                addGroup(customerGroupList);
            });
            $("#customerGroupDelete").unbind().click(function () {
                deleteGroup(customerGroupList);
            });
            $("#dealerGroupDelete").unbind().click(function () {
                deleteGroup(dealerGroupList);
            });
            $("#dealerGroupAdd").click();

            loaded = true;
        }
    };

    return module;
})
;