window.APP.controller('commondityCategoryCtrl', [
    '$scope',
    'CommondityCategoryService',
    'PaginationService',
    'MessageService',
    'UtilService',
    function(
        $scope,
        CommondityCategoryService,
        PaginationService,
        MessageService,
        UtilService) {
        function CategroyList() {
            this.items = [];
            this.selectedItems = [];
            this.queryOptions = {
                page: 1,
                size: 10,
                query: { name: "" , state: "1" }
            };
            this.pagination = {
                page: this.queryOptions.page,
                size: this.queryOptions.size,
                total: 0,
                pageCount: 0,
                scope: $scope
            };
        }

        CategroyList.prototype.query = function(page) {
            var self = this;
            UtilService.startLoading();

            self.queryOptions.page = page || self.queryOptions.page;
            CommondityCategoryService.query(self.queryOptions).then(function(data) {
                self.items = data.data;
                self.pagination.page = data.page;
                self.pagination.total = data.totalsize;
                self.pagination.pageCount = data.totalpage;
                self.selectedItems = [];
                PaginationService.setContainer(".view-table").render(self.pagination);
            }).catch(function(error) {
                MessageService.success($scope, "数据获取失败，请稍后尝试！");
            }).finally(function() {
                UtilService.stopLoading();
            });
        };

        CategroyList.prototype.resetQuery = function() {
            this.queryOptions.query.name = "";
            this.query(1);
        };

        CategroyList.prototype.isCheckedAll = function() {
            return (this.selectedItems.length == this.items.length && this.selectedItems.length != 0);
        };
        CategroyList.prototype.isChecked = function(item) {
            return this.selectedItems.indexOf(item) != -1;
        };
        CategroyList.prototype.toggleCheckedAll = function() {
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
        CategroyList.prototype.toggleChecked = function(item) {
            var index = this.selectedItems.indexOf(item);
            if (index == -1) {
                this.selectedItems.push(item);
            } else {
                this.selectedItems.splice(index, 1);
            }
        };

        CategroyList.prototype.deleteSelectedItems = function() {
            var self = this,
                len = self.selectedItems.length,
                ids = [];
        
            for (var i = 0; i < len; i++) {
                ids.push(self.selectedItems[i].categoryid);
            }
            MessageService.confirm({
                title: "确认删除？",
                content: "确认删除商品分类？当选择的分类有关联的商品时，删除将会失败！",
                confirm: function() {
                    UtilService.startLoading();
                    CommondityCategoryService.deleteItems(ids).then(function(data) {
                        self.query();
                        MessageService.success($scope, "商品分类删除成功！");
                    }).catch(function(error) {
                        var msg = "商品分类删除失败，请稍后尝试！";
                        if (error.code == "mcdoccupied") {
                            msg = "商品分类删除失败，该类别有关联的商品！";
                        } else if (error.code == "projectoccupied") {
                            msg = error.message;
                        }
                        MessageService.error($scope, msg);
                    }).finally(function() {
                        UtilService.stopLoading();
                    });
                }
            });
        };

        function CategroyForm(categoryList) {
            this.categoryList = categoryList;

            this.defaultCategory = {
                categoryid: "",
                name: "",
                categorydesc: ""
            };

            this.category = $.extend({}, this.defaultCategory);

            this.showAdd = false;
            this.showEdit = false;
            this.errors = {};
        }

        CategroyForm.prototype.showAddForm = function() {
            this.showAdd = true;
        };

        CategroyForm.prototype.showEditForm = function(category) {
            this.category = $.extend({}, category);
            this.showEdit = true;
        };

        CategroyForm.prototype.closeForm = function() {
            this.category = $.extend({}, this.defaultCategory);
            this.errors = {};
            this.showEdit = false;
            this.showAdd = false;
        };

        CategroyForm.prototype.validate = function() {
            this.errors = {};
            if (this.category.name.trim() == "") {
                this.errors.name = "分类名称为必填项";
            }
            if (this.category.name.length > 20) {
                this.errors.name = "分类名称的最大长度为20";
            }
            if (this.category.categorydesc && this.category.categorydesc.length > 50) {
                this.errors.categorydesc = "分类描述的最大长度为50";
            }
            return angular.equals(this.errors, {});
        };

        CategroyForm.prototype.saveCategory = function() {
            var self = this;
            if (!self.validate()) return;
            UtilService.startLoading();

            CommondityCategoryService.save(self.category).then(function(data) {
                self.categoryList.query();
                self.closeForm();
                MessageService.success($scope, "分类保存成功！");
            }).catch(function(error) {
                var msg = "分类保存失败，请稍后尝试！";
                if (error.code == "exists") {
                    self.errors.name = "商品分类名称已被占用！";
                }
                MessageService.error($scope, msg);
            }).finally(function() {
                UtilService.stopLoading();
            });
        };

        $scope.categoryList = new CategroyList();
        $scope.categoryForm = new CategroyForm($scope.categoryList);
        $scope.$on("goPage", function(event, page) {
            $scope.categoryList.query(page);
        });
        $scope.categoryList.query();
    }
]);