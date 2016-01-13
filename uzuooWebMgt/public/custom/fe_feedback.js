/**
 * Created by Administrator on 2015/11/25.
 */


$(document).ready(function(){

    $.getJSON("/doGetRoleAndRegionsInfo",function(data){

        if(data.result === 'fail'){
            return;
        }else{
            var regionsAndRolesArray = data.content.get_roleAndRegions;

            //console.log(regionsAndRolesArray);
        }
    });

    $.get("/doGetFeedbacks",
        function (data) {

            if(data.result === 'success'){

                var feedbackArray = data.content;

                warpHtml(feedbackArray);

            }

        }
    );

    function warpHtml(feedbackArray) {

        $("#feedbacks-table tbody").empty();
        for (x in feedbackArray) {

            var feedbackInfo = feedbackArray[x];
            var feedbackType = feedbackInfo['type'];
            var feedbackById = feedbackInfo['account_id'];
            var feedbackContent = feedbackInfo['content'];//OrderId or texts of advice
            var feedbackTime = feedbackInfo['create_time'] * 1000;

            var trHtml = '<tr>';
            trHtml += '<td><input type="checkbox" class="checkbox" /></td>';
            trHtml += '<td>' + getConvertTime(feedbackTime) +'</td>';//反馈时间
            if(feedbackType === 0){
                trHtml += '<td id=\'' + feedbackContent + '\'>';
                trHtml += '<a name=\"feedback_order\" href=\"javacript:void(0);\">' + '该订单无法联系到业主</a></td>';
            }else if(feedbackType === 1){
                trHtml += '<td>' + feedbackContent +'</td>';//该td显示反馈信息
            }else{
                trHtml += '<td>' + feedbackContent +'</td>';//该td显示反馈信息
            }

            trHtml += '<td id=\'' + feedbackById + '\'>';
            trHtml += '<a name=\"feedback_account\" href=\"javacript:void(0);\">' + feedbackById + '</a></td>';
            trHtml += '</tr>';

            $("#feedbacks-table tbody").append(trHtml);
        }

        $('a[name="feedback_account"]').click(function($this){

            $('#show_account_dlg').modal('show');

            $.get("/doFindWorkerById",
                {
                    id:$this.currentTarget.parentNode.id
                },
                function (data) {

                    if(data.result === 'fail'){
                        return;
                    }

                    $("#inputWorkerFullName-readOnly").val(data.content['first_name'] + data.content['last_name']);
                    $("#inputWorkerPhone-readOnly").val(data.content['phone']);
                    $("#inputCardNumber-readOnly").val(data.content['id_card_no']);

                    $('#show_account_dlg').modal('show');

                }
            );

        });

        $('a[name="feedback_order"]').click(function($this){

            $.get("/orders/" + $this.currentTarget.parentNode.id,
                function (data) {

                    if(data.result === 'success'){

                        var houseInfo = data.content['house_info'];
                        $("#houseOwnerAddress").val(houseInfo['address']);
                        $("#houseAcreage").val(houseInfo['type'] + ' ' + houseInfo['acreage'] + '平');

                        var houseOwnerId = data.content['account_id'];

                        $.get("/doFindHouseOwnersById",{id:houseOwnerId},
                            function(data2){

                                if(data2.result === 'success'){

                                    console.log(data2.content);

                                    $("#houseOwnerNickName").val(data2.content['nick_name']);
                                    $("#houseOwnerUserName").val(data2.content['first_name'] + data2.content['last_name']);
                                    $("#houseOwnerPhone").val(data2.content['phone']);
                                }
                            }
                        );

                        $('#show_order_dlg').modal('show');
                    }

                }
            );

        });
    }

    /*laypage({
        cont: $('#feedbackPage'),
        pages: 10,
        skip: true,
        skin: 'yahei',
        curr: 1,//view上显示的页数是索引加1
        groups: 5,
        hash: false,
        jump: function(obj){//一定要加上first的判断，否则会一直刷新

        }
    });*/

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
