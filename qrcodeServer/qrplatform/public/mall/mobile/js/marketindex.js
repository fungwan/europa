/**
 * Created by 75339 on 2017/2/21.
 */
var marketexchange={
    renderList:function(data){
        var d=data.data.data;
        for(var i=0;i<d.length;i++){
            if (i % 2 == 0) {
                $(".list-container").append(`<div class="item">
                <img src="../images/marketindex/${d[i].productname}.png" alt="">
                <div class="prizeBox">
                    <div><span class="prizeTxt">价格：￥</span><span class="prize">${d[i].price}</span></div><div class="spec">${d[i].productname.split('.')[1]}</div><div><a href="./marketgoodsdetail.html?proid=${d[i].productid}" class="btnMore external"></a></div>
                </div>
            </div>`)
            }else {
                $(".list-container").append(`<div class="item">
                <div class="itemOdd">
                    <div><span class="prizeTxt">价格：￥</span><span class="prize">${d[i].price}</span></div><div class="spec">${d[i].productname.split('.')[1]}</div><div><a href="./marketgoodsdetail.html?proid=${d[i].productid}" class="btnMore external"></a></div>
                </div>
                <div class="border"><img src= "../images/marketindex/border.png"/></div>
            </div>`)
            }
        };
        // for(var i=0;i<datas.length;i++){
        //     $(".list-container").append(`<div class="item">
        //     <img src="../images/marketindex/${datas[i].productname}.png" alt="">
        //     <div class="prizeBox odd">
        //         <div><span class="prizeTxt">价格：￥</span><span class="prize">${datas[i].detail[0].price}</span></div><div class="spec">${datas[i].detail[0].spec}</div><div><a href="./marketgoodsdetail.html?proid=${datas[i].detail[0].productid}" class="btnMore external"></a></div>
        //     </div>
        //     <div class="prizeBox">
        //         <div><span class="prizeTxt">价格：￥</span><span class="prize">${datas[i].detail[1].price}</span></div><div class="spec">${datas[i].detail[1].spec}</div><div><a href="./marketgoodsdetail.html?proid=${datas[i].detail[1].productid}" class="btnMore external"></a></div>
        //     </div>
        // </div>`)
        //};
        if (d.length <app.scollItem.size||d.length==0) {
            // 加载完毕，则注销无限加载事件，以防不必要的加载
            $.detachInfiniteScroll($('.infinite-scroll'));
            // 删除加载提示符
            $('.infinite-scroll-preloader').hide();
            // $.toast("没有更多记录了！");
        }
        app.scollItem.loading=false;
    },
    initmypage:function(){
        app.scollItem.size=10;
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
                producttype:['product']
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
        // app.getGrade();
        // app.initSwiper('#ad1', '#adimg1', 'shop1');
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