/**
 * Created by san on 2015/11/30.
 */
define(function () {
    var module = {}, loaded = false, dealerList = null, dealeres = null, dealerSelected = null;
    var nameSelector = $("#nameSelector"), changeGroupBtn = $("#changeGroup"), groupSelector = $("#groupSelector"), dealerMessage = $("#dealerMessage");
    var datagridBefore = null;
    var funcList = {

        /**
         * 初始化经销商列表
         */
        initList: {
            init: function () {
                dealerList = $(".dealerList").datagrid({
                    idField: "custid",
                    selectCell: false,
                    params: {
                        query: JSON.stringify({"custtype": 1})
                    },
                    commands: [{
                        params: {
                            value: "update",
                            class: "wficoonly ico_save"
                        },
                        inline: true
                    }],
                    commandClicked: function (e, val) {
                        switch (val) {
                            case "update":
                                funcList.updateDealer.call();
                                break;
                        }
                    },
                    uri: "customer/list",
                    columns: [
                        {checkbox: true},
                        {
                            field: "nickname",
                            caption: "名称",
                            width: 150
                        },
                        {
                            field: "country",
                            caption: "国家",
                            width: 100
                        },
                        {
                            field: "province",
                            caption: "省",
                            width: 100
                        },
                        {
                            field: "city",
                            caption: "市",
                            width: 100
                        },
                        {
                            field: "address",
                            caption: "地址",
                            width: 300,
                            editable: true
                        },
                        {
                            field: "phone",
                            caption: "电话",
                            width: 160,
                            editable: true
                        },
                        {
                            field: "groupname",
                            caption: "组别",
                            width: "150"
                        }
                    ],
                    rowClicked: changeGroupCheck
                });

            }
        },

        /**
         * 按条件查询经销商
         */
        queryDealer: {
            call: function (e) {
                var res = $(".topTool").serializeForm();
                if (res.hasError) {

                }
                else {
                    $(document.body).action({
                        url: "customer/list",
                        data: {
                            page: 1,
                            size: 30,
                            query: JSON.stringify({
                                custtype: 1,
                                areacode: res.result.area,
                                nickname: res.result.dealerName
                            })
                        }
                    }).then(funcList.queryDealer.success, funcList.queryDealer.fail);
                }
            },
            success: function (d) {
                dealerList.datagrid("setData", d.data.data);
            },
            fail: function (error) {
                dealerMessage.notice(false, error.message);
            }
        },

        /**
         * 初始化所属组别列表
         */
        initGroupList: {
            call: function (e) {
                if ($(this).attr("class") != "opened" && $("#groupItems").children().length == 0) {
                    groupSelector.action({
                        url: "cgroup/list",
                        data: {
                            page: 1,
                            size: 20,
                            query: JSON.stringify({"grouptype": 1})
                        }
                    }, false).then(funcList.initGroupList.success, funcList.initGroupList.fail);
                }
                else {
                    console.log("没有触发");
                }
            },
            success: function (d) {
                $.each(d.data.data, function (i, v) {
                    $("#groupItems").append("<button value=" + v.groupid + ">" + v.groupname + "</button>");
                    $("button[value=" + v.groupid + "]").data("d", v);
                })
            },
            fail: function (error) {
                dealerMessage.notice(false, error.message);
            }
        },

        /**
         * 更新所选经销商信息
         */
        updateDealer: {
            call: function (e) {
                dealerList.action({
                    url: "customer/update",
                    data: {
                        customer: JSON.stringify(dealerSelected)
                    }
                }).then(funcList.updateDealer.success, funcList.updateDealer.fail);
            },
            success: function (d) {
                dealerList.datagrid("updateSelectedRow", dealerSelected);
                dealerMessage.notice(true, "修改信息成功");
            },
            fail: function (error) {
                dealerMessage.notice(false, error.message);
            }
        },

        /**
         * 更改所选经销商的分组
         */
        changeGroup: {
            call: function (e) {
                var group = $(e.currentTarget).val();
                var customersids = [];
                $.each(dealeres, function (i, v) {
                    customersids.push(v.custid);
                })
                $(document.body).action({
                    url: "customer/group",
                    data: {
                        detail: JSON.stringify({
                            idlist: customersids,
                            groupid: $(e.currentTarget).data("d").groupid,
                            groupname: $(e.currentTarget).data("d").groupname
                        })
                    }
                }).then(funcList.changeGroup.success, funcList.changeGroup.fail);
            },
            success: function (d) {

                dealerList.datagrid("refresh");
                changeGroupBtn.html("更改分组").attr("disabled",true);

                dealerMessage.notice(true, "修改成功");
            },
            fail: function (error) {
                dealerMessage.notice(false, error.message);
            }
        }
    }

    /**
     * 对于分组进行判断，必须有选择经销商才能进行分组
     * @param e
     */
    function changeGroupCheck(e) {
        dealeres = dealerList.datagrid("getChecked");
        dealerSelected = dealerList.datagrid("getSelected");
        if (dealeres.length > 0) {
            changeGroupBtn.attr("disabled", false);
        }
        else {
            changeGroupBtn.attr("disabled", true);
        }
    }

    /**
     * 删除经销商
     */
    /*   function deleteDealer() {
     dealerList.action({
     url: "dealer/deleteDealer",
     //url:"cgroup/list",
     dealerid: dealerSelected.id
     }).then(deleteDealerSuccess, deleteDealerFail);
     }

     function deleteDealerSuccess(d) {
     dealerList.datagrid("removeSelectedRow");
     dealerMessage.notice(true, "成功删除该经销商");
     }

     function deleteDealerFail(d) {
     dealerMessage.notice(true, "删除经销商失败");
     }*/


    module.init = function () {
        if (!loaded) {
            //initList();
            funcList.initList.init();
            changeGroupBtn.unbind().click(funcList.initGroupList.call);
            $("#queryGroup").click(funcList.initGroupList.call);
            //$("#dealerName").unbind().click(funcList.initDealerNameList.call);
            groupSelector.on("click", "button", "selectedItemChanged", funcList.changeGroup.call);
            $("#query").unbind().click(funcList.queryDealer.call);
            $("#test").click(function (e) {
                $(document.body).action({
                    url: "analyze/answeranalyze",
                    data: {
                        details: JSON.stringify({
                            id: "b5bd1436-99b7-11e5-a83f-9848a14fa75a1",
                            areacode: "",
                            begtime: "2010-10-10 22:22:22",
                            endtime: "2070-10-10 22:22:22",
                            questions: ['b5bd1436-99b7-11e5-a83f-9848a14fa75a1', 'b5bd1436-99b7-11e5-a83f-9848a14fa75a2', 'b5bd1436-99b7-11e5-a83f-9848a14fa75a3']

                        })
                    }
                }).then(function (result) {
                    console.log("result：" + result);
                }, function (error) {
                    console.log("error:" + error);
                    ;
                });
            })
            loaded = true;

        }
    };

    return module;
});