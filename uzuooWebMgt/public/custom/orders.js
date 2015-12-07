/**
 * Created by fungwan on 2015/12/7.
 */
$(document).ready(function() {

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
});