/**
 * Created by 75339 on 2017/2/27.
 */
var lottery = {
    address: null,
    orderid: null,
    ddid: null,//地址id
    defaultAddressId: null,
    pointlottery: 0,
    pointid: null,
    orderid: null,
    shakeFlag: true,//摇一摇flag
    renderGetCustAddressList: function (data) {
        if (data && data.data && data.data.addressList) {
            var d = data.data.addressList;
            if (d.length == 0) {
                $(".addressInfo").html(`<div class="emptyAddress">选择收货地址</div>`);
            } else {
                var defaultaddrid = data.data.defaultAddressId;
                if (!defaultaddrid) {
                    $(".addressInfo").html(`<div class="emptyAddress">选择收货地址</div>`);
                } else {
                    for (var i = 0; i < d.length; i++) {
                        if (d[i].addid == defaultaddrid) {
                            $(".addressInfo").attr({ "data-aid": d[i].addid });
                            $(".addressInfo").html(`<div class="addressInfoTop">
                                                            <span class="name">${d[i].contact}</span>
                                                            <span class="phone">${d[i].phone}</span>
                                                            <span class="defau">默认</span>
                                                       </div>
                                                       <div class="addressInfoBottom txtFlow">${d[i].province}${d[i].city}${d[i].address}</div>`);
                            lottery.addid = d[i].addid;
                            lottery.address = d[i].province + d[i].city + d[i].address + d[i].phone + d[i].contact;
                            window.localStorage.setItem("lotteryinfoaddid", lottery.addid);
                            window.localStorage.setItem("lotteryinfoaddress", lottery.address);
                        }
                    }

                }

            }
            //渲染收货地址列表
            lottery.defaultAddressId = data.data.defaultAddressId;
            $("#addrlist").empty();
            if (d.length == 0) {
                $("#addrlist").append(`<p class="notice">您还没有添加地址，请点击右上角“管理”去添加地址</p>`)
                return
            }
            for (var i = 0; i < d.length; i++) {
                $("#addrlist").append(`<div data-id="${d[i].addid}" data-name="${d[i].contact}" data-phone="${d[i].phone}" data-addr="${d[i].province}${d[i].city}${d[i].address}" class="cardAddr">
                    <div class=""><span>${d[i].contact}</span><span>${d[i].phone}</span></div>
                    <div class="">
                        <div class="">${d[i].province}${d[i].city}${d[i].address}</div>
                    </div>
                </div>`);

            }
        }

    },
    selectAddress: function (that) {
        $(".addressInfo").html(`<div class="addressInfoTop"><span class="name">${$(that).attr('data-name')}</span><span class="phone">${$(that).attr('data-phone')}</span><span class="defau">默认</span></div>
                <div class="addressInfoBottom txtFlow">${$(that).attr('data-addr')}</div>`);
        $(".addressInfo").attr({ "data-aid": $(that).attr('data-id') });
        lottery.addid = $(that).attr('data-id');
        lottery.address = $(that).attr('data-addr') + $(that).attr('data-phone') + $(that).attr('data-name');

        window.localStorage.setItem("lotteryinfoaddid", lottery.addid);
        window.localStorage.setItem("lotteryinfoaddress", lottery.address);
        if ($(that).attr('data-id') != lottery.defaultAddressId) {
            $('.defau').hide();
        }
        app.pageInit("#lottopro");
    },
    getLotterys: function () {//获取奖品信息
        app.request('/mall/getLotterys').
            then(function (data) {

            }).catch(function (data) {
                if (data.error) {
                    $.toast("获取奖品信息失败:" + data.error.message)
                } else {
                    $.toast("获取奖品信息失败")
                }
            })
    },
    getWinningInformation: function () {

        if (Number(lottery.pointlottery) > Number(app.point)) {
            $.toast("积分不足！快去扫码吧！")
            return
        }
        $(".loadLottery").show(500)
        lottery.shakeFlag = false;

        app.request('/lotto/playlotto', {
            lottopointid: lottery.pointid
        }).
            then(function (data) {
                if (data.data === null) {//没有中奖
                    $(".loadLottery").hide()
                    lottery.shakeFlag = true;
                    $(".award").show();
                    $(".closeno").show();
                    $(".lottoimginfo").attr({ 'src': "../images/lottery/noaward.png" }).show()
                } else {

                    $(".lottoimginfo").attr({ 'src': "../images/lottery/award.png" }).show()
                    $(".lotteryname").show().html(data.data.prizename);
                    if (data.data.order) {//除了积分意外奖品
                        $(".closehave").show();
                        lottery.orderid = data.data.order.orderid;
                        window.localStorage.setItem("lotteryinfoorderid", lottery.orderid);
                        if (data.data.productinfo.producttype == "product") {//中实物，选地址
                            $(".scanlotterypro").show();
                            $(".lotteryinfo").html(`<div class="lotteryinfo-title">恭喜你中奖了</div>
                    <div class="lotteryinfo-img"><img src="${config.mall.productlistimageurl + data.data.productinfo.productimage}"/></div>
                    <div class="lotteryinfo-name clear"><span class="lf">${data.data.productinfo.productname}</span>X<span class="rt">${data.data.productnumber}</span></div>`);

                            window.localStorage.setItem("lotteryinfo", `<div class="lotteryinfo-title">恭喜你中奖了</div>
                    <div class="lotteryinfo-img"><img src="${config.mall.productlistimageurl + data.data.productinfo.productimage}"/></div>
                    <div class="lotteryinfo-name clear"><span class="lf">${data.data.productinfo.productname}</span>X<span class="rt">${data.data.productnumber}</span></div>`);

                        } else {
                            lottery.orderid = data.data.order.orderid;
                            $(".scanlotteryel").show();
                            lottery.shakeFlag = true;
                        }

                    } else {//积分奖品或者优惠券
                        $(".closeno").show();
                        if (data.data.productinfo.producttype == "cashcoupon") {//优惠券
                            $(".lotteryname").html(data.data.prizename);
                            $(".scanlotterypoint").show().html(`请去我的优惠券查看`)
                        } else {
                            $(".lotteryname").html(data.data.prizename);
                            $(".scanlotterypoint").show().html(`获得${data.data.productnumber}积分`)
                        }
                        lottery.shakeFlag = true;
                    }


                    $(".loadLottery").hide();
                    $(".award").show();

                }
                app.getGrade();//刷新积分
            }).catch(function (data) {
                $(".loadLottery").hide();
                if (data.error) {
                    $.toast(data.error.message)
                } else {
                    $.toast("获取中奖信息失败")
                }
            })
    },
    renderPopOutTpl: function () {
        app.request('/lotto/getcurrentlotto').
            then(function (data) {
                var d = data.data;
                if (d) {
                    $(".title").html(d.name);
                    $(".time").html(moment(d.begindate).format().slice(0, 10) + "/" + moment(d.enddate).format().slice(0, 10));
                    $(".desc").html(d.info)
                    $(".itebox").empty();

                    $(".itebox").append(`<div class="selectPointItem one" data-step="onestep" data-id="${d.points[0].id}">${d.points[0].point}</div>`)
                    $(".itebox").append(`<div class="selectPointItem two" data-step="twostep" data-id="${d.points[1].id}">${d.points[1].point}</div>`)
                    $(".itebox").append(`<div class="selectPointItem three" data-step="threestep" data-id="${d.points[2].id}">${d.points[2].point}</div>`)
                    lottery.pointid = d.points[0].id;
                } else {
                    $.toast("暂无活动，即将跳转");
                    setTimeout(function () {
                        window.location.href = "./marketindex.html"
                    }, 2000)
                }

            }).catch(function (data) {

                if (data.error) {
                    $.toast("获取活动信息失败:" + data.error.message)
                } else {
                    $.toast("获取活动信息失败")
                }
            })
    },
    confirmOrder: function () {
        app.request('/lotto/editorderadd', {
            orderid: lottery.orderid,
            addid: lottery.addid,
            address: lottery.address
        }).
            then(function (data) {
                window.localStorage.removeItem('lotteryinfoorderid');
                $.confirm('立即查看我的订单?', '提示',
                    function () {
                        window.location.href = "./marketorderlistdetail.html?id=" + lottery.orderid
                    },
                    function () {
                        window.location.reload();
                    }
                );
            }).catch(function (data) {
                if (data.error) {
                    $.toast("确认收货信息失败:" + data.error.message)
                } else {
                    $.toast("确认收货信息失败")
                }
            })
    },
    initPage: function () {

        if (window.localStorage.getItem("lotteryinfoorderid")) {
            app.pageInit("#lottopro");
            $(".lotteryinfo").html(window.localStorage.getItem("lotteryinfo"));
            lottery.addid = window.localStorage.getItem("lotteryinfoaddid");
            lottery.address = window.localStorage.getItem("lotteryinfoaddress");
            lottery.orderid = window.localStorage.getItem("lotteryinfoorderid");
        } else {
            lottery.renderPopOutTpl();
            lottery.renderGetCustAddressList();
        }

    }
};
app.checkLogin().then(function () {
    lottery.initPage();
    app.getGrade();
}).then(function () {
    app.getCustAddressList()
        .then(function (data) {
            lottery.renderGetCustAddressList(data);
        })
})

