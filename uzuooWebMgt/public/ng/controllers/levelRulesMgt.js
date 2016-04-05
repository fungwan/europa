'use strict';

angular.module('myApp').controller('LevelRulesCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel:'operationAdmin',
            secondSel:'levelRule'
        };

        $scope.levelRulesArray = [];                            //等级信息描述规则
        $scope.originalRoles = [];                          //大工种列表

        $scope.selectRole = {};
        $scope.level2RegionArray = [];                           //等级对应区域发布数

        $scope.checkInputSyntaxStatus = false;//等级规则的更新按钮监控
        $scope.checkInputScoreSyntaxStatus = false;//积分规则的更新按钮监控

        var roleRule = {};

        (function () {
            var obj = {};
            ApiService.get('/doGetRoleAndRegionsInfo', obj, function (data) {
                if (data.result == 'success') {
                    $scope.regionsAndRolesArray = data.content.get_roleAndRegions;
                    $scope.rolesArray = $scope.regionsAndRolesArray[1];
                    $scope.originalRoles = $scope.rolesArray[0];

                    $scope.selectRole = $scope.originalRoles[0];

                    //再初始化等级对应区域数
                    getStarToRequireRules($scope.selectRole.id);
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        })();

        (function (){
            ApiService.get('/setting/levelRules', {}, function (data) {
                if (data.result == 'success') {
                    $scope.levelRulesArray = data.content;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        })();

        var getStarToRequireRules = function(roleId){

            var obj = {
                params: {
                    roleId: roleId
                }
            };

            ApiService.get('/setting/roleRules', obj, function (data) {
                if (data.result == 'success') {

                    roleRule = data.content;
                    $scope.level2RegionArray = data.content.region;
                } else if(data.content === 'Permission Denied'){
                    window.location.href="/permissionError";
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

        };


        $scope.onEditThreshold = function(index,threshold){

            var reg = /^[0-9]+$/;
            if (!reg.test(threshold)) {
                $scope.checkInputSyntaxStatus = true;return;
            }

            if(index === $scope.levelRulesArray.length-1){return;}


            var before = $scope.levelRulesArray[index-1].threshold;
            var after = $scope.levelRulesArray[index+1].threshold;

            if((before < threshold) && (threshold < after)){
                $scope.levelRulesArray[index].threshold = parseInt(threshold);

                $scope.checkInputSyntaxStatus = false;
            }else{$scope.checkInputSyntaxStatus = true;}
        };

        $scope.onEditRegionNum = function(index,value){

            var reg = /^[0-9]+$/;
            if (!reg.test(value)) {

                $scope.levelRulesArray[index].max_regions = parseInt(value);

                $scope.checkInputScoreSyntaxStatus = true;
            }else{
                $scope.checkInputScoreSyntaxStatus = false;
            }
        };


        $scope.updateLevelRules = function(){

            var obj = {
                content: $scope.levelRulesArray
            };

            ApiService.post('/setting/levelRules', obj, function (data) {
                if(data.result === 'fail'){alert('星级更新失败');}
            }, function (errMsg) {
                alert(errMsg.message);
            });
        };


        $scope.updateRegionNumRules = function(){

            roleRule.region = $scope.level2RegionArray;

            var obj = {
                roleId:$scope.selectRole.id,
                content: roleRule
            };

            ApiService.post('/setting/roleRules', obj, function (data) {
                if(data.result === 'fail'){alert('星级对应需求发布数规则更新失败');}
            }, function (errMsg) {
                alert(errMsg.message);
            });
        };

        $scope.translateDesc =  [

            {'starDesc':'','yearRecom':''},
            {'starDesc':'1星','yearRecom':'-'},
            {'starDesc':'2星','yearRecom':'-'},
            {'starDesc':'3星','yearRecom':'-'},
            {'starDesc':'4星','yearRecom':'-'},
            {'starDesc':'5星','yearRecom':'0.5年'},
            {'starDesc':'1钻','yearRecom':'1年'},
            {'starDesc':'2钻','yearRecom':'1.5年'},
            {'starDesc':'3钻','yearRecom':'2年'},
            {'starDesc':'4钻','yearRecom':'2.5年'},
            {'starDesc':'5钻','yearRecom':'3年'},
            {'starDesc':'1皇冠','yearRecom':'6年'},
            {'starDesc':'2皇冠','yearRecom':'9年'},
            {'starDesc':'3皇冠','yearRecom':'12年'},
            {'starDesc':'4皇冠','yearRecom':'15年'},
            {'starDesc':'5皇冠','yearRecom':'18年'}

        ];

        $scope.originalRoleSelect = function () {
            var roleId = $scope.selectRole.id;

            getStarToRequireRules(roleId);

        }

    }]);