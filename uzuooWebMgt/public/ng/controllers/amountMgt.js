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

        (function () {
            var obj = {};
            ApiService.get('/doGetRoleAndRegionsInfo', obj, function (data) {
                if (data.result == 'success') {
                    $scope.regionsAndRolesArray = data.content.get_roleAndRegions;
                    $scope.rolesArray = $scope.regionsAndRolesArray[1];

                    $scope.originalRoles = $scope.rolesArray[0];
                    $scope.selectRole = $scope.originalRoles[0];

                    //getRoleRules($scope.selectRole.id);

                    $scope.originalRoles2 = $scope.rolesArray[0];
                    $scope.selectRole2 = $scope.originalRoles2[0];
                    $scope.originalCrafts = $scope.originalRoles2[0].crafts;
                    $scope.selectCraft = $scope.originalCrafts[0];

                    //getCraftRules($scope.selectRole.id);

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

            /*ApiService.get('/setting/scoreRules', obj, function (data) {
             if (data.result == 'success') {
             var rulesObj = data.content;
             $scope.scoreRules = {

             score_inc_by_good:rulesObj.score_inc_by_good,
             score_inc_by_normal:rulesObj.score_inc_by_normal,
             score_inc_by_bad:rulesObj.score_inc_by_bad,
             score_inc_by_pay:rulesObj.score_inc_by_pay

             };
             }
             }, function (errMsg) {
             alert(errMsg.message);
             });*/

        };


        $scope.originalRole2Select = function () {
            var roleId = $scope.selectRole2.id;
            console.log($scope.selectRole2);
            for(var x = 0; x < $scope.originalRoles2.length;++x){
                if(roleId === $scope.originalRoles2[x].id){
                    $scope.originalCrafts = $scope.originalRoles2[x].crafts;
                    $scope.selectCraft = $scope.originalCrafts[0];
                    break;
                }
            }
        };

        $scope.originalCraftSelect = function () {
            var craftId = $scope.selectCraft.id;
            //console.log(craftId);
            getCraftRules(craftId);

        };

        var getCraftRules = function(craftId){

            var obj = {
                params: {
                    craftId: craftId
                }
            };

            /*ApiService.get('/setting/scoreRules', obj, function (data) {
             if (data.result == 'success') {
             var rulesObj = data.content;
             $scope.scoreRules = {

             score_inc_by_good:rulesObj.score_inc_by_good,
             score_inc_by_normal:rulesObj.score_inc_by_normal,
             score_inc_by_bad:rulesObj.score_inc_by_bad,
             score_inc_by_pay:rulesObj.score_inc_by_pay

             };
             }
             }, function (errMsg) {
             alert(errMsg.message);
             });*/

        };


    }]);