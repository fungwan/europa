window.APP.controller("mallProductManage", [
    "$scope",
    "PaginationService",
    "MessageService",
    "UtilService",
    "MallProductService",
    'HostConfig',
    'QiniuUploaderService',
    function (
        $scope,
        PaginationService,
        MessageService,
        UtilService,
        MallProductService,
        HostConfig,
        QiniuUploaderService) {
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
                    producttype: ['redpacket', 'product', 'cinema', 'phone', 'net', 'point', 'blh']
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

            if (self.kind == 'blh') {
                self.queryOptions.query.producttype = ['blh'];
            } else if(self.kind == 'others') {
                self.queryOptions.query.producttype = ['redpacket', 'product', 'cinema', 'phone', 'net', 'point'];
            }
            
            self.queryOptions.page = page || self.queryOptions.page;
            MallProductService.query(self.queryOptions).then(function (data) {
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
            console.log(product)
            var self = this;
            UtilService.startLoading();

            MallProductService.getProductInfo(product.productid).then(function (data) {
                var product = {
                    productid:data.baseinfo.productid,
                    productname:data.baseinfo.productname,
                    cost:data.baseinfo.cost,
                    price:data.baseinfo.price,
                    amount:data.baseinfo.amount,
                    productinfo:data.baseinfo.productinfo,
                    productdetail:{
                        htmlinfo:data.info.htmlinfo,
                        images: JSON.stringify(data.info.images),
                        productimage: data.baseinfo.productimage
                    },
                    state: 'sell'
                };

                return product;
            }).then(function (productOption) {
                MessageService.confirm({
                    title: "确定上架？",
                    content: "确定上架商品吗？下架后可以再次进行下架操作！",
                    confirm: function () {
                        UtilService.startLoading();
                        MallProductService.shelve(productOption).then(function (data) {
                            MessageService.success($scope, "商品上架成功！");
                            self.productList.query();
                        }).catch(function (error) {
                            MessageService.error($scope, "商品上架失败，请稍后尝试！");
                        }).finally(function () {
                            UtilService.stopLoading();
                        });
                    }
                });
            }).catch(function (error) {
                MessageService.error($scope, "商品详情获取失败，请稍后尝试！");
            }).finally(function () {
                UtilService.stopLoading();
            });

        };

        ProductForm.prototype.offShelve = function (product) {
            
            var self = this;
            UtilService.startLoading();

            MallProductService.getProductInfo(product.productid).then(function (data) {
                 var product = {
                    productid:data.baseinfo.productid,
                    productname:data.baseinfo.productname,
                    cost:data.baseinfo.cost,
                    price:data.baseinfo.price,
                    amount:data.baseinfo.amount,
                    productinfo:data.baseinfo.productinfo,
                    productdetail:{
                        htmlinfo:data.info.htmlinfo,
                        images: JSON.stringify(data.info.images),
                        productimage: data.baseinfo.productimage
                    },
                    state: 'offshelf'
                };

                return product;
            }).then(function (productOption) {
                
                MessageService.confirm({
                    title: "确定下架？",
                    content: "确定下架商品吗？下架后可以再次进行上架操作！",
                    confirm: function () {
                        UtilService.startLoading();
                        MallProductService.offShelve(productOption).then(function (data) {
                            MessageService.success($scope, "商品下架成功！");
                            self.productList.query();
                        }).catch(function (error) {
                            MessageService.error($scope, "商品下架失败，请稍后尝试！");
                        }).finally(function () {
                            UtilService.stopLoading();
                        });
                    }
                });
            }).catch(function (error) {
                MessageService.error($scope, "商品详情获取失败，请稍后尝试！");
            }).finally(function () {
                UtilService.stopLoading();
            });

        };

        ProductForm.prototype.setDiscount = function(item) {
            var self = this;
            var state = item.isDiscount == 0 ? 1 : 0;
            MallProductService.setDiscount([item.productid], state)
            .then(function(res) {
                if(res == true) {
                    self.productList.query();
                }
            }).catch(function(err) {
                console.log('err: ' + err)
                MessageService.error($scope, "商品修改失败，请稍后尝试！");
            })
        }

        function ProductForm(productList) {
            this.productList = productList;

            this.showAddForm = false;
            this.showEditForm = false;
            this.updateBLH = false;

            this.imgItems = [];
            this.editorText = "";

            this.defaultProduct = {
                productid: "",
                productname: "",
                cost: "", // 成本
                price: "",//售价
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
            this.showAddForm = true;
        };

        ProductForm.prototype.removeImg = function (item) {
            var index = this.imgItems.indexOf(item);
            if (index != -1) this.imgItems.splice(index, 1);
        };

        ProductForm.prototype.showEdit = function (product) {
            var self = this;
            UtilService.startLoading();

            MallProductService.getProductInfo(product.productid).then(function (data) {
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

                if(product.producttype == 'blh') {
                    self.updateBLH = true;
                    // self.showEditForm = false;
                    for (var i = 0; i < images.length; i++) {
                    self.imgItems.push({
                        key: images[i],
                        src: images[i]
                    });
                }
                } else {
                    self.showEditForm = true;
                    for (var i = 0; i < images.length; i++) {
                    self.imgItems.push({
                        key: images[i],
                        src: domain + images[i]
                    });
                }
                }

            }).catch(function (error) {
                MessageService.error($scope, "商品详情获取失败，请稍后尝试！");
            }).finally(function () {
                UtilService.stopLoading();
            });
        };

        ProductForm.prototype.initBLH = function() {
            var self = this;
        }

        ProductForm.prototype.validate = function () {
            this.errors = {};
            var product = this.product;
            if (product.productname.trim() == "") {
                this.errors.productname = "商品名称为必填项！";
            } else if (product.productname.length > 100) {
                this.errors.productname = "商品名称的最大长度为100！";
            }

            var cost = product.cost;
            var price = product.price;

            if (isNaN(cost) || 0 >= cost || cost.toString().indexOf('.') < 0 ? false : cost.toString().split(".")[1].length > 2) {
                this.errors.cost = "请输入不超过2位小数的正数";
            }
            if (isNaN(price) || 0 >= price || price.toString().indexOf('.') < 0 ? false : price.toString().split(".")[1].length > 2) {
                this.errors.price = "请输入不超过2位小数的正数";
            }
            var amount = product.amount;
            if (isNaN(amount) || 0 >= amount || !(amount % 1 == 0)) {
                this.errors.amount = "请输入正整数";
            }
            if (product.productinfo.trim() == "") {
                this.errors.productinfo = "商品描述为必填项！";
            } else if (product.productinfo.length > 200) {
                this.errors.productinfo = "商品描述的最大长度为200";
            }
            if (product.productdetail.images.length == 0) {
                this.errors.images = "请上传商品详情轮播图！";
            } else if (product.productdetail.images.length > 10) {
                this.errors.images = "商品轮播图不超过10张图！";
            }
            // if (this.editorText.trim() == "") {
            //     this.errors.htmlinfo = "请输入商品详情！";
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

            var productOption = {
                productInfo: {
                    productid: "",
                    productname: this.product.productname,
                    productimage: this.product.productdetail.images[0] || "",
                    cost: this.product.cost,
                    price: this.product.price,
                    amount: this.product.amount,
                    productinfo: this.product.productinfo,
                    productdetail: this.product.productdetail,

                    state: "sell",
                    producttype: "product",
                    privilege: '0',
                    leve: '5',
                    spec: '1',
                    mallcategoryCaid: '006'
                }
            };

            UtilService.startLoading();
            MallProductService.save(productOption).then(function (data) {
                MessageService.success($scope, "新增商品成功！");
                self.close();
                self.productList.query();
            }).catch(function (error) {
                MessageService.error($scope, "新增商品失败" + error.message + "，请稍后重试！");
            }).finally(function () {
                UtilService.stopLoading();
            });
        };

        ProductForm.prototype.confirmAdd = function () {
            var self = this;
            MessageService.confirm({
                title: "确定保存？",
                content: "确定保存吗？,保存之后商品立刻上架！",
                confirm: function () {
                    self.add();
                    $scope.$apply();
                }
            });
        }

        // 更新
        ProductForm.prototype.update = function () {
            var self = this;
            this.product.productdetail.images = [];
            for (var i = 0; i < this.imgItems.length; i++) {
                this.product.productdetail.images.push(this.imgItems[i].key);
            }

            if (!this.validate()) return;

            var productOption = {
                productInfo: {
                    productid: self.product.productid,
                    productname: self.product.productname,
                    cost: self.product.cost,
                    price: self.product.price,
                    amount: self.product.amount,
                    productinfo: self.product.productinfo,
                    productdetail: self.product.productdetail,
                    productimage: self.product.productdetail.images[0] || ""
                }
            };

            UtilService.startLoading();
            MallProductService.save(productOption).then(function (data) {
                MessageService.success($scope, "修改商品成功！");
                self.close();
                self.productList.query();
            }).catch(function (error) {
                MessageService.error($scope, "修改商品失败" + error.message + "，请稍后重试！");
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

        ProductForm.prototype.close = function () {
            this.showAddForm = false;
            this.showEditForm = false;
            this.updateBLH = false;
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

        ProductForm.prototype.addBLH = function () {
            this.showAddBLH = true;
        }

        ProductForm.prototype.updateBLHPro = function() {
            //todo 更新百礼汇商品
        }

        $scope.productList = new ProductList();
        $scope.productForm = new ProductForm($scope.productList);
        $scope.productList.query();

        $scope.$on("goPage", function (event, page) {
            $scope.productList.query(page);
        });

        //接收关闭BLH页面广播
        $scope.$on("closeBLH", function(e) {
            $scope.productForm.showAddBLH = false
        })
    }]);