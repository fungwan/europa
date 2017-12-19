window.APP.factory("MallEvalService", ["PostService", function (PostService) {
    var listUrl = "/mall/getproductevallist",
        auditUrl = "/mall/saveproducteval";

    var service = {};

    service.query = function (queryOptions) {
        return PostService.request(listUrl, $.param(queryOptions));
    };

    // 审核
    service.audit = function (audit) {
        return PostService.request(auditUrl, $.param({
            eval: JSON.stringify(audit)
        }));
    };

    return service;
}]);