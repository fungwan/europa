/**
 * Created by 75339 on 2017/2/15.
 */
var selforder={
    parm:function(){
        return {
            custid:app.custid,
            begtime:app.getTime().begintime,
            endtime:app.getTime().endtime,
            pagenumber:app.scollItem.page,
            pagerows:app.scollItem.size
        }
    },
    renderList:function(data){
        var order=data.data.rows;
        for(var i=0;i<order.length;i++){
            if(data.data.rows[i].items.length<2){
                //订单只有一个商品时
                var Val=app.unit;
                var pay=null;
               
                if (order[i].producttype == "redpacket") {

                    pay = order[i].paymoney;
                } else {
                    pay = order[i].paymoney;
                }
                var src='';
                
                if(order[i].producttype=='blh'){
                    src=order[i].items[0].productimage
                }else{
                    src=config.mall.productlistimageurl+order[i].items[0].productimage+'-list';
                }
                $("#myorderbox").append(`<div class="card" data-orderid="${order[i].orderid}">
                <img src="../images/order/state/${order[i].state}.png" />
                                <div class="card-header">订单号:${order[i].orderbm}</div>
                                <div class="card-content">
                                    <div class="list-block media-list">
                                        <ul>
                                            <li class="item-content">
                                                <div class="item-media">
                                                    <img src="${src}" width="60">
                                                </div>
                                                <div class="item-inner">
                                                    <div>${order[i].items[0].productname}</div>
                                                    <div>${order[i].items[0].productinfo}</div>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                               <div class="card-mid">共1件商品：实付${pay}${Val}</div>
                                <div class="card-footer">
                                    ${order[i].createtime.slice(0,10)}
                                </div>
                            </div>`);

            }else{
                //订单只有多个商品时
                $("#myorderbox").append(`<div class="card" data-orderid="${order[i].orderid}">
                <img src="../images/order/state/${order[i].state}.png" />
                                <div class="card-header">订单号:${order[i].orderbm}</div>
                                <div class="card-content">
                                    <div class="list-block media-list">
                                        <ul>
                                            <li class="item-content">
                                                <div class="item-media" id="${order[i].orderbm}">
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <div class="card-mid">共${order[i].items.length}件商品：实付${(order[i].paymoney)}${app.unit}</div>
                                <div class="card-footer">
                                    ${order[i].createtime.slice(0,10)}
                                </div>
                            </div>`);

                for(var m=0;m<order[i].items.length;m++){
                    $("#"+order[i].orderbm).append(`<a href="" data-detailimg="${JSON.stringify(order[i].items)}"><img src="${config.mall.productlistimageurl+ order[i].items[m].productimage+'-list'}" width="60"></a>`)
                }


            }

        };
        if (order.length <app.scollItem.size||order.length==0) {
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
            '/club/getWaitEval',
            selforder.parm())
            .then(function(data){
                selforder.renderList(data);
            })
    }
};
//初始化
app.checkLogin()
    .then(function(data){
        selforder.initmypage(data);
        app.getGrade();
    });
//改变时间筛选数据
$("body").on('click','#sure',function(){

    app.scollItem.init();
    app.scollItem.addItems(
        '/club/getWaitEval',
        selforder.parm())
        .then(function(data){
            selforder.renderList(data);
        })
});
$(document).on('infinite', '.infinite-scroll-bottom',function() {
    $.refreshScroller();
    if (app.scollItem.loading) return;
    app.scollItem.page++;
    app.scollItem.loading = true;
    app.scollItem.addItems(
        '/club/getWaitEval',
        selforder.parm())
        .then(function(data){
            selforder.renderList(data);
        })
});
$("#myorderbox").on("click",".card",function(){
    window.location.href="./marketorderlistdetail.html?id="+$(this).attr("data-orderid")
})