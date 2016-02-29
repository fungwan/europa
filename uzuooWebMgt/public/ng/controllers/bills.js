'use strict';

angular.module('myApp').controller('BillsCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel:'billAdmin',
            secondSel:'bills'
        };

        $scope.billsArray = [];
        $scope.cityArray = [];                               //城市列表
        $scope.regionArray = [];                             //所有区域列表
        $scope.originalRoles = [];                          //大工种列表

        $scope.getPayStatus = function (code) {
            if (code === 0) {
                return '待审核 ';
            } else if (code === 1) {
                return '待复核 ';
            }
        };

        //获取工人的城市和区域信息
        $scope.getCityAndRegionStr = function (regionArray) {
            var regionsStr = '';
            var cityStr = '';
            for (var x in regionArray) {
                regionsStr += $scope.regionArray[regionArray[x]].name + ' ';
                cityStr = $scope.regionArray[regionArray[x]].parent;
            }
            return {
                regions: regionsStr,
                city: cityStr
            }
        };

        //初始化城市列表和工人列表
        function getRoleAndRegionsInfo() {
            var obj = {};
            ApiService.get('/doGetRoleAndRegionsInfo', obj, function (data) {
                if (data.result == 'success') {
                    $scope.regionsAndRolesArray = data.content.get_roleAndRegions;
                    $scope.provinceArray = $scope.regionsAndRolesArray[0][0];
                    $scope.regionArray = $scope.regionsAndRolesArray[0][1];
                    $scope.rolesArray = $scope.regionsAndRolesArray[1];
                    $scope.originalRoles = $scope.rolesArray[0];

                    getBillsInfo(1,['all']);

                }
            }, function (errMsg) {
                alert(errMsg);
            });
        }

        getRoleAndRegionsInfo();

        function getBillsInfo(cur,filterArray){

            var obj = {
                params: {
                    page: cur,
                    filters:filterArray
                }
            };

            ApiService.get('/bills', obj, function (data) {
                if (data.result == 'success') {
                    $scope.billsArray = data.content;

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        $scope.checkBill = function (billInfo) {

            var detailLink = billInfo['href'];
            var pos = detailLink.lastIndexOf('/');
            var tradeId = detailLink.substr(pos+1);
            var _status = billInfo.status + 1;

            var obj = {
                status: _status
            };

            ApiService.post('/bills/'+tradeId+'/billStatus', obj, function (data) {
                if(data.result === 'success'){ billInfo.status = _status;}else{alert('审核动作失败...')}

            }, function (errMsg) {
                alert(errMsg.message);
            });
        };

        $scope.rejectBill = function (billInfo) {

            var detailLink = billInfo['href'];
            var pos = detailLink.lastIndexOf('/');
            var tradeId = detailLink.substr(pos+1);

            var obj = {
                status: 3
            };

            ApiService.post('/bills/'+tradeId+'/billStatus', obj, function (data) {
                if(data.result === 'success'){ billInfo.status = 3;}else{alert('拒绝审核失败...');}

            }, function (errMsg) {
                alert(errMsg.message);
            });
        };

        //https://devadmin.uzuoo.com:8081/advertisementMgtPage



    }]);