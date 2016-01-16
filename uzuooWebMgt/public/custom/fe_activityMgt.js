/**
 * Created by Administrator on 2015/11/25.
 */
var rolesArray = [];//所有角色，包含源对象和map对象,索引0是源对象、1是封装后的map对象
var curr_edit_activityId = '';

$(document).ready(function(){

    $.getJSON("/doGetRoleAndRegionsInfo",function(data){

        if(data.result === 'fail'){
            return;
        }else{
            var regionsAndRolesArray = data.content.get_roleAndRegions;

            rolesArray = regionsAndRolesArray[1];
            console.log(rolesArray);

            $.get("/activities",
                function (data) {

                    if(data.result === 'success'){

                        var activityArray = data.content;

                        warpHtml(activityArray);

                    }

                }
            );

        }
    });

    function warpHtml(activityArray) {

        $("#activities-table tbody").empty();
        for (x in activityArray) {

            var info = activityArray[x];
            var link = info['href'];
            var pos = link.lastIndexOf('/');
            var activityId = link.substr(pos+1);
            var name = info['name'];var isEnabled = info['enabled'];
            var craft = info['craft_id'];
            var startTime = info['start_time'];
            var endTime = info['end_time'];

            var trHtml = '<tr>';
            trHtml += '<td><input type="checkbox" class="checkbox" /></td>';
            trHtml += '<td>' + name +'</td>';//活动名
            trHtml += '<td>' + isEnabled +'</td>';//启用状态
            trHtml += '<td>' + craft +'</td>';//工种细项
            trHtml += '<td>' + getConvertTime(startTime*1000) +'</td>';
            trHtml += '<td>' + getConvertTime(endTime*1000) +'</td>';
            trHtml += '<td id=\'' + activityId + '\'>';
            trHtml += '<button type="button" class="btn btn-default btn-xs mbs"><i class="fa fa-archive"></i>&nbsp; 活动详情</button>&nbsp;</td>';
            trHtml += '</tr>';

            $("#activities-table tbody").append(trHtml);
        }

        //表单每行的编辑
        $(".btn-default.btn-xs").click(function(){

            $('#show_activityDetail_dlg').modal('show');

            curr_edit_activityId = this.parentNode.id;

            //获取相应的单个工人详情
            $.get("/activities/" + curr_edit_activityId,

                function (data) {

                    if(data.result === 'fail'){
                        return;
                    }

                    var activityInfo = data.content;
                    var name = activityInfo['name'];
                    $("#activityName-span").text(name);

                    var status = activityInfo['enabled'];
                    if(status === 0){
                        $("#startActivity-btn").css({display:"block"});
                    }else{
                        $("#endActivity-btn").css({display:"block"});
                    }

                    /*var workerName = data.content['first_name'] + data.content['last_name'];
                     $("#inputWorkerFullName-readOnly").val(workerName);
                     $("#inputWorkerFirstName").val(data.content['first_name']);
                     $("#inputWorkerLastName").val(data.content['last_name']);
                     $("#workerScore").text(data.content['score']);
                     var imgHref = 'http://7xooab.com1.z0.glb.clouddn.com/' + data.content['verify_photo'];
                     $("#showVerifiedPic-img").attr({src:imgHref});
                     $("#inputCardNumber-readOnly").val(data.content['id_card_no']);
                     $("#inputCardNumber").val(data.content['id_card_no']);
                     $("#review-good-span").text(data.content['review']['good']);
                     $("#review-notBad-span").text(data.content['review']['not_bad']);
                     $("#review-bad-span").text(data.content['review']['bad']);*/
                }
            );
        });
    }
});

$("#startActivity-btn").click(function(){
    //开始活动
});

$("#endActivity-btn").click(function(){
    //结束活动
});

function getConvertTime(timeStamp){

    var myDate = new Date(timeStamp);
    var year = myDate.getFullYear();
    var month = parseInt(myDate.getMonth().toString()) + 1; //month是从0开始计数的，因此要 + 1
    if (month < 10) {
        month = "0" + month.toString();
    }
    var date = myDate.getDate();
    if (date < 10) {
        date = "0" + date.toString();
    }
    var hour = myDate.getHours();
    if (hour < 10) {
        hour = "0" + hour.toString();
    }
    var minute = myDate.getMinutes();
    if (minute < 10) {
        minute = "0" + minute.toString();
    }
    var second = myDate.getSeconds();
    if (second < 10) {
        second = "0" + second.toString();
    }

    var currentTime = year.toString() + "/" + month.toString() + "/" + date.toString() + " " + hour.toString() + ":" + minute.toString() + ":" + second.toString(); //以时间格式返回

    return currentTime;
};
