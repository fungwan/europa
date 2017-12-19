window.APP.factory("MallOrderService", ["PostService", function (PostService) {
    var listUrl = "/mall/getOrderList",
        infoUrl = "/club/getOrderByid",
        updateUrl = "/mall/updateOrder",
        exportsUrl = "/mall/downloadOrderList",
        expressUrl = "/mall/getBlhExpress";

    var service = {};
    service.query = function (queryOptions) {
        return PostService.request(listUrl, $.param(queryOptions));
    };
    service.info = function (id) {
        return PostService.request(infoUrl, $.param({
            orderid: id
        }));
    };
    service.sendGood = function (orderInfo) {
        return PostService.request(updateUrl, $.param({
            orderInfo: JSON.stringify(orderInfo)
        }));
    };
    service.cancelOrder = function (id) {
        return PostService.request(updateUrl, $.param({
            orderInfo: JSON.stringify({
                orderid: id,
                state: 4
            })
        }));
    };
    service.closeOrder = function (id) {
        return PostService.request(updateUrl, $.param({
            orderInfo: JSON.stringify({
                orderid: id,
                state: 100
            })
        }));
    };
    service.exportsOrder = function (exportsOptions) {
        return PostService.request(exportsUrl, $.param(exportsOptions));
    };
    service.getExpressInfo = function(option) {
        return PostService.request(expressUrl, $.param(option))
    }
    return service;
}]);