'use strict';

angular.module('myApp').controller('VerifiedCustomerCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel:'verifiedAdmin',
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
                categories:worker.categories,
                regions:worker.regions,
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

                } else if(data.content === 'Permission Denied'){
                    window.location.href="/permissionError";
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }


        $scope.getCategoryStr = function (categories) {
            if (!categories)
                return;
            var firstStr, secondStr = '';
            if (categories[0]) {
                firstStr = $scope.rolesArray[1][categories[0].role_id].name
            }
            if (categories[1]) {
                secondStr = $scope.rolesArray[1][categories[1].role_id].name
            }
            return {
                firt: firstStr,
                second: secondStr
            }
        };


        //获取工人的城市和区域信息
        $scope.getCityAndRegionStr = function (regionArray) {
            var regionsStr = '';
            var cityStr = '';
            for (var x in regionArray) {
                regionsStr += $scope.regionArray[regionArray[x]].name + ' ';
                cityStr = $scope.regionArray[regionArray[x]].parent;
            }
            return {
                regions: regionsStr,
                city: cityStr
            }
        };



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
                };
                ApiService.post('/workers/verificationStatus', obj, function (data) {
                    $("#verified_worker_dlg").modal("hide");
                    getWorkersBypage($scope.curWorkersPage);
                }, function (errMsg) {
                    alert(errMsg.message);
                });
            }
        }



        $scope.merchantsInfoArray = [];
        $scope.selectMerchant={};
        var totalMerchantsPages = 1,curMerchantPage=1;

        function merchantsPaging(pageIndex) {
            var firstScreeningPagination = false;
            laypage({
                cont: $('#todoVerifiedMerchantPage'),
                pages: totalMerchantsPages,
                skip: true,
                skin: 'yahei',
                curr: pageIndex,//view上显示的页数是索引加1
                groups: 5,
                hash: false,
                jump: function (obj) {//一定要加上first的判断，否则会一直刷新
                    curMerchantPage = obj.curr;
                    if (!firstScreeningPagination) {
                        firstScreeningPagination = true;
                    } else {
                        getMerchantBypage(obj.curr);
                        firstScreeningPagination = false;
                    }
                }
            });
        }

        function getMerchantBypage(pageIndex) {
            var filters = ['verified::1'];

            var obj = {
                params: {
                    page: pageIndex,
                    filters: filters
                }
            }
            ApiService.get('/merchants', obj, function (data) {
                if (data.result == 'success') {
                    $scope.merchantsInfoArray = data.content;
                    $scope.totalWorkersPages = data.pages;

                    //分页控件
                    merchantsPaging(pageIndex);

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        //获取商家的商家类别信息
        $scope.getMerchantCategoryStr = function (categories) {
            if (!categories)
                return;
            var firstStr, secondStr = '';
            if (categories[0]) {
                firstStr = $scope.merchantRolesArray[1][categories[0].role_id].name
                //console.log(firstStr);
            }

            return {
                first: firstStr,
                second: secondStr
            }
        };

        $scope.onShowMerchantVerifiedDlg = function (merchant) {

            $('#verified_merchant_dlg').modal('show');
            var merchantDetailLink = merchant['href'];
            var pos = merchantDetailLink.lastIndexOf('/');
            var merchantId = merchantDetailLink.substr(pos + 1);
            $scope.selectMerchant = {
                first_name: merchant.first_name,
                last_name: merchant.last_name,
                phone: merchant.phone,
                id_card_no: merchant.id_card_no,
                verified: merchant.verified,
                imgHref1: "images/avatar/avatar_loading.gif",
                imgHref2: "images/avatar/avatar_loading.gif",
                categories:merchant.categories,
                regions:merchant.regions,
                merchantId: merchantId,
                virifiedDescriptive:''
            };

            ApiService.get('/merchants/' + merchantId, {}, function (data) {
                if (data.result == 'success') {
                    $scope.selectMerchant.imgHref = $rootScope.defaultVerifiedImg;
                    if (data.content.verify_photo.length>0) {
                        $scope.selectMerchant.imgHref1 = $rootScope.qiniuUrl + data.content.verify_photo[0];
                        $scope.selectMerchant.imgHref2 = $rootScope.qiniuUrl + data.content.verify_photo[1];
                    }
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
            var url = '/merchants/' + merchantId + '/verification_logs';
            ApiService.get(url, {}, function (data) {
                if (data.result == 'success') {
                    $scope.selectMerchant.verifiedLogsArray = data.content;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        };


        $scope.onRejectVerifyMerchant = function () {
            verifiedMerchant([$scope.selectMerchant.merchantId],3,$scope.selectMerchant.virifiedDescriptive);
        };

        $scope.onVerifyMerchant = function () {
            var msg = '恭喜您已通过悠住认证，请登录app发布商品和案例吧~';
            verifiedMerchant([$scope.selectMerchant.merchantId],2,msg);
        };


        function verifiedMerchant(idArray,isVerified,msg){

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
                };
                ApiService.post('/merchants/verificationStatus', obj, function (data) {
                    $("#verified_merchant_dlg").modal("hide");
                    getMerchantBypage(curMerchantPage);
                }, function (errMsg) {
                    alert(errMsg.message);
                });
            }
        }

        function getRoleAndRegionsInfo() {
            var obj = {};
            ApiService.get('/doGetRoleAndRegionsInfo', obj, function (data) {
                if (data.result == 'success') {
                    $scope.regionsAndRolesArray = data.content.get_roleAndRegions;
                    $scope.provinceArray = $scope.regionsAndRolesArray[0][0];
                    $scope.regionArray = $scope.regionsAndRolesArray[0][1];
                    $scope.rolesArray = $scope.regionsAndRolesArray[1];
                    $scope.originalRoles = $scope.rolesArray[0];
                    $scope.merchantRolesArray = $scope.regionsAndRolesArray[2];
                    $scope.originalMerchantRoles = $scope.merchantRolesArray[0];

                    getWorkersBypage($scope.curWorkersPage);
                    getMerchantBypage(curMerchantPage);
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        getRoleAndRegionsInfo();
    }
]);