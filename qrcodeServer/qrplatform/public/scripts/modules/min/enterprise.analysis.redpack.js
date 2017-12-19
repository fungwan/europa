/**
 * Created by fdr08 on 2015/11/30.
 */
var checkBeginTime, checkEndTime;
define(function () {
    var module = {}, loaded = false, _currentActivity = "", _currentSelect = "", _currentPrize = "", _currenPrizeCH = "", activitiesList = [], selectList = [];
    var isInit = [false, false, false, false];
    var progress = {
        tabelData: [],
        pieData: [],
        sumData: []
    }, dateAna = {
        xArr: [],
        yNumDatas: [],
        yMoneyDatas: [],
        grouptype: "months"
    }, timesAna = {
        xDatas: [],
        yMoneyDatas: [],
        yTimeDatas: []
    }, areaAna = {
        mapdata: [],
        piedata: [],
        cacheAreacode: [],
        maxVal: ""
    };
    var _t = new Date(), h = _t.getHours(), m = _t.getMinutes(), s = _t.getSeconds();
    if (h < 10) {
        h = "0" + _t.getHours();
    }
    if (m < 10) {
        m = "0" + _t.getMinutes();
    }
    if (s < 10) {
        s = "0" + _t.getSeconds();
    }
    var Now = _t.getFullYear() + "-" + (_t.getMonth() + 1) + "-" + _t.getDate() + " " + h + ":" + m + ":" + s, startTime = "2015-11-01 00:00:00";
    var els = {
        cp: $(".countPrize"),
        st: $(".startTime"),
        et: $(".endTime"),
        areaInfo: $(".area"),
        person: $(".person"),
        money: $(".allmoney"),
        num: $(".number"),
        percent: $(".percent"),
        progress: $(".progress-bar>span"),
        laa: $('.lotteryAreaAnalysis'),
        hpa: $(".hasPrizeAnalysis"),
        eapa: $('.eachAreaPrizeLevelAnalysis'),
        lda: $('.lotteryDateAnalysis'),
        lta: $('.lotteryTimeAnalysis'),
        eda: $('.eachDrawAnalysis'),
        dt: $(".dateOrTime"),
        act: $(".activities"),
        ulItem: $("#anlaysisItems"),
        pt: $(".prizeTable"),
        cprize: $(".choosePrize"),
        cprizePop: $("#choosePrize")
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
    var noData = [false, false, false, false];
    //pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
    /**
     * 初始化活动列表
     */
    function initActivityList() {
        var activities = [], actHtml = "";
        $(document.body).action("project/prolist").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            activities = d.data;
            var btn = '';
            if (activities.length > 0) {
                for (var i = 0, len = activities.length; i < len; i++) {
                    btn= "<button value='{0}'>{1}</button>".format(activities[i].projectid, activities[i].name);
                    actHtml += btn;
                }
            } else {
                btn = "<button value=''>暂无活动！</button>";
                actHtml += btn;
            }
            els.act.append(actHtml).children().first().addClass("activityClicked");
            $.each(activities, function (i, datas) {
                activitiesList.push(activities[i].projectid);
            });
            _currentActivity = els.act.children(".activityClicked").val();
            getURLParam();
        }
        function onFalied(e) {
            console.log(e);
        }
    }
    /**
     * 获取地址栏参数
     */
    function getURLParam() {
        /**
         * 分析选项数组
         */
        var selects = els.ulItem.children();
        $.each(selects, function (i, d) {
            selectList.push($(d).attr("value"));
        });
        var whichActivity = top.location.href.getParameter("id"),
            whatAnalysis = top.location.href.getParameter("analysis");
        var isInArr = $.inArray(whichActivity, activitiesList),
            _isInArr = $.inArray(whatAnalysis, selectList);
        if (isInArr >= 0) {
            _currentActivity = whichActivity;
            initPrize(_currentActivity);
            if (_isInArr >= 0) {
                _currentSelect = whatAnalysis;
            }
            els.act.children("button[value=" + _currentActivity + "]").trigger("click");
        } else {
            initPrize(_currentActivity);
            $("button[value=" + activitiesList[0] + "]").trigger("click");
        }
    }
    /**
     * 切换活动
     */
    function chooseActivity() {
        $(this).addClass("activityClicked").siblings("button").removeClass("activityClicked");
        _currentActivity = $(this).val();
       isInit = [false, false, false, false];
        /**
         * 获取活动进度信息
         */
        getacprogress(_currentActivity);
        if (_currentSelect) {
            els.ulItem.children("li[value=" + _currentSelect + "]").trigger("click", true);
        } else {
            els.ulItem.children("li:first").trigger("click");
        }
    }
    /**
     * 获取活动进度等信息
     * @param _currentActivity 问卷id
     */
    function getacprogress(_currentActivity) {
        $(document.body).action({
            url: "analyze/rqprogress",
            data: {
                id: _currentActivity
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data;
            els.progress.animate({width: _d.lotteryprogress + "%"});
            els.percent.html(_d.lotteryprogress || 0);
        }
        function onFalied(e) {
            console.log(e);
        }
    }
    /**
     * 切换tab标签
     * @param e
     * @param target json对象
     */
    function onAnlaysisItemsChanged(e, target) {
        switch (target.tag) {
            case "prizeAnalysis":
                if (isInit[0] == false) {
                    initPrizeAreaChart(_currentActivity, "", startTime, Now);
                    isInit[0] = true;
                    noData[0] = false;
                } else {
                    if(noData[0]) {
                        var tempHtml = $('<div style="width: 100%;"></div>').append(noDataHtml);
                        $(".hasPrizeAnalysis").css({display: "none"});
                        $(".prizeTable").css({display: "none"});
                        $(".prizeprogress").append(tempHtml);
                    }else {
                        renderPrizeAreaChart(progress.tabelData, progress.pieData);
                    }
                }
                _currentSelect = "prizeAnalysis";
                break;
            case "areaAnalysis":
                if (isInit[1] == false) {
                    initLotteryAreaChart(_currentActivity, startTime, Now, "", "");
                    isInit[1] = true;
                    noData[1] = false;
                } else {
                    if(noData[1]) {
                        var tempHtml = $('<div style="width: 100%;"></div>').append(noDataHtml);
                        $(".lotteryAreaAnalysis").css({display: "none"});
                        $(".eachAreaPrizeLevelAnalysis").css({display: "none"});
                        $(".nodata").parent().remove();
                        $(".areaAnalysisBoard").append(tempHtml);
                    }else {
                        renderLotteryAreaChart(areaAna.mapdata, areaAna.maxVal)
                    }
                }
                _currentSelect = "areaAnalysis";
                break;
            case "timeAnalysis":
                if (isInit[2] == false) {
                    initLotteryDateChart(_currentActivity, "", startTime, Now, "", "months");
                    isInit[2] = true;
                    noData[2] = false;
                } else {
                    if(noData[2]) {
                        $(".lotteryDateAnalysis").empty().append(noDataHtml);
                    }else {
                        renderLotteryDateChart(dateAna.grouptype, dateAna.xArr, dateAna.yNumDatas, dateAna.yMoneyDatas);
                    }
                }
                _currentSelect = "timeAnalysis";
                break;
            case "drawTimesAnalysis":
                if (isInit[3] == false) {
                    timesAna.xDatas.length = 0;
                    timesAna.yMoneyDatas.length = 0;
                    timesAna.yTimeDatas.length = 0;
                    initEachDrawChart(_currentActivity, "", "", startTime, Now, "10");
                    isInit[3] = true;
                    noData[3] = false;
                } else {
                    if(noData[3]) {
                        $(".eachDrawAnalysis").empty().append(noDataHtml);
                    }else {
                        renderEachDrawChart(timesAna.xDatas, timesAna.yMoneyDatas, timesAna.yTimeDatas)
                    }
                }
                _currentSelect = "drawTimesAnalysis";
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
                var t = $(e.currentTarget).parents(".editorGroup");
                var res = t.serializeForm();
                if (!res.hasError) {
                    els.areaInfo.cval(res.result.area);
                    els.st.cval(res.result.start_time);
                    els.et.cval(res.result.end_time);
                    els.dt.cval(res.result.dateOrTime);
                    els.cprize.cval(_currentPrize).html(_currenPrizeCH);
                }
                break;
            case "search":
                var _t = $(e.currentTarget).parents(".editorGroup");
                var _res = _t.serializeForm();
                checkEndTime;
                checkEndTime;
                if (!_res.hasError) {
                    if (_currentSelect == "prizeAnalysis") {
                        progress.pieData.length = 0;
                        progress.sumData.length = 0;
                        progress.tabelData.length = 0;
                        isInit[0] = true;
                        noData[0] = false;
                        $(".prizeTable").css({display: "block"});
                        $(".hasPrizeAnalysis").css({display: "block"});
                        $(".nodata").parent().remove();
                        initPrizeAreaChart(_currentActivity, _res.result.areacode, _res.result.start_time, _res.result.end_time);
                    } else if (_currentSelect == "areaAnalysis") {
                        isInit[1] = true;
                        noData[1] = false;
                        $(".lotteryAreaAnalysis").css({display: "block"});
                        $(".eachAreaPrizeLevelAnalysis").css({display: "block"});
                        $(".nodata").parent().remove();
                        initLotteryAreaChart(_currentActivity, _res.result.start_time, _res.result.end_time, _res.result.areacode, _currentPrize);
                    } else if (_currentSelect == "timeAnalysis") {
                        dateAna.grouptype = "";
                        dateAna.xArr.length = 0;
                        dateAna.yMoneyDatas.length = 0;
                        dateAna.yNumDatas.length = 0;
                        isInit[2] = true;
                        noData[2] = false;
                        $(".lotteryDateAnalysis").empty();
                        initLotteryDateChart(_currentActivity, _res.result.areacode, _res.result.start_time, _res.result.end_time, _currentPrize, _res.result.dateOrTime);
                    } else if (_currentSelect == "drawTimesAnalysis") {
                        timesAna.xDatas.length = 0;
                        timesAna.yMoneyDatas.length = 0;
                        timesAna.yTimeDatas.length = 0;
                        isInit[3] = true;
                        noData[3] = false;
                        initEachDrawChart(_currentActivity, _res.result.areacode, _currentPrize, _res.result.start_time, _res.result.end_time, _res.result.topNum);
                    }
                }
                break;
        }
        return false;
    }
    /**
     * 初始化中奖进度图/表
     * @param _currentActivity  当前活动id
     * @param areacode
     * @param begtime
     * @param endtime
     */
    function initPrizeAreaChart(_currentActivity, areacode, begtime, endtime) {
        progress.pieData.length = 0;
        progress.tabelData.length = 0;
        progress.sumData.length = 0;
        $(document.body).action({
            url: "analyze/lotteryprogress",
            data: {
                id: _currentActivity,
                areacode: areacode,
                begtime: begtime,
                endtime: endtime
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data,_info = _d.info;
            if(_info.length > 0) {
                $(".hasPrizeAnalysis").css({display: "block"});
                $(".prizeTable").css({display: "block"});
                progress.sumData.push(_d.recmember, _d.recmoney, _d.recnumber);
                els.person.html(progress.sumData[0] || 0);
                els.money.html(progress.sumData[1] || 0);
                els.num.html(progress.sumData[2] || 0);
                $.each(_info, function (i, datas) {
                    progress.tabelData.push([
                        datas.lotteryid, datas.lotteryname, datas.recnumber, datas.recmoney
                    ]);
                    progress.pieData.push({
                        name: datas.lotteryname,
                        y: datas.recnumber
                    })
                });
                renderPrizeAreaChart(progress.tabelData, progress.pieData);
            }else {
                var tempHtml = $('<div style="width: 100%;"></div>').append(noDataHtml);
                $(".hasPrizeAnalysis").css({display: "none"});
                $(".prizeTable").css({display: "none"});
                $(".prizeprogress").append(tempHtml);
                noData[0] = true;
            }
        }
        function onFalied(e) {
            console.log(e);
        }
    }
    /**
     * 渲染中奖进度图/表
     * @param tableData
     * @param datas
     */
    function renderPrizeAreaChart(tableData, datas) {
        els.pt.find("tr").not(":first").remove();
        var len = tableData.length, tableHtml = "";
        if (len > 0) {
            for (var i = 0; i < len; i++) {
                tableHtml += "<tr id='{0}'><td>{1}</td><td>{2}</td><td>{3}</td></tr>".format(tableData[i][0], tableData[i][1], tableData[i][2], tableData[i][3]);
            }
            els.pt.append(tableHtml);
        } else {
            els.pt.append("<tr><td colspan=3>还没有数据哦~</td></tr>");
        }
        /**
         * 分析图
         */
        els.hpa.highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            credits: {
                enabled: false
            },
            title: {
                text: "各奖项中奖情况分析"
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
            },
            legend: {
                labelFormatter: function () {
                    return this.name + '(' + this.percentage.toFixed(2) + '%)';//在名称后面追加百分比数据
                }
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            series: [{
                type: 'pie',
                name: '奖项占比',
                data: datas
            }]
        });
    }
    /**
     * 各地中奖数量分布图
     */
    function initLotteryAreaChart(_currentActivity, begtime, endtime, areacode, lotteryid) {
        areaAna.mapdata.length = 0;
        areaAna.cacheAreacode.length = 0;
        areaAna.piedata.length = 0;
        areaAna.maxVal = "";
        $(document.body).action({
            url: "analyze/lotteryarea",
            data: {
                id: _currentActivity,
                begtime: begtime,
                endtime: endtime,
                areacode: areacode,
                lotteryid: lotteryid
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data.info, temp = [];
            if(_d.length > 0) {
                $(".nodata").parent().remove();
                $(".lotteryAreaAnalysis").css({display: "block"});
                $(".eachAreaPrizeLevelAnalysis").css({display: "block"});
                $.each(_d, function (i, datas) {
                    var name = datas.province;
                    areaAna.mapdata.push({
                        name: name,
                        value: datas.recnumber
                    });
                    areaAna.cacheAreacode.push({
                        name: name,
                        num: datas.recnumber,
                        areacode: datas.areacode,
                        lottery: datas.detail
                    });
                    temp.push(datas.recnumber);
                });
                areaAna.maxVal = Math.max.apply(null, temp);
                renderLotteryAreaChart(areaAna.mapdata, areaAna.maxVal);
            }else {
                var tempHtml = $('<div style="width: 100%;"></div>').append(noDataHtml);
                $(".lotteryAreaAnalysis").css({display: "none"});
                $(".eachAreaPrizeLevelAnalysis").css({display: "none"});
                $(".areaAnalysisBoard").append(tempHtml);
                noData[1] = true;
            }
        }
        function onFalied(e) {
            console.log(e);
        }
    }
    function renderLotteryAreaChart(datas, maxVal) {
        var myChart = echarts.init(els.laa.get(0));
        var option = {
            title: {
                text: '各地中奖数量分布图',
                x: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            //legend: {
            //    orient: 'vertical',
            //    x:'left',
            //    data:['中奖数量']
            //},
            dataRange: {
                min: 0,
                max: maxVal,
                x: 'left',
                y: 'bottom',
                text: ['高', '低'],     // 文本，默认为数值文本
                calculable: true
            },
            toolbox: {
                show: false,
                orient: 'vertical',
                x: 'right',
                y: 'center',
                feature: {
                    mark: {show: true},
                    dataView: {show: true, readOnly: false},
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            roamController: {
                show: false,
                x: 'right',
                mapTypeControl: {
                    'china': true
                }
            },
            series: [
                {
                    name: '中奖数量',
                    type: 'map',
                    mapType: 'china',
                    selectedMode: 'single',  //添加点击事件 此处必须设置
                    roam: false,
                    itemStyle: {
                        normal: {label: {show: true}},
                        emphasis: {label: {show: true}}
                    },
                    data: datas
                }
            ]
        };
        var area = areaAna.cacheAreacode, areaname = "";
        if(areaAna.cacheAreacode.length > 0) {
            areaname = areaAna.cacheAreacode[0].name;
            areaAna.piedata.length = 0;
            var lottery = areaAna.cacheAreacode[0].lottery;
            $.each(lottery, function (i, datas) {
                areaAna.piedata.push({
                    name: datas.lotteryname,
                    y: datas.recnumber
                })
            });
            renderEachPrizeAreaChart(areaname + "地区各奖项", areaAna.piedata);
        }
        /**
         * 奖项为空，显示各省各奖项中奖信息，非空则显示各省该奖项对比情况
         */
        if(_currentPrize == "") {
            function eConsole(param) {
                areaAna.piedata.length = 0;
                var t = param.target, areacode = "";
                $.each(area, function (i, datas) {
                    if (datas.name == t) {
                        areacode = datas.areacode;
                        $.each(datas.lottery, function (_i, _datas) {
                            areaAna.piedata.push({
                                name: _datas.lotteryname,
                                y: _datas.recnumber
                            })
                        })
                    }
                });
                renderEachPrizeAreaChart(t + "地区各奖项", areaAna.piedata);
            }
            myChart.on(echarts.config.EVENT.MAP_SELECTED, eConsole);
        }else {
            var _pieData = [], _d = areaAna.cacheAreacode, maxNum = [];
            $.each(_d, function(i, datas) {
                _pieData.push({
                    name: datas.name,
                    y: datas.num
                });
                maxNum.push(datas.num);
            });
            renderEachPrizeAreaChart("全国各省"+ _currenPrizeCH, _pieData);
        }
        myChart.setOption(option);
    }
    /**
     * 地区各奖项占比分析
     * @param area 地区名
     * @param datas 中奖信息数组
     */
    function renderEachPrizeAreaChart(area, datas) {
        els.eapa.highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            credits: {
                enabled: false
            },
            title: {
                text: area + '占比分析'
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
            },
            legend: {
                labelFormatter: function () {
                    return this.name + '(' + this.percentage.toFixed(2) + '%)';//在名称后面追加百分比数据
                }
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            series: [{
                type: 'pie',
                name: '区域中奖占比',
                data: datas
            }]
        });
    }
    /**
     * 初始化中奖时间分析
     */
    function initLotteryDateChart(_currentActivity, areacode, begtime, endtime, lotteryid, grouptype) {
        dateAna.xArr.length = 0;
        dateAna.yNumDatas.length = 0;
        dateAna.yMoneyDatas.length = 0;
        $(document.body).action({
            url: "analyze/lotterydate",
            data: {
                id: _currentActivity,
                areacode: areacode,
                begtime: begtime,
                endtime: endtime,
                lotteryid: lotteryid,
                grouptype: grouptype
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data;
            if(_d.info.length > 0) {
                if (grouptype == "months") {
                    $.each(_d.info, function (i, datas) {
                        var x = datas.y + "年" + datas.m + "月";
                        dateAna.xArr.push(x);
                        dateAna.yNumDatas.push(datas.num);
                        dateAna.yMoneyDatas.push(datas.recmoney);
                    });
                    dateAna.grouptype = "月";
                } else {
                    $.each(_d.info, function (i, datas) {
                        var x = datas.y + "年" + datas.m + "月" + datas.d + "日";
                        dateAna.xArr.push(x);
                        dateAna.yNumDatas.push(datas.num);
                        dateAna.yMoneyDatas.push(datas.recmoney);
                    });
                    dateAna.grouptype = "天";
                }
                renderLotteryDateChart(dateAna.grouptype, dateAna.xArr, dateAna.yNumDatas, dateAna.yMoneyDatas);
            }else {
                $(".lotteryDateAnalysis").empty().append(noDataHtml);
                noData[2] = true;
            }
        }
        function onFalied(e) {
            console.log(e);
        }
    }
    /**
     * 中奖时间分析
     * @param grouptype 按月/天分析
     * @param xArr X轴坐标
     * @param yNumDatas 数量数组
     * @param yMoneyDatas 金额数组
     */
    function renderLotteryDateChart(grouptype, xArr, yNumDatas, yMoneyDatas) {
        els.lda.highcharts({
            chart: {
                type: 'spline'
            },
            credits: {
                enabled: false
            },
            title: {
                text: '中奖时间分析'
            },
            //subtitle: {
            //    text: '（按' + grouptype + '分析）'
            //},
            xAxis: {
                categories: xArr
            },
            yAxis: {
                min: 0,
                title: {
                    text: '总数'
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
                color: "#F3A43B",
                data: yNumDatas

            }, {
                name: '金额',
                color: "#60C0DD",
                data: yMoneyDatas
            }]
        })
    }
    /**
     * 单人抽奖次数分析
     */
    function initEachDrawChart(_currentActivity, areacode, lotteryid, begtime, endtime, topnumber) {
        $(document.body).action({
            url: "analyze/lotterytimes",
            data: {
                id: _currentActivity,
                areacode: areacode,
                begtime: begtime,
                endtime: endtime,
                lotteryid: lotteryid,
                topnumber: topnumber
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data.info;
            if(_d.length > 0) {
                $.each(_d, function (i, datas) {
                    timesAna.xDatas.push(datas.nickname);
                    timesAna.yMoneyDatas.push(datas.recnumber);
                    timesAna.yTimeDatas.push(datas.recmoney);
                });
                renderEachDrawChart(timesAna.xDatas, timesAna.yMoneyDatas, timesAna.yTimeDatas);
            }else {
                $(".eachDrawAnalysis").empty().append(noDataHtml);
                noData[3] = true;
            }
        }
        function onFalied(e) {
            console.log(e);
        }
    }
    /**
     * 渲染单人抽奖次数分析
     */
    function renderEachDrawChart(xDatas, yMoneyDatas, yTimeDatas) {
        els.eda.highcharts({
            chart: {
                type: 'column'
            },
            credits: {
                enabled: false
            },
            title: {
                text: '单人抽奖次数分析'
            },
            xAxis: {
                categories: xDatas
            },
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value}次',
                    style: {
                        color: '#E87C25'
                    }
                },
                title: {
                    text: '抽奖次数',
                    style: {
                        color: '#E87C25'
                    }
                }
            }, { // Secondary yAxis
                title: {
                    text: '中奖金额',
                    style: {
                        color: '#27727B'
                    }
                },
                labels: {
                    format: '{value} 元',
                    style: {
                        color: '#27727B'
                    }
                },
                opposite: true
            }],
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
                name: '抽奖次数',
                color: '#E87C25',
                yAxis: 1,
                data: yTimeDatas

            }, {
                name: '中奖金额',
                color: '#27727B',
                data: yMoneyDatas

            }]
        });
    }

    /**
     * 选择奖项完成时
     */
    function onPrizeChanged() {
        var currentPop = popup.config.current,
            currentBtn = popup.config.source;
        _currentPrize = $(currentBtn).cval();
        _currenPrizeCH = $(currentBtn).html();
    }
    /**
     * 初始化奖项
     */
    function initPrize() {
        $(document.body).action({
            url: "analyze/lotterylist",
            data: {
                projectid: _currentActivity
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data, btnHtml = '<button value="">全部</button>';
            $.each(_d, function(i, datas) {
                btnHtml += '<button value="{0}">{1}</button>'.format(datas.lotteryid, datas.name);
            });
            els.cprizePop.append(btnHtml);
        }
        function onFalied(e) {
            console.log(e);
        }
    }
    function init() {
        if (!loaded) {
            $(document.body).on("click", "button", onButtonClicked);
            els.act.on("click", "> button", chooseActivity);
            els.ulItem.bind("change", onAnlaysisItemsChanged);
            els.cprizePop.bind("closed", onPrizeChanged);
            initActivityList();
            els.st.cval(startTime);
            els.et.cval(Now);
            /**
             * 检查开始、结束时间
             * @param v
             * @param source
             */
            checkEndTime = function (v, source) {
                var begtime = source.parent().prev().children("button"), begtimeVal = begtime.cval();
                if (v < begtimeVal) {
                    begtime.cval(v);
                    source.cval(begtimeVal);
                }
            };
            checkBeginTime = function (v, source) {
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