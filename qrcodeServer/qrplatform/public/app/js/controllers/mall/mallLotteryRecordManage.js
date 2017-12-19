window.APP.controller("mallLotteryRecordManage", [
    "$scope",
    "PaginationService",
    "MessageService",
    "UtilService",
    "MallLotteryRecordService",
    'HostConfig',
    function (
        $scope,
        PaginationService,
        MessageService,
        UtilService,
        MallLotteryRecordService,
        HostConfig) {
    function LotteryRecord () {
        this.items = [];
        this.queryOptions = {
            productor: "",
            point: "",
            page: 1,
            size: 5,
            categoryid: "",
            showpoint: false,
            query: {
                productname: "",
                state: "",
                producttype:['redpacket','product','cinema','phone','net','point']
            }
        };
        // this.pagination = {
        //     page: 1,
        //     size: 5,
        //     total: 0,
        //     pageCount: 0,
        //     scope: $scope
        // };
    }

    LotteryRecord.prototype.query = function (page) {
        var self = this;
        UtilService.startLoading();

        self.queryOptions.page = page || self.queryOptions.page;
        MallLotteryRecordService.query(self.queryOptions).then(function (data) {
            self.items = data.data;
            self.pagination.page = data.page;
            self.pagination.total = data.totalsize;
            self.pagination.pageCount = data.totalpage;
            PaginationService.setContainer("#productTable").render(self.pagination);
        }).catch(function (error) {
            MessageService.error($scope, "数据加载出错！");
        }).finally(function () {
            UtilService.stopLoading();
        });
    };

    LotteryRecord.prototype.resetQuery = function () {
        this.queryOptions.query.productname = "";
        this.queryOptions.query.state = "";
        this.query(1);
    };
    $scope.LotteryRecord = new LotteryRecord();
    $scope.LotteryRecord.query();

    $scope.$on("goPage", function (event, page) {
        $scope.LotteryRecord.query(page);
    });
}]);