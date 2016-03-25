'use strict';

angular.module('myApp').controller('CitiesMgtCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel:'operationAdmin',
            secondSel:'citiesMgt'
        };
        $scope.selectedProvince = '';
        $scope.selectedCity = '';
        
        $scope.onSelectProvince = function (province) {
            $scope.selectedProvince = province;
            $scope.selectedCity = '';
        }
        
        $scope.onSelectCity = function (city) {
            $scope.selectedCity = city;
        }
        
        $scope.onShowNewProvince = function () {
            $scope.editItem = {
                type:'add',
                title:'新增省份',
                target: $scope.provinceArray,
                element: {
                    name:'',
                    id:'',
                    cities:[]
                }
            }
            $('#new_region_dlg').modal('show');
        }
        
        $scope.onShowNewCity = function () {
            $scope.editItem = {
                type: 'add',
                title: $scope.selectedProvince.name + '-----' + '新增城市',
                target: $scope.selectedProvince.cties,
                element: {
                    name:'',
                    id:'',
                    regions:[]
                }
            }
            $('#new_region_dlg').modal('show');
        }
        
        $scope.onShowNewRegion = function () {
            $scope.editItem = {
                type:'add',
                title:$scope.selectedProvince.name + '-' + $scope.selectedCity.name + '-----' + '新增区域',
                target: $scope.selectedCity.regions,
                element: {
                    name:'',
                    id:''
                }
            }
            $('#new_region_dlg').modal('show');
        }
        
        $scope.onSaveChange = function () {
            var oldLastItem = $scope.editItem.target.pop();
            var val = parseInt(oldLastItem.id.split('-').pop());
            $scope.editItem;
        }
        
        function getRoleAndRegionsInfo() {
            var obj = {};
            ApiService.get('/doGetRoleAndRegionsInfo', obj, function (data) {
                if (data.result == 'success') {
                    $scope.regionsAndRolesArray = data.content.get_roleAndRegions;
                    $scope.provinceArray = $scope.regionsAndRolesArray[0][0];
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        getRoleAndRegionsInfo();

    }
]);