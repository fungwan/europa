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
                        query: JSON.stringify({"custtype": 2})
                    },
                    pagination: {
                        info: "<div style='padding-left: 32px'> 当前显示数量 <b style='font-size: 22px'>{end}</b> / 总数 <b style='font-size: 22px'>{total}</b></div>"
                    },
                    uri: "customer/list",
                    columns: [
                        {checkbox: true},
                        {
                            field: "nickname",
                            caption: "经销商名称",
                            width: 160,
                            sortable: true,
                            sort: "asc"
                        },
                        {
                            field: "sex",
                            caption: "性别",
                            width: 80,
                            sortable: true
                        },
                        {
                            field: "address",
                            caption: "地址",
                            width: 200,
                            editable: true,
                            changed: funcList.update.call,
                            sortable: true
                        },
                        {
                            field: "phone",
                            caption: "电话",
                            width: 160,
                            editable: true,
                            changed: funcList.update.call,
                            sortable: true
                        },
                        {
                            field: "countlottery",
                            caption: "中奖次数",
                            width: 80,
                            sortable: true
                        },
                        {
                            field: "totallottery",
                            caption: "中奖金额",
                            width: 120,
                            sortable: true
                        },
                        {
                            field: "totalpoint",
                            caption: "积分",
                            width: 120,
                            sortable: true
                        },
                        {
                            field: "groupname",
                            caption: "组别",
                            width: 140,
                            sortable: true
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
                    dealerList.datagrid("reload", {
                        query: JSON.stringify({
                            custtype: 2,
                            areacode: res.result.area,
                            nickname: res.result.dealerName
                        })
                    });

                    /* $(document.body).action({
                     url: "customer/list",
                     data: {
                     page: 1,
                     size: 30,
                     query: JSON.stringify({
                     custtype: 2,
                     areacode: res.result.area,
                     nickname: res.result.dealerName
                     })
                     }
                     }).then(funcList.queryDealer.success, funcList.queryDealer.fail);*/
                }
            }/*,
             success: function (d) {
             dealerList.datagrid("setData", d.data.data);
             },
             fail: function (error) {
             dealerMessage.notice(false, error.message);
             }*/
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
                $("#groupItems").append("<button value=''>不选择分组</button>");
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
                if (dealerSelected == null) {
                    dealerMessage.notice(false, "您还没有进行操作，请重试。");
                }
                else {
                    dealerList.action({
                        url: "customer/update",
                        data: {
                            customer: JSON.stringify(dealerSelected)
                        }
                    }).then(funcList.updateDealer.success, funcList.updateDealer.fail);
                }
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
         * 失去电话焦点更新记录
         * @param cell,val,rowdata
         */
        update: {
            call: function (cell, val, rowdata) {
                if (cell.attr("data-column") == "c4") {
                    if (rowdata.phone.trim() == val.trim()) {
                        return;
                    }
                    rowdata.phone = val;
                }
                else if (cell.attr("data-column") == "c3") {
                    if (rowdata.address.trim() == val.trim()) {
                        return;
                    }
                    rowdata.address = val;
                }
                dealerList.action({
                    url: "customer/update",
                    data: {
                        customer: JSON.stringify(rowdata)
                    }
                }, false).then(function (d) {
                    dealerList.datagrid("updateRow", cell.parent().parent());
                    if (cell.attr("data-column") == "c4")
                        dealerMessage.notice(true, "恭喜你！" + rowdata.nickname + " 的电话号码成功更新为：" + val);
                    else if (cell.attr("data-column") == "c3") {
                        if (val.trim() == "") {
                            dealerMessage.notice(true, "恭喜你！" + rowdata.nickname + " 的地址成功更新为：无");
                        }
                        else
                            dealerMessage.notice(true, "恭喜你！" + rowdata.nickname + " 的地址成功更新为：" + val);
                    }

                }, function (error) {
                    /* if (cell.attr("data-column") == "c4")
                     dealerMessage.notice(false, "对不起，" + rowdata.nickname + "的电话号码更新失败，请重试！");
                     else if(cell.attr("data-column") == "c3")
                     dealerMessage.notice(false, "对不起！" + rowdata.nickname + "的地址更新失败，请重试！");*/
                    dealerMessage.notice(false, error.message);
                });
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
                dealerList.datagrid("reload");
                changeGroupBtn.html("更改分组").attr("disabled", true);
                dealerMessage.notice(true, "修改成功");
            },
            fail: function (error) {
                dealerMessage.notice(false, error.message);
            }
        },

        /**
         * 高级查询
         */
        seniorQueryDealer: {
            call: function () {
                var res = $(".queryitem").serializeForm();
                if (res.hasError) {

                }
                else {
                    dealerList.datagrid("reload", {
                        query: JSON.stringify({
                            custtype: 2,
                            nickname: res.result.nicknameSenior,
                            areacode: res.result.seniorArea,
                            minlotterytime: parseInt(res.result.minLotteryTime),
                            maxlotterytime: parseInt(res.result.maxLotteryTime),
                            minpoint: parseInt(res.result.minScore),
                            maxpoint: parseInt(res.result.maxScore),
                            groupid: res.result.seniorGroup
                        })
                    });

                    /*  $(document.body).action({
                     url: "customer/list",
                     data: {
                     page: 1,
                     size: 10,
                     query: JSON.stringify({
                     custtype: 2,
                     nickname: res.result.nicknameSenior,
                     areacode: res.result.seniorArea,
                     minlotterytime: parseInt(res.result.minLotteryTime),
                     maxlotterytime: parseInt(res.result.maxLotteryTime),
                     minpoint: parseInt(res.result.minScore),
                     maxpoint: parseInt(res.result.maxScore),
                     groupid: res.result.seniorGroup
                     })
                     }
                     }).then(funcList.seniorQueryDealer.success, funcList.seniorQueryDealer.fail);*/
                }
            }/*,
             success: function (d) {
             dealerList.datagrid("setData", d.data.data);
             },
             fail: function (error) {
             dealerMessage.notice(false, error.message);
             }*/
        }

        /*  /!**
         * 排序重新获取列表
         *!/
         sortDealerList: {
         call: function (cell, data) {
         var order = cell.attr("data-order");
         dealerList.action({
         url: "customer/list",
         data: {
         page: 1,
         size: 10,
         order: order,
         orderby: data.field,
         query: JSON.stringify({"custtype": 2})
         }
         }).then(function (d) {
         dealerList.datagrid("setData", d.data.data);
         if (order == "asc") {
         cell.attr("data-order", "desc");
         }
         else if (order == "desc") {
         cell.attr("data-order", "asc");
         }
         }, function (error) {
         dealerMessage.notice(false, "重新排序失败，请重试。");
         });
         }
         }*/
    }
    /*
     /!**
     *
     * @param t
     * @param data
     *!/
     function sortTest(cell,data) {
     var order=cell.attr("data-order");
     funcList.sortDealerList.call();
     if(order=="asc"){
     cell.attr("data-order","desc");
     }
     else if(order=="desc"){
     cell.attr("data-order","asc");
     }
     }*/


    /**
     * 检测是否有消费者被选中
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
     * 开始高级查询
     */
    function onUserSelectorSubmit() {
        funcList.seniorQueryDealer.call();
    }

    /**
     * 点击关闭
     */
    function onUserSelectCancel() {

    }

    /**
     * 给区域选择设置title
     */
    function areaTitle() {
        var t = $(this);
        if (t.html().length > 8) {
            t.attr("title", t.html());
        }
    }


    module.init = function () {
        if (!loaded) {
            funcList.initList.init();
            changeGroupBtn.unbind().click(funcList.initGroupList.call);
            $("#seniorGroup").click(funcList.initGroupList.call);
            groupSelector.on("click", "button", "selectedItemChanged", funcList.changeGroup.call);
            $("#query").unbind().click(funcList.queryDealer.call);
            $("#seniorquery").click(function (e) {
                $("#userSelector").maskerLayer("open");
                return false;
            });
            $("#userSelector").maskerLayer("event", {
                submit: onUserSelectorSubmit,
                cancel: onUserSelectCancel
            });
            $("#area").change(areaTitle);
            loaded = true;
        }
    };

    return module;
});