/**
 * Created by Administrator on 2015/11/25.
 */


$(document).ready(function(){
    $("#houseOwner").on('click',function (e) {
        //alert('业主');
        initialHouseData(currHousePage);
    });
    var currHousePage = 1;
    var houseFirst = false;
    function initialHouseData(curr){
        $.get("/doFindHouseOwnersByPage",{ page: curr},
            function(data){
                if(data.result === 'success'){
                    var pages = data.pages;
                    var contentArray = data.content;
                    if(contentArray.length === 0 && currpage > 1){
                        initialData(currpage - 1);
                        return;
                    }
                    warpHouseOwnerHtml(contentArray);

                    laypage({
                        cont: $('#uzUserPage'), //容器。值支持id名、原生dom对象，jquery对象,
                        pages: pages,
                        skip: true, //是否开启跳页
                        skin: 'yahei',
                        groups: 5, //连续显示分页数
                        hash: false, //会对url追加#!laypage_
                        jump: function(obj){
                            currHousePage = obj.curr;
                            if(!houseFirst){
                                houseFirst = true;
                            }else{
                                initialHouseData(obj.curr);
                                houseFirst = false;
                            }
                        }
                    });
                }
            }
        );
    }

    function warpHouseOwnerHtml(contentArray){

        $("#edit_houseOwner_table tbody").empty();
        for(x in contentArray){

            var userInfo = contentArray[x];
            var trHtml = '<tr>';
            trHtml += '<td>' + userInfo['nick_name'] +'</td>';//昵称
            trHtml += '<td>' + userInfo['user_name'] + '</td>';
            trHtml += '<td>' + userInfo['first_name']+userInfo['last_name']+'</td>';//真实姓名
            //trHtml += '<td><img src=\"' + verify_photo + '\" width="35px" height="35px"></td>';
            trHtml += '<td>' + userInfo['phone'] +'</td>';//联系方式
            trHtml += '<td>' + userInfo['email'] +'</td>';//邮箱
            trHtml += '</tr>';

            $("#edit_houseOwner_table tbody").prepend(trHtml);//append
        }
    }

    $("#business").on('click',function (e) {
        //alert('商家');
    });

    laypage({
        cont: $('#uzBusinessPage'), //容器。值支持id名、原生dom对象，jquery对象,
        pages: 100,
        skip: true, //是否开启跳页
        skin: 'yahei',
        groups: 5, //连续显示分页数
        hash: false, //会对url追加#!laypage_
        jump: function(obj){
            //$('#view6').html('看看URL的变化。通过hash，你可以记录当前页。当前正处于第'+obj.curr+'页');
            //alert(obj.curr);
        }
    });
});

