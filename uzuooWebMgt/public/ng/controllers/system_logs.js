'use strict';

angular.module('myApp').controller('HistoryCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel:'systemLog',
            secondSel:''
        };


        $scope.logsArray = [];
        $scope.totalLogsPages = 1;                   //操作日志的总页数
        $scope.curWorkersPage = 1;
        $scope.singleLogId = 0;                     //每次单个删除log的id

        $scope.startDate = '';                     //查询的开始时间
        $scope.endDate = '';                     //查询的结束时间

        $scope.onDelSingleLog = function () {

            var userIdArray = [];
            userIdArray.push($scope.singleLogId);
            var obj = {
                    ids: userIdArray
            };

            ApiService.post('/doDelLogsById', obj, function (data) {
                getLogsInfo($scope.curWorkersPage);
            }, function (errMsg) {
                alert(errMsg.message);
            });
        };

        $scope.onRecordLogId = function (id) {

            $scope.singleLogId = id;
        };


        var idArray = [];

        $scope.chk = false;
        $scope.check= function(val,chk){
            if(chk == true){
                idArray.push(val);
            }else{
                for(var x=0 ; x < idArray.length;++x){
                   if(idArray[x] === val){
                      idArray.splice(x,1);
                      break;
                   }
                 }
            }
        };

        $scope.onDelAllCheckLog = function () {

            var obj = {
                ids: idArray
            };

            if(idArray.length === 0){
                alert('至少选择一项进行删除!');
                return;
            }
            ApiService.post('/doDelLogsById', obj, function (data) {
                getLogsInfo($scope.curWorkersPage);
            }, function (errMsg) {
                alert(errMsg.message);
            });
        };

        $scope.vm = {
            selectedStartDate : '',
            selectedEndDate : '',
            setDate : function(date){
             this.selectedStartDate = date
             },
             clearDate : function(){
             this.selectedStartDate =  null
             },
             show : function($event){},
             hide : function(){}
        };

        $scope.onFindLogByDate = function () {

            alert('angular封装日历控件数据绑定有问题，这个日期获取暂时用jquery' + $scope.vm.selectedStartDate);

            var startDateStr = $("#startDate-input").val();
            var startTimeStamp = new Date(startDateStr).getTime();

            var endDateStr = $("#endDate-input").val();
            var endTimeStamp = new Date(endDateStr).getTime();

            if(startDateStr === '' && endDateStr === ''){
                alert('请选择正确的查询时间！');
                return;
            }
            if(startTimeStamp > endTimeStamp){
                alert('查询的开始时间不能大于结束时间！');
                return;
            }

            function searchData(curr){

                var obj = {
                    params: {
                        page: curr,
                        startDate: startTimeStamp,
                        endDate:endTimeStamp
                    }
                };

                ApiService.get('/doFindLogsByDate', obj, function (data) {
                    if (data.result == 'success') {

                        $scope.totalLogsPages = data.pages;
                        $scope.logsArray  = data.content;

                        //分页控件
                        worksPaging(curr);
                    }
                }, function (errMsg) {
                    alert(errMsg.message);
                });
            }

            searchData(1);
        };

        $scope.getUserRole = function (code) {
            if (code === '0') {
                return '客服';
            } else if (code === '1') {
                return '财务初审';
            } else if (code === '2') {
                return '财务复核';
            } else if (code === '3') {
                return '财务经理';
            }else if (code === '4') {
                return '运营';
            }else if (code === '5') {
                return '管理员';
            }
        };


        function getLogsInfo(pages){

            var obj = {
                params: {
                    page: pages
                }
            };

            ApiService.get('/logs', obj, function (data) {
                if (data.result == 'success') {

                    $scope.totalLogsPages = data.pages;
                    $scope.logsArray  = data.content;

                    //分页控件
                    worksPaging(pages);
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }

        getLogsInfo(1);

        //jequry paging controll
        function worksPaging(pageIndex) {
            var firstScreeningPagination = false;
            laypage({
                cont: $('#logPage'),
                pages: $scope.totalLogsPages,
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
                        getLogsInfo(obj.curr);
                        firstScreeningPagination = false;
                    }
                }
            });
        }
        
    }]);