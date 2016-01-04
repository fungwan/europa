/**
 * Created by Administrator on 2015/11/25.
 */


$(document).ready(function(){

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
    });

    $('a[name="feedback_order"]').click(function($this){
        //alert('显示对应的订单信息' + $this.currentTarget.parentNode.id);
        $('#show_order_dlg').modal('show');
    });
});

