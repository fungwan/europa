/**
 * Created by Administrator on 2015/11/25.
 */

var currpage = 1;
var screeningCurrpage=1;
var isShowScreeningData=false;//是否显示筛选后的数据页面
var globalFilterStr = ''//全局筛选条件
var firstPagination = false;
var firstScreeningPagination = false;

var regionsArray = [];//所有区域，包含源对象和map对象，索引0是源对象、1是封装后的map对象
var rolesArray = [];//所有角色，包含源对象和map对象,索引0是源对象、1是封装后的map对象
var workerRolesArray = [];//当前选取的工人角色
var curr_edit_workerId = '';

function editRole(index,roleId){

    $("#showAllRoles ").empty();

    var firstItemArray = rolesArray[0];
    var selectRolesHtml = '<div class="col-md-12"><select id="select-role" class="form-control">';
    var selectCraftsHtml = '<div id="editCraftsItem">';
    for(x in firstItemArray){

        var rId = firstItemArray[x]['id'];
        if(rId === roleId){
            selectRolesHtml += '<option value=\'' + rId + '\' selected >' + rolesArray[1][rId] + '</option>';

            var craftsArray = firstItemArray[x]['crafts'];

            //console.log(workerRolesArray[index]);

            var selectedCIdArray = workerRolesArray[index]['crafts'];
            for(y in craftsArray){
                var cId = craftsArray[y]['id'];
                if(selectedCIdArray.indexOf(cId) === -1){
                    selectCraftsHtml += '<input id=\'' + craftsArray[y]['id'] +  '\' type="checkbox" />'
                }else{
                    selectCraftsHtml += '<input id=\'' + craftsArray[y]['id'] +  '\' type="checkbox" checked/>'
                }

                selectCraftsHtml += '<label for=\'' + craftsArray[y]['id'] +  '\' >' + rolesArray[1][cId] + '</label>';
            }

            selectCraftsHtml += '</div></div>';

        }else{
            selectRolesHtml += '<option value=\'' + rId + '\'>' + rolesArray[1][rId] + '</option>';
        }
    }
    selectRolesHtml += '</select>';

    $("#showAllRoles").append(selectRolesHtml);
    $("#showAllRoles").append(selectCraftsHtml);

    var confirmOperatorHtml = '<div id="confirmEditRole-btn"><button id="cancelChangeRole-btn" class="btn btn-primary">取消</button>';
    confirmOperatorHtml += '<button id="updateRole-btn" class="btn btn-success">确定</button></div>';
    $("#showAllRoles").append(confirmOperatorHtml);


    $("#updateRole-btn").click(function () {

        //遍历id为editCraftsItem的div下的类型为checkbox的input
        var craftsTmpArray = [];

        $("#editCraftsItem > input").each(function(index,$this){
            if($this.checked){
                craftsTmpArray.push($this.id);
            }
        });

        if(craftsTmpArray.length === 0){
            alert('请至少选择1个细项！');
            return;
        }
        //判断id为select-role的select元素哪一个被选中
        var selectObj = $('#select-role>option:selected');
        var selected = selectObj.get(0).value;

        var tmpRoleObj = {};
        tmpRoleObj['role_id'] = selected;
        tmpRoleObj['crafts'] = craftsTmpArray;

        workerRolesArray[index] = tmpRoleObj;

        //id为showRoles的divUI改变
        $("#showRoles").empty();
        var showRolesHtml = '';
        for( x in workerRolesArray){
            var id = workerRolesArray[x]['role_id'];
            showRolesHtml += '<div class="col-md-6">';
            showRolesHtml += '<input type="text" class="form-control" value="' + rolesArray[1][id] + '" disabled>';
            showRolesHtml += '<button type="button"  onclick="editRole(' + x + ',\'' + workerRolesArray[x]['role_id'] +'\'' +')' +"\"><i class=\"fa fa-edit\"></i></button>";
            showRolesHtml += '</div>'
        }
        $("#showRoles").append(showRolesHtml);

        //发送更新操作至服务器
        $.post("/doChangeWorkerRole",
            {
                accountId:curr_edit_workerId,
                content:workerRolesArray
            },
            function (data) {
                console.log(data);
            }
        );

        $("#showAllRoles ").empty();
    });

    $("#cancelChangeRole-btn").click(function () {
        $("#showAllRoles ").empty();
    });

    $("#select-role").change(function () {

        $("#editCraftsItem ").empty();

        var roleId = $("#select-role").val();
        var selectCraftsHtml = '';

        for(x in firstItemArray){
            if(firstItemArray[x]['id'] === roleId){

                var craftsArray = firstItemArray[x]['crafts'];

                for(y in craftsArray){
                    var cId = craftsArray[y]['id'];
                    selectCraftsHtml += '<input id=\'' + cId +  '\' type="checkbox" />'
                    selectCraftsHtml += '<label for=\'' + cId +  '\' >' + rolesArray[1][cId] + '</label>';
                }

                selectCraftsHtml += '</div></div>';

            }
        }

        $("#editCraftsItem").append(selectCraftsHtml);

    });

}

