window.APP.controller("financeRedpacketManageCtrl", [
    "$scope",
    "PaginationService",
    "MessageService",
    "UtilService",
    "FinanceRedpacketService",
    "DownloadService",
    function (
        $scope,
        PaginationService,
        MessageService,
        UtilService,
        FinanceRedpacketService,
        DownloadService) {

    function RedpacketList () {
        this.items = [];
        this.queryOptions = {
            page: 1,
            size: 5,
            datetype: 0,
            begtime: "",
            endtime: "",
            code: ""
        };
        this.pagination = {
            page: this.queryOptions.page,
            size: this.queryOptions.size,
            total: 0,
            pageCount: 0,
            scope: $scope
        };
    }

    RedpacketList.prototype.selectDateType = function (value) {
        this.queryOptions.datetype = value;
    };

    // 验证时间
    function validateTime (queryOptions) {
        console.log(queryOptions);
        var redpacketListEndtime = document.getElementById("redpacketListEndtime");
        if (redpacketListEndtime) {
            redpacketListEndtime.setCustomValidity("");
        }
        
        queryOptions = $.extend(true, {}, queryOptions);
        if (queryOptions.datetype != "4") {
            return true;
        }
        if (queryOptions.begtime === undefined || queryOptions.endtime === undefined) {
            return false;
        }
        var begtime = moment(queryOptions.begtime);
        var endtime = moment(queryOptions.endtime);

        if (begtime.isValid() && endtime.isValid()) {
            if (begtime.utc() > endtime.utc()) {
                if (redpacketListEndtime) {
                    redpacketListEndtime.setCustomValidity("结束日期应该大于等于起始日期");
                }
                return false;
            }
        }
        return true;
    }

    RedpacketList.prototype.query = function (page) {
        var self = this;
        self.queryOptions.page = page || self.queryOptions.page;
        var queryOptions = $.extend(true, {}, self.queryOptions);
        var begtime = moment(queryOptions.begtime || "");
        var endtime = moment(queryOptions.endtime || "");

        if (!validateTime(queryOptions)) return false;
        queryOptions.begtime = begtime.isValid() ? begtime.format("YYYY-MM-DD") : "";
        queryOptions.endtime = endtime.isValid() ? endtime.format("YYYY-MM-DD") : "";

        UtilService.startLoading();
        FinanceRedpacketService.query(queryOptions).then(function (data) {
            self.items = data.data;
            self.pagination.page = data.page;
            self.pagination.total = data.total;
            self.pagination.pageCount = data.totalpage;
            PaginationService.setContainer("#redpacketTable").render(self.pagination);
        }).catch(function (error) {
            MessageService.error($scope, "数据加载出错！");
        }).finally(function () {
            UtilService.stopLoading();
        });
    };

    RedpacketList.prototype.resetQuery = function () {
        this.queryOptions.datetype = 0;
        this.queryOptions.begtime = "";
        this.queryOptions.endtime = "";
        this.queryOptions.code = "";
        this.query(1);
    };

    RedpacketList.prototype.download = function () {
        var downloadOptions = $.extend({}, this.queryOptions);
        delete downloadOptions.page;
        delete downloadOptions.size;

        MessageService.confirm({
            title: "确定导出红包记录？",
            content: "将会为你导出符合条件的红包记录，确定导出吗？",
            confirm: function () {
                DownloadService.download("/finance/redpacket/download", downloadOptions);
            }
        })

    };

    function RedpacketForm () {
        this.showForm = false;
        this.redpacket = null;
        this.redpacketInfo = null;
    }

    RedpacketForm.prototype.show = function (redpacket) {
        var self = this;
        
        UtilService.startLoading();
        FinanceRedpacketService.info(redpacket.billno).then(function (data) {
            self.showForm = true;
            self.redpacket = redpacket;
            self.redpacketInfo = data;
        }).catch(function (error) {
            MessageService.error($scope, "红包详情获取失败，请稍后重试！");
        }).finally(function () {
            UtilService.stopLoading();
        });
    };

    RedpacketForm.prototype.close = function () {
        this.showForm = false;
        this.redpacket = null;
        this.redpacketInfo = null;
    };

    $scope.redpacketList = new RedpacketList();
    $scope.redpacketForm = new RedpacketForm();

    $scope.redpacketList.query();
    $scope.$on("goPage", function (event, page) {
        $scope.redpacketList.query(page);
    });
}]);