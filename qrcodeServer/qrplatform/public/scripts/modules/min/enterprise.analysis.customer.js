/**
 * Created by fdr08 on 2015/11/30.
 */
var checkBeginTime, checkEndTime;
define(function() {
    var module = {}, loaded = false, _currentSelect = "", _currentArea = "", selectList = [], allNumber = 0, increaseXarr = [], increaseYarr = [];
    var areaAna = {
        tableData: [],
        mapData: [],
        maxVal: ""
    };
    var _t = new Date(), h = _t.getHours(), m = _t.getMinutes(), s = _t.getSeconds();
    if(h < 10) {
        h = "0"+_t.getHours();
    }
    if(m < 10) {
        m = "0"+_t.getMinutes();
    }
    if(s < 10) {
        s = "0"+_t.getSeconds();
    }
    var Now = _t.getFullYear() + "-" + (_t.getMonth()+1) + "-" + _t.getDate() + " " + h + ":" + m + ":" + s, startTime = "2015-11-01 00:00:00";
    var isInit = [false, false];
    var els = {
        st: $(".startTime"),
        et: $(".endTime"),
        areaInfo: $(".area"),
        cia: $(".customerIncreaseAnalysis"),
        caa: $(".customerAreaAnalysis"),
        act: $(".activities"),
        ulItem: $("#anlaysisItems"),
        table: $(".customerTable")
    };
    var noDataHtml = '<div class="nodata">没有找到数据哦，请重新查询！我先打个盹儿 (*^__^*)</div>'+
        '<div class="sleepman">'+
        '<div class="head sleep">'+
        '<div class="eye"></div>'+
        '</div>'+
        '<div class="body">'+
        '<div class="l_leg"></div>'+
        '<div class="r_leg"></div>'+
        '</div>'+
        '</div>';
    var noData = [false, false];
    /**
     * 获取地址栏参数
     */
    function getURLParam() {
        /**
         * 分析选项数组
         */
        var selects = els.ulItem.children();
        $.each(selects, function(i, d) {
            selectList.push($(d).attr("value"));
        });
        var whatAnalysis = top.location.href.getParameter("analysis");
        var isInArr = $.inArray(whatAnalysis, selectList);
        if(isInArr >= 0) {
            els.ulItem.children("li[value="+ _currentSelect +"]").trigger("click");
        }else {
            els.ulItem.children("li:first").trigger("click");
        }
    }
    /**
     * 切换tab标签
     * @param e
     * @param target json对象
     */
    function onAnlaysisItemsChanged(e, target) {
        switch(target.tag) {
            case "customerAreaAnalysisBoard":
                if(isInit[0] == false) {
                    initCustomerMap("", startTime, Now);
                    isInit[0] = true;
                }else {
                    if(noData[0]) {
                        var tempHtml = $('<div style="width: 100%;"></div>').append(noDataHtml);
                        $(".table").css({display: "none"});
                        $(".customerAreaAnalysis").css({display: "none"});
                        $(".custAreaNoData").append(tempHtml);
                    }else {
                        renderCustomerMap(areaAna.tableData, areaAna.mapData, areaAna.maxVal);
                    }
                }
                _currentSelect = "customerAreaAnalysisBoard";
                break;
            case "customerIncreaseAnalysisBox":
                if(isInit[1] == false) {
                    initCustomerIncrease("", startTime, Now, "months");
                    isInit[1] = true;
                }else {
                    if(noData[1]) {
                        els.cia.empty().append(noDataHtml);
                    }else {
                        renderCustomerIncrease(increaseXarr, increaseYarr);
                    }
                }
                _currentSelect = "customerIncreaseAnalysisBox";
                break;
        }
    }
    /**
     * 按钮点击事件
     * @param e
     * @returns {boolean}
     */
    function onButtonClicked(e) {
        switch ($(e.currentTarget).val()) {
            case "global":
                /**
                 * 查询条件全局设置
                 * @type {*|jQuery}
                 */
                var t = $(e.currentTarget).parents(".editorGroup");
                var res = t.serializeForm();
                if (!res.hasError){
                    els.areaInfo.cval(res.result.area);
                    els.st.cval(res.result.start_time);
                    els.et.cval(res.result.end_time);
                }
                break;
            case "search":
                var _t = $(e.currentTarget).parents(".editorGroup");
                var _res = _t.serializeForm();
                checkEndTime;
                checkEndTime;
                if (!_res.hasError){
                    if(_currentSelect == "customerAreaAnalysisBoard") {
                        areaAna.tableData.length = 0;
                        areaAna.mapData.length = 0;
                        allNumber = 0;
                        _currentArea = els.areaInfo.html();
                        isInit[0] = true;
                        noData[0] = false;
                        $(".topFive").html(_currentArea + "集中度前五分布区：");
                        $(".tempHtml").remove();
                        $(".table").css({display: "block"});
                        $(".customerAreaAnalysis").css({display: "block"});
                        initCustomerMap(_res.result.area, _res.result.start_time, _res.result.end_time);
                    }else if(_currentSelect == "customerIncreaseAnalysisBox") {
                        isInit[1] = true;
                        noData[1] = false;
                        increaseXarr.length = 0;
                        increaseYarr.length = 0;
                        initCustomerIncrease(_res.result.area, _res.result.start_time, _res.result.end_time, _res.result.dateOrTime);
                    }
                }
                break;
        }
        return false;
    }
    /**
     * 消费者地域分布图
     */
    function initCustomerMap(areacode, begtime, endtime) {
        $(document.body).action({
            url: "custanalysis/customerarea",
            data: {
                areacode: areacode,
                begtime: begtime,
                endtime: endtime
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data;
            if(_d.length > 0) {
                var temp = [];
                $.each(_d, function(i, datas) {
                    allNumber += parseInt(datas.num);
                    areaAna.mapData.push({
                        name: datas.province,
                        value: parseInt(datas.num)
                    });
                    temp.push(parseInt(datas.num));
                });
                areaAna.maxVal = Math.max.apply(null, temp);
                /**
                 * 查询区域为省份
                 */
                if(areacode && areacode.length == 2) {
                    $.each(d.data, function(i, datas) {
                        if(i < 5) {
                            areaAna.tableData.push([
                                datas.city,
                                datas.num,
                                Math.round(parseInt(datas.num)/allNumber * 10000) / 100 + "%"
                            ])
                        }
                    });
                }else if(areacode && areacode.length >= 4) {
                    $.each(_d, function(i, datas) {
                        if(i < 5) {
                            //var _address = datas.city;
                            //if(_address != "") {
                                areaAna.tableData.push([
                                    datas.city,
                                    datas.num,
                                    Math.round(parseInt(datas.num)/allNumber * 10000) / 100 + "%"
                                ]);
                            //}else {
                            //    areaAna.tableData.push([
                            //        "不详",
                            //        datas.num,
                            //        Math.round(parseInt(datas.num)/allNumber * 10000) / 100 + "%"
                            //    ])
                            //}
                        }
                    });
                }else {
                    $.each(_d, function(i, datas) {
                        if(i < 5) {
                            areaAna.tableData.push([
                                datas.province,
                                datas.num,
                                Math.round(parseInt(datas.num)/allNumber * 10000) / 100 + "%"
                            ])
                        }
                    });
                }
                $(".total").html(allNumber);
                renderCustomerMap(areaAna.tableData, areaAna.mapData, areaAna.maxVal);
            }else {
                var tempHtml = $('<div class="tempHtml" style="width: 100%;"></div>').append(noDataHtml);
                $(".table").css({display: "none"});
                $(".customerAreaAnalysis").css({display: "none"});
                $(".custAreaNoData").append(tempHtml);
                noData[0] = true;
            }
        }
        function onFalied(e) {
            console.log(e);
        }
    }
    function renderCustomerMap(tableData, mapData, maxVal) {
        /**
         * 数据表
         */
        els.table.find("tr").not(":first").remove();
        var len = tableData.length, tableHtml = "";
        if(len >= 0) {
            if(len >= 5) {
                for(var i = 0; i < len; i++) {
                    tableHtml +="<tr class='areaRank'><td>{0}</td><td>{1}</td><td>{2}</td></tr>".format(tableData[i][0], tableData[i][1], tableData[i][2]);
                }
            }else {
                var _len = 5 - len;
                for(var n = 0; n < len; n++) {
                    tableHtml +="<tr class='areaRank'><td>{0}</td><td>{1}</td><td>{2}</td></tr>".format(tableData[n][0], tableData[n][1], tableData[n][2]);
                }
                for(var _n = 0; _n < _len; _n++) {
                    tableHtml += "<tr class='areaRank'><td colspan=3>暂时还没有数据哦~</td></tr>";
                }
            }
            els.table.append(tableHtml);
        }
        var myChart = echarts.init(els.caa.get(0));
        var  option = {
            title : {
                text: '消费者全国区域分布图',
                x:'center'
            },
            tooltip : {
                trigger: 'item'
            },
            dataRange: {
                min: 0,
                max: maxVal,
                x: 'left',
                y: 'bottom',
                text:['密集','稀疏'],           // 文本，默认为数值文本
                calculable : true,
                color: ['#e04a4a', '#E09107', '#E5E31C']
            },
            series : [
                {
                    name: '消费者',
                    type: 'map',
                    mapType: 'china',
                    roam: false,
                    itemStyle:{
                        normal:{label:{show:true}},
                        emphasis:{label:{show:true}}
                    },
                    data: mapData
                }
            ]
        };
        myChart.setOption(option);
    }
    /**
     * 消费者增量趋势图
     */
    function initCustomerIncrease(areacode, begtime, endtime, grouptype) {
        $(document.body).action({
            url: "custanalysis/customerdate",
            data: {
                areacode: areacode,
                begtime: begtime,
                endtime: endtime,
                grouptype: grouptype
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data;
            if(_d.length > 0) {
                if(grouptype == "days") {
                    $.each(_d, function(i, datas) {
                        var x = datas.y + "年" + datas.m + "月" + datas.d + "日";
                        increaseXarr.push(x);
                        increaseYarr.push(datas.num);
                    });
                }else if(grouptype == "months"){
                    $.each(_d, function(i, datas) {
                        var x = datas.y + "年" + datas.m + "月";
                        increaseXarr.push(x);
                        increaseYarr.push(datas.num);
                    });
                }
                renderCustomerIncrease(increaseXarr, increaseYarr);
            }else {
                els.cia.empty().append(noDataHtml);
                noData[1] = true;
            }
        }
        function onFalied(e) {
            console.log(e);
        }
    }
    function renderCustomerIncrease(xArr, num) {
        els.cia.highcharts({
            chart: {
                type: 'line'
            },
            credits: {
                enabled: false
            },
            title: {
                text: '消费者数量变化趋势'
            },
            xAxis: {
                categories: xArr
            },
            yAxis: {
                min: 0,
                title: {
                    text: '数量（个）'
                }
            },
            tooltip: {
                headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y}</b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true
            },
            plotOptions: {
                column: {
                    pointPadding: 0.2,
                    borderWidth: 0
                }
            },
            series: [{
                name: '数量',
                color: "#64B2F7",
                data: num,
                dataLabels: {
                    enabled: true,
                    style: {
                        fontSize: '13px'
                    }
                }
            }]
        });
    }
    function init() {
        if (!loaded) {
            els.ulItem.bind("change", onAnlaysisItemsChanged);
            $(document.body).on("click", "button", onButtonClicked);
            getURLParam();
            els.st.cval(startTime);
            els.et.cval(Now);
            checkEndTime = function(v, source) {
                var begtime = source.parent().prev().children("button"), begtimeVal = begtime.cval();
                if (v < begtimeVal) {
                    target.cval(v);
                    source.cval(begtimeVal);
                }
            };
            checkBeginTime = function(v, source) {
                var endtime = source.parent().next().children("button"), endtimeVal = endtime.cval();
                if (v > endtimeVal) {
                    endtime.cval(v);
                    source.cval(endtimeVal);
                }
            };
            loaded = true;
        }
    }
    module.init = init;
    return module;
});