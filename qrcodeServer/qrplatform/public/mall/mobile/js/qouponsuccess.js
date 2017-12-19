/**
 * Created by xdf on 2017/5/11.
 */
var qoupondetail={
	renderList: function (data) {
        var data1 = data.data1,
            data2 = data.data2;
        qoupondetail.presentHref = "./qouponpresent.html?proid=" + data1.baseinfo.productid;
        qoupondetail.useHref = "./qouponuse.html?proid=" + data1.baseinfo.productid;
        $('.qouponinfo').append(`
            <div class="qouponthumb">
                <img src="${config.mall.productimageurl + 
                                data1.baseinfo.productimage + '-' + 
                                config.mall.productimagestyle}">
            </div>
            <div class="information">
                <div class="qouponname">${data1.baseinfo.productname}</div>
                <div class="">售价： <span class="qouponprice">${data1.baseinfo.cost}</span> 元</div>
                <div class="qoupontime">
                    有效期：
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
                            ${item.productname}
                            <span style="padding-top: 3px;">数量: 
                                <span style="padding: 1px 0px 0 13px;">${item.number}</span>
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
        qoupondetail.productid = app.getSearchParams().proid;
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

    }
}
qoupondetail.initdetail();   

$('.bar-tab').on('click', '.gopay', function(){
    window.location.href='./selfqoupon.html';
})