$(document).ready(function(){

    $("#worker").on('click',function (e) {
        //alert('工人');
    });

    //初始化页面table数据，绑定每行响应事件
    function initialData(curr){

        isShowScreeningData = false;

        $.get("/doFindWorkersByPage",{ page: curr},
            function(data){
                if(data.result === 'success'){
                    var pages = data.pages;
                    var contentArray = data.content;
                    rolesArray = data.additionalData[1];

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
                            if(!firstPagination){
                                firstPagination = true;
                            }else{
                                initialData(obj.curr);
                                firstPagination = false;
                            }
                        }
                    });
                }
            }
        );
    }
    initialData(1);//表示第一页

    function warpHtml(contentArray){

        $("#edit_worker_table tbody").empty();
        for(x in contentArray){

            var userInfo = contentArray[x];
            var isVerified = '';
            isVerified = userInfo['verified'];
            var verifiedValue = '';
            if(isVerified === 0){
                verifiedValue = '<span class="label label-sm label-warning">' + '未认证</span>';
            }else if(isVerified === 1){
                verifiedValue = '<span class="label label-sm label-dark">' + '待认证</span>';
            }else if(isVerified === 2){
                verifiedValue = '<span class="label label-sm label-success">' + '已认证</span>';
            }else if(isVerified === 3){
                verifiedValue = '<span class="label label-sm label-primary">' + '认证驳回</span>';
            }


            var identification  = userInfo['id_card_no'];
            var verify_photo = 'http://7xooab.com1.z0.glb.clouddn.com/' + userInfo['verify_photo'];
            var fullName = userInfo['first_name'] + userInfo['last_name'];
            var username = userInfo['username'];
            var regionsValue = userInfo['regionsValuesArray'].join(",");
            var rolesArray = userInfo['rolesValuesArray'];//.join(",");

            var trHtml = '<tr>';
            trHtml += '<td><input type="checkbox" class="checkbox" /></td>';
            trHtml += '<td>' + fullName +'</td>';//真实姓名
            trHtml += '<td>' + identification +'</td>';//身份证号
            trHtml += '<td>' + userInfo['phone'] +'</td>';//联系方式
            trHtml += '<td>'+ verifiedValue + '</td>';//审核状态
            trHtml += '<td>'+ userInfo['city'] + '</td>';//城市
            //trHtml += '<td><img src=\"' + verify_photo + '\" width="35px" height="35px"></td>';
            trHtml += '<td>' + regionsValue + '</td>';//区域
            if(rolesArray[0] === undefined)
                trHtml += '<td></td>';
            else
                trHtml += '<td>' + rolesArray[0] +'</td>';//第一工种
            if(rolesArray[1] === undefined)
                trHtml += '<td></td>';
            else
                trHtml += '<td>' + rolesArray[1] +'</td>';//第二工种
            trHtml += '<td id=\'' + userInfo['workerId'] + '\' abbr=' + userInfo['href'] + '>';
            trHtml += '<button type="button" class="btn btn-default btn-xs"><i class="fa fa-angle-double-right"></i>&nbsp; 更多</button>&nbsp;';
            trHtml += '</td></tr>';

            $("#edit_worker_table tbody").prepend(trHtml);//append
        }

        //表单每行的编辑
        $(".btn-default.btn-xs").click(function(){

            $('#edit_worker_dlg').modal('show');
            $('#edit_workerDetail_tab a:first').tab('show');
            var verifiedInfo = this.parentNode.parentNode.cells[4].innerText;
            $("#verifiedInfo-span").text(verifiedInfo);
            curr_edit_workerId = this.parentNode.id;
            var workerHref = this.parentNode.abbr;
            /*var isShowBasicInfo = false;
            if(verifiedInfo.indexOf('已经认证') !== -1){
                isShowBasicInfo = true;
            }*/

            //根据个人的验证情况,进入相应的tab页面
            /*if(isShowBasicInfo){

                $('#edit_workerDetail_tab a:first').tab('show');


            }else{
                $('#edit_workerDetail_tab a:last').tab('show');//$('#myTab li:eq(2) a').tab('show')
                //$("#edit_worker_basicInfo").parent().attr("disabled",true);
            }*/

            var workerName = this.parentNode.parentNode.cells[1].innerText;
            var workerPhone = this.parentNode.parentNode.cells[3].innerText;

            $("#inputWorkerFullName-readOnly").val(workerName);
            $("#inputWorkerPhone").val(workerPhone);

            //获取相应的单个工人详情
            $.get("/doFindWorkerById",
                {
                    href:workerHref
                },
                function (data) {

                    if(data.result === 'fail'){
                        return;
                    }
                    workerRolesArray = data.content['category'];
                    $("#workerScore").text(data.content['score']);
                    var imgHref = 'http://7xooab.com1.z0.glb.clouddn.com/' + data.content['verify_photo'];
                    $("#showVerifiedPic-img").attr({src:imgHref});
                    $("#inputCardNumber-readOnly").val(data.content['id_card_no']);
                    $("#review-good-span").text(data.content['review']['good']);
                    $("#review-notBad-span").text(data.content['review']['not_bad']);
                    $("#review-bad-span").text(data.content['review']['bad']);
                    $("#inputWorkerCity").val(userInfo['city'] +' '+userInfo['regionsValuesArray'].join(","));
                }
            );
        });

        $('#edit_workerDetail_tab a[data-toggle="tab"]').on('show.bs.tab', function (e) {

            // 获取先前选项卡的名称
            var previousTab = $(e.relatedTarget).text();

            // 获取已激活选项卡的名称
            var activeTab = $(e.target).text();
            if(activeTab === '工种信息'){
                $("#showRoles").empty();
                var showRolesHtml = '';
                for( x in workerRolesArray){
                    var id = workerRolesArray[x]['role_id'];
//                    if(workerRolesArray[x]['role_name'] !== undefined){
//                        delete workerRolesArray[x]['role_name'];
//                    }
                    showRolesHtml += '<div class="col-md-6">';
                    showRolesHtml += '<input type="text" class="form-control" value="' + workerRolesArray[x]['role_name'] + '" disabled>';
                    showRolesHtml += '<button type="button"  onclick="editRole(' + x + ',\'' + workerRolesArray[x]['role_id'] +'\'' +')' +"\"><i class=\"fa fa-edit\"></i></button>";
                    showRolesHtml += '</div>'
                }
                $("#showRoles").append(showRolesHtml);
            }
        });

        $("#edit-verifiedSC-btn").click(function(){
            var userIdArray = [];
            userIdArray.push(curr_edit_workerId);
            updateVerifiedInfo(userIdArray,2);
        });

        $("#edit-verifiedFA-btn").click(function(){

            var userIdArray = [];
            userIdArray.push(curr_edit_workerId);
            updateVerifiedInfo(userIdArray,3);
        });

        function updateVerifiedInfo(idArray,isVerified){

            console.log(typeof isVerified);
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
                        console.log(data);
                    }
                );

            }
        }

