/**
 * Created by fdr08 on 2015/12/8.
 */
define(function() {
    var module = {}, loaded = false, whichAnalysis = "";
    var els = {
        //ab: $(".analysisBoard"),
        //rp: $(".redpack"),
        //qu: $(".questionnaire"),
        //cus: $(".customer"),
        //iframeAna: $("#analysis")
        point: $(".qr-points")
    };
    function switchAnalysis(e) {
        //e.preventDefault();
        //e.stopPropagation();
        var name = $(e.currentTarget).children(".title").data("value");
        window.location.href = "/enterprise/analysis."+ name +".html";
    }
    function init() {
        if (!loaded) {
            //top.location.href.getParameter("p", "analysis");
            //whichAnalysis = top.location.href.getParameter("analysis");
            //if(whichAnalysis) {
            //    window.location.href = "/enterprise/analysis."+ whichAnalysis +".html";
            //}else {
            //    els.point.children("div").on("click", switchAnalysis);
            //}
            $("#lotterydetails").click(function (e) {
                window.location.href="/app/#/analysis/activity";
            });
            $("#memberCountDetails").click(function (e) {
                window.location.href = "/app/#/analysis/member";
            });
            $("#orderDetails").click(function (e) {
                window.location.href = "/app/#/analysis/order";
            });
            $("#pointdetails").click(function (e) {
                window.location.href="/app/#/analysis/point";
            });
            loaded = true;
        }
    }
    module.init = init;
    return module;
});