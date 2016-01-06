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

    /*$.get("/doGetFeedbacks",
        function (data) {

            if(data.result === 'success'){

                var feedbackArray = data.content;

                warpHtml(feedbackArray);

            }

        }
    );*/

    function warpHtml(feedbackArray) {

        $("#feedbacks-table tbody").empty();
        for (x in feedbackArray) {

            var feedbackInfo = feedbackArray[x];
            var feedbackType = feedbackInfo['type'];
            var feedbackById = feedbackInfo['account_id'];
            var feedbackContent = feedbackInfo['content'];//OrderId or texts of advice
            var feedbackTime = feedbackInfo['create_time'];

            var trHtml = '<tr>';
            trHtml += '<td><input type="checkbox" class="checkbox" /></td>';
            trHtml += '<td>' + feedbackTime +'</td>';//反馈时间
            if(feedbackType === 0){
                trHtml += '<td id=\'' + feedbackContent + '\'>';
                trHtml += '<a name=\"feedback_order\" href=\"javacript:void(0);\">' + '该订单无法联系到业主</a></td>';
            }else if(feedbackType === 1){
                trHtml += '<td>' + feedbackContent +'</td>';//该td显示反馈信息
            }

            trHtml += '<td id=\'' + feedbackById + '\'>';
            trHtml += '<a name=\"feedback_account\" href=\"javacript:void(0);\">' + feedbackById + '</a></td>';
            trHtml += '</tr>';
        }
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


    $('a[name="feedback_account"]').click(function($this){

        $('#show_account_dlg').modal('show');

        //alert('显示对应的账号信息' + $this.currentTarget.parentNode.id);

        $.get("/doFindWorkerById",
            {
                id:'20b3dd1c-5b2d-4de4-ba1b-356053726e27'
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

        //alert('显示对应的订单信息' + $this.currentTarget.parentNode.id);

        $.get("/doGetOrderById",{id:'20a43c70-5446-4dad-8943-3b9770066609'},
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

});

