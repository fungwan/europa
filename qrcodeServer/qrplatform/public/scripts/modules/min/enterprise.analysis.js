/**
 * Created by fdr08 on 2015/12/8.
 */
define(function() {
    var module = {}, loaded = false, whichAnalysis = "";
    var els = {
        ab: $(".analysisBoard"),
        rp: $(".redpack"),
        qu: $(".questionnaire"),
        cus: $(".customer"),
        iframeAna: $("#analysis")
    };
    function switchAnalysis(e) {
        e.preventDefault();
        e.stopPropagation();
        var name = $(e.currentTarget).children("div").get(0).className.replace(/(wfico)|(toggle)/g, "").replace(/\s*/g, "");
        window.location.href = "/enterprise/analysis."+ name +".html";
    }
    function init() {
        if (!loaded) {
            whichAnalysis = top.location.href.getParameter("w");
            if(whichAnalysis) {
                window.location.href = "/enterprise/analysis."+ whichAnalysis +".html";
            }else {
                $(".shadow").not(".out").on("click", switchAnalysis);
            }
            els.ab.hover(function() {
                $(this).children(".cube").toggleClass("paused");
            });
            loaded = true;
        }
    }
    module.init = init;
    return module;
});