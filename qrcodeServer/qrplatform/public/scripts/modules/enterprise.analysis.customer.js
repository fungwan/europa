/**
 * Created by fdr08 on 2015/11/30.
 */
var checkBeginTime, checkEndTime;
define(function() {
    var module = {}, loaded = false, _currentSelect = "", _currentArea = "", selectList = [], allNumber = 0, increaseXarr = [], increaseYarr = [];
    var _t = new Date();
    var Now = _t.getFullYear() + "-" + ((_t.getMonth()+1)>9?(_t.getMonth()+1):"0"+(_t.getMonth()+1)) + "-" + (_t.getDate()>9?_t.getDate():"0"+_t.getDate()), startTime = "2015-11-01";
    /**
     * 各标签数据是否初始化
     * @type {boolean[]}
     */
    var isInit = [false, false];
    /**
     * 缓存各标签页数据
     * @type {{tableData: Array, mapData: Array, maxVal: string}}
     */
    var areaAna = {
            tableData: [],
            mapData: [],
            maxVal: ""
        },
        cacheGlobalData = {
            firstInit: false,
            mapdata: [],
            tabledata: [],
            maxVal: 0
        };
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
    /**
     * 无数据页面html
     * @type {string}
     */
    var noDataHtml = '<div class="nodata">没有找到数据哦，请重新查询！我先打个盹儿 (*^__^*)</div>'+
        '<div class="sleepman">'+
        '<div class="head sleep">'+
        '<div class="eye"></div>'+
        '</div>'+
        '<div class="body">'+
        '<div class="l_leg"></div>'+
        '<div class="r_leg"></div>'+
        '</div>'+
        '</div>',
        sweetTips = "<div style='width: 100%;font-size: 18px;color: orangered'>出错了：{0}<br><br>温馨提示：登录成功却不能正常使用，请检查企业信息是否完善，账号是否被锁定或禁用。若您不能排除错误，请联系我们的工作人员。<br><br>客服电话：028-61550298</div>";
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
                    initCustomerMap("", startTime, Now, "china", false);
                    isInit[0] = true;
                }else {
                    if(noData[0]) {
                        var tempHtml = $('<div style="width: 100%;"></div>').append(noDataHtml);
                        $(".table").css({display: "none"});
                        els.caa.css({display: "none"});
                        $(".custAreaNoData").append(tempHtml);
                    }else {
                        renderCustomerMap(cacheGlobalData.tabledata, cacheGlobalData.mapdata, cacheGlobalData.maxVal, _mt || "china", cacheBegtime, cacheEndtime)
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
                firstClick = false;
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
                    if(res.result.areacode) {
                        els.areaInfo.cval(res.result.areacode);
                    }
                    if(res.result.start_time) {
                        els.st.cval(res.result.start_time);
                    }
                    if(res.result.end_time) {
                        els.et.cval(res.result.end_time);
                    }
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
                        els.caa.css({display: "block"});
                        initCustomerMap(_res.result.area, _res.result.start_time, _res.result.end_time, "china", false);
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
    var _mt = "", maptype = "china", cacheAreacode = [], add = false, firstClick = false, provinceNoData = false, cacheAll = [], cacheBegtime = "", cacheEndtime = "";
    //var reg = /(省$)|(特别行政区$)|(市$)|(维吾尔自治区$)|(壮族自治区$)|(回族自治区$)/;
    function initCustomerMap(areacode, begtime, endtime, mt, add, isSearch) {
        allNumber = 0;
        cacheBegtime = begtime;
        cacheEndtime = endtime;
        areaAna.mapData.length = 0;
        areaAna.maxVal = 0;
        areaAna.tableData.length = 0;
        els.caa.action({
            url: "custanalysis/customerarea",
            data: {
                areacode: areacode,
                begtime: begtime,
                endtime: endtime
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data;
            if(_d.length > 0 && _d[0].num != 0) {
                var temp = [];
                areaAna.maxVal = Math.max.apply(null, temp);
                $.each(_d, function(i, datas) {
                    var name = datas.areaname,
                        num = parseInt(datas.num);
                    if(!name) {
                        name = "未知";
                    }
                    allNumber += num;
                    areaAna.mapData.push({
                        name: name,
                        value: num
                    });
                    cacheAreacode.push({
                        name: name,
                        areacode: datas.newareacode
                    });
                    cacheAll.push({
                        name: name,
                        value: num
                    });
                    temp.push(num);
                });
                $.each(_d, function(i, datas) {
                    if(i < 5) {
                        var name = datas.areaname;
                        if(!name) {
                            name = "未知";
                        }
                        areaAna.tableData.push([
                            name,
                            datas.num,
                            Math.round(parseInt(datas.num)/allNumber * 10000) / 100 + "%"
                        ])
                    }
                });
                if(!cacheGlobalData.firstInit) {
                    var _temp = [];
                    $.each(_d, function(i, datas) {
                        var name = datas.areaname,
                            num = parseInt(datas.num);
                        if(!name) {
                            name = "未知";
                        }
                        cacheGlobalData.mapdata.push({
                            name: name,
                            value: num
                        });
                        cacheGlobalData.tabledata.push([
                            name,
                            num,
                            Math.round(num/allNumber * 10000) / 100 + "%"
                        ]);
                        _temp.push(num);
                    });
                    cacheGlobalData.maxVal = Math.max.apply(null, _temp);
                    cacheGlobalData.firstInit = true;
                }
                if(isSearch) {
                    cacheGlobalData.mapdata.length = 0;
                    cacheGlobalData.tabledata.length = 0;
                    $.each(_d, function(i, datas) {
                        var name = datas.areaname,
                            num = parseInt(datas.num);
                        if(!name) {
                            name = "未知";
                        }
                        cacheGlobalData.mapdata.push({
                            name: name,
                            value: num
                        });
                        cacheGlobalData.tabledata.push([
                            name,
                            num,
                            Math.round(num/allNumber * 10000) / 100 + "%"
                        ]);
                        _temp.push(num);
                    });
                    cacheGlobalData.maxVal = Math.max.apply(null, _temp);
                    cacheGlobalData.firstInit = true;
                }
                $(".total").html(allNumber);
                areaAna.maxVal = Math.max.apply(null, temp);
                renderCustomerMap(areaAna.tableData, areaAna.mapData, areaAna.maxVal, mt, begtime, endtime);
            }else {
                if(areacode == "000000000") {
                    renderCustomerMap([], areaAna.mapData,0, mt, begtime, endtime);
                }else {
                    var tempHtml = $('<div class="tempHtml" style="width: 100%;"></div>').append(noDataHtml);
                    $(".table").css({display: "none"});
                    $(".customerAreaAnalysis").css({display: "none"});
                    $(".custAreaNoData").append(tempHtml);
                    noData[0] = true;
                }
            }
        }
        function onFalied(e) {
            console.log(e);
            $(".custAreaNoData").html(sweetTips.format(e.message));
        }
    }
    function renderCustomerMap(tableData, mapData, maxVal, mt, begtime, endtime) {
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
        var myChart = echarts.init(els.caa.get(0)),
                ecConfig = echarts.config,
                curIndx = 0;
        var mapType = [
            'china',
            // 23个省
            '广东', '青海', '四川', '海南', '陕西',
            '甘肃', '云南', '湖南', '湖北', '黑龙江',
            '贵州', '山东', '江西', '河南', '河北',
            '山西', '安徽', '福建', '浙江', '江苏',
            '吉林', '辽宁', '台湾',
            // 5个自治区
            '新疆', '广西', '宁夏', '内蒙古', '西藏',
            // 4个直辖市
            '北京', '天津', '上海', '重庆',
            // 2个特别行政区
            '香港', '澳门'
        ];
        var option = {
            title: {
                text : '问卷调查全国区域分布图',
                subtext : '（点击切换全国与各省）'
            },
            tooltip : {
                trigger: 'item',
                formatter: '点击进入该省<br/>{b}'
            },
            dataRange: {
                min: 0,
                max: maxVal,
                color:['orange','yellow'],
                text:['高','低'],           // 文本，默认为数值文本
                calculable : true
            },
            series : [
                {
                    name: '访问量',
                    type: 'map',
                    mapType: mt,
                    selectedMode : 'single',
                    itemStyle:{
                        normal:{label:{show:true}},
                        emphasis:{label:{show:true}}
                    },
                    data: mapData
                }
            ]
        };
        myChart.setOption(option, true);
        myChart.on(ecConfig.EVENT.MAP_SELECTED, function (param){
            var len = mapType.length;
            var mt = mapType[curIndx % len];
            _mt = mt;
            if (mt == 'china') {
                // 全国选择时指定到选中的省份
                var selected = param.selected;
                for (var i in selected) {
                    if (selected[i]) {
                        _currentArea =  maptype = mt = i;
                        var areacode = "";
                        $.each(cacheAreacode, function(i, code) {
                            if(code.name == mt) {
                                areacode = code.areacode;
                            }
                        });
                        if(firstClick) {
                            areacode = "";
                            initCustomerMap(areacode, begtime, endtime, "china", false);
                            firstClick = false;
                        }else {
                            if(areacode != "") {
                                initCustomerMap(areacode, begtime, endtime, mt, true);
                            }else {
                                provinceNoData = true;
                                initCustomerMap( "000000000", begtime, endtime, mt, true);
                            }
                            firstClick = true;
                        }
                        while (len--) {
                            if (mapType[len] == mt) {
                                curIndx = len;
                            }
                        }
                        break;
                    }
                }
                option.tooltip.formatter = '点击返回全国<br/>{b}';
            }
            else {
                curIndx = 0;
                mt = 'china';
                option.tooltip.formatter = '点击进入该省：<br/>{b}';
            }
            option.series[0].mapType = mt;
            option.title.subtext = mt + ' （点击切换）';
            myChart.setOption(option, true);
        });
    }
    /**
     * 消费者增量趋势图
     */
    function initCustomerIncrease(areacode, begtime, endtime, grouptype) {
        els.cia.action({
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
            els.cia.html(sweetTips.format(e.message));

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