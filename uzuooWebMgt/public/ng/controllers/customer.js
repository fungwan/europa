'use strict';

angular.module('myApp').controller('CustomerCtrl', ['$scope', '$location', '$rootScope', 'ApiService', 'fileReader', '$upload',
    function ($scope, $location, $rootScope, ApiService, fileReader, $upload) {
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
        $scope.inviteesDlgType = '';                  //工人OR业主的受邀人弹框
        $scope.inviteesArray = [];
        $scope.tradDetailArray = [];
        $scope.imageSrc = $rootScope.defaultVerifiedImg;
        var filters  = ['all'], houseOwnerFilters = ['all'];

        var sendTargetObj = {
            type:'',//通知的目標人群，worker|houseOwner
            method:'',//通知的方式,針對篩選條件的群發和指定勾選的人員，mass|assign
            filter:{},//篩選條件或者account列表，依據method寫值
            msg_content:'',//消息內容
            msg_type:''//消息類型，短消息| 系統消息
        };

        var billTypeCNTranslateObj = {
            'construction':'工程款支付',
            'settle':'工程款结算',
            'withhold_margin':'抽取保证金',
            'withdraw_margin':'保证金提现',
            'recharge_margin':'保证金充值',
            'recharge_margin_offline':'保证金线下充值',
            'recharge_offline':'余额线下充值',
            'recharge':'余额充值',
            'withdraw':'余额提现',
            'refund':'退款',
            'earnest':'定金支付',
            'trustee':'托管尾款支付'
        };

        $scope.sendMsg ={
            type:'sms',
            content:''
        };

        $scope.workSearchFilter = {
            keyword: 'phone',
            keywordValue: '',
            verified: 'all',
            provinceSel: {},                         //详细搜索时选择的省份
            citySel: {},                         //详细搜索时选择的城市
            regionSelArray: [],                      //城市的区域列表
            originalRoleSel: {},                 //多选大工种
            craftsArray: []                      //细分工种
        };

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
                    }
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
                    }
                }
                if (selectCrafts.length != 0) {
                    var craftStr = selectCrafts[0].id;
                    for (var i = 1; i < selectCrafts.length; i++) {
                        craftStr = craftStr + '|' + selectCrafts[i].id;
                    };
                    var craftFilterStr = 'crafts::' + craftStr;
                    filters.push(craftFilterStr);
                }
            }

            if (filters.length == 0) {
                filters = ['all'];
            }

            getWorkersBypage(1);
        };

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
        };


        //编辑工人详情
        $scope.onShowMoreWorkerInfo = function (worker) {

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

            getWorkerDecorationCases();

            ApiService.get('/invitees/' + workerId, obj, function (data) {
                if (data.result == 'success') {
                    $scope.selectWorker.invite_Info = data.content;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

            $('#edit_worker_dlg').modal('show');
        };

        $scope.onShowSceneVerified = function () {
            $('#verified-dialog').modal('show');
            getVerificationLogs();
        }

        $scope.onShowChargeDlg = function (accountId) {
            $scope.chargeAmount = 0;
            $scope.chargeBalance = 0;
            $scope.chargeId = accountId;
            
        }

        $scope.onShowInvitees = function(type,invite_Info){

            $scope.inviteesDlgType = type;

            if( invite_Info.invitees != null){
                $scope.inviteesArray = invite_Info.invitees;
            }

            $('#edit_worker_dlg').modal('hide');
            $('#edit_houseOwner_dlg').modal('hide');

            $('#show_invitees_dlg').modal('show');

        };

        $scope.onShowDecorationCases = function(type,id){

            var url = '/workers/' + $scope.selectWorker.workerId + '/decorationCases/' + id;
            ApiService.get(url, {}, function (data) {
                if (data.result == 'success') {
                    $scope.selectWorker.casesDetailArray = data.content.items;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

            $('#edit_worker_dlg').modal('hide');
            $('#edit_houseOwner_dlg').modal('hide');

            $('#show_decorationCases_dlg').modal('show');

        };

        $scope.onBackToLastDlg = function(type){

            $('#show_invitees_dlg').modal('hide');
            $('#show_tradDetail_dlg').modal('hide');
            $('#show_decorationCases_dlg').modal('hide');

            if(type === 'worker'){
                $('#edit_worker_dlg').modal('show');
            }else if(type === 'houseOwner'){
                $('#edit_houseOwner_dlg').modal('show');
            }


        };

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
            var url = '/capitalAccount/' + $scope.selectWorker.workerId ;
            ApiService.get(url, {}, function (data) {
                if (data.result == 'success') {
                    $scope.selectWorker.balance = data.content.balance / 100;
                    $scope.selectWorker.mBalanceOwns = data.content.margin_balance.owns / 100;
                    $scope.selectWorker.mBalanceSystem = data.content.margin_balance.system / 100;
                    $scope.selectWorker.mTotalIncome = data.content.total_income / 100;

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

        }

        $scope.translateBillType = function(type){
            if(billTypeCNTranslateObj[type] === undefined){
                return type;
            }else{
                return billTypeCNTranslateObj[type];
            }
        };

        //获取对应用户的账户明细
        $scope.getCapitalDetails = function(account,accountType,userType){
            $scope.inviteesDlgType = userType;
            var id = account['workerId'];//暂时只查用户

            var url = '/capitalAccount/' + id + '/details';
            ApiService.get(url, {

                params: {
                    accountType: accountType
                }


            }, function (data) {
                if (data.result == 'success') {
                    $('#edit_worker_dlg').modal('hide');
                    $scope.tradDetailArray = data.content;
                    $('#show_tradDetail_dlg').modal('show');
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

        };

        //获取工人案例信息
        function getWorkerDecorationCases() {
            var url = '/workers/' + $scope.selectWorker.workerId + '/decorationCases';
            ApiService.get(url, {}, function (data) {
                if (data.result == 'success') {
                    $scope.selectWorker.casesArray = data.content.decoration_cases;
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
        
        $scope.onFileSelect = function ($files) {
            if ($files.length == 0) {
                return;
            }
            $scope.selectWorker.imgUploadData = $files[0];
            fileReader.readAsDataUrl($files[0], $scope)
                .then(function (result) {
                    $scope.selectWorker.selectImg = result;
                });
        }

        //执行现场认证
        $scope.verifiedWorker = function() {
            var obj = {
                id : $scope.selectWorker.workerId,
                content: {
                    first_name:$scope.selectWorker.first_name,
                    last_name:$scope.selectWorker.last_name,
                    id_card_no:$scope.selectWorker.id_card_no
                    //verify_photo:$scope.selectWorker.selectImg
                }
            }
            $upload.upload({
                url: 'api/doUpdateWorkerProfileById',
                data: {content:obj},
                file:$scope.selectWorker.imgUploadData
            }).progress(function(evt){
                alert(evt);
            }).success(function(data, status, headers, config) {
                alert(data);
            });
            /*ApiService.post('/doUpdateWorkerProfileById', obj, function (data) {
                if(data.result == 'success') {

                }
                console.log(data);
            }, function(errMsg){
                alert(errMsg.message);
            });*/
        };


        var sendFilter = [];
        $scope.onSendMsgForAllWorker = function () {
            sendTargetObj.type = 'worker';
            sendTargetObj.method = 'mass';

            /*
                遍历filter，选择推送区域/推送工种
             */

            var regionsArray = [];
            var categoriesArray = [];

            if (!$scope.moreLink) {

                if ($scope.workSearchFilter.regionSelArray.length != 0) {
                    for (var i = 0; i < $scope.workSearchFilter.regionSelArray.length; i++) {
                        if($scope.workSearchFilter.regionSelArray[i].selected) {
                            regionsArray.push($scope.workSearchFilter.regionSelArray[i].id)
                        }
                    }
                }

                var categories = {};
                if ($scope.workSearchFilter.originalRoleSel.id) {
                    categories.role_id = $scope.workSearchFilter.originalRoleSel.id;
                }
                var selectCrafts = [];
                for (var i = 0; i < $scope.workSearchFilter.craftsArray.length; i++) {
                    if($scope.workSearchFilter.craftsArray[i].selected) {
                        selectCrafts.push($scope.workSearchFilter.craftsArray[i].id);
                    }
                }

                categories.crafts = selectCrafts;

                if(categories.role_id !== undefined){
                    categoriesArray.push(categories);
                }
            }

            sendTargetObj.filter.regions = regionsArray;
            sendTargetObj.filter.categories = categoriesArray;
        };

        $scope.onSendMsgForSelectedWorker = function () {
            sendTargetObj.type = 'worker';
            sendTargetObj.method = 'assign';

            var accountArray = [];
            angular.forEach($scope.workersInfo, function (item) {
                if (item.selected) {
                    var pos = item['href'].lastIndexOf('/');
                    var accountId = item['href'].substr(pos + 1);

                    accountArray.push(accountId);
                }
            });


            sendTargetObj.filter.account_id = accountArray;//遍歷chk，此filter为id集合，不能与regions、categories一起填写
        };

        $scope.onSendMsgForAllHouseOwner = function () {

        };

        $scope.onSendMsgForSelectedHouseOwner = function () {

        };

        $scope.onSendMsg = function () {

            if(sendTargetObj.method === 'mass'){
                if(sendTargetObj.filter.regions.length === 0 || sendTargetObj.filter.categories.length === 0){
                    alert('请选择发送区域或者发送工种!');
                    return;
                }
            }

            if(sendTargetObj.method === 'assign'){
                if(sendTargetObj.filter.account_id.length === 0){
                    alert('请选择要推送的工人!');
                    return;
                }
            }


            sendTargetObj.msg_type = $scope.sendMsg.type;
            sendTargetObj.msg_content = $scope.sendMsg.content;

            ApiService.post('/notifications', {
                content:sendTargetObj
            }, function (data) {
                if(data.result == 'fail') {
                    alert('通知发送失败，请重发！');
                }
            }, function(errMsg){
                alert(errMsg.message);
            });
        };

        function getWorkersBypage(pageIndex) {
            var obj = {
                params: {
                    page: pageIndex,
                    filters: filters
                }
            };
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

        $scope.houseOnwerSearchFilter = {
            keyword:'nick_name',
            keywordValue:''
        };

        $scope.onHouseOwnerSearch = function () {
            houseOwnerFilters = ['all'];
            if ($scope.houseOnwerSearchFilter.keywordValue) {
                var filterStr = $scope.houseOnwerSearchFilter.keyword + '::' + $scope.houseOnwerSearchFilter.keywordValue;
                houseOwnerFilters = [filterStr];
            }
            getHouseOwnerBypage (1);
        };

        //获取业主个人账户信息
        function getHouseOwnerCapitalAccount() {
            var url = '/capitalAccount/' + $scope.selectHouseOwner.houseOwnerId;
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

        function getHouseOwnerBypage (pageIndex) {
            var obj = {
                params: {
                    page: pageIndex,
                    filters: houseOwnerFilters
                }
            }
            ApiService.get('/houseOwners', obj, function (data) {
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

            ApiService.get('/invitees/' + houseOnwerId, {}, function (data) {
                if (data.result == 'success') {
                    $scope.selectHouseOwner.invite_Info = data.content;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

            $('#edit_houseOwner_dlg').modal('show');
        };


        //商家tab
        var currMerchantPage = 1,totalMerchantsPages;
        var merchantFilters = ['all'];

        $scope.merchantsSearchFilter = {
            verified:'all'
        };

        $scope.onMerchantsSearch = function () {
            merchantFilters = [];
            if ($scope.merchantsSearchFilter.verified !== 'all') {
                var verifiedFilterStr = 'verified::' + $scope.merchantsSearchFilter.verified;
                merchantFilters.push(verifiedFilterStr);
            }

            if (merchantFilters.length == 0) {
                merchantFilters = ['all'];
            }

            getMerchantsByPage (1);
        };

        //翻译商家认证状态
//        $scope.getMerchantVerifiedStatus = function (verifiedCode) {
//            if (verifiedCode === 0) {
//                return '未认证';
//            } else if (verifiedCode === 1) {
//                return '已认证';
//            } else if (verifiedCode === 2) {
//                return '认证驳回';
//            } else if (verifiedCode === 3) {
//                return '待认证';
//            }
//        };

        function getMerchantsByPage (pageIndex) {
            var obj = {
                params: {
                    page: pageIndex,
                    filters: merchantFilters
                }
            };
            ApiService.get('/merchants', obj, function (data) {
                if (data.result == 'success') {
                    $scope.merchantsInfoArray = data.content;
                    totalMerchantsPages = data.pages;

                    if($scope.merchantsInfoArray.length === 0 && currMerchantPage > 1){
                        getMerchantsByPage(currMerchantPage - 1);
                        return;
                    }

                    //分页控件
                    merchantsPaging(pageIndex);

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        function merchantsPaging(pageIndex) {
            var firstScreeningPagination = false;
            laypage({
                cont: $('#uzBusinessPage'),
                pages: totalMerchantsPages,
                skip: true,
                skin: 'yahei',
                curr: pageIndex,//view上显示的页数是索引加1
                groups: 5,
                hash: false,
                jump: function (obj) {//一定要加上first的判断，否则会一直刷新
                    currMerchantPage = obj.curr;
                    if (!firstScreeningPagination) {
                        firstScreeningPagination = true;
                    } else {
                        getMerchantsByPage(obj.curr);
                        firstScreeningPagination = false;
                    }
                }
            });
        }

        //获取商家的商家类别信息
        $scope.getMerchantCategoryStr = function (categories) {
            if (!categories)
                return;
            var firstStr, secondStr = '';
            if (categories[0]) {
                firstStr = $scope.merchantRolesArray[1][categories[0].role_id].name
            }
            if (categories[1]) {
                secondStr = $scope.merchantRolesArray[1][categories[1].role_id].name
            }
            return {
                first: firstStr,
                second: secondStr
            }
        };

        //获取业主个人账户信息
        function getMerchantCapitalAccount() {
            var url = '/capitalAccount/' + $scope.selectMerchant.merchantId;
            ApiService.get(url, {}, function (data) {
                if (data.result == 'success') {
                    $scope.selectMerchant.balance = data.content.balance / 100;
                    $scope.selectMerchant.mBalanceOwns = data.content.margin_balance.owns / 100;
                    $scope.selectMerchant.mBalanceSystem = data.content.margin_balance.system / 100;
                    $scope.selectMerchant.mTotalIncome = data.content.total_income / 100;

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

        }

        $scope.onShowMerchantDetailInfo = function (merchant) {
            var city = $scope.getCityAndRegionStr(merchant.regions).city;
            var detailLink = merchant['href'];
            var pos = detailLink.lastIndexOf('/');
            var merchantId = detailLink.substr(pos + 1);
            $scope.selectMerchant = {
                fullName: merchant.first_name + merchant.last_name,
                first_name: merchant.first_name,
                last_name: merchant.last_name,
                phone: merchant.phone,
                id_card_no: merchant.id_card_no,
                work_city: city,
                verified: merchant.verified,
                imgHref: "images/avatar/avatar_loading.gif",
                categories: merchant.categories,
                merchantId: merchantId
            };

            getMerchantCapitalAccount();

            var obj = {};
            ApiService.get('/merchants/' + merchantId, obj, function (data) {
                if (data.result == 'success') {
                    $scope.selectMerchant.score = data.content.score;
                    $scope.selectMerchant.imgHref = $rootScope.defaultVerifiedImg;
                    if (data.content.verify_photo)
                        $scope.selectMerchant.imgHref = $rootScope.qiniuUrl + data.content.verify_photo;
                    $scope.selectMerchant.selectImg = $scope.selectMerchant.imgHref;
                    $scope.selectMerchant.review = data.content.review;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

            $('#edit_merchant_dlg').modal('show');
        };

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

                    $scope.merchantRolesArray = $scope.regionsAndRolesArray[2];
                    $scope.originalMerchantRoles = $scope.merchantRolesArray[0];

                    var nilProvince = { name: '-- 请选择省份 --' };
                    $scope.provinceArray.push(nilProvince);
                    $scope.workSearchFilter.provinceSel = $scope.provinceArray[$scope.provinceArray.length - 1];

                    var nilRole = { name: '-- 请选择工种 --' };
                    $scope.originalRoles.push(nilRole);
                    $scope.workSearchFilter.originalRoleSel = $scope.originalRoles[$scope.originalRoles.length - 1];

                    getWorkersBypage(1);
                    getMerchantsByPage(1);
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        getRoleAndRegionsInfo();

    }
]);