window.APP.controller("mallLotteryManage", [
    "$scope",
    "PaginationService",
    "MessageService",
    "UtilService",
    "MalllotteryService",
    'MallProductService',
    'HostConfig',
    "timSliceFilter",
    function (
        $scope,
        PaginationService,
        MessageService,
        UtilService,
        MalllotteryService,
        MallProductService,
        HostConfig,
        timSliceFilter) {
        function lotteryList() {
            this.queryOptions = {
                page: 1,
                size: 5,
                query: {
                    productname: '',
                    productdate: '',
                    state: '',
                    producttype: ['qoupon']
                }
            };
            this.items = [];
            this.queryOptions = {
                key: "",
                begdate: "",
                enddate: ""
            };

        }

        lotteryList.prototype.query = function () {
            var self = this;
            UtilService.startLoading();

            MalllotteryService.query(self.queryOptions).then(function (data) {
                self.items = data;
                console.log(self.items)
            }).catch(function (error) {
                MessageService.error($scope, "数据加载出错！");
            }).finally(function () {
                UtilService.stopLoading();
            });
        };

        lotteryList.prototype.resetQuery = function () {
            this.queryOptions.key = "";
            this.queryOptions.begdate = "";
            this.queryOptions.enddate = "";
            this.query();
        };

        function lotteryForm(lotteryList) {
            this.lotteryList = lotteryList;
            this.isdisabled = false;
            this.showAddForm = false;
            this.showAddLotteryForm = false;
            this.showProduct = false;

            //默认商品设置
            this.defaultProductionQuery = {
                page: 1,
                size: 7,
                query: {
                    productname: '',
                    state: 'sell',
                    producttype: ['product', 'cashcoupon', 'redpacket']
                }
            };
            this.defaultlottery = {
                lottoid: "",
                name: "",
                begindate: "", // 成本
                enddate: "",//售价
                info: "", // 礼品总数
                items: [], //礼品描述
                points: []
            };
            this.defaultitems = {
                amount: 0,//库存
                prizename: "",
                productid: "",
                productname: "",
                productnumber: "",//商品数量
                maxnumber: "",//最大中奖数
                ratio: "",//比率
                lottoid: ""//活动id
            }
            this.defaultpoint = {
                point: "",
                ratio: "",//比率
                lottoid: ""//活动id
            }
            this.lottery = $.extend(true, {}, this.defaultlottery);
            this.lotteryitems = $.extend(true, {}, this.defaultitems);
            this.lotterypoint1 = $.extend(true, {}, this.defaultpoint);
            this.lotterypoint2 = $.extend(true, {}, this.defaultpoint);
            this.lotterypoint3 = $.extend(true, {}, this.defaultpoint);
            this.lotteryitemsArray = [];
            this.errors = {};
            this.error = {};
        }
        //输入验证
        lotteryForm.prototype.validate = function () {
            this.errors = {};
            var lottery = this.lottery;
            var now = new Date(timSliceFilter(new Date())).getTime();
            if (lottery.name.trim() == "") {
                this.errors.name = "抽奖活动名称为必填项！";
            } else if (lottery.name.length > 10) {
                this.errors.name = "抽奖活动名称的最大长度为10！";
            }

            if (lottery.lottoid) {
                if (isNaN(lottery.begindate) || isNaN(lottery.enddate)) {
                    this.errors.begindate = '活动开始时间不能为空';
                    this.errors.enddate = '活动结束时间不能为空';
                } else if (lottery.begindate > lottery.enddate) {
                    this.errors.begindate = '活动开始时间不能晚于活动结束时间';
                }
                if (lottery.info.trim() == "") {
                    this.errors.info = "抽奖活动描述为必填项！";
                } else if (lottery.info.length > 260) {
                    this.errors.info = "抽奖活动名称的最大长度为260！";
                }
            } else {

                if (isNaN(lottery.begindate) || isNaN(lottery.enddate)) {
                    this.errors.begindate = '活动开始时间不能为空';
                    this.errors.enddate = '活动结束时间不能为空';
                } else if (lottery.begindate > lottery.enddate) {
                    this.errors.begindate = '活动开始时间不能晚于活动结束时间';
                }
                if (lottery.info.trim() == "") {
                    this.errors.info = "抽奖活动描述为必填项！";
                } else if (lottery.info.length > 260) {
                    this.errors.info = "抽奖活动名称的最大长度为260！";
                }
            }



            console.log(lottery.points[0].point > lottery.points[1].point)
            if (isNaN(lottery.points[0].point) || 0 >= lottery.points[0].point || !(lottery.points[0].point % 1 == 0) || 10000 <= lottery.points[0].point || lottery.points[0].point >= lottery.points[1].point || lottery.points[0].point >= lottery.points[2].point) {
                this.errors.point1 = "小于10000的正整数,积分升序排列";

            }
            if (isNaN(lottery.points[0].ratio) || 0 >= lottery.points[0].ratio || !(lottery.points[0].ratio % 1 == 0)) {
                this.errors.ratio1 = "请输入正整数";
            }

            if (isNaN(lottery.points[1].point) || 0 >= lottery.points[1].point || !(lottery.points[1].point % 1 == 0) || 10000 <= lottery.points[1].point || lottery.points[1].point <= lottery.points[0].point || lottery.points[1].point >= lottery.points[2].point) {
                this.errors.point2 = "小于10000的正整数,积分升序排列";
            }
            if (isNaN(lottery.points[1].ratio) || 0 >= lottery.points[1].ratio || !(lottery.points[1].ratio % 1 == 0)) {
                this.errors.ratio2 = "请输入正整数";
            }

            if (isNaN(lottery.points[2].point) || 0 >= lottery.points[2].point || !(lottery.points[2].point % 1 == 0) || 10000 <= lottery.points[2].point || lottery.points[2].point <= lottery.points[0].point || lottery.points[2].point <= lottery.points[1].point) {
                this.errors.point3 = "小于10000的正整数,积分升序排列";
            }
            if (isNaN(lottery.points[2].ratio) || 0 >= lottery.points[2].ratio || !(lottery.points[2].ratio % 1 == 0)) {
                this.errors.ratio3 = "请输入正整数";
            }


            if (lottery.items.length == 0) {
                this.errors.items = "请添加奖项";
            }

            return angular.equals({}, this.errors);
        };
        lotteryForm.prototype.validateitem = function () {
            this.error = {};
            var item = this.lotteryitems;
            if (item.prizename.trim() == "") {
                this.error.prizename = "奖项名称为必填项！";
            } else if (item.prizename.length > 10) {
                console.log(item.prizename.length)
                this.error.prizename = "奖项名称的最大长度为10！";
            }
            if (item.ratio != 1) {
                if (isNaN(item.maxnumber) || 0 >= item.maxnumber || !(item.maxnumber % 1 == 0)) {
                    this.error.maxnumber = "请输入正整数";
                }
            }


            if (!item.productname) {
                this.error.productname = "请选择商品";
            }
            if (isNaN(item.productnumber) || 0 >= item.productnumber || !(item.productnumber % 1 == 0)) {
                this.error.productnumber = "请输入正整数";

            }
            if (isNaN(item.ratio) || 0 >= item.ratio || 1 < item.ratio) {
                this.error.ratio = "大于0不大于1的小数";
            }

            return angular.equals({}, this.error);
        }
        lotteryForm.prototype.showAdd = function () {

            this.isdisabled = false;
            this.lottery.lottoid = "",
                this.lottery.name = "",
                this.lottery.begindate = ""// 成本
            this.lottery.enddate = ""//售价
            this.lottery.info = "" // 礼品总数
            this.lotteryitemsArray = []
            this.lotterypoint1.point = "";
            this.lotterypoint1.ratio = "";
            this.lotterypoint2.point = "";
            this.lotterypoint2.ratio = "";
            this.lotterypoint3.point = "";
            this.lotterypoint3.ratio = "";
            this.error = {};
            this.errors = {};
            this.showAddForm = true;
        };
        lotteryForm.prototype.showaddlottery = function () {

            this.showAddLotteryForm = true;
            this.lotteryitems.prizename = "";
            this.lotteryitems.maxnumber = "";
            this.lotteryitems.lottoid = "";
            this.lotteryitems.amount = "";
            this.lotteryitems.productid = "";
            this.lotteryitems.productname = "";
            this.lotteryitems.productnumber = "";
            this.lotteryitems.ratio = "";
        };
        lotteryForm.prototype.closeAddlotteryItem = function () {
            this.showAddLotteryForm = false;
        }

        lotteryForm.prototype.showProductionList = function () {
            var self = this;
            self.showProduct = true;
            self.getProductionList(1);
        }
        //重置搜索
        lotteryForm.prototype.resetProduct = function () {

            this.defaultProductionQuery.query.productname = '';
            this.getProductionList(1);
        }
        //获取商品列表(商城内商品)
        lotteryForm.prototype.getProductionList = function (page) {
            var self = this;
            self.defaultProductionQuery.page = page;

            MallProductService
                .query(self.defaultProductionQuery)
                .then(function (data) {
                    self.mallProductList = data.data;
                    PaginationService.setContainer('#mallproductiontable').render({
                        page: page || self.defaultProductionQuery.page,
                        size: self.defaultProductionQuery.size,
                        total: data.totalsize,
                        pageCount: data.totalpage,
                        eventName: 'goProductPage',
                        scope: $scope
                    });
                }).catch(function (error) {
                    MessageService.error($scope, "商品数据获取失败,错误为：" + error.message);
                });

        }

        //点击编辑获取抽奖活动详情
        lotteryForm.prototype.showEdit = function (lottery) {
            var now = new Date(timSliceFilter(new Date())).getTime();
            if (Number(moment(lottery.begindate).format("x")) + 86400000 < moment(now).format("x")) {
                this.isdisabled = true;
            } else {
                this.isdisabled = false;
            }
            this.error = {};
            this.errors = {};
            var self = this;
            this.showAddForm = true;


            UtilService.startLoading();

            MalllotteryService.getlotteryInfo(lottery.lottoid).then(function (data) {

                self.lottery.lottoid = data.lottoid;
                self.lottery.name = data.name;
                self.lottery.begindate = new Date(data.begindate);

                self.lottery.enddate = new Date(data.enddate);

                self.lottery.info = data.info;
                self.lottery.items = data.items;
                self.lotteryitemsArray = data.items;
                self.lottery.points = data.points;
                self.lotterypoint1 = data.points[0];
                self.lotterypoint2 = data.points[1];
                self.lotterypoint3 = data.points[2];
            }).catch(function (error) {
                MessageService.error($scope, "活动详情获取失败，请稍后尝试！");
            }).finally(function () {
                UtilService.stopLoading();
            });
        };


        //选择商品作为奖品
        lotteryForm.prototype.addProduction = function (item) {
            this.lotteryitems.productname = item.productname;
            this.lotteryitems.productid = item.productid;
            this.lotteryitems.amount = item.amount;
            this.showProduct = false;
        }
        //关闭商品作为奖品
        lotteryForm.prototype.getBack = function () {
            this.showProduct = false;
        }
        //添加奖项
        lotteryForm.prototype.addLotteryFormItem = function () {



            this.item = $.extend(true, {}, this.lotteryitems);
            this.item.maxnumber = this.item.maxnumber || 0;
            if (!this.validateitem()) return;
            this.lotteryitemsArray.push(this.item)
            this.showAddLotteryForm = false;
        }
        //关闭添加奖项
        lotteryForm.prototype.closelotteryFormItem = function () {
            this.showAddLotteryForm = false;
        }
        //移除奖项
        lotteryForm.prototype.removeLotteryItem = function (item) {
            var self = this;
            var index = this.lotteryitemsArray.indexOf(item);
            MessageService.confirm({
                title: "确定移除？",
                content: "确定移除吗？,移除之后不保存该项！",
                confirm: function () {
                    if (index != -1) self.lotteryitemsArray.splice(index, 1);
                    $scope.$apply();
                }
            });


        }

        //确定保存活动抽奖
        lotteryForm.prototype.confirmAdd = function () {
            var self = this;
            MessageService.confirm({
                title: "确定保存？",
                content: "确定保存吗？,保存之后可修改！",
                confirm: function () {
                    self.add();
                    $scope.$apply();
                }
            });
        }
        // 新增活动抽奖
        lotteryForm.prototype.add = function () {

            var self = this;


            this.lottery.items = this.lotteryitemsArray;
            this.lottery.points.length = 0;
            this.lottery.points.push(this.lotterypoint1)
            this.lottery.points.push(this.lotterypoint2)
            this.lottery.points.push(this.lotterypoint3)

            if (!this.validate()) return;
            var lotto = $.extend(true, {}, this.lottery);

            UtilService.startLoading();
            MalllotteryService.save(lotto).then(function (data) {
                MessageService.success($scope, "抽奖活动设置成功");
                self.close();
                self.lotteryList.query();
            }).catch(function (error) {
                MessageService.error($scope, "抽奖活动设置失败" + error.message + "，请稍后重试！");
            }).finally(function () {
                UtilService.stopLoading();
            });
        };
        //确定取消保存活动
        lotteryForm.prototype.closeaddlottery = function () {
            var self = this;
            MessageService.confirm({
                title: "确定取消吗？",
                content: "取消将不保存本次活动。",
                confirm: function () {
                    self.showAddForm = false;
                    $scope.$apply();
                }
            });
        }

        lotteryForm.prototype.close = function () {
            this.showAddForm = false;
            this.showEditForm = false;
            this.errors = {};
        };
        //停用活动
        lotteryForm.prototype.offShelve = function (item) {
            var self = this;
            MessageService.confirm({
                title: "提示？",
                content: "确定停用活动吗？",
                confirm: function () {
                    UtilService.startLoading();
                    MalllotteryService.shelve(item.lottoid,0).then(function (data) {
                        MessageService.success($scope, "活动停用成功！");
                        self.lotteryList.query();
                    }).catch(function (error) {
                         console.log(error)
                        MessageService.error($scope, "活动停用失败！，请稍后尝试！");
                    }).finally(function () {
                        UtilService.stopLoading();
                    });
                }
            });
        };
        //启用活动
        lotteryForm.prototype.shelve = function (item) {
            var self = this;
            MessageService.confirm({
                title: "提示？",
                content: "确定启用活动吗？",
                confirm: function () {
                    UtilService.startLoading();
                    MalllotteryService.shelve(item.lottoid,1).then(function (data) {
                        MessageService.success($scope, "活动启用成功！");
                        self.lotteryList.query();
                    }).catch(function (error) {
                        console.log(error)
                        MessageService.error($scope, "活动启用失败！，请稍后尝试！");
                    }).finally(function () {
                        UtilService.stopLoading();
                    });
                }
            });
        };
        $scope.lotteryList = new lotteryList();
        $scope.lotteryForm = new lotteryForm($scope.lotteryList);
        $scope.lotteryList.query();

        $scope.$on("goProductPage", function (event, page) {
            $scope.lotteryForm.getProductionList(page);
        });
    }]);