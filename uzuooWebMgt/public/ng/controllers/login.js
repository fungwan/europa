'use strict';

angular.module('myApp').controller('LoginCtrl', ['$scope', '$cookieStore', '$location', '$rootScope', 'ApiService',
    function ($scope, $cookieStore, $location, $rootScope, ApiService) {
        $scope.user = {
            username: '',
            password: '',
            rmbUsr: false
        }

        $scope.loginErrMsg = '';

        var user = $cookieStore.get("user");
        if (user) {
            $scope.user = user;
        }

        $scope.onLogin = function () {

            $scope.loginErrMsg = '';

            var hash = hex_md5($scope.user.password);
            if (user && $scope.user.password == $cookieStore.get("user").password) {
                hash = user.password;
            }
            var obj = {
                username: $scope.user.username,
                password: hash
            }
            ApiService.post('/login', obj, function (data) {
                if (data.result == 'success') {
                    $rootScope.userInfo = {
                        name: data.content.user_name,
                        id: data.content.user_id,
                        role: data.content.role,
                        city: data.content.city

                    }
                    if ($scope.user.rmbUsr) {
                        $scope.user.password = hash;
                        var expireDate = new Date();
                        expireDate.setDate(expireDate.getDate() + 1);
                        $cookieStore.put("user", $scope.user, { 'expires': expireDate });
                    } else {
                        $cookieStore.remove("user");
                    }
                    $location.path('/');
                } else {
                    $scope.loginErrMsg = data.content;
                }
            }, function (errMsg) {
                $scope.loginErrMsg = errMsg;
            });
        }
    }
]);

angular.module('myApp').controller('LogoutCtrl', ['$scope', '$cookieStore', '$location', '$rootScope', 'ApiService',
    function ($scope, $cookieStore, $location, $rootScope, ApiService) {


        delete $rootScope.userInfo;
        var obj = {};
        $location.path('/login');
        ApiService.post('/logout', obj, function (data) {

        }, function (msg) {

        });
    }
]);