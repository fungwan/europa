/**
 * Created by Administrator on 2015/11/25.
 */


$(document).ready(function(){

    $("#create_city_div").citySelect({
        nodata:"none",
        required:false
    });

    var currpage = 1;

    //初始化页面table数据，绑定每行响应事件
    var first = false;
    function initialData(curr){
        $.get("/doFindUsersByPage",{ page: curr},
            function(data){
                if(data.result === 'success'){
                    var pages = data.pages;
                    var contentArray = data.content;
                    if(contentArray.length === 0 && currpage > 1){
                        initialData(currpage - 1);
                        return;
                    }
                    warpHtml(contentArray);

                    //表单每行的编辑
                    $(".btn-default.btn-xs").click(function(){

                        $('#edit_account_dlg').modal('show');
                        var username = this.parentNode.previousSibling.previousSibling.previousSibling.textContent;
                        var location = this.parentNode.previousSibling.textContent;
                        var locationArray = location.split(',');

                        var role = this.parentNode.abbr;
                        $("#modify_account_name_input").val(username);
                        $("#accountEdit").val(this.parentNode.id);
                        $("#edit_city_div").citySelect({
                            prov:locationArray[0],
                            city:locationArray[1]
                        });
                        if(role !== '4'){
                            $("#edit_roleRadio_div").html("<label> <input type='radio' name='optionsRadios' value='0' />" +
                                "&nbsp;<span class='badge badge-default'>地推</span></label> <label> " +
                                "<input type='radio' name='optionsRadios' value='1' />&nbsp;" +
                                "<span class='badge badge-blue'>客服</span></label> <label> " +
                                "<input type='radio' name='optionsRadios' value='2' />&nbsp;" +
                                "<span class='badge badge-info'>财务</span></label> <label> " +
                                "<input type='radio' name='optionsRadios' value='3' />&nbsp;" +
                                "<span class='badge badge-warning'>运营</span></label>");
                        }else{
                            $("#edit_roleRadio_div").html("<label> " +
                                "<input id='edit_position_detail_waiter_radio' type='radio' name='optionsRadios' value='4' />&nbsp;" +
                                "<span class='badge badge-primary'>超级管理员</span></label>");
                        }
                        $("input[name='optionsRadios'][value="+ role +"]").attr("checked",true);
                    });

                    //表单每行的删除
                    $(".btn-danger").click(function(){
                        $('#modal-confirm').find('input[type=hidden]').val(this.parentNode.id);
                        $('#modal-confirm').modal('show');//触发模态模态窗口
                    });

                    laypage({
                        cont: $('#bgUserPage'),
                        pages: pages,
                        skip: true,
                        skin: 'yahei',
                        curr: curr,//view上显示的页数是索引加1
                        groups: 5,
                        hash: false,
                        jump: function(obj){//一定要加上first的判断，否则会一直刷新
                            currpage = obj.curr;
                            if(!first){
                                first = true;
                            }else{
                                initialData(obj.curr);
                                first = false;
                            }
                        }
                    });
                }
            }
        );
    }

    initialData(1);//0表示第一页

    function warpHtml(contentArray){

        $("#bgUsers-tab tbody").empty();
        for(x in contentArray){

            var userInfo = contentArray[x];
            var role = '';
            role = userInfo['role'];
            var roleValue = '';
            if(role === '0'){
                roleValue = '地推';
            }else if(role === '1'){
                roleValue = '客服';
            }else if(role === '2'){
                roleValue = '财务';
            }else if(role === '3'){
                roleValue = '运营';
            }else if(role === '4'){
                roleValue = '超级管理员';
            }


            var trHtml = '<tr>';
            if(userInfo['username'] === 'admin'){
                trHtml += '<td></td>';
            }else{
                trHtml += '<td><input type="checkbox" class="checkbox" /></td>';
            }
            trHtml += '<td>' + userInfo['username'] +'</td>';
            trHtml += '<td>' + roleValue + '</td>';
            trHtml += '<td>' + userInfo['city'] + '</td>';
            trHtml += '<td id=\'' + userInfo['id'] +'\' abbr=' + role +'>';
            trHtml += '<button type="button" class="btn btn-default btn-xs"><i class="fa fa-edit"></i>&nbsp; 编辑</button>&nbsp;';
            if(userInfo['username'] !== 'admin') {
                trHtml += '<button type="button" class="btn btn-danger btn-xs " data-target="#modal-confirm" ><i class="fa fa-trash-o"></i>&nbsp; 删除</button>';
            }
            trHtml += '</td></tr>';

            $("#bgUsers-tab tbody").prepend(trHtml);//append
        }
    }

    function deleteUser(userIdArray){

        //执行post请求删除对应的用户
        $.post("/doDelUsersById",
            {
                ids:userIdArray
            },
            function (data) {
                initialData(currpage);
            }
        );
    }

    //单项删除
    $("#btn-del").click(function(){

        var userId = $('#modal-confirm').find('input[type=hidden]').val();

        var userIdArray = [];
        userIdArray.push(userId);

        deleteUser(userIdArray);
    });

    $("#btn-allDel-warning").click(function(){

        $('#modal-confirm-all').modal('show');
    });

    //全部删除
    $("#btn-delAll").click(function(){

        var flag = false;
        var userIdArray = [];

        //遍历表格的每行的选中状态 bgUsers-tab 误删
        $("#bgUsers-tab tr").each(function(){
            var isChecked = $(this).children("td:first").find('input').is(':checked');// .text();
            if(isChecked){
                flag = true;
                var id = $(this).children("td").eq(4).attr("id");
                userIdArray.push(id);
            }

        });

        if(!flag){
            alert('至少选择一项进行删除!');
            return;
        }

        deleteUser(userIdArray);
    });


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
            var uuidVaule = UUID.prototype.createUUID();
            var roleValue = $("#roleRadio").find("input:radio:checked").val();
            var proValue = $("#create-pro-sel  option:selected").text();
            var cityValue = $("#create-city-sel  option:selected").text();
            var locationValue = '';
            if(proValue !== '' && cityValue !== ''){
                locationValue = proValue + ',' + cityValue;
            }else{
                $("#create_account_error_tooltip_p").show();
                $("#create_account_error_tooltip_span").html("请选择城市！");
                return;
            }

            $.post("/doCreateAccount",
                {
                    username:username,
                    password:hash,
                    uuid:uuidVaule,
                    role:roleValue,
                    city:locationValue
                },
                function (data) {
                    $("#create_account_dlg").modal("hide");
                    $("#create_account_name_input").val("");
                    $("#create_account_password_input").val("");
                    $("#create_account_confirm_password_input").val("");
                    initialData(currpage);
            });
        }else{
            $("#create_account_error_tooltip_p").show();
            $("#create_account_error_tooltip_span").html("密码不能为空，并且密码必须一致！");
        }
    });

    $("#update_account_update_btn").click(function(){

        var _username = $("#modify_account_name_input").val();
        var _userId = $("#accountEdit").val();
        var roleValue = $("#edit_roleRadio_div").find("input:radio:checked").val();
        var proValue = $("#edit-pro-sel  option:selected").text();
        var cityValue = $("#edit-city-sel  option:selected").text();
        var locationValue = '';
        if(proValue !== '' && cityValue !== ''){
            locationValue = proValue + ',' + cityValue;
        }else{
            $("#modify_account_error_tooltip_p").show();
            $("#modify_account_error_tooltip_span").html("请选择城市！");
            return;
        }

        $.post("/doUpdateUserById",
            {
                id:_userId,
                content:{
                    username:_username,
                    role:roleValue,
                    city:locationValue
                }
            },
            function (data) {
                $("#create_account_dlg").modal("hide");
                $("#create_account_name_input").val("");
                $("#create_account_password_input").val("");
                $("#create_account_confirm_password_input").val("");
                initialData(currpage);
            });

        $("#edit_account_dlg").modal("hide");
    });
});


































//function addTr(tab, row, trHtml){
//    //获取table最后一行 $("#tab tr:last")
//    //获取table第一行 $("#tab tr").eq(0)
//    //获取table倒数第二行 $("#tab tr").eq(-2)
//    var $tr=$("#"+tab+" tr").eq(row);
//    if($tr.size()==0){
//        alert("指定的table id或行数不存在！");
//        return;
//    }
//    $tr.after(trHtml);
//}
//
//
//function delTr(ckb){
//    //获取选中的复选框，然后循环遍历删除
//    var ckbs=$("input[name="+ckb+"]:checked");
//    if(ckbs.size()==0){
//        alert("要删除指定行，需选中要删除的行！");
//        return;
//    }
//    ckbs.each(function(){
//        $(this).parent().parent().remove();
//    });
//}