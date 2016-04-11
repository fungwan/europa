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
        var selectedArray = '';
        
        getWorkersCaseBypage(1);
        
        $scope.onShowWorkersCase = function () {
            updateUrl = '/workers/decorationCases/';
            $scope.selectAllWorkersCase = false;
            getWorkersCaseBypage(1);
        }
        
        $scope.onShowMerchantsCases = function () {
            updateUrl = '/merchants/decorationCases/';
            $scope.selectAllMerchantsCases = false;
            getMerchantsCaseBypage(1);
        }
        
        $scope.onShowMerchandises = function () {
            updateUrl = '/merchandises/';
            $scope.selectAllerchandises = false;
            getMerchandises(1);
        }
        
        $scope.onShowConfirm = function (selId) {
            selectedCaseId = selId;
            selectedArray = '';
        }
        
        $scope.onShowReject = function (selId) {
            selectedCaseId = selId;
            selectedArray = '';
            $scope.rejectReason = '';
        }
        
        $scope.onShowConfirmAll = function (array) {
            selectedArray = array;
            selectedCaseId = '';
        }
        
        $scope.onShowRejectAll = function (array) {
            selectedArray = array;
            selectedCaseId = '';
            $scope.rejectReason = '';
        }
        
        $scope.commitVerify = function () {
            if (selectedCaseId) {
                doVerifyById(selectedCaseId);
            } else if (selectedArray) {
                for (var i = 0; i < selectedArray.length; i++) {
                    var item = selectedArray[i];
                    if (item.selected) {
                        doVerifyById(item.id);
                    }
                }
            }
        }
        
        $scope.commitReject = function () {
            if (selectedCaseId) {
                doRejectById(selectedCaseId);
            } else if (selectedArray) {
                for (var i = 0; i < selectedArray.length; i++) {
                    var item = selectedArray[i];
                    if (item.selected) {
                        doRejectById(item.id);
                    }
                }
            }
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
        
        function doVerifyById (id) {
            var url = updateUrl + id + '/verificationStatus';
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
                //alert(errMsg.message);
            });
        }
        
        function doRejectById (id) {
            var url = updateUrl + id + '/verificationStatus';
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
                //alert(errMsg.message);
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
                cont: $('#uzMerchantCaesPage'),
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