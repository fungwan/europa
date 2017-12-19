window.APP.controller("mallevaManage", [
    "$scope",
    "PaginationService",
    "MessageService",
    "UtilService",
    "MallEvalService",
    function (
        $scope,
        PaginationService,
        MessageService,
        UtilService,
        MallEvalService) {
    function EvalList () {
        this.items = [];
        this.queryOptions = {
            page: 1,
            size: 5,
            state: "",
            productname: "",
            key: "",
            sensitiveflag: "",
        };
        this.pagination = {
            page: this.queryOptions.page,
            size: this.queryOptions.size,
            total: 0,
            pageCount: 0,
            scope: $scope
        };
    };

    EvalList.prototype.query = function (page) {
        var self = this;
        UtilService.startLoading();

        self.queryOptions.page = page || self.queryOptions.page;
        MallEvalService.query(self.queryOptions).then(function (data) {
            self.items = data.data;
            self.pagination.page = self.queryOptions.page;
            self.pagination.total = data.totalsize;
            self.pagination.pageCount = data.totalpage;
            PaginationService.setContainer("#evalTable").render(self.pagination);
        }).catch(function (error) {
            MessageService.error($scope, "数据加载出错！");
        }).finally(function () {
            UtilService.stopLoading();
        });
    };

    EvalList.prototype.resetQuery = function () {
        this.queryOptions.state = "";
        this.queryOptions.productname = "";
        this.queryOptions.key = "";
        this.queryOptions.sensitiveflag = "";
        this.query(1);
    };

    function AuditForm (evalList) {
        this.evalList = evalList;
        this.eval = null;
        this.showForm = false;

        this.state = "1",
        this.remark = "";
        this.errors = {};
    }

    AuditForm.prototype.show = function (eval) {
        this.eval = eval;
        this.state = eval.state == "0" ? "1" : eval.state;
        this.showForm = true;
    };

    AuditForm.prototype.close = function () {
        this.eval = null;
        this.state = "1",
        this.remark = "";
        this.showForm = false;
    };

    AuditForm.prototype.validate = function () {
        this.errors = {};
        if (this.remark.length > 50) {
            this.errors.remark = "备注的最大长度为50！";
        }
        return angular.equals(this.errors, {});
    };

    AuditForm.prototype.audit = function () {
        var self = this;
        if (!self.validate()) return;
        UtilService.startLoading();

        var auditInfo = {
            id: self.eval.id,
            state: self.state,
            remark: self.remark
        };

        MallEvalService.audit(auditInfo).then(function (data) {
            MessageService.success($scope, "评价审核成功！");
            self.evalList.query();
            self.close();
        }).catch(function (error) {
            MessageService.error($scope, "评价审核失败，请稍后重试！");
        }).finally(function () {
            UtilService.stopLoading();
        });
    };

    $scope.evalList = new EvalList();
    $scope.auditForm = new AuditForm($scope.evalList);
    $scope.evalList.query();

    $scope.$on("goPage", function (event, page) {
        $scope.evalList.query(page);
    });
}]);