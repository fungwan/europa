/**
 * Created by 75339 on 2017/2/23.
 */
var goodsdetail = {
    enterpasstime: 0,
    productid: null,
    price: null, //单价
    level: "",
    type: null,
    addShopVali: true,
    isDiscount: 0,
    ratio: 100, //积分与人民币比例
    calculation: function(num, point) { //商品数量，抵扣的积分

        var Result = {
            originalL: parseInt(num) * goodsdetail.price, //原始金额
            discount: 0, //优惠
            maxUsePoint: 0, //最多可以使用的积分
            paid: null //实付
        }

        //比较最大积分与最多可以抵扣的积分大小
        Result.maxUsePoint = Result.originalL * goodsdetail.ratio;

        Result.discount = (Number(point) / goodsdetail.ratio);
        Result.paid = Number(Result.originalL - Result.discount) //实付
        return Result;
    },
    updatenumber: function(obj) {
        app.request('/mall/updateshopitemnumber', obj)
            .then(function(data) {

            }).catch(function(data) {
                if (data.error) {
                    $.toast("更新失败:" + data.error.message)
                } else {
                    $.toast("更新失败");
                }
            })
    },
    renderTpl: function(data) {
        if (data.data.state == 3) {
            var d = data.data;
            goodsdetail.orderInfoTpl(d, 'redsucc', '您的订单提交成功,请注意去微信接收红包。')
        } else if (data.data.state != 3) {
            var d = data.data;
            goodsdetail.orderInfoTpl(d, 'redfail', '您的订单提交失败,请去我的订单尝试重新发送。')
        }
    },
    AnimateOut: function() {
        $(".opup").css({
            'bottom': '0rem',
            'transition': '0.5s ease-in-out'
        });
        $("#tab1").css({
            'transform': 'scale(0.9)',
            'transition': '0.5s ease-in-out'
        });

    },
    AnimateIn: function(h) {
        $(".opup").css({
            'bottom': h,
            'transition': '0.5s ease-in-out'
        });
        $("#tab1").css({
            'transform': 'scale(1)',
            'transition': '0.5s ease-in-out'
        })
    },
    parm: function() {
        return {
            productid: goodsdetail.productid,
            leve: goodsdetail.level,
            pagenumber: app.scollItem.page,
            pagesize: app.scollItem.size
        }
    },
    addShopCartProduct: function() {
        goodsdetail.checkPassPointPro()
            .then(function(data) {
                if (data) {
                    var senobj = {
                        custid: app.custid,
                        number: $(".goodsnum").val(),
                        productid: goodsdetail.productid
                    };
                    goodsdetail.shopcaradd(senobj);
                    setTimeout(function() {
                        $("#fly").css({
                            'transition': '0s ease-in-out',
                            'transform': 'translate(0vw,0vh) rotate(-3600deg)'
                        });
                    }, 1000)
                }
            });
    },
    renderTplQoupon: function(data) {
        //提交礼券订单后渲染html
        $.toast("下单失败" + data.error.message)
    },
    renderList: function(data) {
        var d = data.data.rows;
        if (data.data.rows && data.data.rows.length != 0) {
            function star(star) {
                if (parseInt(star) == 0 || parseInt(star) == 1) {
                    star = "差评"
                } else if (parseInt(star) == 2 || parseInt(star) == 3) {
                    star = "中评"
                } else if (parseInt(star) == 4 || parseInt(star) == 5) {
                    star = "好评"
                }
                return star;
            }
            for (var i = 0; i < d.length; i++) {
                $(".cardbox").append(`<div class="card">
                                    <div class="card-header"><span><img src="../images/${d[i].score}.png" style="width:4rem"></span><span>${star(d[i].score)}</span></div>
                                    <div class="card-content">
                                        <div class="list-block media-list">
                                            <ul>
                                                <li class="msg">${d[i].info}</li>
                                                <li class="item-content">
                                                    <div class="item-media" style="overflow-x: scroll" id="pic${d[i].productid}">

                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div class="card-footer">
                                    ${d[i].nickname} <span>${moment(d[i].createtime).format().slice(0, 10)}</span>

                                    </div>
                                </div>`);
                if (d[i].image && d[i].image.length != 0) {
                    for (var m = 0; m < d[i].image; m++) {
                        $("#pic" + d[i].productid).append(`<img src="${config.mall.productimageurl + d[i].image[m] + '-' + config.mall.productimagestyle}" width="60">`)
                    }
                } else {
                    $(".item-content").hide()
                }
            };
            if (d.length < app.scollItem.size || d.length == 0) {
                // 加载完毕，则注销无限加载事件，以防不必要的加载
                $.detachInfiniteScroll($('.infinite-scroll'));
                // 删除加载提示符
                $('.infinite-scroll-preloader').hide();
                $.toast("没有更多记录了！");
            }
            app.scollItem.loading = false;
        } else {
            $('.infinite-scroll-preloader').hide();
            $.toast("没有更多记录了！");
        }
    },
    levelCount: function() {
        app.request('/mall/getproducteval', {
                productid: goodsdetail.productid
            })
            .then(function(data) {
                if (data.data && data.data.count) {
                    var d = data.data.count;
                    var eva = {
                        "0": 0,
                        "1": 0,
                        "2": 0
                    }
                    for (var i = 0; i < d.length; i++) {
                        eva[d[i].leve] = d[i].count
                    }
                    $("#inittricker").html(`好评<br/>${eva[0]}`);
                    $("#initmid").html(`中评<br/>${eva[1]}`);
                    $("#initbad").html(`差评<br/>${eva[2]}`);
                    var numtol = [];
                    for (var t = 0; t < d.length; t++) {
                        numtol.push(d[t].count);
                    }
                    $("#alleva").html(`全部评价<br/>${numtol.sum()}`)
                }
            })
            .catch(function(data) {
                if (data.error) {
                    $.toast("获取评价数量失败:" + data.error.message)
                } else {
                    $.toast("获取评价数量失败")
                }
            })
    },
    shopcaradd: function(obj) {
        app.request('/mall/addtoshopcart', obj)
            .then(function(data) {
                if (data.data == true) {
                    $("#fly").css({
                        'transition': '1s ease-in-out',
                        'transform': 'translate(100vw,-100vh) rotate(3600deg)'
                    });
                    $.toast("添加商品成功");
                    goodsdetail.AnimateIn();
                } else {
                    $.toast("添加商品失败:" + data.error.message);
                    goodsdetail.AnimateIn();
                }
            })
            .catch(function(data) {
                if (data.error) {
                    $.toast("添加购物车失败:" + data.error.message)
                } else {
                    $.toast("添加购物车失败");
                }
            })
    },
    renderProductHtml: function(data) {
        if (data.data.info && data.data.info.htmlinfo) {
            if (data.data.baseinfo.producttype == "qoupon") {
                var html = data.data.info.htmlinfo || '';
            } else {
                var html = data.data.info.htmlinfo || '没有详情';
            }

        } else {
            if (data.data.baseinfo.producttype == "qoupon") {
                var html = '';
            } else {
                var html = '没有详情';
            }

        }
        if(data.data.baseinfo.producttype == 'blh') {
            $('.produce').addClass('special-blh');
        }
        $(".produce").html(html);
    },
    renderProductSwiper: function(data) {
        if (data.data.info && data.data.info.images && data.data.info.images.length != 0) {
            var pic = data.data.info.images;
            var picweb = data.data.info;
            app.initSwiperProduct(pic, picweb, data.data.baseinfo.producttype)
        }
    },
    renderProductMain: function(data) {
        if (data.data.baseinfo) {
            var info = data.data.baseinfo;
            var txt = app.Product.typeTxt(info.producttype);
            $(".maincon").html(info.productinfo || '暂无');

            var price = info.price;
            var txt = app.unit;
            goodsdetail.price = price;

            $('.pro-info-box').html(`
                <div class="pro-info lf pro-info-lf">
                    <div class="pro-info-lf-item lf pro-lf">
                        <span class="type ${info.producttype}">${app.Product.typeTxt(info.producttype)}</span>
                    </div>
                    <div class="pro-info-lf-item lf pro-right">
                        <div class="pro-info-lf-item-name">
                            <div>${info.productname || '暂无'}</div>
                        </div>
                    </div>
                </div>
                <div class="pro-info lf pro-info-rt">
                    <div class="p-price">${price}<span>${info.producttype == 'redpacket' ? '积分' : txt}</span></div>
                    <div class="p-info">
                        <div class="leve"><img src="../images/${info.leve}.png" style="width:4rem"></div>
                        <div class="p-amount">库存:${info.amount || 0}</div>
                    </div>
                </div>
            `);
            if (info.validity_beg) {
                $(".qouponListBoxtime").append(`<div class="row" >
                                        <div class="col-100">有效时间：${info.validity_beg.slice(0, 10)}-----${info.validity_end.slice(0, 10)}</div>
                                        
                                    </div><div class="row" >
                                        <div class="col-50">库存：${info.amount}</div>
                                        
                                    </div>`);
            }
        }
    },
    RenderPopOutBlh: function(info) {
        //库存设置
        $('.addshop').html('立即购买');
        $('.addshop').attr({
            type: 'blh'
        });
        console.log(info)
        goodsdetail.stockNum = info.amount;
        goodsdetail.isDiscount = info.isDiscount;
        var src = '';
        if (info.producttype = 'blh') {
            src = info.productimage;
        } else {
            src = config.mall.productimageurl + info.productimage + '-' + config.mall.productimagestyle
        }
        $('.opup').html(`
            <div class="picimg" id='fly'><img data-img="${info.productimage}" src="${src}" alt="" width="80" height="80"></div>
            <span data-type="red" class="clos">×</span>
            <div class="ppname">${info.productname || '暂无'}</div>
            <div class="ponum clear">
                <span class="lf">数量：</span>
                <span class="numgroup rt">
                    <span class="numdel" data-sid="${info.productid}">-</span>
                    <input data-sid="${info.productid}" 
                           data-numid="${info.amount}" 
                           id="${info.productid}val" 
                           type="number" 
                           class="goodsnum" 
                           value="1" 
                           disabled
                           data-max="${info.amount}">
                    <span class="numadd" data-sid="${info.productid}">+</span>
                </span>
            </div>
            <div class="pppice" style="visibility:hidden">￥<span class="oldprice">${Number(info.price).toFixed(2) || 0.00}</span> 元</div>
            <div class="Calculation">
                <div class="row discountrow" style="display:none;">
                    <div class="col-10 desc">抵扣</div>
                    <div class="col-90 number"><span class="discount"></span>元</div>
                </div>
                <div class="row">
                    <div class="col-10 desc">实付</div>
                    <div class="col-90 number"><span class="paid"></span>元</div>
                </div>
            </div>
            <div class="tol">
                合计：<span class="addn">1</span>
                <span class="oneprice">${info.price || 0} </span>
                <span class="ptol">${Number(info.price).toFixed(2)  || 0}</span>
                ${app.unit}
            </div>
            <div data-type="other" class="sureaddshop" data-productid=${info.productid}>确定</div>
        `);
    },
    RenderPopOutRedTpl: function(info) {
        $('.addshop').html('立即兑换');
        //红包的弹出框
        $('.opup').html(`<div class="picimg"><img data-img="${info.productimage}" src="${config.mall.productimageurl + info.productimage + '-' + config.mall.productimagestyle}" alt="" width="80" height="80"></div>
                        <div class="picimg" id='fly'><img data-img="${info.productimage}" src="${config.mall.productimageurl + info.productimage + '-' + config.mall.productimagestyle}" alt="" width="80" height="80"></div>
            <span data-type="red" class="clos">×</span>
            <div class="ppname">${info.productname || '暂无'}</div>
            <div class="pppice">￥${info.price || 0}积分</div>
            <div class="tol">合计：<span class="addn">1</span><span class="oneprice">${info.price || 0} </span><span class="ptol">${info.price  || 0}</span>积分</div>
            <div class="ponum clear">
                <span class="lf">数量</span>
                <span class="numgroup rt">
                    <span class="numdel" data-sid="${info.productid}">-</span>
                    <input data-sid="${info.productid}" 
                           data-numid="${info.amount}" 
                           id="${info.productid}val" 
                           type="number" 
                           class="goodsnum" 
                           disabled 
                           value="1" 
                           data-max="${info.amount}">
                    <span class="numadd" data-sid="${info.productid}">+</span>
                </span>
            </div>
            <div data-type="red" class="sureaddshop" data-productid=${info.productid}>确定</div>`);
    },
    RenderPopOutProTpl: function(info) {
        //库存设置
        $('.addshop').html('加入购物车');
        $(".mycart").css({
            display: 'table-cell'
        })
        goodsdetail.stockNum = info.amount;

        $('.opup').html(`<div class="picimg"><img data-img="${info.productimage}" src="${config.mall.productimageurl + info.productimage + '-' + config.mall.productimagestyle}" alt="" width="80" height="80"></div>
                        <div class="picimg" id='fly'><img data-img="${info.productimage}" src="${config.mall.productimageurl + info.productimage + '-' + config.mall.productimagestyle}" alt="" width="80" height="80"></div>
            <span data-type="red" class="clos">×</span>
            <div class="ppname">${info.productname || '暂无'}</div>
            <div class="tol">合计：<span class="addn">1</span><span class="oneprice">${info.price || 0} </span><span class="ptol">${Number(info.price).toFixed(2)  || 0}</span>${app.unit}</div>
            <div class="ponum clear"><span class="lf">数量</span><span class="numgroup rt"><span class="numdel" data-sid="${info.productid}">-</span><input data-sid="${info.productid}" data-numid="${info.amount}" id="${info.productid}val" type="number" class="goodsnum" disabled value="1" data-max="${info.amount}"><span class="numadd" data-sid="${info.productid}">+</span></span></div>
            <div data-type="other" class="sureaddshop" data-productid=${info.productid}>确定</div>`);
    },
    RenderPopOutQouponTplList: function(productid) {
        app.request("/mall/getqouponContent", {
                productid: productid
            })
            .then(function(data) {
                var data = data.data;
                $(".qouponList-title").show();
                $(".qouponListBox").empty();
                if (data.length == 0) {
                    $(".qouponList").hide();
                    return;
                }
                for (var i = 0; i < data.length; i++) {
                    $(".qouponListBox").append(`<div class="row" data-proid="${data[i].productid}">
                                        <div class="col-33">${data[i].productname}</div>
                                        <div class="col-33">数量：${data[i].number}</div>
                                        <div class="col-33">单价：${Number(data[i].price)}</div>
                                    </div>`);
                }
            })
            .catch(function(data) {
                $.toast("获取礼券列表出错！")
            })
    },
    RenderPopOutProTplusePoint: function(info) {
        //库存设置
        $('.addshop').html('立即购买');

        goodsdetail.stockNum = info.amount;

        $('.opup').html(`<div class="picimg"><img data-img="${info.productimage}" src="${config.mall.productimageurl + info.productimage + '-' + config.mall.productimagestyle}" alt="" width="80" height="80"></div>
                        <div class="picimg" id='fly'><img data-img="${info.productimage}" src="${config.mall.productimageurl + info.productimage + '-' + config.mall.productimagestyle}" alt="" width="80" height="80"></div>
            <span data-type="red" class="clos">×</span>
            <div class="ppname">${info.productname || '暂无'}</div>
            <div class="tol">合计：<span class="addn">1</span><span class="oneprice">${info.price || 0} </span><span class="ptol">${Number(info.price).toFixed(2) || 0}</span>${app.unit}</div>
            <div class="ponum clear"><span class="lf">数量</span><span class="numgroup rt"><span class="numdel" data-sid="${info.productid}">-</span><input data-sid="${info.productid}" data-numid="${info.amount}" id="${info.productid}val" type="number" class="goodsnum" value="1" data-max="${info.amount}"><span class="numadd" data-sid="${info.productid}">+</span></span></div>
            <div data-type="other" class="sureaddshop" data-productid=${info.productid}>确定</div>`);
    },
    RenderPopOutQouponTpl: function(info) {
        //库存设置
        $('.addshop').html('立即购买');

        goodsdetail.stockNum = info.amount;

        $('.opup').html(`<div class="picimg"><img data-img="${info.productimage}" src="${config.mall.productimageurl + info.productimage + '-' + config.mall.productimagestyle}" alt="" width="80" height="80"></div>
                        <div class="picimg" id='fly'><img data-img="${info.productimage}" src="${config.mall.productimageurl + info.productimage + '-' + config.mall.productimagestyle}" alt="" width="80" height="80"></div>
            <span data-type="red" class="clos">×</span>
            <div class="ppname">${info.productname || '暂无'}</div>
            <div class="tol">合计：<span class="addn">1</span><span class="oneprice">${info.price || 0} </span><span class="ptol">${Number(info.price).toFixed(2)  || 0}</span>${app.unit}</div>
            <div class="ponum clear"><span class="lf">仅支持单件下单</span><span class="numgroup rt"><span style="display:none" class="numdel" data-sid="${info.productid}">-</span><input disabled data-sid="${info.productid}" data-numid="${info.amount}" id="${info.productid}val" type="number" class="goodsnum" value="1" data-max="${info.amount}">个<span style="display:none" class="numadd" data-sid="${info.productid}">+</span></span></div>
            <div data-type="other" class="sureaddshop" data-productid=${info.productid}>确定</div>`);

    },
    orderInfoTpl: function(d, Src, titleOrder) {
        $(".page-group>div").removeClass('page-current');
        $("#orderinfo").addClass("page-current");
        $.init();
        $(".orinfo").html(`<p class="mtit"><img src="../images/marketindex/${Src}.gif" alt="">${titleOrder}</p>
                <p class="order">订单编号：${d.orderbm} </p>
                <p class="order">订单时间：${app.Fmat.getLocalTime(d.createtime)}</p>
                <p class="order">订单总额：${Number(d.paymoney)}${app.unit}</p>
                <p><a href="./marketorderlist.html" class="external button-big button button-success button-fill">查看订单</a></p>`);
    },
    getproinfo: function(procid) {
        app.request('/mall/getproductinfo', {
                productid: goodsdetail.productid
            })
            .then(function(data) {
                if (data.data) {
                    if (data.data.baseinfo.producttype == "product") {
                        $("#pjj").show();
                    }
                    //礼品详情模板
                    goodsdetail.renderProductHtml(data);
                    //礼品详情轮播图
                    goodsdetail.renderProductSwiper(data);
                    //礼品主页信息
                    goodsdetail.renderProductMain(data);
                    //渲染不同礼品类型的pop框模板
                    if (data.data.baseinfo) {
                        var info = data.data.baseinfo;
                        app.Product.type = info.producttype;
                        if (info.producttype == 'net') {
                            goodsdetail.RenderPopOutNetTpl(info)
                        } else if (info.producttype == 'redpacket') {
                            goodsdetail.RenderPopOutRedTpl(info);
                        } else if (info.producttype == 'cinema') {
                            goodsdetail.RenderPopOutCinemaTpl(info);
                        } else if (info.producttype == 'product') {
                            goodsdetail.RenderPopOutProTpl(info);
                        } else if (info.producttype == 'point') {
                            goodsdetail.RenderPopOutProTpl(info);
                        } else if (info.producttype == 'phone') {
                            goodsdetail.RenderPopOutPhoneTpl(info);
                        } else if (info.producttype == 'qoupon') {
                            goodsdetail.RenderPopOutQouponTpl(info);
                        } else if (info.producttype == 'blh') {
                            goodsdetail.RenderPopOutBlh(info);
                        }
                    }
                }
            })
            .catch(function(data) {
                console.log(data)
                if (data.error) {
                    $.toast("获取商品信息失败:" + data.error.message);
                    return
                }
                $.toast("获取商品信息失败");
            });
    },
    checkPassPointPro: function() {
        return new Promise(function(resolve, reject) {
            if ($(".goodsnum").val() == 0) {
                $.toast('请选择商品数量');
                resolve(false)
            } else {
                resolve(true)
            }
        })
    },
    checkPassPointNow: function() {
        var type = app.Product.type;
        var haspass = app.haspass;
        var point = Number(app.point);
        if ($(".goodsnum").val() == 0) {
            $.toast('请选择商品数量');
            return false;
        } else {
            return true;
        };
        if (!haspass) {
            $.confirm("请先设置支付密码", '提示', function() {
                window.location.href = "./selfsafe.html";
            });
            return false;
        } else {
            if (Number($(".ptol").html()) > point) {
                $.toast('积分不足！');
                return false;
            } else {
                return true;
            }
        }

    },
    initQouponCalculationResult: function() { //初始化积分抵扣信息

        if ($(".checkGrade").prop("checked")) {
            var calculationResult = goodsdetail.calculation($(".goodsnum").val(), $(".maxPoint").val());
            $(".paid").html(calculationResult.paid);
            $(".discount").html(Number(calculationResult.discount))
        } else {
            var calculationResult = goodsdetail.calculation($(".goodsnum").val(), 0);
            $(".paid").html(calculationResult.paid);
        }
    },
    productAdd: function(that) {
        var value = $(that).prev().val();
        var maxvalue = $(that).prev().attr("data-max");
        var sid = $(that).attr("data-sid");
        if (Number(value) >= Number(maxvalue)) {
            $(that).prev().val(maxvalue);
            $.toast("已超出库存了")
        } else {
            $(that).prev().val(parseInt(value) + 1)
        }

        $(".addn").html($(that).prev().val());
        if ($('.addshop').html() == '立即兑换') {
            $(".ptol").html((Number($(".addn").html()) * Number($(".oneprice").html())).toFixed(0));
        } else {
            $(".ptol").html((Number($(".addn").html()) * Number($(".oneprice").html())).toFixed(2));
        }

        goodsdetail.initQouponCalculationResult();
    },
    productDel: function(that) {
        $(".maxPoint").val(0)
        var value = $(that).next().val();
        var maxvalue = $(that).next().attr("data-max");
        var sid = $(that).attr("data-sid");
        if (value <= 1) {
            $(that).next().val("1");
            return;
        } else {
            $(that).next().val(parseInt(value) - 1);
            if ($(that).next().val() == 0) {
                $(".addn").html(0);
                $(".ptol").html((Number($(".addn").html()) * Number($(".oneprice").html())));
                return;
            }
        }
        $(".addn").html($(that).next().val());
        if ($('.addshop').html() == '立即兑换') {
            $(".ptol").html((Number($(".addn").html()) * Number($(".oneprice").html())).toFixed(0));
        } else {
            $(".ptol").html((Number($(".addn").html()) * Number($(".oneprice").html())).toFixed(2));
        }
        //初始化积分抵扣信息
        goodsdetail.initQouponCalculationResult();
    },
    productChange: function(that) {
        var sid = $(that).attr("data-sid");
        $(that).parent().siblings().children("input").attr({
            'data-total': Number($(that).val()) * Number($("#" + sid + "jifen").html())
        })
        var value = $(that).val();
        var maxvalue = $(that).attr('data-max');
        if (value <= 1) {

            $(that).val("1");
            $(".addn").html($(that).val());
            $(".ptol").html((Number($(".addn").html()) * Number($(".oneprice").html())).toFixed(2));
            return;
        } else if (parseInt(value) >= parseInt(maxvalue)) {
            $(that).val(maxvalue);
            $.toast("已超出库存了")
        }
        $(".addn").html($(that).val());
        $(".ptol").html((Number($(".addn").html()) * Number($(".oneprice").html())).toFixed(2));

        //初始化积分抵扣信息
        goodsdetail.initQouponCalculationResult();
    },
    inputPointLimitCalculationResult: function() {
        var calculationResult = goodsdetail.calculation($(".goodsnum").val(), $(".maxPoint").val());
        $(".paid").html(calculationResult.paid);
        $(".discount").html(Number(calculationResult.discount))
    },
    inputPointLimit: function() {
        if (!app.RegVali.posInt($(".maxPoint").val())) {
            $.toast("积分为正整数");
            $(".maxPoint").val("0")
            return;
        }
        //现有积分与要抵扣积分比较
        var value = app.point;
        var maxvalue = Number($('.oldprice').html()) * Number($(".goodsnum").val()) * goodsdetail.ratio;
        console.log(maxvalue)
        if (parseInt($(".maxPoint").val()) <= 0) {
            $(".maxPoint").val("0");
            goodsdetail.inputPointLimitCalculationResult();
            return;
        } else {
            if (parseInt(maxvalue) > app.point) { //最大值是现有积分
                if (parseInt($(".maxPoint").val()) > app.point) {
                    $.toast('已超出现有积分！');
                    $(".maxPoint").val(value);
                    goodsdetail.inputPointLimitCalculationResult();
                } else {
                    goodsdetail.inputPointLimitCalculationResult();
                }


            } else { //最大值是能抵扣积分
                if (parseInt($(".maxPoint").val()) > parseInt(maxvalue)) {
                    $.toast('已超出抵扣限额最大值！');
                    $(".maxPoint").val(maxvalue);
                    goodsdetail.inputPointLimitCalculationResult();
                } else {
                    goodsdetail.inputPointLimitCalculationResult();
                }

            }
        }

    },
    initmypage: function() {
        goodsdetail.productid = app.getSearchParams().proid;
        goodsdetail.getproinfo(app.getSearchParams().proid);
        goodsdetail.levelCount();
    }
};
app.checkLogin()
    .then(function() {
        app.checkOut.init()
            .then(function() {
                goodsdetail.initmypage();

            })
    })
    //满加载
