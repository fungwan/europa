/**
 * Created by xdf on 2017/5/16.
 */
var qoupon = {
    renderRecord: function(data) {
        var record = data.data.items;
        for (var i = 0; i < record.length; i++) {
            var item = record[i];
            item.usetype = qoupon.state(item.usetype).slice(1);
            item.usetime = app.Fmat.timeFm(new Date(item.usetime));
			if (item.usetype == '赠予') {
				$('.qouponRecord').append(`
                    <div class="qouponitem" 
                         style="background-image: url(../images/qoupon/quan1.svg);">
                        <div class="qouponprice">
                            <div class="price-content">
                                ${item.usetype}
                            </div>
                        </div>
                        <div class="qouponcontent">
                            <div class="baseinfo">
                                <div class="qouponname">${item.productname}</div>
                                <div class="validity-time" style="font-size:60%;font-style:italic;font-weight:400;">
                                    <span>${item.usetime}</span>
                                </div>
                                <div class="validity-time" style="font-size:60%;font-style:italic;font-weight:400;">
                                    <span>${item.nickname}</span> To <span>${item.recivername}</span>
                                </div>
                            </div>
                            <div class="content-img">
                                <img src="../images/qoupon/finish.svg">
                            </div>
                        </div>
                    </div>
				`)	
			} else {
                $('.qouponRecord').append(`
                    <div class="qouponitem" 
                         style="background-image: url(../images/qoupon/quan1.svg);">
                        <div class="qouponprice">
                            <div class="price-content">
                                ${item.usetype}
                            </div>
                        </div>
                        <div class="qouponcontent">
                            <div class="baseinfo">
                                <div class="qouponname">${item.productname}</div>
                                <div class="validity-time" style="font-size:60%;font-style:italic;font-weight:400;">
                                    <span>${item.usetime}</span>
                                </div>
                            </div>
                            <div class="content-img">
                                <img src="../images/qoupon/finish.svg">
                            </div>
                        </div>
                    </div>
				`);
            }
        }


        if (record.length < (app.scollItem.size) || record.length == 0) {
            console.log('加载完成');
            // 加载完毕，则注销无限加载事件，以防不必要的加载
            $.detachInfiniteScroll($('.infinite-scroll'));
            // 删除加载提示符
            $('.infinite-scroll-preloader').hide();
            $.toast('记录已全部加载完成');
        }

        app.scollItem.loading = false;
        
    },

    parm: function() {
        return {
            page: app.scollItem.page,
            size: app.scollItem.size,
            begtime: qoupon.begtime || '',
            endtime: qoupon.endtime || '',
            usetype: qoupon.usetype || ''
        }
    },

    state: function(type) {
        switch (type) {
            case "create":
                return "已购买";
            case "use":
                return "已使用";
            case "give":
                return "已赠予";
            default:
                return type;
        }
    },

    init: function() {
        $('.infinite-scroll-preloader').show();
        $('.qouponRecord').empty();
        app.scollItem.page = 1;
        app.scollItem.size = 5;
		app.scollItem.addItems(
			'/club/getselfqouponrecord',
			qoupon.parm()
		).then(function(data) {
			qoupon.renderRecord(data);
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

$(document).on('infinite', '.infinite-scroll-bottom', function(){
    $.refreshScroller();
    // 如果正在加载，则退出
    if (app.scollItem.loading) return;
    app.scollItem.page++;
    app.scollItem.loading = true;
    
    app.scollItem.addItems(
        '/club/getselfqouponrecord',
        qoupon.parm()
    ).then(function(data) {
        qoupon.renderRecord(data);
    })

});

// 未使用礼券跳转
$('.notusedtap').on('click', function () {
    window.location.href = './selfqoupon.html';
})

// 礼券记录搜索
$('#searchrecord').on('click', function(){
    qoupon.begtime = $('input[name=begtime]').val();
    qoupon.endtime = $('input[name=endtime]').val();
    qoupon.usetype = $('select[name=usetype]').val();
    //注销无限加载后添加新的无限加载事件
    $.detachInfiniteScroll($('.infinite-scroll'));
    $.attachInfiniteScroll($('.infinite-scroll'));
    qoupon.init();
})
// 礼券记录搜索重置
$('#resetrecord').on('click', function () {
    qoupon.begtime = '';
    qoupon.endtime = '';
    qoupon.usetype = '';
    $('input[name=begtime]').val('');
    $('input[name=endtime]').val('');
    $('select[name=usetype]').val('');
    //注销无限加载后添加新的无限加载事件
    $.detachInfiniteScroll($('.infinite-scroll'));
    $.attachInfiniteScroll($('.infinite-scroll'));
    qoupon.init();
})
