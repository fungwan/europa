window.APP.factory("MallProductService", ["PostService", function (PostService) {
    var listUrl = "/mall/pdtlist",
        infoUrl = "/mall/getproductinfo",
        infoQouponUrl = "/mall/getqouponContent",
        updateUrl = "/mall/updateMallProduct",
        updateStateUrl = '/mall/updateProductState',
        setDiscountProdUrl = '/mall/setDiscountProd';

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

    service.save = function (productOption) {
        productInfo = $.extend(true, {}, productOption.productInfo);
        content     = productOption.content;
        productInfo.productdetail.images = JSON.stringify(productInfo.productdetail.images);
        return PostService.request(updateUrl, $.param({
            productInfo: JSON.stringify(productInfo),
            content: JSON.stringify(content) || []
        }));
    };

    // 上架
    service.shelve = function (productOption) {
        productInfo = $.extend(true, {}, productOption);
        return PostService.request(updateUrl, $.param({
            productInfo: JSON.stringify(productInfo)
        }));
    };
    // 下架
    service.offShelve = function (productOption) {
        productInfo = $.extend(true, {}, productOption);
        return PostService.request(updateUrl, $.param({
            productInfo: JSON.stringify(productInfo)
        }));
    };

    // 礼券上下架
    service.qouponshelve = function (id, state) {
        return PostService.request(updateStateUrl, $.param({
            productid: id,
            state: state
        }));
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

    // 商品可折扣
    service.setDiscount = function(idList, state) {
        console.log(typeof idList);
        return PostService.request(
            setDiscountProdUrl,
            $.param({
                pdtlist: JSON.stringify(idList),
                state: state
            })
        )
    }

    return service;
}]);