window.APP.controller("saleArticleCtrl", [
    "$scope",
    "PaginationService",
    "MessageService",
    "UtilService",
    "saleArticleService",
    'HostConfig',
    'QiniuUploaderService',
    'ValiService',
    function (
        $scope,
        PaginationService,
        MessageService,
        UtilService,
        saleArticleService,
        HostConfig,
        QiniuUploaderService,
        vali) {
    function ProductList () {
        this.items = [];
        this.queryOptions = {
            key: "",
            entid: window.localStorage.getItem("entid"),
            pagenumber: 1,
            pagerows: 5,
            state:""
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
        console.log("--");
        var self = this;
        UtilService.startLoading();
        self.queryOptions.pagenumber = page || self.queryOptions.pagenumber;
        saleArticleService.query(self.queryOptions).then(function (data) {
            self.items = data.rows;
            self.pagination.page = self.queryOptions.pagenumber;
            self.pagination.total = parseInt(data.count);
            self.pagination.pageCount = Math.ceil(parseInt(data.count) / 5);
            PaginationService.setContainer("#articleTable").render(self.pagination);
        }).catch(function (error) {
            MessageService.error($scope, "数据加载出错！");
        }).finally(function () {
            UtilService.stopLoading();
        });
    };

    ProductList.prototype.resetQuery = function () {
        this.queryOptions.key = "";
        this.queryOptions.state = "";
        this.query(1);
    };


    ProductList.prototype.offShelve = function (item) {
        var self=this;
        MessageService.confirm({
            title: "提示",
            content: "确定停用吗？",
            confirm: function () {
                UtilService.startLoading();
                saleArticleService.offShelve(item.artid).then(function (data) {
                    MessageService.success($scope, "已停用！");
                    self.query();
                }).catch(function (error) {
                    MessageService.error($scope, "操作失败，请稍后尝试！");
                }).finally(function () {
                    UtilService.stopLoading();
                });
            }
        });
    };

    ProductList.prototype.immediatePublish = function (item) {
        var self = this;
        // 如果已经过期，提示设置的时间错误

        MessageService.confirm({
            title: "提示",
            content: "确定激活吗？",
            confirm: function () {
                UtilService.startLoading();
                saleArticleService.immediatePublish(item.artid).then(function (data) {
                    MessageService.success($scope, "激活成功！");
                    self.query();
                }).catch(function (error) {
                    MessageService.error($scope, "激活失败，请稍后尝试！");
                }).finally(function () {
                    UtilService.stopLoading();
                });
            }
        });
    };

    function ProductForm (productList) {
        this.productList = productList;

        this.showAddForm = false;
        this.showEditForm = false;

        this.imgItems = {};
        this.imgItems.src="img/1.jpg"
        this.editorText = "";

        this.defaultProduct = {
            title: "",
            author: "",
            keyword: "", // 积分
            summary: "", // 市场参考价
            authorurl:"",
            state: "", // 礼品总数
            titleimageurl:"",
            outtime:"",
            arttype:"",
            content:"",
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
                        var sourceLink = HostConfig.mall.articleimageurl+ res.key;
                        self.command(null, 'insertHtml', '<img src="' + sourceLink + '" style="max-width:100%;"/>');
                    }
                }
            });    
        };

        editor.onchange = function () {
            that.editorText = this.$txt.text();
            that.product.content = this.$txt.html();
        };

        editor.create();

        if (that.showEditForm) {
            console.log(that.product.content)
            editor.$txt.html(that.product.content);
            that.editorText = editor.$txt.text();
        }
    };

    ProductForm.prototype.initForm = function () {
        var self = this;
        QiniuUploaderService.initImgUploader({
            browse_button: "pickfiles",
            uptoken_url: "/uploader/getarticletoken",
            domain:  HostConfig.mall.articleimageurl,
            init: {
                FileUploaded: function (up, file, info) {
                    var res = JSON.parse(info);
                    var domain = up.getOption('domain');
                    self.imgItems={
                        key: res.key,
                        src: domain + res.key
                    };
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
        this.imgItems={
            key: "",
            src: "img/1.jpg"
        };
    };

    ProductForm.prototype.showEdit = function (product) {
        var self = this;
        UtilService.startLoading();

        saleArticleService.getProductInfo(product.artid).then(function (data) {
            self.product.artid = data.artid;
            self.product.title = data.title;
            self.product.author = data.author;
            self.product.keyword = data.keyword;
            self.product.authorurl = data.authorurl;
            self.product.arttype = data.arttype;
            self.product.summary = data.summary;
            self.product.content = data.content;
            self.product.titleimageurl=data.titleimageurl;


            var images = self.product.titleimageurl;
            var domain = HostConfig.mall.articleimageurl;

                self.imgItems={
                    key: images,
                    src: domain + images
                };
            self.showEditForm = true;
        }).catch(function (error) {
            MessageService.error($scope, "礼品详情获取失败，请稍后尝试！");
        }).finally(function () {
            UtilService.stopLoading();
        });
    };

    ProductForm.prototype.validate = function () {
        this.errors = {};
        var product = this.product;

        if (product.title.trim() == "") {
            this.errors.title = "文章标题必填项！";
        } else if (product.title.length > 30) {
            this.errors.title = "文章标题的最大长度为30！";
        }
        if (product.author.trim() == "") {
            this.errors.author = "作者必填项！";
        } else if (product.author.length > 10) {
            this.errors.author = "作者的最大长度为10！";
        }
        if(product.authorurl!=""){

            if(!vali.isUrl(product.authorurl)){
                this.errors.authorurl = "原文地址请输入正确的URL！";
            }
        }
        if (product.arttype == "") {
            this.errors.arttype = "类型必填项！";
        }


        if (product.keyword.trim() == "") {
            this.errors.keyword = "关键字必填项！";
        } else if (product.keyword.length > 20) {
            this.errors.keyword = "关键字的最大长度为20！";
        }


        if (product.summary.trim() == "") {
            this.errors.summary = "文章摘要必填项！";
        } else if (product.summary.length > 200) {
            this.errors.summary = "文章摘要的最大长度为200";
        }

        if (!this.imgItems.key) {
            this.errors.images = "请上传文章标题图！";
        }

        return angular.equals({}, this.errors);
    };

    // 新增
    ProductForm.prototype.add = function () {
        var self = this;
        this.product.titleimageurl=this.imgItems.key;

        if (!this.validate()) return;

        var productInfo = {
            title: this.product.title,
            keyword: this.product.keyword,
            summary: this.product.summary,
            author: this.product.author,
            authorurl: this.product.authorurl,
            arttype: this.product.arttype,
            content: this.product.content,
            istop: '0',
            ishot: '0',
            titleimageurl:this.imgItems.key
        };
        UtilService.startLoading();
        saleArticleService.save(productInfo).then(function (data) {
            MessageService.success($scope, "新增文章成功！");
            self.close();
            self.productList.query();
        }).catch(function (error) {
            self.errors.productname = "新增文章失败！";
            MessageService.error($scope, "新增文章失败，请稍后重试！");
        }).finally(function () {
            UtilService.stopLoading();
        });
    };

    ProductForm.prototype.confirmAdd = function () {
        var self = this;
        MessageService.confirm({
            title: "提示",
            content: "确定保存吗？",
            confirm: function () {
                self.add();
                $scope.$apply();
            }
        });
    }

    // 更新
    ProductForm.prototype.update = function () {
        var self = this;
        this.product.titleimageurl=this.imgItems.key;
        if (!this.validate()) return;

        var productInfo = {
            artid:this.product.artid,
            title: this.product.title,
            keyword: this.product.keyword,
            summary: this.product.summary,
            author: this.product.author,
            authorurl: this.product.authorurl,
            arttype: this.product.arttype,
            content: this.product.content,
            istop: '0',
            ishot: '0',
            titleimageurl:this.imgItems.key
        };
        UtilService.startLoading();
        saleArticleService.save(productInfo).then(function (data) {
            MessageService.success($scope, "修改文章成功！");
            self.close();
            self.productList.query();
        }).catch(function (error) {
            self.errors.productname = "修改文章失败！";
            MessageService.error($scope, "修改文章失败，请稍后重试！");
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
        this.product = $.extend(true, {}, this.defaultProduct);

        this.imgItems={
            key: "",
            src: "img/1.jpg"
        };;
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
    //预览
    ProductForm.prototype.scan=function(){
        this.showScan = true;
    };
    //关闭预览
    ProductForm.prototype.closescan=function(){
        this.showScan = false;
    };
    $scope.productList = new ProductList();
    $scope.productForm = new ProductForm($scope.productList);
    $scope.productList.query();
        console.log($scope.productList)
    $scope.$on("goPage", function (event, page) {
        $scope.productList.query(page);
    });
}]);