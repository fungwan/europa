/**
 * Created by 75339 on 2017/2/27.
 */
var marketindex={
    getpergrade(userid){
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
                        $(".poinnum").html(data.data.point||0);
                    }else{
                        $(".poinnum").html(0);
                    }
                }

            },
            error: function (d) {
                $.alert("积分获取失败:"+d, ["提示"]);
            }
        });
    },
    initslide(){
        $.ajax({
            type: 'post',
            url: '/club/gettoparticle',
            data:{
                limit:5
            },
            success: function (data) {
                if(data.error){
                    $.alert("获取失败:"+data.error.message, ["提示"])
                }else{
                    var d=data.data;
                    for(var i=0;i<d.length;i++){
                        $(".swiper-wrapper").append(`<div class="swiper-slide"><a href="./newsdetail.html?artid=${d[i].artid}" class="external"><img src="${config.mall.articleimageurl+d[i].titleimageurl+'-'+config.mall.articleimagestyle}" alt=""></a></div>`);
                    };
                    $(".swiper-container").swiper({
                        direction:'horizontal',
                        autoplay:2000,
                        speed:3000,
                        loop:false
                    });
                    $.init();
                }

            },
            error: function (d) {
                $.alert("异常:"+d, ["提示"]);
            }
        });
    },
    checklog(){

        $.when($.ajax({
            url: "/mobile/checklogin",
            type: 'post'
        }),$.ajax({
            url: "/club/gettoparticle",
            data:{limit:5},
            type: 'post'
        })).done(function(d){ console.log(d);} )
            .fail(function(d){ console.log(d); } )
            .done(function(d){ console.log(d);} );
        function ajaxlogin(){

        }
        function ajaxinit(){

        }

    },
    initmypage(d){
        marketindex.getpergrade(d.custid);
        marketindex.initslide();
    }
};
marketindex.checklog();
//marketindex.getpergrade('5a83d808-07dd-499a-af60-92c52eb62b9b');
//marketindex.initslide();
$(".exch").click(function(){
    window.location.href='./marketgradeexchange.html'
});
