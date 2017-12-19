window.APP.controller("financeManageCtrl", ["$scope", function ($scope) {
    $scope.tabItems = [
        { name: "收支统计", code: "income" },
        { name: "红包统计", code: "redpacket" }
    ];
    $scope.selectedItem = $scope.tabItems[0];
    $scope.selectItem = function (item) {
        $scope.selectedItem = item;
    };
}]);