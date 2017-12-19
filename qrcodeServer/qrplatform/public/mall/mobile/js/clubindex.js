/**
 * Created by 75339 on 2017/4/20.
 */
/**
 * Created by 75339 on 2017/2/27.
 */
var marketindex={
    initad:function(){
        app.request( '/club/getAdList',{adtype:'clube_onsale',state:1})
            .then(function(data){
                if(data.data&&data.data.length!=0){
                    var d=data.data;
                    for(var i=0;i<d.length;i++){
                        $(".club-text").append(`<div class="text-item lf ite"><a href="./newsdetail.html?artid=${d[i].artid}" class="external">${d[i].title}</a></div>`);
                    };
                    var da=data.data[0];
                    $(".adimg2").append(`<a href="./newsdetail.html?artid=${da.artid}" class="external"><img src="${config.mall.articleimageurl+da.titleimageurl+'-'+config.mall.articleimagestyle}" alt=""></a>`);
                    $('.ite').add().addClass('bor');
                }else{
                    $(".club-act").hide()
                }
            })
            .catch(function(data){
                if(data.error){
                    $.toast("广告获取失败:"+data.error.message)
                }else{
                    $.toast("广告获取失败");
                }
            });
    }
};
app.checkLogin()
    .then(function(data){
        marketindex.initad();
        return data;
    })
    .then(function(){
        app.initSwiper('#ad1','#adimg1','clube_news');
    });