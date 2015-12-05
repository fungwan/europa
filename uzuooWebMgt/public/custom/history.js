/**
 * Created by Administrator on 2015/11/25.
 */


$(document).ready(function(){

    var currpage = 1;

    //初始化页面table数据，绑定每行响应事件
    var first = false;
    function initialData(curr){
        $.get("/doFindLogsByPage",{ page: curr},
            function(data){
                if(data.result === 'success'){
                    var pages = data.pages;
                    var contentArray = data.content;
                    if(contentArray.length === 0 && currpage > 1){
                        initialData(currpage - 1);
                        return;
                    }
                    warpHtml(contentArray);

                    //表单每行的删除
                    $(".btn-danger").click(function(){
                        $('#modal-confirm').find('input[type=hidden]').val(this.parentNode.id);
                        $('#modal-confirm').modal('show');//触发模态模态窗口
                    });

                    laypage({
                        cont: $('#logPage'),
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

    initialData(1);

    function warpHtml(contentArray){

        $("#history-tab tbody").empty();
        for(x in contentArray){

            var logsInfo = contentArray[x];

            var timeStr = logsInfo['operator_date'];
            var time = new Date(timeStr);
            var y = time.getFullYear();
            var m = time.getMonth()+1;
            var d = time.getDate();
            var h = time.getHours();
            var mm = time.getMinutes();
            var s = time.getSeconds();

            var timeShow = y+'-'+add0(m)+'-'+add0(d)+' '+add0(h)+':'+add0(mm)+':'+add0(s);

            var role = '';
            role = logsInfo['role'];
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
            trHtml += '<td><input type="checkbox" class="checkbox" /></td>';
            trHtml += '<td>' + logsInfo['username'] +'</td>';
            trHtml += '<td>' + timeShow +'</td>';
            trHtml += '<td>' + roleValue + '</td>';
            trHtml += '<td>' + logsInfo['action'] + '</td>';
            trHtml += '<td id=\'' + logsInfo['id'] +'\' abbr=' + role +'>';
            trHtml += '<button type="button" class="btn btn-danger btn-xs " data-target="#modal-confirm" ><i class="fa fa-trash-o"></i>&nbsp; 删除</button>';
            trHtml += '</td></tr>';

            $("#history-tab tbody").prepend(trHtml);//append
        }
    }

    function add0(m){return m<10?'0'+m:m };

    function deleteUser(userIdArray){

        //执行post请求删除对应的用户
        $.post("/doDelLogsById",
            {
                ids:userIdArray
            },
            function (data) {
                initialData(currpage);
            }
        );
    }

    //日志查询
    $("#search-btn").click(function(){

        if($("#startDate-input").val() === '' && $("#startDate-input").val() === ''){
            alert('请正确选择时间');
            return;
        }
        //02-12-2015
        var tmpStartArray = $("#startDate-input").val().split('-');
        var startDateStr = tmpStartArray[2] + '/' + tmpStartArray[1] + '/' + tmpStartArray[0];
        var startTimeStamp = new Date(startDateStr).getTime();
        //alert(startTimeStamp);
        var tmpEndtArray = $("#endDate-input").val().split('-');
        var endDateStr = tmpEndtArray[2] + '/' + tmpEndtArray[1] + '/' + tmpEndtArray[0];
        var endTimeStamp = new Date(endDateStr).getTime();
        //alert(endTimeStamp);

        function searchData(curr){
            $.get("/doFindLogsByDate",{
                startDate: startTimeStamp,
                endDate:endTimeStamp,
                page: curr},function(data){

                if(data.result === 'success'){

                    warpHtml(data.content);

                    laypage({
                        cont: $('#logPage'),
                        pages: data.pages,
                        skip: true,
                        skin: 'yahei',
                        curr: 1,//view上显示的页数是索引加1
                        groups: 5,
                        hash: false,
                        jump: function(obj){//一定要加上first的判断，否则会一直刷新
                            currpage = obj.curr;
                            if(!first){
                                first = true;
                            }else{
                                searchData(obj.curr);
                                first = false;
                            }
                        }
                    });
                }

            });
        }

        searchData(1);

    });

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
        $("#history-tab tr").each(function(){
            var isChecked = $(this).children("td:first").find('input').is(':checked');// .text();
            if(isChecked){
                flag = true;
                var id = $(this).children("td").eq(5).attr("id");
                userIdArray.push(id);
            }

        });

        if(!flag){
            alert('至少选择一项进行删除!');
            return;
        }

        deleteUser(userIdArray);
    });
});

