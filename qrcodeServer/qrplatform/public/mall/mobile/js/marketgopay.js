/**
 * Created by 75339 on 2017/2/21.
 */
var confirmOrder = { //confirmOrder
    protype: '',
    addid: null, //地址id
    selectedProductList: [],    //进行结算商品列表
    isDiscountList: [],
    prototal: 0, //商品总数
    postPrice: 0, //邮费
    proPrice: 0, //初始商品总额
    choseGrade: false,
    maxUseGrades: 0,
    maxUseGradesmoney: 0,
    currentPay: 0, //实付金额
    totalMoney: 0,
    useGrades: $(".goodsnum").val(), //要抵扣的积分数
    ratio: 1, //积分与人民币比例
    defaultAddressId: null,
    useDiscount: false,
    usePoint: 0,
    discount: null,
    discountMoney: 0,
    pointMoney: 0,
    postData: [],

    // 计算商品初始总价格
    calculateProPrice: function() {
        // 计算商品总额，将可以打折的商品放入isDiscountList
        confirmOrder.selectedProductList.forEach(function(ele) {
            if (ele.isDiscount) {
                confirmOrder.isDiscountList.push(ele)
            }
            confirmOrder.proPrice += app.math.accMul(ele.number, ele.price)
        })
        // 按价格排序可打折商品
        confirmOrder.isDiscountList.sort(function(a, b) {
            if(a.price > b.price) {
                return -1
            } else 
                return 1
        })
    },

    maxUseGradesfun: function() { //计算最大抵扣积分数
        var mypoint = app.point;
        // （商品总额 + 邮费）* 积分现金比
        var propoint = app.math.accMul(app.math.accAdd(Number(confirmOrder.proPrice), Number(confirmOrder.postPrice)), confirmOrder.ratio);
        // 最大的是积分
        if (mypoint > propoint) {
            confirmOrder.maxUseGrades = propoint;
            confirmOrder.maxUseGradesmoney = app.math.accDiv(propoint, confirmOrder.ratio);
        } else { 
        // 最大是商品最大数额
            confirmOrder.maxUseGrades = mypoint;
            confirmOrder.maxUseGradesmoney = app.math.accDiv(mypoint, confirmOrder.ratio);
        }
        confirmOrder.updatehtml();
    },
    // 计算抵扣券抵扣的金额
    calculateDiscount: function() {
        var _arr = [].concat(confirmOrder.discount);
        // confirmOrder.isDiscountList.forEach(function(ele) {
        //     if(confirmOrder.discountNumber > ele.number) {
        //         confirmOrder.discountMoney += parseFloat((ele.number * ele.price * 0.5).toFixed(2));
        //         confirmOrder.postData.push({
        //             productid: ele.productid,
        //             discountList: _arr.splice(0, ele.number)
        //         })
        //         confirmOrder.discountNumber -= ele.number;
                // console.log(confirmOrder.discountMoney)
        //     } else if(confirmOrder.discountNumber > 0){
        //         confirmOrder.discountMoney += parseFloat((confirmOrder.discountNumber * ele.price * 0.5).toFixed(2));
        //         confirmOrder.postData.push({
        //             productid: ele.productid,
        //             discountList: _arr.splice(0, confirmOrder.discountNumber)
        //         })
        //         confirmOrder.discountNumber -= ele.number;
        //     } else {
                // console.log(confirmOrder.discountMoney)
        //     }
        // })
        // console.log('discountMoney ' + confirmOrder.discountMoney)
        // console.log('postData ' + confirmOrder.postData)

        if(confirmOrder.discount.length > 0) {
            if(confirmOrder.isDiscountList.length > 0) {
                confirmOrder.isDiscountList.forEach(function(ele) {
                    confirmOrder.discountMoney += parseFloat(ele.number * ele.price * 0.5);
                    confirmOrder.postData.push({
                        productid: ele.productid,
                        discountList: [_arr[0]]
                    })
                })
                confirmOrder.discountMoney = parseFloat((confirmOrder.discountMoney).toFixed(2));
                $('.discountName').html(confirmOrder.discount[0].productname);
                $('.discountNumber').html(1);
            } else {
                $('.discountName').parent().html('无适用折扣券');
            }
        } else {
            confirmOrder.discountMoney = 0;
            $('.discountName').parent().html('暂无折扣券');
        }
        if(confirmOrder.currentPay <= 0) {
            confirmOrder.calculatePoint(parseFloat((confirmOrder.proPrice - confirmOrder.discountMoney).toFixed(2)));
        }
        // console.log('discountMoney ' + confirmOrder.discountMoney)
    },
    // 计算积分抵扣金额
    calculatePoint: function(currentPay) {
        var moneyToPoint = currentPay * confirmOrder.ratio;
        var usePoint = moneyToPoint > app.point ? app.point : Math.ceil(moneyToPoint);
        confirmOrder.maxPoint = usePoint;
        confirmOrder.usePoint = parseInt(usePoint.toFixed(0));
        confirmOrder.pointMoney = parseFloat(app.math.accDiv(confirmOrder.usePoint, confirmOrder.ratio));
        $(".discountPoint").val(confirmOrder.usePoint.toFixed(0))
        // console.log(confirmOrder.pointMoney)
    },
    updateMoney: function() {
        var self = confirmOrder;
        var currentPay = parseFloat((self.proPrice - self.discountMoney - self.pointMoney + self.postPrice).toFixed(2));
        self.currentPay = currentPay < 0 ? 0 : currentPay;
    },
    updatehtml: function() {
        $(".proPoint").html(app.point);
        $(".proPrice").html(parseFloat((confirmOrder.proPrice).toFixed(2)));
        $(".postPrice").html(parseFloat((confirmOrder.postPrice).toFixed(2)));
        $(".currentPay").html(parseFloat((confirmOrder.currentPay).toFixed(2)));
    },

    renderPostage: function() {
        return new Promise(function(resolve, reject) {
            if (confirmOrder.addid) {
                var data = {
                    addid: confirmOrder.addid,
                    productnum: confirmOrder.prototal
                }
                app.request('/mall/getPostageByAddId', data)
                .then(function(data) {
                    confirmOrder.postPrice = data.price;
                    confirmOrder.maxUseGradesfun();
                    resolve(data);
                }).catch(function(data) {
                    // reject(data)
                    if (data.error) {
                        $.toast("获取邮费信息失败:" + data.error.message)
                    } else {
                        $.toast("获取邮费信息失败")
                    }
                })

            } else {
                confirmOrder.postPrice = 0;
                confirmOrder.maxUseGradesfun();
            }

        })
    },
    selectAddress: function(that) {
        $(".addressInfo").html(`
            <div class="addressInfoTop">
                <span class="name">${$(that).attr('data-name')}</span>
                <span class="phone">${$(that).attr('data-phone')}</span>
                <span class="defau">默认</span>
            </div>
            <div class="addressInfoBottom txtFlow">${$(that).attr('data-addr')}</div>
        `);
        $(".addressInfo").attr({
            "data-aid": $(that).attr('data-id')
        });
        confirmOrder.addid = $(that).attr('data-id');
        if ($(that).attr('data-id') != confirmOrder.defaultAddressId) {
            $('.defau').hide();
        }
        app.pageInit("#listconfirm");
        confirmOrder.renderPostage().then(function() {
            confirmOrder.calculateProPrice();
            confirmOrder.updateMoney();
            confirmOrder.updatehtml();
        })
    },
    renderTpl: function(data) {
        // 缺货
        var data = data.error.message;
        //列出来。哪些商品缺货
        $(".orinfo").html(`
            <p class="mtit">您的订单提交失败 <span class="iconfont icon-houtai-caidanlan-paisongguanli"></span></p>
            <p class="order">以下是缺货商品，请重新选择商品</p>
            <p class="tw-btn-long"><a href="./marketgradeexchange.html" class="button button-success button-fill external">去商城选购</a></p>
        `);
        var ite = data;
        $("#orderinfolist").empty();
        for (var i = 0; i < ite.length; i++) {
            $("#orderinfolist").append(`
                <li class="item-content">
                    <div class="item-media">
                        <img src="${config.mall.productshopcarimageurl + ite[i].mallproduct.productimage + '-' + config.mall.productshopcarimagestyle}" width="44">
                    </div>
                    <div class="oritem">
                        <span class="orname">${ite[i].mallproduct.productname}</span>
                        <span class="ornum">${ite[i].number}×${ite[i].mallproduct.price}</span>${app.unit}
                    </div>
                </li>
            `)
        }
        app.pageInit("#orderinfo");
    },
    renderOrderListBlh: function(blhdata) {
        confirmOrder.protype = 'blh';
        var d = [];
        d.push(blhdata)

        var dobj = confirmOrder.getlocaid();
        if (!dobj) {
            $.toast("您没有正在提交的订单，即将跳转！");
            setTimeout(function() {
                window.location.href = './confirmOrder.html'
            }, 500);
        }

        $(".cardboxx").empty();
        for (var i = 0; i < d.length; i++) {
            confirmOrder.prototal += d[i].number;
            $(".cardboxx").append(`
                <div class="card clear">
                    <div class="pic">
                        <a class="external" href="./marketgoodsdetail.html?proid=${d[i].productid}"><img src="${d[i].proimg}" alt=" 商品图片"></a>
                    </div>
                    <div class="maininfo">
                        <div class="pname">${d[i].name}</div>
                        <div class="price">￥${d[i].price}</div>
                        <div class="isDiscount">${d[i].isDiscount ? '可使用折扣券' : ''}</div>
                    </div>
                    <div class="remove">
                        <div>x ${d[i].number}</div>
                    </div>
                </div>
            `)
            
            confirmOrder.selectedProductList.push({
                productid: d[i].productid,
                price: d[i].price,
                number: d[i].number,
                isDiscount: d[i].isDiscount == 1 ? true : false
            })
        }
        
        confirmOrder.renderPostage().then(function() {
            confirmOrder.calculateProPrice();
            confirmOrder.updateMoney();
            confirmOrder.updatehtml();
        })
    },
    renderOrderList: function() {
        confirmOrder.protype = 'product';
        app.request('/mall/getshopingcart', {
                page: 1,
                size: 100,
                custid: app.custid
            })
            .then(function(data) {
                var d = data.data.rows;
                //获取id
                var idarr = confirmOrder.getlocaid();
                if (idarr) {
                    var ids = idarr.split(",");
                } else {
                    $.toast("您没有正在提交的订单，即将跳转！");
                    setTimeout(function() {
                        window.location.href = './confirmOrder.html'
                    }, 500);
                }
                
                $(".cardboxx").empty();

                d.forEach(function(ele) {
                    if(ids.indexOf(ele.id) != -1) {
                        // 计算结算商品数量，用于判断是否减免邮费
                        confirmOrder.prototal += ele.number;

                        $(".cardboxx").append(`
                        <div class="card clear">
                            <div class="pic">
                                <a class="external" href="./marketgoodsdetail.html?proid=${ele.productid}"><img src="${data.data.imageurl}${ele.mallproduct.productimage}-${data.data.imagestyle}" alt=" 商品图片"></a>
                            </div>
                            <div class="maininfo">
                                <div class="pname">${ele.mallproduct.productname}</div>
                                <div class="price">￥${ele.mallproduct.price}</div>
                                <div class="isDiscount">${ele.mallproduct.isDiscount ? '可使用折扣券' : ''}</div>
                            </div>
                            <div class="remove"><div>x ${ele.number}</div></div>
                        </div>
                        `);

                        confirmOrder.selectedProductList.push({
                            productid: ele.mallproduct.productid,
                            price: ele.mallproduct.price,
                            number: ele.number,
                            isDiscount: ele.mallproduct.isDiscount == 1 ? true : false
                        })
                    }
                })

                confirmOrder.renderPostage().then(function() {
                    confirmOrder.calculateProPrice();
                    confirmOrder.updateMoney();
                    confirmOrder.updatehtml();
                })
            })
            .catch(function(data) {
                if (data.error) {
                    $.toast("获取购物车信息失败:" + data.error.message)
                } else {
                    $.toast("获取购物车信息失败")
                }
            })
    },

    getlocaid: function() {
        var ids = window.sessionStorage.getItem('selid');
        return ids;
    },
    renderGetCustAddressList: function(data) {
        if (data && data.data && data.data.addressList) {
            var d = data.data.addressList;
            if (d.length == 0) {
                $(".addressInfo").html(`<div class="emptyAddress">暂无收货地址，请添加地址后提交订单</div>`);
                $.openPanel("#panel-js-demo");
            } else {
                var defaultaddrid = data.data.defaultAddressId;
                if (!defaultaddrid) {
                    $(".addressInfo").html(`<div class="emptyAddress">选择收货地址</div>`);
                    $.openPanel("#panel-js-demo");
                } else {
                    for (var i = 0; i < d.length; i++) {
                        if (d[i].addid == defaultaddrid) {
                            $(".addressInfo").attr({
                                "data-aid": d[i].addid
                            });
                            $(".addressInfo").html(`
                                <div class="addressInfoTop">
                                    <span class="name">${d[i].contact}</span>
                                    <span class="phone">${d[i].phone}</span>
                                    <span class="defau">默认</span>
                                </div>
                                <div class="addressInfoBottom txtFlow">${d[i].province}${d[i].city}${d[i].address}</div>
                            `);
                            confirmOrder.addid = d[i].addid;

                        }
                    }

                }

            }
            //渲染收货地址列表
            confirmOrder.defaultAddressId = data.data.defaultAddressId;
            $("#addrlist").empty();
            if (d.length == 0) {
                $("#addrlist").append(`<p class="notice">您还没有添加地址，请点击右上角“管理我的地址”去添加地址</p>`)
                return
            }
            for (var i = 0; i < d.length; i++) {
                $("#addrlist").append(`
                <div data-id="${d[i].addid}" 
                     data-name="${d[i].contact}" 
                     data-phone="${d[i].phone}" 
                     data-addr="${d[i].province}${d[i].city}${d[i].address}" 
                     class="cardAddr">
                    <div class="" style="margin: 0.2rem 0;color: #fff;">
                        <span>${d[i].contact}</span>
                        <span style="margin-left: 1rem;">${d[i].phone}</span>
                    </div>
                    <div class="">
                        <div class="popright">${d[i].province}${d[i].city}${d[i].address}</div>
                    </div>
                </div>
                `);

            }
        }

    },


    initPages: function() {
        if (window.location.href.indexOf('selectAddr') > 0) {
            app.pageInit("#selectAddr");
        }
        if (!window.sessionStorage.getItem('selid')) {
            window.location.href = "./marketshopcar.html";
        }
    }
};

