/**
 * Created by xdf on 2017/5/18
 */
var qouponpresent = {
    giveqoupon: function(id) {
        app.request('/mall/getgiveqoupon', {
                qouponid: id
            }).then(function(res) {
                var code = res.data;
                var qrcode = new QRCode(document.getElementById("qrcodeimg"), {
                    width: 200,
                    height: 200,
                    correctLevel : QRCode.CorrectLevel.L
                });

                qrcode.clear();
                qrcode.makeCode(code);
                
                app.pageInit("#gradegive");
            }).catch(function(err) {
                $.toast("礼券赠送失败:(");
            })
    },
    init: function() {
        qouponpresent.qouponid = app.getSearchParams().qouponid;
        qouponpresent.giveqoupon(qouponpresent.qouponid);
    }
};

// qouponpresent.init();

app.checkLogin()
    .then(function(data) {
        qouponpresent.init();
    })