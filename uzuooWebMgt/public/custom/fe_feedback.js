/**
 * Created by Administrator on 2015/11/25.
 */


$(document).ready(function(){

    $.getJSON("/doGetRoleAndRegionsInfo",function(data){

        if(data.result === 'fail'){
            return;
        }else{
            var regionsAndRolesArray = data.content.get_roleAndRegions;

            console.log(regionsAndRolesArray);
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

                console.log(data.content);
                $('#show_account_dlg').modal('show');
                /*var imgHref = 'http://7xooab.com1.z0.glb.clouddn.com/' + data.content['verify_photo'];

                //popImg = "<img width='554' height='344' src=\'" + imgHref + '\'/>';

                $("#showVerifiedPic-img").attr({src:imgHref});
                $("#inputWorkerFirstName-readOnly").val(data.content['first_name']);
                $("#inputWorkerLastName-readOnly").val(data.content['last_name']);
                $("#inputPhone-readOnly").val(data.content['phone']);
                $("#inputCardNumber-readOnly").val(data.content['id_card_no']);*/
            }
        );

    });

    $('a[name="feedback_order"]').click(function($this){
        //alert('显示对应的订单信息' + $this.currentTarget.parentNode.id);

        $.get("/doGetOrderById",{id:'20a43c70-5446-4dad-8943-3b9770066609'},
            function (data) {

                if(data.result === 'success'){

                    console.log(data.content);
                    $('#show_order_dlg').modal('show');
                }

            }
        );

    });

});

