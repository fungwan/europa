/**
 * Created by xdf on 2017/4/10
 */
window.APP.controller('analysisOrderCtrl', [
    '$scope',
    'CommondityService',
    'PaginationService',
    'MessageService',
    'PostService',
    'UtilService',
    'EchartPieService',
    'MapChartService',
    function(
        $scope,
        CommondityService,
        PaginationService,
        MessageService,
        PostService,
        utilService,
        echartPieService,
        mapChartService
    ) {

        function OrderList() {
            //默认获取商品列表配置
            this.defaultProductionQuery = {
                productor: '',
                point: '',
                page: 1,
                size: 100,
                categoryid: '',
                showpoint: false,
                query: {
                    productname: "",
                    state: "",
                }
            };
            this.defaultQuery = {
                //默认post配置
                productid: '',
                areacode: '',
                begtime: '',
                endtime: '',
                page: 1,
                size: 5
            };
            this.pagination = {
                //分页配置
                page: 1,
                size: 10,
                total: 0,
                pageCount: 0,
                scope: $scope,
            };
            this.orderList = [];
            this.productionList = [];
            this.provinceList = [];
            this.cityList = [];
            this.selectedProvince = '';
            this.selectedCity = '';
            this.echartData = [];
            this.mapChartData = [];
            this.totalOrder = 0;
            this.totalPoint = 0;
        }

        //获取订单列表
        OrderList.prototype.getOrderList = function(page) {
            var self = this;
            var options = {
                productid: self.productid || self.defaultQuery.productid,
                areacode: self.selectedCity || 
                          self.selectedProvince || 
                          self.defaultQuery.areacode,
                begtime: self.defaultQuery.begtime,
                endtime: self.defaultQuery.endtime
            }

            //前端表单校验
            if (self.defaultQuery.begtime > self.defaultQuery.endtime) {
                return MessageService.error($scope, "时间设置错误，开始时间应早于结束时间");
            }

            self.orderList = [];
            self.totalOrder = 0;
            self.totalPoint = 0;
            self.echartData = [];

            utilService.startLoading();
            PostService.request(
                '/analyze/ordersanalyze', 
                $.param(options)
            ).then(function(res) {
                self.orderList = res.data;

                for (var i = 0; i < self.orderList.length; i++) {
                    // self.totalOrder += self.orderList[i].s_order;
                    // self.totalPoint += self.orderList[i].s_point;
                    // self.totalPoint = new Number(self.totalPoint).toFixed(0);
                    
                    if(!self.orderList[i].full) continue;
                    var index = self.orderList[i].full.indexOf('/');
                    self.echartData.push({
                        value: self.orderList[i].s_order,
                        name: self.orderList[i].full.slice(index+1) == '市辖区' ? 
                              self.orderList[i].full.slice(0, index) : 
                              self.orderList[i].full.slice(index+1),
                    });
                }
                
                // self.totalPoint = self.totalPoint.toFixed(0);
                self.totalPoint = res.sumpoint;
                self.totalOrder = res.sumorder;

                PaginationService.setContainer('.view-table').render({
                    page: page || self.pagination.page,
                    size: self.pagination.size,
                    total: res.total,
                    pageCount: res.totalpage,
                    scope: $scope
                });
                self.refreshChart(self.echartData);

            }).catch(function(error) {
                MessageService.error($scope, "订单数据获取失败，请稍后重试");
            }).finally(function() {
                utilService.stopLoading();
            })
        }

        //刷新echarts方法
        OrderList.prototype.refreshChart = function(data) {
            echartPieService.refresh('orderChart', '地区订单数', data);
        }

        //加载mapEchart方法
        OrderList.prototype.refreshMap = function() {
            var self = this;
            PostService.request(
                '/analyze/ordersanalyze', 
                $.param(self.defaultQuery)
            ).then(function(data) {
                var data = data.data;
                for (var i = 0; i < data.length; i++) {
                    if(!data[i].full) continue;
                    var index = data[i].full.indexOf('/');
                    self.mapChartData.push({
                        name: data[i].full.slice(index + 1) == '市辖区'?
                              data[i].full.slice(0, index):
                              data[i].full.slice(index + 1),
                        value: data[i].s_order
                    });
                }
                mapChartService.refresh('mapChart', '各省市订单数', self.mapChartData, '#f7f7f7');
            }).catch(function(error) {
                MessageService.error($scope, "mapchart加载失败，请稍后重试");
            });
        }


        //初始化方法
        OrderList.prototype.init = function() {
            var self = this;
            self.memberList = [];
            
            //获取商品列表
            PostService.request(
                '/mall/pdtlist', 
                $.param(self.defaultProductionQuery)
            ).then(function(res) {
                var data = res.data
                for (var i=0;i<data.length;i++) {
                    var item = data[i];
                    if (item.producttype != 'cashcoupon' && item.producttype != 'point') {
                        self.productionList.push(item);
                    } else continue;
                }
            }).catch(function(error) {
                MessageService.error($scope, "商品列表数据获取失败，请稍后尝试！");
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

            //加载默认设置下的订单列表
            self.getOrderList(1);

            //加载mapEchart
            self.refreshMap();
        }

        //初始化
        $scope.orderList = new OrderList();
        $scope.orderList.init();

        //监听分页
        $scope.$on("goPage", function(event, page) {
            $scope.orderList.getOrderList(page);
        });
        
        //监听省份选择
        $scope.provinceChange = function(provinceCode) {
            var options = {
                parentCode: provinceCode
            };
            $scope.orderList.selectedCity = '';
            PostService.request(
                "/cities/query", 
                $.param(options)
            ).then(function(data) {
                $scope.orderList.cityList = data;
            }).catch(function(error) {
                MessageService.error($scope, "城市数据获取失败，请稍后尝试！");
            })
        };
    }
])