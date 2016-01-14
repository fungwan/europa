/**
 * Created by Administrator on 2015/11/25.
 */

var regionsArray = [];//所有区域，包含源对象和map对象，索引0是源对象、1是封装后的map对象
var rolesArray = [];//所有角色，包含源对象和map对象,索引0是源对象、1是封装后的map对象

$(document).ready(function(){

    $.getJSON("/doGetRoleAndRegionsInfo",function(data){


        if(data.result === 'fail'){
            return;
        }else{
            var regionsAndRolesArray = data.content.get_roleAndRegions;
            regionsArray = regionsAndRolesArray[0];
            rolesArray = regionsAndRolesArray[1];

            initialData(1);//表示第一页
        }
    });

    function initialData(curr){

        screeningBills(curr,['all']);
    }

    function screeningBills(cur,filterArray){

        $.get("/bills",
            {
                page: cur,
                filters:filterArray},
            function (data) {

                if(data.result === 'fail'){
                    return;
                }

                var tradeDetailArray = data.content;

                warpHtml(tradeDetailArray);

                laypage({
                 cont: $('#billsPage'),
                 pages: cur,
                 skip: true,
                 skin: 'yahei',
                 curr: 1,//view上显示的页数是索引加1
                 groups: 5,
                 hash: false,
                 jump: function(obj){//一定要加上first的判断，否则会一直刷新

                 }
                 });

            }
        );
    }
    function warpHtml(tradeDetailArray) {

        $("#tradeDetails-table tbody").empty();
        for (x in tradeDetailArray) {

            var tradeInfo = tradeDetailArray[x];
            var trHtml = '<tr>';
            trHtml += '<td><input type="checkbox" class="checkbox" /></td>';
            //trHtml += '<td>' + getConvertTime(feedbackTime) +'</td>';
            trHtml += '<td>' +tradeInfo['create_time'] +'</td>';//创建时间
            trHtml += '<td>' +tradeInfo['city'] +'</td>';
            trHtml += '<td>' +tradeInfo['contract_item_no'] +'</td>';
            trHtml += '<td>' +tradeInfo['order_no'] +'</td>';
            trHtml += '<td>' +tradeInfo['amount'] +'</td>';
            trHtml += '<td>' +tradeInfo['source'][0].Capital_account_id +'</td>';//为什么source和target里面是个数组呢？
            trHtml += '<td>' +tradeInfo['actual_pay'] +'</td>';
            trHtml += '<td>' +tradeInfo['type'] +'</td>';
            trHtml += '<td>' +tradeInfo['detail'] +'</td>';
            trHtml += '<td>' +tradeInfo['target'][0].Capital_account_id +'</td>';
            trHtml += '<td>' +tradeInfo['arrival_amount'] +'</td>';
            var detailLink = tradeInfo['href'];
            var pos = detailLink.lastIndexOf('/');
            var tradeId = detailLink.substr(pos+1);

            trHtml += '<td id=\'' + tradeId + '\'>';
            if(tradeInfo['status'] === 0){
                trHtml += '<button type="button" name="pendingBill-btn" class="btn btn-info btn-xs"><i class="fa fa-circle-o"></i>&nbsp; 待审核</button>&nbsp;';
            }else if(tradeInfo['status'] === 1){
                trHtml += '<button type="button" name="reviewBill-btn" class="btn btn-warning btn-xs"><i class="fa fa-check-circle-o"></i>&nbsp; 待复核</button>&nbsp;';
            }else{
                trHtml += '<span class="label label-sm label-success">已到账</span>';
            };
            trHtml += '</td></tr>';

            $("#tradeDetails-table tbody").append(trHtml);
        }

        //提交审核动作
        $('button[name="pendingBill-btn"]').click(function(){
            console.log(this.parentNode.id);
            var tradeId = this.parentNode.id;
            tradeId = 'dsadas';
            $.ajax({
                type: "POST",
                url: "/bills/" + tradeId +"/billStatus",
                data: "id="+ tradeId,
                success: function(msg){
                    //refresh curr page
                },
                error:function(err){
                    alert('账单审核失败！');
                    return;
                }
            });
        });

        //提交复核动作
        $('button[name="reviewBill-btn"]').click(function(){
            console.log(this.parentNode.id);
            var tradeId = this.parentNode.id;

            $.ajax({
                type: "PUT",
                url: "/bills/" + tradeId +"/billStatus",
                data: "id="+ tradeId,
                success: function(msg){
                    //refresh curr page
                },
                error:function(err){
                    alert('账单复核失败！');
                    return;
                }
            });
        });

    }
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
