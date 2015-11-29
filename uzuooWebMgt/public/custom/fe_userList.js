/**
 * Created by Administrator on 2015/11/25.
 */


$(document).ready(function(){

    laypage({
        cont: $('#uzUserPage'), //容器。值支持id名、原生dom对象，jquery对象,
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

    laypage({
        cont: $('#uzLeaderPage'), //容器。值支持id名、原生dom对象，jquery对象,
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

    $("#uzUser-btn").click(function(){

        //遍历表格的每行的选中状态 uz-table 误删
        $("#uz-table tr").each(function(){
            var text = $(this).children("td:first").find('input').is(':checked');// .text();
            if(text){
                alert("有个勾勾是选中的...");
            }

        });

//    $("#uz-table tr").each(function(){
//        var text = $(this).children("td").eq(2).text();//$(this).children("td:first").text();
//        alert(text);
//
//    });

    });

    $("#uzLeader-btn").click(function(){

        //遍历表格的每行的选中状态 uz-table 误删
        $("#uz-table tr").each(function(){
            var text = $(this).children("td:first").find('input').is(':checked');// .text();
            if(text){
                alert("有个勾勾是选中的...");
            }

        });

//    $("#uz-table tr").each(function(){
//        var text = $(this).children("td").eq(2).text();//$(this).children("td:first").text();
//        alert(text);
//
//    });

    });

    $("#uzBusiness-btn").click(function(){

            //遍历表格的每行的选中状态 uz-table 误删
        $("#uz-table tr").each(function(){
            var text = $(this).children("td:first").find('input').is(':checked');// .text();
            if(text){
                alert("有个勾勾是选中的...");
            }

        });

//    $("#uz-table tr").each(function(){
//        var text = $(this).children("td").eq(2).text();//$(this).children("td:first").text();
//        alert(text);
//
//    });

    });
});

