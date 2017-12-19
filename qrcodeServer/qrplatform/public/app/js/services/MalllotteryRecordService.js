window.APP.factory("MallLotteryRecordService", ["PostService", function (PostService) {
    var listUrl = "/lotto/getlottorecord"

    var service = {};
    service.query = function (queryOptions) {
        queryOptions = $.extend(true, {}, queryOptions);
        queryOptions.query = JSON.stringify(queryOptions.query);
        return PostService.request(listUrl, $.param(queryOptions));
    };

    return service;
}]);