app.checkLogin()
.then(app.checkOut.init)
.then(confirmOrder.initPages)
.then(app.getCustAddressList)
.then(confirmOrder.renderGetCustAddressList)
.then(app.checkOut.getDiscount)
.then(function(res) {
    confirmOrder.discount = (!res.data || res.data.length == 0) ? [] : res.data;
})
.then(function() {
    var selonj = window.sessionStorage.getItem('selid').indexOf('price');

    // 手动解决安卓手机重载页面checkbox的显示保持之前状态
    $('input[name=useDiscount]').prop('checked', false);
    $('input[name=usePoint]').prop('checked', false);

    if (selonj < 0) {
        // 普通商品
        confirmOrder.renderOrderList();
    } else {
        // BLH
        var blhdata = JSON.parse(window.sessionStorage.getItem('selid'));
        confirmOrder.blhData = blhdata;
        confirmOrder.renderOrderListBlh(blhdata);
    }
})
.catch(function(err) {
    // console.log(err)
})


$(".gopay").click(function() { //提交订单结算
    if (confirmOrder.protype != 'blh') {
        //支付礼品
        var data = {
            producttype: "product",
            custid: app.custid,
            shopinglist: JSON.stringify(window.sessionStorage.getItem('selid').split(',')),
            remak: $("#ordermsg").val(),
            addid: $(".addressInfo").attr('data-aid'),
            discountList: JSON.stringify(confirmOrder.postData),
            point: confirmOrder.usePoint
        };

        //结算类型，是否使用积分，参数，回调函数，支付成功或者失败后渲染html模板
        //是否选择地址
        if ($(".addressInfo").text() == "选择收货地址" || $(".addressInfo").text() == "暂无收货地址，请添加地址后提交订单" || !$(".addressInfo").text()) {
            $.toast("请选择收货地址！ ");
            return;
        }
        if(confirmOrder.usePoint > 0) {
            app.checkOut.checkOutTypeFun("product", true, data, confirmOrder.renderTpl);
        } else {
            app.checkOut.checkOutTypeFun("product", false, data, confirmOrder.renderTpl);
        }

    } else {
        var productData = JSON.parse(window.sessionStorage.getItem('selid'));

        var data = {
            producttype: "product",
            custid: app.custid,
            productid: productData.productid,
            // shopinglist: JSON.stringify(window.sessionStorage.getItem('selid').split(',')),
            remak: $("#ordermsg").val(),
            addid: $(".addressInfo").attr('data-aid'),
            discountList: JSON.stringify(confirmOrder.postData),
            point: confirmOrder.usePoint,
            number: confirmOrder.blhData.number,
        };
        
        if(confirmOrder.usePoint > 0) {
            app.checkOut.checkOutTypeFun("blh", true, data, confirmOrder.renderTpl);
        } else {
            app.checkOut.checkOutTypeFun("blh", false, data, confirmOrder.renderTpl);
        }
    }

});

