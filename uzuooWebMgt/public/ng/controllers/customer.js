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

        $scope.tradDetailType = '';

        $scope.cityArray = [];                               //城市列表
        $scope.regionArray = [];                             //所有区域列表
        $scope.regionChkAll = false;
        $scope.originalRoles = [];                          //大工种列表

        $scope.totalWorkersPages = 1;                   //工人的总页数
        $scope.curWorkersPage = 1;                   //工人的当前页
        $scope.workersInfo = [];                            //工人信息
        $scope.secPopDlgType = '';                  //二级弹框
        $scope.inviteesArray = [];
        $scope.tradDetailArray = [];
        $scope.imageSrc = $rootScope.defaultVerifiedImg;
        var filters  = ['all'], houseOwnerFilters = ['all'],merchantFilters = ['all'];

        var billTypeCNTranslateObj = {
            'construction':'工程款支付',
            'cash_back':'返现',
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
            'trustee':'托管尾款支付',
            'giving_ubeans':'系统赠送现金券',
            'use_ubeans':'现金券支付',
            'giving_margin':'系统赠送保证金'
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


        $scope.onWorkerExactSearch = function () {

            filters = [];

            if ($scope.workSearchFilter.keywordValue !== '') {
                var keywordFilterStr = $scope.workSearchFilter.keyword + '::' + $scope.workSearchFilter.keywordValue;
                filters.push(keywordFilterStr);
                getWorkersBypage(1);
            }
        };

        $scope.onSearch = function () {
            filters = [];
            if ($scope.workSearchFilter.verified !== 'all') {
                var verifiedFilterStr = 'verified::' + $scope.workSearchFilter.verified;
                filters.push(verifiedFilterStr);
            }
            
//            if ($scope.workSearchFilter.keywordValue !== '') {
//                var keywordFilterStr = $scope.workSearchFilter.keyword + '::' + $scope.workSearchFilter.keywordValue;
//                filters.push(keywordFilterStr);
//            }



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

            if(typeof(regionArray) === 'string'){

                return {
                    regions: '',
                    city: $scope.regionArray[regionArray].name
                }

            }


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
                    $scope.selectWorker.statement = data.content.statement;
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
            getVerificationLogs('worker');
        };

        $scope.onShowSceneVerifiedM = function () {
            $('#verified-dialogM').modal('show');
            getVerificationLogs('merchant');
        };

        $scope.onShowChargeDlg = function (accountId) {
            $scope.chargeAmount = 0;
            $scope.chargeBalance = 0;
            $scope.chargeId = accountId;
            
        }

        $scope.onShowInvitees = function(type,invite_Info){

            $scope.secPopDlgType = type;

            if( invite_Info.invitees != null){
                $scope.inviteesArray = invite_Info.invitees;
            }else{
                $scope.inviteesArray = [];
            }

            $('#edit_worker_dlg').modal('hide');
            $('#edit_houseOwner_dlg').modal('hide');

            $('#show_invitees_dlg').modal('show');

        };

        $scope.onShowDecorationCases = function(type,id){

            $('#edit_worker_dlg').modal('hide');
            $('#edit_houseOwner_dlg').modal('hide');
            $('#edit_merchant_dlg').modal('hide');

            if(type === 'worker'){

                $('#show_decorationCases_dlg').modal('show');

                var url = '/workers/' + $scope.selectWorker.workerId + '/decorationCases/' + id;
                ApiService.get(url, {}, function (data) {
                    if (data.result == 'success') {
                        $scope.selectWorker.casesDetailArray = data.content.items;
                    }
                }, function (errMsg) {
                    alert(errMsg.message);
                });
            }else if(type === 'merchant'){

                $('#show_merchantDecorationCases_dlg').modal('show');

                var url = '/merchants/' + $scope.selectMerchant.merchantId + '/decorationCases/' + id;
                ApiService.get(url, {}, function (data) {
                    if (data.result == 'success') {
                        $scope.selectMerchant.casesDetailArray = data.content.items;
                    }
                }, function (errMsg) {
                    alert(errMsg.message);
                });
            }
        };

        $scope.onBackToLastDlg = function(type){

            $('#show_invitees_dlg').modal('hide');
            $('#show_tradDetail_dlg').modal('hide');

            if(type === 'worker'){
                $('#show_decorationCases_dlg').modal('hide');
                $('#edit_worker_dlg').modal('show');
            }else if(type === 'houseOwner'){
                $('#edit_houseOwner_dlg').modal('show');
            }else if(type === 'merchant'){
                $('#show_merchantDecorationCases_dlg').modal('hide');
                $('#edit_merchant_dlg').modal('show');
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
            ApiService.post('/capitalAccount/paymentOrders', obj, function (data) {
                if(data.result == 'success') {
                    if($scope.selectWorker.workerId)
                        getWorkerCapitalAccount();
                    if ($scope.selectHouseOwner.houseOwnerId)
                        getHouseOwnerCapitalAccount();
                }else if(data.content === 'Permission Denied'){
                    alert('该用户无权执行线下充值动作...');
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

        //获取对应用户的账户余额明细
        $scope.getCapitalDetails = function(account,accountType,userType){


            //accountType表示是哪种账户类型，保证金明细还是余额明细等

            $scope.secPopDlgType = userType;
            var id = '';

            if(userType === 'worker'){
                id = account['workerId'];
            }else if(userType === 'houseOwner'){
                id = account['houseOwnerId'];
            }else if(userType === 'merchant'){
                id = account['merchantId'];
            }

            var url = '';
            var obj = {};

            if(accountType === 'capital'){//余额明细

                $scope.tradDetailType = '余额';
                url = '/capitalAccount/' + id + '/details';

                var filterStr = '';
                if(userType === 'worker' || userType === 'merchant'){
                    filterStr = 'type::withhold_margin|recharge_margin|recharge_offline|refund|recharge|withdraw|cash_back|construction|earnest|settle';
                }else{
                    filterStr = 'all';
                }
                obj['params'] = {
                    accountType: accountType,
                    filter:filterStr
                };
            }else if(accountType === 'totalIncome'){

                $scope.tradDetailType = '累积收入';
                url = '/capitalAccount/' + id + '/details';

                var filterStr = '';
                if(userType === 'worker' || userType === 'merchant'){
                    filterStr = 'type::recharge|cash_back|construction|earnest|settle';
                }else{
                    filterStr = 'all';
                }
                obj['params'] = {
                    accountType: 'capital',
                    filter:filterStr
                };

            }else if(accountType === 'margin'){

                $scope.tradDetailType = '保证金';
                url = '/capitalAccount/' + id + '/margins/details';
            }else if(accountType === 'ubean'){

                $scope.tradDetailType = '现金券';
                url = '/capitalAccount/' + id + '/ubeans/details';
            }


            ApiService.get(url, obj, function (data) {
                if (data.result == 'success') {
                    $('#edit_worker_dlg').modal('hide');
                    $('#edit_houseOwner_dlg').modal('hide');
                    $('#edit_merchant_dlg').modal('hide');
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

        //获取商家案例信息
        function getMerchantDecorationCases() {
            var url = '/merchants/' + $scope.selectMerchant.merchantId + '/decorationCases';
            ApiService.get(url, {}, function (data) {
                if (data.result == 'success') {
                    $scope.selectMerchant.casesArray = data.content.decoration_cases;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

        }

        //获取商家商品信息
        function getMerchantMerchandise() {
            var url = '/merchants/' + $scope.selectMerchant.merchantId + '/merchandise';
            ApiService.get(url, {}, function (data) {
                if (data.result == 'success') {
                    $scope.selectMerchant.merchandiseArray = data.content.merchandises;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

        }

        //获取认证记录
        function getVerificationLogs(type) {

            if(type === 'worker'){
                var url = '/workers/' + $scope.selectWorker.workerId + '/verification_logs';
                ApiService.get(url, {}, function (data) {
                    if (data.result == 'success') {
                        $scope.selectWorker.verifiedLogsArray = data.content;
                    }
                }, function (errMsg) {
                    alert(errMsg.message);
                });
            }else if(type === 'merchant'){
                var url = '/merchants/' + $scope.selectMerchant.merchantId + '/verification_logs';
                ApiService.get(url, {}, function (data) {
                    if (data.result == 'success') {
                        $scope.selectMerchant.verifiedLogsArray = data.content;
                    }
                }, function (errMsg) {
                    alert(errMsg.message);
                });
            }

        }


        $scope.verifyStatus = function (status) {
            return (status == 2) ? '成功' : '失败';
        };

        //选择上传认证图片
        /*$scope.getFile = function () {
            fileReader.readAsDataUrl($scope.file, $scope)
                .then(function (result) {
                    $scope.selectWorker.selectImg = result;
                });
        };*/
        
        $scope.onFileSelect = function ($files) {
            if ($files.length == 0) {
                return;
            }
            $scope.selectWorker.imgUploadData = $files[0];
            fileReader.readAsDataUrl($files[0], $scope)
                .then(function (result) {
                    $scope.selectWorker.selectImg = result;
                });
        };

        $scope.onFileMultiSelect = function ($files) {
            if ($files.length == 0) {
                return;
            }
            $scope.selectMerchant.imgUploadData = $files;
            fileReader.readAsDataUrl($files[0], $scope)
                .then(function (result) {
                    $scope.selectMerchant.selectImg1 = result;
                });

            fileReader.readAsDataUrl($files[1], $scope)
                .then(function (result) {
                    $scope.selectMerchant.selectImg2 = result;
                });
        };

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
                //alert(data);
            });

        };

        //商家执行现场认证
        $scope.verifiedMerchant = function() {
            var obj = {
                content: {
                    name:$scope.selectMerchant.shop_name
                }
            };

            if($scope.selectMerchant.imgUploadData === undefined || $scope.selectMerchant.imgUploadData.length !== 2){
                alert('现场认证请上传完整图片，商家图片和门店图片缺一不可!');
            }else{
                $upload.upload({
                    url: 'api/merchants/'+$scope.selectMerchant.merchantId+'/verification',
                    data: {content:obj},
                    file:$scope.selectMerchant.imgUploadData//Array[]
                }).progress(function(evt){
                    alert(evt);
                }).success(function(data, status, headers, config) {
                    //alert(data);
                });
            }
        };

        var sendTargetObj = {
            type:'',//通知的目標人群，worker|houseOwner
            method:'',//通知的方式,針對篩選條件的群發和指定勾選的人員，mass|assign
            filter:{},//篩選條件或者account列表，依據method寫值
            msg_content:'',//消息內容
            msg_type:''//消息類型，短消息| 系統消息
        };

        $scope.onSendMsgForAllWorker = function () {
            sendTargetObj.type = 'worker';
            sendTargetObj.method = 'mass';

            /*
                遍历filter，选择推送区域/推送工种
             */

            var regionsArray = [];
            var categoriesArray = [];

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

                if(sendTargetObj.filter.regions.length === 0 && sendTargetObj.filter.categories.length === 0){
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

                } else if(data.content === 'Permission Denied'){
                    window.location.href="/permissionError";
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
            keyword:'phone',
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
                    $scope.selectHouseOwner.ubeans = data.content.ubeans / 100;
                    $scope.selectHouseOwner.mBalanceOwns = data.content.margin_balance.owns / 100;
                    $scope.selectHouseOwner.mBalanceSystem = data.content.margin_balance.system / 100;

                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

        }

        /*
            Attention！new function about create users has been added by fungwan at 2016.4.13.
         */
        $scope.newUserInfo = {
            password:'',
            confirm_pw:'',
            phone:''
        };

        $scope.createUser = function(){

            var reg = /^(13[0-9]|14[0-9]|15[0-9]|17[0,7]|18[0-9])\d{8}$/;
            if (!reg.test($scope.newUserInfo.phone)) {
                alert('电话号码为必填项，且必须符合正确格式！');
            }else{

                if($scope.newUserInfo.password !== $scope.newUserInfo.confirm_pw){
                    alert('密码输入不一致');
                }else{
                    var filter = 'phone::' + $scope.newUserInfo.phone;
                    var tmp = [];
                    tmp.push(filter);
                    var obj = {
                        params: {
                            page: 1,
                            filters: tmp
                        }
                    }
                    ApiService.get('/houseOwners', obj, function (data) {
                        if (data.result == 'success') {
                            if(data.content.length !== 0){
                                alert('该用户已经存在');
                            }else{
                                ApiService.post('/houseOwners', {
                                    phone:$scope.newUserInfo.phone,
                                    password:$scope.newUserInfo.password
                                }, function (data) {
                                    if(data.result == 'fail') {
                                        alert('创建用户失败');
                                    }else{

                                        $scope.newUserInfo['password'] = '';
                                        $scope.newUserInfo['confirm_pw'] = '';
                                        $scope.newUserInfo['phone'] = '';

                                        getHouseOwnerBypage($scope.currHousePage);

                                        $("#modal-createUser-dlg").modal("hide");
                                    }
                                }, function(errMsg){
                                    alert(errMsg.message);
                                });
                            }
                        }
                    }, function (errMsg) {
                        alert(errMsg.message);
                    });
                }
            }
        };

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
        $scope.moreLinkStrM = '更多搜索条件';
        $scope.moreLinkM = true;


        $scope.originalRolesM = [];                          //商家第一类别列表

        $scope.merchantSearchFilter = {
            keyword: 'phone',
            keywordValue: '',
            verified:'all',
            originalRoleSel: {},                 //多选大工种
            craftsArray: []                      //细分工种
        };

        $scope.onSearchM = function () {
            merchantFilters = [];
            if ($scope.merchantSearchFilter.verified !== 'all') {
                var verifiedFilterStr = 'verified::' + $scope.merchantSearchFilter.verified;
                merchantFilters.push(verifiedFilterStr);
            }

            if (!$scope.moreLinkM) {

                var selectRegion = [];
                if ($scope.merchantSearchFilter.regionSelArray.length != 0) {
                    for (var i = 0; i < $scope.merchantSearchFilter.regionSelArray.length; i++) {
                        if($scope.merchantSearchFilter.regionSelArray[i].selected) {
                            selectRegion.push($scope.merchantSearchFilter.regionSelArray[i]);
                        }
                    }
                }
                if (selectRegion.length != 0) {
                    var regionStr = selectRegion[0].id;
                    for (var i = 1; i < selectRegion.length; i++) {
                        regionStr = regionStr + '|' + selectRegion[i].id;
                    };
                    var regionFilterStr = 'regions::' +regionStr;
                    merchantFilters.push(regionFilterStr);
                }
                if ($scope.merchantSearchFilter.originalRoleSel.id) {
                    var roleFilterStr = 'roles::' + $scope.merchantSearchFilter.originalRoleSel.id;
                    merchantFilters.push(roleFilterStr);
                }
                var selectCrafts = [];
                if ($scope.merchantSearchFilter.craftsArray.length != 0) {
                    for (var i = 0; i < $scope.merchantSearchFilter.craftsArray.length; i++) {
                        if($scope.merchantSearchFilter.craftsArray[i].selected) {
                            selectCrafts.push($scope.merchantSearchFilter.craftsArray[i]);
                        }
                    }
                }
                if (selectCrafts.length != 0) {
                    var craftStr = selectCrafts[0].id;
                    for (var i = 1; i < selectCrafts.length; i++) {
                        craftStr = craftStr + '|' + selectCrafts[i].id;
                    };
                    var craftFilterStr = 'crafts::' + craftStr;
                    merchantFilters.push(craftFilterStr);
                }
            }

            if (merchantFilters.length == 0) {
                merchantFilters = ['all'];
            }

            getMerchantsByPage (1);
        };


        $scope.onMerchantExactSearch = function () {

            merchantFilters = [];
            if ($scope.merchantSearchFilter.keywordValue !== '') {
                var keywordFilterStr = $scope.merchantSearchFilter.keyword + '::' + $scope.merchantSearchFilter.keywordValue;
                merchantFilters.push(keywordFilterStr);
                getMerchantsByPage(1);
            }
        };

        $scope.originalRoleSelectM = function () {
            if ($scope.merchantSearchFilter.originalRoleSel.id) {
                $scope.merchantSearchFilter.craftsArray = $scope.merchantSearchFilter.originalRoleSel.crafts;
            } else {
                $scope.merchantSearchFilter.craftsArray = [];
            }
        }

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

        $scope.onClickMoreM = function () {
            $scope.moreLinkM = !$scope.moreLinkM;
            if ($scope.moreLinkM) {
                $scope.moreLinkStrM = '更多搜索条件';
            } else {
                $scope.moreLinkStrM = '精简筛选条件';
            }
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

        $scope.originalRoleSelectM = function () {
            if ($scope.merchantSearchFilter.originalRoleSel.id) {
                $scope.merchantSearchFilter.craftsArray = $scope.merchantSearchFilter.originalRoleSel.crafts;
            } else {
                $scope.merchantSearchFilter.craftsArray = [];
            }
        }

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
                    if (data.content.verify_photo.length > 0){
                        $scope.selectMerchant.imgHref = $rootScope.qiniuUrl + data.content.verify_photo[0];
                        $scope.selectMerchant.selectImg1 = $rootScope.qiniuUrl + data.content.verify_photo[0];
                        $scope.selectMerchant.selectImg2 = $rootScope.qiniuUrl + data.content.verify_photo[1];
                    }

                    $scope.selectMerchant.review = data.content.review;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

            getMerchantDecorationCases();
            getMerchantMerchandise();

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

                    var cityStr = $rootScope.userInfo.city;
                    var cityId  = cityStr.substr(cityStr.indexOf(',')+1,cityStr.length);
                    $scope.workSearchFilter.regionSelArray = $scope.regionArray[cityId].children;
                    $scope.merchantSearchFilter.regionSelArray = $scope.regionArray[cityId].children;

                    var nilRole = { name: '-- 请选择工种 --' };
                    $scope.originalRoles.push(nilRole);
                    $scope.workSearchFilter.originalRoleSel = $scope.originalRoles[$scope.originalRoles.length - 1];

                    var nilRoleM = { name: '-- 请选择商家类别 --' };
                    $scope.originalMerchantRoles.push(nilRoleM);
                    $scope.merchantSearchFilter.originalRoleSel = $scope.originalMerchantRoles[$scope.originalMerchantRoles.length - 1];

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