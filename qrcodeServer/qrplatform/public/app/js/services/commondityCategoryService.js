window.APP.factory('CommondityCategoryService', ['PostService', function(PostService){
    var listUrl = "/mcdManage/getCategoryList",
        deleteUrl = "/mcdManage/delCategory",
        saveUrl = "/mcdManage/saveOrUpdCategory";

    var service = {};

    service.query = function (queryOptions) {
        queryOptions = $.extend({}, queryOptions);
        queryOptions.query = JSON.stringify(queryOptions.query);
        return PostService.request(listUrl, $.param(queryOptions));
    };

    service.deleteItems = function (ids) {
        return PostService.request(deleteUrl, $.param({
            listid: JSON.stringify({
                list: ids
            })
        }));
    };

    service.save = function (categoryInfo) {
        return PostService.request(saveUrl, $.param({
            categoryInfo: JSON.stringify(categoryInfo)
        }));
    };

    return service;
}]);