window.APP.factory("CustomerService", ['PostService', function(PostService) {
    var listUrl = "/customer/list",
        setGroupUrl = "/customer/group",
        pointRecordUrl = "/club/getPointRecord",
        prizeRecordUrl = "/club/getPrizeRecord";

    var service = {};

    service.query = function(queryOptions) {
        queryOptions = $.extend(true, {}, queryOptions);
        queryOptions.query = JSON.stringify(queryOptions.query);
        return PostService.request(listUrl, $.param(queryOptions));
    };
    // options like this {idList: [], groupid: "", groupname: ""}
    service.setGroup = function(options) {
        return PostService.request(setGroupUrl, $.param({
            detail: JSON.stringify(options)
        }));
    };

    service.queryPointRecord = function(queryOptions) {
        return PostService.request(pointRecordUrl, $.param(queryOptions));
    };

    service.queryPrizeRecord = function(queryOptions) {
        return PostService.request(prizeRecordUrl, $.param(queryOptions));
    };

    return service;
}]);