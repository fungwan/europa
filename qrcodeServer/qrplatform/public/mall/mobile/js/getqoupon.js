/**
 * Created by 75339 on 2017/2/20.
 */
var getqoupon = {
    getgradeinfo:function(){
        var parm=app.getSearchParams();
        app.request('/',parm)
            .then(function(data){
                var d=data.data;
                $("#recgradebox").html(` HI：<br/>
                    <p style="text-indent: 1rem;margin: 0">${d.message}</p>
                    <p style="text-align: right;margin: 0">${d.custname}</p>
                    <p style="text-align: right;margin: 0">${app.Fmat.getLocalTime(d.outtime)}</p>
                    <p style="text-align: center;margin: 0"><span style="font-size: 2rem;color: red;">${d.point}</span></p>`);
                $("#gettip").html(`您收到来${d.custname}的${d.point}礼券`);
            }).catch(function(data){
                if(data.error){
                    alert("礼券获取失败:"+data.error.message)
                }else{
                    alert("礼券获取失败")
                }
            })
    }
};

app.checkLogin()
    .then(function(data) {
        getqoupon.getgradeinfo();
    })