'use strict';

angular.module('myApp').controller('CitiesMgtCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel: 'operationAdmin',
            secondSel: 'citiesMgt'
        };
        $scope.selectedProvince = '';
        $scope.selectedCity = '';

        var selectedProvinceId = '';
        var selectedCityId = '';
        var selectedRegionId = '';

        $scope.onSelectProvince = function (province) {
            $scope.selectedProvince = province;
            $scope.selectedCity = '';
        }

        $scope.onSelectCity = function (city) {
            $scope.selectedCity = city;
        }

        $scope.onSelectRegion = function (region) {
            $scope.selectedRegion = region;
        }

        $scope.onShowNewProvince = function () {
            $scope.newProvince = {
                name: '',
                cities: []
            }
        }

        $scope.onShowNewCity = function () {
            $scope.newCity = {
                name: '',
                regions: []
            }
        }

        $scope.onShowNewRegion = function () {
            $scope.newRegion = {
                name: ''
            }
        }

        $scope.onNewProvince = function () {
            if ($scope.newProvince.name == '') {
                return;
            }
            var obj = $scope.newProvince;
            ApiService.post('/setting/provinces', obj, function (data) {
                if (data.result == 'success') {
                    getRoleAndRegionsInfo();
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        $scope.onNewCity = function () {
            if ($scope.newCity.name == '') {
                return;
            }
            var obj = $scope.newCity;
            var url = '/setting/provinces/' + $scope.selectedProvince.id + '/cities';
            ApiService.post(url, obj, function (data) {
                if (data.result == 'success') {
                    getRoleAndRegionsInfo();
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        $scope.onNewRegion = function () {
            if ($scope.newRegion.name == '') {
                return;
            }
            var obj = $scope.newRegion;
            var url = '/setting/provinces/' + $scope.selectedProvince.id + '/cities/' + $scope.selectedCity.id + '/regions';
            ApiService.post(url, obj, function (data) {
                if (data.result == 'success') {
                    getRoleAndRegionsInfo();
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }


        $scope.onChangeProvinceName = function () {
            if ($scope.selectedProvince.name == '') {
                return;
            }
            var obj = {
                name: $scope.selectedProvince.name
            };
            var url = '/setting/provinces/' + $scope.selectedProvince.id;
            ApiService.post(url, obj, function (data) {
                if (data.result == 'success') {
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        $scope.onChangeCityName = function () {
            if ($scope.selectedCity.name == '') {
                return;
            }
            var obj = {
                name: $scope.selectedCity.name
            };
            var url = '/setting/provinces/' + $scope.selectedProvince.id + '/cities/' + $scope.selectedCity.id;
            ApiService.post(url, obj, function (data) {
                if (data.result == 'success') {
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        $scope.onChangeRegionName = function () {
            if ($scope.selectedRegion.name == '') {
                return;
            }
            var obj = {
                name: $scope.selectedRegion.name
            };
            var url = '/setting/provinces/' + $scope.selectedProvince.id + '/cities/' + $scope.selectedCity.id + '/regions/' + $scope.selectedRegion.id;
            ApiService.post(url, obj, function (data) {
                if (data.result == 'success') {
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }



        function getRoleAndRegionsInfo() {
            if ($scope.selectedProvince) {
                selectedProvinceId = $scope.selectedProvince.id
            }
            if ($scope.selectedCity) {
                selectedCityId = $scope.selectedCity.id
            }
            if ($scope.selectedRegion) {
                selectedRegionId = $scope.selectedRegion.id
            }
            var obj = {};
            ApiService.get('/setting/roleAndRegions', obj, function (data) {
                if (data.result == 'success') {
                    $scope.regionsAndRolesArray = data.content.get_roleAndRegions;
                    $scope.provinceArray = $scope.regionsAndRolesArray[0][0];
                    refreshDlg();
                } else if(data.content === 'Permission Denied'){
                    window.location.href="/permissionError";
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        getRoleAndRegionsInfo();

        function refreshDlg() {
            if (selectedProvinceId !== '') {
                for (var i = 0; i < $scope.provinceArray.length; i++) {
                    if ($scope.provinceArray[i].id == selectedProvinceId) {
                        $scope.selectedProvince = $scope.provinceArray[i];
                        break;
                    }
                }
            }
            if (selectedCityId !== '') {
                for (var i = 0; i < $scope.provinceArray.length; i++) {
                    if ($scope.selectedProvince.cities[i].id == selectedCityId) {
                        $scope.selectedCity = $scope.selectedProvince.cities[i];
                        break;
                    }
                }
            }
            if (selectedRegionId !== '') {
                for (var i = 0; i < $scope.provinceArray.length; i++) {
                    if ($scope.selectedCity.regions[i].id == selectedProvinceId) {
                        $scope.selectedRegion = $scope.selectedCity.regions[i];
                        break;
                    }
                }
            }
        }

    }
]);