$(document).on('infinite', '.infinite-scroll-bottom', function() {
    $.refreshScroller();
    if (app.scollItem.loading) return;
    app.scollItem.page++;
    app.scollItem.loading = true;
    app.scollItem.addItems(
            '/mall/getproductevalbyleve',
            goodsdetail.parm())
        .then(function(data) {
            goodsdetail.renderList(data);
        })
});
//评价列表
$(".evahead").on('click', '.evaitem', function() {
    goodsdetail.level = $(this).attr('data-leve');
    $('.evaitem').removeClass('active');
    $(this).addClass('active');
    app.scollItem.init();
    app.scollItem.addItems(
            '/mall/getproductevalbyleve',
            goodsdetail.parm())
        .then(function(data) {
            goodsdetail.renderList(data);
        })
});
//打开弹出框
$('body').on('click', '.addshop', function() {
    var type = app.Product.type;
    if (type == 'phone' || type == 'cinema') {
        $.toast("暂无法兑换，敬请期待！");
    } else {
        goodsdetail.AnimateOut();
    }
});
//关闭弹出框
$('body').on('click', '.clos', function() {
    goodsdetail.AnimateIn('-14rem');
});
//关闭弹出框礼券
$('body').on('click', '.closQupon', function() {
    goodsdetail.AnimateIn('-18rem');
});
//添加到购物车和结算红包
$("body").on('click', ".sureaddshop", function() {
    var type = app.Product.type;
    //立即兑换或者加入购物车
    if (type == 'redpacket') {
        app.checkOut.checkOutTypeFun("redpacket", true, {
                productid: goodsdetail.productid,
                custid: app.custid,
                amount: $(".goodsnum").val(),
                remak: "",
                addid: ""
            }, goodsdetail.renderTpl) //结算类型，是否使用积分，参数，回调函数，支付成功或者失败后渲染html模板
    } else if (type == 'net') {
        goodsdetail.addShopCartNet();
    } else if (type == 'qoupon') {
        if (app.point < Number($(".ptol").html())) {
            $.toast('积分不足！');
            return;
        }
        //支付，礼券
        var data = {
            productid: goodsdetail.productid,
            number: $(".goodsnum").val()
        };

        data.point = Number($(".ptol").html());

        if (goodsdetail.stockNum <= 0) { //库存是0就不允许加入
            $.toast("库存不足！")
            return;
        }
        //结算类型，是否使用积分，参数，回调函数，支付成功或者失败后渲染html模板
        app.checkOut.checkOutTypeFun("qoupon", true, data, goodsdetail.renderTplQoupon);
    } else if (type == 'blh') {
        // if (app.point < Number($(".ptol").html())) {
        //     $.toast('积分不足！');
        //     return;
        // }

        //支付，礼券
        var data = {
            productid: goodsdetail.productid,
            number: $(".goodsnum").val(),
            isDiscount: goodsdetail.isDiscount
        };

        data.point = Number(app.point);

        if (goodsdetail.stockNum <= 0) { //库存是0就不允许加入
            $.toast("库存不足！")
            return;
        }

        data.proimg = $(".picimg img").attr('src');
        data.price = goodsdetail.price;
        data.name = $(".ppname").html();

        data = JSON.stringify(data)
        window.sessionStorage.setItem('selid', data)
        window.location.href = "./marketgopay.html"
        //结算类型，是否使用积分，参数，回调函数，支付成功或者失败后渲染html模板
        // app.checkOut.checkOutTypeFun("blh", bool, data, goodsdetail.RenderPopOutBlh);
    } else {
        if (goodsdetail.stockNum <= 0) { //库存是0就不允许加入
            $.toast("库存不足！")
            return;
        }
        goodsdetail.addShopCartProduct();
    }
});

