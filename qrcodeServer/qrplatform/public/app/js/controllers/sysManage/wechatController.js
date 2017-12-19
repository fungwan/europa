/**
 * created by xdf on 2017/06/01 
 */
window.APP.controller('shareCtrl', [
    "$scope",
    "MessageService",
    "UtilService",
    function (
        $scope,
        MessageService,
        UtilService
    ) {

$scope.tableItems = [
    {
        name: '公众号分享管理',
        show: 'showshareaccount'
    },
    {
        name: '公众号菜单管理',
        show: 'showmenumanage'
    }
];

$scope.selectedItem = {};
$scope.selectedShow = '';

$scope.selectActivity = function (item) {
    $scope.selectedItem = item;
    $scope.selectedShow = item.show;
};

$scope.initpage = function () {
    $scope.selectedItem = $scope.tableItems[0];
    $scope.selectedShow = 'showshareaccount';
}

}])
