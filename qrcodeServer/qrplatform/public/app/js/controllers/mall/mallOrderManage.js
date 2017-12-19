window.APP.controller("mallOrderManage", [
    "$scope", 
    "MallOrderService", 
    "MessageService", 
    "PaginationService", 
    "UtilService", 
    "DownloadService",
    function (
        $scope, 
        MallOrderService, 
        MessageService, 
        PaginationService, 
        UtilService,
        DownloadService) {
    function OrderList () {
        this.items = [];
        this.selectedItems = [];
        this.queryOptions = {
            page: 1,
            size: 5, 
            begtime: "",
            endtime: "",
            orderbm: "",
            state: ""
        };
        this.pagination = {
            page: this.queryOptions.page,
            size: this.queryOptions.size,
            total: 0,
            pageCount: 0,
            scope: $scope
        };
    }

    OrderList.prototype.query = function (page) {
        var self = this;
        UtilService.startLoading();

        self.queryOptions.page = page || self.queryOptions.page;
        var queryOptions = $.extend({}, self.queryOptions);

        var begtime = moment(queryOptions.begtime).format("YYYY-MM-DD"),
            endtime = moment(queryOptions.endtime).format("YYYY-MM-DD");
        queryOptions.begtime = begtime == "Invalid date" ? "" : begtime;
        queryOptions.endtime = endtime == "Invalid date" ? "" : endtime

        MallOrderService.query(queryOptions).then(function (data) {
            self.items = data.data;
            self.pagination.page = data.page;
            self.pagination.total = data.totalsize;
            self.pagination.pageCount = data.totalpage;
            self.selectedItems = [];
            PaginationService.setContainer("#orderTable").render(self.pagination);
        }).catch(function (error) {
            MessageService.error($scope, "数据加载出错！");
        }).finally(function () {
            UtilService.stopLoading();
        });
    };

    OrderList.prototype.resetQuery = function () {
        this.queryOptions.begtime = "";
        this.queryOptions.endtime = "";
        this.queryOptions.orderbm = "";
        this.queryOptions.state = "";
        this.query(1);
    };

    OrderList.prototype.cancelOrder = function (order) {
        var self = this;
        MessageService.confirm({
            title: "确定撤销？",
            content: "确定撤销订单吗，撤销后无法恢复？",
            confirm: function () {
                UtilService.startLoading();
                MallOrderService.cancelOrder(order.orderid).then(function (data) {
                    MessageService.success($scope, "订单撤销成功！");
                    self.query();
                }).catch(function (error) {
                    MessageService.error($scope, "订单撤销失败，请稍后重试！");
                }).finally(function () {
                    UtilService.stopLoading();
                });
            }
        });
    };

    OrderList.prototype.closeOrder = function (order) {
        var self = this;
        MessageService.confirm({
            title: "确定关闭？",
            content: "确定关闭订单吗，关闭后无法恢复？",
            confirm: function () {
                UtilService.startLoading();
                MallOrderService.closeOrder(order.orderid).then(function (data) {
                    MessageService.success($scope, "订单关闭成功！");
                    self.query();
                }).catch(function (error) {
                    MessageService.error($scope, "订单关闭失败，请稍后重试！");
                }).finally(function () {
                    UtilService.stopLoading();
                });
            }
        });
    };

    function optionsIsEmpty (options) {
        if (options.begtime || options.endtime || options.state || options.orderbm) {
            return false;
        }
        return true;
    }

    OrderList.prototype.exports=function(){
        var self=this;

        var exportsOptions = $.extend({}, self.queryOptions);
        delete exportsOptions.size;
        delete exportsOptions.page;

        var message =  "将会为你导出符合条件的订单记录，确定导出吗？";
        if (optionsIsEmpty(exportsOptions)) {
            message = "当前没有任何筛选条件，将会默认为你导出最近3个月的订单记录，确定导出吗？";
            exportsOptions.begtime = moment().subtract(3, "months").format("YYYY-MM-DD");
            exportsOptions.endtime = moment().format("YYYY-MM-DD");
        } else {
            var begtime = moment(exportsOptions.begtime).format("YYYY-MM-DD"),
                endtime = moment(exportsOptions.endtime).format("YYYY-MM-DD");
            exportsOptions.begtime = begtime == "Invalid date" ? "" : begtime;
            exportsOptions.endtime = endtime == "Invalid date" ? "" : endtime
        }

        MessageService.confirm({
            title: "确定导出订单？",
            content: message,
            confirm: function () {
                DownloadService.download("/mall/downloadOrderList", exportsOptions);
            }
        });
    };
    // 禁用发货按钮, 不能发货返回true
    OrderList.prototype.disableSend = function (item) {
        // 状态不为待发货
        if (item.state != 1) return true;
        // 红包
        if (item.producttype == 'redpacket') return true;
        // 优惠劵
        if (item.producttype == 'cashcoupon') return true;
        // 购买的礼劵
        if (item.producttype == 'coupon' && (item.paymoney != 0 || item.tickmoney != 0)) return true;
        // blh商品
        if (item.producttype == 'blh') return true;
        return false;
    };

    // 禁用撤销按钮，不能撤销返回true
    OrderList.prototype.disableCancel = function (item) {
        // 待收货/已完成/已取消
        if (item.state == 2 || item.state == 3 || item.state == 4 || item.state == 100) return true;
        // 红包
        if (item.producttype == 'redpacket') return true;
        // 总金额和实付金额为0
        if (item.paymoney == 0 && item.tickmoney == 0) return true;
        return false;
    };

    function ExpressForm (orderList) {
        this.orderList = orderList;
        this.order = null;
        this.showForm = false;

        this.express = "";
        this.trackingno = "";

        this.errors = {};
    }

    ExpressForm.prototype.show = function (order) {
        this.order = order;
        this.showForm = true;
    };

    ExpressForm.prototype.close = function () {
        this.order = null;
        this.showForm = false;
    };

    ExpressForm.prototype.validate = function () {
        this.errors = {};
        if (this.express == "") {
            this.errors.express = "请选择快递公司！";
        }
        var codeLength = this.trackingno.length;
        if (this.trackingno.trim() == "") {
            this.errors.trackingno = "快递单号是必填项！";
        } else if (codeLength < 10 || codeLength > 20) {
            this.errors.trackingno = "快递单号的长度为10 ~ 20位";
        } else if (!/^[A-Za-z0-9]+$/.test(this.trackingno)) {
            this.errors.trackingno = "请输入正确的快递单号格式！";
        }
        return angular.equals(this.errors, {});
    };

    ExpressForm.prototype.sendGood = function () {
        var self = this;
        if (!self.validate()) return;
        UtilService.startLoading();

        var orderInfo = {
            orderid: self.order.orderid,
            state: 2,
            express: self.express,
            trackingno: self.trackingno
        }

        MallOrderService.sendGood(orderInfo).then(function (data) {
            MessageService.success($scope, "订单发货成功！");
            self.orderList.query();
            self.close();
        }).catch(function (error) {
            MessageService.error($scope, "订单发货失败，请稍后重试！");
        }).finally(function () {
            UtilService.stopLoading();
        });
    };

    function OrderInfo () {
        this.show = false;
        this.item = null;
        this.info = null;
    };

    OrderInfo.prototype.showInfo = function (item) {
        var self = this;
        UtilService.startLoading();

        MallOrderService.info(item.orderid).then(function (data) {
            self.show = true;
            self.info = data;
            self.item = item;
        }).catch(function (error) {
            MessageService.error($scope, "订单详情获取失败，请稍后重试！");
        }).finally(function () {
            UtilService.stopLoading();
        });
    };

    OrderInfo.prototype.close = function () {
        this.show = false;
        this.info = null;
        this.item = null;
        this.expressInfo = {
            show: false
        };
    };

    OrderInfo.prototype.getExpressInfo = function() {
        var self = this;
        console.log('click')
        MallOrderService.getExpressInfo({
            orderid: self.info.orderid,
            orderbm: self.info.orderbm
        }).then(function(res) {
            console.log(res)
            self.expressInfo = {
                show: true,
                state: res.logisticsstatus,
                id: res.logisticsid,
                company: res.logisticscompany,
                detail: res.logisticsjson ? res.logisticsjson : '暂无物流信息'
            }
            console.log(self.expressInfo)
        }).catch(function(err) {
            MessageService.error($scope, "物流信息获取失败，请稍后重试");
        })

    }

    $scope.orderList = new OrderList();
    $scope.expressForm = new ExpressForm($scope.orderList);
    $scope.orderInfo = new OrderInfo();
    $scope.orderList.query();

    $scope.$on("goPage", function (event, page) {
        $scope.orderList.query(page);
    });
}]);