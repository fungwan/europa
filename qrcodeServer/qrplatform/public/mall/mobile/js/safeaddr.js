/**
 * Created by 75339 on 2017/5/3.
 */
/**
 * Created by 75339 on 2017/2/15.
 */
var selfsafe = {
    addid: null,
    addressArr: null,
    address: {
        addid: null,
        address: null,
        city: null,
        contact: null,
        country: null,
        custid: null,
        defaultAddressId: null,
        phone: null,
        province: null
    },
    updateOradd: null,
    defaultaddr: function (id) {
        app.request('/shop/setDefaultAddress', { custid: app.custid, address: id })
            .then(function (data) {
                $.toast("设置成功");
                selfsafe.getaddrlist(app.custid);
            })
            .catch(function (data) {
                if (data.error) {
                    $.toast("设置失败:" + data.error.message)
                } else {
                    $.toast("设置失败")
                }
            })
    },
    deladdress: function (id) {
        app.request('/shop/delAddress', {
            custid: app.custid,
            address: id
        })
            .then(function (data) {
                $.toast('删除成功')
                $("#addrlist").empty();
                selfsafe.getaddrlist(app.custid);
            })
            .catch(function (data) {
                if (data.error) {
                    $.toast('删除失败:' + error.message)
                } else {
                    $.toast('删除失败')
                }
            })
    },
    getaddrlist: function (userid) {
        app.request('/shop/getAddressList', { custid: app.custid })
            .then(function (data) {
                if (data && data.data && data.data.addressList) {
                    var d = data.data.addressList;
                    selfsafe.addressArr = d;
                    //渲染列表
                    var morenid = data.data.defaultAddressId;
                    $("#addrlist").empty();
                    for (var i = 0; i < d.length; i++) {
                        $("#addrlist").append(`<div class="card">
                            <div class="card-header"><span>${d[i].contact}</span><span>${d[i].phone}</span></div>
                            <div class="card-content">
                                <div class="list-block media-list">
                                    <ul>
                                        <li class="item-content">
                                            <div class="item-subtitle">
                                            <span class="cont"></span>
                                            <span class="prov">${d[i].province}</span>
                                            <span class="cit">${d[i].city}</span>
                                            <span class="xiangxi">${d[i].address}</span></div>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="card-footer addrmo">
                                <span>
                                    <label><input type="radio" name="addr" id="${d[i].addid}" class="mydeaufly">默认地址</label>
                                </span>
                                <span><span class="editmyaddr iconfont icon-qianming" data-bjid="${d[i].addid}">编辑</span><span class="iconfont icon-shanchu mydel" style="margin-left: 10px" data-selid="${d[i].addid}">删除</span></span>
                            </div>
                        </div>`)
                    }
                    $("#" + morenid).attr({ 'checked': true });
                    $("#" + morenid).parent().css({
                        'color': '#e95302'
                    })
                }
            })
            .catch(function (data) {
                if (data.error) {
                    $.toast("获取地址列表失败:" + data.error.message);
                } else {
                    $.toast("获取地址列表失败")
                }
            })
    },
    updateAddress: function (obj) {
        app.request('/shop/updateAddress', { address: JSON.stringify(obj) })
            .then(function (data) {
                $.toast("提交成功！")
                app.pageInit("#page-modyfiyaddr");
                selfsafe.initmypage();
                // if (selfsafe.updateOradd) {
                //     if (window.localStorage.getItem('subOrder')) {
                //         window.localStorage.removeItem('subOrder');
                //         window.location.href = "./marketgopay.html?selectAddr";
                //     } else if (window.localStorage.getItem('lotteryOrder')) {
                //         window.localStorage.removeItem('lotteryOrder');
                //         window.location.href = "./lottery.html?selectAddr";
                //     } else {
                //         $(".page-group>div").removeClass('page-current');
                //         $("#page-modyfiyaddr").addClass('page-current');
                //         $.init();
                //         $("#addrlist").empty();
                //         selfsafe.getaddrlist();
                //     }
                // } else {
                //     $(".page-group>div").removeClass('page-current');
                //     $("#page-modyfiyaddr").addClass('page-current');
                //     $.init();
                //     $("#addrlist").empty();
                //     selfsafe.getaddrlist();
                // }

            })
            .catch(function (data) {
                if (data.error) {
                    $.toast("操作失败：" + data.error.message)
                } else {
                    $.toast("操作失败!")
                }
            })
    },
    initmypage: function (d) {
        app.getCustInfo()
            .then(function (data) {
                selfsafe.getaddrlist(data);
                app.cities().then(function (data) {
                    app.getprv(data)
                })
            })
    }
};
app.checkLogin()
    .then(function (data) {
        selfsafe.initmypage();
    });

