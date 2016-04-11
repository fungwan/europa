'use strict';

angular.module('myApp').controller('BillsCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel:'billAdmin',
            secondSel:'bills'
        };

        $scope.billsArray = [];
        $scope.billInfo = {};//选中查看的财务明细信息
        $scope.cityArray = [];                               //城市列表
        $scope.regionArray = [];                             //所有区域列表
        $scope.originalRoles = [];                          //大工种列表
        var filters  = ['all'];
        $scope.searchFilter = {
            phone:'',
            payType:'all'
        };
        var totalBillsPages = 1,curBillPage=1;

        //支付项
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

        //系统账户
        var tradeTypeCNTranslateObj = {
            'UzuooBasicCommission':'基础佣金账户',
            'UzuooFloatCommission':'绩效佣金账户',
            'UzuooTrusteedEarnest':'托管定金账户',
            'UzuooTrusteedFinalPayment':'托管尾款账户'
        };


        $scope.onExactSearch = function () {

            filters = [];
            if ($scope.searchFilter.phone !== '') {
                var keywordFilterStr = 'phone::' + $scope.searchFilter.phone;
                filters.push(keywordFilterStr);
                getBillsInfo(1,filters);
            }
        };

        $scope.onSearch = function () {

            filters = [];
            if ($scope.searchFilter.payType !== ''&& $scope.searchFilter.payType !== 'all') {
                var keywordFilterStr = 'type::' + $scope.searchFilter.payType;
                filters.push(keywordFilterStr);
                getBillsInfo(1,filters);
            }else{
                getBillsInfo(1,['all']);
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

                    getBillsInfo(1,['all']);

                }
            }, function (errMsg) {
                alert(errMsg);
            });
        }

        getRoleAndRegionsInfo();

        function getBillsInfo(cur,filterArray){

            var obj = {
                params: {
                    page: cur,
                    filters:filterArray
                }
            };

            ApiService.get('/bills', obj, function (data) {
                if (data.result == 'success') {
                    $scope.billsArray = data.content;
                    totalBillsPages = data.pages;
                    billsPaging(cur);
                } else if(data.content === 'Permission Denied'){
                    window.location.href="/permissionError";
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        $scope.getCashSourceStr = function(arry){
            if(arry === undefined)return '';
            var array = [];
            for(var x = 0 ; x <arry.length;++x){

                if(tradeTypeCNTranslateObj[arry[x].capital_account_id] === undefined){
                    array.push(arry[x].capital_account_id);
                }else{
                    array.push(tradeTypeCNTranslateObj[arry[x].capital_account_id]);
                }
            }
            return array.join(',\r\n');
        };

        $scope.getCashTargetStr = function(billInfo){


            var arry = billInfo['target'];
            if(arry === undefined)return '';
            var array = [];
            for(var x = 0 ; x <arry.length;++x){

                if(tradeTypeCNTranslateObj[arry[x].capital_account_id] === undefined && arry[x].phone !== ''){
                    array.push(arry[x].phone);
                }else if(tradeTypeCNTranslateObj[arry[x].capital_account_id] === undefined && arry[x].phone === ''){

                    var cardInfo = billInfo.bank_card;

                    array.push(cardInfo.bank_name);
                    array.push(cardInfo.card_no);
                    array.push(cardInfo.owner_name);

                }else{
                    array.push(tradeTypeCNTranslateObj[arry[x].capital_account_id]);
                }
            }
            return array.join(',');
        };

        $scope.translateBillType = function(type){
            if(billTypeCNTranslateObj[type] === undefined){
                return type;
            }else{
                return billTypeCNTranslateObj[type];
            }
        };

        $scope.checkBill = function (billInfo) {


            var tradeId = billInfo.tradeId;
            var _status = billInfo.status + 1;

            var obj = {
                status: _status
            };

            if(billInfo.status === 0){
                ApiService.post('/bills/checkBill/'+tradeId, obj, function (data) {
                    if(data.result === 'success'){ billInfo.status = _status;getBillsInfo(curBillPage,['all']);}else{
                        if(data.content === 'Permission Denied'){
                            alert('该用户无权执行初审动作...');
                            return;
                        }
                        alert('初审核通过失败...');
                    }

                }, function (errMsg) {
                    alert(errMsg.message);
                });
            }else if(billInfo.status === 1){
                ApiService.put('/bills/checkBill/'+tradeId, obj, function (data) {
                    if(data.result === 'success'){ billInfo.status = _status;getBillsInfo(curBillPage,['all']);}else{
                        if(data.content === 'Permission Denied'){
                            alert('该用户无权执行复审动作...');
                            return;
                        }
                        alert('复审核通过失败...');
                    }

                }, function (errMsg) {
                    alert(errMsg.message);
                });
            }

        };

        $scope.rejectBill = function (billInfo) {

            var tradeId = billInfo.tradeId;
            var _status = 0;

            if(billInfo.status === 0){
                _status = 3;
            }else if(billInfo.status === 1){
                _status = 4;}

            var obj = {
                status: _status
            };

            if(_status === 3){
                ApiService.post('/bills/rejectBill/'+tradeId, obj, function (data) {
                    if(data.result === 'success'){ billInfo.status = _status;getBillsInfo(curBillPage,['all']);}else{

                        if(data.content === 'Permission Denied'){
                            alert('该用户无权执行拒绝初审动作...');
                            return;
                        }
                        alert('拒绝初审失败...');
                    }

                }, function (errMsg) {
                    alert(errMsg.message);
                });
            }else if(_status === 4){
                ApiService.put('/bills/rejectBill/'+tradeId, obj, function (data) {
                    if(data.result === 'success'){ billInfo.status = _status;getBillsInfo(curBillPage,['all']);}else{
                        if(data.content === 'Permission Denied'){
                            alert('该用户无权执行拒绝复审动作...');
                            return;
                        }
                        alert('拒绝复审失败...');
                    }

                }, function (errMsg) {
                    alert(errMsg.message);
                });
            }

        };

        function billsPaging(pageIndex) {
            var firstScreeningPagination = false;
            laypage({
                cont: $('#billsPage'),
                pages: totalBillsPages,
                skip: true,
                skin: 'yahei',
                curr: pageIndex,//view上显示的页数是索引加1
                groups: 5,
                hash: false,
                jump: function (obj) {//一定要加上first的判断，否则会一直刷新
                    curBillPage = obj.curr;
                    if (!firstScreeningPagination) {
                        firstScreeningPagination = true;
                    } else {
                        getBillsInfo(obj.curr,filters);
                        firstScreeningPagination = false;
                    }
                }
            });
        }

        $scope.getBillsDetailInfo = function(billInfo){

            var detailLink = billInfo['href'];
            var pos = detailLink.lastIndexOf('/');
            var tradeId = detailLink.substr(pos+1);


            ApiService.get('/bills/'+ tradeId, {}, function (data) {
                if (data.result == 'success') {

                    $scope.billInfo = data.content;
                    $scope.billInfo.tradeId = tradeId;
                    $("#show_billDetail_dlg").modal('show');
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });

        }

    }]);