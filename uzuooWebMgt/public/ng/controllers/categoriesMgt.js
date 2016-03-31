'use strict';

angular.module('myApp').controller('CategoriesMgtCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel: 'operationAdmin',
            secondSel: 'categoriesMgt'
        };

        var selectedRoleId = '';
        var selectedCraftId = '';
        
        var selectedMerchantsRoleId = '';
        var selectedMerchantsCraftId = '';

        $scope.onShowNewRoleDlg = function () {
            $scope.newRole = {
                name: '',
                visible: '1',
                crafts: []
            }
        }
        
        $scope.onShowNewMerchantsRoleDlg = function () {
            $scope.newMerchantsRole = {
                name: '',
                visible: '1',
                crafts: []
            }
        }

        $scope.onShowNewCraftDlg = function () {
            $scope.newCraft = {
                name: '',
                visible: '1'
            }
        }
        
        $scope.onShowNewMerchantsCraftDlg = function () {
            $scope.newMerchantsCraft = {
                name: '',
                visible: '1'
            }
        }
        
        
        //新增大工种
        $scope.onNewRole = function () {
            if ($scope.newRole.name == '') {
                return;
            }
            var obj = {
                name: $scope.newRole.name,
                visible: 1
            };
            ApiService.post('/setting/workers/roles', obj, function (data) {
                if (data.result == 'success') {
                    getRoleAndRegionsInfo();
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        //新增大类别
        $scope.onNewMerchantsRole = function () {
            if ($scope.newMerchantsRole.name == '') {
                return;
            }
            var obj = {
                name: $scope.newMerchantsRole.name,
                visible: 1
            };
            ApiService.post('/setting/merchants/roles', obj, function (data) {
                if (data.result == 'success') {
                    getRoleAndRegionsInfo();
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        //新增小工种
        $scope.onNewCraft = function () {
            if ($scope.newCraft.name == '') {
                return;
            }
            var obj = {
                name: $scope.newCraft.name,
                visible: 1
            };
            var url = '/setting/workers/role/' + $scope.selectedRole.id + '/crafts'
            ApiService.post(url, obj, function (data) {
                if (data.result == 'success') {
                    getRoleAndRegionsInfo();
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        //新增小类别
        $scope.onNewMerchantsCraft = function () {
            if ($scope.newMerchantsCraft.name == '') {
                return;
            }
            var obj = {
                name: $scope.newMerchantsCraft.name,
                visible: 1
            };
            var url = '/setting/merchants/role/' + $scope.selectedMerchantsRole.id + '/crafts'
            ApiService.post(url, obj, function (data) {
                if (data.result == 'success') {
                    getRoleAndRegionsInfo();
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        //修改大工种名
        $scope.onChangeRoleName = function () {
            if ($scope.selectedRole.name == '') {
                return;
            }
            var obj = {
                name: $scope.selectedRole.name,
            };
            var url = '/setting/workers/role/' + $scope.selectedRole.id + '/name'
            ApiService.post(url, obj, function (data) {
                if (data.result == 'success') {
                    //$scope.selectedRole.crafts.push($scope.newCraft);
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        //修改大类别名
        $scope.onChangeMerchantsRoleName = function () {
            if ($scope.selectedMerchantsRole.name == '') {
                return;
            }
            var obj = {
                name: $scope.selectedMerchantsRole.name,
            };
            var url = '/setting/merchants/role/' + $scope.selectedMerchantsRole.id + '/name'
            ApiService.post(url, obj, function (data) {
                if (data.result == 'success') {
                    //$scope.selectedRole.crafts.push($scope.newCraft);
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        //修改小工种名
        $scope.onChangeCraftName = function () {
            if ($scope.selectedCraft.name == '') {
                return;
            }
            var obj = {
                name: $scope.selectedCraft.name,
            };
            var url = '/setting/workers/role/' + $scope.selectedRole.id + '/crafts/' + $scope.selectedCraft.id + '/name';
            ApiService.post(url, obj, function (data) {
                if (data.result == 'success') {
                    //$scope.selectedRole.crafts.push($scope.newCraft);
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        //修改小类别名
        $scope.onChangeMerchantsCraftName = function () {
            if ($scope.selectedMerchantsCraft.name == '') {
                return;
            }
            var obj = {
                name: $scope.selectedMerchantsCraft.name,
            };
            var url = '/setting/merchants/role/' + $scope.selectedMerchantsRole.id + '/crafts/' + $scope.selectedMerchantsCraft.id + '/name';
            ApiService.post(url, obj, function (data) {
                if (data.result == 'success') {
                    //$scope.selectedRole.crafts.push($scope.newCraft);
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        //修改大工种可见性
        $scope.onChangeRoleVisable = function () {
            var obj = {
                visible: parseInt($scope.selectedRole.visible),
            };
            var url = '/setting/workers/role/' + $scope.selectedRole.id + '/visible'
            ApiService.post(url, obj, function (data) {
                if (data.result == 'success') {

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        //修改大类别可见性
        $scope.onChangeMerchantsRoleVisable = function () {
            var obj = {
                visible: parseInt($scope.selectedMerchantsRole.visible),
            };
            var url = '/setting/merchants/role/' + $scope.selectedMerchantsRole.id + '/visible'
            ApiService.post(url, obj, function (data) {
                if (data.result == 'success') {

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        //修改小工种可见性
        $scope.onChangeCraftVisable = function () {
            var obj = {
                visible: parseInt($scope.selectedCraft.visible),
            };
            var url = '/setting/workers/role/' + $scope.selectedRole.id + '/crafts/' + $scope.selectedCraft.id + '/visible';
            ApiService.post(url, obj, function (data) {
                if (data.result == 'success') {

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        //修改小类别可见性
        $scope.onChangeMerchantsCraftVisable = function () {
            var obj = {
                visible: parseInt($scope.selectedMerchantsCraft.visible),
            };
            var url = '/setting/merchants/role/' + $scope.selectedMerchantsRole.id + '/crafts/' + $scope.selectedMerchantsCraft.id + '/visible';
            ApiService.post(url, obj, function (data) {
                if (data.result == 'success') {

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        
        
        $scope.onSelectRole = function (role) {
            $scope.selectedRole = role;
            if ($scope.selectedRole.visible === undefined) {
                $scope.selectedRole.visible = '1';
            } else if ($scope.selectedRole.visible === 1) {
                $scope.selectedRole.visible = '1';
            } else if ($scope.selectedRole.visible === 0) {
                $scope.selectedRole.visible = '0';
            }
        }
        
        $scope.onSelectMerchantsRole = function (role) {
            $scope.selectedMerchantsRole = role;
            if ($scope.selectedMerchantsRole.visible === undefined) {
                $scope.selectedMerchantsRole.visible = '1';
            } else if ($scope.selectedMerchantsRole.visible === 1) {
                $scope.selectedMerchantsRole.visible = '1';
            } else if ($scope.selectedMerchantsRole.visible === 0) {
                $scope.selectedMerchantsRole.visible = '0';
            }
        }

        $scope.onSelectCraft = function (craft) {
            $scope.selectedCraft = craft;
            if ($scope.selectedCraft.visible === undefined) {
                $scope.selectedCraft.visible = '1';
            } else if ($scope.selectedCraft.visible === 1) {
                $scope.selectedCraft.visible = '1';
            } else if ($scope.selectedCraft.visible === 0) {
                $scope.selectedCraft.visible = '0';
            }
        }
        
        $scope.onSelectMerchantsCraft = function (craft) {
            $scope.selectedMerchantsCraft = craft;
            if ($scope.selectedMerchantsCraft.visible === undefined) {
                $scope.selectedMerchantsCraft.visible = '1';
            } else if ($scope.selectedMerchantsCraft.visible === 1) {
                $scope.selectedMerchantsCraft.visible = '1';
            } else if ($scope.selectedMerchantsCraft.visible === 0) {
                $scope.selectedMerchantsCraft.visible = '0';
            }
        }

        function getRoleAndRegionsInfo() {
            var obj = {};
            if ($scope.selectedRole) {
                selectedRoleId = $scope.selectedRole.id
            }
            if ($scope.selectedCraft) {
                selectedCraftId = $scope.selectedCraft.id
            }
            if ($scope.selectedMerchantsRole) {
                selectedMerchantsRoleId = $scope.selectedMerchantsRole.id
            }
            if ($scope.selectedMerchantsCraft) {
                selectedMerchantsCraftId = $scope.selectedMerchantsCraft.id
            }
            ApiService.get('/doGetRoleAndRegionsInfo', obj, function (data) {
                if (data.result == 'success') {
                    $scope.regionsAndRolesArray = data.content.get_roleAndRegions;
                    $scope.roleArray = $scope.regionsAndRolesArray[1][0];
                    $scope.merchantsRoleArray = $scope.regionsAndRolesArray[2][0];
                    refreshDlg();
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        getRoleAndRegionsInfo();

        function refreshDlg() {
            if (selectedRoleId !== '') {
                for (var i = 0; i < $scope.roleArray.length; i++) {
                    if ($scope.roleArray[i].id == selectedRoleId) {
                        $scope.selectedRole = $scope.roleArray[i];
                        if ($scope.selectedRole.visible === undefined) {
                            $scope.selectedRole.visible = '1';
                        } else if ($scope.selectedRole.visible === 1) {
                            $scope.selectedRole.visible = '1';
                        } else if ($scope.selectedRole.visible === 0) {
                            $scope.selectedRole.visible = '0';
                        }
                        break;
                    }
                }
            }
            if (selectedCraftId !== '') {
                for (var i = 0; i < $scope.selectedRole.crafts.length; i++) {
                    if ($scope.selectedRole.crafts[i].id == selectedCraftId) {
                        $scope.selectedCraft = $scope.selectedRole.crafts[i];
                        if ($scope.selectedCraft.visible === undefined) {
                            $scope.selectedCraft.visible = '1';
                        } else if ($scope.selectedCraft.visible === 1) {
                            $scope.selectedCraft.visible = '1';
                        } else if ($scope.selectedCraft.visible === 0) {
                            $scope.selectedCraft.visible = '0';
                        }
                        break;
                    }
                }
            }
            
            if (selectedMerchantsRoleId !== '') {
                for (var i = 0; i < $scope.merchantsRoleArray.length; i++) {
                    if ($scope.merchantsRoleArray[i].id == selectedMerchantsRoleId) {
                        $scope.selectedMerchantsRole = $scope.merchantsRoleArray[i];
                        if ($scope.selectedMerchantsRole.visible === undefined) {
                            $scope.selectedMerchantsRole.visible = '1';
                        } else if ($scope.selectedMerchantsRole.visible === 1) {
                            $scope.selectedMerchantsRole.visible = '1';
                        } else if ($scope.selectedMerchantsRole.visible === 0) {
                            $scope.selectedMerchantsRole.visible = '0';
                        }
                        break;
                    }
                }
            }
            if (selectedMerchantsCraftId !== '') {
                for (var i = 0; i < $scope.selectedMerchantsRole.crafts.length; i++) {
                    if ($scope.selectedMerchantsRole.crafts[i].id == selectedMerchantsCraftId) {
                        $scope.selectedMerchantsCraft = $scope.selectedMerchantsRole.crafts[i];
                        if ($scope.selectedMerchantsCraft.visible === undefined) {
                            $scope.selectedMerchantsCraft.visible = '1';
                        } else if ($scope.selectedMerchantsCraft.visible === 1) {
                            $scope.selectedMerchantsCraft.visible = '1';
                        } else if ($scope.selectedMerchantsCraft.visible === 0) {
                            $scope.selectedMerchantsCraft.visible = '0';
                        }
                        break;
                    }
                }
            }
        }


    }
]);