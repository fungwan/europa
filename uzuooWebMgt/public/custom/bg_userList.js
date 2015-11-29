/**
 * Created by Administrator on 2015/11/25.
 */


$(document).ready(function(){

    laypage({
        cont: $('#bgUserPage'), //容器。值支持id名、原生dom对象，jquery对象,
        pages: 100,
        skip: true, //是否开启跳页
        skin: 'yahei',
        groups: 5, //连续显示分页数
        hash: false, //会对url追加#!laypage_
        jump: function(obj){
            //$('#view6').html('看看URL的变化。通过hash，你可以记录当前页。当前正处于第'+obj.curr+'页');
            //alert(obj.curr);
        }
    });

    //真正执行删除的按钮
    $("#btn-del").click(function(){

        var flag = false;

        //遍历表格的每行的选中状态 uz-table 误删
        $("#bgUsers-tab tr").each(function(){
                var text = $(this).children("td:first").find('input').is(':checked');// .text();
                if(text){
                    alert("有个勾勾是选中的...");
                    flag = true;
                }

        });

        if(!flag){
            alert('至少选择一项!');
            return;
        }

        $("#bgUsers-tab tr").each(function(){
            var text = $(this).children("td").eq(3).attr("id");//$(this).children("td:first").text();
            //alert(text);

        });

    });

    //表单每行的编辑
    $(".btn-default.btn-xs").click(function(){
       //alert(this.parentNode.id);
       $('#create_account_dlg').modal('show');//触发模态模态窗口
    });

    //表单每行的删除
    $(".btn-danger").click(function(){
        //alert(this.parentNode.id);
    });


    //当输入域失去焦点 (blur) 时改变其颜色：
    $("#create_account_name_input").blur(function(){
        var searchUsername = $("#create_account_name_input").val();
        if(searchUsername.trim() == ""){
            $("#create_account_name_input").val("");
            return;
        }

        $.get("/doFindUserByName", { username: searchUsername},
            function(data){
                var accountState = data.result;
                if(accountState == 'success'){
                    $("#create_account_create_btn").removeAttr("disabled");

                }else{
                    $("#create_account_create_btn").attr("disabled","disabled");
                    $("#create_account_error_tooltip_p").show();
                    $("#create_account_error_tooltip_span").html("账号已经存在！");
                }
        });
    });

    $("#create_account_name_input").focus(function(){
        $("#create_account_error_tooltip_p").hide();
        $("#create_account_error_tooltip_span").html("");
    });

    $("#create_account_password_input").focus(function(){
        $("#create_account_error_tooltip_p").hide();
        $("#create_account_error_tooltip_span").html("");
    });

    $("#create_account_confirm_password_input").focus(function(){
        $("#create_account_error_tooltip_p").hide();
        $("#create_account_error_tooltip_span").html("");
    });

    $("#create_account_create_btn").click(function(){
        var password = $("#create_account_password_input").val();
        var confirmPassword = $("#create_account_confirm_password_input").val();

        if(password.trim() != "" && password == confirmPassword){
            var username = $("#create_account_name_input").val();
            var hash = hex_md5(password);

            var roleValue = $("#roleRadio").find("input:radio:checked").val();
            var locationValue = 'chengdu';

            $.post("/doCreateAccount",
                {
                    username:username,
                    password:hash,
                    role:roleValue,
                    city:'chengdu'
                },
                function (data) {

                    console.log(data);

                    var trHtml = '';

                    addTr('bgUsers-tab',0,trHtml);
                    $("#create_account_dlg").modal("hide");
            });
        }else{
            $("#create_account_error_tooltip_p").show();
            $("#create_account_error_tooltip_span").html("密码不能为空，并且密码必须一致！");
        }
    });


    function addTr(tab, row, trHtml){
        //获取table最后一行 $("#tab tr:last")
        //获取table第一行 $("#tab tr").eq(0)
        //获取table倒数第二行 $("#tab tr").eq(-2)
        var $tr=$("#"+tab+" tr").eq(row);
        if($tr.size()==0){
            alert("指定的table id或行数不存在！");
            return;
        }
        $tr.after(trHtml);
    }


    function delTr(ckb){
        //获取选中的复选框，然后循环遍历删除
        var ckbs=$("input[name="+ckb+"]:checked");
        if(ckbs.size()==0){
            alert("要删除指定行，需选中要删除的行！");
            return;
        }
        ckbs.each(function(){
            $(this).parent().parent().remove();
        });
    }
});

