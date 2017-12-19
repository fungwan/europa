/**
 * Created by 75339 on 2017/2/21.
 */
var marketexchange={
    renderList:function(data){
        var d=data.data.data;
        for(var i=0;i<d.length;i++){
            $(".list-container").append(`
                <div class="carditem row no-gutter clear" data-href="./marketgoodsdetail.html?proid=${d[i].productid}">
                    <div class="col30 lf"><a href="./marketgoodsdetail.html?proid=${d[i].productid}" class="external"><img src="${d[i].producttype=='blh'?d[i].productimage:data.data.imageurl+d[i].productimage+'-'+data.data.imagestyle}" alt=""></a></div>
                    <div class="col70 lf">
                        <div class="col70item type">
                            <span class="${d[i].producttype}">${app.Product.typeTxt(d[i].producttype)}</span>
                            <span class="discount ${d[i].isDiscount==0 ? 'notDiscount' : ''}">${d[i].isDiscount==1 ? '折' : ''}</span>
                        </div>
                        <div class="col70item txt1">${d[i].productname}</div>
                        <div class="col70item txt2">${d[i].productinfo}</div>
                        <div class="col70item clear txt3">
                            <div class="cont lf"><span class="pric">${d[i].price}</span>${d[i].producttype == 'redpacket' ? '积分' : app.unit}</div>
                            <div class="cont rt"><a href="./marketgoodsdetail.html?proid=${d[i].productid}" class="external">详情》</a></div>
                        </div>
                    </div>
                </div>
            `)
        };
        if (d.length <app.scollItem.size||d.length==0) {
            // 加载完毕，则注销无限加载事件，以防不必要的加载
            $.detachInfiniteScroll($('.infinite-scroll'));
            // 删除加载提示符
            $('.infinite-scroll-preloader').hide();
            $.toast("没有更多记录了！");
        }
        app.scollItem.loading=false;
    },
    initmypage:function(){
        app.scollItem.size=5;
        app.scollItem.addItems(
            '/mall/pdtlist',
            marketexchange.getparm())
            .then(function(data){
                marketexchange.renderList(data);
            })
        },
    getparm:function(){
        var obj={
            point:"",
            page:app.scollItem.page,
            size:app.scollItem.size,
            //showpoint:false,
            query: JSON.stringify({
                state: 'sell',
                // producttype:['redpacket','qoupon','product','cinema','phone','net','blh']
                producttype:['redpacket', 'blh']                
            })
        };
        if($("#canget").prop('checked')){
            obj.point=app.point;
        }else{
            obj.point='';
        }
        return obj;
    }
};
app.checkLogin()
    .then(function(data){
        app.getGrade();
        marketexchange.initmypage();
    });
$(document).on('infinite', '.infinite-scroll-bottom',function() {
    $.refreshScroller();
    if (app.scollItem.loading) return;
    app.scollItem.page++;
    app.scollItem.loading = true;
    app.scollItem.addItems(
        '/mall/pdtlist',
        marketexchange.getparm())
        .then(function(data){
            marketexchange.renderList(data);
        })
});
//筛选可以兑换的商品
$("#canget").click(function(){
    app.scollItem.init();
    app.scollItem.addItems(
        '/mall/pdtlist',
        marketexchange.getparm())
        .then(function(data){
            marketexchange.renderList(data);
        })
});
//跳转商品详情页
$(".cardbox").on('click','.carditem',function(){
    var hr=$(this).attr('data-href');
    window.location.href=hr;
});