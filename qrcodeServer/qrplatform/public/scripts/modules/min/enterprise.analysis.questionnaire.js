/**
 * Created by fdr08 on 2015/11/30.
 */
var checkBeginTime, checkEndTime;
define(function() {
    var module = {}, loaded = false, _currentActivity = "", _currentSelect, activitiesList = [], selectList = [], Xarr = [], Yarr = [];
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
    var isInit = [false, false, false];
    var cachedatas = {
        mapdata: [],
        pieData: [],
        maxVal: 0
    };
    var answersDatas = {
        questionsList: [],
        checkedItem: [],
        title: [],
        answernumber: [],
        answers: [],
        questionHtml: ""
    };
    var els = {
        st: $(".startTime"),
        et: $(".endTime"),
        fs: $(".finish"),
        all: $(".allScan"),
        increase: $(".increase"),
        num: $(".number"),
        percent: $(".percent"),
        progress: $(".progress-bar>span"),
        areaInfo: $(".area"),
        fl: $("#firstLevel"),
        sl: $("#secLevel"),
        tl: $("#thiLevel"),
        flb: $(".firseLevelBox"),
        slb: $(".secLevelBox"),
        tlb: $(".thiLevelBox"),
        aaa: $(".answerAnalysisBoard"),
        aia: $('.answerIncreaseAnalysis'),
        quesBox: $(".questions"),
        rab: $('.rstAnalysisBoard'),
        pab: $('.priceAnalysisBoard'),
        tab: $('.transAnalysisBoard'),
        act: $(".activities"),
        ulItem: $("#anlaysisItems"),
        aBoard: $(".answersBoard"),
        ct: $("#chooseTitle"),
        qan: $(".quesAreaNoData")
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
    var noData = [false, false, false];
    /**
     * 初始化活动列表
     */
    function initActivityList() {
        var activities = [], actHtml = "";
        $(document.body).action("project/prolist").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            activities = d.data;
            var btn = "";
            if(activities.length > 0) {
                for(var i = 0, len = activities.length; i < len; i++) {
                    btn = "<button value='{0}'>{1}</button>".format(activities[i].projectid, activities[i].name);
                    actHtml += btn;
                }
            }else {
                btn = "<button value=''>您还未开始活动！</button>";
                actHtml += btn;
            }
            els.act.append(actHtml).children().first().addClass("activityClicked");
            $.each(activities, function(i, datas) {
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
        $.each(selects, function(i, d) {
            selectList.push($(d).attr("value"));
        });
        var whichActivity = top.location.href.getParameter("id"),
            whatAnalysis = top.location.href.getParameter("analysis");
        var isInArr = $.inArray(whichActivity, activitiesList),
            _isInArr = $.inArray(whatAnalysis, selectList);
        if(isInArr >= 0) {
            _currentActivity = whichActivity;
            if(_isInArr >= 0) {
                _currentSelect = whatAnalysis;
            }
            els.act.children("button[value="+ _currentActivity +"]").trigger("click");
        }else {
            $("button[value="+ activitiesList[0] +"]").trigger("click");
        }
    }
    /**
     * 切换活动
     */
    function chooseActivity() {
        $(this).addClass("activityClicked").siblings("button").removeClass("activityClicked");
        _currentActivity = $(this).val();
        isInit = [false, false, false];
        /**
         * 获取活动进度信息
         */
        getquprogress(_currentActivity);
        if(_currentSelect) {
            els.ulItem.children("li[value="+ _currentSelect +"]").trigger("click", true);
        }else {
            els.ulItem.children("li:first").trigger("click");
        }
    }
    /**
     * 获取问卷调查进度等信息
     * @param qaid 问卷id
     */
    function getquprogress(qaid) {
        els.progress.css({width: "0%"});
        $(document.body).action({
            url: "analyze/qaprogress",
            data: {
                id: qaid
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data;
            els.fs.cval(_d.completion || 0);
            els.increase.cval(_d.newnumber || 0);
            els.num.html(_d.datanumber || 0);
            els.progress.animate({width: _d.completion + "%"});
            els.percent.html(_d.completion || 0);
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
    //var quIsInit = false;
    function onAnlaysisItemsChanged(e, target) {
        switch(target.tag) {
            case "questionnaireAnalysis":
                if(isInit[0] == false) {
                    initQuestionnaireAnswerMap(_currentActivity, startTime, Now);
                    isInit[0] = true;
                }else {
                    if(noData[0]) {
                        var tempHtml = $('<div style="width: 100%;"></div>').append(noDataHtml);
                        els.rab.css({display: "none"});
                        els.aaa.css({display: "none"});
                        els.qan.append(tempHtml);
                    }else {
                        renderQuestionnaireAnswerMap(cachedatas.maxVal, cachedatas.mapdata);
                    }
                }
                if(isInit[1] == false) {
                    Xarr.length = 0;
                    Yarr.length = 0;
                    initAnswerIncreaseAnalysis(_currentActivity, "", startTime, Now, "months");
                    isInit[1] = true;
                }else {
                    if(noData[1]) {
                        $(".answerIncreaseAnalysis").empty().append(noDataHtml);
                    }else {
                        renderAnswerIncreaseAnalysis(Xarr, Yarr);
                    }
                }
                _currentSelect = "questionnaireAnalysis";
                break;
            case "answersAnalysis":
                if(isInit[2] == false) {
                    initQestionList(_currentActivity);
                    isInit[2] = true;
                }else {
                    if(noData[2]) {
                        $(".answersBoard").empty().append(noDataHtml);
                    }else {
                        renderQuestionList(answersDatas.questionsList);
                    }
                }
                _currentSelect = "answersAnalysis";
                break;
            case "priceAnalysis":
                initPriceAnalysisBoard();
                break;
            case "transshipmentsAnalysis":
                initTransAnalysisBoard();
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
                if (!res.hasError){
                    els.areaInfo.cval(res.result.area);
                    els.st.cval(res.result.start_time);
                    els.et.cval(res.result.end_time);
                }
                break;
            case "search":
                checkEndTime;
                checkEndTime;
                var _t = $(e.currentTarget).parents(".editorGroup");
                var _res = _t.serializeForm();
                if (!_res.hasError){
                    if(_currentSelect == "questionnaireAnalysis") {
                        isInit[0] = true;
                        noData[0] = false;
                        noData[1] = false;
                        //var tempHtml = $('<div class="tempHtml" style="width: 100%;"></div>').append(noDataHtml);
                        els.rab.css({display: "block"});
                        els.aaa.css({display: "block"});
                        //els.qan.append(tempHtml);
                        initQuestionnaireAnswerMap(_currentActivity, _res.result.start_time, _res.result.end_time);
                    }else if(_currentSelect == "answersAnalysis") {
                        isInit[2] = true;
                        noData[2] = false;
                        //$(".answersBoard").empty().append(noDataHtml);
                        initQuestionBoard(_currentActivity, _res.result.areacode, _res.result.start_time, _res.result.end_time, answersDatas.checkedItem);
                    }
                }
                break;
            case "increasesearch":
                checkEndTime;
                checkEndTime;
                var __t = $(e.currentTarget).parents(".editorGroup");
                var __res = __t.serializeForm();
                if(!__res.hasError) {
                    Xarr.length = 0;
                    Yarr.length = 0;
                    isInit[1] = true;
                    noData[1] = false;
                    initAnswerIncreaseAnalysis(_currentActivity, __res.result.areacode,  __res.result.start_time, __res.result.end_time, __res.result.dateOrTime);
                }
                break;
        }
        return false;
    }
    /**
     * 选择分析题目完成时
     */
    function onQuestionChanged() {
        var currentPop = popup.config.current;
        var currentBtn = popup.config.source;
        var sum = $(currentPop).find(".checked").length;
        $(currentBtn).html("已选择：共" + sum + "题");
        var _q = els.quesBox.children(".questionItem");
        answersDatas.checkedItem.length = 0;
        $.each(_q, function(i, d) {
            var c = $(d).children("div.checked").length;
            if(c > 0) {
                answersDatas.checkedItem.push($(d).children().last().attr("id"));
            }
        })
    }
    /**
     * 选择分析题目添加样式
     */
    var checkBox = [];
    function onQuestionSelected() {
        var _index = $(this).index();
        if(!checkBox[_index]) {
            $(this).children(".checkBox").addClass("checked");
            checkBox[_index] = !checkBox[_index];
        }else {
            $(this).children(".checkBox").removeClass("checked");
            checkBox[_index] = !checkBox[_index];
        }
    }
    /**
     * 问卷调查全国区域分布图
     */
    function initQuestionnaireAnswerMap(_currentActivity, begtime, endtime) {
        cachedatas.maxVal = 0;
        cachedatas.mapdata.length = 0;
        cachedatas.pieData.length = 0;
        $(document.body).action({
            url: "analyze/qaanalyze",
            data: {
                id: _currentActivity,
                begtime: begtime,
                endtime: endtime
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var num = [], emptyObj = $.isEmptyObject(d.data);
            if(emptyObj) {
                var tempHtml = $('<div class="tempHtml" style="width: 100%;"></div>').append(noDataHtml);
                els.aaa.css({display: "none"});
                els.rab.css({display: "none"});
                els.qan.append(tempHtml);
                noData[0] = true;
            }else {
                els.rab.css({display: "block"});
                els.aaa.css({display: "block"});
                var _d = d.data.areainfo;
                if(_d.length > 0) {
                    $.each(_d, function(i, datas) {
                        var province = datas.province, numbers = datas.num;
                        cachedatas.mapdata.push({
                            name: province, value: numbers
                        });
                        cachedatas.pieData.push({
                            name: province, y: numbers
                        });
                        num.push(numbers);
                    });
                    cachedatas.maxVal = Math.max.apply(null, num);
                    renderAnswerAreaChart(cachedatas.pieData);
                    renderQuestionnaireAnswerMap(cachedatas.maxVal, cachedatas.mapdata);
                }
            }
        }
        function onFalied(e) {
            console.log(e);
        }
    }
    function renderQuestionnaireAnswerMap(maxVal, datas) {
        var myChart = echarts.init(els.rab.get(0));
        var  option = {
            title : {
                text: '问卷调查全国区域分布图',
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
                text:['高','低'],           // 文本，默认为数值文本
                calculable : true
            },
            series : [
                {
                    name: '访问量',
                    type: 'map',
                    mapType: 'china',
                    roam: false,
                    itemStyle:{
                        normal:{label:{show:true}},
                        emphasis:{label:{show:true}}
                    },
                    data: datas
                }
            ]
        };
        myChart.setOption(option);
    }
    function renderAnswerAreaChart(datas) {
        els.aaa.highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            credits: {
                enabled: false
            },
            title: {
                text: "各地区问卷调查情况分析"
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        color: '#000000',
                        connectorColor: '#000000',
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                    }
                }
            },
            series: [{
                type: 'pie',
                name: '访问量',
                data: datas
            }]
        });
    }
    /**
     * 每月答卷数量走势分析
     */
    function initAnswerIncreaseAnalysis(_currentActivity, areacode, begtime, endtime, grouptype) {
        $(document.body).action({
            url: "analyze/qaanalyzenum",
            data: {
                id: _currentActivity,
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
                        var x = datas.year + "年" + datas.month + "月" + datas.day + "日";
                        Xarr.push(x);
                        Yarr.push(datas.num);
                    });
                }else if(grouptype == "months"){
                    $.each(_d, function(i, datas) {
                        var x = datas.year + "年" + datas.month + "月";
                        Xarr.push(x);
                        Yarr.push(datas.num);
                    });
                }
                renderAnswerIncreaseAnalysis(Xarr, Yarr);
            }else {
                $(".answerIncreaseAnalysis").empty().append(noDataHtml);
                noData[1] = true;
            }
        }
        function onFalied(e) {
            console.log(e);
        }
    }
    function renderAnswerIncreaseAnalysis(increaseXarr, increaseYarr) {
        els.aia.highcharts({
            chart: {
                type: 'line'
            },
            credits: {
                enabled: false
            },
            title: {
                text: '每月答卷数量走势分析'
            },
            xAxis: {
                categories: increaseXarr
            },
            yAxis: {
                title: {
                    text: '每月问卷答卷数 (/份)'
                }
            },
            tooltip: {
                enabled: true,
                formatter: function() {
                    return '<b>'+ this.series.name +'</b><br/>'+this.x +': '+ this.y +'份';
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true
                    },
                    enableMouseTracking: false
                }
            },
            series: [{
                name: '答卷数量',
                color: "#F3A43B",
                data: increaseYarr
            }]
        });
    }
    /**
     * 初始化问题列表
     * @param _currentActivity 当前活动ID
     */
    function initQestionList(_currentActivity) {
        $(document.body).action({
            url: "analyze/qalist",
            data: {
                id: _currentActivity
            }
        },"数据加载中...").then(onSuccessed, onFailed);
        function onSuccessed(d) {
            answersDatas.questionsList.length = 0;
            if(!d.data.length &&　d.data.length != 0) {
                answersDatas.questionsList = d.data.qalist;
                renderQuestionList(answersDatas.questionsList);
            }else {
                var tempHtml = $('<div class="tempHtml" style="width: 100%;"></div>').append(noDataHtml);
                $(".answersBoard").empty().append(tempHtml);
                noData[2] = true;
            }
        }
        function onFailed(e) {
            console.log(e);
        }
    }

    /**
     * 渲染问题列表
     * @param questionsList
     */
    function renderQuestionList(questionsList) {
        var len = questionsList.length, quesHtml = "";
        $.each(questionsList, function(i, datas) {
            var type = datas.qatype;
            if(type != 3) {
                if(i <= 10) {
                    quesHtml +=  '<div class="horizontalFlexBox questionItem"><div class="checkBox checked"></div><div id="{0}" class="{1}"><span>{2}</span>.{3}</div></div>'.format(datas.qaid, "type_" + datas.qatype, datas.number, datas.name);
                    answersDatas.checkedItem.push(datas.qaid);
                }else {
                    quesHtml +=  '<div class="horizontalFlexBox questionItem"><div class="checkBox"></div><div id="{0}" class="{1}"><span>{2}</span>.{3}</div></div>'.format(datas.qaid, "type_" + datas.qatype, datas.number, datas.name);
                }
            }
        });
        els.quesBox.empty().append(quesHtml);
        initQuestionBoard(_currentActivity, "", startTime, Now, answersDatas.checkedItem);
    }
    /**
     * 问卷各题分析
     */
    function initQuestionBoard(_currentActivity, areacode, begtime, endtime, checkedItem) {
        answersDatas.answernumber.length = 0;
        answersDatas.answers.length = 0;
        answersDatas.title.length = 0;
        answersDatas.questionHtml = "";
        $(document.body).action({
            url: "analyze/answeranalyze",
            data: {
                "details": JSON.stringify({
                  "id": _currentActivity,
                  "areacode": areacode,
                  "begtime": begtime,
                  "endtime": endtime,
                  "questions": checkedItem
              })
            }
            }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var emptyObj = $.isEmptyObject(d.data);
            if(emptyObj) {
                var tempHtml = $('<div class="tempHtml" style="width: 100%;"></div>').append(noDataHtml);
                $(".answersBoard").empty().append(tempHtml);
                noData[2] = true;
            }else {
                var len = answersDatas.checkedItem.length, _d = d.data, ql = answersDatas.questionsList;
                for(var key in _d) {
                    $.each(ql, function(i, q) {
                        if(key == q.qaid) {
                            answersDatas.title.push(q.name);
                            answersDatas.answernumber.push(q.number);
                        }
                    });
                    var keys = key, ds = _d[keys], temp = [];
                    $.each(ds, function(_i, _datas) {
                        temp.push({
                            name: _datas.answer,
                            y: _datas.num
                        });
                    });
                    answersDatas.answers.push(temp);
                }
                for(var i = 0; i < len; i++) {
                    answersDatas.questionHtml += '<div class="analysisIndex question'+i+'Board"></div>';
                }
                els.aBoard.empty().append(answersDatas.questionHtml);
                for(var n = 0; n < len; n++) {
                    if(answersDatas.title[n] && (answersDatas.title[n] != "" || answersDatas.title[n] != undefined)) {
                        renderQuestionBoard($(".question"+ n +"Board"), answersDatas.title[n], answersDatas.answernumber[n], answersDatas.answers[n]);
                    }
                }
            }
        }
        function onFalied(e) {
            console.log(e);
        }
    }
    function renderQuestionBoard(target, title, answernumber, datas) {
        target.highcharts({
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            credits: {
                enabled: false
            },
            title: {
                text: title
            },
            subtitle: {
                text: "答题人数： "+ answernumber +""
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
            },
            legend: {
                labelFormatter: function () {
                    return this.name + '('+this.percentage.toFixed(2)+'%)';//在名称后面追加百分比数据
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
                name: '各回答占比',
                data: datas
            }]
        });
    }
    /**
     * 价格分析
     */
    function initPriceAnalysisBoard() {
        els.pab.highcharts({
            chart: {
                type: 'column'
            },
            credits: {
                enabled: false
            },
            title: {
                text: '销售价格分析'
            },
            xAxis: {
                categories: ['四川','北京','上海','广东','广西','云南','江西','湖北','西藏','新疆','内蒙古','其他']
            },
            yAxis: {
                min: 0,
                title: {
                    text: '价格（元）'
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
                name: '金额',
                color: "#64B2F7",
                data: [8360, 7808, 9805, 9304, 10600, 8405, 10500, 10403, 9102, 8305, 10606, 9203],
                dataLabels: {
                    enabled: true,
                    style: {
                        fontSize: '13px'
                    }
                }

            }]
        });
    }
    /**
     * 串货分析
     */
    function initTransAnalysisBoard() {
        els.tab.highcharts({
            chart: {
                type: 'column'
            },
            credits: {
                enabled: false
            },
            title: {
                text: '地区窜货分析'
            },
            xAxis: {
                categories: ['四川','北京','上海','广东','广西','云南','江西','湖北','西藏','新疆','内蒙古','其他']
            },
            yAxis: {
                min: 0,
                title: {
                    text: '数量'
                },
                stackLabels: {
                    enabled: true,
                    style: {
                        fontWeight: 'bold',
                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                    }
                }
            },
            legend: {
                align: 'right',
                x: -50,
                verticalAlign: 'top',
                y: 0,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColorSolid) || 'white',
                borderColor: '#CCC',
                borderWidth: 1,
                shadow: false
            },
            tooltip: {
                formatter: function() {
                    return '<b>'+ this.x +'</b><br/>'+
                        this.series.name +': '+ this.y +'<br/>'+
                        '总销量: '+ this.point.stackTotal;
                }
            },
            plotOptions: {
                column: {
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                        color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                    }
                }
            },
            series: [{
                name: '窜货',
                color: "#60C0DD",
                data: [3345, 2345, 7483, 8772, 7861, 3545, 5274, 4157, 2425, 2345,7054, 4557]
            },{
                name: '正常销售',
                color: "#F3A43B",
                data: [5425, 3174,6724, 5457, 2485, 3445, 2674, 4577, 2855, 3445,6744, 5457]
            }]
        });
    }
    function init() {
        if (!loaded) {
            $(document.body).on("click", "button", onButtonClicked);
            els.ulItem.bind("change", onAnlaysisItemsChanged);
            els.act.on("click", "> button", chooseActivity);
            els.quesBox.on("click", ".questionItem", onQuestionSelected);
            els.ct.bind("closed", onQuestionChanged);
            initActivityList();
            els.st.cval(startTime);
            els.et.cval(Now);
            //获取活动进度等信息
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