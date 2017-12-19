/**
 * Created by san on 2015/11/30.
 */
define(function () {
    var module = {}, loaded = false, customerList = null, customerSelected = null, customeres = null;
    var customerMessage = $("#customerMessage"), groupSelector = $("#groupSelector");
    var queryBeforeData = null;
    var currentPage= 0,totalpage= 0,pagesize= 0,totalsize= 0,currentsize= 0,checkedsize=0;

    var funcList = {
        /**
         * 初始化消费者列表
         */
        initList: {
            init: function () {
                customerList = $(".customerList").datagrid({
                    idField: "id",
                    selectCell: false,
                    uri: "customer/list",
                    params: {
                        query: JSON.stringify({"custtype": 1})
                    },
                    pagination: {
                        info: "<div style='padding-left: 32px'> 当前显示数量 <b style='font-size: 22px'>{end}</b> / 总数 <b style='font-size: 22px'>{total}</b></div>"
                    },
                    columns: [
                        {checkbox: true},
                        {
                            field: "nickname",
                            caption: "昵称",
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
         * 查询消费者
         */
        queryCustomer: {
            call: function () {
                var res = $(".topTool").serializeForm();
                if (res.hasError) {

                }
                else {
                    customerList.datagrid("reload", {
                        query: JSON.stringify({
                            custtype: 1,
                            areacode: res.result.area,
                            nickname: res.result.nickname
                        })
                    });
                    /*$(document.body).action({
                        url: "customer/list",
                        data: {
                            page: 1,
                            size: 20,
                            query: JSON.stringify({
                                custtype: 1,
                                areacode: res.result.area,
                                nickname: res.result.nickname
                            })
                        }
                    }).then(funcList.queryCustomer.success, funcList.queryCustomer.fail);*/
                }
            },
            success: function (d) {
                customerList.datagrid("setData", d.data.data);
            },
            fail: function (error) {
                customerMessage.notice(false, error.message);
            }
        },

        /**
         * 高级查询
         */
        seniorQueryCustomer: {
            call: function () {
                var res = $(".queryitem").serializeForm();
                if (res.hasError) {

                }
                else {
                    customerList.datagrid("reload", {
                        query: JSON.stringify({
                            custtype: 1,
                            nickname: res.result.nicknameSenior,
                            areacode: res.result.seniorArea,
                            minlotterytime: parseInt(res.result.minLotteryTime),
                            maxlotterytime: parseInt(res.result.maxLotteryTime),
                            minpoint: parseInt(res.result.minScore),
                            maxpoint: parseInt(res.result.maxScore),
                            groupid: res.result.seniorGroup
                        })
                    });
                    /*$(document.body).action({
                        url: "customer/list",
                        data: {
                            page: 1,
                            size: 20,
                            query: JSON.stringify({
                                custtype: 1,
                                nickname: res.result.nicknameSenior,
                                areacode: res.result.seniorArea,
                                minlotterytime: parseInt(res.result.minLotteryTime),
                                maxlotterytime: parseInt(res.result.maxLotteryTime),
                                minpoint: parseInt(res.result.minScore),
                                maxpoint: parseInt(res.result.maxScore),
                                groupid: res.result.seniorGroup
                            })
                        }
                    }).then(funcList.queryCustomer.success, funcList.queryCustomer.fail);*/
                }
            },
            success: function (d) {
                customerList.datagrid("setData", d.data.data);
            },
            fail: function (error) {
                customerMessage.notice(false, error.message);
            }
        },

        /**
         * 初始化消费者分组列表
         */
        initCustomerGroupList: {
            call: function () {
                if ($(this).attr("class") != "opened" && $("#groupItems").children().length == 0) {
                    groupSelector.action({
                        url: "cgroup/list",
                        data: {
                            page: 1,
                            size: 20,
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

        /**
         * 点击保存按钮，保存修改后未保存的记录
         */
        updateCustomer: {
            call: function () {
                if (customerSelected == null) {
                    customerMessage.notice(false, "您还没进行修改，请重试。");
                } else {
                    customerList.action({
                        url: "customer/update",
                        data: {
                            customer: JSON.stringify(customerSelected)
                        }
                    }, false).then(funcList.updateCustomer.success, funcList.updateCustomer.fail);
                }
            },
            success: function (d) {
                customerList.datagrid("updateSelectedRow", customerSelected);
                customerMessage.notice(true, "保存成功");
            },
            fail: function (error) {
                customerMessage.notice(false, error.message);
            }
        },

        /**
         * 失去电话焦点更新记录
         * @param cell,val,rowdata
         */
        update: {
            call: function (cell, val, rowdata) {
                if (rowdata.phone.trim() == val.trim()) {
                    return;
                }
                else {
                    rowdata.phone = val;
                    customerList.action({
                        url: "customer/update",
                        data: {
                            customer: JSON.stringify(rowdata)
                        }
                    }, false).then(function (d) {
                        customerList.datagrid("updateRow", cell.parent().parent());
                        customerMessage.notice(true, "恭喜你！" + rowdata.nickname + "的电话号码成功更新为：" + val);
                    }, function (error) {
                        customerMessage.notice(false, "对不起，" +error.message);
                    });
                }
            }
        },

        /**
         * 更改所选消费者分组
         */
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
                customerList.datagrid("reload");
                customerMessage.notice(true, "修改成功");
            },
            fail: function (error) {
                customerMessage.notice(false, error.message);
            }
        },

      /*  /!**
         * 排序重新获取列表
         *!/
        sortDealerList:{
            call: function (cell,data) {
                var order=cell.attr("data-order");
                customerList.action({
                    url:"customer/list",
                    data:{
                        page:1,
                        size:10,
                        order: order,
                        orderby:data.field,
                        query: JSON.stringify({"custtype": 1})
                    }
                }).then(function (d) {
                    customerList.datagrid("setData", d.data.data);
                    if(order=="asc"){
                        cell.attr("data-order","desc");
                    }
                    else if(order=="desc"){
                        cell.attr("data-order","asc");
                    }
                }, function (error) {
                    customerMessage.notice(false,"重新排序失败，请重试。");
                });
            }
        }*/
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

    /**
     * 获取单个消费者详细信息
     * @param custid
     */
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

    /**
     * 高级查询点击查询
     */
    function onUserSelectorSubmit() {
        funcList.seniorQueryCustomer.call();
    }

    /**
     * 高级查询点击取消
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
            //$("#area").cval("5101");
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
            $("#area").change(areaTitle);
            loaded = true;
        }


    }
    return module;
});