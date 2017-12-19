/**
 * Created by 75339 on 2017/2/15.
 */
var selfinfo={
    getuserinfo:function(){
        app.request("/shop/getCustSummary",{custid:app.custid})
            .then(function(data){
                if(data && data.data && data.data.newinfo){
                    var d = data.data.newinfo;

                    // if(d.neworderreceivin>0){
                    //     $("#receiving-goods").append(`<span class="badg" id="neworderreceivin">${d.neworderreceivin}</span>`)
                    // };
                    // if(d.newordereva>0){
                    //     $("#eva").append(`<span class="badg" id="newordereva">${d.newordereva}</span>`)
                    // };
                    // if(d.newprize>0){
                    //     $("#Award-record").append(`<span class="badg" id="newprize">${d.newprize}</span>`)
                    // };
                    // if(d.newprizereceivin>0){
                    //     $("#receiving-award").append(`<span class="badg" id="newprizereceivin">${d.newprizereceivin}</span>`)
                    // };
                }
                return data
            })
            .then(function(data){
                //获取排名
                selfinfo.getperrank();
                return data
            })
            .then(function(data){
                selfinfo.initGrade(data);
                app.initSwiper('#ad1','#adimg1','shop1');
            })
            .catch(function(data){
                if(data.error){
                    $.toast("获取个人信息异常:"+data.error.message);
                }else{
                    $.toast("异常");
                }
            });
    },
    delred:function(redname){
        app.request("/shop/readMessage",{custid:app.custid,messageType:redname})
            .then(function(data){
                if(data && data.data){
                    $("#"+redname).remove();
                }
            })
            .catch(function(data){
                if(data.error){
                    $.toast("异常:"+data.error.message);
                }else{
                    $.toast("异常");
                }
            });
    },
    initGrade:function(da){
        if(da.data){
            //用户等级设置
            $("#gradleve").empty();
            if(da.data.leve>0){
                $("#gradleve").empty();
                for(var i=0;i<da.data.leve;i++){
                    $("#gradleve").append(`<span class="iconfont icon-huangguan"></span>`)
                }
                $("#onlusign").html(`用户等级：<span>LV${da.data.leve}</span>`)
            }else{
                $("#gradleve").empty();
                $("#gradleve").append(`<span class="iconfont icon-huangguan"></span>`)
                $("#onlusign").html(`用户等级：<span>LV1</span>`)
            }
        }else{
            //用户等级设置
            $("#gradleve").empty();
            $("#gradleve").html(`<span class="iconfont icon-vipdengji0"></span>`)
        }
    },
    getperrank:function(){
        app.request("/club/getPointRanking",{custid:app.custid,page:1,size:10})
            .then(function(data){
                if (!data.data[0].point || data.data[0].point == 0) {
                    $('.rank').html(`
                        当前暂无排名
                    `)
                } else {
                    $(".rank>span").html(data.data[0].rownum )
                }
            })
            .catch(function(data){
                if(data.error){
                    $.toast("排名获取失败:"+data.error.message)
                }else{
                    $.toast("排名获取失败");
                }
            });
    },
    initpage:function(d){
        //设置头像
        $(".headpic").attr({'src':d.headimgurl});
        //设置昵称
        $("#wxnickname").html(d.nickname);
    }
};
app.checkLogin()
    .then(function(data){
        selfinfo.initpage(data);
    }).then(function(){
        selfinfo.getuserinfo();
    }).then(function(){
        app.getGrade();
});
$(".sred").click(function(e){
    e.preventDefault();
    var url=$(this).attr('href');
    var redname=$(this).attr("data-red");
    selfinfo.delred(redname);
    window.location.href=url;
});