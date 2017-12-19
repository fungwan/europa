/**
 * Created by 75339 on 2017/2/21.
 */
var marketshopcar = {
    renderList: function (data) {
        var d = data.data.rows;
        var Outofstock = "";
        for (var i = 0; i < d.length; i++) {
            var shopcartNum = d[i].number;
            var stockNum = d[i].mallproduct.amount;
            var num = null;

            if (shopcartNum > stockNum) {//大于库存
                num = stockNum
                Outofstock += "商品：" + d[i].mallproduct.productname + "库存不足!</br>";
            } else {
                Outofstock = "";
                num = shopcartNum
            }
            $(".cardbox").append(`
                <div class="card clear">
                    <div class="checkit">
                        <label>
                            √<input data-id="${d[i].id}" type="checkbox" class="checkboxitem" data-total="${app.math.accMul(num, Number(d[i].mallproduct.price))}">
                        </label>
                    </div>
                    <div class="pic">
                        <a class="external" href="./marketgoodsdetail.html?proid=${d[i].productid}"><img src="${data.data.imageurl}${d[i].mallproduct.productimage}-${data.data.imagestyle}" alt=" 商品图片"></a>
                    </div>
                    <div class="maininfo">
                        <div class="pname">${d[i].mallproduct.productname}</div>
                        <div class="price">￥${d[i].mallproduct.price}</div>
                        <div class="price" style="font-style:italic;font-size:0.6rem">${d[i].mallproduct.isDiscount==0 ? '' : '可折扣' }</div>                        
                        <div class="control clear">
                            <span class="delnum" data-id="${d[i].id}" data-price="${d[i].mallproduct.price}">-</span>
                            <span class="controlnum"><input data-id="${d[i].id}" type="text" value="${num}" data-changemax="${d[i].mallproduct.amount}" data-price="${d[i].mallproduct.price}"></span>
                            <span class="addnum" data-addmax="${d[i].mallproduct.amount}" data-id="${d[i].id}" data-price="${d[i].mallproduct.price}">+</span>
                        </div>
                    </div>
                    <span class="icon icon-remove" data-cartid="${d[i].mallproduct.productid}"></span>
                </div>
            `)
        };
        $(".cardbox").prepend(`<div id="stock" class="stock">${Outofstock}</div>`)
        setTimeout(function () {
            $("#stock").hide();
        }, 5000)
        if (d.length < app.scollItem.size || d.length == 0) {
            // 加载完毕，则注销无限加载事件，以防不必要的加载
            $.detachInfiniteScroll($('.infinite-scroll'));
            // 删除加载提示符
            $('.infinite-scroll-preloader').hide();
            $.toast("没有更多记录了！");
        }
        app.scollItem.loading = false;
    },
    delshopcar: function (proid) {
        $.confirm('确认删除宝贝吗？', function () {
            app.request('/mall/deleteshopcart', {
                custid: app.custid,
                productid: proid
            }).then(function (data) {
                $("#allselect").prop("checked",false);
                $("#allselect").parent().removeClass("active");
                $("#fitptal").html("0");
                window.sessionStorage.setItem('selid', [])
                app.scollItem.init();
                app.scollItem.addItems(
                    '/mall/getshopingcart',
                    {
                        custid: app.custid,
                        page: app.scollItem.page,
                        size: app.scollItem.size
                    })
                    .then(function (data) {
                        marketshopcar.renderList(data);
                    })
            }).catch(function (data) {
                if (data.error) {
                    $.toast("删除失败:" + data.error.message)
                } else {
                    $.toast("删除失败");
                }
            });
        });

    },
    updatenumber: function (obj) {
        app.request('/mall/updateshopitemnumber', obj)
            .then(function (data) {

            }).catch(function (data) {
                if (data.error) {
                    $.toast("更新失败:" + data.error.message)
                } else {
                    $.toast("更新失败");
                }
            })
    },
    initmypage: function () {
        app.scollItem.addItems(
            '/mall/getshopingcart',
            {
                custid: app.custid,
                page: app.scollItem.page,
                size: app.scollItem.size
            })
            .then(function (data) {
                marketshopcar.renderList(data);
            })
    }
};
app.checkLogin()
    .then(function () {
        window.sessionStorage.removeItem('selid');
        app.getGrade();
        marketshopcar.initmypage();
    });
$(document).on('infinite', '.infinite-scroll-bottom', function () {
    $.refreshScroller();
    if (app.scollItem.loading) return;
    app.scollItem.page++;
    app.scollItem.loading = true;
    app.scollItem.addItems(
        '/mall/getshopingcart',
        {
            custid: app.custid,
            page: app.scollItem.page,
            size: app.scollItem.size
        })
        .then(function (data) {
            marketshopcar.renderList(data);
        })
});
var idarr = [];
$(".cardbox").on('change', '.checkboxitem', function () {

    var cc = [];
    $(".checkboxitem").each(function (index, ele) {

        if ($(ele).prop('checked')) {
            cc.push(index);
        }
        if (cc.length == $(".checkboxitem").length) {
            $("#allselect").prop('checked', true);
            $("#allselect").parent().addClass("active")
        }
    });
    if ($(this).prop('checked')) {
        $(this).parent().addClass("active")
        var ID = $(this).attr('data-id');
        if (idarr.indexOf(ID) <0) {
            idarr.push(ID);
        }
        //console.log(idarr)
    } else {
        $(this).parent().removeClass("active")
        $("#allselect").prop('checked', false);
        $("#allselect").parent().removeClass("active")
        var IDs = $(this).attr('data-id');
      
        var index=idarr.indexOf(IDs);
      
            idarr.splice(index,1)
            $("#fitptal").html('0');
         
    
        
    }
    var a = [];
    $(".checkboxitem").each(function (index, ele) {

        if ($(ele).prop('checked')) {
            a.push(Number($(ele).attr('data-total')));
            $("#fitptal").html(a.sum().toFixed(2))
        }
    });
      console.log(idarr)
    window.sessionStorage.setItem('selid', idarr);
    $("#gogopay").attr({ 'data-idarr': idarr.join(",") })
});


