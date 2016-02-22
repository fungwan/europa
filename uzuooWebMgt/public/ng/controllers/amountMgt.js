'use strict';

angular.module('myApp').controller('AmountMgtCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel:'operationAdmin',
            secondSel:'amountMgt'
        };
        
    }]);