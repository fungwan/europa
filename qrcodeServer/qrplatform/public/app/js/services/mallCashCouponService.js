window.APP.factory("MallCashCouponService", ["PostService", '$http', 'PostUploadService', function (PostService, $http, PostUploadService) {
    var listUrl = "/mall/pdtList",
        infoUrl = "/mall/getproductinfo",
        infoQouponUrl = "/mall/getqouponContent",
        updateUrl = "/mall/updateCouponProduct";

    var service = {};
    service.query = function (queryOptions) {
        queryOptions = $.extend(true, {}, queryOptions);
        queryOptions.query = JSON.stringify(queryOptions.query);
        return PostService.request(listUrl, $.param(queryOptions));
    };

    service.getProductInfo = function (productid) {
        return PostService.request(infoUrl, $.param({
            productid: productid
        }));
    };

    service.save = function (fd, productOption) {
        productInfo = $.extend(true, {}, productOption.productInfo);
        content = productOption.content;
        productInfo.productdetail.images = JSON.stringify(productInfo.productdetail.images);
        fd.append("productInfo", JSON.stringify(productInfo))
        return PostUploadService.request(updateUrl, fd);
    };

    var updateState = function (id, state) {
        var productInfo={};
        productInfo.state=state;
        productInfo.productid=id;
         var fd = new FormData();
        fd.append("productInfo", JSON.stringify(productInfo))
        return PostUploadService.request(updateUrl, fd);
    };
    // 上架
    service.shelve = function (fd, productOption) {
        productInfo = $.extend(true, {}, productOption);
        productInfo.productdetail.images = JSON.stringify(productInfo.productdetail.images);
        fd.append("productInfo", JSON.stringify(productInfo))
        return PostUploadService.request(updateUrl, fd);
    };
    // 下架
    service.offShelve = function (fd, productOption) {
        productInfo = $.extend(true, {}, productOption);
        productInfo.productdetail.images = JSON.stringify(productInfo.productdetail.images);
        fd.append("productInfo", JSON.stringify(productInfo))
        return PostUploadService.request(updateUrl, fd);
    };

    //获取礼券详情
    service.getQouponDetail = function (id) {
        return PostService.request(
            infoQouponUrl,
            $.param({
                productid: id
            })
        );
    };

    return service;
}]);