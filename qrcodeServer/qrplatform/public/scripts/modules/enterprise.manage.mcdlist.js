/**
 * Created by san on 2015/11/30.
 */
define(function () {

    var module = {}, loaded = false, dealerList = null, dealeres = null, dealerSelected = null;
    var nameSelector = $("#nameSelector"), changeGroupBtn = $("#goodrepaire"), changeqrbutton=$("#qradd"),groupSelector = $("#groupSelector"), dealerMessage = $("#dealerMessage");
    var datagridBefore = null;
    var funcList = {
        /**
         * 初始商品列表
         */
        initList: {
            init: function () {
                dealerList = $(".dealerList").datagrid({
                    editable: false,
                    idField: "mcdid",
                    selectCell: false,
                    multiple: false,
                    pagination: {
                        info: "<div style='padding-left: 32px'> 当前显示数量 <b style='font-size: 22px'>{end}</b> / 总数 <b style='font-size: 22px'>{total}</b></div>"
                    },
                    data: {
                        totalName: 'data.totalsize'
                    },
                    uri: "mcdManage/getMcdList",
                    columns: [
                        /*{checkbox: true},*/
                        {
                            field: "categoryname",
                            caption: "类型",
                            width: 160,
                            sortable: false,
                            sort: "asc"
                        },
                        {
                            field: "mcdname",
                            caption: "商品名称",
                            width: 160,
                            sortable: false
                        },
                        {
                            field: "mcddesc",
                            caption: "描述",
                            width: 200,
                            editable: false,
                            sortable: false
                        },
                        {
                            field: "amount",
                            caption: "二维码总数",
                            width: 160,
                            editable: false,
                            sortable: false
                        },
                        {
                            field: "count",
                            caption: "可消费二维码数量",
                            width: 160,
                            sortable: false
                        },
                        {
                            field: "mcdid",
                            formatter: function(value, data) {
                                return `<span data-a="${value}" data-b=${JSON.stringify(data)} class="qrmore">查看详情</span>`
                            },
                            caption: "二维码信息",
                            width: 120,
                            sortable: false
                        },
                        {
                            field: "state",
                            caption: "状态",
                            width: 120,
                            sortable: false
                        },
                        {
                            field: "mcdid",
                            formatter: function(value, data) {
                                return `<span data-a="${value}"  class="goodsdown" style="cursor: pointer;">下架</span>`
                            },
                            caption: "操作",
                            width: 140,
                            sortable: false
                        }
                    ],
                    rowClicked: changeGroupCheck
                });
            }
        },
        /**
         * 按条件查询商品列表
         */
        queryDealer: {
            //普通查询
            call: function (e) {
                var res = $(".topTool").serializeForm();
                if (res.hasError) {
                    dealerMessage.notice(true,res.hasError);
                }
                else {
                    dealerList.datagrid("reload", {
                        query: JSON.stringify({
                            categoryid:$("#querlei").attr("value"),
                            mcdname: res.result.dealerName
                        })
                    });
                }
            },
            //高级查询
            callgj: function (e) {
                var res = $(".topTool").serializeForm();
                console.log(res);
                if (res.hasError) {
                    dealerMessage.notice(true,res.hasError);
                }
                else {
                    dealerList.datagrid("reload", {
                        query: JSON.stringify({
                            categoryid:$("#querlei").attr("value"),
                            mcdname: res.result.dealerName,
                            categoryname: $("#popleixing").text(),
                            mcddesc:res.result.mcddesc,
                            bathcode: parseInt(res.result.maxLotteryTime)
                        })
                    });
                }
            }
        },
        /**
         * 初始化所有商品类型列表
         */
        initGroupList: {
            call: function (e) {
                if ($(this).attr("class") != "opened" && $(".groupItems").children().length == 0) {
                    groupSelector.action({
                        url: "mcdManage/getCategoryList",
                        data:{
                            page: 1,
                            size:10
                        }
                    }, false).then(funcList.initGroupList.success, funcList.initGroupList.fail);
                }
                else {
                    console.log("没有触发");
                }
            },
            success: function (d) {
                $("#customerTypes").empty();
                $.each(d.data.data, function (i, v) {
                    $("#customerTypes").append("<button value=" + v.categoryid+ ">" + v.name + "</button>");
                    $("button[value=" + v.name + "]").data("d", v);
                })
            },
            fail: function (error) {
                dealerMessage.notice(false, error.message);
            }
        },
        /**
         * 修改所选商品信息
         */
        changeGroup: {
            popup:function(e){
                $("#goodsave").attr({"data-witch":"rep"});
                $("#popgood").stop().animate({'right':"0px"},500);
                $(".addin>h1").html("您正在修改商品信息");
                var record = dealerList.datagrid('getSelected');
                if (record) {
                    console.log(record);
                    $("#goodsname").val(record.mcdname);
                    $("#popleixing").cval(record.categoryid);
                    $("#goodsdesc").val(record.mcddesc);
                }
            },
            popdown:function(){
                $("#popgood").stop().animate({'right':"-372px"},500);
                $("#goodsname").val("")
                $("#popleixing").val("")
                $("#goodsdesc").val("")
            },
            call: function (e) {
                var record = dealerList.datagrid('getSelected');
                if (record) {
                    $("#addform").action({
                        url: "mcdManage/saveOrUpdMcd",
                        data: {
                            mcdid: record.mcdid,
                            mcdname: $("#goodsname").val(),
                            categoryid: $("#popleixing").val(),
                            mcddesc: $("#goodsdesc").val()

                        }
                    }).then(funcList.changeGroup.success, funcList.changeGroup.fail);
                }
            },
            success: function (d) {
                $("#popgood").stop().animate({'right':"-372px"},500);
                $("#goodsname").val("")
                $("#popleixing").val("")
                $("#goodsdesc").val("")
                dealerList.datagrid("reload");
                changeGroupBtn.attr("disabled", true);
                dealerMessage.notice(true, "修改成功");
            },
            fail: function (error) {
                dealerMessage.notice(false, error.message);
            }
        },
        goodsAdd:{
            //下架商品
            succ:function(){
                dealerList.datagrid("reload");
            },
            faikll:function(error){
                dealerMessage.notice(false, error.message);
            },
            goodsdel:function(e){
                var mcdid=e.currentTarget.dataset.a;
                var listid = [];
                listid.push(mcdid);
                if (mcdid) {
                    $("#addform").action({
                        url: "mcdManage/delMcd",
                        data: {
                            mcdId: JSON.stringify({
                                list: listid
                            })
                        }
                    }).then(funcList.goodsAdd.succ, funcList.goodsAdd.faill);
                }

            },
            //判断修改商品，添加商品
            checkk:function(){
                var witch=$("#goodsave").attr("data-witch");
                if (witch=="add") {
                    funcList.goodsAdd.goodsinfoadd();
                }else{
                    funcList.changeGroup.call();
                }
            },
            //添加商品
            goodsinfoadd:function(e){
                $(document.body).action({
                    url: "mcdManage/saveOrUpdMcd",
                    data: {
                        mcdid:"",
                        mcdname: $("#goodsname").val(),
                        categoryid: $("#popleixing").val(),
                        categoryname: $("#popleixing").text(),
                        //packing: $("#baozhuang").val(),
                        mcddesc:$("#goodsdesc").val()
                    }
                }).then(funcList.goodsAdd.success, funcList.goodsAdd.fail);
            },
            //添加商品弹出
            popup:function(){
                $("#popgood").stop().animate({'right':"0px"},500);
                $(".addin>h1").html("您正在添加商品信息");
                $("#goodsave").attr({"data-witch":"add"});
            },
            //添加商品收起
            popdown:function(){
                $("#popgood").stop().animate({'right':"-372px"},500);
                $("#goodsname").val("")
                $("#popleixing").val("")
                $("#goodsdesc").val("")
            },
            success: function (d) {
                $("#popgood").stop().animate({'right':"-372px"},500);
                $("#goodsname").val("")
                $("#popleixing").val("")
                $("#goodsdesc").val("")
                dealerList.datagrid("reload");
                changeGroupBtn.attr("disabled", true);
                dealerMessage.notice(true, "添加成功");
            },
            fail: function (error) {
                dealerMessage.notice(false, error.message);
            }
        },
        qrAdd:{
            goon:function(d){
                var n=parseFloat(d.data.progress);
                var c=parseInt(n.toFixed(2)*100);
                if(c==100){
                   // clearInterval(timer);
                    console.log("yes reload")
                    funcList.qrAdd.initlist();
                    //$(this).parent().parent().remove();
                }else{
                    console.log(c)
                    $("#procir").html(c);
                    $(".progressbar").addClass('progressbar-' + c);
                    funcList.qrAdd.qrprocss();
                    //alert($("#procir"));
                    //$('.progressbar').each(function(index, el) {
                        //var num = $("#procir").text();

                   // });

                }
            },
            goonoot:function(error){
                console.log(error)
            },
            qrprocss:function(){
                var mcdidd=$("#qraddedit").attr("qraddmcdid");
                var mcname=$("#qraddedit").attr("qraddmcdname");
                var baid=$("#qraddedit").attr("btid");
                var pch=$("#qraddedit").attr("pcid");

                $("#qraddbox").action({
                    url: "mcdManage/addMcdQR",
                    data: {
                        mcdId: mcdidd,
                        mcdName:mcname,
                        batchCode:baid,
                        amount:pch
                    }
                },false).then(funcList.qrAdd.goon, funcList.qrAdd.goonoot);
            },
            qrmore:function(e){
                e.stopPropagation();
                var mcdid=e.currentTarget.dataset.a;
                var obj=JSON.parse(e.currentTarget.dataset.b);
                console.log(obj);
                //$("#qrtit").html(`<h1><span>1${obj.mcdname}${obj.categoryname}</span>二维码生成记录</h1>`)
                if (mcdid) {
                    $("#addform").action({
                        url: "mcdManage/getMcdQRbatchList",
                        data: {
                            mcdId: mcdid,
                            page:1,
                            size:10
                        }
                    }).then(funcList.qrAdd.succ, funcList.qrAdd.fail);
                }

            },
            initlist:function(){
                var mc=$("#qraddedit").attr("qraddmcdid");
                var qrd=$("#qraddedit").attr("qraddbatid");
                $(document.body).action({
                    url: "mcdManage/getMcdQRbatchList",
                    data: {
                        mcdId: mc,
                        page:1,
                        size:10

                    }
                }).then(funcList.qrAdd.succ, funcList.qrAdd.fail);
            },
            popup:function(){
                $("#popqr").stop().animate({'right':"0px"},500);
                var record = dealerList.datagrid('getSelected');
                if (record) {
                    //标记商品mcdid
                    $("#qraddedit").attr({'qraddmcdid':record.mcdid});
                    $("#qraddedit").attr({'qraddbatid':record.batchid});
                    $("#qraddedit").attr({'qraddmcdname':record.mcdname});

                    $("#qrtit>h1").html(`<span class="b" title="${record.mcdname}${record.categoryname}">${record.mcdname}${record.categoryname}</span><span class="a">二维码生成记录</span> `);
                    funcList.qrAdd.initlist();
                }
            },
            popdown:function(){
                $("#popqr").stop().animate({'right':"-690px"},500)
            },
            //添加，返回批次号
            addedi:function(){
                var mcdidd=$("#qraddedit").attr("qraddmcdid");
                var mcname=$("#qraddedit").attr("qraddmcdname");
                var baid=$("#qraddedit").attr("qraddbatid");

                $(document.body).action({
                    url: "mcdManage/getAddQRbatch",
                    data: {
                        mcdId: mcdidd,
                    }
                }).then(funcList.qrAdd.success, funcList.qrAdd.fail);
            },
            scqr:function(){
                var mcdidd=$("#qraddedit").attr("qraddmcdid");
                var mcname=$("#qraddedit").attr("qraddmcdname");
                var baid=$(this).attr("data-batchid");
                var pch=$(this).parent().children().eq(2).children(0).val();
                $("#qraddedit").attr({"btid":baid});
                $("#qraddedit").attr({"pcid":pch});
                console.log(baid);
                $(this).prev().removeClass("cxx");
                $(this).prev().html(`<div class="progressbar"><span id="procir">0</span>%</div>`)
                $(document.body).action({
                    url: "mcdManage/addMcdQR",
                    data: {
                        mcdId: mcdidd,
                        mcdName:mcname,
                        batchCode:baid,
                        amount:pch
                    }
                }).then(funcList.qrAdd.isgoon, funcList.qrAdd.scqrfail);
            },
            isgoon:function(d){
                console.log(d);
                console.log(d);
                console.log(d);
                console.log(d);
                if(d.data.gen){
                    funcList.qrAdd.qrprocss();
                }else{
                    dealerMessage.notice(false,d);
                }
            },
            scqrsuc:function(d){
                //生成二维码成功后重新获取列表
                funcList.qrAdd.initlist();
                console.log(d)
            },
            scqrfail:function(error){
                dealerMessage.notice(false,error);
            },
            succ:function(d){
                console.log(d);
                console.log(d.data)
                var data=d.data.data;
                $("#qraddbox").empty();
                for(var i=0;i<data.length;i++){
                    $("#qraddbox").append(`<div class="qrboxcontentitem qrboxtitle clear3">
                    <div class="pcnum">${data[i].batchcode}</div>
                    <div class="pctime">t(${data[i].createtime})</div>
                    <div class="zs"><input type="number" value="${data[i].amount}" disabled></div>
                    <div class="kynum">${data[i].amount}</div>
                    <div class="cx" data-batchid="${data[i].batchcode}">已生成</div>
                    <div class="cz" data-batchid="${data[i].batchcode}">查看</div>
                </div>`)
                }
                function t(t){
                    var d=new Date(t);
                    return d.toLocaleDateString();
                }
            },
            success:function(d){
                $("#qraddbox").prepend(`<div class="qrboxcontentitem qrboxtitle clear">
                    <div class="pcnum">${d.data}</div>
                    <div class="pctime">---</div>
                    <div class="zs"><input type="number"></div>
                    <div class="kynum">---</div>
                    <div class="cx cxx" data-batchid="${d.data}">撤销</div>
                    <div class="cz czz" data-batchid="${d.data}">生成</div>
                </div>`)
            },
            productqr:function(){
                var batid=$(this).attr("data-batchid")
            },
            fail:function(error){
                dealerMessage.notice(false, error);
            },
            reback:function(){
                $(this).parent().fadeOut(500);
            }
        }
    };
    /**
     * 每行选中的处理函数
     * @param e
     */
    function changeGroupCheck(e) {
        $("#popgood").stop().animate({'right':"-372px"},500);
        $("#popqr").stop().animate({'right':"-690px"},500);
        var btt=$("#goodrepaire");
        var bttqr=$("#qradd");
        dealerSelected = dealerList.datagrid("getSelected");
        if (dealerSelected) {
            changeGroupBtn.attr("disabled", false);
            changeqrbutton.attr("disabled", false);
        }
        else {

            changeGroupBtn.attr("disabled", true);
            changeqrbutton.attr("disabled", true);
        }
    }

    /**
     * 开始高级查询
     */
    //function onUserSelectorSubmit() {
    //    funcList.seniorQueryDealer.call();
    //}
    module.init = function () {
        if (!loaded) {
            //初始化商品列表
            funcList.initList.init();
            //初始化商品类别列表
            funcList.initGroupList.call();
            //changeGroupBtn.unbind().click(funcList.initGroupList.call);
            //$(".seniorGroup").click(funcList.initGroupList.call);
            //修改商品或者添加商品

            $("#goodsave").click(funcList.goodsAdd.checkk);
            //$("#goodrepaire").click(funcList.goodsAdd.popup);
            //添加商品
            $("#goodsadd").click(funcList.goodsAdd.popup);
            //收起商品添加弹出框
            $("#popgoodscancel").click(funcList.goodsAdd.popdown);
            //商品列表查看二维码详情
            $(".dealerList").on("click",".qrmore",funcList.qrAdd.popup);
            //添加二维码按钮
            $("#qradd").click(funcList.qrAdd.popup);
            //收起添加二维码弹出框
            $("#qrback").click(funcList.qrAdd.popdown);
            //修改商品弹出框
            $("#goodrepaire").click(funcList.changeGroup.popup);
            //添加二维码返回批次号
            $("#qraddedit").click(funcList.qrAdd.addedi);

            //添加二维码批次
            $("#qraddbox").on('click',".czz",funcList.qrAdd.scqr).bind(this);
            //撤销二维码
            $("#qraddbox").on('click','.cxx',funcList.qrAdd.reback).bind(this);

            groupSelector.on("click", "button", "selectedItemChanged", funcList.changeGroup.call);
            //普通查询
            $("#query").unbind().click(funcList.queryDealer.call);
            //高级查询
            $("#gjcx").unbind().click(funcList.queryDealer.callgj);
            $("#seniorquery").click(function (e) {
                $("#userSelector").maskerLayer("open");
                return false;
            });
            //查看详情二维码
            dealerList.on('click', 'span.qrmore',funcList.qrAdd.qrmore);
            //下架商品
            dealerList.on('click', 'span.goodsdown',funcList.goodsAdd.goodsdel);
            loaded = true;
        }
    };

    return module;
});