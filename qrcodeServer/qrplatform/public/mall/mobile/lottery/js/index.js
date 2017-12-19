var lottery={
    getpergrade:function(userid){
        $.ajax({
            type: 'post',
            url: '/club/getCustInfo',
            data:{
                custid:userid
            },
            success: function (data) {
                console.log(data);
                if(data.error){
                   alert("积分获取失败:"+data.error.message, ["提示"])
                }else{
                    if(data.data&&data.data.point){
                        $("#pergrade").html(data.data.point);
                    }else{
                        $("#pergrade").html(0);
                    }

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
                       alert("异常:"+data.error.message, ["提示"]);
                    }
                }else{
                    //获取微信用户信息
                    var d=data.data;
                    $("#tip").attr({'data-id':d.custid})
                    lottery.initmypage(d);

                }

            },
            error: function (d) {
                $.alert("check异常:"+d, ["提示"]);
            }
        });
    },
    initmypage:function(d){
        //初始化
        lottery.getpergrade(d.custid);
    },
    isrite:true,
    rotate:function(cuid){
        if(lottery.isrite){
            lottery.isrite=false;
            $('#img').css({
                'transform': 'rotate('+0+'deg)',
                '-ms-transform': 'rotate('+0+'deg)',
                '-webkit-transform': 'rotate('+0+'deg)',
                '-moz-transform': 'rotate('+0+'deg)',
                '-o-transform': 'rotate('+0+'deg)',
                'transition': 'transform ease-out '+0+'s',
                '-moz-transition': '-moz-transform ease-out '+0+'s',
                '-webkit-transition': '-webkit-transform ease-out '+0+'s',
                '-o-transition': '-o-transform ease-out '+0+'s'
            });
            var rand_circle = Math.ceil(Math.random() * 2) + 1;
            $.ajax({
                type: 'post',
                url: '/mall/pointlottery',
                success: function (data) {

                    if(data.error){
                       alert("异常:"+data.error.message, ["提示"])
                    }else{
                        lottery.getpergrade(cuid);
                        console.log(data);
                        if(data.data.lottery){
                            //中奖了
                            var lot=data.data.lotteryinfo.name;
                            if(lot=='3等奖'){
                                var rdg=rand_circle*360+90;
                                lottery.lastdeg=rdg;
                            }else if(lot=='2等奖'){
                                var rdg=rand_circle*360+180;
                                lottery.lastdeg=rdg;
                            }else if(lot=='1等奖'){
                                var rdg=rand_circle*360;
                                lottery.lastdeg=rdg;
                            }
                            $('#img').css({
                                'transform': 'rotate('+rdg+'deg)',
                                '-ms-transform': 'rotate('+rdg+'deg)',
                                '-webkit-transform': 'rotate('+rdg+'deg)',
                                '-moz-transform': 'rotate('+rdg+'deg)',
                                '-o-transform': 'rotate('+rdg+'deg)',
                                'transition': 'transform ease-out '+2+'s',
                                '-moz-transition': '-moz-transform ease-out '+2+'s',
                                '-webkit-transition': '-webkit-transform ease-out '+2+'s',
                                '-o-transition': '-o-transform ease-out '+2+'s'
                            });
                            setTimeout(function(){
                                if(lot=='3等奖'){
                                    $('#apply1').modal('show');
                                }else if(lot=='2等奖'){
                                    $('#apply2').modal('show');
                                }else if(lot=='1等奖'){
                                    $('#apply3').modal('show');
                                }

                                lottery.isrite=true;
                            },2000);

                        }else{
                            //没有中奖
                            var rdg1=rand_circle*360+45;
                            var rdg2=rand_circle*360+135;
                            var rdg3=rand_circle*360+225;
                            var rdg4=rand_circle*360+315;
                            var rdgarr=[rdg1,rdg2,rdg3,rdg4];
                            var l=Math.floor(Math.random() * 4);
                            $('#img').css({
                                'transform': 'rotate('+rdgarr[l]+'deg)',
                                '-ms-transform': 'rotate('+rdgarr[l]+'deg)',
                                '-webkit-transform': 'rotate('+rdgarr[l]+'deg)',
                                '-moz-transform': 'rotate('+rdgarr[l]+'deg)',
                                '-o-transform': 'rotate('+rdgarr[l]+'deg)',
                                'transition': 'transform ease-out '+2+'s',
                                '-moz-transition': '-moz-transform ease-out '+2+'s',
                                '-webkit-transition': '-webkit-transform ease-out '+2+'s',
                                '-o-transition': '-o-transform ease-out '+2+'s'
                            });
                            setTimeout(function(){
                                $('#apply4').modal('show');
                                lottery.isrite=true;
                            },2000);
                        }
                    }

                },
                error: function (d) {
                    alert("积分获取失败:"+d, ["提示"]);
                }
            });
        }





    }
};

lottery.checklog();

$('#tip').click(function(){
    var cuid=$("#tip").attr('data-id');
    lottery.rotate(cuid);
});