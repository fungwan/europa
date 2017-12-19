/**
 * Created by xdf on 2017/5/16.
 */
var qoupon = {
    renderList: function(data) {
        console.log('获取qoupon数据');
        qouponlist = data.data.result; //array

        for (var i = 0; i < qouponlist.length; i++) {
            var item = qouponlist[i];
            item.validity_beg = app.Fmat.timeFm(item.validity_beg);
            item.validity_end = app.Fmat.timeFm(item.validity_end);
            
            if (new Date(item.validity_beg).getTime() > qoupon.nowtime ||
                (new Date(item.validity_end).getTime() + 24 * 60 * 60 * 1000 - 1) < qoupon.nowtime) {
				item.validity_beg = item.validity_beg.slice(2);
				item.validity_end = item.validity_end.slice(2);
                $('.notUsed').append(`
					<div class="qouponitem" 
						 style="background-image: url(../images/qoupon/quan1.svg);" 
						 data-id="${item.productid}" 
						 data-qoupon="${item.qouponid}">
						<div class="qouponprice">
							<div class="price-content">
								<span class="iconfont icon-shixiao" 
									  style="font-size: 1.5rem"></span>
							</div>
						</div>
						<div class="qouponcontent">
							<div class="baseinfo">
								<div class="qouponname">${item.productname}</div>
								<div class="validity-time" style="font-size:60%;font-style:italic;font-weight:400;">
									<span>${item.validity_beg}</span>-<span>${item.validity_end}</span>
								</div>
							</div>
							<div class="content-img">
								<img src="${config.mall.productimageurl + 
											item.productimage + '-' + 
											config.mall.productimagestyle}">
							</div>
						</div>
					</div>
				`);
            } else {
				item.validity_beg = item.validity_beg.slice(2);
				item.validity_end = item.validity_end.slice(2);
                $('.notUsed').append(`
					<div class="qouponitem" 
						 style="background-image: url(../images/qoupon/quan2.svg);" 
						 data-id="${item.productid}" 
						 data-qoupon="${item.qouponid}">
						<div class="qouponprice">
							<div class="price-content">
								<span class="iconfont icon-youxiao" 
									  style="font-size: 1.5rem"></span>
							</div>
						</div>
						<div class="qouponcontent">
							<div class="baseinfo">
								<div class="qouponname">${item.productname}</div>
								<div class="validity-time" style="font-size:60%;font-style:italic;font-weight:400;">
									<span>${item.validity_beg}</span>-<span>${item.validity_end}</span>
								</div>
							</div>
							<div class="content-img">
								<img src="${config.mall.productimageurl + 
											item.productimage + '-' + 
											config.mall.productimagestyle}">
							</div>
						</div>
					</div>
				`);
            }
        }
        if (qouponlist.length < (app.scollItem.size) || qouponlist.length == 0) {
            console.log('加载完成');
            // 加载完毕，则注销无限加载事件，以防不必要的加载
            $.detachInfiniteScroll($('.infinite-scroll'));
            // 删除加载提示符
            $('.infinite-scroll-preloader').hide();
            $.toast('礼券列表加载完成');
        }
        app.scollItem.loading = false;
    },

    parm: function() {
        return {
            page: app.scollItem.page,
            size: app.scollItem.size
        }
    },

    init: function() {
        qoupon.nowtime = new Date().getTime();
        app.scollItem.page = 1;
        app.scollItem.size = 5;

        app.scollItem.addItems(
            '/club/getselfqoupon',
            qoupon.parm()
        ).then(function(res) {
            if (res.data.result.length == 0) {
                $('.infinite-scroll-preloader').hide();
                $.toast('暂时没有礼券，请前往商城购买礼券')
            } else {
                qoupon.renderList(res);
            }
        }).catch(function(err) {
            console.log(err);
        });
    }
};

// qoupon.init();

app.checkLogin()
    .then(function() {
        qoupon.init();
    });

$(document).on('infinite', '.infinite-scroll-bottom', function() {
    console.log('infinite');
    $.refreshScroller();
    // 如果正在加载，则退出
    if (app.scollItem.loading) return;

    app.scollItem.page++;
    app.scollItem.loading = true;

    app.scollItem.addItems(
        '/club/getselfqoupon',
        qoupon.parm()
    ).then(function(data) {
        qoupon.renderList(data);
    })
});

// 详情跳转
$(".notUsed").on("click", '.qouponitem', function() {
    var id = $(this).data('id');
    var qouponid = $(this).data('qoupon');
    console.log(qouponid);
    window.location.href = './qouponuse.html?' +
        'proid=' + id + '&' +
        'qouponid=' + qouponid;
});

// 礼券记录跳转
$('.recordtap').on('click', function() {
    window.location.href = './selfqoupon.record.html';
})