//手机摇一摇
if (window.DeviceMotionEvent) {
    var speed = 25;
    var x = y = z = lastX = lastY = lastZ = 0;
    window.addEventListener('devicemotion', function () {
        var acceleration = event.accelerationIncludingGravity;
        x = acceleration.x;
        y = acceleration.y;
        if (Math.abs(x - lastX) > speed || Math.abs(y - lastY) > speed) {

            if (lottery.shakeFlag) {

                lottery.getWinningInformation()
            }
        }
        lastX = x;
        lastY = y;
    }, false);
}

$(".closehave").click(function () {
    $.confirm('确认关闭，关闭后将不能浏览本次抽奖记录', '提示', function () {
        $(".award").hide(500)
    });
})
$(".closeno").click(function () {
    $(".award").hide(500)
})

$(".itebox").on("click", ".selectPointItem", function () {
    lottery.pointlottery = $(this).html();
    var id = $(this).attr("data-id");
    lottery.pointid = id;
    var klass = $(this).attr("data-step");
    $(".finger").attr({ "class": "finger" })
    $(".finger").attr({ "class": "finger " + klass });
    //lottery.getWinningInformation();

})

$(".scanlotteryel").click(function () {
    window.location.href = "./marketorderlistdetail.html?id=" + lottery.orderid;
})

//选择地址
// $(".barAddr").click(function () {
//     app.pageInit("#selectAddr");
// });

//选择收货地址
$("#addrlist").on('click', '.cardAddr', function () {
    $.closePanel("#panel-js-demo");
    var that = this;
    lottery.selectAddress(that);
});

//实物
$(".scanlotterypro").click(function () {
    app.pageInit("#lottopro");
})
//确认收货信息
$(".gopay").click(function () {
    if (lottery.addid) {
        $.confirm('确认收货信息', '提示', function () {
            lottery.confirmOrder();
        });
    } else {
        $.toast("请选择收获地址！");
        return
    }

})

//去管理地址
$("#manage").click(function () {
    window.localStorage.setItem('lotteryOrder', 'sub');
    window.location.href = "./safeaddr.html";
});

$(document).on("click", ".barAddr", function () {
    $.openPanel("#panel-js-demo");
});