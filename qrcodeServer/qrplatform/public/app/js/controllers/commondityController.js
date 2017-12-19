window.APP.controller('commondityCtrl', [
    '$scope',
    '$timeout',
    '$interval',
    'CommondityService',
    'MessageService',
    'PaginationService',
    'CommondityCategoryService',
    'QrService',
    'UtilService',
    function(
        $scope,
        $timeout,
        $interval,
        CommondityService,
        MessageService,
        PaginationService,
        CommondityCategoryService,
        QrService,
        UtilService) {
        function CommondityList() {
            this.items = [];
            this.selectedItems = [];
            this.defaultQuery = {
                mcdname: "",
                batchcode: "",
                categoryid: ""
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

        CommondityList.prototype.loadDropDownItems = function() {
            var self = this;
            CommondityCategoryService.query({
                size: 10000,
                page: 1,
            }).then(function(data) {
                self.dropDownItems = data.data;
            }).catch(function(error) {
                console.log(error);
            });
        };

        CommondityList.prototype.query = function(page) {
            var self = this;
            UtilService.startLoading();

            self.queryOptions.page = page || self.queryOptions.page;
            CommondityService.query(self.queryOptions).then(function(data) {
                self.items = data.data;
                self.selectedItems = [];
                self.pagination.page = data.page;
                self.pagination.total = data.totalsize;
                self.pagination.pageCount = data.totalpage;
                PaginationService.setContainer("#commondityTable").render(self.pagination);
            }).catch(function(error) {
                MessageService.error($scope, "数据获取失败，请稍后尝试！");
            }).finally(function() {
                UtilService.stopLoading();
            });
        };

        CommondityList.prototype.resetQuery = function() {
            this.queryOptions.query = $.extend({}, this.defaultQuery);
            this.query(1);
        };

        CommondityList.prototype.isCheckedAll = function() {
            return (this.selectedItems.length == this.items.length && this.selectedItems.length != 0);
        };
        CommondityList.prototype.isChecked = function(item) {
            return this.selectedItems.indexOf(item) != -1;
        };
        CommondityList.prototype.toggleCheckedAll = function() {
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
        CommondityList.prototype.toggleChecked = function(item) {
            var index = this.selectedItems.indexOf(item);
            if (index == -1) {
                this.selectedItems.push(item);
            } else {
                this.selectedItems.splice(index, 1);
            }
        };

        CommondityList.prototype.offShelve = function(commondity) {
            var self = this;

            MessageService.confirm({
                title: "确定下架？",
                content: "确定下架商品？商品所属分类如果有关联活动将会导致下架失败！",
                confirm: function() {
                    UtilService.startLoading();
                    var ids = [commondity.mcdid];
                    CommondityService.offShelve(ids).then(function(data) {
                        MessageService.success($scope, "商品下架成功！");
                        self.query();
                    }).catch(function(error) {
                        var msg = "商品下架失败！";
                        if (error.code == "projectoccupied") {
                            msg = "商品下架失败，商品所属分类已有关联活动！";
                        }
                        MessageService.error($scope, msg);
                    }).finally(function() {
                        UtilService.stopLoading();
                    });
                }
            });
        };


        function CommondityForm(commondityList) {
            this.commondityList = commondityList;
            this.defaultCommondity = {
                mcdid: "",
                mcdname: "",
                mcddesc: "",
                categoryid: "",
                point: 1
            };
            this.commondity = $.extend({}, this.defaultCommondity);

            this.showAdd = this.showEdit = false;
            this.erros = {};
        }

        CommondityForm.prototype.showAddForm = function() {
            this.showAdd = true;
        };

        CommondityForm.prototype.showEditForm = function(commondity) {
            this.commondity = $.extend({}, commondity);
            this.showEdit = true;
        };

        CommondityForm.prototype.closeForm = function() {
            this.commondity = $.extend({}, this.defaultCommondity);
            this.errors = {};
            this.showAdd = this.showEdit = false;
        };

        CommondityForm.prototype.validate = function() {
            this.errors = {};
            if (this.commondity.mcdname.trim() == "") {
                this.errors.mcdname = "商品名称为必填项";
            } else if (this.commondity.mcdname.length > 20) {
                this.errors.mcdname = "商品名称的最大长度为20";
            }
            if (this.commondity.mcddesc && this.commondity.mcddesc.length > 50) {
                this.errors.mcddesc = "商品描述的最大长度为50";
            }
            if (this.commondity.categoryid == "") {
                this.errors.categoryid = "请选择商品分类";
            }
            var point = this.commondity.point;
            if (point === "") {
                this.errors.point = "预设积分为必填项";
            } else if (isNaN(point) || !(0 < point && point < 10000) || !(point % 1 == 0)) {
                this.errors.point = "请输入大于0小于10000的整数";
            }
            return angular.equals(this.errors, {});
        };

        CommondityForm.prototype.saveCommondity = function() {
            var self = this;
            if (!self.validate()) return;
            UtilService.startLoading();

            CommondityService.save(self.commondity).then(function(data) {
                self.commondityList.query();
                self.closeForm();
                MessageService.success($scope, "商品保存成功！");
            }).catch(function(error) {
                var msg = "商品保存失败，请稍后尝试！";
                if (error.code == "exists") {
                    self.errors.mcdname = "商品名称已被占用！";
                };
                MessageService.error($scope, msg);
            }).finally(function() {
                UtilService.stopLoading();
            });
        };

        function QrList() {
            this.commondity = null;
            this.items = [];

            this.show = false;
            this.showForm = false;

            // 发送邮件倒计时
            this.countDown = 0;
            this.emailBtnText = "发送邮件";
        }

        QrList.prototype.loadList = function() {
            var self = this;
            UtilService.startLoading();

            QrService.query({
                mcdId: self.commondity.mcdid,
                page: 1,
                size: 10
            }).then(function(data) {
                self.items = data.data;
                for (var i = 0; i < self.items.length; i++) {
                    self.items[i].countDown = 0;
                    self.items[i].emailBtnText = "发送邮件";
                }
                self.show = true;
            }).catch(function(error) {
                MessageService.error($scope, "二维码列表获取失败！");
            }).finally(function() {
                UtilService.stopLoading();
            });
        };

        QrList.prototype.showList = function(commondity) {
            this.commondity = commondity;
            this.loadList();
        };

        QrList.prototype.sendEmail = function(qrInfo) {
            var self = this;

            UtilService.startLoading();
            QrService.sendEmail(qrInfo).then(function(data) {
                MessageService.success($scope, "邮件发送成功，请注意查收！");
            }).catch(function(error) {
                MessageService.error($scope, "邮件发送失败，请稍后重试！");
            }).finally(function() {
                qrInfo.countDown = 60;
                qrInfo.emailBtnText = qrInfo.countDown + "S " + "后重新发送";
                var promise = $interval(function() {
                    if (qrInfo.countDown > 1) {
                        qrInfo.countDown -= 1;
                        qrInfo.emailBtnText = qrInfo.countDown + "S " + "后重新发送";
                    } else {
                        qrInfo.countDown = 0;
                        qrInfo.emailBtnText = "发送邮件";
                        $interval.cancel(promise);
                    }
                }, 1000);

                UtilService.stopLoading();
            });
        };

        QrList.prototype.close = function() {
            this.commondity = null;
            this.show = false;
            this.showForm = false;
            this.items = [];
        };

        function QrForm(qrList, commondityList) {
            this.qrList = qrList;
            this.commondityList = commondityList;

            this.isReady = false;
            this.defaultQr = {
                batchCode: "",
                amount: 1,
                mcdid: ""
            };
            this.qr = $.extend({}, this.defaultQr);
            this.errors = {};

            this.isBusy = false;
            this.progress = 0;
        }

        QrForm.prototype.show = function() {
            var self = this;
            if (self.qrList.items.length >= 10) {
                return MessageService.error($scope, "批次数已达到上限（10个）");
            }
            UtilService.startLoading();

            self.qrList.showForm = true;
            self.isReady = false;
            self.progress = 0;
            this.errors = {};
            self.qr = $.extend({}, self.defaultQr);
            if (self.qrList.commondity) {
                self.qr.mcdid = self.qrList.commondity.mcdid
            }

            QrService.addBatch().then(function(data) {
                self.isReady = true;
                self.qr.batchCode = data;
            }).catch(function(error) {
                MessageService.error($scope, "二维码批次号生成失败，请稍候重试！");
            }).finally(function() {
                UtilService.stopLoading();
            });
        };

        QrForm.prototype.validate = function() {
            this.errors = {};
            var amount = this.qr.amount;
            if (isNaN(amount) || !(0 < amount && amount <= 100000) || !(amount % 1 == 0)) {
                this.errors.amount = "请输入大于0小于等于100000的整数";
            }
            return angular.equals(this.errors, {});
        };

        QrForm.prototype.addQr = function() {
            var self = this;

            if (!self.validate()) return;
            if (!self.isBusy) {
                UtilService.startLoading();
            }

            QrService.addQr(self.qr).then(function(data) {
                self.isBusy = true;
                self.progress = parseInt(parseFloat(data.progress) * 100);
                if (parseFloat(data.progress) == 1) {
                    MessageService.success($scope, "二维码生成成功！");
                    self.close();
                    self.isBusy = false;
                    self.qrList.loadList();
                    self.commondityList.query();
                } else if (parseFloat(data.progress) < 1) {
                    $timeout(function() {
                        self.addQr();
                    }, 1500);
                }
            }).catch(function(error) {
                self.isBusy = false;
                MessageService.error($scope, "二维码生成出错，请稍后重试！");
            }).finally(function() {
                if (!self.isBusy) {
                    UtilService.stopLoading();
                }
            });
        };

        QrForm.prototype.close = function() {
            this.qrList.showForm = false;
        };

        $scope.commondityList = new CommondityList();
        $scope.commondityForm = new CommondityForm($scope.commondityList);
        $scope.qrList = new QrList();
        $scope.qrForm = new QrForm($scope.qrList, $scope.commondityList);

        $scope.$on("goPage", function(event, page) {
            $scope.commondityList.query(page);
        });
        $scope.commondityList.loadDropDownItems();
        $scope.commondityList.query();
    }
]);