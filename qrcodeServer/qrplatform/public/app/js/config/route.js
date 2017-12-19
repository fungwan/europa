window.APP.config(function ($routeProvider, $locationProvider, mePageLoadingProvider) {
    mePageLoadingProvider.autoPageLoading = false;
    // mePageLoadingProvider.timeOut = '500ms';
    mePageLoadingProvider.effect = 'Spill';
    //TODO 权限控制
    $routeProvider.when('/customer/group', {
        templateUrl: 'views/templates/customer.group.html',
        controller: 'customerGroupCtrl'
    }).when('/customer/customer', {
        templateUrl: 'views/templates/customer.customer.html',
        controller: 'customerCtrl'
    }).when('/commondity/category', {
        templateUrl: 'views/templates/commondity.category.html',
        controller: 'commondityCategoryCtrl'
    }).when('/commondity/commondity', {
        templateUrl: 'views/templates/commondity.commondity.html',
        controller: 'commondityCtrl'
    }).when('/mall/manage', {
        templateUrl: 'views/templates/mall/mall.manage.html',
        controller: 'mallManage'
    }).when('/mall/manage/showproduct0', {
        templateUrl: 'views/templates/mall/mall.manage.html',
        controller: 'mallManage'
    }).when('/mall/manage/showorder1', {
        templateUrl: 'views/templates/mall/mall.manage.html',
        controller: 'mallManage'
    }).when('/mall/manage/showeva2', {
        templateUrl: 'views/templates/mall/mall.manage.html',
        controller: 'mallManage'
    }).when('/mall/manage/showqoupon3', {
        templateUrl: 'views/templates/mall/mall.manage.html',
        controller: 'mallManage'
    }).when('/mall/manage/showCashCoupon4', {
        templateUrl: 'views/templates/mall/mall.manage.html',
        controller: 'mallManage'
    }).when('/mall/manage/showlottery5', {
        templateUrl: 'views/templates/mall/mall.manage.html',
        controller: 'mallManage'
    }).when("/analysis/activity", {
        templateUrl: 'views/templates/analysis/analysis.activity.html',
        controller: "activityCtrl"
    }).when("/analysis/member", {
        templateUrl: 'views/templates/analysis/analysis.member.html',
        controller: "analysisMemberCtrl"
    }).when("/analysis/order", {
        templateUrl: 'views/templates/analysis/analysis.order.html',
        controller: "analysisOrderCtrl"
    }).when("/sale/article", {
        templateUrl: 'views/templates/sale/article.html',
        controller: "saleArticleCtrl"
    }).when('/sale/ad', {
        templateUrl: 'views/templates/advertise/commondity.ad.html',
        controller: 'commondityAdCtrl'
    }).when("/analysis/point", {
        templateUrl: 'views/templates/analysis/analysis.point.html',
        controller: "analysisPointCtrl"
    }).when("/sys/manage", {
        templateUrl: 'views/templates/sysManage/userManage.html',
        controller: "userManageCtrl"
    }).when("/sys/user", {
        templateUrl: 'views/templates/sysManage/userManage.html',
        controller: "userManageCtrl"
    }).when("/sys/finance", {
        templateUrl: 'views/templates/sysManage/finance/finance.manage.html',
        controller: 'financeManageCtrl'
    }).when('/sys/wechat', {
        templateUrl: 'views/templates/sysManage/wechat.html',
        controller: 'shareCtrl'
    }).otherwise({
        redirectTo: '/customer/group'
    });
});