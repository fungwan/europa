/**
 * Created by 75339 on 2017/2/15.
 */
var selfsafe = {
    getuserinfo: function(data) {
        var d = data.data;
        app.code=d.areacode;
        var set = d.hassetpassword;
        $("#passshow").attr({ "ispass": set });
        if (set) {
            $("#passshow").show();
            $("#modi").html("修改支付密码");
        } else {
            $("#passshow").hide();
            $("#modi").html("设置支付密码")
        }
        //设置昵称
        $("#ninkname").val(d.nickname);
        //个性签名
        if (d.sign) {
            $(".signword").html(d.sign);
            $("#qianmin").val(d.sign)
        } else {
            $(".signword").html("没有设置签名。");
            $("#qianmin").val("没有设置签名。")
        }
        //性别
        if (d.sex == 0) {
            $(".wxsex").html("没有设置性别。");
            $(".sexper").val("没有设置性别");
        } else if (d.sex == 1) {
            $(".wxsex").html("男");
            $(".sexper").val("男");
        } else if (d.sex ==2) {
            $(".wxsex").html("女");
            $(".sexper").val("女");
        } else {
            $(".wxsex").html("没有设置性别。");
            $(".sexper").val("没有设置性别");
        }
        //年龄
        if (d.birthday && d.birthday != "") {
            $(".wxbir").html(d.birthday);
            $("#age").val(d.birthday);
        } else {
            $(".wxbir").html("0");
            $("#age").val("0");
        }
        //电话
        if (d.phone && d.phone != "") {
            $("#phone").val(d.phone);
        } else {
            $("#phone").val("没有常用电话");
        }
        //地址
        if (d.address && d.address != "") {
            $(".wxaddr").html(`<span id="s1">${d.province}</span><span id="s2">${d.city}</span><span id="s3">${d.address}</span>`);
            $(".addperaddr").html(`${d.province}/${d.city}`);
            console.log(d.address, d.province, d.city)
            var ad = d.address.replace(d.province + "省" + d.city, "");

            $("#adrmore").val(ad)
        } else {
            $(".wxaddr").html("暂无地址");
            $("#adrmore").val("暂无地址")
        }
        //扩展信息
        if (data.data.extInfo) {
            var exd = data.data.extInfo;

            //用户等级设置
            $(".cusleve").empty();

            if (parseInt(exd.leve) > 0) {
                if (exd.leve == '1') {
                    $(".cusleve").html(`<span class="iconfont icon-vipdengji1"></span>`)
                } else if (exd.leve == '2') {
                    $(".cusleve").html(`<span class="iconfont icon-vipdengji2"></span>`)
                } else if (exd.leve == '3') {
                    $("#gradleve").html(`<span class="iconfont icon-vipdengji3"></span>`)
                } else if (exd.leve == '4') {
                    $(".cusleve").html(`<span class="iconfont icon-vipdengji4"></span>`)
                } else if (exd.leve == '5') {
                    $(".cusleve").html(`<span class="iconfont icon-vipdengji5"></span>`)
                }

            } else {
                $(".cusleve").html(`<span class="iconfont icon-vipdengji0"></span>`)
            }
            //安全等级设置
            $(".safegrade").empty();
            if (parseInt(exd.passwordleve) > 0) {
                for (var i = 0; i < exd.passwordleve; i++) {
                    $(".safegrade").append(`<span class="iconfont icon-start"></span>`);
                }
            } else {
                $(".safegrade").append(`安全等级：<span class="iconfont icon-start"></span>`);
            }
            //安全电话
            $(".safephone").html(exd.phone || '没有设置。');
            console.log(exd.email);
            //安全邮箱
            $(".safeemail").html(exd.email || '没有设置。');
            //常用地址
            if (data && data.data && data.data.extInfo && data.data.extInfo.addressInfo) {
                var myadr = data.data.extInfo.addressInfo;
                $(".commonaddr").html(myadr.country + myadr.province + myadr.city + myadr.address);
            } else {
                $(".commonaddr").html("没有设置常用地址");
            }
        }
    },
    modifyselfinfo: function() {
        var ninkname = $("#ninkname").val();
        var sex = $(".sexper").val();
        if (sex == "男") {
            sex = 1;
        } else if (sex == "女") {
            sex = 2;
        }else{
            sex = 0;
        }
        var age = $("#age").val();
        var phone = $("#phone").val();
        var adr = $(".addperaddr").html();
        var adrmore = $("#adrmore").val();
        var sign = $("#qianmin").val();
        var addarr = adr.split("/");
        var objsend = {
            custid: app.custid,
            address: adrmore,
            phone: phone,
            sign: sign,
            sex: sex,
            nickname: ninkname,
            birthday: age,
            country: "中国",
            province: addarr[0],
            city: addarr[1],
            code: app.code
        };
        if (!objsend.nickname) {
            $.toast("请正确输入昵称！");
            return
        }else if(objsend.nickname.length>10){
            $.toast("昵称不能超过10个字！");
            return
        }
        if (Number(objsend.birthday) < 0) {
            $.toast("请正确输入年龄！");
            return
        }
        if (!app.RegVali.phone(objsend.phone)) {
            $.toast("请正确输入正确手机号码！");
            return
        }
        if (adr.indexOf('/') == -1) {
            $.toast("请选择地址！");
            return
        }
        if (!app.RegVali.empty(adrmore)) {
            $.toast("请输入详细地址！");
            return
        }else if(adrmore.length>50){
            $.toast("详细地址不能超过50个字！");
            return
        }
        if (!app.RegVali.empty(sign)) {
            $.toast("请设置签名！");
            return
        }else if(sign.length>30){
            $.toast("签名不能超过30个字！");
            return
        }
        app.request( '/shop/updateBaseInfo',{ customer: JSON.stringify(objsend) })
            .then(function(data){
                $.toast("提交成功，即将跳转！");
                setTimeout(function(){
                    window.location.href = "./selfsafe.html"
                },2000)
            })
            .catch(function(data){
                if (data.error) {
                    $.toast("修改失败:" + data.error.message)
                } else {
                    $.toast("修改失败")

                }
            })
    },
    initmypage: function(d) {
        app.getCustInfo()
            .then(function(data){
                selfsafe.getuserinfo(data);
                app.cities().then(function(data){
                    app.getprv(data)
                })
            })
    }
};
app.checkLogin()
    .then(function(data){
        selfsafe.initmypage();
    });

$("#infobtn").click(function(e) {
    selfsafe.modifyselfinfo();
});

$(".list-container").on('click','.province',function(){
    var code=$(this).attr('data-code');
    app.cities(code).then(function(data){
        app.getcity(data)
    })
})
$(".list-container").on('click','.cities',function(){
    var name=$(this).attr('data-name');
    app.code=$(this).attr('data-code');
   $(".addperaddr").html(name);
    $(".page").removeClass('page-current');
    $("#page-modyfiyautograph").addClass('page-current');
    $.init();
})
$("#getperaddr").click(function(){
    app.cities().then(function(data){
        app.getprv(data)
    })
    $(".page").removeClass('page-current');
    $("#address").addClass('.page-current');
    $.init();
})