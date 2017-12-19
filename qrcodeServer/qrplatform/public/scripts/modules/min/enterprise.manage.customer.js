/**
 * Created by san on 2015/11/30.
 */
define(function () {
    var module = {}, loaded = false, customerList = null, customerSelected = null, customeres = null;
    var customerMessage = $("#customerMessage"), groupSelector = $("#groupSelector");
    var queryBeforeData = null;

    var funcList = {
        initList: {
            init: function () {
                customerList = $(".customerList").datagrid({
                    idField: "id",
                    selectCell: false,
                    /* data: {
                     empty: "<i data-lang='manage.role.empty'></i>"
                     //collectionName: "data"
                     },*/

                    commands: [{
                        /*   params: {
                         value: "delete",
                         class: "wficoonly ico_remove"
                         },
                         inline: true
                         }, */
                        params: {
                            value: "update",
                            class: "wficoonly ico_save"
                        },
                        inline: true
                    }],
                    commandClicked: function (e, val) {
                        switch (val) {
                            /* case "delete":
                             deleteCustomer();
                             break;*/
                            case "update":
                                funcList.updateCustomer.call();
                                break;
                        }
                    },
                    uri: "customer/list",
                    params: {
                        query: JSON.stringify({"custtype": 2})
                    },
                    columns: [
                        {checkbox: true},
                        {
                            field: "nickname",
                            caption: "昵称",
                            width: 160
                        },
                        {
                            field: "address",
                            caption: "地址",
                            width: 200
                        },
                        {
                            field: "phone",
                            caption: "电话",
                            width: 160,
                            editable: true
                        },
                        {
                            field: "countlottery",
                            caption: "中奖次数",
                            width: 80
                            /*  formatter: function (v) {
                             return v || "有待开发";
                             }*/
                        },
                        {
                            field: "totallottery",
                            caption: "中奖金额",
                            width: 120/*,
                         formatter: function (v) {
                         return v || "有待开发";

                         }*/
                        },
                        {
                            field: "totalpoint",
                            caption: "积分",
                            width: 120/*,
                         formatter: function (v) {
                         return v || "有待开发";
                         }*/
                        },
                        {
                            field: "groupname",
                            caption: "组别",
                            width: 140

                        }

                    ],
                    rowClicked: changeGroupCheck
                });
            }
        },

        queryCustomer: {
            call: function () {
                var res = $(".topTool").serializeForm();
                if (res.hasError) {

                }
                else {
                    $(document.body).action({
                        url: "customer/list",
                        data: {
                            page: 1,
                            size: 10,
                            query: JSON.stringify({
                                custtype: 2,
                                //"nickname":{"$like":"%22%"},
                                areacode: res.result.area,
                                nickname: res.result.nickname

                            })
                        }
                    }).then(funcList.queryCustomer.success, funcList.queryCustomer.fail);
                }
            },
            success: function (d) {
                customerList.datagrid("setData", d.data.data);
            },
            fail: function (error) {
                customerMessage.notice(false, error.message);
            }
        },

        seniorQueryCustomer: {
            call: function () {
                var res = $(".queryitem").serializeForm();
                if (res.hasError) {

                }
                else {
                    $(document.body).action({
                        url: "customer/list",
                        data: {
                            page: 1,
                            size: 10,
                            query: JSON.stringify({
                                custtype: 2,
                                //nickname:{"$like":"%22%"},
                                nickname: res.result.nickname,
                                areacode: res.result.seniorArea,
                                minlotterytime: parseInt(res.result.minLotteryTime),
                                maxlotterytime: parseInt(res.result.maxLotteryTime),
                                minpoint: parseInt(res.result.minScore),
                                maxpoint: parseInt(res.result.maxScore),
                                groupid: res.result.seniorGroup,

                            })
                        }
                    }).then(funcList.queryCustomer.success, funcList.queryCustomer.fail);
                }
            },
            success: function (d) {
                customerList.datagrid("setData", d.data.data);
            },
            fail: function (error) {
                customerMessage.notice(false, error.message);
            }
        },

        initCustomerGroupList: {
            call: function () {
                if ($(this).attr("class") != "opened" && $("#groupItems").children().length == 0) {
                    groupSelector.action({
                        url: "cgroup/list",
                        data: {
                            page: 1,
                            size: 10,
                            query: JSON.stringify({"grouptype": 2})
                        }
                    }, false).then(funcList.initCustomerGroupList.success, funcList.initCustomerGroupList.fail);
                }
            },
            success: function (d) {
                $("#groupItems").append("<button value=''>不选择分组</button>");
                $.each(d.data.data, function (i, v) {
                    $("#groupItems").append("<button value=" + v.groupid + ">" + v.groupname + "</button>");
                    $("button[value=" + v.groupid + "]").data("d", v);
                });


            },
            fail: function (error) {
                customerMessage.notice(false, error.message);
            }
        },

        updateCustomer: {
            call: function () {
                customerList.action({
                    url: "customer/update",
                    data: {
                        customer: JSON.stringify(customerSelected)
                    }
                }, false).then(funcList.updateCustomer.success, funcList.updateCustomer.fail);
            },
            success: function (d) {
                customerList.datagrid("updateSelectedRow", customerSelected);
                customerMessage.notice(true, "修改信息成功");
            },
            fail: function (error) {
                customerMessage.notice(false, error.message);
            }
        },

        changeGroup: {
            call: function (e) {
                try {
                    var groupid = $(e.currentTarget).data("d").groupid;
                }
                catch (e) {
                    return;
                }
                if ($("#userSelector").hasClass("openedMaskLayer"))
                    return;
                var customersids = [];
                $.each(customeres, function (i, v) {
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
                customerList.datagrid("refresh");
                customerMessage.notice(true, "修改成功");
            },
            fail: function (error) {
                customerMessage.notice(false, error.message);
            }
        }


    }

    /**
     * 输入框失焦时，对数字进行检测合法性
     * @param e
     */
    function inputTextCheck(e) {
        var t = $(this);
        var inputName = $(this).attr("id");
        switch (inputName) {
            case "minLotteryTime":
                var max = $("#maxLotteryTime").val();
                if (isNaN(t.val())) {
                    t.val("");
                    t.focus();
                    alert("最小中奖次数只能为数字，请重新填写。");
                }
                else if (!isNaN(t.val()) && max != "" && parseInt(t.val()) > parseInt(max)) {
                    t.val("");
                    t.focus();
                    alert("最小中奖次数不能比最大中奖次数大，请重新填写。");
                }
                break;
            case "maxLotteryTime":
                var min = $("#minLotteryTime").val();
                if (isNaN(t.val())) {
                    t.val("");
                    t.focus();
                    alert("最大中奖次数只能为数字，请重新填写。");
                }
                else if (!isNaN(t.val()) && min != "" && parseInt(t.val()) < parseInt(min)) {
                    t.val("");
                    t.focus();
                    alert("最大中奖次数不能比最小中奖次数小，请重新填写。");
                }
                break;
            case "minScore":
                var max = $("#maxScore").val();
                if (isNaN(t.val())) {
                    t.val("");
                    t.focus();
                    alert("最小积分只能为数字，请重新填写。");
                }
                else if (!isNaN(t.val()) && max != "" && parseInt(t.val()) > parseInt(max)) {
                    t.val("");
                    t.focus();
                    alert("最小积分不能比最大积分大，请重新填写。");
                }
                break;
            case "maxScore":
                var min = $("#minScore").val();
                if (isNaN(t.val())) {
                    t.val("");
                    t.focus();
                    alert("最大积分只能为数字，请重新填写。");
                }
                else if (!isNaN(t.val()) && min != "" && parseInt(t.val()) < parseInt(min)) {
                    t.val("");
                    t.focus();
                    alert("最大积分不能比最小积分小，请重新填写。");
                }

                break;

        }


    }


    /**
     * 检测是否有消费者被选中
     * @param e
     */
    function changeGroupCheck(e) {
        customeres = customerList.datagrid("getChecked");
        customerSelected = customerList.datagrid("getSelected");
        if (customeres.length > 0) {
            $("#changeGroup").attr("disabled", false);
        }
        else {
            $("#changeGroup").attr("disabled", true);
        }

    }

    function getCustomer(custid) {
        customerList.action({
                url: "customer/get",
                data: {
                    custid: custid
                }
            }
        ).then(function (d) {
            //console.log(d);
        }, function (error) {
            if (error.code) {
                console.log(error.message);
            }
        });
    }

    function onUserSelectorSubmit() {
        funcList.seniorQueryCustomer.call();
    }

    function onUserSelectCancel() {

    }

    /**
     * 删除消费者
     */
    /*function deleteCustomer() {
     customerList.action({
     url: "customer/deleteCustomer",
     //url:"cgroup/list",
     customerid: customerSelected.id
     }).then(deleteCustomerSuccess, deleteCustomerFail);
     }

     function deleteCustomerSuccess(d) {
     customerList.datagrid("removeSelectedRow");
     customerMessage.notice(true, "成功删除该用户");
     }

     function deleteCustomerFail(d) {
     customerMessage.notice(true, "删除用户失败");
     }*/


    module.init = function () {
        if (!loaded) {
            //$("#area").cval("5101");
            //initList();
            funcList.initList.init();
            $("#changeGroup").unbind().click(funcList.initCustomerGroupList.call);
            $("#seniorGroup").click(funcList.initCustomerGroupList.call);
            groupSelector.on("click", "button", "selectedItemChanged", funcList.changeGroup.call);
            $("input[type=text]").blur(inputTextCheck);
            $("#query").unbind().click(funcList.queryCustomer.call);
            $("#seniorquery").click(function (e) {
                $("#userSelector").maskerLayer("open");
                return false;
            });
            $("#userSelector").maskerLayer("event", {
                submit: onUserSelectorSubmit,
                cancel: onUserSelectCancel
            });
            //$("#customerArea").unbind().click(initCustomerAreaList);
            loaded = true;
        }


    }
    return module;
});