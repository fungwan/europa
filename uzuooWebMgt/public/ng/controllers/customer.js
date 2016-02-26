'use strict';

angular.module('myApp').controller('CustomerCtrl', ['$scope', '$location', '$rootScope', 'ApiService', 'fileReader',
    function ($scope, $location, $rootScope, ApiService, fileReader) {
        $rootScope.sideBarSelect = {
            firstClassSel: 'userAdmin',
            secondSel: 'frontUsr'
        };
        $scope.initPage();

        $scope.moreLinkStr = '更多搜索条件';
        $scope.moreLink = true;


        $scope.cityArray = [];                               //城市列表
        $scope.regionArray = [];                             //所有区域列表
        $scope.originalRoles = [];                          //大工种列表

        $scope.totalWorkersPages = 1;                   //工人的总页数
        $scope.curWorkersPage = 1;                   //工人的当前页
        $scope.workersInfo = [];                            //工人信息
        
        $scope.imageSrc = $rootScope.defaultVerifiedImg;
        var filters, houseOwnerfilters = ['all'];


        $scope.workSearchFilter = {
            keyword: 'phone',
            keywordValue: '',
            verified: 'all',
            provinceSel: {},                         //详细搜索时选择的省份
            citySel: {},                         //详细搜索时选择的城市
            regionSelArray: [],                      //城市的区域列表
            originalRoleSel: {},                 //多选大工种
            craftsArray: [],                      //细分工种
        }

        $scope.houseOnwerSearchFilter = {
            keyword:'nick_name',
            keywordValue:''
        }

        //工人详细信息
        $scope.selectWorker = {};


        $scope.onSearch = function () {
            filters = [];
            //var filters = ["all"];
            if ($scope.workSearchFilter.verified !== 'all') {
                var verifiedFilterStr = 'verified::' + $scope.workSearchFilter.verified;
                filters.push(verifiedFilterStr);
            }
            
            if ($scope.workSearchFilter.keywordValue !== '') {
                var keywordFilterStr = $scope.workSearchFilter.keyword + '::' + $scope.workSearchFilter.keywordValue;
                filters.push(keywordFilterStr);
            }



            if (!$scope.moreLink) {
                if ($scope.workSearchFilter.provinceSel.id) {

                }
                if ($scope.workSearchFilter.citySel.id) {
                    var cityFilterStr = 'city::' + $scope.workSearchFilter.citySel.id;
                    filters.push(cityFilterStr);
                }
                var selectRegion = [];
                if ($scope.workSearchFilter.regionSelArray.length != 0) {
                    for (var i = 0; i < $scope.workSearchFilter.regionSelArray.length; i++) {
                        if($scope.workSearchFilter.regionSelArray[i].selected) {
                            selectRegion.push($scope.workSearchFilter.regionSelArray[i]);
                        }
                    };
                }
                if (selectRegion.length != 0) {
                    var regionStr = selectRegion[0].id;
                    for (var i = 1; i < selectRegion.length; i++) {
                        regionStr = regionStr + '|' + selectRegion[i].id;
                    };
                    var regionFilterStr = 'regions::' +regionStr;
                    filters.push(regionFilterStr);
                }
                if ($scope.workSearchFilter.originalRoleSel.id) {
                    var roleFilterStr = 'roles::' + $scope.workSearchFilter.originalRoleSel.id;
                    filters.push(roleFilterStr);
                }
                var selectCrafts = [];
                if ($scope.workSearchFilter.craftsArray.length != 0) {
                    for (var i = 0; i < $scope.workSearchFilter.craftsArray.length; i++) {
                        if($scope.workSearchFilter.craftsArray[i].selected) {
                            selectCrafts.push($scope.workSearchFilter.craftsArray[i]);
                        }
                    };
                }
                if (selectCrafts.length != 0) {
                    var craftStr = selectCrafts[0].id;
                    for (var i = 1; i < selectCrafts.length; i++) {
                        craftStr = craftStr + '|' + selectCrafts[i].id;
                    };
                    var craftFilterStr = 'crafts::' + craftStr;
                    filters.push(craftFilterStr);
                };
            }

            if (filters.length == 0) {
                filters = ['all'];
            };

            getWorkersBypage(1);
        }

        $scope.onHouseOwnerSearch = function () {
            houseOwnerfilters = ['all'];
            if ($scope.houseOnwerSearchFilter.keywordValue) {
                var filterStr = $scope.houseOnwerSearchFilter.keyword + '::' + $scope.houseOnwerSearchFilter.keywordValue;
                houseOwnerfilters = [filterStr];
            }
            getHouseOwnerBypage (1);
        }

        $scope.onClickMore = function () {
            $scope.moreLink = !$scope.moreLink;
            if ($scope.moreLink) {
                $scope.moreLinkStr = '更多搜索条件';
            } else {
                $scope.moreLinkStr = '精简筛选条件';
            }
        }

        //省份选择
        $scope.onProvinceSelect = function () {
            delete $scope.cityArray;
            $scope.cityArray = $scope.workSearchFilter.provinceSel.cities;
            if ($scope.cityArray[$scope.cityArray.length - 1].id) {
                var nilCity = { name: '-- 请选择城市 --' };
                $scope.cityArray.push(nilCity);
            }
            $scope.workSearchFilter.citySel = $scope.cityArray[$scope.cityArray.length - 1];
            $scope.workSearchFilter.regionSelArray = [];
        } 
        //城市选择
        $scope.onCitySelect = function () {
            if ($scope.workSearchFilter.citySel.id) {
                $scope.workSearchFilter.regionSelArray = $scope.regionArray[$scope.workSearchFilter.citySel.id].children;
            } else {
                $scope.workSearchFilter.regionSelArray = [];
            }
        }

        $scope.originalRoleSelect = function () {
            if ($scope.workSearchFilter.originalRoleSel.id) {
                $scope.workSearchFilter.craftsArray = $scope.workSearchFilter.originalRoleSel.crafts;
            } else {
                $scope.workSearchFilter.craftsArray = [];
            }
        }

        //翻译认证状态
        $scope.getVerifiedStatus = function (verifiedCode) {
            if (verifiedCode === 0) {
                return '未认证';
            } else if (verifiedCode === 1) {
                return '待认证';
            } else if (verifiedCode === 2) {
                return '已认证';
            } else if (verifiedCode === 3) {
                return '认证驳回';
            }
        }
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
        }

        //获取工人的工种信息
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
        }


        //编辑工人详情
        $scope.onShowMoreWorkerInfo = function (worker) {
            $('#edit_worker_dlg').modal('show');
            var city = $scope.getCityAndRegionStr(worker.regions).city;
            var workerDetailLink = worker['href'];
            var pos = workerDetailLink.lastIndexOf('/');
            var workerId = workerDetailLink.substr(pos + 1);
            $scope.selectWorker = {
                fullName: worker.first_name + worker.last_name,
                first_name: worker.first_name,
                last_name: worker.last_name,
                phone: worker.phone,
                id_card_no: worker.id_card_no,
                work_city: city,
                verified: worker.verified,
                imgHref: "images/avatar/avatar_loading.gif",
                categories: worker.categories,
                workerId: workerId
            }
            var obj = {};
            getWorkerCapitalAccount();
            ApiService.get('/workers/' + workerId, obj, function (data) {
                if (data.result == 'success') {
                    $scope.selectWorker.score = data.content.score;
                    $scope.selectWorker.imgHref = $rootScope.defaultVerifiedImg;
                    if (data.content.verify_photo)
                        $scope.selectWorker.imgHref = $rootScope.qiniuUrl + data.content.verify_photo;
                    $scope.selectWorker.selectImg = $scope.selectWorker.imgHref;
                    $scope.selectWorker.review = data.content.review;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
            //alert(detailHref);
        }

        $scope.onShowSceneVerified = function () {
            $('#verified-dialog').modal('show');
            getVerificationLogs();
        }

        $scope.onShowChargeDlg = function (accountId) {
            $scope.chargeAmount = 0;
            $scope.chargeBalance = 0;
            $scope.chargeId = accountId;
            
        }

        $scope.onChargeConfirm = function () {

            if ($scope.chargeAmount) {
                var obj = {
                    backend:'uzuoopay',
                    type:'recharge_offline',
                    account_id:$scope.chargeId,
                    amount: parseInt($scope.chargeAmount) * 100
                }
                doCharge({content:obj});
            }

            if ($scope.chargeBalance) {
                var obj = {
                    backend:'uzuoopay',
                    type:'recharge_margin_offline',
                    account_id:$scope.chargeId,
                    amount: parseInt($scope.chargeBalance) * 100
                }
                doCharge({content:obj});
            };
            
        }

        //充值函数
        function doCharge(obj) {
            ApiService.post('/paymentOrders', obj, function (data) {
                if(data.result == 'success') {
                    if($scope.selectWorker.workerId)
                        getWorkerCapitalAccount();
                    if ($scope.selectHouseOwner.houseOwnerId)
                        getHouseOwnerCapitalAccount();
                }
            }, function(errMsg){
                alert(errMsg.message);
            });
        }

        //获取工人个人账户信息
        function getWorkerCapitalAccount() {
            var url = '/workers/' + $scope.selectWorker.workerId + '/capitalAccount';
            ApiService.get(url, {}, function (data) {
                if (data.result == 'success') {
                    $scope.selectWorker.balance = data.content.balance / 100;
                    $scope.selectWorker.mBalanceOwns = data.content.margin_balance.owns / 100;
                    $scope.selectWorker.mBalanceSystem = data.content.margin_balance.system / 100;

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

        }


        //获取业主个人账户信息
        function getHouseOwnerCapitalAccount() {
            var url = '/workers/' + $scope.selectHouseOwner.houseOwnerId + '/capitalAccount';
            ApiService.get(url, {}, function (data) {
                if (data.result == 'success') {
                    $scope.selectHouseOwner.balance = data.content.balance / 100;
                    $scope.selectHouseOwner.mBalanceOwns = data.content.margin_balance.owns / 100;
                    $scope.selectHouseOwner.mBalanceSystem = data.content.margin_balance.system / 100;

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

        }


        //获取认证记录
        function getVerificationLogs() {
            var url = '/workers/' + $scope.selectWorker.workerId + '/verification_logs';
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

        //选择上传认证图片
        $scope.getFile = function () {
            fileReader.readAsDataUrl($scope.file, $scope)
                .then(function (result) {
                    $scope.selectWorker.selectImg = result;
                });
        };

        //执行现场认证
        $scope.verifiedWorker = function() {
            var obj = {
                id : $scope.selectWorker.workerId,
                content: {
                    first_name:$scope.selectWorker.first_name,
                    last_name:$scope.selectWorker.last_name,
                    id_card_no:$scope.selectWorker.id_card_no,
                    verify_photo:$scope.selectWorker.selectImg
                }
            }
            ApiService.post('/doUpdateWorkerProfileById', obj, function (data) {
                if(data.result == 'success') {

                }
                console.log(data);
            }, function(errMsg){
                alert(errMsg.message);
            });
        } 


        $scope.onShowMoreHouseInfo = function (houseOnwer) {
            $scope.selectHouseOwner = cloneObj(houseOnwer);
            var pos = houseOnwer['href'].lastIndexOf('/');
            var houseOnwerId = houseOnwer['href'].substr(pos + 1);    
            $scope.selectHouseOwner.houseOwnerId = houseOnwerId;
            $scope.selectHouseOwner.fullName = $scope.selectHouseOwner.first_name + $scope.selectHouseOwner.last_name;
            $scope.selectHouseOwner.imgHref = $rootScope.defaultVerifiedImg;
            if ($scope.selectHouseOwner.avatar)
                $scope.selectHouseOwner.imgHref = $rootScope.qiniuUrl + $scope.selectHouseOwner.avatar;
            var url = '/houseOwners/' + houseOnwerId;
            ApiService.get(url, {}, function (data) {
                if (data.result == 'success') {
                    $scope.selectHouseOwner.invitation_code = data.content.invitation_code;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });  
            getHouseOwnerCapitalAccount();  
            $('#edit_houseOwner_dlg').modal('show');  
        }
        //初始化城市列表和工人列表
        function getRoleAndRegionsInfo() {
            var obj = {};
            ApiService.get('/doGetRoleAndRegionsInfo', obj, function (data) {
                if (data.result == 'success') {
                    $scope.regionsAndRolesArray = data.content.get_roleAndRegions;
                    $scope.provinceArray = $scope.regionsAndRolesArray[0][0];
                    $scope.regionArray = $scope.regionsAndRolesArray[0][1];
                    $scope.rolesArray = $scope.regionsAndRolesArray[1];
                    $scope.originalRoles = $scope.rolesArray[0];

                    var nilProvince = { name: '-- 请选择省份 --' };
                    $scope.provinceArray.push(nilProvince);
                    $scope.workSearchFilter.provinceSel = $scope.provinceArray[$scope.provinceArray.length - 1];

                    var nilRole = { name: '-- 请选择工种 --' };
                    $scope.originalRoles.push(nilRole);
                    $scope.workSearchFilter.originalRoleSel = $scope.originalRoles[$scope.originalRoles.length - 1];

                    getWorkersBypage(1);

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }


        getRoleAndRegionsInfo();


        function getWorkersBypage(pageIndex) {
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

                    if($scope.workersInfo.length === 0 && $scope.curWorkersPage > 1){
                        getWorkersBypage($scope.curWorkersPage - 1);
                        return;
                    }

                    //分页控件
                    worksPaging(pageIndex);

                } else if (data.content == 400) {
                    $scope.workersInfo = [];
                    $scope.totalWorkersPages = 0;

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        //jequry paging controll
        function worksPaging(pageIndex) {
            var firstScreeningPagination = false;
            laypage({
                cont: $('#uzWorkerPage'),
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

        //业主tab
        $scope.currHousePage = 1;

        function getHouseOwnerBypage (pageIndex) {
            var obj = {
                params: {
                    page: pageIndex,
                    filters: houseOwnerfilters
                }
            }
            ApiService.get('/doFindHouseOwnersByPage', obj, function (data) {
                if (data.result == 'success') {
                    $scope.houseOwnersInfo = data.content;
                    $scope.totalHousesPages = data.pages;

                    if($scope.houseOwnersInfo.length === 0 && $scope.currHousePage > 1){
                        getHouseOwnerBypage($scope.currHousePage - 1);
                        return;
                    }

                    //分页控件
                    housesPaging(pageIndex);

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        //jequry paging controll
        function housesPaging(pageIndex) {
            var firstScreeningPagination = false;
            laypage({
                cont: $('#uzUserPage'),
                pages: $scope.totalHousesPages,
                skip: true,
                skin: 'yahei',
                curr: pageIndex,//view上显示的页数是索引加1
                groups: 5,
                hash: false,
                jump: function (obj) {//一定要加上first的判断，否则会一直刷新
                    $scope.currHousePage = obj.curr;
                    if (!firstScreeningPagination) {
                        firstScreeningPagination = true;
                    } else {
                        getHouseOwnerBypage(obj.curr);
                        firstScreeningPagination = false;
                    }
                }
            });
        }
        getHouseOwnerBypage($scope.currHousePage);
    }
]);