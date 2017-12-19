/**
 * Created by 75339 on 2017/2/21.
 */
var lastpage = 2;
var ddaa=0;
var marketexchange={
    getinifit:function(){
        // 加载flag
        var loading = false;
        // 最多可加载的条目
        var maxItems = 100;

        // 每次加载添加多少条目
        var itemsPerLoad = 5;

        var sendobj={
            categoryid:"",
            page:1,
            size:itemsPerLoad
        };
        function addItems(number,sendobj) {

            // 生成新条目的HTML
            $.ajax({
                type: 'post',
                url: '/mall/pdtlist',
                data:sendobj,
                success: function (data) {
                    if(data.error){
                        $.alert("获取失败:"+data.error.message, ["提示"])
                    }else{
                        //var d=data.data.rows;
                        var d=data.data.data;
                        $(".infinite-scroll-preloader").hide();
                        if(d.length==0){
                            $.toast("没有商品可以选择！");
                            return;
                        }
                        ddaa=data.data.totalsize;
                        for(var i=0;i<d.length;i++){

                            //订单只有一个商品时
                            if(d[i].producttype=='redpacket'){
                                $(".cardbox").append(`<div class="card">
                    <div class="card-content">
                        <div class="list-block media-list">
                            <ul>
                                <li class="item-content">
                                    <div class="item-media">
                                        <a href="./marketgoodsdetail.html?proid=${d[i].productid}" class="external">
                                             <img src="${data.data.imageurl}${d[i].productimage}-${data.data.imagestyle}" width="80">
                                        </a>
                                    </div>
                                    <div class="item-inner">
                                        <div class="item-title-row">
                                            <div class="item-title">${d[i].productname}</div>
                                            <div style="font-size: 0.6rem;"><span style="color:red;font-size: 1.2rem;margin-right: 4px;">${d[i].price}</span>积分</div>
                                        </div>
                                        <div class="item-subtitle">${d[i].productinfo}</div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="checkcontrol" style="height: 30px;"><span style="margin-left: 2rem;font-size: 1rem">库存：${d[i].amount}</span><span class="numgroup" style="float: right;margin-right: 20px"><span class="numdel">-</span><input data-numid id="${d[i].productid}val" type="number" class="goodsnum" value="1" data-max="${d[i].amount}"><span class="numadd">+</span></span></div>
                    <div class="card-footer">
                        <span id="${d[i].productid}"></span>
                        <span><a data-num=1 data-price="${d[i].price}"  href="javasxript:;" class="button button-success addshopcar" data-id="${d[i].productid}">加入购物车</a></span>
                    </div>
                </div>`);
                                $('[data-id='+d[i].productid+']').attr({'data-redobj':JSON.stringify(d[i])});
                                $('[data-id='+d[i].productid+']').attr({'data-img':data.data.imageurl});
                                $('[data-id='+d[i].productid+']').attr({'data-imagestyle':data.data.imagestyle});
                                $('[data-id='+d[i].productid+']').html('立即兑换');
                                $('[data-id='+d[i].productid+']').attr({'href':'./marketgoredpack.html'});
                                $('[data-id='+d[i].productid+']').addClass('external');
                            }

                            for(var j=0;j<d[i].leve;j++){

                                $("#"+d[i].productid).append(`<span class="iconfont icon-heart1"></span>`)

                            }
                            if(d[i].leve<5){
                                for(var j=0;j<5-parseInt(d[i].leve);j++){

                                    $("#"+d[i].productid).append(`<span class="iconfont icon-heart1 active"></span>`)

                                }
                            }
                        };
                        loading = false;
                    }

                },
                error: function (d) {
                    $.alert("记录获取失败:"+d, ["提示"]);
                }
            });
        }
        //预先加载5条
        addItems(itemsPerLoad,sendobj);

        // 上次加载的序号

        var lastIndex = 5;

        // 注册'infinite'事件处理函数
        $(document).on('infinite', '.infinite-scroll-bottom',function() {

            // 如果正在加载，则退出
            if (loading) return;

            // 设置flag
            loading = true;
            if(ddaa === 0 )return;
            if (ddaa!=0&&lastpage >Math.ceil(parseInt(ddaa)/5)) {
                // 加载完毕，则注销无限加载事件，以防不必要的加载
                $.detachInfiniteScroll($('.infinite-scroll'));
                // 删除加载提示符
                $('.infinite-scroll-preloader').remove();
                return;
            }
            // 添加新条目
            //itemsPerLoad页数每页20条
            //lastIndex上次加载的条数

            var mysendobj={
                categoryid:$("#picker").attr('disvalue'),
                page:lastpage,
                size:'5'
            };
            addItems(itemsPerLoad,mysendobj);
            // 更新最后加载的序号
            lastpage++;
            //容器发生改变,如果是js滚动，需要刷新滚动
            $.refreshScroller();

        });
    },
    shopcaradd:function(obj,that){
        $.ajax({
            type: 'post',
            url: '/mall/addtoshopcart',
            data:obj,
            success: function (data) {
                if(data.error){
                    $.alert("异常:"+data.error.message, ["提示"])
                }else{

                    if(data.data==true){
                        $.toast("添加成功！");
                        $(that).html("去购物车查看");
                        $(that).attr({'href':'./marketshopcar.html'});
                        $(that).addClass('external');
                    }else{
                        $.alert("添加商品失败:"+data.error.message, ["提示"]);
                    }

                }

            },
            error: function (d) {
                $.alert("异常:"+d, ["提示"]);
            }
        });
    },
    getpergrade:function(userid){
        $.ajax({
            type: 'post',
            url: '/club/getCustInfo',
            data:{
                custid:userid
            },
            success: function (data) {
                if(data.error){
                    $.alert("积分获取失败:"+data.error.message, ["提示"])
                }else{
                    if(data.data&&data.data.point){
                        $(".pergarde").html(`<a href="./selfgrade.html" class="external">${data.data.point||0}</a>`);
                    }else{
                        $(".pergarde").html(`<a href="./selfgrade.html" class="external">0</a>`);
                    }
                }

            },
            error: function (d) {
                $.alert("积分获取失败:"+d, ["提示"]);
            }
        });
    },
    updatenumber:function(obj){
        $.ajax({
            type: 'post',
            url: '/mall/updateshopitemnumber',
            data:obj,
            success: function (data) {
                console.log(data);
                if(data.error){
                    $.alert("积分获取失败:"+data.error.message, ["提示"])
                }else{
                    console.log(data)
                }

            },
            error: function (d) {
                $.alert("积分获取失败:"+d, ["提示"]);
            }
        });
    },
    checklog:function(){
        $.ajax({
            url: "/mobile/checklogin",
            type: 'post',
            success: function (data) {
                if(data.error){
                    if(data.error.code=='unlogin'){
                        //未登录
                        var thisurl=window.location.href;
                        window.sessionStorage.setItem('thisurl',thisurl);
                        window.location.href='./login.html';
                    }else{
                        $.alert("异常:"+data.error.message, ["提示"]);
                    }
                }else{
                    //获取微信用户信息
                    var d=data.data;
                    $(".cardbox").attr({'data-cuid':d.custid});
                    marketexchange.initmypage(d);

                }

            },
            error: function (d) {
                $.alert("check异常:"+d, ["提示"]);
            }
        });
    },
    initmypage:function(d){
        marketexchange.getinifit($("#picker").attr('disvalue'));
    }
};

