window.APP.controller("financeIncomeManageCtrl", [
    "$scope", 
    "PaginationService", 
    "MessageService",
    "UtilService",
    "FinanceIncomeService",
    "DownloadService",
    function (
        $scope,
        PaginationService,
        MessageService,
        UtilService,
        FinanceIncomeService,
        DownloadService) {

    function IncomeList () {
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
    };

    IncomeList.prototype.selectDateType = function (value) {
        this.queryOptions.datetype = value;
    };

    // 验证时间
    function validateTime (queryOptions) {
        console.log(queryOptions);
        var incomeListEndtime = document.getElementById("incomeListEndtime");
        if (incomeListEndtime) {
            incomeListEndtime.setCustomValidity("");
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
                if (incomeListEndtime) {
                    incomeListEndtime.setCustomValidity("结束日期应该大于等于起始日期");
                }
                return false;
            }
        }
        return true;
    }

    IncomeList.prototype.query = function (page) {
        var self = this;
        self.queryOptions.page = page || self.queryOptions.page;
        var queryOptions = $.extend(true, {}, self.queryOptions);
        var begtime = moment(queryOptions.begtime || "");
        var endtime = moment(queryOptions.endtime || "");

        if (!validateTime(queryOptions)) return false;
        queryOptions.begtime = begtime.isValid() ? begtime.format("YYYY-MM-DD") : "";
        queryOptions.endtime = endtime.isValid() ? endtime.format("YYYY-MM-DD") : "";

        UtilService.startLoading();
        FinanceIncomeService.query(queryOptions).then(function (data) {
            self.items = data.data;
            self.pagination.page = data.page;
            self.pagination.total = data.total;
            self.pagination.pageCount = data.totalpage;
            PaginationService.setContainer("#incomeTable").render(self.pagination);
        }).catch(function (error) {
            MessageService.error($scope, "数据加载出错！");
        }).finally(function () {
            UtilService.stopLoading();
        });
    };

     IncomeList.prototype.resetQuery = function () {
        this.queryOptions.datetype = 0;
        this.queryOptions.begtime = "";
        this.queryOptions.endtime = "";
        this.queryOptions.code = "";
        this.query(1);
    };

    IncomeList.prototype.download = function () {
        var downloadOptions = $.extend({}, this.queryOptions);
        delete downloadOptions.page;
        delete downloadOptions.size;

        MessageService.confirm({
            title: "确定导出收支记录？",
            content: "将会为你导出符合条件的收支记录，确定导出吗？",
            confirm: function () {
                DownloadService.download("/finance/income/download", downloadOptions);
            }
        })

    };

    function IncomeForm () {
        this.showForm = false;
        this.income = null;
        this.incomeInfo = null;
    }

    IncomeForm.prototype.show = function (income) {
        var self = this;

        UtilService.startLoading();
        FinanceIncomeService.info(income.out_trade_no).then(function (data) {
            self.showForm = true;
            self.income = income;
            self.incomeInfo = data;
        }).catch(function (error) {
            var message = "账单详情获取失败，请稍后重试！";
            if (error.message == "order not exist") {
                message = "订单不存在！";
            }
            MessageService.error($scope, message);
        }).finally(function () {
            UtilService.stopLoading();
        });
    };

    IncomeForm.prototype.close = function () {
        this.showForm = false;
        this.income = null;
        this.incomeInfo = null;
    };

    $scope.incomeList = new IncomeList();
    $scope.incomeForm = new IncomeForm();

    $scope.incomeList.query();
    $scope.$on("goPage", function (event, page) {
        $scope.incomeList.query(page);
    });
}]);