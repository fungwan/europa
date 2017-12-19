// 商城管理
window.APP.controller("mallManage", ["$location", "$scope", "$http", function ($location, $scope, $http) {




    $scope.tableItems = [
        { name: '商品管理', show: 'showproduct' },
        { name: '订单管理', show: 'showorder' },
        //{name:'广告管理',show:'showadd'},
        { name: '评价管理', show: 'showeva' },
        //{name:'客户星级规则管理',show:'showlevel'},
        //{name:'商城模块管理',show:'showmodule'}
        { name: '礼券管理', show: 'showqoupon' },
        { name: '优惠券管理', show: 'showCashCoupon' },
        { name: '积分抽奖管理', show: 'showlottery' },
        // {name: '积分抽奖记录',show: 'showlotteryRecord'}
    ];
    $scope.selectActivity = function (item) {
        $scope.selectedItem = item;
        $scope.selectedshow = item.show;
    };

    if (location.hash != '#/mall/manage') {
        var showinfo = location.hash.split('manage/')[1];
        var show = showinfo.slice(showinfo.length - 1);
        var showitem = showinfo.slice(0, showinfo.length - 1);

    } else {
        var show = 0;
        var showitem = 'showproduct';
    }
    $scope.intpage = function () {
        $scope.selectedItem = $scope.tableItems[show];
        $scope.selectedshow = showitem;
    }
}]);