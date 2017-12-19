window.APP.controller('customerCtrl', 
    [
        '$scope', 
        'CustomerService', 
        'PaginationService', 
        'MessageService', 
        'CustomerGroupService',
        'UtilService',
        function (
            $scope, 
            CustomerService, 
            PaginationService, 
            MessageService, 
            CustomerGroupService,
            UtilService) {
    // 消费者列表构造函数
    function CustomerList() {
        this.items = [];
        this.selectedItems = [];
        this.defaultQuery = {
            custtype: 1,
            nickname: "",
            minlotterytime: "",
            maxlotterytime: "",
            minpoint: "",
            maxpoint: ""
        };
        this.queryOptions = {
            page: 1,
            size: 10,
            query: $.extend({}, this.defaultQuery)
        };
        this.pagination = {
            page: this.queryOptions.page,
            size: this.queryOptions.size,
            total: 0,
            pageCount: 0,
            scope: $scope
        };
        this.dropDownItems = [];
    }

    CustomerList.prototype.loadDropDownItems = function() {
        var self = this;
        CustomerGroupService.query({ size: 10000 }).then(function(data) {
            self.dropDownItems = data.data;
        }).catch(function(error) {
            // TODO 添加error提示
        });
    };

    CustomerList.prototype.query = function(page) {
        var self = this;
        UtilService.startLoading();

        self.queryOptions.page = page || self.queryOptions.page;
        CustomerService.query(self.queryOptions).then(function(data) {
            self.items = data.data;
            self.pagination.page = data.page;
            self.pagination.total = data.total;
            self.pagination.pageCount = data.totalpage;
            self.selectedItems = [];
            PaginationService.setContainer(".view-table").render(self.pagination);
        }).catch(function(error) {
            MessageService.error($scope, "数据获取失败, 请稍后尝试！");
        }).finally(function () {
            UtilService.stopLoading();
        });
    };

    CustomerList.prototype.resetQuery = function() {
        this.queryOptions.query = $.extend({}, this.defaultQuery);
        this.query(1);
    };

    CustomerList.prototype.isCheckedAll = function() {
        return (this.selectedItems.length == this.items.length && this.selectedItems.length != 0);
    };

    CustomerList.prototype.isChecked = function(item) {
        return this.selectedItems.indexOf(item) != -1;
    };

    CustomerList.prototype.toggleCheckedAll = function() {
        if (this.isCheckedAll()) {
            this.selectedItems = [];
            return;
        }
        for (var i = 0, len = this.items.length; i < len; i++) {
            var item = this.items[i];
            if (this.selectedItems.indexOf(item) == -1) {
                this.selectedItems.push(item);
            }
        }
    };

    CustomerList.prototype.toggleChecked = function(item) {
        var index = this.selectedItems.indexOf(item);
        if (index == -1) {
            this.selectedItems.push(item);
        } else {
            this.selectedItems.splice(index, 1);
        }
    };

    CustomerList.prototype.setGroup = function(dropDownItem, item) {
        var self = this;
        var idList = [];
        if (!item) {
            $.each(self.selectedItems, function(index, item) {
                idList.push(item.custid);
            });
        } else {
            idList = [item.custid]
        }
        UtilService.startLoading();

        CustomerService.setGroup({
            idlist: idList,
            groupid: dropDownItem.groupid,
            groupname: dropDownItem.groupname
        }).then(function(data) {
            if (!item) {
                self.query();
            } else {
                item.groupname = dropDownItem.groupname;
            }
            MessageService.success($scope, "分组设置成功！");
        }).catch(function(error) {
            MessageService.error($scope, "分组设置失败，请稍后尝试！");
        }).finally(function () {
            UtilService.stopLoading();
        });
    };

    // 积分列表构造函数
    function PointRecordList() {
        this.customer = null;
        this.showList = false;
        this.items = [];
        this.timeType = "0";
    }

    PointRecordList.prototype.loadList = function() {
        var self = this;
        UtilService.startLoading();

        var endtime = moment().format("YYYY-MM-DD");
        var begtime = moment();
        if (self.timeType == "0") {
            begtime = moment().subtract(1, "months");
        } else if (self.timeType == "1") {
            begtime = moment().subtract(3, "months");
        } else if (self.timeType == "2") {
            begtime = moment().subtract(1, "years");
        }
        begtime = begtime.format("YYYY-MM-DD");

        CustomerService.queryPointRecord({
            custid: self.customer.custid,
            begtime: begtime,
            endtime: endtime,
            pagenumber: 1,
            pagerows: 10000
        }).then(function(data) {
            self.items = data.rows;
        }).catch(function(error) {
            MessageService.error($scope, "积分记录加载失败，请稍后重试！");
        }).finally(function () {
            UtilService.stopLoading();
        });
    };

    PointRecordList.prototype.show = function(customer) {
        this.customer = customer;
        this.showList = true;
        this.loadList();
    };

    PointRecordList.prototype.close = function() {
        this.showList = false;
        this.customer = null;
        this.items = [];
        this.timeType = "0";
    };

    PointRecordList.prototype.selectTimeType = function(timeType) {
        this.timeType = timeType;
        this.items = [];
        this.loadList();
    };

    // 中奖记录构造函数, 是否可继承PointRecordList
    function PrizeRecordList() {
        this.customer = null;
        this.showList = false;
        this.items = [];
        this.timeType = "0";
    }


    PrizeRecordList.prototype.loadList = function() {
        var self = this;
        UtilService.startLoading();

        var endtime = moment().format("YYYY-MM-DD");
        var begtime = moment();
        if (self.timeType == "0") {
            begtime = moment().subtract(1, "months");
        } else if (self.timeType == "1") {
            begtime = moment().subtract(3, "months");
        } else if (self.timeType == "2") {
            begtime = moment().subtract(1, "years");
        }
        begtime = begtime.format("YYYY-MM-DD");

        CustomerService.queryPrizeRecord({
            custid: self.customer.custid,
            begtime: begtime,
            endtime: endtime,
            pagenumber: 1,
            pagerows: 10000
        }).then(function(data) {
            self.items = data.rows;
        }).catch(function(error) {
            MessageService.error($scope, "中奖记录加载失败，请稍后重试！");
        }).finally(function () {
            UtilService.stopLoading();
        });
    };

    PrizeRecordList.prototype.show = function(customer) {
        this.customer = customer;
        this.showList = true;
        this.loadList();
    };

    PrizeRecordList.prototype.close = function() {
        this.showList = false;
        this.customer = null;
        this.items = [];
        this.timeType = "0";
    };

    PrizeRecordList.prototype.selectTimeType = function(timeType) {
        this.timeType = timeType;
        this.items = [];
        this.loadList();
    };


    $scope.customerList = new CustomerList();
    $scope.pointRecordList = new PointRecordList();
    $scope.prizeRecordList = new PrizeRecordList();

    $scope.customerList.query();
    $scope.customerList.loadDropDownItems();
    $scope.$on("goPage", function(event, page) {
        $scope.customerList.query(page);
    })
}]);