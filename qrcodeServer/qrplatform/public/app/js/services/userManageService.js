/**
 * Created by 75339 on 2017/5/5.
 */
window.APP.factory('userManageService', ['PostService', function(PostService){
    var listUrl = "/user/list",
        frozenUrl = "/user/updatelocked",
        saveUrl = "/user/setrole",
        roleList="/user/roles";

    var service = {};

    service.query = function (queryOptions) {
        queryOptions = $.extend({}, queryOptions);
        queryOptions.query = JSON.stringify(queryOptions.query);
        return PostService.request(listUrl, $.param(queryOptions));
    };

    service.frozen = function (obj) {
        return PostService.request(frozenUrl, $.param(obj));
    };

    service.save = function (obj) {
        return PostService.request(saveUrl, $.param(obj));
    };
    service.rolelist = function () {
        return PostService.request(roleList);
    };
    return service;
}]);