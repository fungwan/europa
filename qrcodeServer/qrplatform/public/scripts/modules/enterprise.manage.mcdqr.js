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
        // window.location.href = "/enterprise/manage."+ name +".html";
        if (name == "mcdlist") {
            window.location.href = "/app/#/commondity/commondity";
        } else if (name == "mcdcategory") {
            window.location.href = "/app/#/commondity/category";
        }
    }
    function init() {
        if (!loaded) {
            top.location.href.getParameter("p", "manage");
            whichAnalysis = top.location.href.getParameter("manage");
            if(whichAnalysis) {
                window.location.href = "/enterprise/manage."+ whichAnalysis +".html";
            }else {
                els.point.children("div").on("click", switchAnalysis);
            }
            //els.ab.hover(function() {
            //    $(this).children(".cube").toggleClass("paused");
            //});
            loaded = true;
        }
    }
    module.init = init;
    return module;
});