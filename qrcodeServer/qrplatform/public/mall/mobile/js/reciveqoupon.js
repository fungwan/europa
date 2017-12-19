/**
 * Created by 75339 on 2017/2/20.
 */
var getqoupon = {
    getqouponinfo: function(){
        var code = app.getSearchParams().code;
        app.request(
            '/mall/recivegiveqoupon',
            { code: code }
        ).then(function(data){
            var res = data.data;
            $("#recgradebox").html(`
                <div class="title">
                    礼券接收成功 :)<br>
                </div>
                <div class="info">
                    关注公众号，查看礼券详情
                </div>
            `);
        }).catch(function(err){
            err = err.error;
            $("#recgradebox").html(`
                <div class="title">
                    礼券接收失败 :(<br>
                </div>
                <div class="info">
                    ${err.message}
                </div>
            `);
        })
    }
};

app.checkLogin()
    .then(function(data) {
        getqoupon.getqouponinfo();
    })