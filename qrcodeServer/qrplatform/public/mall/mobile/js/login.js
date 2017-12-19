//$.showPreloader('登录中');
var login={
        thaturl:window.sessionStorage.getItem('thisurl'),
        sign:function(){
            var parm=app.getSearchParams();
            if(parm.code){
                //登录
                app.request("/mobile/login",{
                    code: parm.code,
                    entid: '0',
                    custtype:'1',
                    lng: 0,
                    lat: 0
                }).then(function(data){
                    var d=data.data;
                    window.location.href=login.thaturl;
                }).catch(function(data){
                    if(data.error){
                        $.toast("登录失败:"+data.error.message);
                    }else{
                        $.toast("登录失败")
                    }
                })
            }else{
                var reuri = encodeURIComponent(window.location.href);

                window.location.href = "http://open.weixin.qq.com/connect/oauth2/authorize?appid="+config.wechat.appid+"&redirect_uri=" + reuri + "&response_type=code&scope=snsapi_userinfo&state=frist#wechat_redirect";
            }


        }
};

login.sign();