//选择收货地址
$(".addrlist").on('click', '.cardAddr', function() {
    $.closePanel("#panel-js-demo");
    var that = this;
    confirmOrder.selectAddress(that);
});

//去管理地址
$("#manage").click(function() {
    window.localStorage.setItem('subOrder', 'sub');
    window.location.href = "./safeaddr.html";
});

//选择地址
// $(".barAddr").click(function () {
//     app.pageInit("#selectAddr");
// });


$("#checkuse").change(function() {
    if ($(this).prop('checked')) {
        confirmOrder.choseGrade = true;
        $(this).parent().addClass("active");
        confirmOrder.updatehtml();
    } else {
        confirmOrder.choseGrade = false;
        $(this).parent().removeClass("active");
        confirmOrder.updatehtml();
    }
})
$("#returnmanage").click(function() {
    app.pageInit("#listconfirm");
})

$(document).on("click", ".barAddr", function() {
    $.openPanel("#panel-js-demo");
});

// 使用抵扣券
$(document).on('change', '.useDiscount', function(e) {
    if(e.target.checked) {

        // 判断折扣券使用数量
        var canUseNumber = 0;
        confirmOrder.isDiscountList.forEach(function(ele) {
            canUseNumber += ele.number
        })
        var hasNumber = confirmOrder.discount.length;
        // confirmOrder.discountNumber = hasNumber > canUseNumber ? canUseNumber : hasNumber;

        // 当前单次订单折扣券只能用一张
        confirmOrder.discountNumber = hasNumber > 0 ? canUseNumber : 0;

        confirmOrder.calculateDiscount();
        $(".discountcoupon").show();
    } else {
        confirmOrder.discountMoney = 0;
        confirmOrder.postData = [];
        $(".discountcoupon").hide();
    }
    confirmOrder.updateMoney();
    confirmOrder.updatehtml();
})

// 使用积分抵扣
$(document).on("change", ".usePoint", function(e) {
    if (e.target.checked) {
        confirmOrder.calculatePoint(confirmOrder.currentPay);
        $(".discountrow").show();
    } else {
        confirmOrder.pointMoney = 0;
        confirmOrder.usePoint = 0;
        $(".discountrow").hide();
    }
    confirmOrder.updateMoney();
    confirmOrder.updatehtml();
})
// 监听积分输入
$(document).on("change", ".discountPoint", function(e) {
    // console.log(e.target.value);
    var val = (e.target.value && !isNaN(e.target.value)) ? parseInt(e.target.value, 10) : 0;
    if (val > confirmOrder.maxPoint) {
        $.toast("抵扣积分已达上限");
        $(".discountPoint").val(confirmOrder.usePoint)
    } else if(val < 0) {
        $.toast("抵扣积分不能小于0");
        $(".discountPoint").val(0)
    } else {
        $(".discountPoint").val(val)
        confirmOrder.usePoint = val;
        confirmOrder.pointMoney = parseFloat(app.math.accDiv(confirmOrder.usePoint, confirmOrder.ratio));
        confirmOrder.updateMoney();
        confirmOrder.updatehtml();
    }
})