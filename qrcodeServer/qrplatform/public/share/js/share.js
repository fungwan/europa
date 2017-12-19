$(function () {
    var config = top.$config;
    $(".max-point .point").text(config.shareMaxPoint);
    $("#maxPoint").text(config.shareMaxPoint);
    $(".current-point .point").text(config.shareCurrentPoint);
    $("#point").text(config.sharePoint);
    // 注册事件
    $(".action button").click(function () {
        // alert("点击右上角的按钮，在弹窗的菜单中选择分享操作");
        $(".mask").show();
    });

    if (config.shareMaxPoint <= config.shareCurrentPoint) {
        $(".action").hide();
        $(".note").text("你的积分已到达本活动的分享上限，无法继续获得分享积分");
        $(".note").show();
    }
});