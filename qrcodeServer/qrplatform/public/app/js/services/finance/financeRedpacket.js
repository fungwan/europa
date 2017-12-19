window.APP.factory("FinanceRedpacketService", ["PostService", function (PostService) {
    var listUrl = "/finance/redpacket/list",
        infoUrl = "/finance/redpacket/info";

    var service = {};
    service.query = function (queryOptions) {
        return PostService.request(listUrl, $.param(queryOptions));
    };

    service.info = function (billno) {
        return PostService.request(infoUrl, $.param({
            billno: billno 
        }));
    };

    return service;
}]);