'use strict';

angular.module('myApp').controller('VerifiedProductCtrl', ['$scope', '$location', '$rootScope', 'ApiService',
    function ($scope, $location, $rootScope, ApiService) {
        $scope.initPage();
        $rootScope.sideBarSelect = {
            firstClassSel:'verifiedAdmin',
            secondSel:'verifyProduct'
        };



    }
]);