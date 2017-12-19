/**
 * Created by xdf on 2017/5/16.
 */
var coupon = {
    renderList: function(data) {
		console.log('获取qoupon数据');
        coupon.list = data.data.rows; //array

        for (var i = 0; i < coupon.list.length; i++) {
            var item = coupon.list[i];
			$('.notUsed').append(`
				<div class="card qouponitem">
					<div class="qouponimg">
						<img src="${config.mall.productimageurl + 
									item.mallproduct.productimage + '-' + 
									config.mall.productimagestyle}">
					</div>
					<div class="qouponinfo">
						<div class="qouponname"></div>
							<span>${item.mallproduct.productname}</span>
						<div class="validity-time" style="font-style: italic">
							<span>${item.url}
						</div>
					</div>
					<div class="coupondelete" data-index="${item.couponid}">
						<span class="icon icon-remove"></span>
					</div>
				</div>
			`);	
    	}
		if (coupon.list.length < (app.scollItem.size) || coupon.list.length == 0) {
			console.log('加载完成');
			// 加载完毕，则注销无限加载事件，以防不必要的加载
			$.detachInfiniteScroll($('.infinite-scroll'));
			// 删除加载提示符
			$('.infinite-scroll-preloader').hide();
			$.toast('优惠券列表加载完成');
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
		app.scollItem.size = 8;
		app.scollItem.page = 1;
		app.scollItem.addItems(
            '/club/getselfcashcoupon',
            coupon.parm()
		).then(function(res) {
			if (res.data.rows.length == 0) {
				$.toast('暂无优惠券，请参加促销活动获取');
				$('.infinite-scroll-preloader').hide();
			} else {
            	coupon.renderList(res);
			}
        }).catch(function(err) {
            console.log(err);
        });
    }
};

// coupon.init();

app.checkLogin()
    .then(function() {
        coupon.init();
    });

$(document).on('infinite', '.infinite-scroll-bottom', function(){
	console.log('infinite');
	$.refreshScroller();
	// 如果正在加载，则退出
	if (app.scollItem.loading) return;
	app.scollItem.page++;
	app.scollItem.loading = true;

	app.scollItem.addItems(
		'/club/getselfcashcoupon',
		coupon.parm()
	).then(function(data) {
		coupon.renderList(data);
	})
});

$('.notUsed').on('click', '.coupondelete', function () {
    var index = $(this).data('index');
    $.confirm('确定删除该优惠券记录吗？', '优惠券删除提醒', function () {
        //删除优惠券操作
		app.request(
			'/club/deletecashcoupon',
			{ couponid: index }
		).then(function () {
			$('.notUsed').empty();
			coupon.init();
			$.detachInfiniteScroll($('.infinite-scroll'));
    		$.attachInfiniteScroll($('.infinite-scroll'));
		})
    })
})