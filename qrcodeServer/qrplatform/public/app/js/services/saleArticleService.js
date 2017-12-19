window.APP.factory("saleArticleService", ["PostService", function (PostService) {
    var listUrl = "/club/getarticlebyentid",
        infoUrl = "/club/getarticlebyid",
        delUrl = "/club/delarticle",
        updateUrl = "/club/createAritle",
        publishUrl = "/club/publishAritle";

    var service = {};
    service.query = function (queryOptions) {
        queryOptions = $.extend(true, {}, queryOptions);
        return PostService.request(listUrl, $.param(queryOptions));
    };

    service.getProductInfo = function (productid) {
        return PostService.request(infoUrl, $.param({
            artid: productid
        }));
    };

    service.save = function (productInfo) {
        productInfo = $.extend(true, {}, productInfo);
        return PostService.request(updateUrl, $.param({
            article: JSON.stringify(productInfo)
        }));
    };

    var updateState = function (id) {
        return PostService.request(delUrl, $.param({
           artid:id
        }));
    };

    // 停用
    service.offShelve = function (id) {
        return updateState(id);
    };

    service.immediatePublish = function (id) {
        return PostService.request(publishUrl, $.param({
            artid: id
        }));
    };

    return service;
}]);