$("#infobtn").click(function (e) {
    selfsafe.modifyselfinfo();
});

$(".list-container").on('click', '.province', function () {
    var code = $(this).attr('data-code');
    app.cities(code).then(function (data) {
        app.getcity(data)
    })
})
$(".list-container").on('click', '.cities', function () {
    var name = $(this).attr('data-name');
    $(".addaddr").html(name);
    $(".page").removeClass('page-current');
    $("#page-addradd").addClass('page-current');
    $.init();
})
//默认地址设置
$("#addrlist").on("change", ".mydeaufly", function () {
    var id = $(this).attr("id");
    selfsafe.defaultaddr(id);
});
//删除地址
$("#addrlist").on("click", ".mydel", function () {
    var id = $(this).attr("data-selid");
    selfsafe.deladdress(id);
});
//编辑设置状态
$("#addrlist").on("click", ".editmyaddr", function () {
    selfsafe.updateOradd = false;
    selfsafe.addid = $(this).attr('data-bjid');
    for (var i = 0; i < selfsafe.addressArr.length; i++) {
        if (selfsafe.addressArr[i].addid == selfsafe.addid) {
            selfsafe.address = selfsafe.addressArr[i]
        }
    }
    $("#addname").val(selfsafe.address.contact);
    $("#addphone").val(selfsafe.address.phone);
    $(".addaddr").html(selfsafe.address.province + "/" + selfsafe.address.city);
    $("#addaddress").html(selfsafe.address.address);
    if (Boolean($(this).parent().prev().children().children().first().attr("checked"))) {

        $("#isdefault").prop('checked', true);
    }
    $(".page").removeClass('page-current');
    $("#page-addradd").addClass('page-current');
    $.init();
});
//update address
$("#tjnewaddr").click(function (e) {
    selfsafe.address.contact = $("#addname").val();
    selfsafe.address.phone = $("#addphone").val();
    var addarr = $(".addaddr").html().split("/");
    selfsafe.address.province = addarr[0];
    selfsafe.address.city = addarr[1];
    selfsafe.address.address = $("#addaddress").val();
    selfsafe.address.defaultAddressId = $("#isdefault").attr("checked");
    selfsafe.address.custid = app.custid;
    selfsafe.address.country = "中国";
    if (!app.RegVali.name(selfsafe.address.contact)) {
        $.toast("收货人不能包含非法字符，长度不好过20");
        return;
    } else if (selfsafe.address.contact.length > 10) {
        $.toast("收货人姓名不能超过10个字！");
        return
    }
    if (!app.RegVali.phone(selfsafe.address.phone)) {
        $.toast("请输入正确联系电话");
        return;
    }
    if ($(".addaddr").html().indexOf('/') == -1) {
        $.toast("请选择地址！");
        return
    }
    if (!app.RegVali.empty(selfsafe.address.address)) {
        $.toast("请输入详细地址！");
        return
    } else if (selfsafe.address.address.length > 50) {
        $.toast("详细地址不能超过50个字！");
        return
    }
    if (selfsafe.updateOradd) {
        //添加
        $("#isdefault").prop("checked", false);
        delete selfsafe.address.addid;
        selfsafe.updateAddress(selfsafe.address)
    } else {
        //编辑
        selfsafe.updateAddress(selfsafe.address)
    }
});
//添加，编辑
$("#doaddaddr").click(function () {
    selfsafe.updateOradd = true;
    $("#addname").val("");
    $("#addphone").val("");
    $(".addaddr").html("");
    $("#addaddress").val("");
    $(".mydeaufly").attr({ 'checked': false });
    $(".page").removeClass('page-current');
    $("#page-addradd").addClass('page-current');
    $.init();
});
$("#getaddr").click(function () {
    app.cities().then(function (data) {
        app.getprv(data)
    })
    $(".page").removeClass('page-current');
    $("#address").addClass('page-current');
    $.init();
})

$("#resub").click(function () {
    window.location.reload();
})