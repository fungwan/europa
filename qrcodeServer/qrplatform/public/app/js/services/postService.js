window.APP.factory('PostService', [
    "$rootScope",
    '$http',
    '$q',
    "MessageService",
    "UtilService",
    function ($rootScope, $http, $q, MessageService, UtilService) {

        var service = {};

        service.request = function (url, data, timeout) {
            var defer = $q.defer();
            $http.post(url, data, {
                timeout: timeout || 5000
            }).success(function (resp) {
                if (resp.data) {
                    defer.resolve(resp.data);
                } else if (resp.error && resp.error.code == "unlogin") {
                    MessageService.uniqueError("用户未登录，请前去登录！").then(function () {
                        window.location.href = "/";
                    });
                } else {
                    defer.reject(resp.error);
                }
            }).error(function (msg, code) {
                // 超时处理
                if (code == -1) {
                    MessageService.uniqueError("请求超时，请稍后尝试！");
                    UtilService.stopLoading();
                } else {
                    defer.reject(code);
                }
            });
            return defer.promise;
        };

        return service;
    }]);
window.APP.factory('PostUploadService', [
    "$rootScope",
    '$http',
    '$q',
    "MessageService",
    "UtilService",
    function ($rootScope, $http, $q, MessageService, UtilService) {

        var service = {};

        service.request = function (url, data, timeout) {
            var defer = $q.defer();
            $http({
                method: 'POST',
                url: url,
                data: data,
                timeout: timeout || 5000,
                headers: { 'Content-Type': undefined },
                transformRequest: angular.identity
            })
                .success(function (resp) {
                    if (resp.data) {
                        defer.resolve(resp.data);
                    } else if (resp.error && resp.error.code == "unlogin") {
                        MessageService.uniqueError("用户未登录，请前去登录！").then(function () {
                            window.location.href = "/";
                        });
                    } else {
                        defer.reject(resp.error);
                    }
                }).error(function (msg, code) {
                    // 超时处理
                    if (code == -1) {
                        MessageService.uniqueError("请求超时，请稍后尝试！");
                        UtilService.stopLoading();
                    } else {
                        defer.reject(code);
                    }
                })
            return defer.promise;
        };

        return service;
    }]);