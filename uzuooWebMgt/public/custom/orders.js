/**
 * Created by fungwan on 2015/12/7.
 */
$(document).ready(function() {

    laypage({
        cont: $('#ordersPage'),
        pages: 10,
        skip: true,
        skin: 'yahei',
        curr: 1,//view上显示的页数是索引加1
        groups: 5,
        hash: false,
        jump: function(obj){//一定要加上first的判断，否则会一直刷新

        }
    });

    $("#more_find_link").click(function(){
        if(this.parentNode.attributes['0']['value'] === '0'){
            this.innerHTML = '精简筛选条件<i class="fa fa-sort-asc"></i>';
            $("#more_find_div").css({"display":"block"});
            this.parentNode.attributes['0']['value'] = '1';
        }else{
            $("#more_find_div").css({"display":"none"});
            this.parentNode.attributes['0']['value'] = '0';
            this.innerHTML = '更多搜索条件<i class="fa fa-sort-desc"></i>';
        }
    });

//    $("a").click(function(){
//        alert('ds');
//    });
});