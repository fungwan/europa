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

            ApiService.get('/activities/'+activityId, {}, function (data) {
                if (data.result == 'success') {
                    $scope.activityInfo = data.content;
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


    }]);