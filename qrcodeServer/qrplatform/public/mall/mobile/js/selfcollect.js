/**
 * created by xdf on 2017/06/08
 * 
 */
var collects = {
    renderList: function(data) {
        console.log('开始向页面显示收藏商品');
        console.log(data);
        collectList = data.data;
        for (var i=0;i<collectList.length;i++) {
            var item = collectList[i].mallproduct;
            item.producttype = app.Product.typeTxt(item.producttype);
            if (item.producttype == '礼券') {
                $('.content').append(`
                    <div class="card default-height">
                        <div class="row no-gutter">
                            <div class="col-40">
                                <img src="${config.mall.productimageurl + 
                                            item.productimage + '-' + 
                                            config.mall.productimagestyle}">
                            </div>
                            <div class="col-60" data-href="./marketgoodsdetail.html?proid=${item.productid}">
                                <div class="item-title">${item.productname}</div>
                                <div class="item-desc">${item.productinfo}</div>
                                <div class="item-info">
                                    <div class="info-left">
                                        <i class="iconfont icon-yuan" 
                                           style="font-size:10px;color:red;vertical-align:text-bottom"></i>
                                        <span>${item.price}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="right-bottom">
                                <span class="iconfont icon-shanchu1" data-collectid="${collectList[i].favoritesid}"></span>
                            </div>
                            <div class="right-top">
                                <i class="iconfont icon-quan1"></i>
                            </div>
                        </div>
                    </div>
                `)
            }else {
                $('.content').append(`
                    <div class="card default-height">
                        <div class="row no-gutter">
                            <div class="col-40">
                                <img src="${config.mall.productimageurl + 
                                            item.productimage + '-' + 
                                            config.mall.productimagestyle}">
                            </div>
                            <div class="col-60" data-href="./marketgoodsdetail.html?proid=${item.productid}">
                                <div class="item-title">${item.productname}</div>
                                <div class="item-desc">${item.productinfo}</div>
                                <div class="item-info">
                                    <div class="info-left">
                                        <i class="iconfont icon-yuan" 
                                           style="font-size:10px;color:red;vertical-align:text-bottom"></i>
                                        <span>${item.price}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="right-bottom">
                                <span class="iconfont icon-shanchu1" data-collectid="${collectList[i].favoritesid}"></span>
                            </div>
                            <div class="right-top">
                                <i class="iconfont icon-shang1"></i>
                            </div>
                        </div>
                    </div>
                `)
            }
        }
        $('.infinite-scroll-preloader').hide();
    },
    param: function() {
        return {
            page: app.scollItem.page,
            size: app.scollItem.size
        }
    },
    init: function() {
        $('.content').empty();
        app.getCustInfo().then(function(res) {
            custinfo = res.data;
            if (custinfo.extInfo.favoritesnotify == 1) {
                $('.openconfirm').find('span').html('提醒功能(已开启)');
                $('.openconfirm').css('background', '#2685D8');
            }else if (custinfo.extInfo.favoritesnotify == 0) {
                $('.openconfirm').find('span').html('提醒功能(未开启)');
                $('.openconfirm').css('background', '#3E3E3E');
            }
        }).catch(function(err){
            $.toast('获取用户信息失败');
        });
        app.scollItem.size = 10;
        app.scollItem.addItems(
            '/mall/getSelfFavorites',
            ''
        ).then(function(res) {
            if (res.data.length == 0) {
                $('.infinite-scroll-preloader').hide();
				$.toast('暂无收藏商品，请前往商城收藏心仪的商品')
            } else {
                collects.renderList(res);
            }
        }).catch(function(error) {
            $.toast('获取收藏商品出错，错误：' + error)
        })
    }
}

app.checkLogin()
    .then(function() {
        collects.init();
    });

//删除收藏商品
$('body').on('click', '.icon-shanchu1', function(event) {
    event.stopPropagation();
    var index = $(this).data('collectid');
    $.confirm('确定取消收藏该商品吗？', function () {
		app.request(
			'/mall/delFavoritesById',
			{ favoritesid: index }
		).then(function (res) {
            if (res) {
			    $('.content').empty();
			    collects.init();
            }
		})
    })
})

$('.openconfirm').on('click', function() {
    $.confirm('开启提醒功能后当您的积分足够换取收藏商品时，会发送短信到您设置的手机号码上','确定要修改提醒功能吗？', function () {
        var isEnable;
        custinfo.extInfo.favoritesnotify == 1 ? isEnable=0 : isEnable=1;
		app.request(
			'/club/updateFavoritesNotify',
			{isEnable: isEnable}
		).then(function (res){
			if (res) {
			    $.toast('提醒功能更改成功');
                collects.init();
            }
		})
    })
})

//商品详情跳转
$('body').on('click', '.col-60', function() {
     var href = $(this).attr('data-href');
    window.location.href = href;
})  