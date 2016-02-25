'use strict';

angular.module('myApp').controller('AdvertisementCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {

        $rootScope.sideBarSelect = {
            firstClassSel: 'actvityAdmin',
            secondSel: 'advertisementMgt'
        };
        $scope.initPage();
        
        $scope.pageTitle = '顶部广告';
        $scope.titleClass = 'panel-green';
        var selectPostion = 'top';
        var editIndex = 0;
        getAdvertisement ();


        
        $scope.onClickTopTab = function () {
            $scope.pageTitle = '顶部广告';
            $scope.titleClass = 'panel-green';
            selectPostion = 'top';
            getAdvertisement ();
        }
        
        $scope.onClickBottomTab = function () {
            $scope.pageTitle = '底部广告';
            $scope.titleClass = 'panel-blue';
            selectPostion = 'bottom';
            getAdvertisement ();
        }
        
        $scope.onCreateAdvertisement = function () {
            $scope.advertisements.ads.push($scope.newAdvertisement);
            $scope.onComitUpdate();
        }
        
        $scope.onShowEditDlg = function (advertisement, index) {
        	editIndex = index;
        	$scope.selectAdvertisement = {
        		title:advertisement.title,
        		photos:[advertisement.photos[0]],
        		href:advertisement.href
        	}
            //$scope.selectAdvertisement = advertisement;//cloneObj(advertisement);
            /*if ($scope.selectAdvertisement.photos.length == 0) {
            	$scope.selectAdvertisement.photos = [''];
            };*/
        }
        
        $scope.onDeleteOne = function (index) {
        	editIndex = index;
            
        }

        $scope.confirmDelete = function () {
        	$scope.advertisements.ads.splice(editIndex, 1);
            $scope.onComitUpdate();
        }
        
        $scope.onShowCreate = function () {
            $scope.newAdvertisement = {
                title:'',
                photos:[''],
                href:''
            }
        }

        $scope.onComitEdit = function () {
        	$scope.advertisements.ads[editIndex] = $scope.selectAdvertisement;
        	$scope.onComitUpdate();
        }
        
        $scope.onComitUpdate = function () {
        	$scope.advertisements.interval = parseInt($scope.advertisements.interval);
            var obj = {
                content:$scope.advertisements
            }
            
            ApiService.post('/advertisement', obj, function (data) {
                if (data.result == 'success') {
                    //$scope.advertisements = data.content;
                    //alert('修改成功');
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });
        }
        
        
        function getAdvertisement () {
            ApiService.get('/advertisement/' + selectPostion, {}, function (data) {
                if (data.result == 'success') {
                    $scope.advertisements = data.content;
                }
            }, function (errMsg) {
                alert(errMsg.message);
            });           
        }


    }
]);