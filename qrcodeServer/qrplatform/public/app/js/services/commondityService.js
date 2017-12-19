window.APP.factory('CommondityService', ['PostService', function(PostService){
    var listUrl = "/mcdManage/getMcdList",
        saveUrl = "/mcdManage/saveOrUpdMcd",
        offShelveUrl = "/mcdManage/delMcd";

    var service = {};
    service.query = function (queryOptions) {
        queryOptions = $.extend(true, {}, queryOptions);
        if (queryOptions.query && (queryOptions.query.mcdname.trim() != "" || queryOptions.query.batchcode.trim() != "" || queryOptions.query.categoryid.trim() != "")) {
            queryOptions.query = JSON.stringify(queryOptions.query);
        } else {
            delete queryOptions.query;
        }
        return PostService.request(listUrl, $.param(queryOptions));
    };
    service.save = function (commondity) {
        return PostService.request(saveUrl, $.param(commondity));
    };
    // 下架
    service.offShelve = function (ids) {
        return PostService.request(offShelveUrl, $.param({
            mcdId: JSON.stringify({list: ids})
        }));
    };
    
    return service;
}]);