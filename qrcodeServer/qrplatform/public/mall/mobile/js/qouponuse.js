/**
 * Created by xdf on 2017/5/11.
 */
var qoupondetail = {
	renderList: function (data) {
        var data1 = data.data1,
            data2 = data.data2;
        qoupondetail.presentHref = "./qouponpresent.html?proid=" + data1.baseinfo.productid;
        qoupondetail.useHref     = "./qouponuse.html?proid=" + data1.baseinfo.productid;

        data1.baseinfo.validity_beg = app.Fmat.timeFm(data1.baseinfo.validity_beg);
        data1.baseinfo.validity_end = app.Fmat.timeFm(data1.baseinfo.validity_end);
        $('.qouponinfo').append(`
            <div class="qouponthumb">
                <img src="${config.mall.productimageurl + 
                            data1.baseinfo.productimage + '-' + 
                            config.mall.productimagestyle}">
            </div>
            <div class="information">
                <div class="qouponname">${data1.baseinfo.productname}</div>
                <div>
                    <span class="iconfont icon-anonymous-iconfont" 
									  style="font-size: 0.5rem"></span>
                    <span class="qouponprice">${data1.baseinfo.price}</span>
                </div>
                <div class="qoupontime">
                    <span>${data1.baseinfo.validity_beg} </span>-
                    <span> ${data1.baseinfo.validity_end}</span>
                </div>
            </div>
        `);
        $('.qoupondesc').append(`
            <div class="desc-title">礼券描述：</div>
            <div class="desc-content">
                ${data1.baseinfo.productinfo}
            </div>
        `);
        if(data2.length == 0) {
             $('.prolist').append(`
                    <div class="listitem">
                            该礼券下无关联商品
                    </div>
                `)
        }else {
            for(var i=0;i<data2.length;i++){
                var item = data2[i];
                $('.prolist').append(`
                    <div class="listitem">
                            <i class="iconfont icon-dian-copy-copy" style="color:red"></i>${item.productname}
                            <span>数量: 
                                <span style="padding-left:10px;">${item.number}</span>
                            </span>
                    </div>
                `)
            }
        }
	},
    initdetail : function () {
        var data = {
            data1: {},
            data2: {}
        };
        $('.addressInfo').empty();
        $('#qouponmsg').empty();
        qoupondetail.productid = app.getSearchParams().proid;
        qoupondetail.qouponid = app.getSearchParams().qouponid;
        console.log(qoupondetail.qouponid);
        app.request(
            '/mall/getproductInfo', 
            {productid: qoupondetail.productid}
        ).then(function(res){
            data.data1 = res.data;
            return app.request(
                '/mall/getqouponContent', 
                {productid: qoupondetail.productid}
            );
        }).then(function(res){
            data.data2 = res.data;
            qoupondetail.renderList(data);
        }).catch(function (err){
            $.toast("详情获取失败");
        });

    },
}

// qoupondetail.initdetail();

app.checkLogin()
    .then(function(){
        qoupondetail.initdetail();
    });

$('.present').on('click', function(e){
    window.location.href = "./qouponpresent.html?qouponid=" + qoupondetail.qouponid;
})

//显示使用礼券页面
$('.bar-tab').on('click', '.gopay', function(){
    $('.useqoupon').css('display','block');

    // qoupondetail.ordermsg = $("#ordermsg").val();
    // console.log(qoupondetail.ordermsg);
    // $("#qouponmsg").val(qoupondetail.ordermsg);
    
    app.getCustAddressList().then(function(res){
        var addr = res.data;
        qoupondetail.addrid = addr.defaultAddressId;
        qoupondetail.addrlist = addr.addressList;

        //地址状态判断
        if (!addr.defaultAddressId) {
            if(addr.addressList.length == 0){
                $.toast('未设置地址，请先设置地址');
                window.location.href='./safeaddr.html';
            }else {
                $.toast('未设置默认地址，请选择地址');
                $('.addressList').css('display','block');
            }
        }

        for(var i=0;i<addr.addressList.length;i++){
            var item = addr.addressList[i];
            if(addr.addressList[i].addid == addr.defaultAddressId){
                $('.addressInfo').append(`
                    <div class="addressInfoTop">
                        <span class="name">${item.contact}</span>
                        <span class="phone">${item.phone}</span>
                        <span class="defau">默认</span>
                    </div>
                    <div class="addressInfoBottom">
                        ${item.province + item.city + item.address}
                    </div>
                `);
            }

            $('.addressContainer').append(`
                <div class="card addrcard" data-addrid="${item.addid}">
                    <div class="card-header">
                        <span><span class="icon icon-me" style="padding-bottom: 3px;color:red"></span> ${item.contact}</span>
                        <span><span class="icon icon-phone"></span> ${item.phone}</span>
                    </div>
                    <div class="card-content">
                        <div class="card-content-inner">
                            <p>
                                <span class="icon icon-home" style="padding-bottom: 3px;color:red"></span>
                                 ${item.province + item.city + item.address}
                            </p>
                        </div>
                        <span></span>
                    </div>
                </div>
            `);
        }

    })
})

// 取消
$('.bar-tab').on('click', '.cancel', function(){
    $('.useqoupon').css('display','none');
    $('.addressInfo').empty();
    $('.addressContainer').empty();
});

// 取消选区地址
$('.cancelAddr').on('click', function(){
    $('.addressList').css('display', 'none');
});

// 地址选取页面跳转
$('.pull-right').on('click', function(){
    $('.addressList').css('display','block');
})

// 地址设置页面跳转
$('.setAddr').on('click', function(){
    window.location.href = './safeaddr.html';
})

// 选择地址
$('.addressContainer').on('click', '.addrcard', function(){
    qoupondetail.addrid = $(this).data('addrid');
    console.log(qoupondetail.addrid,qoupondetail.addrlist);
    // $('.addressContainer').empty();
    $('.addressInfo').empty();
    for(var i=0;i<qoupondetail.addrlist.length;i++) {
        if (qoupondetail.addrlist[i].addid == qoupondetail.addrid) {
            var item = qoupondetail.addrlist[i];
            $('.addressInfo').append(`
                <div class="addressInfoTop">
                    <span class="name">${item.contact}</span>
                    <span class="phone">${item.phone}</span>
                </div>
                <div class="addressInfoBottom">
                    ${item.province + item.city + item.address}
                </div>
            `);
        }
    }
    $('.addressList').css('display', 'none');
})

//使用礼券
$('.bar-tab').on('click', '.gouse', function(){ 
    console.log(qoupondetail.addrid)
    if(!qoupondetail.addrid) {
        return $.toast('请先设置收货地址');
    }
    $.confirm('确定使用当前礼券吗？', '礼券使用提醒', function () {
        var remak = $('#qouponmsg').val();
        //使用订单逻辑
        app.request(
            '/mall/createOrderByQoupon',
            {
                qouponid: qoupondetail.qouponid,
                addid: qoupondetail.addrid,
                remak: remak
            }
        ).then(function(data){
            console.log(data);
            if (data.data.usetype == 'use'){
                $.toast("礼券使用成功,请在订单中查看详情");
                setTimeout(function(){
                    window.location.href = "./selfinfo.html";
                }, 2000);
            }
        }).catch(function(error){
            console.log(error);
            $.toast(error.error.message);
        })
    });
    
})