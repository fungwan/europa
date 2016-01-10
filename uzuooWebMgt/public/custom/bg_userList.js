/**
 * Created by Administrator on 2015/11/25.
 */

var regionsArray = [];//所有区域，包含源对象和map对象，索引0是源对象、1是封装后的map对象

$(document).ready(function(){

//    $("#create_city_div").citySelect({
//        nodata:"none",
//        required:false
//    });


    $.getJSON("/doGetRoleAndRegionsInfo",function(data){

        if(data.result === 'fail'){
            return;
        }else{
            var regionsAndRolesArray = data.content.get_roleAndRegions;
            regionsArray = regionsAndRolesArray[0];
            initialData(1);//表示第一页
            //初始化城市区域控件,包含所有省份组
            var originalRegions = regionsArray[0];
            for(x in originalRegions){
                $("#create_province-sel").append("<option value=\""+originalRegions[x].id+"\">"+originalRegions[x].name+"</option>");
            }
        }
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
                        var userId = this.parentNode.id;
                        var username = this.parentNode.previousSibling.previousSibling.previousSibling.textContent;
                        var role = this.parentNode.abbr;
                        $.get("/doFindUserById",{ id: userId},function(data){
                                if(data.result === 'fail'){
                                    return;
                                }

                                var userInfo = data.content;
                                $('#edit_account_dlg').modal('show');
                                $("#edit_province-sel").empty();$("#edit_city-sel").empty();
                                var cityArray = userInfo['city'].split(',');
                                var proIdStr = cityArray[0];var cityIdStr = cityArray[1];
                                var originalRegions = regionsArray[0];
                                for(x in originalRegions){
                                    if(originalRegions[x].id === proIdStr){
                                        $("#edit_province-sel").append("<option selected value="+originalRegions[x].id+">"+originalRegions[x].name+"</option>");
                                    }else{
                                        $("#edit_province-sel").append("<option value="+originalRegions[x].id+">"+originalRegions[x].name+"</option>");
                                    }
                                }

                                var citiesArray = regionsArray[1][proIdStr]['children'];
                                $("#edit_city-sel").append("<option value=\""+"\">"+"-- 请选择城市  --"+"</option>");
                                for(x in citiesArray){
                                    if(citiesArray[x].id === cityIdStr){
                                        $("#edit_city-sel").append("<option selected value="+citiesArray[x].id+">"+citiesArray[x].name+"</option>");
                                    }else{
                                        $("#edit_city-sel").append("<option value="+citiesArray[x].id+">"+citiesArray[x].name+"</option>");
                                    }
                                }

                                $("#modify_account_name_input").val(username);
                                $("#accountEdit").val(userInfo['id']);
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
                            }
                        )
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
            var cityArray = userInfo['city'].split(',');
            trHtml += '<td>' + regionsArray[1][cityArray[1]].name + '</td>';
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
            var proValue = $("#create_province-sel  option:selected").val();
            var cityValue = $("#create_city-sel  option:selected").val();
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
                    $("#create_province-sel").empty();$("#create_city-sel").empty();
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
        var proValue = $("#edit_province-sel  option:selected").val();
        var cityValue = $("#edit_city-sel  option:selected").val();
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

    $("#create_province-sel").change(function () {
        var province = $("#create_province-sel").val();
        if(province === ''){
            $("#create_city-sel").empty();
            return;
        }

        var citiesArray = regionsArray[1][province]['children'];
        $("#create_city-sel").append("<option value=\""+"\">"+"-- 请选择城市  --"+"</option>");
        for(x in citiesArray){
            $("#create_city-sel").append("<option value=" + citiesArray[x].id+ ">" + citiesArray[x].name +"</option>");
        }
    });

    $("#edit_province-sel").change(function () {
        var province = $("#edit_province-sel").val();
        if(province === ''){
            $("#edit_city-sel").empty();
            return;
        }

        var citiesArray = regionsArray[1][province]['children'];
        $("#edit_city-sel").append("<option value=\""+"\">"+"-- 请选择城市  --"+"</option>");
        for(x in citiesArray){
            $("#edit_city-sel").append("<option value="+citiesArray[x].id+">"+citiesArray[x].name+"</option>");
        }
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