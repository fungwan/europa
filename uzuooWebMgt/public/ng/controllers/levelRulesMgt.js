'use strict';

angular.module('myApp').controller('LevelRulesCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel:'operationAdmin',
            secondSel:'levelRule'
        };

        $scope.levelRulesArray = [];                            //等级信息
        $scope.originalRoles = [];                          //大工种列表

        $scope.selectRole = {};
        $scope.scoreRules = {

            score_inc_by_good:0,
            score_inc_by_normal:0,
            score_inc_by_bad:0,
            score_inc_by_pay:0

        };

        $scope.checkInputSyntaxStatus = false;//等级规则的更新按钮监控
        $scope.checkInputScoreSyntaxStatus = false;//积分规则的更新按钮监控


        (function () {
            var obj = {};
            ApiService.get('/doGetRoleAndRegionsInfo', obj, function (data) {
                if (data.result == 'success') {
                    $scope.regionsAndRolesArray = data.content.get_roleAndRegions;
                    $scope.rolesArray = $scope.regionsAndRolesArray[1];
                    $scope.originalRoles = $scope.rolesArray[0];

                    $scope.selectRole = $scope.originalRoles[0];

                    //再初始化工种对应的积分规则
                    getScoreRules($scope.selectRole.id);
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        })();

        (function (){
            ApiService.get('/levelRules', {}, function (data) {
                if (data.result == 'success') {
                    $scope.levelRulesArray = data.content;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        })();

        var getScoreRules = function(roleId){

            var obj = {
                params: {
                    roleId: roleId
                }
            };

            ApiService.get('/scoreRules', obj, function (data) {
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
            });

        };


        $scope.onEditThreshold = function(index,threshold){

            var reg = /^[0-9]+$/;
            if (!reg.test(threshold)) {
                $scope.checkInputSyntaxStatus = true;return;
            }
            var before = $scope.levelRulesArray[index-1].threshold;
            var after = $scope.levelRulesArray[index+1].threshold;

            if((before < threshold) && (threshold < after)){
                $scope.levelRulesArray[index].threshold = parseInt(threshold);

                $scope.checkInputSyntaxStatus = false;
            }else{$scope.checkInputSyntaxStatus = true;return;}
        };

        $scope.onEditScore = function(value){

            var reg = /^[0-9]+$/;
            if (!reg.test(value)) {
                $scope.checkInputScoreSyntaxStatus = true;
            }else{
                $scope.checkInputScoreSyntaxStatus = false;
            }
        };

        $scope.onEditPay = function(value){

            var reg = /^[0-9]*\.?[0-9]{1,2}$/;
            if (!reg.test(value)) {
                $scope.checkInputScoreSyntaxStatus = true;
            }else{
                $scope.checkInputScoreSyntaxStatus = false;
            }

        };


        $scope.updateLevelRules = function(){

            var obj = {
                content: $scope.levelRulesArray
            };

            ApiService.post('/levelRules', obj, function (data) {
                if(data.result === 'fail'){alert('星级更新失败');}
            }, function (errMsg) {
                alert(errMsg.message);
            });
        };


        $scope.updateScoreRules = function(){

            var obj = {
                roleId:$scope.selectRole.id,
                content: $scope.scoreRules
            };

            ApiService.post('/scoreRules', obj, function (data) {
                if(data.result === 'fail'){alert('积分规则更新失败');}
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

            getScoreRules(roleId);

        }

    }]);