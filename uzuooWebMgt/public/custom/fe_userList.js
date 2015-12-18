/**
 * Created by Administrator on 2015/11/25.
 */


$(document).ready(function(){

    //tab页的切换事件响应，Ajax获取不同人员信息

    $("#houseOwner").on('click',function (e) {
        //alert('业主');
        initialHouseData(currHousePage);
    });

    $("#worker").on('click',function (e) {
        //alert('工人');
    });

    $("#business").on('click',function (e) {
        //alert('商家');
    });

    //各tab页中的分页处理
    var currpage = 1;

    //初始化页面table数据，绑定每行响应事件
    var first = false;
    function initialData(curr){
        $.get("/doFindWorkersByPage",{ page: curr},
            function(data){
                if(data.result === 'success'){
                    var pages = data.pages;
                    var contentArray = data.content;
                    if(contentArray.length === 0 && currpage > 1){
                        initialData(currpage - 1);
                        return;
                    }
                    warpHtml(contentArray);

                    laypage({
                        cont: $('#uzWorkerPage'),
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

        $("#edit_worker_table tbody").empty();
        for(x in contentArray){

            var userInfo = contentArray[x];
            var isVerified = '';
            isVerified = userInfo['verified'];
            var verifiedValue = '';
            if(isVerified === 0){
                verifiedValue = '<span class="label label-sm label-warning">' + '未审核</span>';
            }else if(isVerified === 1){
                verifiedValue = '<span class="label label-sm label-success">' + '审核通过</span>';
            }else if(isVerified === 2){
                verifiedValue = '<span class="label label-sm label-primary">' + '审核失败</span>';
            }

            var id = userInfo['id_card_no'];
            var verify_photo = userInfo['verify_photo'];
            var fullName = userInfo['fullName'];
            var username = userInfo['username'];

            var trHtml = '<tr>';
            trHtml += '<td><input type="checkbox" class="checkbox" /></td>';
            trHtml += '<td>' + username +'</td>';//用户名


            var regionsValue = userInfo['regionsValuesArray'].join(",");
            var rolesValue = userInfo['rolesValuesArray'].join(",");

            trHtml += '<td>' + fullName +'</td>';//真实姓名
            trHtml += '<td><img src=\"' + verify_photo + '\" width="35px" height="35px"></td>';
            trHtml += '<td>' + regionsValue + '</td>';
            trHtml += '<td>' + userInfo['phone'] +'</td>';//联系方式
            trHtml += '<td>' + rolesValue +'</td>';//工种
            trHtml += '<td>'+ verifiedValue + '</td>';//审核状态
            trHtml += '<td id=\'' + userInfo['workerId'] + '\' workerDetails=' + userInfo['href'] + '>';
            trHtml += '<button type="button" class="btn btn-default btn-xs"><i class="fa fa-edit"></i>&nbsp; 编辑</button>&nbsp;';
            trHtml += '</td></tr>';

            $("#edit_worker_table tbody").prepend(trHtml);//append

            //表单每行的编辑
            $(".btn-default.btn-xs").click(function(){

                $('#edit_worker_dlg').modal('show');
                var workerName = this.parentNode.parentNode.cells[2].innerText;
                var imgSrc = this.parentNode.parentNode.cells[3].children[0].currentSrc;
                var workerPhone = this.parentNode.parentNode.cells[5].innerText;

                $("#inputWorkerName").val(workerName);
                $("#inputWorkerPhone").val(workerPhone);
                $("#imghead").attr({src:imgSrc});


                // $("#accountEdit").val(this.parentNode.id);
                // $("#edit_city_div").citySelect({
                //     prov:locationArray[0],
                //     city:locationArray[1]
                // });
                // if(role !== '4'){
                //     $("#edit_roleRadio_div").html("<label> <input type='radio' name='optionsRadios' value='0' />" +
                //         "&nbsp;<span class='badge badge-default'>地推</span></label> <label> " +
                //         "<input type='radio' name='optionsRadios' value='1' />&nbsp;" +
                //         "<span class='badge badge-blue'>客服</span></label> <label> " +
                //         "<input type='radio' name='optionsRadios' value='2' />&nbsp;" +
                //         "<span class='badge badge-info'>财务</span></label> <label> " +
                //         "<input type='radio' name='optionsRadios' value='3' />&nbsp;" +
                //         "<span class='badge badge-warning'>运营</span></label>");
                // }else{
                //     $("#edit_roleRadio_div").html("<label> " +
                //         "<input id='edit_position_detail_waiter_radio' type='radio' name='optionsRadios' value='4' />&nbsp;" +
                //         "<span class='badge badge-primary'>超级管理员</span></label>");
                // }
                // $("input[name='optionsRadios'][value="+ role +"]").attr("checked",true);

            });
        }
    }

    var currHousePage = 1;
    var houseFirst = false;
    function initialHouseData(curr){
        $.get("/doFindHouseOwnersByPage",{ page: curr},
            function(data){
                if(data.result === 'success'){
                    var pages = data.pages;
                    var contentArray = data.content;
                    if(contentArray.length === 0 && currpage > 1){
                        initialData(currpage - 1);
                        return;
                    }
                    warpHouseOwnerHtml(contentArray);

                    laypage({
                        cont: $('#uzUserPage'), //容器。值支持id名、原生dom对象，jquery对象,
                        pages: pages,
                        skip: true, //是否开启跳页
                        skin: 'yahei',
                        groups: 5, //连续显示分页数
                        hash: false, //会对url追加#!laypage_
                        jump: function(obj){
                            currHousePage = obj.curr;
                            if(!houseFirst){
                                houseFirst = true;
                            }else{
                                initialHouseData(obj.curr);
                                houseFirst = false;
                            }
                        }
                    });
                }
            }
        );
    }

    function warpHouseOwnerHtml(contentArray){

        $("#edit_houseOwner_table tbody").empty();
        for(x in contentArray){

            var userInfo = contentArray[x];
            var trHtml = '<tr>';
            trHtml += '<td>' + userInfo['nick_name'] +'</td>';//昵称
            trHtml += '<td>' + userInfo['user_name'] + '</td>';
            trHtml += '<td>' + userInfo['first_name']+userInfo['last_name']+'</td>';//真实姓名
            //trHtml += '<td><img src=\"' + verify_photo + '\" width="35px" height="35px"></td>';
            trHtml += '<td>' + userInfo['phone'] +'</td>';//联系方式
            trHtml += '<td>' + userInfo['email'] +'</td>';//邮箱
            trHtml += '</tr>';

            $("#edit_houseOwner_table tbody").prepend(trHtml);//append
        }
    }

    laypage({
        cont: $('#uzBusinessPage'), //容器。值支持id名、原生dom对象，jquery对象,
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

    function verifiedWorker(idArray,isVerified){
        if(idArray.length === 0){
            return;
        }else{
            //执行post请求验证对应的用户
            $.post("/doVerifiedById",
                {
                    ids:idArray,
                    content:{
                        verified:isVerified
                    }
                },
                function (data) {
                    initialData(currHousePage);
                }
            );

        }
    }

    $("#verifiedSC-btn").click(function(){
        var userIdArray = [];
        $("#edit_worker_table tr").each(function(){
            var text = $(this).children("td:first").find('input').is(':checked');// .text();
            if(text){
                var id = $(this).children("td").eq(8).attr("id");
                userIdArray.push(id);
            }

        });

        verifiedWorker(userIdArray,1);
    });

    $("#verifiedFA-btn").click(function(){
        var userIdArray = [];
        $("#edit_worker_table tr").each(function(){
            var text = $(this).children("td:first").find('input').is(':checked');// .text();
            if(text){
                var id = $(this).children("td").eq(8).attr("id");
                userIdArray.push(id);
            }

        });

        verifiedWorker(userIdArray,2);

    });

    //工人信息表中的头像处理
    var offsetX=20-$("#table-table-tab").offset().left;
    var offsetY=70-$("#table-table-tab").offset().top;
    var size=4.2*$('#workerAvater_tbody tr td img').width();
    $("#workerAvater_tbody tr td img").mouseover(function(event) {
        var $target=$(event.target);
        if($target.is('img'))
        { $("<img id='tip' src='"+$target.attr("src")+"'>").css({
            "height":size,
            "width":size,
            "top":event.pageX+offsetX,
            "left":event.pageY+offsetY,
            "position":"absolute"
        }).appendTo($("#table-table-tab"));}
    }).mouseout(function() {
        $("#tip").remove();
    }).mousemove(function(event) {
        $("#tip").css(
            {
                "left": event.pageX + offsetX,
                "top": event.pageY + offsetY
            });
    });

    $('#input-upload').change(function() {
        previewImage(this);
    });

    //图片上传预览
    function previewImage(file)
    {
        var MAXWIDTH  = 260;
        var MAXHEIGHT = 180;
        var div = document.getElementById('preview');
        if (file.files && file.files[0])
        {
            div.innerHTML ='<img id=imghead>';
            var img = document.getElementById('imghead');
            img.onload = function(){
                var rect = clacImgZoomParam(MAXWIDTH, MAXHEIGHT, img.offsetWidth, img.offsetHeight);
                img.width  =  rect.width;
                img.height =  rect.height;
                //img.style.marginLeft = rect.left+'px';
                img.style.marginTop = rect.top+'px';
            }
            var reader = new FileReader();
            reader.onload = function(evt){img.src = evt.target.result;}
            reader.readAsDataURL(file.files[0]);
        }
        else //兼容IE
        {
            var sFilter='filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod=scale,src="';
            file.select();
            var src = document.selection.createRange().text;
            div.innerHTML = '<img id=imghead>';
            var img = document.getElementById('imghead');
            img.filters.item('DXImageTransform.Microsoft.AlphaImageLoader').src = src;
            var rect = clacImgZoomParam(MAXWIDTH, MAXHEIGHT, img.offsetWidth, img.offsetHeight);
            status =('rect:'+rect.top+','+rect.left+','+rect.width+','+rect.height);
            div.innerHTML = "<div id=divhead style='width:"+rect.width+"px;height:"+rect.height+"px;margin-top:"+rect.top+"px;"+sFilter+src+"\"'></div>";
        }
    }

    function clacImgZoomParam( maxWidth, maxHeight, width, height ){
        var param = {top:0, left:0, width:width, height:height};
        if( width>maxWidth || height>maxHeight )
        {
            rateWidth = width / maxWidth;
            rateHeight = height / maxHeight;

            if( rateWidth > rateHeight )
            {
                param.width =  maxWidth;
                param.height = Math.round(height / rateWidth);
            }else
            {
                param.width = Math.round(width / rateHeight);
                param.height = maxHeight;
            }
        }

        param.left = Math.round((maxWidth - param.width) / 2);
        param.top = Math.round((maxHeight - param.height) / 2);
        return param;
    }

    //表单每行的编辑
    $("#update_worker_btn").click(function(){
        
        var imgSrc = $("#imghead").attr("src");
        console.log(imgSrc);

        $.post("/doUpdateWorkersById",
            {
                id:'1111111',
                content:{
                    imgData:imgSrc
                }
            },
            function (data) {
                $("#edit_worker_dlg").modal("hide");
            }
        );

    });



















/*
    //These code have been abolished....
    //处理可编辑列表
    oTable = $('#edit_worker_table').dataTable({
          "paginate": false,
          "sort": false,
          "searching":false,
          "pageLength":false,
          "pagingType":false,
          "info":false
    });

    var nEditing = null;

    $('#edit_worker_table').on('click', 'a.edit', function (e) {
        e.preventDefault();
        var nRow = $(this).parents('tr')[0];
        if (nEditing !== null && nEditing != nRow) {
            rollbackRow(oTable, nEditing);
            editRow(oTable, nRow);
            nEditing = nRow;
        } else if (nEditing == nRow && this.innerHTML == "保存") {
            saveRow(oTable, nEditing);
            nEditing = null;
        } else {
            editRow(oTable, nRow);
            nEditing = nRow;
        }
    });

    function editRow(oTable, nRow) {

        //ajax get cell work info
        var aData = oTable.fnGetData(nRow);
        var rTds = $('>td', nRow);
        rTds[1].innerHTML = '<input type="text" style="width:90px" value="' + aData[1] + '">';
        rTds[2].innerHTML = '<input type="text" style="width:90px" value="' + aData[2] + '">';
        rTds[4].innerHTML = '<input type="text" style="width:60px" value="' + aData[4] + '">';
        rTds[5].innerHTML = '<input type="text" style="width:90px" value="'  + aData[5] + '">';
        rTds[6].innerHTML = '<input type="text" style="width:90px" value="'  + aData[6] + '">';

        var oldString = aData[7];
        var statusStartPos = oldString.indexOf('>');
        var statusEndPos = oldString.lastIndexOf('<');
        var statusStr = oldString.substring(statusStartPos+1,statusEndPos);

        if(statusStr === '未审核'){
            rTds[7].innerHTML = '<select><option selected>未审核</option><option>审核失败</option><option>已通过</option></select>';
        }else if(statusStr === '审核失败'){
            rTds[7].innerHTML = '<select><option>未审核</option><option selected>审核失败</option><option>已通过</option></select>';
        }else if(statusStr === '已通过'){
            rTds[7].innerHTML = '<select><option>未审核</option><option>审核失败</option><option selected>已通过</option></select>';
        }

        rTds[8].innerHTML = '<a class="edit" href="">保存</a><a class="cancel" href="">取消</a>';
    }

    function saveRow(oTable, nRow) {
        var rSelect = $('select', nRow);
        var rInputs = $('input', nRow);
        var rTds = $('>td', nRow);
        rTds[1].innerHTML = rInputs[1].value;
        rTds[2].innerHTML = rInputs[2].value;
        rTds[4].innerHTML = rInputs[3].value;
        rTds[5].innerHTML = rInputs[4].value;
        rTds[6].innerHTML = rInputs[5].value;
        if(rSelect[0].value === '未审核'){
            rTds[7].innerHTML = '<span class="label label-sm label-info">未审核</span>';
        }else if(rSelect[0].value === '审核失败'){
            rTds[7].innerHTML = '<span class="label label-sm label-primary">审核失败</span>';
        }else if(rSelect[0].value === '已通过'){
            rTds[7].innerHTML = '<span class="label label-sm label-success">已通过</span>';
        }
        rTds[8].innerHTML = '<a href="javascript:;" class="edit"><i class="fa fa-edit"></i>&nbsp; 编辑</a>&nbsp;<a href="javascript:;" class="more"><i class="fa fa-ellipsis-h"></i>&nbsp; 更多</a>';

        oTable._fnReDraw();
    }

//    $('#edit_worker_table').on('click', 'a.delete', function (e) {
//        e.preventDefault();
//        if (confirm("Are you sure to delete this row ?") == false) {
//            return;
//        }
//        var nRow = $(this).parents('tr')[0];
//        oTable.fnDeleteRow(nRow);
//    });

    $('#edit_worker_table').on('click', 'a.cancel', function (e) {
        e.preventDefault();
        if ($(this).attr("data-mode") == "new") {
            var nRow = $(this).parents('tr')[0];
            oTable.fnDeleteRow(nRow);
        } else {
            rollbackRow(oTable, nEditing);
            nEditing = null;
        }
    });

    function rollbackRow(oTable, nRow) {
        var aData = oTable.fnGetData(nRow);
        var rTds = $('>td', nRow);
        rTds[1].innerHTML = aData[1] ;
        rTds[2].innerHTML = aData[2] ;
        rTds[4].innerHTML = aData[4] ;
        rTds[5].innerHTML = aData[5] ;
        rTds[6].innerHTML = aData[6] ;
        rTds[7].innerHTML = aData[7] ;
        rTds[8].innerHTML = '<a href="javascript:;" class="edit"><i class="fa fa-edit"></i>&nbsp; 编辑</a>&nbsp;<a href="javascript:;" class="more"><i class="fa fa-ellipsis-h"></i>&nbsp; 更多</a>';
        oTable.fnDraw();
    }*/
});

