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

var curr_edit_workerId = '';

$(document).ready(function(){

    //初始化页面table数据，绑定每行响应事件
    function initialData(curr){

        isShowScreeningData = false;

        $.get("/doFindWorkersByFilters",{
                page: curr,
                filters:'verified::1'
            },
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
            trHtml += '<td id=\'' + userInfo['workerId'] + '\' abbr=' + userInfo['href'] + '>';
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
                    href:workerHref
                },
                function (data) {

                    if(data.result === 'fail'){
                        return;
                    }
                    $("#inputWorkerFirstName-readOnly").val(data.content['first_name']);
                    $("#inputWorkerLastName-readOnly").val(data.content['last_name']);
                    $("#inputPhone-readOnly").val(data.content['phone']);
                    $("#inputCardNumber-readOnly").val(data.content['id_card_no']);

                    var imgHref = 'http://7xooab.com1.z0.glb.clouddn.com/' + data.content['verify_photo'];
                    $("#showVerifiedPic-img").attr({src:imgHref});
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
        verifiedWorker(userIdArray,2,'');
    });

    $("#edit-verifiedFA-btn").click(function(){
        var userIdArray = [];

        userIdArray.push(curr_edit_workerId);

        var reason = $("#verifiedFailReason-text").text();

        verifiedWorker(userIdArray,3,reason);

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
        globalFilterStr = filterStr;
        screeningWorkers(1,filterStr);
    });*/
});

