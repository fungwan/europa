/**
 * Created by 75339 on 2017/2/20.
 */
var orderdatailmodul = {
    orderbm: '',
    img: '',
    getlocainfo: function () {
        app.request('/club/getOrderByid', {
                orderid: app.getSearchParams().id
            })
            .then(function (data) {
                var d = data.data;
                orderdatailmodul.orderbm = d.orderbm;
                orderdatailmodul.initTPL(d);
            })
            .catch(function (data) {
                console.log(data)
                if (data.error) {
                    $.toast("获取订单详情失败:" + data.error.message)
                } else {
                    $.toast("获取订单详情失败")
                }
            })
    },
    getBlhExpress: function () {
        app.request('/mall/getBlhExpress', {
                orderid: app.getSearchParams().id,
                orderbm: orderdatailmodul.orderbm
            })
            .then(function (res) {
                var logisticsstatus = res.data.logisticsstatus;
                var logisticsid = res.data.logisticsid;
                var logisticscompany = res.data.logisticscompany;
                if (logisticsstatus == 1) {
                    $(".poststatus").show();
                } else {
                    var d = res.data.logisticsjson.data;
                    $(".postname").html(logisticscompany);
                    $(".postbm").html('单号：' + logisticsid);
                    $("#addrlist").empty();
                    for (var i = 0; i < d.length; i++) {
                        $("#addrlist").append(`<div class="cardAddr">
                        <div class=""><span>${d[i].time}</span></div>
                        <div class="">
                            <span class="dotted"></span>
                            <div class="popright">${d[i].context}</div>
                        </div>
                    </div>`)
                    }
                    $("#addrlist").children().eq(0).addClass('active');
                }
            })
            .catch(function (data) {
                if (data.error) {
                    $.toast("获取物流信息失败:" + data.error.message)
                } else {
                    $.toast("获取物流信息失败")
                }
            })
    },
    renderRedpacketTPL: function (info) {
        $("#index").html(`
        <nav class="bar bar-tab">
                <div class="buttons-row">
                    <span style="display:none;" class="button-success button-fill button-big button" id="resend">继续发送红包</span>
                    <span class="button-success button-fill button-big button" id="contatqr">联系客服</span>
                </div>
            </nav>
        <div class="content">
            <div class="cardhed" id="orderhead">
                <div class="card-header" id="orderbm">订单号：${info.orderbm} <span style="color:red;">${app.orderState(info.state)}</span></div>
            </div>
            <div id="cardmybox">
                <div class="card" style="margin: 0">
                    <div class="card-content">
                        <div class="list-block media-list">
                            <ul class="orderlistdetailbox" id="orderlistmore">
                                
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div style="margin: 0;margin-top: 10px;" id="goodspay">
                <div class="card-header" style="font-size: 0.8rem;">商品总额 <span style="color: red;">${info.price}积分</span></div>
                <div style="text-align: right; margin-right: 1rem;">实付款：<span style="color: red;font-size: 1.4rem">${(info.paymoney)}</span>积分</div>
                <div style="text-align: right;padding-bottom: 20px;margin-right: 1rem;">下单时间：${moment(info.createtime).format().slice(0, 10)}</div>
            </div>
        </div>`)
        if (info.state == '0' || info.state == '1' || info.state == '2') {
            //继续发送红包
            $("#resend").show();
        }
        $("#orderlistdetailbox").empty();
        //订单详情列表
        var orderdetailarr = info.items; //订单商品列表
        for (var i = 0; i < orderdetailarr.length; i++) {

            $("#orderlistmore").append(`<li class="item-content">
                                    <div class="item-media">
                                        <img src="${info.imageurl}${orderdetailarr[i].productimage}-${info.imagestyle}" width="80" height="80">
                                    </div>
                                    <div class="item-inner">
                                        <div class="item-title-row">
                                            <div class="item-title">${orderdetailarr[i].productname}</div>
                                        </div>
                                        <div class="item-subtitle">数量：${orderdetailarr[i].productnumber}</div>
                                    </div>
                                </li>`);
            //评价详情列表
            $("#pingbox").append(`<li class="item-content" style="border-bottom: 1px solid #e1e1e1">
                                    <div class="item-media">
                                        <img src="${info.imageurl}${orderdetailarr[i].productimage}-${info.imagestyle}" width="80" height="80">
                                    </div>
                                    <div class="item-inner">
                                        <div class="item-title-row">
                                            <div class="item-title" style="font-size: 0.7rem">${orderdetailarr[i].productname}</div>
                                        </div>
                                        <div class="item-subtitle" style="height: 40px;"><span data-goodid="${orderdetailarr[i].mcdid}" data-orderid="${orderdetailarr[i].orderid}" data-img="${info.imageurl}${orderdetailarr[i].productimage}-${info.imagestyle}" class="button button-success ping button-fill" style="width: 80px;float: right;margin-top: 10px;">评价商品</span></div>
                                    </div>
                                </li>`)
        };
    },
    renderProductTPL: function (info) {

        var isShowExpressHtml = '';
        if((info.state == '2' || info.state == '3') && info.producttype != 'blh' && info.producttype != 'redpacket'){
            isShowExpressHtml = `        
            <p style="margin:0" >快递公司：${info.express}</p>
            <p style="margin:0" >快递单号：${info.trackingno}</p>        
            `;
        }

        $("#index").html(`
            <nav class="bar bar-tab">
                <div class="buttons-row">
                    <span style="display:none;" class="button-success button-fill button-big button" id="checkout">支付订单</span>
                    <span style="display:none;" class="button-success button-fill button-big button" id="qupingjia">评价订单</span>
                    <span style="display:none;" class="button-success button-fill button-big button" id="sureget">确认收货</span>
                    <span style="display:none;" class="button-success button-fill button-big button" id="use">查看我的礼券</span>
                    <span class="button-success button-fill button-big button" id="contactqr">联系客服</span>
                </div>
            </nav>
        <div class="content">
            <div class="cardhed" id="orderhead">
                <div class="card-header" id="orderbm">
                    订单号：${info.orderbm} <span style="color:red;">${app.orderState(info.state)}</span>
                </div>
                <div class="cardinfo"  style="padding-left: 1rem">
                    <span class="iconfont icon-dizhi" style="font-size: 1.2rem"></span>
                    <span style="margin-left: 8px">收货地址</span>
                    <span style="display:none;" class="logistics">查看物流</span>
                </div>
                <div class="card-footer" 
                     style="border-bottom: 1px solid gray;
                            flex-flow:column;
                            font-size:0.7rem;
                            align-items: flex-start;">
                    <p style="margin:0">${info.address}</p>
                    ${isShowExpressHtml}
                </div>
            </div>
            <div id="cardmybox">
                <div class="card" style="margin: 0">
                    <div class="card-content">
                        <div class="list-block media-list">
                            <ul class="orderlistdetailbox" id="orderlistmore">
                                
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div style="margin: 0;margin-top: 10px;" id="goodspay">
                <div class="qouponhide card-header" style="font-size: 0.8rem;">商品总额 <span style="color: red;">${(info.price)} ${app.unit}</span></div>
                <div class="qouponhide card-header" style="font-size: 0.8rem;">邮费<span style="color: red;">${(info.postage)} ${app.unit}</span></div>
                <div class="card-header" style="font-size: 0.8rem;">留言信息： </div>
                <textarea class="msgarea" rows=3>${info.remak || '没有留言信息'}</textarea>
                <div class="qouponhide" style="text-align: right; margin-right: 1rem;">实付款：<span style="color: red;font-size: 1.4rem">${(info.paymoney)}</span>${app.unit}</div>
                <div style="text-align: right;padding-bottom: 20px;margin-right: 1rem;">下单时间：${moment(info.createtime).format().slice(0, 10)}</div>
            </div>
            
        </div>`)
        if (info.producttype == "blh") {
            $(".logistics").show();
        }
        if (info.producttype == "qoupon") {

            $(".icon-quan").show();
        }
        if (info.state == 0) {
            $("#checkout").show();
            if (info.producttype == "qoupon") {
                $(".cardinfo").hide();
                $("#orderhead .card-footer").hide();
            }

        } else if (info.state == 3) {
            if (info.producttype == "qoupon") {
                $(".qouponhide").hide();
                if (!info.addid) { //使用

                    $("#use").show();
                    $(".cardinfo").hide();
                    $("#orderhead .card-footer").hide();
                }
            } else if(info.producttype == "blh") {
                console.log('是百礼汇商品')
            } else {
                $("#qupingjia").show();

            }
        } else if (info.state == 2) {
            if (info.producttype == "qoupon") {

                $(".qouponhide").hide();
            }

            $("#sureget").show();
        } else {

            if (info.producttype == "qoupon") {

                $(".qouponhide").hide();
            }
        }
        $("#orderlistdetailbox").empty();
        //订单详情列表
        var orderdetailarr = info.items; //订单商品列表
        for (var i = 0; i < orderdetailarr.length; i++) {
            var src = '';
            if (info.producttype == "blh") {
                src = orderdetailarr[i].productimage
                orderdatailmodul.img=orderdetailarr[i].productimage;
            } else {
                src = info.imageurl + orderdetailarr[i].productimage + '-' + info.imagestyle
                 orderdatailmodul.img=info.imageurl + orderdetailarr[i].productimage + '-' + info.imagestyle
            }
            $("#orderlistmore").append(`<li class="item-content">
                                    <div class="item-media">
                                        <img src="${src}" width="80" height="80">
                                    </div>
                                    <div class="item-inner">
                                        <div class="item-title-row">
                                            <div class="item-title">${orderdetailarr[i].productname}</div>
                                        </div>
                                        <div class="item-subtitle">数量：${orderdetailarr[i].productnumber}</div>
                                    </div>
                                </li>`);
            //评价详情列表
            $("#pingbox").append(`<li class="item-content" style="border-bottom: 1px solid #e1e1e1">
                                    <div class="item-media">
                                        <img src="${src}" width="80" height="80">
                                    </div>
                                    <div class="item-inner">
                                        <div class="item-title-row">
                                            <div class="item-title" style="font-size: 0.7rem">${orderdetailarr[i].productname}</div>
                                        </div>
                                        <div class="item-subtitle" style="height: 40px;">
                                            <span data-goodid="${orderdetailarr[i].mcdid}" 
                                                  data-orderid="${orderdetailarr[i].orderid}" 
                                                  data-img="${info.imageurl}${orderdetailarr[i].productimage}-${info.imagestyle}" 
                                                  class="button button-success ping button-fill" style="width: 80px;float: right;margin-top: 10px;">评价商品</span>
                                        </div>
                                    </div>
                                </li>`)
        };
    },
    initTPL: function (d) {
        //是否是红包订单

        if (d.billno !== null && d.billno !== "0") {
            //红包订单

            orderdatailmodul.renderRedpacketTPL(d);
        } else {
            //不是红包订单，这里是商品订单
            orderdatailmodul.renderProductTPL(d)
        }
    },
    isgetgoods: function () {
        $.confirm('确认收到宝贝！', function () {
            app.request('/mall/updateOrder', {
                    orderInfo: JSON.stringify({
                        orderid: app.getSearchParams().id,
                        state: '3'
                    })
                })
                .then(function (data) {
                    $.toast('已确认！');
                    setTimeout(function () {
                        location.reload()
                    }, 1000)
                })
                .catch(function (data) {
                    if (data.error) {
                        $.toast('确认失败：' + data.error.message);
                    } else {
                        $.toast('确认失败！');
                    }
                })
        })
    },
    subeva: function (obj) {
        app.request('/mall/saveproducteval', {
                eval: JSON.stringify(obj)
            })
            .then(function (data) {
                $.confirm('继续评价其他商品？', '商品评价成功',
                    function () {
                        $('#evamsg').val('');
                        app.pageInit("#evaluate")
                    },
                    function () {
                        window.location.href = './marketorderlist.html';
                    }
                );
            })
            .catch(function (data) {
                if (data.error) {
                    $.toast("评价失败！" + data.error.message);
                } else {
                    $.toast("评价失败！")
                }
            })
    },
    evaStar: function (that) { //星星评分
        var num = $(that).attr('data-num');

        $("#js-star>span").addClass('active');
        $(that).removeClass('active');
        var INDEX = $(that).attr("data-num");
        $("#pingjiasub").attr({
            'data-score': parseInt(INDEX) + 1
        });
        var SC = $("#pingjiasub").attr('data-score');

        if (SC == 1) {
            $("#pingjiasub").attr({
                'data-leve': 2
            });
        } else if (SC == 2 || SC == 3) {
            $("#pingjiasub").attr({
                'data-leve': 1
            });
        } else if (SC == 4 || SC == 5) {
            $("#pingjiasub").attr({
                'data-leve': 0
            });
        }
        $("#js-star>span").each(function (index, ele) {

            if (index < INDEX) {
                $(ele).removeClass('active');
            }
        })
    },
    initpages: function () {
        orderdatailmodul.getlocainfo();
    }
};
app.checkLogin()
    .then(function (data) {
        orderdatailmodul.initpages();
    })


