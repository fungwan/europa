$(function () {
    var config = top.$config,
        messager = top.messager;

    $(".max-point .point").text(config.helpMaxPoint);
    $("#maxPoint").text(config.helpMaxPoint);
    $(".current-point .point").text(config.helpCurrentPoint);
    $("#point").text(config.helpPoint);
    // 注册事件
    $(".action button").click(function () {
        messager.message("助力中...", 0);
        $.ajax({
            method: "POST",
            url: "/share/help",
            data: {
                recordid: config.recordid
            }
        }).then(function (resp) {
            if (resp.data) {
                messager.message("助力成功");
                $(".action").hide();
                $(".current-point .point").text(config.helpCurrentPoint+ config.helpPoint);
                // $(".note").text("你已经助力过该分享，无法进行助力操作");
                // $(".note").show();
            } else {
                messager.message("助力失败，请刷新后重试！");
            }
        }).fail(function (jqXHR, type, msg) {
            messager.messager("助力失败，请刷新后重试！");
        });
    });
    if (config.helpMaxPoint <= config.helpCurrentPoint) {
        $(".action").hide();
        $(".note").text("你的积分已达到本活动的助力上限，无法进行助力操作");
        $(".note").show();
    } else if (config.hasHelp) {
        $(".action").hide();
        $(".note").text("你已经助力过该分享，无法进行助力操作");
        $(".note").show();
    }
});