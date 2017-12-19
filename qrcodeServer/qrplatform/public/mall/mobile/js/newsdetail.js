/**
 * Created by 75339 on 2017/2/23.
 */
var newsdetail={
    data: {
        title: '',
        imgUrl: '',
        link: window.location.href
    },
    initnews:function(artid){
        app.request("/club/getarticlebyid",{artid:artid})
            .then(function(data){
                var d = data.data;
                
                document.title = d.title;
                $('meta[name=description]').attr('content', d.summary)

                newsdetail.data.title = d.title;
                newsdetail.data.desc = d.summary;
                newsdetail.data.imgUrl = config.mall.articleimageurl + d.titleimageurl + '-' + config.mall.articleimagestyle;

                $("#mymy").html(`
                <div class="card" style="margin: 0;">
                    <div class="card-header" style="font-size: 1.2rem;word-break: break-all">${d.title}</div>
                    <div class="subtitle auth"><span class="tim">${app.Fmat.getLocalTime(d.publishtime)}</span><span class="auo">${d.author}</span></div>
                    <div class="subtitle" style="text-indent: 1rem">${d.summary}</div>
                    <div class="card-content">
                        <div class="card-content-inner">${d.content}</div>
                    </div>
                    <div class="card-footer"><a href="${d.authorurl==''?window.location.href:d.authorurl}" class="external">原文地址</a></div>
                </div>
                `);
                if(d.authorurl==''){
                    $(".card-footer").hide();
                }
            })
            .catch(function(data){
                console.log(data)
                $.toast(JSON.stringify(data));
                if(data.error){
                    $.toast("获取文章失败:"+data);
                }else{
                    $.toast("获取文章失败")
                }
            })
    }
};
app.checkLogin()
    .then(function(){
        app.weixinSDK.init(
            window.location.href,
            function() {
                // 注册分享事件
                wx.onMenuShareAppMessage({
                    title: newsdetail.data.title,
                    desc: newsdetail.data.desc,
                    imgUrl: newsdetail.data.imgUrl,
                    link: window.location.href,
                });
                wx.onMenuShareTimeline({
                    title: newsdetail.data.title,
                    link: newsdetail.data.link,
                    imgUrl: newsdetail.data.imgUrl,
                });
            }
        )
    })
    .then(function() {
        newsdetail.initnews(app.getSearchParams().artid)
    })



