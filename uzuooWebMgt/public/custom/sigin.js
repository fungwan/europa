/**
 * Created by Administrator on 2015/11/22.
 *
 * //Front end
 *
 */
$(function(){

    var flag = false;

    if ($.cookie("rmbUser") == "true") {
        $("#ck_rmbUser").attr("checked", true);
        $("#username").val($.cookie("username"));
        $("#password").val($.cookie("password"));
    }

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

        var hash = '';
        if($.cookie("username") === $("#username").val() && 
            $.cookie("password") === $("#password").val()){
            hash = $("#password").val();
        }else{
            hash = hex_md5($("#password").val());
        }

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
                else{

                    if ($("#ck_rmbUser").attr("checked")) {
                        var str_username = $("#username").val();
                        var str_password = hash;
                        $.cookie("rmbUser", "true", { expires: 7 }); //存储一个带7天期限的cookie
                        $.cookie("username", str_username, { expires: 7 });
                        $.cookie("password", str_password, { expires: 7 });
                    }
                    else {
                        flag = false;
                        $.cookie("rmbUser", "false", { expire: -1 });
                        $.cookie("username", "", { expires: -1 });
                        $.cookie("password", "", { expires: -1 });
                    }

                    window.location.href="/";
                }
        });
    }

});