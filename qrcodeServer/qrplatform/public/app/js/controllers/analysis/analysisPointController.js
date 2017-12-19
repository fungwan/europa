/**
 * Created by xdf on 2017/4/10
 */
window.APP.controller('analysisPointCtrl', [
    '$scope',
    'CommondityService',
    'CommondityCategoryService',
    'PaginationService',
    'MessageService',
    'PostService',
    'UtilService',
    'EchartPieService',
    'BarChartService',
    'timSliceFilter',
    function(
        $scope,
        CommondityService,
        CommondityCategoryService,
        PaginationService,
        MessageService,
        PostService,
        utilService,
        echartPieService,
        barChartService,
        timSliceFilter
    ) {

        //控制器主要构造函数
        function PointList() {
            //默认获得商品分类列表配置
            // this.defaultProductionCategoryQuery = {
            //     page: 1,
            //     size: 100,
            //     query: {
            //         name: ''
            //     }
            // };

            //默认获取商品列表配置
            // this.defaultProductionQuery = {
            //     page: 1,
            //     size: 100,
            //     query: {
            //         mcdname: "",
            //         batchcode: "",
            //         categoryid: ""
            //     }
            // };

            //默认获取会员数配置
            this.defaultQuery = {
                begtime: '',
                endtime: '',
                areacode: ''
            };

            //默认商品
            this.categoryid = '';
            this.mcdid = '';
            this.productionCategoryList = [];
            this.productionList = [];
            //echart默认数据
            this.pieData = [];
            this.lineData = [];
            this.barData = [];
            //默认省市区
            this.provinceList = [];
            this.cityList = [];
            this.defaultProvince = 51;
            this.selectedProvince = '';
            this.selectedCity = '';
        }

        //刷新pie方法
        PointList.prototype.refreshPie = function() {
            var self = this;
            //对传入数据做处理
            PostService.request(
                '/analyze/pointcomponent',
                $.param({
                    begtime: timSliceFilter(self.defaultQuery.begtime),
                    endtime: timSliceFilter(self.defaultQuery.endtime),
                    areacode: self.selectedCity || self.selectedProvince || '',
                })
            ).then(function(data) {
                self.pieData = [
                    { value: Math.abs(data.cost_point), name: '消耗积分' },
                    { value: Math.abs(data.get_point), name: '产生积分' }
                ];

                echartPieService.refresh('pie-chart', '所选时间段积分分布', self.pieData);
            }).catch(function(error) {
                MessageService.error($scope, "选取时间段积分分布图获取数据失败，错误" + error);
            })
        }

        //刷新line方法
        PointList.prototype.refreshLine = function(data) {
            var self = this;
            PostService.request(
                '/analyze/pointgentrade',
                $.param({
                    begtime: timSliceFilter(self.defaultQuery.begtime),
                    endtime: timSliceFilter(self.defaultQuery.endtime),
                    areacode: self.selectedCity || self.selectedProvince || '',
                })
            ).then(function(data) {
                var timeData = [];
                var pointData = [];

                for (var i = 0; i < data.length; i++) {
                    timeData.push(data[i].days);
                    pointData.push(data[i].point);
                }

                barChartService.refreshLine('line-chart', '产生积分走势图', {
                    timeData: timeData,
                    pointData: pointData
                });
            }).catch(function(error) {
                MessageService.error($scope, "产生积分走势图获取数据失败，错误" + error);
            })

        }

        //刷新bar方法
        PointList.prototype.refreshBar = function() {
            var self = this;
            PostService.request(
                '/analyze/pointcomponentoverview',
                $.param(self.defaultQuery)
            ).then(function(data) {
                self.barData = [
                    { name: '当前积分', data: data.total_point },
                    { name: '消耗积分', data: data.cost_point },
                    { name: '产生积分', data: data.get_point },
                ];
                barChartService.refreshBar('bar-chart', '总积分分析图', self.barData);
            }).catch(function(error) {
                MessageService.error($scope, "总积分分析图获取数据失败，错误： " + error);
            })
        }

        //获取积分数据方法
        PointList.prototype.getPointList = function() {
            var self = this;
            if (self.defaultQuery.begtime > self.defaultQuery.endtime) {
                return MessageService.error($scope, "起始时间不能晚于结束时间");
            }else if(self.defaultQuery.begtime > new Date()){
                return MessageService.error($scope, "起始时间不能晚于当前时间");
            }

            utilService.startLoading();
            self.refreshPie();
            self.refreshLine();
            utilService.stopLoading();
        }

        //初始化方法
        PointList.prototype.init = function() {
            var self = this;
            self.memberList = [];

            utilService.startLoading();

            //获取商品分类列表
            // CommondityCategoryService
            //     .query(self.defaultProductionCategoryQuery)
            //     .then(function(data) {
            //         self.productionCategoryList = data.data;
            //     })
            //     .catch(function(error) {
            //         MessageService.error($scope, "商品分类列表获取失败，请稍后重试");
            //     })

            //获取商品列表
            // CommondityService
            //     .query(self.defaultProductionQuery)
            //     .then(function(data) {
            //         self.productionList = data.data;
            //     })
            //     .catch(function(error) {
            //         MessageService.error($scope, "商品列表获取失败，请稍后重试");
            //     });

            //获取地区数据
            PostService.request(
                "/cities/query",
                ''
            ).then(function(data) {
                self.provinceList = data;
            }).catch(function(error) {
                MessageService.error($scope, "省份数据获取失败，请稍后尝试！");
            });

            //加载默认城市列表
            PostService.request(
                "/cities/query",
                $.param({
                    parentCode: self.defaultProvince
                })
            ).then(function(data) {
                self.cityList = data;
            }).catch(function(error) {
                MessageService.error($scope, "城市数据获取失败，请稍后尝试！");
            });

            // 总积分分析图（不可变）
            self.refreshBar();
            // 积分分布分析图
            self.refreshPie();
            // 积分走势图
            self.refreshLine();

            utilService.stopLoading();
        }


        //初始化
        $scope.pointList = new PointList();
        $scope.pointList.init();

        //监听商品选择
        $scope.productionChange = function(id) {
            $scope.pointList.categoryid = id;
        }

        //监听省份选择
        $scope.provinceChange = function(provinceCode) {
            $scope.pointList.selectedProvince = provinceCode;
            $scope.pointList.selectedCity = '';
            var options = {
                parentCode: provinceCode
            };
            if (!provinceCode) options.parentCode = 51;
            PostService.request(
                "/cities/query",
                $.param(options)
            ).then(function(data) {
                $scope.pointList.cityList = data;
            }).catch(function(error) {
                MessageService.error($scope, "城市数据获取失败，请稍后尝试！");
            })
        };
        //监听城市选择
        $scope.cityChange = function(code) {
            $scope.pointList.selectedCity = code;
        }

    }
])