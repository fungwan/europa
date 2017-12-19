window.APP.factory("FinanceIncomeService", ["PostService", function (PostService) {
    var listUrl = "/finance/income/list",
        infoUrl = "/mall/queryPayOrder";

    var service = {};

    service.query = function (queryOptions) {
        return PostService.request(listUrl, $.param(queryOptions));
    };

    service.info = function (orderbm) {
        return PostService.request(infoUrl, $.param({
            orderbm: orderbm 
        }));
    };

    return service;
}]);