marketexchange.checklog();
//改变时间
$("body").on('click','#sure',function(){
    $.init();
    $.attachInfiniteScroll($('.infinite-scroll'));
    lastpage = 2;
    ddaa=0;
    $(".cardbox").empty();
    marketexchange.getinifit($("#picker").attr('disvalue'));
});





$(".cardbox").on('click','.addshopcar',function(e){
    var text=$(this).html();
    if(text=='立即兑换'){
        var redobj={
            info:JSON.parse($(this).attr('data-redobj')),
            imgurl:$(this).attr('data-img'),
            imgstyle:$(this).attr('data-imagestyle'),
            num:$(this).attr('data-num'),
            price:$(this).attr('data-price')
        };
        console.log(redobj);
        window.localStorage.setItem('redpack',JSON.stringify(redobj));
    }else if(text=='加入购物车'){
        var pid=$(this).attr('data-id');
        var that=this;

        var relval=$("#"+pid+"val").val();
        var userid= $(".cardbox").attr('data-cuid');
        var senobj={
            custid:userid,
            number: relval,
            productid:pid
        };
        marketexchange.shopcaradd(senobj,that);
    }

});

//商品加减(限制商品数量的取值范围)
$(".cardbox").on('click','.numadd',function(){
    var value=$(this).prev().val();
    var maxvalue=$(this).prev().attr("data-max");
    if(value==maxvalue){
        $(this).prev().val(maxvalue)
    }else{
        $(this).prev().val(parseInt(value)+1)
    }
    $(this).parent().parent().next().children().eq(1).children('[data-num]').attr({'data-num':$(this).prev().val()})
});
$(".cardbox").on('click','.numdel',function(){
    var value=$(this).next().val();
    var maxvalue=$(this).next().attr("data-max");
    if(value==0){
        $(this).next().val("0")
    }else{
        $(this).next().val(parseInt(value)-1)
    }
    $(this).parent().parent().next().children().eq(1).children('[data-num]').attr({'data-num':$(this).next().val()})
});
$(".cardbox").on('change','[data-max]',function(){
    var value=$(this).val();
    var maxvalue=$(this).attr('data-max')
    if(value==0){
        $(this).val("0");
    }else if(parseInt(value)>=parseInt(maxvalue)){
        $(this).val(maxvalue);
    }
    $(this).parent().parent().next().children().eq(1).children('[data-num]').attr({'data-num':$(this).val()})
});