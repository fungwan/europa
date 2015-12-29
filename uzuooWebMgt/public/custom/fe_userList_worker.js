/**
 * Created by Administrator on 2015/11/25.
 */

var currpage = 1;
var screeningCurrpage=1;
var isEditWorkerData=false;//是否显示筛选后的数据页面
var globalFilterArray = ''//全局筛选条件

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

                selectCraftsHtml += '<label for=\'' + craftsArray[y]['id'] +  '\' >' + craftsArray[y]['name'] + '</label>';
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
    });

    $.getJSON("/doGetRoleAndRegionsInfo",function(data){

        if(data.result === 'fail'){
            return;
        }else{
            var regionsAndRolesArray = data.content.get_roleAndRegions;
            regionsArray = regionsAndRolesArray[0];
            rolesArray = regionsAndRolesArray[1];

            //初始化城市区域控件,包含所有省份组
            var originalRegions = regionsArray[0];
            for(x in originalRegions){
                $("#province-sel").append("<option value=\""+originalRegions[x].id+"\">"+regionsArray[1][originalRegions[x].id].name+"</option>");
            }

            //初始化角色控件,包含所有第一级工种
            var originalRoles = rolesArray[0];
            for(y in originalRoles){
                $("#roles-sel").append("<option value=\""+originalRoles[y].id+"\">"+originalRoles[y].name+"</option>");
            }

            $("#verifedStates-div").append("认证状态 : <input id=\"workerVerified-0\" value=\"0\" type=\"checkbox\" /><label >未认证</label>");
            $("#verifedStates-div").append("<input id=\"workerVerified-1\" value=\"1\" type=\"checkbox\" /><label >待认证</label>");
            $("#verifedStates-div").append("<input id=\"workerVerified-2\" value=\"2\" type=\"checkbox\" /><label >已认证</label>");
            $("#verifedStates-div").append("<input id=\"workerVerified-3\" value=\"3\" type=\"checkbox\" /><label >驳回认证</label>");

            initialData(1);//表示第一页
        }
    });


    function initialData(curr){

        globalFilterArray = ['all'];
        screeningWorkers(curr,['all']);
    }

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

            var workerDetailLink = userInfo['href'];
            var pos = workerDetailLink.lastIndexOf('/');
            var workerId = workerDetailLink.substr(pos+1);
            var identification  = userInfo['id_card_no'];
            var verify_photo = 'http://7xooab.com1.z0.glb.clouddn.com/' + userInfo['verify_photo'];
            var fullName = userInfo['first_name'] + userInfo['last_name'];
            var username = userInfo['username'];

            var originalRegionsArray = userInfo['regions'];
            var regionsStr = '';
            var cityStr = '';

            var regionsMap = regionsArray[1];
            for(x in originalRegionsArray){
                regionsStr += regionsMap[originalRegionsArray[x]]['name'] + ' ';
                cityStr = regionsMap[originalRegionsArray[x]]['parent'];
            }

            var trHtml = '<tr>';
            trHtml += '<td><input type="checkbox" class="checkbox" /></td>';
            trHtml += '<td>' + fullName +'</td>';//真实姓名
            trHtml += '<td>' + identification +'</td>';//身份证号
            trHtml += '<td>' + userInfo['phone'] +'</td>';//联系方式
            trHtml += '<td>'+ verifiedValue + '</td>';//审核状态
            trHtml += '<td>'+ cityStr + '</td>';//城市
            trHtml += '<td>' + regionsStr + '</td>';//区域

            var originalCategoryArray = userInfo['categories'];
            var rolesMap = rolesArray[1];
            if(originalCategoryArray[0] === undefined)
                trHtml += '<td></td>';
            else
                trHtml += '<td>' + rolesMap[originalCategoryArray[0]['role_id']] +'</td>';//第一工种
            if(originalCategoryArray[1] === undefined)
                trHtml += '<td></td>';
            else
                trHtml += '<td>' + rolesMap[originalCategoryArray[1]['role_id']] +'</td>';//第二工种
            trHtml += '<td id=\'' + workerId + '\' abbr=' + userInfo['href'] + '>';
            trHtml += '<button type="button" class="btn btn-default btn-xs"><i class="fa fa-angle-double-right"></i>&nbsp; 更多</button>&nbsp;';
            trHtml += '</td></tr>';

            $("#edit_worker_table tbody").prepend(trHtml);//append
        }

        //表单每行的编辑
        $(".btn-default.btn-xs").click(function(){

            $('#edit_worker_dlg').modal('show');
            $('#edit_workerDetail_tab a:first').tab('show');

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

            var workerPhone = this.parentNode.parentNode.cells[3].innerText;
            var verifiedInfo = this.parentNode.parentNode.cells[4].innerText;
            var city = this.parentNode.parentNode.cells[5].innerText + ' ' + this.parentNode.parentNode.cells[6].innerText;

            $("#inputWorkerPhone").val(workerPhone);
            $("#inputWorkerCity").val(city);
            $("#verifiedInfo-span").text(verifiedInfo);

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
                    var workerName = data.content['first_name'] + data.content['last_name'];
                    $("#inputWorkerFullName-readOnly").val(workerName);
                    $("#workerScore").text(data.content['score']);
                    var imgHref = 'http://7xooab.com1.z0.glb.clouddn.com/' + data.content['verify_photo'];
                    $("#showVerifiedPic-img").attr({src:imgHref});
                    $("#inputCardNumber-readOnly").val(data.content['id_card_no']);
                    $("#review-good-span").text(data.content['review']['good']);
                    $("#review-notBad-span").text(data.content['review']['not_bad']);
                    $("#review-bad-span").text(data.content['review']['bad']);
                }
            );
        });

        $('#edit_workerDetail_tab a[data-toggle="tab"]').on('show.bs.tab', function (e) {

            // 获取先前选项卡的名称
            //var previousTab = $(e.relatedTarget).text();

            // 获取已激活选项卡的名称
            var activeTab = $(e.target).text();
            if(activeTab === '工种信息'){
                $("#showRoles").empty();
                var showRolesHtml = '';
                for( x in workerRolesArray){
                    var id = workerRolesArray[x]['role_id'];
                    showRolesHtml += '<div class="col-md-6">';
                    showRolesHtml += '<input type="text" class="form-control" value="' + workerRolesArray[x]['role_name'] + '" disabled>';
                    showRolesHtml += '<button type="button"  onclick="editRole(' + x + ',\'' + workerRolesArray[x]['role_id'] +'\'' +')' +"\"><i class=\"fa fa-edit\"></i></button>";
                    showRolesHtml += '</div>'
                }
                $("#showRoles").append(showRolesHtml);
            }else if(activeTab === '账户信息'){
                //获取相应的单个专业版的个人账户信息
                $.get("/doGetCapitalAccountById",
                    {
                        id:curr_edit_workerId
                    }
                    ,function(data){
                        if(data.result === 'success'){
                            var workerAccountObj = data.content;
                            var balance = workerAccountObj.balance / 100;
                            var mBalance = workerAccountObj.margin_balance;
                            $("#balance-span").text(balance);//余额
                            $("#systemMarginBalance-span").text(mBalance.system / 100);
                            $("#ownMarginBalance-span").text(mBalance.owns / 100);
                        }
                    }
                )
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


    $("button[name='close-workerDetailDialog-btn']").click(function(){
        if(isEditWorkerData){
            screeningWorkers(currpage,globalFilterArray);
            isEditWorkerData = false;
        }
    });

    $("#update_workerProfile_btn").click(function(){
        isEditWorkerData = true;
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

    /*function verifiedWorker(idArray,isVerified,msg){

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
    }*/

    /*$("#verifiedSC-btn").click(function(){
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

    });*/

    function screeningWorkers(cur,filterArray){

        var firstScreeningPagination = false;
        $.get("/doFindWorkersByFilters",
            {
                page: 1,
                filters:filterArray
            },
            function(data){
                if(data.result === 'success'){
                    var pages = data.pages;
                    var contentArray = data.content;

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
                                screeningWorkers(obj.curr,filterArray);
                                firstScreeningPagination = false;
                            }
                        }
                    });
                }
            }
        );
    }

    $("#exactSearch-btn").click(function(){
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

        var arrayTmp = [];
        arrayTmp.push(filterStr);

        globalFilterArray = arrayTmp;
        screeningWorkers(1,arrayTmp);
    });

    $("#more_find_link").click(function(){
        if(this.parentNode.attributes['0']['value'] === '0'){
            this.innerHTML = '精简筛选条件<i class="fa fa-sort-asc"></i>';
            $("#more_find_div").css({"display":"block"});
            this.parentNode.attributes['0']['value'] = '1';
        }else{
            $("#more_find_div").css({"display":"none"});
            this.parentNode.attributes['0']['value'] = '0';
            this.innerHTML = '更多搜索条件<i class="fa fa-sort-desc"></i>';
        }
    });

    $("#screen-btn").click(function(){

        //获取所有的筛选条件
        var filterStr = '';

        //获取选取的城市
        var selectedCity='';
        var regionsStr = '';
        var selectObj = $('#city_sel>option:selected');
        if(selectObj.get(0) !== undefined && selectObj.get(0).value !== ''){
            selectedCity = selectObj.get(0).value;
            //TODO
            //console.log(selectedCity);

            //获取选取的区域
            var regionsFlag = false;
            $("#regions-div > input").each(function(index,$this){
                if($this.checked){
                    regionsFlag = true;
                    regionsStr += $this.id;
                    regionsStr += '|'
                }
            });

            if(regionsFlag){
                regionsStr = regionsStr.substr(0,regionsStr.length-1);
                regionsStr = 'regions::' + regionsStr;
            }
        }

        //获取选取的大工种
        var selectedRole = '';
        var craftsStr = '';
        var selectRoleObj = $('#roles-sel>option:selected');
        if(selectRoleObj.get(0).value !== ''){
            selectedRole = selectRoleObj.get(0).value;
            selectedRole = 'roles::' + selectedRole;

            //获取选取的工种细项
            craftsStr = '';
            var craftsFlag = false;
            $("#crafts-div > input").each(function(index,$this){
                if($this.checked){
                    craftsFlag = true;
                    craftsStr += $this.id;
                    craftsStr += '|'
                }
            });
            if(craftsFlag){
                craftsStr = craftsStr.substr(0,craftsStr.length-1);
                craftsStr = 'crafts::' + craftsStr;
            }
        }

        //获取选取的认证状态
        var verifiedStr = '';
        $("#verifedStates-div > input").each(function(index,$this){
            if($this.checked){
                verifiedStr += $this.value;
                verifiedStr += '|';
            }
        });
        verifiedStr = verifiedStr.substr(0,verifiedStr.length-1);
        verifiedStr = 'verified::' + verifiedStr;

        var arrayTmp = [];
        //将所有筛选条件组合
        if(selectedCity !== ''){
            //arrayTmp.push(selectedCity);
        }

        if(regionsStr !== ''){
            arrayTmp.push(regionsStr);
        }

        if(selectedRole !== ''){
            arrayTmp.push(selectedRole);
        }

        if(craftsStr !== ''){
            arrayTmp.push(craftsStr);
        }

        if(verifiedStr !== ''){
            arrayTmp.push(verifiedStr);
        }

        globalFilterArray = arrayTmp;
        console.log(globalFilterArray);
        screeningWorkers(1,arrayTmp);
    });

    $("#verified-sel").change(function () {
        var selectObj = $('#verified-sel>option:selected');
        var selected = selectObj.get(0).value;
        var filterStr = '';
        if(selected === 'all'){
            filterStr = 'all';
        }else{
            filterStr = 'verified::' + selected;
        }
        var arrayTmp = [];
        arrayTmp.push(filterStr);

        globalFilterArray = arrayTmp;
        screeningWorkers(1,arrayTmp);
    });

    $("#province-sel").change(function () {
        var province = $("#province-sel").val();
        if(province === ''){
            $("#city_sel").empty();
            $("#regions-div").empty();
            return;
        }

        var citiesArray = regionsArray[1][province]['children'];
        $("#city_sel").append("<option value=\""+"\">"+"-- 请选择城市  --"+"</option>");
        for(x in citiesArray){
            $("#city_sel").append("<option value=\""+citiesArray[x].id+"\">"+citiesArray[x].name+"</option>");
        }
    });

    $("#city_sel").change(function () {
        var cities = $("#city_sel").val();
        if(cities === ''){
            $("#regions-div").empty();
            return;
        }
        var regionsMapTmp = regionsArray[1];
        var reObj = regionsMapTmp[cities];
        var reArray = reObj['children'];

        var regionsHtml = '';
        for(x in reArray){
            var rId = reArray[x]['id'];
            var rName = reArray[x]['name'];
            regionsHtml += '<input id=\'' + rId +  '\' type="checkbox" />'
            regionsHtml += '<label for=\'' + rId +  '\' >' + rName+ '</label>';
        }

        $("#regions-div").append(regionsHtml);
    });

    $("#roles-sel").change(function () {
        var rolesId = $("#roles-sel").val();
        if(rolesId === ''){
            $("#crafts-div").empty();
            return;
        }

        var craftsHtml = '细项：';
        var originalRoles = rolesArray[0];
        for(index in originalRoles){
            if(originalRoles[index].id === rolesId){
                var crafties = originalRoles[index].crafts;
                for(z in crafties){
                    var cId = crafties[z]['id'];
                    var cName = crafties[z]['name'];
                    craftsHtml += '<input id=\'' + cId +  '\' type="checkbox" />'
                    craftsHtml += '<label for=\'' + cId +  '\' >' + cName+ '</label>';
                }

                break;
            }
        }

        $("#crafts-div").append(craftsHtml);
    });
});

