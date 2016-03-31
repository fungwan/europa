'use strict';

angular.module('myApp').controller('FeedbacksCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
	function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
		$rootScope.sideBarSelect = {
			firstClassSel:'actvityAdmin',
			secondSel:'feedback'
		};

        $scope.feedbackInfoArray = [];                            //反馈信息
        $scope.workerInfo = {};
        $scope.orderInfo = {};
        var curFeedbackPage = 1,totalFeedbackPages = 1;
        var filters  = ['all'];

        function getFeedbackInfo(cur,filterArray){

            var obj = {
                params: {
                    page: cur,
                    filters:filterArray
                }
            };

            ApiService.get('/feedbacks',obj, function (data) {
                if (data.result == 'success') {
                    $scope.feedbackInfoArray = data.content;
                    totalFeedbackPages = data.pages;
                    feedbackPaging(cur);
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        function feedbackPaging(pageIndex) {
            var firstScreeningPagination = false;
            laypage({
                cont: $('#feedbackPage'),
                pages: totalFeedbackPages,
                skip: true,
                skin: 'yahei',
                curr: pageIndex,//view上显示的页数是索引加1
                groups: 5,
                hash: false,
                jump: function (obj) {//一定要加上first的判断，否则会一直刷新
                    curFeedbackPage = obj.curr;
                    if (!firstScreeningPagination) {
                        firstScreeningPagination = true;
                    } else {
                        getFeedbackInfo(obj.curr,filters);
                        firstScreeningPagination = false;
                    }
                }
            });
        }

        getFeedbackInfo(1,['all']);

        $scope.onShowUserInfo = function (feedbackInfo) {

            var workerId = feedbackInfo['account_id'];
            ApiService.get('/workers/' + workerId, {}, function (data) {
                if (data.result == 'success') {
                    var workerInfo = data.content;

                    $scope.workerInfo.name = workerInfo['first_name'] + workerInfo['last_name'];
                    $scope.workerInfo.phone = workerInfo['phone'];
                    $scope.workerInfo.card = workerInfo['id_card_no'];
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

            $('#show_account_dlg').modal('show');
        };

        $scope.onShowOrderInfo = function (feedbackInfo) {

            var orderId = feedbackInfo['content'];
            ApiService.get('/orders/' + orderId, {}, function (data) {
                if (data.result == 'success') {
                    var orderInfo = data.content;
                    var houseInfo = orderInfo['house_info'];
                    $scope.orderInfo.houseOwnerAddress = houseInfo['address'];
                    $scope.orderInfo.houseAcreage = houseInfo['type'] + ' ' + houseInfo['acreage'] + '平';

                    var houseOwnerId = orderInfo['account_id'];
                    ApiService.get('/houseOwners/' + houseOwnerId, {}, function (data) {
                        if (data.result == 'success') {
                            var houseOwnerInfo = data.content;
                            $scope.orderInfo.houseOwnerNickName = houseOwnerInfo['nick_name'];
                            $scope.orderInfo.houseOwnerUserName = houseOwnerInfo['first_name'] + houseOwnerInfo['last_name']
                            $scope.orderInfo.houseOwnerPhone = houseOwnerInfo['phone'];
                        }
                    }, function (errMsg) {
                        alert(errMsg.message);
                    });
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

            $('#show_order_dlg').modal('show');
        };

	}]);