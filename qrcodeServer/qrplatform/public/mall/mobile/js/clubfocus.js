/**
 * Created by 75339 on 2017/2/20.
 */
var focu={
    getlist:function(userid){
        $.ajax({
            type: 'post',
            url: '/club/getFocusList',
            data:{
                custid:userid
            },
            success: function (data) {
                if(data.error){
                    $.alert("获取关注失败:"+data.error.message, ["提示"])
                }else{

                    var d=data.data;
                    if(d.length==0){
                        $.toast("您还没有关注的商品！");
                        return;
                    }
                    $(".content").empty();
                    for(var i=0;i<d.length;i++){
                        var text=null;
                        if(d[i].state=="off"){
                            text="立即关注";

                        }else if(d[i].state=="on"){
                            text="取消关注"
                        }
                        $(".content").append(`<div class="card">
                <div class="card-content">
                    <div class="list-block media-list">
                        <ul>
                            <li class="item-content">
                                <div class="item-media">
                                    <img src="${config.mall.entimageurl+d[i].imageurl+'-'+config.mall.entlogosmallstyle}" width="44">
                                </div>
                                <div class="item-inner">
                                    <div class="item-title-row">
                                        <div class="item-title">${d[i].entname}</div>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="card-footer">
                    <span id="${d[i].fid}" data-fid="${d[i].fid}" class="godetail button button-success button fill external button-fill" data-entid="${d[i].entid}">${text}</span>
                    <a href="./clubfocusdetail.html?entid=${d[i].entid}&custid=${d[i].custid}" class="button button-success button fill external button-fill">更多...</a>
                </div>
            </div>`);
                        console.log(d[i].state);
                        if(d[i].state=='off'){
                            $("#"+d[i].fid).removeClass('button-success').addClass('button-warning')
                        }else{
                            $("#"+d[i].fid).removeClass('button-warning').addClass('button-success')
                        }

                    }

                }

            },
            error: function (d) {
                $.alert("异常:"+d, ["提示"]);
            }
        });
    },
    checkstate:function(id,stat){
        console.log(id,stat);
        $.ajax({
            type: 'post',
            url: '/club/changefocusstate',
            data:{
                id:id,
                state:stat
            },
            success: function (data) {
                if(data.error){
                    $.alert("操作失败:"+data.error.message, ["提示"])
                }else {


                    focu.getlist($('.content').attr('data-cud'));

                }

            },
            error: function (d) {
                $.alert("异常:"+d, ["提示"]);
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
                    $('.content').attr({'data-cud':d.custid});
                    focu.initmypage(d);

                }

            },
            error: function (d) {
                $.alert("check异常:"+d, ["提示"]);
            }
        });
    },
    initmypage:function(d){
       focu.getlist(d.custid);
    }
};
focu.checklog();
//focu.getlist('5a83d808-07dd-499a-af60-92c52eb62b9b');

$(".content").on('click','.godetail',function(){
    var id=$(this).attr('data-fid');
    var HTML=$(this).html();
    var stat=null;
    if(HTML=='立即关注'){
        stat='on';
    }else{
        stat='off';
    }
    focu.checkstate(id,stat);
});