//星星评分
$("#js-star").on('click', 'span', function () {
    var that = this;
    orderdatailmodul.evaStar(that)
});
$('#pingjiaback').click(function() {
    app.pageInit("#evaluate")
})
//提交评价
$("#pingjiasub").click(function () {
    orderdatailmodul.subeva({
        productid: $(this).attr("data-submcdid"),
        orderid: $(this).attr("data-subid"),
        leve: $(this).attr("data-leve"),
        score: $(this).attr("data-score"),
        info: $("#evamsg").val(),
        custid: applicationCache.custid,
        nickname: app.nickname
    });
});
//再次发送红包
$("#index").on("click", "#resend", function () {
    app.checkOut.reSendRedpacket();
});
//去评价
$("#index").on("click", "#qupingjia", function () {
    app.pageInit("#evaluate");
});
//结算
$("#index").on("click", "#checkout", function () {
    app.checkOut.checkOut(app.getSearchParams().id)
})
//确认收货
$("#index").on("click", "#sureget", function () {
    orderdatailmodul.isgetgoods();
})
//去使用，联系万码一联
$("#index").on("click", "#use", function () {

    window.location.href = "./selfqoupon.html";
});
//要评价 的商品
$("#pingbox").on("click", '[data-goodid]', function () {
    app.pageInit("#evaluatedetail")
})
$("#pingbox").on('click', '.ping', function () {
    $("#pingsrc").attr({
        "src": $(this).attr('data-img')
    });
    $("#pingjiasub").attr({
        'data-subid': $(this).attr('data-orderid')
    });
    $("#pingjiasub").attr({
        'data-submcdid': $(this).attr('data-goodid')
    });
});
//查看物流信息
$(".page").on('click', '.logistics', function () {
    $.openPanel("#panel-js-demo");
    var that = this;
    orderdatailmodul.getBlhExpress();
});