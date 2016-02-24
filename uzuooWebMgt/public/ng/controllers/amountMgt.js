'use strict';

angular.module('myApp').controller('AmountMgtCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel:'operationAdmin',
            secondSel:'amountMgt'
        };


        $scope.originalRoles = [];//tab1大工种列表
        $scope.selectRole = {};
        $scope.roleRuleSetting = {};//与大工种相关的参数配置项

        $scope.originalRoles2 = [];//tab2大工种列表
        $scope.selectRole2 = {};
        $scope.originalCrafts = [];//细项列表
        $scope.selectCraft = {};
        $scope.craftRuleSetting = {};//与细项相关的参数配置项

        $scope.checkInputRoleSyntaxStatus = false;//基于角色的更新按钮监控
        $scope.checkInputCraftSyntaxStatus = false;//基于细项的更新按钮监控


        (function () {
            var obj = {};
            ApiService.get('/doGetRoleAndRegionsInfo', obj, function (data) {
                if (data.result == 'success') {
                    $scope.regionsAndRolesArray = data.content.get_roleAndRegions;
                    $scope.rolesArray = $scope.regionsAndRolesArray[1];

                    $scope.originalRoles = $scope.rolesArray[0];
                    $scope.selectRole = $scope.originalRoles[0];

                    getRoleRules($scope.selectRole.id);

                    $scope.originalRoles2 = $scope.rolesArray[0];
                    $scope.selectRole2 = $scope.originalRoles2[0];
                    $scope.originalCrafts = $scope.originalRoles2[0].crafts;
                    $scope.selectCraft = $scope.originalCrafts[0];

                    getCraftRules($scope.selectCraft.id);

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        })();

        $scope.originalRoleSelect = function () {
            var roleId = $scope.selectRole.id;

            getRoleRules(roleId);

        };

        var getRoleRules = function(roleId){

            var obj = {
                params: {
                    roleId: roleId
                }
            };

            ApiService.get('/setting/roleRules', obj, function (data) {
                 if (data.result == 'success') {
                     var rulesObj = data.content;
                     rulesObj.freeze_time = rulesObj.freeze_time / 86400 / 365;
                     $scope.roleRuleSetting = rulesObj;
                 }
             }, function (errMsg) {
             alert(errMsg.message);
             });

        };


        $scope.originalRole2Select = function () {
            var roleId = $scope.selectRole2.id;
            for(var x = 0; x < $scope.originalRoles2.length;++x){
                if(roleId === $scope.originalRoles2[x].id){
                    $scope.originalCrafts = $scope.originalRoles2[x].crafts;
                    $scope.selectCraft = $scope.originalCrafts[0];
                    getCraftRules($scope.selectCraft.id);
                    break;
                }
            }
        };

        $scope.originalCraftSelect = function () {
            var craftId = $scope.selectCraft.id;
            getCraftRules(craftId);

        };

        var getCraftRules = function(craftId){

            var obj = {
                params: {
                    craftId: craftId
                }
            };

            ApiService.get('/setting/craftRules', obj, function (data) {
                 if (data.result == 'success') {
                     var rulesObj = data.content;
                     rulesObj.need_trustee = rulesObj.need_trustee ? true:false;
                     $scope.craftRuleSetting = rulesObj;
                 }
             }, function (errMsg) {
             alert(errMsg.message);
             });

        };

        $scope.onEditRoleInt = function(value){

            var reg = /^[0-9]+$/;
            if (!reg.test(value)) {
                $scope.checkInputRoleSyntaxStatus = true;
            }else{
                $scope.checkInputRoleSyntaxStatus = false;
            }
        };

        $scope.onEditRoleIntEx = function(value){//可匹配正负整数

            var reg = /^-?[0-9]+$/;
            if (!reg.test(value)) {
                $scope.checkInputRoleSyntaxStatus = true;
            }else{
                $scope.checkInputRoleSyntaxStatus = false;
            }
        };

        $scope.onEditCraftInt = function(value){

            var reg = /^[0-9]+$/;
            if (!reg.test(value)) {
                $scope.checkInputCraftSyntaxStatus = true;
            }else{
                $scope.checkInputCraftSyntaxStatus = false;
            }
        };

        $scope.onEditRoleFloat = function(value){

            var reg = /^[0-9]*\.?[0-9]{1,2}$/;
            if (!reg.test(value)) {
                $scope.checkInputRoleSyntaxStatus = true;
            }else{
                $scope.checkInputRoleSyntaxStatus = false;
            }

        };

        $scope.onEditCraftFloat = function(value){

            var reg = /^[0-9]*\.?[0-9]{1,2}$/;
            if (!reg.test(value)) {
                $scope.checkInputCraftSyntaxStatus = true;
            }else{
                $scope.checkInputCraftSyntaxStatus = false;
            }

        };

        $scope.updateRoleRules = function(){

            var obj = {
                roleId:$scope.selectRole.id,
                content: $scope.roleRuleSetting
            };

            ApiService.post('/setting/roleRules', obj, function (data) {
                if(data.result === 'fail'){alert('基于角色的设置项更新失败');}
            }, function (errMsg) {
                alert(errMsg.message);
            });
        };

        $scope.updateCraftRules = function(){

            var obj = {
                craftId:$scope.selectCraft.id,
                content: $scope.craftRuleSetting
            };

            ApiService.post('/setting/craftRules', obj, function (data) {
                if(data.result === 'fail'){alert('基于细项的设置项更新失败');}
            }, function (errMsg) {
                alert(errMsg.message);
            });
        };

    }]);