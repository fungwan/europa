/**
 * Created by xdf on 2017/4/10
 */
window.APP.controller('analysisMemberCtrl', [
    '$scope',
    'CommondityService',
    'CommondityCategoryService',
    'PaginationService',
    'MessageService',
    'PostService',
    'UtilService',
    'EchartPieService',
    'MapChartService',
    function(
        $scope,
        CommondityService,
        CommondityCategoryService,
        PaginationService,
        MessageService,
        PostService,
        utilService,
        echartPieService,
        mapChartService
    ) {

        //接口地址
        var getMemberListUrl = '/custanalysis/customernumbers',
            getCityInfoUrl = '/cities/query';


        function MemberList() {
            //默认获得商品分类列表配置
            this.defaultProductionCategoryQuery = {
                page: 1,
                size: 100,
                query: {
                    name: ''
                }
            };

            //默认获取商品列表配置
            this.defaultProductionQuery = {
                page: 1,
                size: 100,
                query: {
                    mcdname: "",
                    batchcode: "",
                    categoryid: ""
                }
            };

            //默认获取会员数配置
            this.defaultQuery = {
                areacode: '',
                categoryid: '',
                minpoint: '',
                maxpoint: '',
                page: 1,
                size: 5
            };

            //分页配置
            this.pagination = {
                page: 1,
                size: 5,
                total: 0,
                pageCount: 0,
                scope: $scope,
            };

            this.categoryid = '';
            this.mcdid = '';
            this.productionCategoryList = [];
            this.productionList = [];
            this.memberList = [];
            this.memberTotal = 0;
            this.provinceList = [];
            this.cityList = [];
            this.echartData = [];
            this.mapChartData = [];
            this.selectedProvince = '';
            this.selectedCity = '';
        }

        //获取会员人数方法
        MemberList.prototype.getMemberList = function(page) {
            var self = this;

            //前端表单校验
            if (self.minpoint && self.maxpoint) {
                if (!(self.minpoint % 1 == 0) ||
                    !(self.maxpoint % 1 == 0) ||
                    self.minpoint < 0 ||
                    self.maxpoint < 0) {
                    return MessageService.error($scope, "积分输入错误，应为非负整数");
                }
                if (self.minpoint >= self.maxpoint) {
                    return MessageService.error($scope, "积分输入错误，最低积分应小于最高积分");
                }
            }

            var options = {
                areacode: self.selectedCity || self.selectedProvince || self.defaultQuery.provinceCode,
                categoryid: self.categoryid || self.defaultQuery.productionId,
                minpoint: self.minpoint || self.defaultQuery.minpoint,
                maxpoint: self.maxpoint || self.defaultQuery.maxpoint,
                page: page || self.defaultQuery.page,
                size: self.defaultQuery.size
            };

            // self.selectedCity = '';
            // self.categoryid = '';
            self.memberList = [];
            self.memberTotal = 0;
            self.echartData = [];

            utilService.startLoading();
            PostService.request(
                getMemberListUrl, 
                $.param(options)
            ).then(function(res) {
                self.memberList = res.data;
                for (var i = 0; i < self.memberList.length; i++) {
                    if (!self.memberList[i].full) continue;
                    var index = self.memberList[i].full.indexOf('/');
                    if(index < 0) {
                        _name = self.memberList[i].full.slice(0, 2) + '市';
                    } else {
                        _name = self.memberList[i].full.slice(index + 1) == '市辖区' ? 
                                self.memberList[i].full.slice(0, index) : 
                                self.memberList[i].full.slice(index + 1);
                    }

                    self.echartData.push({
                        value: self.memberList[i].s_custid,
                        name: _name
                    });
                }

                self.memberTotal = res.sumcust;

                PaginationService.setContainer('.view-table').render({
                    page: page || self.pagination.page,
                    size: self.pagination.size,
                    total: res.total,
                    pageCount: res.totalpage,
                    scope: $scope
                });

                self.refreshChart(self.echartData);
            }).catch(function(error) {
                MessageService.error($scope, "会员人数信息获取失败，请稍后重试");
            }).finally(function() {
                utilService.stopLoading();
            })

        }

        //刷新echarts方法
        MemberList.prototype.refreshChart = function(data) {
            //对传入数据做处理
            echartPieService.refresh('memberChart', '会员人数', data);
        }

        //加载mapEchart
        MemberList.prototype.refreshMap = function() {
            var self = this;
            PostService.request(
                getMemberListUrl, 
                $.param(self.defaultQuery)
            ).then(function(data) {
                var list = data.data;
                for (var i = 0; i < list.length; i++) {
                    if (!list[i].full) continue;
                    var index = list[i].full.indexOf('/');
                    if(index < 0) {
                        _name = list[i].full.slice(0, 2) + '市';
                    } else {
                        _name = list[i].full.slice(index + 1) == '市辖区' ? 
                                list[i].full.slice(0, index) : 
                                list[i].full.slice(index + 1);
                    }
                            
                    self.mapChartData.push({
                        name: _name,
                        value: list[i].s_custid
                    });
                }
                mapChartService.refresh('mapChart', '各省市会员数', self.mapChartData, '#f7f7f7');
            }).catch(function(error) {
                MessageService.error($scope, "mapchart加载失败，请稍后重试");
            });
        }

        //初始化方法
        MemberList.prototype.init = function() {
            var self = this;
            var options = {
                parentCode: self.selectedProvince
            };
            self.memberList = [];

            //获取商品分类列表
            CommondityCategoryService
            .query(self.defaultProductionCategoryQuery)
            .then(function(data) {
                self.productionCategoryList = data.data;
            }).catch(function(error) {
                MessageService.error($scope, "商品分类列表获取失败，请稍后重试");
            })

            //获取商品列表
            CommondityService
            .query(self.defaultProductionQuery)
            .then(function(data) {
                self.productionList = data.data;
            }).catch(function(error) {
                MessageService.error($scope, "商品列表获取失败，请稍后重试");
            });

            //获取地区数据
            PostService.request(
                "/cities/query", 
                ''
            ).then(function(data) {
                self.provinceList = data;
            }).catch(function(error) {
                MessageService.error($scope, "省份数据获取失败，请稍后尝试！");
            });

            //加载默认设置下的会员人数列表
            self.getMemberList(1);

            //加载地图echart
            self.refreshMap();
        }


        //初始化
        $scope.memberList = new MemberList();
        $scope.memberList.init();

        //监听分页
        $scope.$on("goPage", function(event, page) {
            $scope.memberList.getMemberList(page);
        });
        //监听省份选择
        $scope.provinceChange = function(provinceCode) {
            if (!provinceCode) return;
            var options = {
                parentCode: provinceCode
            };
            $scope.memberList.selectedCity = '';
            PostService.request(
                "/cities/query", 
                $.param(options)
            ).then(function(data) {
                $scope.memberList.cityList = data;
            }).catch(function(error) {
                MessageService.error($scope, "城市数据获取失败，请稍后尝试！");
            })
        };

    }
])