//所有全选
$("#allselect").change(function () {
    var state = $(this).prop('checked');
    $(".cardbox").find('.checkboxitem').prop('checked', state);

    if (state) {
        $(this).parent().addClass("active");
        $(".cardbox").find('label').addClass("active")
        var a = [];
        idarr.length=0;
        $(".checkboxitem").each(function (index, ele) {

            if ($(ele).prop('checked')) {
                a.push(Number($(ele).attr('data-total')));
                idarr.push($(ele).attr('data-id'));
                $("#fitptal").html(a.sum().toFixed(2))
            }
        })
        console.log(idarr)
        window.sessionStorage.setItem('selid', idarr)
    } else {
         
           idarr.length=0;
        $(this).parent().removeClass("active");
        $(".cardbox").find('label').removeClass("active")
        $("#fitptal").html('0');
         console.log(idarr)
        window.sessionStorage.setItem('selid', "")
    }
});

//商品加减(限制商品数量的取值范围)
$(".cardbox").on('click', '.addnum', function () {
    var value = $(this).prev().children().eq(0).val();
    var maxvalue = $(this).attr("data-addmax");
    var sid = $(this).attr("data-id");
    if (Number(value) >= Number(maxvalue)) {
        $(this).addClass("disabled");
        $(this).prev().children().eq(0).val(maxvalue)
    } else {
        $(this).siblings().removeClass("disabled")
        $(this).prev().children().eq(0).val(parseInt(value) + 1)
    }
    marketshopcar.updatenumber({
        itemid: sid,
        number: $(this).prev().children().eq(0).val()
    });

    $(this).parent().parent().siblings().children().children().eq(0).attr({ 'data-total': app.math.accMul(Number($(this).prev().children().eq(0).val()), Number($(this).attr("data-price"))) })
    var a = [];
    $(".checkboxitem").each(function (index, ele) {

        if ($(ele).prop('checked')) {
            a.push(Number($(ele).attr('data-total')));
            $("#fitptal").html(a.sum().toFixed(2))
        }
    })
});
$(".cardbox").on('click', '.delnum', function () {
    var value = $(this).next().children().eq(0).val();
    var sid = $(this).attr("data-sid");
    if (Number(value) <= 1) {
        $(this).next().val("1");
        $(this).addClass("disabled")
    } else {
        $(this).siblings().removeClass("disabled");
        $(this).next().children().eq(0).val(Number($(this).next().children().eq(0).val()) - 1);
    }
    marketshopcar.updatenumber({
        itemid: $(this).attr("data-id"),
        number: $(this).next().children().eq(0).val()
    });


    $(this).parent().parent().siblings().children().children().eq(0).attr({ 'data-total': app.math.accMul(Number($(this).next().children().eq(0).val()), Number($(this).attr("data-price"))) })
    var a = [];
    $(".checkboxitem").each(function (index, ele) {

        if ($(ele).prop('checked')) {
            a.push(Number($(ele).attr('data-total')));
            $("#fitptal").html(a.sum().toFixed(2))
        }
    })
});

$(".cardbox").on('change', '[data-changemax]', function () {
    if (isNaN($(this).val()) || 0 >= $(this).val() || !(Number($(this).val()) % 1 == 0)) {
        $.toast("输入不合法！");
        $(this).val("1");
        marketshopcar.updatenumber({
            itemid: $(this).attr("data-id"),
            number: $(this).val()
        });
    }

    var sid = $(this).attr("data-id");
    $(this).parent().parent().parent().siblings().children().children().eq(0).attr({ 'data-total': app.math.accMul(Number($(this).val()), Number($(this).attr("data-price"))) })
    var value = $(this).val();
    var maxvalue = $(this).attr('data-changemax');
    if (value <= 1) {
        $(this).val("1");

        $(this).parent().parent().parent().siblings().children().children().eq(0).attr({ 'data-total': app.math.accMul(Number($(this).val()), Number($(this).attr("data-price"))) })
        var a = [];
        $(".checkboxitem").each(function (index, ele) {

            if ($(ele).prop('checked')) {

                a.push(Number($(ele).attr('data-total')));
                $("#fitptal").html(a.sum().toFixed(2))
            }
        });
        return;
    } else if (parseInt(value) >= parseInt(maxvalue)) {
        $.toast('已超出库存！')
        $(this).val(maxvalue);
        $(this).parent().parent().parent().siblings().children().children().eq(0).attr({ 'data-total': app.math.accMul(Number($(this).val()), Number($(this).attr("data-price"))) })
    }
    marketshopcar.updatenumber({
        itemid: $(this).attr("data-id"),
        number: $(this).val()
    });
    var a = [];
    $(".checkboxitem").each(function (index, ele) {

        if ($(ele).prop('checked')) {

            a.push(Number($(ele).attr('data-total')));
            $("#fitptal").html(a.sum().toFixed(2))
        }
    });
});

//去结算
$("#gogopay").click(function (e) {
    e.preventDefault();
    var n = $("#fitptal").html();
    // if(app.point<Number(n)){
    //     $.toast("积分不足！");
    //     return;
    // }
    if (Number(n) > 0) {
        window.location.href = './marketgopay.html'
    } else {
        $.toast("您还没有选择商品！");
    }
});
//删除购物车
$(".cardbox").on('click', '.icon-remove', function () {
    idarr.length=0;
    var proid = $(this).attr('data-cartid');
    marketshopcar.delshopcar(proid);
});
