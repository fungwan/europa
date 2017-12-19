/**
 * Created by 75339 on 2017/2/15.
 */
var selfsafe = {
    resendCode: 0,
    getuserinfo: function (data) {
        var d = data.data;

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
        } else if (d.sex == 2) {
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
    modifypassword: function () {
        var ispassset = $("#passshow").attr("ispass");
        var userid = $("#tjnewaddr").attr('data-cuid');

        var npass = $("#npass").val();
        var npassrpeat = $("#newpass").val();

        var sendobj = {
            custid: app.custid,
            password: $("#newpass").val(),
            oldpassword: $("#oldpass").val()
        };
        if (app.haspass) {
            if (!$("#oldpass").val()) {
                $(".passtip").html("请填写旧密码!");
                return;
            }
        } else {
            delete sendobj.oldpassword;
        }
        if (npass.length > 10) {
            $(".passtip").html("输入密码过长,请输入6-10位数字和字母组合!");
            return;
        } else if (npass.length < 6) {
            $(".passtip").html("输入密码过短,请输入6-10位数字和字母组合!");
            return;
        } else {
            if (app.RegVali.IsNum(npass) || app.RegVali.IsLetter(npass)) {
                $(".passtip").html("请输入字母数字组合密码!");
                return;
            } else {
                if (npassrpeat == npass) {
                    $(".passtip").html("");

                } else {
                    $(".passtip").html("两次密码输入不同!");
                    return;
                }
            }
        }
        app.request('/shop/resetPayPassword', sendobj)
            .then(function (data) {
                $.toast("提交成功！");
                $(".passtip").html("");
                setTimeout(function() {
                    // if(window.sessionStorage.getItem('fistSetPass')){
                    //     window.sessionStorage.removeItem('fistSetPass');
                    //     window.location.href = "./marketgopay.html"
                    // }else{
                    //     window.location.href = "./selfinfo.html"
                    // }
                    app.pageInit("#inde")
                }, 1000)
            })
            .catch(function (data) {
                if (data.error) {
                    $(".passtip").html("提交失败！" + data.error.message);
                } else {
                    $(".passtip").html("提交失败！");
                }
            })
    },
    setsafephone: function () {
        var sendobj = {
            custid: app.custid,
            phone: $("#safephone").val(),
            checkcode: $("#safeCode").val(),
            password: $("#safepas").val()
        };
        if (!app.RegVali.empty(sendobj.password) || sendobj.password.length < 6) {
            $.toast("请输入6位支付密码");
            return;
        }
        if (!app.RegVali.phone(sendobj.phone)) {
            $.toast("请正确输入正确手机号码");
            return;
        }
        if (!app.RegVali.Nnumber(sendobj.checkcode, 4)) {
            $.toast("请输入4位数字验证码");
            return;
        }
        app.request('/customer/resetPhoneNo', sendobj)
            .then(function (data) {
                $.toast('修改成功，即将跳转！');
                setTimeout(function () {
                    window.location.href = './selfinfo.html';
                }, 1000)
            }).catch(function (data) {
                if (data.error) {
                    $.toast("修改失败:" + data.error.message)
                } else {
                    $.toast("修改失败")
                }
            })
    },
    resetpass: function () {
        $.confirm('新密码将以短信方式发送到你的手机，请及时登录修改密码！', '确定重置密码？', function () {
            app.request('/shop/resetPassword')
                .then(function (data) {
                    $.toast("支付密码已发送，请及时修改！");
                    tim();
                }).catch(function (data) {
                    if (data.error) {
                        if (data.error.code == 'NOPHONE') {
                            $.toast("请返回安全中心设置基本信息手机号码！");
                        } else if (data.error.code == 'SENDFAIL') {
                            $.toast("短信发送失败，请稍后重试！");
                        } else {
                            $.toast("出错了！60秒后重试！");
                            tim();
                        }

                    }
                })
        });

        function tim() {
            $("#retry").show();
            $("#reset").addClass('disabled');
            var t = 60;
            var timer = setInterval(function () {
                t--;
                if (t <= 0) {
                    clearInterval(timer);
                    $("#retry").hide();
                    $("#reset").removeClass('disabled');
                }
                $("#sec").html(t);
            }, 1000)
        }
    },
    sendCode: function () {
        var second = window.localStorage.getItem('resendCode');
        var nowt = Date.parse(new Date()) / 1000;

        if (second && Number(second) > nowt) {
            if (Number(second) - nowt > 0) {
                selfsafe.resendCode = 0;
            }
            return
        }
        app.request('/club/sendSetPhoneSms', { phone: $("#safephone").val() })
            .then(function (data) {
                var timestamp1 = Date.parse(new Date()) / 1000 + 60;
                window.localStorage.setItem('resendCode', timestamp1);
                $.toast("验证码已发送，请注意接收短信！");
                tim(60);
            }).catch(function (data) {
                if (data.error) {
                    $.toast('出错了！:' + data)
                } else {
                    $.toast("出错了！");
                }
            })
        function tim(T) {
            $("#retryy").show();
            $("#codesend").hide();
            $("#sendCode").addClass('disabled');
            var t = T;
            var timer = setInterval(function () {
                t--;
                if (t <= 0) {
                    clearInterval(timer);
                    $("#retryy").hide();
                    $("#codesend").show();
                    $("#sendCode").removeClass('disabled');
                }
                $("#numsend").html(t);
            }, 1000)
        }
    },
    resendTime: function (T) {
        $("#retryy").show();
        $("#codesend").hide();
        $("#sendCode").addClass('disabled');
        var t = T;
        var timer = setInterval(function () {
            t--;
            if (t <= 0) {
                clearInterval(timer);
                $("#retryy").hide();
                $("#codesend").show();
                $("#sendCode").removeClass('disabled');
            }
            $("#numsend").html(t);
        }, 1000)
    },
    initmypage: function (d) {
        app.getCustInfo()
            .then(function (data) {
                selfsafe.getuserinfo(data);
                app.hasSetPass();
            })
            .then(function () {
                var second = window.localStorage.getItem('resendCode');
                var nowt = Date.parse(new Date()) / 1000;
                if (second && Number(second) > nowt) {
                    selfsafe.resendTime(Number(second) - nowt);
                }
            })



    }
};
app.checkLogin()
    .then(function (data) {
        //设置头像和昵称
        $(".zname").html(data.nickname);
        $(".zimg").attr({ 'src': data.headimgurl });
        selfsafe.initmypage();

    });
//设置密码
$("#passbtn").click(function (e) {

    selfsafe.modifypassword();
});
//设置安全手机
$("#safebtn").click(function () {
    selfsafe.setsafephone();
});
//重置密码
$("#reset").click(function () {

    if ($(this).hasClass('disabled')) {
        return;
    }
    selfsafe.resetpass();
});
//是否能继续发送密码
$("#sendCode").click(function () {
    if ($(this).hasClass('disabled')) {
        return;
    }
    selfsafe.sendCode();
});
//跳转到地址管理
$("#addrrepaire").click(function () {
    window.location.href = './safeaddr.html'
});

$("#modi").click(function () {
    app.pageInit("#page-modyfiypassword");
});

$("#resub").click(function () {
    app.pageInit("#inde");
});
$("#pagesafe").click(function () {
    app.pageInit("#page-safe");
});
$("#resubpass").click(function () {
    app.pageInit("#inde");
});

$("#page-modyfiypassword").on("focus", "input", function () {
    if ($(this).val()) {
        $(".passtip").html("");
    }

})