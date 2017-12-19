window.APP.controller('customerGroupCtrl', [
    '$scope',
    'CustomerGroupService',
    'PaginationService',
    'MessageService',
    'UtilService',
    function(
        $scope,
        CustomerGroupService,
        PaginationService,
        MessageService,
        UtilService) {
        function GroupList() {
            this.defaultQuery = { grouptype: 1, groupname: "" };
            this.items = [];
            this.selectedItems = [];
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
        }

        GroupList.prototype.query = function(page) {
            var self = this;
            UtilService.startLoading();

            self.queryOptions.page = page || self.queryOptions.page;
            // 对%进行转义
            var queryOptions = $.extend(true, {}, self.queryOptions);
            queryOptions.query.groupname = likeQueryEscape(queryOptions.query.groupname);

            CustomerGroupService.query(queryOptions).then(function(data) {
                self.items = data.data;
                self.pagination.page = data.page;
                self.pagination.total = data.total;
                self.pagination.pageCount = data.totalpage;
                self.selectedItems = [];
                PaginationService.setContainer(".view-table").render(self.pagination);
            }).catch(function(error) {
                MessageService.error($scope, "数据获取失败，请稍后尝试！");
            }).finally(function() {
                UtilService.stopLoading();
            });
        };

        GroupList.prototype.resetQuery = function() {
            this.queryOptions.query = $.extend({}, this.defaultQuery);
            this.query(1);
        };

        GroupList.prototype.isCheckedAll = function() {
            return (this.selectedItems.length == this.items.length && this.selectedItems.length != 0);
        };

        GroupList.prototype.isChecked = function(item) {
            return this.selectedItems.indexOf(item) != -1;
        };

        GroupList.prototype.toggleCheckedAll = function() {
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

        GroupList.prototype.toggleChecked = function(item) {
            var index = this.selectedItems.indexOf(item);
            if (index == -1) {
                this.selectedItems.push(item);
            } else {
                this.selectedItems.splice(index, 1);
            }
        };

        GroupList.prototype.deleteSelectedItems = function() {
            var self = this,
                len = self.selectedItems.length,
                ids = [];
            for (var i = 0; i < len; i++) {
                ids.push(self.selectedItems[i].groupid);
            }
            MessageService.confirm({
                title: "确认删除？",
                content: "确定删除用户分组吗，删除后无法恢复？",
                confirm: function () {
                    UtilService.startLoading();
                    CustomerGroupService.deleteItems(ids).then(function(data) {
                        self.query();
                        MessageService.success($scope, "分组删除成功！");
                    }).catch(function(error) {
                        var msg = "分组删除失败，请稍后尝试！";
                        MessageService.error($scope, msg);
                    }).finally(function() {
                        UtilService.stopLoading();
                    });
                }
            });  
        };

        function GroupForm(groupList) {
            this.groupList = groupList;
            this.defaultGroup = {
                groupid: "",
                grouptype: 1,
                groupname: "",
                groupdesc: ""
            };
            this.group = $.extend(true, {}, this.defaultGroup);

            this.showAdd = false;
            this.showEdit = false;
            this.errors = {};
        }

        GroupForm.prototype.setGroup = function(group) {
            this.group = $.extend(true, {}, this.defaultGroup, group);
        };

        GroupForm.prototype.validate = function() {
            this.errors = {};
            if (this.group.groupname.trim() == "") {
                this.errors.groupname = "分组名称为必填项";
            }
            if (this.group.groupname.length > 20) {
                this.errors.groupname = "分组名称的最大长度为20";
            }
            if (this.group.groupdesc && this.group.groupdesc.length > 50) {
                this.errors.groupdesc = "分组描述的最大长度为50";
            }
            return angular.equals(this.errors, {});
        };

        GroupForm.prototype.saveGroup = function() {
            var self = this;
            if (!self.validate()) return;

            UtilService.startLoading();
            CustomerGroupService.save(self.group).then(function(data) {
                self.groupList.query();
                self.closeForm();
                MessageService.success($scope, "分组保存成功！");
            }).catch(function(error) {
                var msg = "分组保存失败，请稍候尝试！";
                if (error.code == "exists") {
                    self.errors.groupname = "分组名称已被占用！";
                }
                MessageService.error($scope, msg);
            }).finally(function() {
                UtilService.stopLoading();
            });
        };

        GroupForm.prototype.showAddForm = function() {
            this.showAdd = true;
        };

        GroupForm.prototype.showEditForm = function(group) {
            this.setGroup(group);
            this.showEdit = true;
        };

        GroupForm.prototype.closeForm = function() {
            this.group = $.extend(true, {}, this.defaultGroup);
            this.errors = {};
            this.showAdd = false;
            this.showEdit = false;
        };

        $scope.groupList = new GroupList();

        // 负责分组的新增/编辑, 依赖groupList
        $scope.groupForm = new GroupForm($scope.groupList);

        $scope.groupList.query();

        $scope.$on("goPage", function(event, num) {
            $scope.groupList.query(num);
        });
    }
]);