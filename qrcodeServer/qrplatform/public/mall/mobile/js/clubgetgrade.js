/**
 * Created by 75339 on 2017/2/20.
 */
var clubgetgrade={
    parm:{},
    getgradeinfo:function(){
        app.request('/club/finishPointExchange',clubgetgrade.parm)
            .then(function(data){
                var d=data.data;
                $(".content").html(`
                    <div class="hi">hi:</div>
                    <div class="message">${d.message}</div>
                    <div class="point">${d.point}积分</div>
                    <div class="qr">
                        <img src="../images/qr.jpg" alt="">
                    </div>
                    <div class="info infodata">收到来自${d.custname}的${d.point}积分</div>
                    <div class="info">长按二维码关注公众号查看积分</div>
                    <div class="time">${moment(d.outtime).format().slice(0,10)}</div>
                `)
        }).catch(function(data){
                if(data.error){
                    $.toast("积分接收失败:"+data.error.message)
                }else{
                    $.toast("积分接收失败")
                }
            })
    }
};
app.checkLogin()
    .then(function(data) {
        var parm=app.getSearchParams();
        clubgetgrade.parm.custid=app.custid;
        clubgetgrade.parm.exchangeid=parm.exchangeid;
    }).then(function(){
        clubgetgrade.getgradeinfo();
    })
