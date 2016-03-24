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