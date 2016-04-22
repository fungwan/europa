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
                     //rulesObj.freeze_time = rulesObj.margin.freeze_time / 86400 / 365;
                     $scope.roleRuleSetting = rulesObj;
                     $scope.roleRuleSetting['margin']['up_threshold'] = rulesObj['margin']['up_threshold'] / 100;
                     $scope.roleRuleSetting['margin']['down_threshold'] = rulesObj['margin']['down_threshold'] /100;
                     $scope.roleRuleSetting['score']['inc_by_pay'] = rulesObj['score']['inc_by_pay'];

                     $scope.roleRuleSetting['margin']['rate'] = rulesObj['margin']['rate'] * 100;
                     $scope.roleRuleSetting['commission_return']['reviews']['by_all_good'] = rulesObj['commission_return']['reviews']['by_all_good']*100;//.toFixed(1);;
                     $scope.roleRuleSetting['commission_return']['order']['return_rate'] = rulesObj['commission_return']['order']['return_rate'] *100;

                     $scope.checkInputRoleSyntaxStatus = false;

                 } else if(data.content === 'Permission Denied'){
                     window.location.href="/permissionError";
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
                     rulesObj.order.need_trustee = rulesObj.order.need_trustee ? true:false;
                     rulesObj.order.non_earnest_keep_time = rulesObj.order.non_earnest_keep_time / 3600 ; //小时
                     rulesObj.order.non_candidates_keep_time = rulesObj.order.non_candidates_keep_time / 3600; //小时

                     rulesObj['order']['earnest'] = rulesObj['order']['earnest'] /100;
                     rulesObj['ubeans']['up_threshold'] = rulesObj['ubeans']['up_threshold'] / 100;
                     rulesObj['ubeans']['down_threshold'] = rulesObj['ubeans']['down_threshold'] / 100;

                     rulesObj['commission']['basic'] = rulesObj['commission']['basic']*100;
                     rulesObj['commission']['float'] = rulesObj['commission']['float']*100;
                     rulesObj['ubeans']['use_rate'] = rulesObj['ubeans']['use_rate']*100;

                     $scope.craftRuleSetting = rulesObj;

                     $scope.checkInputCraftSyntaxStatus = false;
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
            if(!reg.test(value)) {
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
            $scope.checkInputRoleSyntaxStatus = true;

            var roleRule = $scope.roleRuleSetting;
            roleRule['margin']['rate'] = parseFloat(roleRule['margin']['rate'] / 100);
            roleRule['margin']['up_threshold'] = parseInt(roleRule['margin']['up_threshold']) * 100;
            roleRule['margin']['down_threshold'] = parseInt(roleRule['margin']['down_threshold']) * 100;
            roleRule['margin']['freeze_time'] = parseInt(roleRule['margin']['freeze_time']);

            roleRule['score']['inc_by_good'] = parseInt(roleRule['score']['inc_by_good']);
            roleRule['score']['inc_by_normal'] = parseInt(roleRule['score']['inc_by_normal']);
            roleRule['score']['inc_by_bad'] = parseInt(roleRule['score']['inc_by_bad']);
            roleRule['score']['inc_by_pay'] = parseInt(roleRule['score']['inc_by_pay']);

            roleRule['commission_return']['reviews']['by_all_good'] = parseFloat(roleRule['commission_return']['reviews']['by_all_good'] / 100) ;
            roleRule['commission_return']['order']['count'] = parseInt(roleRule['commission_return']['order']['count']);
            roleRule['commission_return']['order']['return_rate'] = parseFloat(roleRule['commission_return']['order']['return_rate'] / 100) ;

            var obj = {
                roleId:$scope.selectRole.id,
                content: roleRule
            };

            ApiService.post('/setting/roleRules', obj, function (data) {
                if(data.result === 'fail'){alert('基于角色的设置项更新失败');}
                getRoleRules($scope.selectRole.id);
            }, function (errMsg) {
                alert(errMsg.message);
            });
        };

        $scope.updateCraftRules = function(){

            $scope.checkInputCraftSyntaxStatus = true;

            var craftRule = $scope.craftRuleSetting;
            craftRule['order']['earnest'] = parseInt(craftRule['order']['earnest'] ) * 100;


            craftRule['order']['need_trustee'] = craftRule['order']['need_trustee'] ? 1 : 0;
            craftRule['order']['max_candidates'] = parseInt(craftRule['order']['max_candidates']);
            craftRule['order']['non_earnest_keep_time'] = parseInt(craftRule['order']['non_earnest_keep_time'])  * 3600;
            craftRule['order']['non_candidates_keep_time'] = parseInt(craftRule['order']['non_candidates_keep_time']) * 3600;

            craftRule['commission']['basic'] = parseFloat(craftRule['commission']['basic'] /100);
            craftRule['commission']['float'] = parseFloat(craftRule['commission']['float'] /100);

            craftRule['ubeans']['use_rate'] = parseFloat(craftRule['ubeans']['use_rate'] / 100) ;
            craftRule['ubeans']['up_threshold'] = craftRule['ubeans']['up_threshold'] * 100;
            craftRule['ubeans']['down_threshold'] = craftRule['ubeans']['down_threshold'] * 100;

            var obj = {
                craftId:$scope.selectCraft.id,
                content: craftRule
            };

            ApiService.post('/setting/craftRules', obj, function (data) {
                if(data.result === 'fail'){alert('基于细项的设置项更新失败');}
                getCraftRules($scope.selectCraft.id);
            }, function (errMsg) {
                alert(errMsg.message);
            });
        };

    }]);