/**
 * Created by xdf on 2017/4/10
 */
window.APP.controller("commondityAdCtrl", [
    '$scope',
    'PaginationService',
    'HostConfig',
    'MessageService',
    'PostService',
    'UtilService',
    'timSliceFilter',
    function(
        $scope,
        PaginationService,
        HostConfig,
        MessageService,
        PostService,
        utilService,
        timSliceFilter
    ) {

        //左边栏广告位数据
        var posList = HostConfig.adtype;
        $scope.positionlist = [];
        for (var item in posList) {
            $scope.positionlist.push(posList[item]);
        }
        for (var i = 0; i < $scope.positionlist.length; i++) {
            $scope.positionlist[i] = {
                'title': $scope.positionlist[i].title,
                'adtype': $scope.positionlist[i].key
            };
        }

        //奇牛图片链接处理
        function handleImg(url) {
            return HostConfig.mall.articleimageurl + url + '-' + HostConfig.mall.articleimagesmallstyle;
        }

        //接口地址
        var getAdlistUrl = '/club/getAdList',
            addAdItemUrl = '/club/addAdItem',
            delAdItemUrl = '/club/delAdItem',
            getArticleUrl = '/club/getarticlebyentid',
            getArtDetailUrl = '/club/getarticlebyid';

        /**
         * advertiseList Constructor
         */
        function AdvertiseList() {
            this.queryOptions = {
                adtype: ''
            };
            this.items = [];
            this.selectedItems = [];
            this.selectedOne = 'focus';
            // this.selectedArt = '';
            this.articleList = [];
            this.active = '';
            this.previewOn = true;
            this.preData = {
                title: '文章预览标题',
                summary: '文章预览概括',
                author: '作者',
                content: '文章预览内容'
            };
        }

        /**
         * query方法
         * @param url    //接口地址
         * @param option //post请求配置
         */
        AdvertiseList.prototype.query = function(url, option) {
            var self = this;
            utilService.startLoading();
            PostService.request(url, $.param(option)).then(function(data) {
                //data为通过接口返回的数据
                self.articleList = data;
                self.items = data;
            }).catch(function(error) {
                MessageService.error($scope, "数据操作失败，请稍后尝试！");
            }).finally(function() {
                //utilService
                utilService.stopLoading();
            });
        };

        AdvertiseList.prototype.init = function() {
            var self = this;
            self.query(getAdlistUrl, { adtype: 'focus' });
        }

        /**
         * delArticle   //删除当前广告位文章
         * @param adid
         */
        AdvertiseList.prototype.delArticle = function($event, adid) {
            $event.stopPropagation();
            var self = this;
            var option = {
                adid: adid,
            };
            var option1 = {
                adtype: self.selectedOne,
            };
            MessageService.confirm({
                title: "删除操作提醒",
                content: "确定删除该文章吗？",
                icon: "fa fa-warning",
                confirm: function() {
                    utilService.startLoading();
                    PostService.request(delAdItemUrl, $.param(option)).then(function(data) {
                        self.query(getAdlistUrl, option1);
                    }).catch(function(error) {
                        MessageService.error($scope, "删除操作失败");
                    }).finally(function() {
                        utilService.stopLoading();
                    });
                }
            })
        };

        /**
         * selectPos    //加载选择的广告位文章
         * @param item (object)
         */
        AdvertiseList.prototype.selectPos = function(item) {
            //item是有title和adtype属性的对象
            var self = this;
            // self.previewOn = false;
            self.preData = {
                title: '预览标题',
                summary: '预览概括',
                author: '作者',
                content: '预览内容',
                titleimageurl: '',
            };
            self.active = '';
            self.selectedOne = item.adtype;
            self.articleList = [];
            var option = {
                adtype: item.adtype
                // state: 1
            };
            self.query(getAdlistUrl, option);
        };

        //选中的文章预览
        AdvertiseList.prototype.preview = function(artid) {
            var self = this;
            self.previewOn = true;
            self.active = artid;
            PostService.request(getArtDetailUrl, $.param({
                artid: artid
            })).then(function(data) {
                // console.log(data);
                self.preData = data;
                self.preData.titleimageurl = handleImg(data.titleimageurl);
            }).catch(function(error) {
                MessageService.error($scope, "预览失败");
            }).finally(function() {
                // utilService.stopLoading();
            });
        };


        //单选框方法
        AdvertiseList.prototype.isCheckedAll = function() {
            return (this.selectedItems.length == this.items.length && this.selectedItems.length != 0);
        };

        AdvertiseList.prototype.isChecked = function(item) {
            return this.selectedItems.indexOf(item) != -1;
        };

        AdvertiseList.prototype.toggleCheckedAll = function() {
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

        AdvertiseList.prototype.toggleChecked = function($event, item) {
            $event.stopPropagation();
            var index = this.selectedItems.indexOf(item);
            if (index == -1) {
                this.selectedItems.push(item);
            } else {
                this.selectedItems.splice(index, 1);
            }
        };

        /**
         * SetArticleAdid constructor
         * @param advertiseList //依赖AdvertiseList
         */
        function SetArticleAdid(advertiseList) {
            //article参数初始配置
            this.queryOptions = {
                pagenumber: 1,
                pagerows: 5,
                key: '',
                entid: window.localStorage.getItem("entid"),
                // begtime: '',
                // endtime: '',
                state: 1
            };
            //add的参数初始配置
            this.adverOptions = {
                begtime: new Date(),
                endtime: new Date(),
                artid: '',
                adtype: '',
            };
            this.showAdd = false;
            this.showEdit = false;
            this.articleslist = [];
            this.error = {};
            this.items = [];
            this.selectedItems = [];
        }

        //打开add页面
        SetArticleAdid.prototype.showAddForm = function() {
            this.getArticlesList();
            this.showAdd = true;
        };

        //关闭add页面
        SetArticleAdid.prototype.closeForm = function() {
            this.articleslist = [];
            this.adverOptions = {
                begtime: new Date(),
                endtime: new Date(),
                artid: '',
                adtype: '',
            };
            this.queryOptions.key = "";
            $scope.advertiseList.init();
            this.showAdd = false;
        };

        //获取文章数据并分页
        SetArticleAdid.prototype.getArticlesList = function(page) {
            // utilService.startLoading();
            var self = this;
            self.articleslist = [];
            self.queryOptions.pagenumber = page || 1;
            utilService.startLoading();
            PostService.request(getArticleUrl, $.param(self.queryOptions)).then(function(data) {
                self.articleslist = data.rows;
                self.items = data.rows;
                PaginationService.setContainer("#viewTable").render({
                    //分页设置
                    page: page || self.queryOptions.pagenumber,
                    size: self.queryOptions.pagerows,
                    total: parseInt(data.count),
                    pageCount: Math.ceil(parseInt(data.count) / self.queryOptions.pagerows),
                    scope: $scope
                });
            }).catch(function(error) {
                MessageService.error($scope, "数据获取失败，请稍后尝试！");
            }).finally(function() {
                // utilService.stopLoading();
                utilService.stopLoading();
            });

        };
        //添加文章至指定广告位
        SetArticleAdid.prototype.add = function(event, artid) {
            var self = this;
            var nowtime = new Date(timSliceFilter(new Date())).getTime() - 8*60*60*1000;
            var option = {
                artid: artid,
                adtype: self.adverOptions.adtype,
                begtime: new Date(timSliceFilter(self.adverOptions.begtime)).getTime() - 8*60*60*1000,
                endtime: new Date(timSliceFilter(self.adverOptions.endtime)).getTime() + 16*60*60*1000 - 1,
            };

            if (!option.adtype) {
                return MessageService.error($scope, "请选择广告位");
            } else if (!option.endtime || !option.begtime) {
                return MessageService.error($scope, "请设置开始时间和结束时间");
            } else if (option.endtime < option.begtime) {
                return MessageService.error($scope, "结束时间必须等于或晚于开始时间");
            } else if (option.begtime < nowtime) {
                return MessageService.error($scope, "开始时间必须大于或等于当前时间");
            }
            //utileService start
            PostService.request(addAdItemUrl, $.param(option)).then(function(data) {
                //data为通过接口返回的数据
                self.res = data;
                if (self.res) {
                    MessageService.success($scope, "添加成功！");
                }
            }).catch(function(error) {
                MessageService.error($scope, "数据操作失败，请稍后尝试！");
            }).finally(function() {
                //utilService
            });
        };

        SetArticleAdid.prototype.preview = function(artid) {
            console.log(artid);
        };


        //初始化
        $scope.advertiseList = new AdvertiseList();
        $scope.setarticleAdid = new SetArticleAdid($scope.advertiseList);
        
        $scope.advertiseList.init();

        //监听分页
        $scope.$on("goPage", function(event, page) {
            $scope.setarticleAdid.queryOptions.key = '';
            $scope.setarticleAdid.getArticlesList(page);
        });
    }
]);