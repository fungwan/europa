/**
 * Created by 75339 on 2017/2/15.
 */
var selfgrade={
    renderList:function(data){
        var d=data.data;
        for(var i=0;i<d.length;i++){
            $(".list-container").append(`<div class=" row no-gutter" style="padding-left: 1rem;">
                    <div class="col-40">${d[i].projectname}</div>
                    <div class="col-40">${d[i].content}</div>
                    <div class="col-20">${d[i].rectime.slice(0,10)}</div>
                </div>`)
        }
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
        app.scollItem.size=30;
        app.scollItem.addItems('/club/getlotteryrecord',{
                pagenumber:app.scollItem.page,
                pagerows:app.scollItem.size
            })
            .then(function(data){
                selfgrade.renderList(data);
            })
    }
};
//初始化
app.checkLogin()
    .then(function(data){
        selfgrade.initmypage(data);
    });
$(document).on('infinite', '.infinite-scroll-bottom',function() {
    $.refreshScroller();
    if (app.scollItem.loading) return;
    app.scollItem.page++;
    app.scollItem.loading = true;
    app.scollItem.addItems('/club/getlotteryrecord',{
            pagenumber:app.scollItem.page,
            pagerows:app.scollItem.size
        })
        .then(function(data){
            selfgrade.renderList(data);
        })
});
