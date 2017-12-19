/**
 * Created by 75339 on 2017/2/20.
 */
var clubgivemodul = {
    buttondisabled: true,
    givegarde: function () {
        app.request('/club/beginExchangePoint', {
            custid: app.custid,
            point: $(".currentpoint").val(),
            message: $("#gradegivemsg").val() || "没有留言信息！"
        })
            .then(function (data) {
                $("#qrcodeimg").empty();
                var d = data.data;
                //1、创建qrcode对象, width 和 height 是最后显示二维码图片的宽和高
                var qrcode = new QRCode(document.getElementById("qrcodeimg"), {
                    width: 200,
                    height: 200
                });
                qrcode.makeCode(config.mall.host + "mall/mobile/html/clubgetgrade.html?exchangeid=" + d.recid);//内容
                clubgivemodul.buttondisabled = true;
                app.pageInit("#gradegive");
            }).catch(function (data) {
                clubgivemodul.buttondisabled = true;
                if (data.error) {
                    $.toast("积分赠予失败:" + data.error.message)
                } else {
                    $.toast("积分赠予失败")
                }
            })
    }
};
app.checkLogin()
    .then(function (data) {
        app.getGrade().then(function (data) {
            $(".ihave").html(`我的积分：${data.data.point}`)
            $('.range').attr({ "max": data.data.point })
        })
    })

$(".range").bind("touchmove", function () {
    $(".currentpoint").val($(this).val())
})
$(".givebtn").bind("touchstart", function () {
    $(".currentpoint").val('0')
    $(this).addClass("active");
    app.pageInit(".pagegradegive");
    app.getGrade().then(function (data) {
        $(".ihave").html(`我的积分：${data.data.point}`)
        $(".range").attr({ "max": data.data.point })
        $(".range").val('0')
    })
})


$("#begingive").click(function (e) {
    var html = $(".currentpoint").val();
    if (clubgivemodul.buttondisabled) {
        clubgivemodul.buttondisabled = false;
        if (app.point == 0) {
            $.toast("暂无积分");
            clubgivemodul.buttondisabled = true;
            return;
        }
        if ($(".currentpoint").val() == 0) {
            $.toast("赠送需最少一积分")
            clubgivemodul.buttondisabled = true;
            return;
        }
        if (isNaN(html) || html > app.point || html < 0 || !(html % 1 == 0) || html[0] == 0 || html.trim() == "") {
            $.toast("请输入不大于" + app.point + "的正整数");
            $(".currentpoint").val("0");
            $('.range').val(0);
            clubgivemodul.buttondisabled = true;
            return;
        } else {
            clubgivemodul.buttondisabled = true;
            $('.range').val(html)
        }
        $(".point").html($(".currentpoint").val() + "积分")
        clubgivemodul.givegarde();
    }


});