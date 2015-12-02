/**
 * Created by Administrator on 2015/12/1.
 */
$(document).ready(function() {
    $("#modify_account_pw_link").click(function(){
        $("#modify_account_pw_dlg").find("input").css("color", "black");
        $("#modify_account_pw_dlg").modal("show");
    });

    $("#modify_account_pw_cancel_btn").click(function(){
        $("#modify_account_pw_dlg input").val("");
        $("#modify_account_pw_error_tooltip_p").hide();
        $("#modify_account_pw_error_tooltip_span").html("");
        $("#modify_account_pw_dlg").modal("hide");
    });

    $("#modify_account_pw_btn").click(function(){

        var uuid = $("#useruuid").val();
        var oldPassword = $("#old_account_password_input").val();
        var password = $("#modify_account_password_input").val();
        var confirmPassword = $("#modify_account_confirm_password_input").val();

        if(password.trim() != "" && password == confirmPassword){

            oldPassword = hex_md5(oldPassword);
            password = hex_md5(password);

            $.post("/doUpdateUserPWById",
                {
                    id:uuid,
                    content:{
                        oldPW:oldPassword,
                        newPW:password
                    }
                },
                function (data) {
                    if(data.result == "success"){
                        $("#modify_account_pw_dlg input").val("");
                        $("#modify_account_pw_dlg").modal("hide");
                    }else{
                        $("#modify_account_pw_error_tooltip_p").show();
                        $("#modify_account_pw_error_tooltip_span").html("原密码填写错误！");
                    }
                });

        }else{
            $("#modify_account_pw_error_tooltip_p").show();
            $("#modify_account_pw_error_tooltip_span").html("密码不能为空，并且密码必须一致！");
        }
    });
});