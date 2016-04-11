/*
 * angular.js file
 */
'use strict';

// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', ['ngRoute', 'ngResource', 'ngCookies', 'angularFileUpload', 'cgBusy']);
myApp.config(['$routeProvider', '$locationProvider', '$resourceProvider',
    function ($routeProvider, $locationProvider, $resourceProvider) {
        $routeProvider.when('/', { templateUrl: ('partial/main'), controller: 'HomeCtrl' });
        $routeProvider.when('/login', { templateUrl: ('partial/login'), controller: 'LoginCtrl' });
        $routeProvider.when('/customer', { templateUrl: ('partial/front_end_users'), controller: 'CustomerCtrl' });
        $routeProvider.when('/todoVerifiedCustomer', { templateUrl: ('partial/todoVerifiedWorkers'), controller: 'VerifiedCustomerCtrl' });
        $routeProvider.when('/todoVerifiedProduct', { templateUrl: ('partial/todoVerifiedProducts'), controller: 'VerifiedProductCtrl' });
        $routeProvider.when('/webAdminPage', { templateUrl: ('partial/background_users'), controller: 'BgUserCtrl' });
        $routeProvider.when('/showOrdersPage', { templateUrl: ('partial/orders'), controller: 'OrdersCtrl' });
        $routeProvider.when('/billsMgtPage', { templateUrl: ('partial/bills'), controller: 'BillsCtrl' });
        $routeProvider.when('/activityMgtPage', { templateUrl: ('partial/activityMgt'), controller: 'ActivityMgtCtrl' });
        $routeProvider.when('/customerFeedbacks', { templateUrl: ('partial/customer_feedbacks'), controller: 'FeedbacksCtrl' });
        $routeProvider.when('/amountMgtPage', { templateUrl: ('partial/amountMgt'), controller: 'AmountMgtCtrl' });
        $routeProvider.when('/levelRulesMgtPage', { templateUrl: ('partial/levelRulesMgt'), controller: 'LevelRulesCtrl' });
        $routeProvider.when('/globalSettingPage', { templateUrl: ('partial/globalSetting'), controller: 'GlobalSettingCtrl' });
        $routeProvider.when('/advertisementMgtPage', { templateUrl: ('partial/advertisementMgt'), controller: 'AdvertisementCtrl' });
        $routeProvider.when('/history', { templateUrl: ('partial/system_logs'), controller: 'HistoryCtrl' });
        $routeProvider.when('/categoriesMgt', { templateUrl: ('partial/categoriesMgt'), controller: 'CategoriesMgtCtrl' });
        $routeProvider.when('/citiesMgt', { templateUrl: ('partial/citiesMgt'), controller: 'CitiesMgtCtrl' });
        $routeProvider.when('/logout', { templateUrl: ('partial/login'), controller: 'LogoutCtrl' });
        
        
        $routeProvider.when('/404', { templateUrl: ('partial/404') });
        $routeProvider.when('/permissionError', { templateUrl: ('partial/permission_error') , controller: 'PermissionCtrl' });
        $routeProvider.otherwise({ redirectTo: '/404' });

        $locationProvider.html5Mode(true);
        $resourceProvider.defaults.stripTrailingSlashes = false;// Don't strip trailing slashes from calculated URLs
    }
]);

myApp.run(['$location', '$rootScope', 'ApiService', '$route',
    function ($location, $rootScope, ApiService, $route) {
        $rootScope.initPage = true;
        var firstStart = true;
        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            if (firstStart) {
                event.preventDefault();
                var path = $location.path();
                var obj = {};
                ApiService.get('/sessions', obj, function (data) {
                    firstStart = false;
                    if (data.result == 'success') {
                        $rootScope.userInfo = {
                            name: data.content.user_name,
                            id: data.content.user_id,
                            role: data.content.role,
                            city: data.content.city
                        }
                        if (path == '/login') {
                            $location.path('/');
                        } else {
                            $route.reload();
                        }
                    } else {
                        if (path == '/login') {
                            $route.reload();
                        } else
                            $location.path('/login');
                    }
                }, function (errMsg) {
                    firstStart = false;
                    alert(errMsg);
                });
            } else {
                var path = $location.path();
                if ($rootScope.userInfo && $rootScope.userInfo.name && path == 'login') {
                    $location.path('/');
                } else if (!$rootScope.userInfo || !$rootScope.userInfo.name) {
                    $location.path('/login');
                } else {
                    return;
                }
            }
        });
    }
]);
