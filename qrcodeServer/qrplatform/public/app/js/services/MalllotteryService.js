window.APP.factory("MalllotteryService", ["PostService", function (PostService) {
    var listUrl = "/lotto/getlottolist",
        infoUrl = "/lotto/getlottobyid",//获取当前抽奖活动
        infoQouponUrl = "/mall/getqouponContent",
        updateUrl = "/lotto/savelotto",
        updateStateUrl = '/lotto/enablelotto';

    var service = {};
    service.query = function (queryOptions) {

        var querys = $.extend(true, {}, queryOptions);
        querys.begdate = querys.begdate ? moment(querys.begdate).format("x") : "";
        querys.enddate = querys.enddate ? moment(querys.enddate).format("x") : "";


        return PostService.request(listUrl, $.param(querys));
    };

    service.getlotteryInfo = function (lotteryid) {
        return PostService.request(infoUrl, $.param({
            lottoid: lotteryid
        }));
    };

    service.save = function (lotto) {
        lotto.begindate = moment(lotto.begindate).format("x")
        lotto.enddate = parseInt(moment(lotto.enddate).format("x"))
        return PostService.request(updateUrl, $.param({
            lotto: JSON.stringify(lotto)
        }));
    };
    service.shelve = function (id,state) {
        return PostService.request(updateStateUrl, $.param({
            lottoid: id,
            state:state
        }));
    };
    //获取礼券详情
    service.getQouponDetail = function (id) {
        return PostService.request(
            infoQouponUrl,
            $.param({
                lotteryid: id
            })
        );
    };

    return service;
}]);