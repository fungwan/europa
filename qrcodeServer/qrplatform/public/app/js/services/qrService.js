window.APP.factory('QrService', ['PostService', function(PostService){
    var listUrl = "/mcdManage/getMcdQRbatchList",
        sendEMailUrl = "/mcdManage/sendMcdQREmail",
        addBatchUrl = "/mcdManage/getAddQRbatch",
        addQrUrl = "/mcdManage/addMcdQR";

    var service = {};
    service.query = function (queryOptions) {
        return PostService.request(listUrl, $.param(queryOptions));
    };

    service.sendEmail = function (qrCode) {
        return PostService.request(sendEMailUrl, $.param({
            batchid: qrCode.batchid,
            key: qrCode.key,
            batchcode: qrCode.batchcode
        }));
    };

    service.addBatch = function () {
        return PostService.request(addBatchUrl);
    };

    service.addQr = function (params) {
        return PostService.request(addQrUrl, $.param(params));
    };

    return service;
}]);