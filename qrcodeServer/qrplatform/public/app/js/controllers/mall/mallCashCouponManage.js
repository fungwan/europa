window.APP.controller("mallCashCouponManage", [
    "$scope",
    "Upload",
    "PaginationService",
    "MessageService",
    "UtilService",
    "MallCashCouponService",
    'HostConfig',
    'QiniuUploaderService',
    function (
        $scope,
        Upload,
        PaginationService,
        MessageService,
        UtilService,
        MallCashCouponService,
        HostConfig,
        QiniuUploaderService) {
        $scope.file = null;
        $scope.submit = function () {
            console.log($scope.file)

            $scope.upload($scope.file);

        };

        // upload on file select or drop
        $scope.upload = function (file) {
            Upload.upload({
                url: 'upload/url',
                data: { file: file, 'username': $scope.username }
            }).then(function (resp) {
                console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
        };

        function ProductList() {
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
                    producttype: ['cashcoupon']
                }
            };
            this.pagination = {
                page: 1,
                size: 5,
                total: 0,
                pageCount: 0,
                scope: $scope
            };
        }

        ProductList.prototype.query = function (page) {
            var self = this;
            UtilService.startLoading();

            self.queryOptions.page = page || self.queryOptions.page;
            MallCashCouponService.query(self.queryOptions).then(function (data) {
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

        ProductList.prototype.resetQuery = function () {
            this.queryOptions.query.productname = "";
            this.queryOptions.query.state = "";
            this.query(1);
        };

        ProductForm.prototype.shelve = function (product) {
            
            var self = this;
            UtilService.startLoading();
           
            MallCashCouponService.getProductInfo(product.productid).then(function (data) {
                self.product.productid = data.baseinfo.productid;
                self.product.productname = data.baseinfo.productname;
                self.product.cost = data.baseinfo.cost;
                self.product.price = data.baseinfo.price;
                self.product.amount = data.baseinfo.amount;
                self.product.productinfo = data.baseinfo.productinfo;
                self.product.productdetail.htmlinfo = data.info.htmlinfo;
                self.product.productdetail.images = data.info.images;
                self.product.productimage = self.product.productdetail.images[0] || "";

                var images = self.product.productdetail.images;
                var domain = HostConfig.mall.productimageurl;
                for (var i = 0; i < images.length; i++) {
                    self.imgItems.push({
                        key: images[i],
                        src: domain + images[i]
                    });
                }
self.product.state="sell"
                return self.product;
            }).then(function(productOption){
            MessageService.confirm({
                title: "确定上架？",
                content: "确定上架优惠券吗？下架后可以再次进行下架操作！",
                confirm: function () {
                    UtilService.startLoading();
                    var fd = new FormData();
                    MallCashCouponService.shelve(fd, productOption).then(function (data) {
                        MessageService.success($scope, "优惠券上架成功！");
                        self.productList.query();
                    }).catch(function (error) {
                        MessageService.error($scope, "优惠券上架失败，请稍后尝试！");
                    }).finally(function () {
                        UtilService.stopLoading();
                    });
                }
            });
            }).catch(function (error) {
                MessageService.error($scope, "优惠券详情获取失败，请稍后尝试！");
            }).finally(function () {
                UtilService.stopLoading();
            });

        };

        ProductForm.prototype.offShelve = function (product) {
            var self = this;
            UtilService.startLoading();
           
            MallCashCouponService.getProductInfo(product.productid).then(function (data) {
                self.product.productid = data.baseinfo.productid;
                self.product.productname = data.baseinfo.productname;
                self.product.cost = data.baseinfo.cost;
                self.product.price = data.baseinfo.price;
                self.product.amount = data.baseinfo.amount;
                self.product.productinfo = data.baseinfo.productinfo;
                self.product.productdetail.htmlinfo = data.info.htmlinfo;
                self.product.productdetail.images = data.info.images;
                self.product.productimage = self.product.productdetail.images[0] || "";

                var images = self.product.productdetail.images;
                var domain = HostConfig.mall.productimageurl;
                for (var i = 0; i < images.length; i++) {
                    self.imgItems.push({
                        key: images[i],
                        src: domain + images[i]
                    });
                }
                self.product.state="offshelf"
                return self.product;
            }).then(function(productOption){
            MessageService.confirm({
                title: "确定下架？",
                content: "确定下架优惠券吗？下架后可以再次进行上架操作！",
                confirm: function () {
                    UtilService.startLoading();
                    var fd = new FormData();
                    MallCashCouponService.offShelve(fd, productOption).then(function (data) {
                        MessageService.success($scope, "优惠券下架成功！");
                        self.productList.query();
                    }).catch(function (error) {
                        MessageService.error($scope, "优惠券下架失败，请稍后尝试！");
                    }).finally(function () {
                        UtilService.stopLoading();
                    });
                }
            });
            }).catch(function (error) {
                MessageService.error($scope, "优惠券详情获取失败，请稍后尝试！");
            }).finally(function () {
                UtilService.stopLoading();
            });
           

        };

        function ProductForm(productList) {
            this.productList = productList;

            this.showAddForm = false;
            this.showEditForm = false;
            this.showImportForm = false;
            this.imgItems = [];
            this.editorText = "";

            this.defaultProduct = {
                productid: "",
                productname: "",
                cost: "", // 成本
                price: "",//售价
                xls: "",//excel名称
                amount: "", // 礼品总数
                productinfo: "", //礼品描述
                productdetail: {
                    htmlinfo: "", // html代码
                    images: [] // 轮播图 keys 
                }
            };
            this.product = $.extend(true, {}, this.defaultProduct);

            this.errors = {};
        }

        // 初始化编辑器
        ProductForm.prototype.initEditor = function () {
            var that = this;

            var editor = new wangEditor('divedit');
            var unNeededMenus = ["insertcode", "fullscreen", "location", "video", "emotion"];
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
                            var sourceLink = 'http://om5zzdb7m.bkt.clouddn.com/' + res.key;
                            self.command(null, 'insertHtml', '<img src="' + sourceLink + '" style="max-width:100%;"/>');
                        }
                    }
                });
            };

            editor.onchange = function () {
                that.editorText = this.$txt.text();
                console.log(that)
                that.product.productdetail.htmlinfo = this.$txt.html();
            };

            editor.create();

            if (that.showEditForm) {
                editor.$txt.html(that.product.productdetail.htmlinfo);
                that.editorText = editor.$txt.text();
            }
        };

        ProductForm.prototype.initForm = function () {
            var self = this;
            QiniuUploaderService.initImgUploader({
                browse_button: "pickfiles",
                uptoken_url: "/uploader/getproducttoken",
                domain: HostConfig.mall.productimageurl,
                init: {
                    FileUploaded: function (up, file, info) {
                        var res = JSON.parse(info);
                        var domain = up.getOption('domain');
                        self.imgItems.push({
                            key: res.key,
                            src: domain + res.key
                        });
                        $scope.$apply();
                    }
                }
            });
            self.initEditor();
        };

        ProductForm.prototype.showAdd = function () {
            var self=this;
              self.product.productid="";
              self.product.productname="";
              self.product.cost="";
              self.product.price="";
              self.product.xls="";
              self.product.amount="";
              self.product.productinfo="";
              self.product.productdetail.htmlinfo="";
              self.product.productdetail.images=[];
            this.showAddForm = true;
        };
        ProductForm.prototype.showImport = function () {
            this.showImportForm = true;
        };

        ProductForm.prototype.removeImg = function (item) {
            var index = this.imgItems.indexOf(item);
            if (index != -1) this.imgItems.splice(index, 1);
        };

        ProductForm.prototype.showEdit = function (product) {
            var self = this;
            UtilService.startLoading();

            MallCashCouponService.getProductInfo(product.productid).then(function (data) {
                self.product.productid = data.baseinfo.productid;
                self.product.productname = data.baseinfo.productname;
                self.product.cost = data.baseinfo.cost;
                self.product.price = data.baseinfo.price;
                self.product.amount = data.baseinfo.amount;
                self.product.productinfo = data.baseinfo.productinfo;
                self.product.productdetail.htmlinfo = data.info.htmlinfo;
                self.product.productdetail.images = data.info.images;
                self.product.productimage = self.product.productdetail.images[0] || "";

                var images = self.product.productdetail.images;
                var domain = HostConfig.mall.productimageurl;
                self.imgItems=[];
                for (var i = 0; i < images.length; i++) {
                    self.imgItems.push({
                        key: images[i],
                        src: domain + images[i]
                    });
                }

                self.showEditForm = true;
            }).catch(function (error) {
                MessageService.error($scope, "优惠券详情获取失败，请稍后尝试！");
            }).finally(function () {
                UtilService.stopLoading();
            });
        };
        ProductForm.prototype.showImport = function (product) {
            var self = this;
            UtilService.startLoading();

            MallCashCouponService.getProductInfo(product.productid).then(function (data) {
                self.product.productid = data.baseinfo.productid;
                self.product.productname = data.baseinfo.productname;
                self.product.cost = data.baseinfo.cost;
                self.product.price = data.baseinfo.price;
                self.product.amount = data.baseinfo.amount;
                self.product.productinfo = data.baseinfo.productinfo;
                self.product.productdetail.htmlinfo = data.info.htmlinfo;
                self.product.productdetail.images = data.info.images;
                self.product.productimage = self.product.productdetail.images[0] || "";

                var images = self.product.productdetail.images;
                var domain = HostConfig.mall.productimageurl;
                for (var i = 0; i < images.length; i++) {
                    self.imgItems.push({
                        key: images[i],
                        src: domain + images[i]
                    });
                }

                self.showImportForm = true;
            }).catch(function (error) {
                MessageService.error($scope, "优惠券详情获取失败，请稍后尝试！");
            }).finally(function () {
                UtilService.stopLoading();
            });
        };
        ProductForm.prototype.validate = function () {
            this.errors = {};
            var product = this.product;
            if (product.productname.trim() == "") {
                this.errors.productname = "优惠券名称为必填项！";
            } else if (product.productname.length > 100) {
                this.errors.productname = "优惠券名称的最大长度为100！";
            }

            var cost = product.cost;
            var price = product.price;
            if (isNaN(cost) || 0 >= cost) {
                this.errors.cost = "请输入大于0的数值";
            }
            if (isNaN(price) || 0 >= price) {
                this.errors.price = "请输入大于0的数值";
            }

            if (product.productinfo.trim() == "") {
                this.errors.productinfo = "优惠券描述为必填项！";
            } else if (product.productinfo.length > 200) {
                this.errors.productinfo = "优惠券描述的最大长度为200";
            }
            console.log(product)
            if (product.productdetail.images.length == 0) {
                this.errors.images = "请上传优惠券详情轮播图！";
            } else if (product.productdetail.images.length > 10) {
                this.errors.images = "优惠券轮播图不超过10张图！";
            }
            // if (this.editorText.trim() == "") {
            //     this.errors.htmlinfo = "请输入优惠券详情！";
            // }

            return angular.equals({}, this.errors);
        };

        // 新增
        ProductForm.prototype.add = function () {

            var self = this;
            this.product.productdetail.images = [];
            for (var i = 0; i < this.imgItems.length; i++) {
                this.product.productdetail.images.push(this.imgItems[i].key);
            }

            if (!this.validate()) return;
            var fd = new FormData();
            var file = document.querySelector('input[type=file]').files[0];

            fd.append('couponfile', file);

            var productOption = {
                productInfo: {
                    productid: "",
                    productname: this.product.productname,
                    productimage: this.product.productdetail.images[0] || "",
                    cost: this.product.cost.toFixed(2),
                    price: this.product.price.toFixed(2),
                    productinfo: this.product.productinfo,
                    productdetail: this.product.productdetail,
                    state: "sell",
                    producttype: "cashcoupon",
                    privilege: '0',
                    leve: '5',
                    spec: '1',
                    mallcategoryCaid: '006'
                }
            }


            UtilService.startLoading();
            MallCashCouponService.save(fd, productOption).then(function (data) {
                MessageService.success($scope, "新增优惠券成功！");
                self.close();
                self.productList.query();
            }).catch(function (error) {
                MessageService.error($scope, "新增优惠券失败"+error.message+"，请稍后重试！");
            }).finally(function () {
                UtilService.stopLoading();
            });
        };

        ProductForm.prototype.confirmAdd = function () {
            var self = this;
            MessageService.confirm({
                title: "确定保存？",
                content: "确定保存吗？保存之后优惠券立刻上架！",
                confirm: function () {
                    self.add();
                    $scope.$apply();
                }
            });
        }

        // 更新信息
        ProductForm.prototype.update = function () {
            var self = this;
            this.product.productdetail.images = [];
            for (var i = 0; i < this.imgItems.length; i++) {
                this.product.productdetail.images.push(this.imgItems[i].key);
            }
            var fd = new FormData();
            var file = document.querySelector('input[type=file]').files[0];

            fd.append('couponfile', file);
            if (!this.validate()) return;
            var productOption = {
                productInfo: {
                    productid: self.product.productid,
                    productname: self.product.productname,
                    price: self.product.price.toFixed(2),
                    productinfo: self.product.productinfo,
                    productdetail: self.product.productdetail,
                    productimage: self.product.productdetail.images[0] || ""
                }
            };

            UtilService.startLoading();
            MallCashCouponService.save(fd, productOption).then(function (data) {
                MessageService.success($scope, "提交成功！");
                self.close();
                self.productList.query();
            }).catch(function (error) {
                MessageService.error($scope, "提交失败"+error.message+"，请稍后重试！");
            }).finally(function () {
                UtilService.stopLoading();
            });
        };


        ProductForm.prototype.confirmUpdate = function () {
            var self = this;
            MessageService.confirm({
                title: "确定保存？",
                content: "确定保存吗？",
                confirm: function () {
                    self.update();
                    $scope.$apply();
                }
            });
        };

        ProductForm.prototype.uploadExcel = function () {
            var fd = new FormData();
            var file = document.querySelector('input[type=file]').files[0];
            this.product.xls = file.name;
            console.log(this.product.xls);
            $scope.$apply();
        }
        ProductForm.prototype.close = function () {
            this.showAddForm = false;
            this.showEditForm = false;
            this.showImportForm = false;
            this.product = $.extend(true, {}, this.defaultProduct);

            this.imgItems = [];
            this.editorText = "";
            this.errors = {};
        };

        ProductForm.prototype.confirmClose = function () {
            var self = this;
            MessageService.confirm({
                title: "确定取消？",
                content: "确定取消？尚未保存的修改将会丢失！",
                confirm: function () {
                    self.close();
                    $scope.$apply();
                }
            });
        };

        $scope.productList = new ProductList();
        $scope.productForm = new ProductForm($scope.productList);
        $scope.productList.query();

        $scope.$on("goPage", function (event, page) {
            $scope.productList.query(page);
        });
    }]);