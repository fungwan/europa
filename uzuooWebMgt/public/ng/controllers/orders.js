'use strict';

angular.module('myApp').controller('OrdersCtrl', ['$scope', '$location', '$rootScope', 'ApiService','fileReader', '$upload',
    function ($scope, $location, $rootScope, ApiService, fileReader, $upload) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel: 'ordersAdmin',
            secondSel: 'orders'
        };

        $scope.moreLinkStr = '更多搜索条件';
        $scope.moreLink = true;
        $scope.preImgSrc = "http://7xq9al.com2.z0.glb.qiniucdn.com/342ffee5-1b4e-48e5-8ed4-871da976b7e6";
        var filters = ["all"];

        $scope.statusArrary = [
            { name: "所有交易状态", value: '' },
            { name: "待付定金", value: 0 },
            { name: "待签约", value: 1 },
            { name: "待付款", value: 2 },
            { name: "施工中", value: 3 },
            { name: "待评价", value: 4 },
            { name: "待施工", value: 5 },
            { name: "已完工", value: 6 },
            { name: "失效订单", value: 100 }
        ];

        $scope.contractItemStatusArrary = ["待托管尾款", "待施工", "施工中", "待验收", "已验收", "已完工"];

        $scope.searchFilter = {
            orderId: '',
            startDate: '',
            endDate: '',
            workerName: '',
            stutus: $scope.statusArrary[0]
        }

        $scope.previewImg = function (imgSrc) {
            $scope.preImgSrc = imgSrc;
        }

        $scope.onClickMore = function () {
            $scope.moreLink = !$scope.moreLink;
            if ($scope.moreLink) {
                $scope.moreLinkStr = '更多搜索条件';
            } else {
                $scope.moreLinkStr = '精简筛选条件';
            }
        }

        $scope.onSearch = function () {
            filters = [];
            if ($scope.moreLink) {

            }
            if ($scope.searchFilter.stutus.value !== '') {
                var item = 'status::' + $scope.searchFilter.stutus.value;
                filters.push(item);
            }
            if ($scope.searchFilter.orderId !== '') {
                var item = 'id::' + $scope.searchFilter.orderId;
                filters.push(item);
            };
            if ($scope.searchFilter.startDate !== '') {
                var ts = new Date($scope.searchFilter.startDate).getTime();
                var item = 'start_time::' + ts;
                filters.push(item);
            }
            if ($scope.searchFilter.endDate != '') {
                var ts = new Date($scope.searchFilter.endDate).getTime();
                var item = 'end_time::' + ts;
                filters.push(item);
            }

            if (filters.length == 0)
                filters = ['all'];
            getOrdersBypage(1);
        }


        $scope.curOrdersPage = 1;

        $scope.getRegionStr = function (region_id) {
            return $scope.regionsArray[1][region_id].name;
        }

        $scope.getOrderId = function (order) {
            var orderDetailHref = order.order_href;
            var pos = orderDetailHref.lastIndexOf('/');
            return orderDetailHref.substr(pos + 1);
        }

        $scope.getCraftsInfo = function (order) {
            var craftsArray = order.crafts;
            var craftsInfo = '';
            for (var c in craftsArray) {
                craftsInfo += $scope.rolesArray[1][craftsArray[c]].name;
                craftsInfo += ' ';
            }
            return craftsInfo;
        }



        $scope.getStatus = function (status) {
            return (status == 100) ? $scope.statusArrary[$scope.statusArrary.length - 1].name : $scope.statusArrary[status + 1].name;
        }

        $scope.onShowOrderDetail = function (order) {
            if (order.status == 0 || order.status == 1) {
                $scope.statusTitleStyle = 0;
            } else if (order.status == 2 || order.status == 5) {
                $scope.statusTitleStyle = 1;
            } else if (order.status == 3 || order.status == 4) {
                $scope.statusTitleStyle = 2;
            } else {
                $scope.statusTitleStyle = 3;
            }


            $scope.orderDetailInfo = {};
            var obj = {};
            var orderDetailHref = order.order_href;
            var pos = orderDetailHref.lastIndexOf('/');
            var orderId = orderDetailHref.substr(pos + 1);
            var url = "/orders/" + orderId;
            ApiService.get(url, obj, function (data) {
                if (data.result == 'success') {
                    $scope.orderDetailInfo = data.content;
                    var gender = ($scope.orderDetailInfo.gender == 0) ? '女士' : '先生';
                    $scope.orderDetailInfo.houseOwnerName = $scope.orderDetailInfo.first_name + gender;

                    var candidatesArray = $scope.orderDetailInfo.worker_candidates;
                    var candidateTxt = '';
                    var candidatesMap = {};
                    for (var z in candidatesArray) {
                        candidateTxt += candidatesArray[z].name;
                        candidatesMap[candidatesArray[z].account_id] = candidatesArray[z];
                        if (z !== (candidatesArray.length - 1).toString()) {
                            candidateTxt += ',';
                        }
                    }
                    $scope.orderDetailInfo.candidateTxt = candidateTxt;
                    
                    //遍历订单中的所有合同，查看各个状态,找出已中标的合同
                    var contractArray = data.content.contracts;
                    $scope.orderDetailInfo.bidContractInfo = {};
                    for (var i in contractArray) {
                        var contractItem = contractArray[i];
                        if (contractItem.status == 1) {//表示已经签约
                            $scope.orderDetailInfo.bidContractInfo = contractItem;
                            break;
                        }
                    }
                    if ($scope.orderDetailInfo.bidContractInfo) {
                        getContracts();
                        getContractsProcess();
                    }


                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
            $('#orderDetail-dlg').modal('show');
        }
        
        
        //查看施工日志
        $scope.onShowBuildingLogs = function (contractItem) {
            var pos = contractItem.building_logs_href.lastIndexOf('/contracts');
            var url = contractItem.building_logs_href.substr(pos);
            $scope.buildingLogsUrl = url;
            ApiService.get(url, {}, function (data) {
                $scope.buildingLogs = data.content;
            }, function (errMsg) {
                errMsg;
            });
            $('#show_building_logs').modal('show');
        }
        
        $scope.onShowCommitBuildingLogs = function () {
            $scope.newBuildingLog = {
                imgUploadData:'',
                selectImg:'',
                descriptive:''
            }
        }
        
        $scope.uploadBuildingLog = function () {
            if ($scope.newBuildingLog.imgUploadData == '') {
                alert('请选择上传的图片');
                return;
            }
            if ($scope.newBuildingLog.descriptive == '') {
                alert('请填写日志简述');
                return;
            }
            var obj = {
                building_logs: [{description:$scope.newBuildingLog.descriptive,
                photos:[]}]
            }
            $upload.upload({
                url: 'api/' + $scope.buildingLogsUrl,
                data: {content:obj},
                file:$scope.newBuildingLog.imgUploadData
            }).progress(function(evt){
                //alert(evt);
            }).success(function(data, status, headers, config) {
                //alert(data);
                $('#commit-building-dialog').modal('hide');
                ApiService.get($scope.buildingLogsUrl, {}, function (data) {
                    $scope.buildingLogs = data.content;
                }, function (errMsg) {
                    errMsg;
                });
            });;
        }
        
        
        //
        $scope.onFileSelect = function ($files) {
            if ($files.length == 0) {
                return;
            }
            $scope.newBuildingLog.imgUploadData = $files[0];
            fileReader.readAsDataUrl($files[0], $scope).then(function (result) {
                $scope.newBuildingLog.selectImg = result;
            });
        }
        
        //初始化城市列表和工人列表
        function getRoleAndRegionsInfo() {
            var obj = {};
            ApiService.get('/doGetRoleAndRegionsInfo', obj, function (data) {
                if (data.result == 'success') {
                    $scope.regionsArray = data.content.get_roleAndRegions[0];
                    $scope.rolesArray = data.content.get_roleAndRegions[1];
                    getOrdersBypage(1);
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        function getOrdersBypage(pageIndex) {

            var obj = {
                params: {
                    page: pageIndex,
                    filters: filters
                }
            };

            ApiService.get('/orders', obj, function (data) {
                if (data.result == 'success') {
                    $scope.ordersInfo = data.content;
                    $scope.totalOrdersPages = data.pages;

                    //分页控件
                    ordersPaging(pageIndex);

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        //jequry paging controll
        function ordersPaging(pageIndex) {
            var firstScreeningPagination = false;
            laypage({
                cont: $('#ordersPage'),
                pages: $scope.totalOrdersPages,
                skip: true,
                skin: 'yahei',
                curr: pageIndex,//view上显示的页数是索引加1
                groups: 5,
                hash: false,
                jump: function (obj) {//一定要加上first的判断，否则会一直刷新
                    $scope.curOrdersPage = obj.curr;
                    if (!firstScreeningPagination) {
                        firstScreeningPagination = true;
                    } else {
                        getOrdersBypage(obj.curr);
                        firstScreeningPagination = false;
                    }
                }
            });
        }
        
        //获取签约的合同信息
        function getContracts() {
            var obj = {};
            var url = '/contracts/' + $scope.orderDetailInfo.bidContractInfo.id;
            ApiService.get(url, obj, function (data) {
                if (data.result == 'success') {
                    $scope.orderDetailInfo.contractDetail = data.content;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        //获取施工进程
        function getContractsProcess() {
            var obj = {};
            var url = '/contracts/' + $scope.orderDetailInfo.bidContractInfo.id + '/items';
            ApiService.get(url, obj, function (data) {
                if (data.result == 'success') {
                    $scope.orderDetailInfo.contractItemArray = data.content;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        getRoleAndRegionsInfo();


    }
]);