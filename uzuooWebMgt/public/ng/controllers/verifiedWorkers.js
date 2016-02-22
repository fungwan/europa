'use strict';

angular.module('myApp').controller('VerifiedCustomerCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel:'userAdmin',
            secondSel:'verifyUsr'
        };

        $scope.curWorkersPage = 1;
        $scope.workersInfo = [];

        $scope.onShowverifiedDlg = function (worker) {
            
        	$('#verified_worker_dlg').modal('show');
            var workerDetailLink = worker['href'];
            var pos = workerDetailLink.lastIndexOf('/');
            var workerId = workerDetailLink.substr(pos + 1);
            $scope.selectWorker = {
                first_name: worker.first_name,
                last_name: worker.last_name,
                phone: worker.phone,
                id_card_no: worker.id_card_no,
                verified: worker.verified,
                imgHref: "images/avatar/avatar_loading.gif",
                workerId: workerId,
                virifiedDescriptive:''
            }

            ApiService.get('/workers/' + workerId, {}, function (data) {
                if (data.result == 'success') {
                    $scope.selectWorker.imgHref = $rootScope.defaultVerifiedImg;
                    if (data.content.verify_photo)
                        $scope.selectWorker.imgHref = $rootScope.qiniuUrl + data.content.verify_photo;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
            var url = '/workers/' + workerId + '/verification_logs';
            ApiService.get(url, {}, function (data) {
                if (data.result == 'success') {
                    $scope.selectWorker.verifiedLogsArray = data.content;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        $scope.verifyStatus = function (status) {
            return (status == 2) ? '成功' : '失败';
        }

        $scope.onRejectVerify = function () {
            verifiedWorker([$scope.selectWorker.workerId],3,$scope.selectWorker.virifiedDescriptive);
        }

        $scope.onVerify = function () {
            var msg = '恭喜您已通过悠住认证，请登录app查看和抢单.';
            verifiedWorker([$scope.selectWorker.workerId],2,msg);
        }

        function getWorkersBypage(pageIndex) {
            var filters = ['verified::1'];

            var obj = {
                params: {
                    page: pageIndex,
                    filters: filters
                }
            }
            ApiService.get('/workers', obj, function (data) {
                if (data.result == 'success') {
                    $scope.workersInfo = data.content;
                    $scope.totalWorkersPages = data.pages;

                    //分页控件
                    worksPaging(pageIndex);

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }


        function worksPaging(pageIndex) {
            var firstScreeningPagination = false;
            laypage({
                cont: $('#todoVerifiedWorkerPage'),
                pages: $scope.totalWorkersPages,
                skip: true,
                skin: 'yahei',
                curr: pageIndex,//view上显示的页数是索引加1
                groups: 5,
                hash: false,
                jump: function (obj) {//一定要加上first的判断，否则会一直刷新
                    $scope.curWorkersPage = obj.curr;
                    if (!firstScreeningPagination) {
                        firstScreeningPagination = true;
                    } else {
                        getWorkersBypage(obj.curr);
                        firstScreeningPagination = false;
                    }
                }
            });
        }



        function verifiedWorker(idArray,isVerified,msg){
            console.log(typeof isVerified);
            if(idArray.length === 0){
                return;
            }else{
                //执行post请求验证对应的用户
                var obj = {
                    ids:idArray,
                    content:{
                        verified:isVerified,
                        reason:msg
                    }
                }
                ApiService.post('/workers/verificationStatus', obj, function (data) {
                    $("#verified_worker_dlg").modal("hide");
                    getWorkersBypage($scope.curWorkersPage);
                }, function (errMsg) {
                    alert(errMsg.message);
                });
            }
        }

        getWorkersBypage($scope.curWorkersPage);

        
    }
]);