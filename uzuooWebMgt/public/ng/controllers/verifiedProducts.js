'use strict';

angular.module('myApp').controller('VerifiedProductCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel: 'verifiedAdmin',
            secondSel: 'verifyProduct'
        };
        var updateUrl = '/workers/decorationCases/';
        var selectedCaseId = '';
        
        getWorkersCaseBypage(1);
        
        $scope.onShowWorkersCase = function () {
            updateUrl = '/workers/decorationCases/';
            getWorkersCaseBypage(1);
        }
        
        $scope.onShowMerchantsCases = function () {
            updateUrl = '/merchants/decorationCases/';
            getMerchantsCaseBypage(1);
        }
        
        $scope.onShowMerchandises = function () {
            updateUrl = '/merchandises/';
            getMerchandises(1);
        }
        
        $scope.onShowConfirm = function (selId) {
            selectedCaseId = selId;
        }
        
        $scope.onShowReject = function (selId) {
            selectedCaseId = selId;
            $scope.rejectReason = '';
        }
        
        $scope.commitVerify = function () {
            var url = updateUrl + selectedCaseId + '/verificationStatus';
            var obj = {
                verified: 1
            }
            ApiService.post(url, obj, function (data) {
                if (data.result == 'success') {
                    if (updateUrl == '/workers/decorationCases/') {
                        getWorkersCaseBypage($scope.curWorkersCasesPage);
                    } else if (updateUrl == '/merchants/decorationCases/') {
                        getMerchantsCaseBypage($scope.curMerchantsCasesPage);
                    } else if (updateUrl == '/merchandises/') {
                        getMerchandises($scope.curMerchandisesPage)
                    }
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        $scope.commitReject = function () {
            var url = updateUrl + selectedCaseId + '/verificationStatus';
            var obj = {
                verified: 2,
                reason: $scope.rejectReason
            }
            ApiService.post(url, obj, function (data) {
                if (data.result == 'success') {
                    if (updateUrl == '/workers/decorationCases/') {
                        getWorkersCaseBypage($scope.curWorkersCasesPage);
                    } else if (updateUrl == '/merchants/decorationCases/') {
                        getMerchantsCaseBypage($scope.curMerchantsCasesPage);
                    } else if (updateUrl == '/merchandises/') {
                        getMerchandises($scope.curMerchandisesPage)
                    }
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        function getWorkersCaseBypage(pageIndex) {
            var filters = ['verified::0'];

            var obj = {
                params: {
                    page: pageIndex,
                    filters: filters
                }
            }
            ApiService.get('/workers/decorationCases', obj, function (data) {
                if (data.result == 'success') {
                    $scope.workersCases = data.content.decoration_cases;
                    $scope.totalWorkersCasesPages = data.pages;

                    //分页控件
                    worksPaging(pageIndex);

                } else if(data.content === 'Permission Denied'){
                    window.location.href="/permissionError";
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        function getMerchantsCaseBypage(pageIndex) {
            var filters = ['verified::0'];

            var obj = {
                params: {
                    page: pageIndex,
                    filters: filters
                }
            }
            ApiService.get('/merchants/decorationCases', obj, function (data) {
                if (data.result == 'success') {
                    $scope.merchantsCases = data.content.decoration_cases;
                    $scope.totalMerchantsCasesPages = data.pages;

                    //分页控件
                    merchantsPaging(pageIndex);

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        function getMerchandises(pageIndex) {
            var filters = ['verified::0'];

            var obj = {
                params: {
                    page: pageIndex,
                    filters: filters
                }
            }
            ApiService.get('/merchandises', obj, function (data) {
                if (data.result == 'success') {
                    $scope.Merchandises = data.content;
                    $scope.totalMerchandisesPages = data.pages;

                    //分页控件
                    MerchandisesPaging(pageIndex);

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        //jequry paging controll
        function worksPaging(pageIndex) {
            var firstScreeningPagination = false;
            laypage({
                cont: $('#uzWorkerCaesPage'),
                pages: $scope.totalWorkersCasesPages,
                skip: true,
                skin: 'yahei',
                curr: pageIndex,//view上显示的页数是索引加1
                groups: 5,
                hash: false,
                jump: function (obj) {//一定要加上first的判断，否则会一直刷新
                    $scope.curWorkersCasesPage = obj.curr;
                    if (!firstScreeningPagination) {
                        firstScreeningPagination = true;
                    } else {
                        getWorkersCaseBypage(obj.curr);
                        firstScreeningPagination = false;
                    }
                }
            });
        }
        
        function merchantsPaging(pageIndex) {
            var firstScreeningPagination = false;
            laypage({
                cont: $('#uzWorkerCaesPage'),
                pages: $scope.totalMerchantsCasesPages,
                skip: true,
                skin: 'yahei',
                curr: pageIndex,//view上显示的页数是索引加1
                groups: 5,
                hash: false,
                jump: function (obj) {//一定要加上first的判断，否则会一直刷新
                    $scope.curMerchandisesPage = obj.curr;
                    if (!firstScreeningPagination) {
                        firstScreeningPagination = true;
                    } else {
                        getMerchandises(obj.curr);
                        firstScreeningPagination = false;
                    }
                }
            });
        }
        
        function MerchandisesPaging(pageIndex) {
            var firstScreeningPagination = false;
            laypage({
                cont: $('#uzMerchandisesPage'),
                pages: $scope.totalMerchandisesPages,
                skip: true,
                skin: 'yahei',
                curr: pageIndex,//view上显示的页数是索引加1
                groups: 5,
                hash: false,
                jump: function (obj) {//一定要加上first的判断，否则会一直刷新
                    $scope.curMerchandisesPage = obj.curr;
                    if (!firstScreeningPagination) {
                        firstScreeningPagination = true;
                    } else {
                        getMerchandises(obj.curr);
                        firstScreeningPagination = false;
                    }
                }
            });
        }


    }
]);