window.APP.directive("mViewOptGroup", function () {
    return {
        restrict: "EA",
        replace: true,
        transclude: {
            form: "mForm",
            action: "mAction"
        },
        templateUrl: 'views/directiveTemplates/viewOptGroup.html',
        controller: function ($scope, $element, $attrs, $transclude) {
            $scope.isCollapse = false;
            $scope.toggleCollapse = function () {
                $scope.isCollapse = !$scope.isCollapse;
            };
        }
    };
});