//        $('#edit_workerDetail_tab a').click(function (e) {
//
//            e.preventDefault();
//            $(this).tab('show');
//            console.log(curr_edit_workerId);
//
//        });

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
    }


    /*$("button[name='close-workerDetailDialog-btn']").click(function(){
        if(!isShowScreeningData){
            initialData(currpage);
        }else{
            screeningWorkers(currpage,globalFilterStr);
        }
    });*/

    $("#update_workerProfile_btn").click(function(){

        var imgSrc = $("#imghead").attr("src");
        console.log(imgSrc);

        $.post("/doUpdateWorkerProfileById",
            {
                id:curr_edit_workerId,
                content:{
                    first_name:$("#inputWorkerFirstName").val(),
                    last_name:$("#inputWorkerLastName").val(),
                    id_card_no:$("#inputCardNumber").val(),
                    //phone:$("#inputWorkerPhone").val(),
                    verify_photo:imgSrc
                }
            },
            function (data) {
                //$("#edit_worker_dlg").modal("hide");
                console.log(data);
            }
        );

    });

    function verifiedWorker(idArray,isVerified,msg){

        console.log(typeof isVerified);
        if(idArray.length === 0){
            return;
        }else{
            //执行post请求验证对应的用户
            $.post("/doVerifiedById",
                {
                    ids:idArray,
                    content:{
                        verified:isVerified,
                        reason:msg
                    }
                },
                function (data) {
                    //console.log(data);
                    initialData(currpage);
                }
            );

        }
    }

    $("#verifiedSC-btn").click(function(){
        var userIdArray = [];
        $("#edit_worker_table tr").each(function(){
            var text = $(this).children("td:first").find('input').is(':checked');// .text();
            if(text){
                var id = $(this).children("td").eq(9).attr("id");
                userIdArray.push(id);
            }

        });

        verifiedWorker(userIdArray,2,'');
    });

    $("#verifiedFA-btn").click(function(){
        var userIdArray = [];
        $("#edit_worker_table tr").each(function(){
            var text = $(this).children("td:first").find('input').is(':checked');// .text();
            if(text){
                var id = $(this).children("td").eq(9).attr("id");
                userIdArray.push(id);
            }

        });

        verifiedWorker(userIdArray,3,'看不清楚身份证号码...');

    });

    function screeningWorkers(cur,filterStr){

        isShowScreeningData = true;

        $.get("/doFindWorkersByFilters",
            {
                page: 1,
                filters:filterStr
            },
            function(data){
                if(data.result === 'success'){
                    var pages = data.pages;
                    var contentArray = data.content;
                    rolesArray = data.additionalData[1];

                    if(contentArray.length === 0 && screeningCurrpage > 1){
                        screeningWorkers(screeningCurrpage - 1);
                        return;
                    }
                    warpHtml(contentArray);

                    laypage({
                        cont: $('#uzWorkerPage'),
                        pages: pages,
                        skip: true,
                        skin: 'yahei',
                        curr: cur,//view上显示的页数是索引加1
                        groups: 5,
                        hash: false,
                        jump: function(obj){//一定要加上first的判断，否则会一直刷新
                            screeningCurrpage = obj.curr;
                            if(!firstScreeningPagination){
                                firstScreeningPagination = true;
                            }else{
                                screeningWorkers(obj.curr,filterStr);
                                firstScreeningPagination = false;
                            }
                        }
                    });
                }
            }
        );
    }

    /*$("#exactSearch-btn").click(function(){
        var selectObj = $('#keyWord-sel>option:selected');
        var selected = selectObj.get(0).value;
        var keyWords = $('#exactSearch-input').val();
        var filterStr = '';

        if(selected === 'phone'){
            filterStr = 'phone::' + keyWords;
        }else if(selected === 'id_card_no'){
            filterStr = 'id_card_no::' + keyWords;
        }else if(selected === 'name'){
            filterStr = 'name::' + keyWords;
        }
        globalFilterStr = filterStr;
        screeningWorkers(1,filterStr);
    });*/

    $("#verified-sel").change(function () {
        var selectObj = $('#verified-sel>option:selected');
        var selected = selectObj.get(0).value;
        var filterStr = '';
        if(selected === 'all'){
            filterStr = 'all';
        }else{
            filterStr = 'verified::' + selected;
        }
        globalFilterStr = filterStr;
        screeningWorkers(1,filterStr);
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

