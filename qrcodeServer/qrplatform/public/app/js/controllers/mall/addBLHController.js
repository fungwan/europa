window.APP.controller('addBLHController', [
    "$scope",
    "PaginationService",
    "MessageService",
    "UtilService",
    "PostService",
    function(
        $scope,
        PaginationService,
        MessageService,
        UtilService,
        PostService
    ) {
        function BLHProduction() {
            this.items = [];
            this.queryOptions = {
                page: 1,
                size: 10,
                categoryId: '',
                low: '',
                high: ''
            };
            this.pagination = {
                eventName: 'goBLHPage',
                page: 1,
                size: 10,
                total: 0,
                pageCount: 0,
                scope: $scope
            };
            this.selectedList = [];
            this.selectedIdList = [];
            this.detailToggle= false;
        }

        BLHProduction.prototype.query = function(page) {
            var self = this;
            UtilService.startLoading();

            self.queryOptions.page = page || self.queryOptions.page;

            PostService.request(
                '/mall/getBlhPdtList',
                $.param(self.queryOptions),
                20000
            ).then(function(res) {
                self.items = res.data;
                self.pagination.page = res.page;
                self.pagination.total = res.totalsize;
                self.pagination.pageCount = res.totalpage;
                PaginationService.setContainer("#BLHproductiontable").render(self.pagination);
            }).catch(function(error) {
                MessageService.error($scope, "数据加载出错！");
            }).finally(function() {
                UtilService.stopLoading();
            });
        }

        BLHProduction.prototype.init = function() {
            var self = this;
            //todo 获取百礼汇商品分类
            PostService.request(
                '/mall/getProductTypeList',
                $.param({
                    page: 1,
                    size: 50
                }),
                20000
            ).then(function(res) {
                self.BLHtype = res.data;
            }).catch(function(err) {
                MessageService.error($scope, '百礼汇商品分类信息获取失败，请稍候重试');
            })

            self.query(1);
        }

        BLHProduction.prototype.confirmClose = function() {
            $scope.$emit("closeBLH");
        }

        BLHProduction.prototype.confirmSave = function() {
            var self = this;
            console.log(self.selectedIdList);
            var arr = self.selectedIdList.map(function(currentValue) {
                return currentValue.toString();
            })
            MessageService.confirm({
                title: "添加提醒",
                content: "确定将选取的百礼汇商品加入到货架中？",
                confirm: function() {
                    UtilService.startLoading();
                    PostService.request(
                        '/mall/importBlhPdt',
                        $.param({ list: JSON.stringify(arr) }),
                        20000
                    ).then(function(data) {
                        if(data == true) {
                            MessageService.success($scope, '百礼汇商品添加成功');
                            $scope.$emit("closeBLH");
                        }else {
                            MessageService.error($scope, '百礼汇商品添加失败，请稍后重试');
                        }
                    }).catch(function(err) {
                        if(err.code == 'exists') {
                            MessageService.error($scope, '已添加该商品，不可能重复添加');
                        } else {
                            MessageService.error($scope, '百礼汇商品添加失败，请稍后重试');
                        }
                    }).finally(function() {
                        UtilService.stopLoading();
                    });
                }
            });
        }

        BLHProduction.prototype.addToList = function(item) {
            var self = this;
            self.selectedList.push({
                id: item.itemId,
                name: item.product_name
            })
            self.selectedIdList.push(item.itemId);
        }

        BLHProduction.prototype.deleteItem = function(p) {
            var index = this.selectedList.findIndex(function(item) {
                return item.id == p.id
            })
            this.selectedList.splice(index, 1);
            this.selectedIdList.splice(index, 1);
        }

        BLHProduction.prototype.showDetail = function(item) {
            if (item) {
                this.detailInfo = item.product_infos
            }
            this.detailToggle = this.detailToggle == true ? false : true;
        }

        BLHProduction.prototype.resetQuery = function() {
            this.queryOptions = {
                page: 1,
                size: 10,
                categoryId: '',
                low: '',
                high: ''
            };
            this.query(1);
        }

        $scope.BLHProduction = new BLHProduction();

        //监听分页
        $scope.$on("goBLHPage", function(event, page) {
            $scope.BLHProduction.query(page);
        });
    }
])