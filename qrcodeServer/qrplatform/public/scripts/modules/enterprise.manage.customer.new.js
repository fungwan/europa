define(function () {
    var module = {}, loaded = false;
    var message = $("#customerMessage");

    // 消费者管理构造函数
    function CustomerManagement () {
        var _this = this;
        this.datagrid = $(".customerList").datagrid({
            idField: "id",
            selectCell: false,
            uri: "customer/list",
            params: {
                query: JSON.stringify({"custtype": 1})
            },
            pagination: {
                info: "<div style='padding-left: 32px'>当前显示数量 <b style='font-size: 22px'>{end}</b> / 总数 <b style='font-size: 22px'>{total}</b></div>"
            },
            columns: [
                {
                    checkbox: true
                },
                {
                    field: "nickname",
                    caption: "昵称",
                    width: 150,
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
                    width: 250,
                    sortable: true
                },
                {
                    field: "phone",
                    caption: "电话",
                    width: 180,
                    sortable: true
                },
                {
                    field: "countlottery",
                    caption: "中奖次数",
                    width: 100,
                    sortable: true
                },
                {
                    field: "totalpoint",
                    caption: "积分",
                    width: 140,
                    sortable: true
                },
                {
                    field: "groupname",
                    caption: "组别",
                    width: 140,
                    sortable: true
                }
            ],
            rowClicked: function () {
                _this.changeCustomerCheck();
            }
        });
        this.prizeDatagrid = $(".prizeDetail").datagrid({
            idField: "id",
            selectCell: false,
            uri: "customer/list",
            params: {
                query: JSON.stringify({"custtype": 1})
            },
            pagination: {
                info: "<div style='padding-left: 32px'>当前显示数量 <b style='font-size: 22px'>{end}</b> / 总数 <b style='font-size: 22px'>{total}</b></div>"
            },
            columns: [
                {
                    field: "nickname",
                    caption: "时间",
                    width: 120,
                    sortable: true,
                    sort: "asc"
                },
                {
                    field: "sex",
                    caption: "活动名称",
                    width: 150
                },
                {
                    field: "address",
                    caption: "奖项名称",
                    width: 100
                },
                {
                    field: "phone",
                    caption: "奖品",
                    width: 150
                }
            ]
        });
        // 初始化分组
        var initGroupList = function () {
            var groupSelector = $("#groupSelector");
            groupSelector.action({
                url: "cgroup/list",
                data: {
                    page: 1,
                    size: 20,
                    query: JSON.stringify({"grouptype": 1})
                }
            }, false).then(function (resp) {
                // console.log(resp);
                // $("#groupItems").append("<button value=''>不选择分组</button>");
                $.each(resp.data.data, function (i, v) {
                    $("#groupItems").append("<button value=" + v.groupid + ">" + v.groupname + "</button>");
                    $("button[value=" + v.groupid + "]").data("d", v);
                });
            }, function (error) {
                message.notice(false, error.message);
            });
        };
        initGroupList();
        // 查询
        this.query = function () {
            var res = $(".topTool").serializeForm();
            if (!res.hasError) {
                this.datagrid.datagrid("reload", {
                    query: JSON.stringify({
                        custtype: 1,
                        areacode: res.result.area,
                        nickname: res.result.nickname
                    })
                });
            }
        };
        // 弹出高级查询窗口
        this.openSeniorQueryForm = function () {
            $("#userSelector").maskerLayer("open");
            // 自提供关闭功能
        };
        // 高级查询
        this.seniorQuery = function () {
            var res = $(".queryitem").serializeForm();
            if (!res.hasError) {
                _this.datagrid.datagrid("reload", {
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
            }
        };
        // 展示中奖详细
        this.showPrizeDetail = function () {
            // TODO datagrid加载数据
            $(".mask").css("display", "block");
            $(".prize-detail").css("right", "0");
        };
        this.closePrizeDetail = function () {
            $(".mask").css("display", "none");
            $(".prize-detail").css("right", "-600px");
        };
        // 展示积分详细
        this.showPointDetail = function () {

        };
        this.closePointDetail = function () {

        };
        // 是否可以点击设置分组
        this.changeCustomerCheck = function () {
            var selectedCustomers = _this.datagrid.datagrid("getChecked");
            // this.resetGroupSelector();
            if (selectedCustomers.length > 0) {
                $("#changeGroup").attr("disabled", false);
            }
            else {
                $("#changeGroup").attr("disabled", true);
            }
        };
        // 重置分组选择器
        this.resetGroupSelector = function () {
            $("#changeGroup").text("更改分组");
            $("#groupItems button").removeClass("selected");
        };
        // 设置分组
        this.setGroup = function (event) {
            var data = $(event.currentTarget).data("d");
            var selectedCustomers = _this.datagrid.datagrid("getChecked");
            var customersIds = [];
            $.each(selectedCustomers, function (index, value) {
                customersIds.push(value.custid);
            });
            $(document.body).action({
                url: "customer/group",
                data: {
                    detail: JSON.stringify({
                        idlist: customersIds,
                        groupid: data.groupid,
                        groupname: data.groupname
                    })
                }
            }).then(function () {
                _this.datagrid.datagrid("reload");
                //_this.resetGroupSelector();
                message.notice(true, "修改成功");
            }, function (error) {
                //_this.resetGroupSelector();
                message.notice(false, error.message);
            });
        };
    }
    var customerManagement = new CustomerManagement();
    module.init = function () {
        if (!loaded) {
            $("#query").on("click", function () {
                customerManagement.query();
            });
            $("#seniorquery").on("click", function () {
                customerManagement.openSeniorQueryForm();
            });
            $("#userSelector").maskerLayer("event", {
                submit: customerManagement.seniorQuery
            });
            $("#groupSelector").on("click", "button", "selectedItemChanged", function (event) {
                customerManagement.setGroup(event);
            });
            $(".prize-detail .close").on("click", function () {
                customerManagement.closePrizeDetail();
            });
            loaded = true;
        }
    };
    return module;
});