'use strict';

angular.module('myApp').factory('ApiService', ['$http', '$rootScope', '$route',
    function ($http, $rootScope, $route) {
        var cfgData = {};
		
        //用于构造url参数，object参数最好只包含基本类型的元素，不要嵌套对象或数组
        var makeArg = function (arg) {
            var paramStr = '';
            switch (typeof arg) {
                case 'object':
                    var i = 0;
                    for (var elem in arg) {
                        if (i !== 0) {
                            paramStr += '&';
                        }
                        paramStr += (elem + '=' + arg[elem]);
                        ++i;
                    }
                    return paramStr;
                case 'undefined':
                case 'function':
                    return '';
                default:
                    return String(arg);
            }
        };
        //用于构造完整的url
        //第一个参数必须是resource的url,后面可以接任意个object,string或number，都会被当作参数连接起来
        var makeUrl = function () {
            var argLen = arguments.length;
            if (argLen === 0) {
                return '';
            }
            if (typeof arguments[0] != 'string') {
                return '';
            }
            var urlStr = arguments[0];
            if (argLen == 1) {
                return urlStr;
            }
            urlStr = urlStr + '?' + makeArg(arguments[1]);
            for (var i = 2; i < argLen; ++i) {
                urlStr = urlStr + '&' + makeArg(arguments[1]);
            }
            return urlStr;
        };

        cfgData.get = function (url, obj, successcb, failcb) {
            url = '/api' + url;
            if (obj.params) {
                var date = new Date();
                obj.params._timestamp = date.getTime();
                url = makeUrl(url, obj.params);
                delete obj.params;
            }
            obj.timeout = (1000 * 30);
            return $http.get(url, obj).success(function (data, status, headers, config) {
                successcb(data);
                if (data.result == 'failed' && data.content == 'not login') {
                    delete $rootScope.userInfo;
                    $route.reload();
                };
            }).error(function (data, status, headers, config) {

                failcb({ message: '后台数据异常,请稍后...' });

            });
        };

        cfgData.post = function (url, obj, successcb, failcb) {
            url = '/api' + url;
            if (obj.params) {
                url = makeUrl(url, obj.params);
                delete obj.params;
            }
            obj.timeout = (1000 * 30);
            return $http.post(url, obj).success(function (data, status, headers, config) {
                successcb(data);
                if (data.result == 'failed' && data.content == 'not login') {
                    delete $rootScope.userInfo;
                    $route.reload();
                };
            }).error(function (data, status, headers, config) {

                failcb({ message: '后台数据异常,请稍后...' });

            });
        };

        cfgData.put = function (url, obj, successcb, failcb) {
            url = '/api' + url;
            if (obj.params) {
                url = makeUrl(url, obj.params);
                delete obj.params;
            }
            obj.timeout = (1000 * 30);
            return $http.put(url, obj).success(function (data, status, headers, config) {
                successcb(data);
                if (data.result == 'failed' && data.content == 'not login') {
                    delete $rootScope.userInfo;
                    $route.reload();
                };
            }).error(function (data, status, headers, config) {
                failcb({ message: '后台数据异常,请稍后...' });
            });
        };

        cfgData.delete = function (url, obj, successcb, failcb) {
            url = '/api' + url;
            if (obj.params) {
                url = makeUrl(url, obj.params);
                delete obj.params;
            }
            obj.timeout = (1000 * 30);
            return $http.delete(url, obj).success(function (data, status, headers, config) {
                successcb(data);
                if (data.result == 'failed' && data.content == 'not login') {
                    delete $rootScope.userInfo;
                    $route.reload();
                };
            }).error(function (data, status, headers, config) {

                failcb({ message: '后台数据异常,请稍后...' });

            });
        };

        cfgData.head = function (url, obj, successcb, failcb) {
            url = '/api' + url;
            if (obj.params) {
                url = makeUrl(url, obj.params);
                delete obj.params;
                $route.reload();
            }
            obj.timeout = (1000 * 30);
            return $http.head(url, obj).success(function (data, status, headers, config) {
                successcb('');
                if (data.result == 'failed' && data.content == 'not login') {
                    delete $rootScope.userInfo;
                    $route.reload();
                };
            }).error(function (data, status, headers, config) {
                console.error(data);
                failcb({ message: '后台数据异常,请稍后...' });
            });
        };

        return cfgData;
    }]);