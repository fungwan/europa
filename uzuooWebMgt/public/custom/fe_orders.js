/**
 * Created by fungwan on 2015/12/7.
 */

var screeningCurrpage=1;
var regionsArray = [];//所有区域，包含源对象和map对象，索引0是源对象、1是封装后的map对象
var rolesArray = [];//所有角色，包含源对象和map对象,索引0是源对象、1是封装后的map对象

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


    $.getJSON("/doGetRoleAndRegionsInfo",function(data){

        if(data.result === 'fail'){
            return;
        }else{
            var regionsAndRolesArray = data.content.get_roleAndRegions;
            regionsArray = regionsAndRolesArray[0];
            rolesArray = regionsAndRolesArray[1];
            warpHtml([]);
            initialData(1);//表示第一页
        }
    });

    function initialData(curr){
        screeningWorkers(curr,['all']);
    }

    function screeningWorkers(cur,filterArray){

        var firstScreeningPagination = false;
        $.get("/orders",
            {
                page: cur,
                filters:filterArray
            },
            function(data){
                if(data.result === 'success'){
                    var pages = data.pages;
                    var contentArray = data.content;

                    if(contentArray.length === 0 && screeningCurrpage > 1){
                        screeningWorkers(screeningCurrpage - 1);
                        return;
                    }
                    //warpHtml(contentArray);

                    laypage({
                        cont: $('#ordersPage'),
                        pages: pages,
                        skip: true,
                        skin: 'yahei',
                        curr: cur,//view上显示的页数是索引加1
                        groups: 5,
                        hash: false,
                        jump: function(obj){//一定要加上first的判断，否则会一直刷新
                            screeningCurrpage = obj.curr;
                            if(!firstScreeningPagination){
                                firstScreeningPagination = true;
                            }else{
                                screeningWorkers(obj.curr,filterArray);
                                firstScreeningPagination = false;
                            }
                        }
                    });
                }
            }
        );
    }

    function warpHtml(contentArray){

        //$("#orders-table tbody").empty();
        for(x in contentArray){

            var orderInfo = contentArray[x];

            var createTime = orderInfo['create_time'];
            var orderDetailHref = orderInfo['order_href'];
            var status = orderInfo['status'];
            var showStatusText = '';
            switch (status) {
                case 0:
                    showStatusText = "待付定金";
                    break;
                case 1:
                    showStatusText = "待签约";
                    break;
                case 2:
                    showStatusText = "待付款";
                    break;
                case 3:
                    showStatusText = "施工中";
                    break;
                case 4:
                    showStatusText = "待评价";
                    break;
                case 5:
                    showStatusText = "待施工";
                    break;
                case 6:
                    showStatusText = "已完工";
                    break;
                case 100:
                    showStatusText = "失效订单";
                    break;

            }
            var pos = orderDetailHref.lastIndexOf('/');
            var orderId = orderDetailHref.substr(pos+1);
            
            var trHtml = '<tr>';
            trHtml += '<td><input type="checkbox" class="checkbox" /></td>';
            trHtml += '<td>' + createTime +'</td>';
            trHtml += '<td>' + 'server not give us' + '</td>';
            trHtml += '<td>' + orderId + '</td>';
            trHtml += '<td>' + 'server not give us' + '</td>';
            trHtml += '<td>' + 'server not give us' + '</td>';
            trHtml += '<td>' + 'server not give us' + '</td>';
            trHtml += '<td>' + 'server not give us' + '</td>';
            trHtml += '<td>' +  showStatusText + '</td>';
            trHtml += '<td id=\'' + orderId +'\'>';
            trHtml += '<button type="button" class="btn btn-default btn-xs"><i class="fa fa-archive"></i>&nbsp;详情</button>&nbsp;';
            trHtml += '</td></tr>';

            $("#orders-table tbody").prepend(trHtml);//append
        }

        //表单每行的编辑
        $(".btn-default.btn-xs").click(function(){

            $.get("/orders/" + this.parentNode.id,
                function (data) {

                    if(data.result === 'success'){

                        console.log(data.content);
                        $("#queueOrder-li").removeClass('active');
                        $("#tab1-wizard-custom-circle").removeClass('active');

                        var orderStatus = data.content['status'];
                        if(orderStatus === 0 || orderStatus === 1){
                            //显示基本信息
                            $("#queueOrder-li").addClass('active');
                            $("#tab1-wizard-custom-circle").addClass('active');

                            //其余移除激活状态
                            $("#signedOrder-li").removeClass('active');
                            $("#tab2-wizard-custom-circle").removeClass('active');

                            $("#building-li").removeClass('active');
                            $("#tab3-wizard-custom-circle").removeClass('active');

                            $("#finishedOrder-li").removeClass('active');
                            $("#tab4-wizard-custom-circle").removeClass('active');

                        }else if(orderStatus === 2 || orderStatus === 5){
                            //显示合同信息
                            $("#signedOrder-li").addClass('active');
                            $("#tab2-wizard-custom-circle").addClass('active');

                            //其余移除激活状态
                            $("#queueOrder-li").removeClass('active');
                            $("#tab1-wizard-custom-circle").removeClass('active');

                            $("#building-li").removeClass('active');
                            $("#tab3-wizard-custom-circle").removeClass('active');

                            $("#finishedOrder-li").removeClass('active');
                            $("#tab4-wizard-custom-circle").removeClass('active');

                        }else if(orderStatus === 3 || orderStatus === 4){
                            //显示施工信息
                            $("#building-li").addClass('active');
                            $("#tab3-wizard-custom-circle").addClass('active');

                            $("#queueOrder-li").removeClass('active');
                            $("#tab1-wizard-custom-circle").removeClass('active');
                            $("#signedOrder-li").removeClass('active');
                            $("#tab2-wizard-custom-circle").removeClass('active');
                            $("#finishedOrder-li").removeClass('active');
                            $("#tab4-wizard-custom-circle").removeClass('active');

                        }else if(orderStatus === 6){
                            //显示完工信息
                            $("#finishedOrder-li").addClass('active');
                            $("#tab4-wizard-custom-circle").addClass('active');

                            $("#queueOrder-li").removeClass('active');
                            $("#tab1-wizard-custom-circle").removeClass('active');
                            $("#signedOrder-li").removeClass('active');
                            $("#tab2-wizard-custom-circle").removeClass('active');
                            $("#building-li").removeClass('active');
                            $("#tab3-wizard-custom-circle").removeClass('active');
                        }else{
                            //无效订单
                            return;
                        }

                        var houseInfo = data.content['house_info'];
                        $("#customerAddress-span").text(houseInfo['address']);

                        var houseOwnerId = data.content['account_id'];//业主
                        var gender = data.content['gender'];
                        var callName = '';
                        if(gender === 0){
                            callName = data.content['first_name'] + '女士';
                            $("#customerName-span").text(callName);
                        }else{
                            callName = data.content['first_name'] + '先生';
                            $("#customerName-span").text(callName);
                        }
                        var candidatesArray = data.content['worker_candidates'];
                        var candidateTxt = '';
                        var candidatesMap = {};
                        for(z in candidatesArray){
                            candidateTxt += candidatesArray[z]['name'];
                            candidatesMap[candidatesArray[z]['account_id']] = candidatesArray[z];
                            if(z !== (candidatesArray.length - 1).toString()){
                                candidateTxt += ',';
                            }
                        }
                        //候选者们
                        $("#candidates-span").text(candidateTxt);

                        //遍历订单中的所有合同，查看各个状态,找出已中标的合同
                        var contractArray = data.content['contracts'];
                        var bidFlag = false;var bidContractInfo = {};
                        for( i in contractArray){
                            var contractItem = contractArray[i];
                            var contract_status =  contractItem['status'];
                            if(contract_status == 1){//表示已经签约
                                bidFlag = true;
                                bidContractInfo = contractItem;
                                break;
                            }
                        }

                        if(bidFlag){

                            //显示签约的合同信息

                            var bidWorkerId = bidContractInfo['worker_account_id'];//中标工人id
                            $("#bidWorker-span").text(candidatesMap[bidWorkerId]['name']);//中标工人的用户名
                            $("#projectAddress-span").text(houseInfo['address']);
                            $("#houseName-span").text(callName);
                            $("#houseAcreage-span").text(houseInfo['acreage'] + '平');
                            $("#houseType-span").text(houseInfo['type']);

                            $.get("/contracts/" + bidContractInfo['id'],function(data){//bidContractInfo['id']合同ID

                                if(data.result === "fail"){
                                    return;
                                }

                                var contractDetail = data.content;
                                var quotationArray = contractDetail['quotation'];
                                //$("#quotationArray").empty();
                                for(q in quotationArray){

                                    var thumbnailHtml = '';
                                    thumbnailHtml += '<div class="col-sm-6 col-md-3"><a name="quotationImg"  href="javacript:void(0);" >';
                                    thumbnailHtml += '<img border=1 src="';
                                    thumbnailHtml += 'http://7xooab.com1.z0.glb.clouddn.com/' +quotationArray[q];
                                    thumbnailHtml += '" width="128" height="128"/></a></div>';
                                    quotationArray.append(thumbnailHtml);
                                }

                                //点击放大报价单
                                $('a[name="quotationImg"]').click(function(){
                                    var popImg = this.children[0].src;
                                    popImg = "<img width='554' height='544' src=\'" + popImg + '\'/>';
                                    TINY.box.show(popImg,0,0,0,1)
                                });

                            });


                            //显示施工进程

                            $.get("/contracts/" + bidContractInfo['id'] + '/items',function(data){//bidContractInfo['id']合同ID

                                if(data.result === "fail"){
                                    return;
                                }

                                var contractItemArray = data.content;

                                $("#contractItem-table tbody").empty();
                                for(c in contractItemArray){

                                    var item = contractItemArray[c];
                                    var itemHtml = ' <tr>';
                                    itemHtml += '<td class="active">' + item['name'] + '</td>';
                                    itemHtml += '<td class="success">' + item['amount'] / 100 + '元人民币</td>';
                                    itemHtml += '<td class="warning">' + item['due_time'] / 86400 + '天</td>';
                                    itemHtml += '<td >' + item['status']  + '</td>';
                                    itemHtml += '</tr>';

                                    $("#contractItem-table tbody").append(itemHtml);
                                }
                            });

                        }


                        /*$.get("/doFindHouseOwnersById",{id:houseOwnerId},
                         function(data2){

                         if(data2.result === 'success'){

                         console.log(data2.content);

                         $("#houseOwnerNickName").val(data2.content['nick_name']);
                         $("#houseOwnerUserName").val(data2.content['first_name'] + data2.content['last_name']);
                         $("#houseOwnerPhone").val(data2.content['phone']);
                         }
                         }
                         );*/

                        $('#orderDetail-dlg').modal('show');
                    }

                }
            );
        });
    }
});