'use strict';

angular.module('myApp').controller('ActivityMgtCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $rootScope.sideBarSelect = {
            firstClassSel:'actvityAdmin',
            secondSel:'activityMgt'
        };
        $scope.initPage();

        $scope.activitiesArray = [];                            //反馈信息
        $scope.activityInfo = {};

        $scope.activityRealName = {
            Verify_Get_Score_Activity:{
                name:'认证赠送积分:',
                type:'认证',
                unit:'分'
            },
            Add_Case_Activity:{
                name:'上传案例赠送积分:',
                type:'案例',
                unit:'分'
            },
            Remove_Case_Activity:{
                name:'删除案例扣除积分:',
                type:'案例',
                unit:'分'
            },
            Worker_Invitation_Reg_Activity:{
                name:'工人邀请用户获赠保证金:',
                type:'用户',
                unit:'元'
            },
            Verify_Giving_Margin_Activity:{
                name:'认证获赠保证金:',
                type:'认证',
                unit:'元'
            },
            HouseOwner_Invitation_Reg_Activity:{
                name:'业主邀请用户获赠悠豆:',
                type:'用户',
                unit:'悠豆'
            }
        }

        function getActivitiesInfo(){
            ApiService.get('/activities', {}, function (data) {
                if (data.result == 'success') {
                    $scope.activitiesArray = data.content;

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        getActivitiesInfo();

        var activityId = '';

        $scope.onShowActivityInfo = function (activityHref) {

            var pos = activityHref.lastIndexOf('/');
            activityId = activityHref.substr(pos+1);
            $scope.isNeedSelectRole = false;
            $scope.selectRole = {
                role:'',
                detail:''
            };

            ApiService.get('/activities/'+activityId, {}, function (data) {
                if (data.result == 'success') {
                    $scope.activityInfo = data.content;
                    $scope.isNeedSelectRole = (data.content.dicounts[0].items.length > 1) ? true :false;
                    if ($scope.isNeedSelectRole) {
                        $scope.selectRole.role = $scope.rolesArray[0];

                        $scope.selectRole.detail = {};
                        getSelectRoleDetail();
                    }
                    $('#show_activityDetail_dlg').modal('show');
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        };

        $scope.getActivityStatus = function (code) {
            if (code === 0) {
                return '未启用';
            } else if (code === 1) {
                return '已启用';
            }
        };

        $scope.setActivityStatus = function (status) {
            var obj = {
                id: activityId,
                enabled:status
            };

            ApiService.post('/activities/'+activityId+'/status', obj, function (data) {

                getActivitiesInfo();

                $('#show_activityDetail_dlg').modal('hide');

            }, function (errMsg) {
                alert(errMsg.message);
            });
        };

        $scope.onSelectRoleChange = function() {
            getSelectRoleDetail ();
        }

        $scope.onUpdateActivity = function () {
            for (var i = 0; i < $scope.activityInfo.dicounts[0].items.length; i++) {
                $scope.activityInfo.dicounts[0].items[i].value = parseFloat($scope.activityInfo.dicounts[0].items[i].value);
            };

            if ($scope.activityInfo.dicounts[0].items[0].limit > 0) {
                $scope.activityInfo.dicounts[0].items[0].limit = parseInt($scope.activityInfo.dicounts[0].items[0].limit);
            }
            
            var obj = {
                id: activityId,
                content:$scope.activityInfo
            };


            ApiService.post('/activities/'+activityId, obj, function (data) {

                getActivitiesInfo();

                $('#show_activityDetail_dlg').modal('hide');

            }, function (errMsg) {
                alert(errMsg.message);
            });
            ;
        }


        function getRolesInfo() {
            var obj = {};
            ApiService.get('/doGetRoleAndRegionsInfo', obj, function (data) {
                if (data.result == 'success') {
                    $scope.rolesArray = data.content.get_roleAndRegions[1][0];
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        function getSelectRoleDetail () {
            for(var i = 0; i < $scope.activityInfo.dicounts[0].items.length; i++ ) {
                if ($scope.activityInfo.dicounts[0].items[i].role == $scope.selectRole.role.id) {
                    $scope.selectRole.detail = $scope.activityInfo.dicounts[0].items[i];
                };
            }
        }

        getRolesInfo();


    }]);