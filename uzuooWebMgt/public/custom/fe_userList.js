/**
 * Created by Administrator on 2015/11/25.
 */


$(document).ready(function(){

    //tab页的切换事件响应，Ajax获取不同人员信息

    $("#houseOwner").on('click',function (e) {
        //alert('业主');
    });

    $("#worker").on('click',function (e) {
        //alert('工人');
    });

    $("#business").on('click',function (e) {
        //alert('商家');
    });

    //各tab页中的分页处理
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

    //工人信息表中的头像处理
    var offsetX=20-$("#table-row-tab").offset().left;
    var offsetY=20-$("#table-row-tab").offset().top;
    var size=4.2*$('#workerAvater_tbody tr td img').width();
    $("#workerAvater_tbody tr td img").mouseover(function(event) {
        var $target=$(event.target);
        if($target.is('img'))
        { $("<img id='tip' src='"+$target.attr("src")+"'>").css({
            "height":size,
            "width":size,
            "top":event.pageX+offsetX,
            "left":event.pageY+offsetY,
            "position":"absolute"
        }).appendTo($("#table-row-tab"));}
    }).mouseout(function() {
        $("#tip").remove();
    }).mousemove(function(event) {
        $("#tip").css(
            {
                "left": event.pageX + offsetX,
                "top": event.pageY + offsetY
            });
    });


    //处理可编辑列表
    oTable = $('#edit_worker_table').dataTable({
          "paginate": false,
          "sort": false,
          "searching":false,
          "pageLength":false,
          "pagingType":false,
          "info":false
    });

    var nEditing = null;

    $('#edit_worker_table').on('click', 'a.edit', function (e) {
        e.preventDefault();
        var nRow = $(this).parents('tr')[0];
        if (nEditing !== null && nEditing != nRow) {
            rollbackRow(oTable, nEditing);
            editRow(oTable, nRow);
            nEditing = nRow;
        } else if (nEditing == nRow && this.innerHTML == "保存") {
            saveRow(oTable, nEditing);
            nEditing = null;
        } else {
            editRow(oTable, nRow);
            nEditing = nRow;
        }
    });

    function editRow(oTable, nRow) {

        //ajax get cell work info
        var aData = oTable.fnGetData(nRow);
        var rTds = $('>td', nRow);
        rTds[1].innerHTML = '<input type="text" style="width:90px" value="' + aData[1] + '">';
        rTds[2].innerHTML = '<input type="text" style="width:90px" value="' + aData[2] + '">';
        rTds[4].innerHTML = '<input type="text" style="width:60px" value="' + aData[4] + '">';
        rTds[5].innerHTML = '<input type="text" style="width:90px" value="'  + aData[5] + '">';
        rTds[6].innerHTML = '<input type="text" style="width:90px" value="'  + aData[6] + '">';

        var oldString = aData[7];
        var statusStartPos = oldString.indexOf('>');
        var statusEndPos = oldString.lastIndexOf('<');
        var statusStr = oldString.substring(statusStartPos+1,statusEndPos);

        if(statusStr === '未审核'){
            rTds[7].innerHTML = '<select><option selected>未审核</option><option>审核失败</option><option>已通过</option></select>';
        }else if(statusStr === '审核失败'){
            rTds[7].innerHTML = '<select><option>未审核</option><option selected>审核失败</option><option>已通过</option></select>';
        }else if(statusStr === '已通过'){
            rTds[7].innerHTML = '<select><option>未审核</option><option>审核失败</option><option selected>已通过</option></select>';
        }

        rTds[8].innerHTML = '<a class="edit" href="">保存</a><a class="cancel" href="">取消</a>';
    }

    function saveRow(oTable, nRow) {
        var rSelect = $('select', nRow);
        var rInputs = $('input', nRow);
        var rTds = $('>td', nRow);
        rTds[1].innerHTML = rInputs[1].value;
        rTds[2].innerHTML = rInputs[2].value;
        rTds[4].innerHTML = rInputs[3].value;
        rTds[5].innerHTML = rInputs[4].value;
        rTds[6].innerHTML = rInputs[5].value;
        if(rSelect[0].value === '未审核'){
            rTds[7].innerHTML = '<span class="label label-sm label-info">未审核</span>';
        }else if(rSelect[0].value === '审核失败'){
            rTds[7].innerHTML = '<span class="label label-sm label-primary">审核失败</span>';
        }else if(rSelect[0].value === '已通过'){
            rTds[7].innerHTML = '<span class="label label-sm label-success">已通过</span>';
        }
        rTds[8].innerHTML = '<a href="javascript:;" class="edit"><i class="fa fa-edit"></i>&nbsp; 编辑</a>&nbsp;<a href="javascript:;" class="more"><i class="fa fa-ellipsis-h"></i>&nbsp; 更多</a>';

        oTable._fnReDraw();
    }

//    $('#edit_worker_table').on('click', 'a.delete', function (e) {
//        e.preventDefault();
//        if (confirm("Are you sure to delete this row ?") == false) {
//            return;
//        }
//        var nRow = $(this).parents('tr')[0];
//        oTable.fnDeleteRow(nRow);
//    });

    $('#edit_worker_table').on('click', 'a.cancel', function (e) {
        e.preventDefault();
        if ($(this).attr("data-mode") == "new") {
            var nRow = $(this).parents('tr')[0];
            oTable.fnDeleteRow(nRow);
        } else {
            rollbackRow(oTable, nEditing);
            nEditing = null;
        }
    });

    function rollbackRow(oTable, nRow) {
        var aData = oTable.fnGetData(nRow);
        var rTds = $('>td', nRow);
        rTds[1].innerHTML = aData[1] ;
        rTds[2].innerHTML = aData[2] ;
        rTds[4].innerHTML = aData[4] ;
        rTds[5].innerHTML = aData[5] ;
        rTds[6].innerHTML = aData[6] ;
        rTds[7].innerHTML = aData[7] ;
        rTds[8].innerHTML = '<a href="javascript:;" class="edit"><i class="fa fa-edit"></i>&nbsp; 编辑</a>&nbsp;<a href="javascript:;" class="more"><i class="fa fa-ellipsis-h"></i>&nbsp; 更多</a>';
        oTable.fnDraw();
    }
});

