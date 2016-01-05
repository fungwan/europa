/**
 * Created by Administrator on 2015/11/25.
 */

var currpage = 1;
var firstPagination = false;
var popImg = '';//弹出图片
var isEditWorkerData = false;
var curr_edit_workerId = '';

$(document).ready(function(){

    //初始化页面table数据，绑定每行响应事件
    function initialData(curr){

        isShowScreeningData = false;

        $.get("/doFindWorkersByFilters",{
                page: curr,
                filters:['verified::1']
            },
            function(data){
                if(data.result === 'success'){
                    var pages = data.pages;
                    var contentArray = data.content;
                    //rolesArray = data.additionalData[1];

                    if(contentArray.length === 0 && currpage > 1){
                        initialData(currpage - 1);
                        return;
                    }
                    warpHtml(contentArray);

                    laypage({
                        cont: $('#todoVerifiedWorkerPage'),
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

        $("#todoVerifiedWorker-tab tbody").empty();
        for(x in contentArray){

            var userInfo = contentArray[x];
            var workerDetailLink = userInfo['href'];
            var pos = workerDetailLink.lastIndexOf('/');
            var workerId = workerDetailLink.substr(pos+1);
            var identification  = userInfo['id_card_no'];
            var verify_photo = 'http://7xooab.com1.z0.glb.clouddn.com/' + userInfo['verify_photo'];
            var fullName = userInfo['first_name'] + userInfo['last_name'];
            var username = userInfo['username'];
            var trHtml = '<tr>';
            trHtml += '<td><input type="checkbox" class="checkbox" /></td>';
            trHtml += '<td>' + fullName +'</td>';//真实姓名
            trHtml += '<td>' + identification +'</td>';//身份证号
            trHtml += '<td>' + userInfo['phone'] +'</td>';//联系方式
            trHtml += '<td id=\'' + workerId + '\' abbr=' + userInfo['href'] + '>';
            trHtml += '<button type="button" class="btn btn-default btn-xs"><i class="fa fa-angle-double-right"></i>&nbsp; 点击认证</button>&nbsp;';
            trHtml += '</td></tr>';

            $("#todoVerifiedWorker-tab tbody").prepend(trHtml);//append
        }

        //表单每行的编辑
        $(".btn-default.btn-xs").click(function(){

            curr_edit_workerId = this.parentNode.id;
            $('#verified_worker_dlg').modal('show');
            var workerHref = this.parentNode.abbr;
            //获取相应的单个工人详情
            $.get("/doFindWorkerById",
                {
                    id:curr_edit_workerId
                },
                function (data) {

                    if(data.result === 'fail'){
                        return;
                    }
                    var imgHref = 'http://7xooab.com1.z0.glb.clouddn.com/' + data.content['verify_photo'];

                    popImg = "<img width='554' height='344' src=\'" + imgHref + '\'/>';

                    $("#showVerifiedPic-img").attr({src:imgHref});
                    $("#inputWorkerFirstName-readOnly").val(data.content['first_name']);
                    $("#inputWorkerLastName-readOnly").val(data.content['last_name']);
                    $("#inputPhone-readOnly").val(data.content['phone']);
                    $("#inputCardNumber-readOnly").val(data.content['id_card_no']);
                }
            );
        });
    }

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

    $("#edit-verifiedSC-btn").click(function(){
        var userIdArray = [];

        userIdArray.push(curr_edit_workerId);

        var msg = '恭喜您已通过悠住认证，请登录app查看和抢单.';

        verifiedWorker(userIdArray,2,msg);
        isEditWorkerData = true;

        $("#verified_worker_dlg").modal("hide");
    });

    $("#edit-verifiedFA-btn").click(function(){
        var userIdArray = [];

        userIdArray.push(curr_edit_workerId);

        var reason = $("#verifiedFailReason-text").val();

        verifiedWorker(userIdArray,3,reason);

        isEditWorkerData = true;

        $("#verified_worker_dlg").modal("hide");

    });

    $("#zoomVerifiedImg").click(function(){
        TINY.box.show(popImg,0,0,0,1)
    });

    $("button[name='close-todoVerifiedDialog-btn']").click(function(){
        if(isEditWorkerData){
            initialData(currpage);
            isEditWorkerData = false;
        }
    });

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
        globalFilterArray = filterStr;
        screeningWorkers(1,filterStr);
    });*/
});



