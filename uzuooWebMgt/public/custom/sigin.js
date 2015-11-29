/**
 * Created by Administrator on 2015/11/22.
 *
 * //Front end
 *
 */
$(function(){

    $('#password').bind('keypress',function(event){
        if(event.keyCode == "13")
        {
            validateSign();
        }
    });

    $("button").bind("click", function () {
        validateSign();
    });

    function validateSign(){

        if(!$("#username").val()){
            $("#logon_info").css({"display":"block","color":"red"});
            $("#logon_info").text('用户名不能为空!');
            return;
        }

        var hash = hex_md5($("#password").val());

        $.post("/login",{username:$("#username").val(),
                password:hash},
            function (data) {

                var jsonObj;
                try {
                    jsonObj = JSON.parse(data);
                }catch (err){

                    alert('后台数据异常,请稍后...');
                    return false;
                }

                if(jsonObj.result === 'fail'){
                    $("#logon_info").css({"display":"block","color":"red"});
                    $("#logon_info").text('密码错误，请重试!');
                }
                else
                    window.location.href="/";
        });
    }
});