//添加到收藏夹
$("body").on('click', '.addcollect', function() {
    var _button = $(this);
    app.request(
        '/mall/addFavoritesById', {
            productid: goodsdetail.productid
        }
    ).then(function(res) {
        if (res) {
            $.toast('收藏成功，请到我的收藏查看');
        }
    }).catch(function(error) {
        if (error.error.code == 'exists') {
            $.toast('已收藏该商品，不可重复收藏');
        } else if (error.error.code == 'refuse') {
            $.toast('收藏商品个数上限为10个，当前已到上限');
        } else {
            $.toast('收藏失败，请稍后重试');
        }
    })
})

//tab选项卡切换
$("#spp").click(function() {
    $(".evahead ").hide();
});
$("#xq").click(function() {
    $(".evahead").hide();
});
$("#pjj").click(function() {
    $(".evahead").show();
    $('.evaitem').removeClass('active');
    $('#alleva').addClass('active');
    app.scollItem.init();
    app.scollItem.addItems(
            '/mall/getproductevalbyleve',
            goodsdetail.parm())
        .then(function(data) {
            goodsdetail.renderList(data);
        })
});
//礼券详细信息
$(".qouponListBox").on("click", ".row", function() {
    var pid = $(this).attr("data-proid");
    window.location.href = "./marketgoodsdetail.html?proid=" + pid;
});
//商品加减(限制商品数量的取值范围)
$("body").on('click', '.numadd', function() {
    if (goodsdetail.stockNum <= 0) { //库存是0就不允许加入
        $.toast("库存不足！")
        return;
    }
    var that = this;
    goodsdetail.productAdd(that);
});
$("body").on('click', '.numdel', function() {
    if (goodsdetail.stockNum <= 0) { //库存是0就不允许加入
        $.toast("库存不足！")
        return;
    }
    var that = this;
    goodsdetail.productDel(that);
});
$("body").on('change', '[data-max]', function() {
    if (goodsdetail.stockNum <= 0) { //库存是0就不允许加入
        $.toast("库存不足！")
        return;
    }
    var that = this;
    goodsdetail.productChange(that);
});

//checkbox使用积分
$("body").on('change', ".checkGrade", function() {
        if ($(".checkGrade").prop("checked")) {
            //初始化积分抵扣信息
            $(".discountrow").show();
            var calculationResult = goodsdetail.calculation($(".goodsnum").val(), $(".maxPoint").val());
            $(".paid").html(calculationResult.paid);
            $(".discount").html(Number(calculationResult.discount))
        } else {
            console.log('unchecked')
            var calculationResult = goodsdetail.calculation($(".goodsnum").val(), 0);
            $(".paid").html(calculationResult.paid);
            $(".discountrow").hide();
        }
    })
    //选择积分的范围
$("body").on('change', '.maxPoint', function() { //输入积分时候的限制
    goodsdetail.inputPointLimit();
});
//商品详情a标签的默认行为
$(".produce").on("click", "a", function(e) {
    var href = $(this).attr('href');
    e.preventDefault();
    $(this).attr({
        "href": "#"
    })
    window.location.href = href;
})