'use strict';

angular.module('myApp').controller('VerifiedProductCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel: 'verifiedAdmin',
            secondSel: 'verifyProduct'
        };
        
        function getWorkersCaseBypage(pageIndex) {
            var filters = ['verified::1'];

            var obj = {
                params: {
                    page: pageIndex,
                    filters: filters
                }
            }
            ApiService.get('/workers/decorationCases', obj, function (data) {
                if (data.result == 'success') {
                    $scope.workersCases = data.content;
                    $scope.totalWorkersCasesPages = data.pages;

                    //分页控件
                    worksPaging(pageIndex);

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        function getMerchantsCaseBypage(pageIndex) {
            var filters = ['verified::1'];

            var obj = {
                params: {
                    page: pageIndex,
                    filters: filters
                }
            }
            ApiService.get('/merchants/decorationCases', obj, function (data) {
                if (data.result == 'success') {
                    $scope.merchantsCases = data.content;
                    $scope.totalMerchantsCasesPages = data.pages;

                    //分页控件
                    merchantsPaging(pageIndex);

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
                        getMerchantsCaseBypage(obj.curr);
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
                    $scope.curMerchantsCasesPage = obj.curr;
                    if (!firstScreeningPagination) {
                        firstScreeningPagination = true;
                    } else {
                        getMerchantsCaseBypage(obj.curr);
                        firstScreeningPagination = false;
                    }
                }
            });
        }


    }
]);