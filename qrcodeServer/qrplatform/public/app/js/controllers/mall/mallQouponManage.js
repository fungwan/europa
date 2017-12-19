/** 
 * created by xdf on 2017/5/10
 */
window.APP.controller("mallQouponManage", [
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
    "timToHMSFilter",
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
        timSliceFilter,
        timToHMSFilter
        ) {

        //QouponList constructor
        function QouponList() {
            this.tabItems = [{
                    title: '礼券商品设置',
                    src: 'views/templates/mall/mall.manage.qoupon.set.html',
                    name: '未使用礼券',
                    url: '/mall/pdtlist'
                },
                {
                    title: '礼券使用记录',
                    src: 'views/templates/mall/mall.manage.qoupon.use.html',
                    name: '已使用礼券',
                    url: '/mall/getqouponrecord'
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
            this.selectedTapItem = this.tabItems[0];
            this.thumbList = [];
            this.showAdd = false;
            this.showRecordDetail = false;
            this.showProductDetail = false;
        }

        //tap切换
        QouponList.prototype.selectTap = function(item) {
            var self = this;
            self.selectedTapItem = item;
            self.init();
        }

        //获取礼券列表
        QouponList.prototype.getQouponList = function(page) {
            var self = this;
            UtilService.startLoading();
            //礼券设置页列表获取
            if (self.selectedTapItem.title == '礼券商品设置') {
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
            }else if (self.selectedTapItem.title == '礼券使用记录') {
            //礼券使用记录页列表获取
                // console.log(self.selectedTapItem.title);
                var _endtime = new Date(self.defaultRecord.endtime).getTime() + 24*60*60*1000 - 1;
                var option = {
                    page    : page || self.defaultRecord.page,
                    size    : self.defaultRecord.size,
                    usetype : self.defaultRecord.usetype,
                    begtime : self.defaultRecord.begtime,
                    endtime : self.defaultRecord.endtime ? new Date(_endtime) : ''
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

        //初始化
        QouponList.prototype.init = function() {
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
            self.getQouponList(1);
        }

        //上下架
        QouponList.prototype.shelve = function (item) {
            UtilService.startLoading();
            MallProductService.qouponshelve(item.productid, 'sell').then(function (data) {
                item.state = "sell";
                MessageService.success($scope, "礼券上架成功！");
            }).catch(function (error) {
                MessageService.error($scope, "礼券上架失败，请稍后尝试！");
            }).finally(function () {
                UtilService.stopLoading();
            });
        } 
        QouponList.prototype.offShelve = function (item) {
            MessageService.confirm({
                title: "确定下架？",
                content: "确定下架礼券吗？",
                confirm: function () {
                    UtilService.startLoading();
                    MallProductService.qouponshelve(item.productid, "offshelf").then(function (data) {
                        item.state = "offshelf";
                        MessageService.success($scope, "礼券下架成功！");
                    }).catch(function (error) {
                        item.state = "offshelf";
                        MessageService.error($scope, "礼券下架失败，请稍后尝试！");
                    }).finally(function () {
                        UtilService.stopLoading();
                    });
                }
            });
        }

        //获取礼券详情
        QouponList.prototype.getQouponDetail = function (item) {
            var self = this;

            UtilService.startLoading();
            $q.all([
                MallProductService.getProductInfo(item.productid),
                MallProductService.getQouponDetail(item.productid)
            ]).then(function (res) {
                // 商品详情数据处理
                var data = res[0];
                self.selectedProduct.productInfo = {
                    productid    : data.baseinfo.productid,
                    productname  : data.baseinfo.productname,
                    cost         : data.baseinfo.cost,
                    price        : data.baseinfo.price,
                    amount       : data.baseinfo.amount,
                    productdate  : data.baseinfo.productdate,
                    validity_beg : timSliceFilter(data.baseinfo.validity_beg),
                    validity_end : timSliceFilter(data.baseinfo.validity_end),
                    productinfo  : data.baseinfo.productinfo,
                    productimage : data.baseinfo.productimage
                };

                // 礼券包含商品列表处理
                self.selectedProduct.content = res[1];
                
                self.showProductDetail = true;
            }).catch(function (error) {
                MessageService.error($scope, "礼券详情获取错误 错误为：" + error.message);
            }).finally(function () {
                UtilService.stopLoading();
            });
        }

        //关闭
        QouponList.prototype.close = function () {
            this.showProductDetail = false;
        }

        //AddQoupon constructor
        function AddQoupon(qouponList) {
            //默认礼券设置
            this.defaultQoupon = {
                productInfo: {
                    productid     : '',
                    productname   : '',
                    cost          : '',
                    price         : '',
                    amount        : '',
                    validity_beg  : '',
                    validity_end  : '',
                    productinfo   : '',
                    productimage  : '',
                    productdetail : {
                        htmlinfo : '',
                        images   : '' 
                    }
                },
                content: []
            };

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
            this.mallProductionName = '';
            this.selectedMallProductList = [];
            this.selectedMallProductListId = [];

            this.error = {};
            
            this.showAddForm  = false;
            this.showEditForm = false;
            this.showProduct  = false;
        }

        //编辑器初始化方法
        AddQoupon.prototype.initEditor = function () {
            var that = this;

            var editor = new wangEditor('detail-edit');
            var unNeededMenus = [
                "insertcode", 
                "fullscreen", 
                "location", 
                "video", 
                "emotion"
            ];
            editor.config.menus = $.map(wangEditor.config.menus, function (item, key) {
                if (unNeededMenus.indexOf(item) !== -1) return null;
                return item;
            });

            editor.config.customUpload = true;
            editor.config.customUploadInit = function () {
                var self = this;
                var btnId = self.customUploadBtnId;

                QiniuUploaderService.initImgUploader({
                    browse_button: btnId,
                    uptoken_url: '/uploader/getarticletoken',
                    domain: HostConfig.mall.articleimageurl,
                    init: {
                        FileUploaded: function (up, file, info) {
                            var res = JSON.parse(info);
                            var sourceLink = 'http://om5zzdb7m.bkt.clouddn.com/'+ res.key;
                            self.command(
                                null, 
                                'insertHtml', 
                                '<img src="' + sourceLink + '" style="max-width:100%;"/>');
                        }
                    }
                });    
            };

            editor.onchange = function () {
                that.editorText = this.$txt.text();
                that.defaultQoupon.productInfo.productdetail.htmlinfo = this.$txt.html();
            };

            editor.create();

            if (that.showEditForm) {
                editor.$txt.html(that.defaultQoupon.productInfo.productdetail.htmlinfo);
                that.editorText = editor.$txt.text();
            }
        }

        //初始化页面
        AddQoupon.prototype.initForm = function (){
            var self = this;
            //初始化奇牛
            QiniuUploaderService.initImgUploader({
                browse_button: "pickfiles",
                uptoken_url: "/uploader/getproducttoken",
                domain: HostConfig.mall.productimageurl,
                init: {
                    FileUploaded: function (up, file, info) {
                        var res = JSON.parse(info);
                        var domain = up.getOption('domain');
                        self.thumbList.push({
                            key: res.key,
                            src: domain + res.key
                        });
                        $scope.$apply();
                    }
                }
            });
            //初始化编辑器
            self.initEditor();
        }

        //移除轮播图
        AddQoupon.prototype.removeImg = function (item) {
            var index = this.thumbList.indexOf(item);
            if (index != -1) this.thumbList.splice(index, 1);
        };

        //打开礼券添加界面
        AddQoupon.prototype.showAdd = function () {
            this.showAddForm = true;
        }

        //关闭礼券编辑界面
        AddQoupon.prototype.closeAdd = function (qouponList) {
            var self = this;
            MessageService.confirm({
                title: "退出编辑提醒",
                content: "退出后已编辑数据将清除，确认退出吗？",
                confirm: function () {
                    $scope.$apply(function () {
                        self.thumbList = [];
                        self.editorText = '';
                        self.mallProductList = [];
                        self.mallProductionName = '';
                        self.selectedMallProductList = [];
                        self.selectedMallProductListId = [];
                        self.error = {};
                        self.defaultQoupon = {
                             productInfo: {
                                productid     : '',
                                productname   : '',
                                cost          : '',
                                price         : '',
                                amount        : '',
                                validity_beg  : '',
                                validity_end  : '',
                                productinfo   : '',
                                productimage  : '',
                                productdetail : {
                                    htmlinfo : '',
                                    images   : '' 
                                }
                            },
                            content: []
                        };

                        self.showAddForm  = false;
                        self.showEditForm = false;
                        qouponList.init();
                    })
                }
            });  
        }

        //打开商品选择界面
        AddQoupon.prototype.showProductionList = function(){
            var self = this;
            self.showProduct = true;
            self.getProductionList(1);
            // self.getProductCategory();
        }

        //关闭商品选择界面
        AddQoupon.prototype.getBack = function () {
            // this.productList = [];
            this.showProduct = false;
        }

        //获取商品列表(商城内商品)
        AddQoupon.prototype.getProductionList = function (page) {
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
        AddQoupon.prototype.resetProduct = function () {
            this.defaultProductionQuery.query.productname = '';
            this.getProductionList(1);
        }

        //商品添加至礼券关联商品列表
        AddQoupon.prototype.addProduction = function (item) {
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

        //移除关联商品
        AddQoupon.prototype.deleteProduction = function (item) {
            var self = this;
            var index = self.selectedMallProductListId.indexOf(item.productid);
            self.selectedMallProductListId.splice(index, 1);
            self.selectedMallProductList.splice(index, 1);
        }

        //保存礼券
        AddQoupon.prototype.saveQoupon = function (qouponList) {
            var self = this,
                imgList = [],
                qouponOption = {};
            
            for(var i=0;i<self.thumbList.length;i++){
                imgList.push(self.thumbList[i].key);
            }

            qouponOption = {
                productInfo: {
                    productid     : self.defaultQoupon.productInfo.productid || '',
                    productname   : self.defaultQoupon.productInfo.productname,
                    cost          : self.defaultQoupon.productInfo.cost,
                    price         : self.defaultQoupon.productInfo.price,
                    amount        : self.defaultQoupon.productInfo.amount,
                    validity_beg  : timSliceFilter(self.defaultQoupon.productInfo.validity_beg),
                    validity_end  : timSliceFilter(self.defaultQoupon.productInfo.validity_end),
                    productinfo   : self.defaultQoupon.productInfo.productinfo,
                    productimage  : imgList[0] || '',
                    productdetail : {
                        htmlinfo : self.defaultQoupon.productInfo.productdetail.htmlinfo,
                        images   : imgList 
                    },
                    // productdate: timToHMSFilter(new Date()),
                    state: "sell",
                    producttype: "qoupon",
                    privilege: '0',
                    leve: '5',
                    spec: '1',
                    mallcategoryCaid: '006',
                },
                content: self.selectedMallProductList
            };

            //前端表单校验
            self.error = {};
            var res = self.validate(qouponOption);
            if (!res) {
                return MessageService.error($scope, '礼券编辑条目错误，请检查后提交');
            }

            UtilService.startLoading();
            MallProductService
            .save(qouponOption)
            .then(function(data){
                if(!!data){
                    MessageService.success($scope, '礼券保存成功！');
                    self.thumbList = [];
                    self.editorText = '';
                    self.mallProductList = [];
                    self.mallProductionName = '';
                    self.selectedMallProductList = [];
                    self.selectedMallProductListId = [];
                    self.error = {};
                    self.defaultQoupon = {
                            productInfo: {
                            productid     : '',
                            productname   : '',
                            cost          : '',
                            price         : '',
                            amount        : '',
                            validity_beg  : '',
                            validity_end  : '',
                            productinfo   : '',
                            productimage  : '',
                            productdetail : {
                                htmlinfo : '',
                                images   : '' 
                            }
                        },
                        content: []
                    };

                    self.showAddForm  = false;
                    self.showEditForm = false;
                    qouponList.init();
                    UtilService.stopLoading();
                }
            }).catch(function(error){
                MessageService.error($scope, '保存失败，错误：' + error.message);
            });
        }

        //礼券编辑前端格式处理和校验
        AddQoupon.prototype.validate = function (option) {
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
            } else if (qoupon.validity_end < now) {
                self.error.validity_beg = '失效时间不能早于当前时间';
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

        //提交保存
        AddQoupon.prototype.confirmAdd = function (qouponList) {
            var self = this;
            MessageService.confirm({
                title: "礼券保存提醒",
                content: "保存后礼券将上架，确定保存吗？",
                confirm: function () {
                    $scope.$apply(function () {
                        self.saveQoupon(qouponList);
                    })
                }
            });  
        }

        //编辑礼券
        AddQoupon.prototype.showEdit = function (item) {
            var self = this;

            UtilService.startLoading();
            //$q.all同时异步访问接口
            $q.all([
                MallProductService.getProductInfo(item.productid),
                MallProductService.getQouponDetail(item.productid)
            ]).then(function (res) {
                // 商品详情数据处理
                var data = res[0];
                self.defaultQoupon.productInfo = {
                    productid     : data.baseinfo.productid,
                    productname   : data.baseinfo.productname,
                    cost          : data.baseinfo.cost,
                    price         : data.baseinfo.price,
                    amount        : data.baseinfo.amount,
                    validity_beg  : new Date(data.baseinfo.validity_beg),
                    validity_end  : new Date(data.baseinfo.validity_end),
                    productinfo   : data.baseinfo.productinfo,
                    productimage  : data.baseinfo.productimage,
                    productdetail : {
                        htmlinfo : data.info ? data.info.htmlinfo : '',
                        images   : data.info ? data.info.images   : ''
                    }
                };
                if (data.info) {
                    var images = data.info.images;
                    var domain = HostConfig.mall.productimageurl;
                    for (var i = 0; i < images.length; i++) {
                        self.thumbList.push({
                            key: images[i],
                            src: domain + images[i]
                        });
                    }
                }

                // 礼券包含商品列表处理
                self.defaultQoupon.content = res[1];
                for(var i=0;i<res[1].length;i++){
                    self.selectedMallProductListId.push(res[1][i].productid);
                    self.selectedMallProductList.push(res[1][i]);
                }
                
                self.showEditForm = true;
            }).catch(function (error) {
                MessageService.error($scope, "礼券详情获取错误 错误为：" + error.message);
            }).finally(function () {
                UtilService.stopLoading();
            });
        }

        $scope.qouponList = new QouponList();
        $scope.addQoupon  = new AddQoupon($scope.quponList);

        //翻页监听
        $scope.$on("goQouponPage", function(event, page) {
            $scope.qouponList.getQouponList(page);
        });
        $scope.$on("goProductPage", function(event, page) {
            $scope.addQoupon.getProductionList(page);
        });
        $scope.$on("goRecordPage", function (event, page) {
            $scope.qouponList.getQouponList(page);
        })
    }
]);