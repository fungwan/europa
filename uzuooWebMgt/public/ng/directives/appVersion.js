'use strict';

/**
 * @ngdoc function
 * @name myApp.directive:appVersion
 * @description
 * # appVersion
 * Directive of the myApp
 */
angular.module('myApp').directive('appVersion', ['version', function (version) {
    return function (scope, elm, attrs) {
        elm.text(version);
    };
}]);


angular.module('myApp').directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs, ngModel) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function (event) {
                scope.$apply(function () {
                    modelSetter(scope, element[0].files[0]);
                });
                //附件预览
                scope.file = (event.srcElement || event.target).files[0];
                scope.getFile();
            });
        }
    };
}]);


angular.module('myApp').directive('imgPreview', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs, ngModel) {
            element.bind('mousewheel', function (event) {
                var e = window.event || event;
                var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
                element[0].width = Math.max(400, Math.min(1200, element[0].width + (30 * delta)));
                //element[0].width = 1000;
                return false;
            });
        }
    };
}]);


angular.module('myApp').directive('bsDatepicker',function(){
    return {
        restrict : 'A',
        require : 'ngModel',
        link : function(scope,element,attrs,ctrl){
            var datepicker1 = $(element).datepicker().on('changeDate',function (ev){
                var newDate = new Date(ev.date);
                datepicker1.hide() ;
                scope.$apply(function () {
                    ctrl.$setViewValue(newDate);
                });
            }).data('datepicker');
        }
    }
})