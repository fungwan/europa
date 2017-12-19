/** 
 * created by xdf on 2017/5/10
 */
window.APP.controller("mallLottery", [
    "$scope",
    "PostService",
    "PaginationService",
    "MessageService",
    "UtilService",
    'HostConfig',
    'QiniuUploaderService',
    'CommondityService',
    'CommondityCategoryService',
    'MallProductService',
    "$q",
    "timFltFilter",
    "timSliceFilter",
    function(
        $scope,
        PostService,
        PaginationService,
        MessageService,
        UtilService,
        HostConfig,
        QiniuUploaderService,
        CommondityService,
        CommondityCategoryService,
        MallProductService,
        $q,
        timFltFilter,
        timSliceFilter
        ) {

        //QouponList constructor
        function lotteryList() {
            this.tabItems = [{
                    title: '积分抽奖设置',
                    src: 'views/templates/mall/mall.manage.lottery.set.html',
                    name: '积分抽奖设置',
                    url: '/mall/pdtlist'
                },
                {
                    title: '积分抽奖记录',
                    src: 'views/templates/mall/mall.manage.lottery.record.html',
                    name: '积分抽奖记录',
                    url: '/club/getlotteryrecord'
                },
            ];
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
            this.defaultRecord = {
                page: 1,
                size: 5,
                usetype: '',
                begtime: '',
                endtime: ''
            };
            this.items = [];
            this.selectedProduct = {
                productInfo: {},
                content: []
            };
            this.thumbList = [];
            this.selectedTapItem = this.tabItems[0];
        }

        lotteryList.prototype.selectTap = function(item) {
            var self = this;
            self.selectedTapItem = item;
            self.init();
        }

        lotteryList.prototype.getlotteryList = function(page) {
            var self = this;
            UtilService.startLoading();
            //礼券设置页列表获取
            if (self.selectedTapItem.title == '积分抽奖设置') {
                var option = {
                    page: page || self.queryOptions.page,
                    size: self.queryOptions.size,
                    query: {
                        productname: self.queryOptions.query.productname || '',
                        productdate: timFltFilter(self.queryOptions.query.productdate) || '',
                        state: self.queryOptions.query.state || '',
                        producttype: ['qoupon']
                    }
                };
                MallProductService
                .query(option)
                .then(function(data) {
                    self.items = data.data;
                    PaginationService.setContainer('#qouponlist').render({
                        page: page || self.queryOptions.page,
                        size: self.queryOptions.size,
                        total: data.totalsize,
                        pageCount: data.totalpage,
                        eventName: 'goQouponPage',
                        scope: $scope
                    })
                }).catch(function(error) {
                    MessageService.error($scope, "礼券详情列表获取失败，错误为： " + error.message);
                }).finally(function(){
                    UtilService.stopLoading();
                })
            }else if (self.selectedTapItem.title == '积分抽奖记录') {
            //礼券使用记录页列表获取
                // console.log(self.selectedTapItem.title);
                var option = {
                    page    : page || self.defaultRecord.page,
                    size    : self.defaultRecord.size,
                    usetype : self.defaultRecord.usetype,
                    begtime : self.defaultRecord.begtime,
                    endtime : self.defaultRecord.endtime
                };
                // option.query = JSON.stringify(option.query);
                PostService.request(
                    self.selectedTapItem.url,
                    $.param(option)
                ).then(function(data) {
                    // console.log(data);
                    self.items = data.items;
                    PaginationService.setContainer('#qouponRecord').render({
                        page: page || option.page,
                        size: option.size,
                        total: data.count,
                        pageCount: Math.ceil(data.count/option.size),
                        eventName: 'goRecordPage',
                        scope: $scope
                    })
                }).catch(function(error) {
                    MessageService.error($scope, "列表获取失败，错误为： " + error.message);
                }).finally(function(){
                    UtilService.stopLoading();
                })
            }
        }

        lotteryList.prototype.init = function() {
            var self = this;
            self.items = [];
            self.queryOptions = {
                page: 1,
                size: 5,
                query: {
                    productname: '',
                    productdate: '',
                    state: '',
                    producttype: ['qoupon']
                }
            };
            self.defaultRecord = {
                page: 1,
                size: 5,
                usetype: '',
                begtime: '',
                endtime: ''
            };
            self.getlotteryList(1);
        }


   


        function addlottery(lotteryList) {
            //默认礼券设置


            //默认商品设置
            this.defaultProductionQuery = {
                page: 1,
                size: 7,
                query: {
                    productname: '',
                    state: 'sell',
                    producttype: ['product']
                }
            };

            this.thumbList = [];

            this.editorText = '';

            this.mallProductList = [];
            this.mallProductListItem={
                lotteryName:"",
                lotteryNum:1,
                lotteryProductName:"",
                lotteryProductId:"",
                lotteryProbability:0,
            }
            this.mallProductionName = '';
            this.selectedMallProductList = [];
            this.selectedMallProductListId = [];

            this.error = {};
            
            this.showAddLotteryForm  = false;
            this.showProduct  = false;
        }
//添加奖项
addlottery.prototype.AddlotteryItem=function(){
    console.log(this.mallProductListItem.lotteryName)
    this.item = $.extend(true, {}, this.mallProductListItem);
    this.mallProductList.push(this.item)
    console.log(this.mallProductList)
    
}
//移除奖项
addlottery.prototype.removeLotteryItem=function(item){
    var index = this.mallProductList.indexOf(item);
            if (index != -1) this.this.mallProductList.splice(index, 1);
}



        //打开添加奖项
        addlottery.prototype.showaddlottery = function(){
            
            this.showAddLotteryForm = true;
        }
//关闭添加奖项
        addlottery.prototype.closeAddlottery = function(){
            this.showAddLotteryForm = false;
        }

        //打开商品选择界面
        addlottery.prototype.showProductionList = function(){
            
            var self = this;
            self.showProduct = true;
            self.getProductionList(1);
            // self.getProductCategory();
        }

        //关闭商品选择界面
        addlottery.prototype.getBack = function () {
            // this.productList = [];
            this.showProduct = false;
        }

        //获取商品列表(商城内商品)
        addlottery.prototype.getProductionList = function (page) {
            var self = this;
            self.defaultProductionQuery.page = page;

            MallProductService
            .query(self.defaultProductionQuery)
            .then(function(data) {
                self.mallProductList = data.data;
                PaginationService.setContainer('#mallproductiontable').render({
                    page: page || self.defaultProductionQuery.page,
                    size: self.defaultProductionQuery.size,
                    total: data.totalsize,
                    pageCount: data.totalpage,
                    eventName: 'goProductPage',
                    scope: $scope
                });
            }).catch(function(error) {
                MessageService.error($scope, "商品数据获取失败,错误为：" + error.message);
            });

        }

        //重置搜索
        addlottery.prototype.resetProduct = function () {
            this.defaultProductionQuery.query.productname = '';
            this.getProductionList(1);
        }
        

        //商品添加至礼券关联商品列表
        addlottery.prototype.addProduction = function (item) {
            var self = this;
            if(self.selectedMallProductListId.indexOf(item.productid) === -1){
                self.selectedMallProductListId.push(item.productid);
                self.selectedMallProductList.push({
                    itemid:'',
                    productid: item.productid,
                    price: item.price,
                    productname: item.productname,
                    number: 1
                });
                MessageService.success($scope, '商品添加成功！');
            } else return;
        }





        //礼券编辑前端格式处理和校验
        addlottery.prototype.validate = function (option) {
            var self = this,
                now = new Date(timSliceFilter(new Date())).getTime(),
                // now = new Date().getTime(),
                qoupon = option.productInfo,
                content = option.content;

            qoupon.productname = qoupon.productname.trim();
            if (qoupon.productname == ""){
                self.error.productname = '礼券名称为必填项';
            } else if (qoupon.productname.length > 50) {
                self.error.productname = '礼券名称不能超过50字';
            }

            if (isNaN(qoupon.cost) || qoupon.cost <= 0) {
                self.error.cost = '请输入大于0的数值作为礼券成本';
            }
            if (isNaN(qoupon.price) || qoupon.price <= 0 ) {
                self.error.price = '请输入大于0的数值作为礼券售价';
            }
            if (isNaN(qoupon.amount) || qoupon.amount <= 0 || !(qoupon.amount%1 == 0)) {
                self.error.amount = '请输入大于0的整数作为礼券总数';
            }

            qoupon.validity_beg = new Date(qoupon.validity_beg).getTime();
            qoupon.validity_end = new Date(qoupon.validity_end).getTime();
            if (isNaN(qoupon.validity_beg) || isNaN(qoupon.validity_end)){
                self.error.validity_beg = '生效和失效时间不能为空';
                self.error.validity_end = '生效和失效时间不能为空';
            } else if (qoupon.validity_beg > qoupon.validity_end) {
                self.error.validity_beg = '生效时间不能晚于失效时间';
            } else if (qoupon.validity_beg < now) {
                self.error.validity_beg = '生效时间不能早于当前时间';
            }

            qoupon.productinfo = qoupon.productinfo.trim();
            if (qoupon.productinfo == ""){
                self.error.productinfo = '礼券描述为必填项';
            } else if (qoupon.productinfo.length > 200) {
                self.error.productinfo = '礼券描述不能超过200字';
            }
            
            if (content.length == 0) {
                self.error.productList = '礼券关联商品为必选项'
            }else if (content.length > 10) {
                self.error.productList = '礼券关联商品最多为10项';
            }
            for(var i=0;i<content.length;i++){
                if(content[i].number <= 0 || 
                   isNaN(content[i].number) || 
                   !(content[i].number%1 == 0)){
                    self.error.productList = '关联商品数量应为正整数';
                    break;
                }
            }

            if (qoupon.productdetail.images.length == 0) {
                self.error.thumb = '礼券轮播图为必选项'
            }else if (qoupon.productdetail.images.length > 10) {
                self.error.thumb = '礼券轮播图最多为10张';
            }

            return angular.equals({}, self.error);
        }





        $scope.lotteryList = new lotteryList();
        $scope.addlottery  = new addlottery($scope.lotteryList);
    //    $scope.qouponList.init();

        //翻页监听
        $scope.$on("goQouponPage", function(event, page) {
            $scope.lotteryList.getlotteryList(page);
        });
        $scope.$on("goProductPage", function(event, page) {
            $scope.addlottery.getProductionList(page);
        });
        $scope.$on("goRecordPage", function (event, page) {
            $scope.lotteryList.getlotteryList(page);
        })
    }
]);