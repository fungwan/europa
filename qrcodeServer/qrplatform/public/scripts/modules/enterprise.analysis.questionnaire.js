/**
 * Created by fdr08 on 2015/11/30.
 */
var checkBeginTime, checkEndTime;
define(function() {
    var module = {}, loaded = false, _currentActivity = "", _currentSelect, activitiesList = [], selectList = [], Xarr = [], Yarr = [];
    var _t = new Date();
    var Now = _t.getFullYear() + "-" + ((_t.getMonth()+1)>9?(_t.getMonth()+1):"0"+(_t.getMonth()+1)) + "-" + (_t.getDate()>9?_t.getDate():"0"+_t.getDate()),
        startTime = "2015-11-01";
    /**
     * 各标签数据是否初始化
     * @type {boolean[]}
     */
    var isInit = [false, false, false];
    /**
     * 缓存各标签页数据
     * @type {{areacode: Array, mapdata: Array, pieData: Array, maxVal: number, maptype: string}}
     */
    var cachedatas = {
        areacode: [],
        mapdata: [],
        pieData: [],
        maxVal: 0,
        maptype: ""
    },answersDatas = {
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
    /**
     * 各标签是否出现无数据状态，切换保持无数据状态
     * @type {boolean[]}
     */
    var noData = [false, false, false];
    /**
     * 初始化活动列表
     */
    function initActivityList() {
        var activities = [], actHtml = "";
       els.act.action("project/prolist").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data;
            $.each(_d, function(i, datas) {
                if(datas.type == "question") {
                    activities.push(datas);
                }
            });
            var btn = "";
            if(activities.length > 0) {
                for (var i = 0, len = activities.length; i < len; i++) {
                    if(activities[i].name.length >　10) {
                        btn = "<button title='{0}' value='{1}'>{2}</button>".format(activities[i].name, activities[i].projectid,
                            activities[i].name.length >　8?activities[i].name.slice(0,8) + "...": activities[i].name);
                    }else {
                        btn = "<button value='{0}'>{1}</button>".format(activities[i].projectid, activities[i].name);
                    }
                    actHtml += btn;
                }
            }else {
                //btn = "<button value=''>暂无活动！</button>";
                //actHtml += btn;
                var temp = '<div class="sleepman">'+
                    '<div class="head sleep">'+
                    '<div class="eye"></div>'+
                    '</div>'+
                    '<div class="body">'+
                    '<div class="l_leg"></div>'+
                    '<div class="r_leg"></div>'+
                    '</div>'+
                    '</div>';
                $(".quesNoAct").css({display: "block"}).append(temp);
                $("div.head").removeClass("sleep").toggleClass("happy");
                $("div.l_leg").addClass("llegAni");
                $("div.r_leg").addClass("rlegAni");

                $(".goCreateAct").on("click", function(e) {
                    window.location.href = "/enterprise/solution.detail.html"
                });
                return;
            }
            els.act.append(actHtml).children("button").first().addClass("activityClicked");
            $.each(activities, function(i, datas) {
                activitiesList.push(activities[i].projectid);
            });
            _currentActivity = els.act.children(".activityClicked").val();
            getURLParam();
        }
        function onFalied(e) {
            console.log(e);
            els.ulItem.children("li:first").trigger("click");
            els.qan.html(sweetTips.format(e.message));
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
        $(".survey").action({
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
    var _mt = "", cacheCountryPieData = [];
    function onAnlaysisItemsChanged(e, target) {
        switch(target.tag) {
            case "questionnaireAnalysis":
                if(isInit[0] == false) {
                    initQuestionnaireAnswerMap(_currentActivity, startTime, Now, "", "china", false);
                    isInit[0] = true;
                }else {
                    if(noData[0]) {
                        var tempHtml = $('<div style="width: 100%;"></div>').append(noDataHtml);
                        els.rab.css({display: "none"});
                        els.aaa.css({display: "none"});
                        els.qan.append(tempHtml);
                    }else {
                        renderQuestionnaireAnswerMap(cacheGlobalData.maxVal, cacheGlobalData.mapdata, "china", cacheBegtime, cacheEndtime);
                        renderAnswerAreaChart(cacheGlobalData.piedata, _mt == "china"?"全国各":_mt);
                    }
                }
                if(isInit[1] == false) {
                    Xarr.length = 0;
                    Yarr.length = 0;
                    initAnswerIncreaseAnalysis(_currentActivity, "", startTime, Now, "months");
                    isInit[1] = true;
                }else {
                    if(noData[1]) {
                        els.aia.empty().append(noDataHtml);
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
                        var tempHtml = $('<div class="tempHtml" style="width: 100%;"></div>').append(noDataHtml);
                        els.aBoard.empty().append(tempHtml);
                    }else {
                        var len = answersDatas.checkedItem.length;
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
                checkEndTime;
                checkEndTime;
                var _t = $(e.currentTarget).parents(".editorGroup");
                var _res = _t.serializeForm();
                if (!_res.hasError){
                    if(_currentSelect == "questionnaireAnalysis") {
                        isInit[0] = true;
                        noData[0] = false;
                        noData[1] = false;els.rab.css({display: "block"});
                        els.aaa.css({display: "block"});
                        initQuestionnaireAnswerMap(_currentActivity, _res.result.start_time, _res.result.end_time, "", "china", false, true);
                    }else if(_currentSelect == "answersAnalysis") {
                        isInit[2] = true;
                        noData[2] = false;
                        var len = answersDatas.checkedItem.length;
                        if(len > 0) {
                            initQuestionBoard(_currentActivity, _res.result.areacode, _res.result.start_time, _res.result.end_time, answersDatas.checkedItem);
                        }else {
                            var tempHtml = $('<div class="tempHtml" style="width: 100%;"></div>').append(noDataHtml);
                            els.aBoard.empty().append(tempHtml);
                        }
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
    var firstClick = false, provinceNoData = false, cacheBegtime = "", cacheEndtime = "",
    cacheGlobalData = {
        firstInit: false,
        maxVal: 0,
        mapdata: [],
        piedata: []
    };
    function initQuestionnaireAnswerMap(_currentActivity, begtime, endtime, areacode, mt, add, isSearch) {
        cacheBegtime = begtime;
        cacheEndtime = endtime;
        cachedatas.maxVal = 0;
        cachedatas.mapdata.length = 0;
        cachedatas.pieData.length = 0;
        cachedatas.areacode.length = 0;
        els.rab.action({
            url: "analyze/qaanalyze",
            data: {
                id: _currentActivity,
                begtime: begtime,
                endtime: endtime,
                areacode: areacode
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var num = [], emptyObj = $.isEmptyObject(d.data);
            if(emptyObj) {
                if(areacode != "000000000") {
                    var tempHtml = $('<div class="tempHtml" style="width: 100%;"></div>').append(noDataHtml);
                    els.aaa.css({display: "none"});
                    els.rab.css({display: "none"});
                    els.qan.append(tempHtml);
                    noData[0] = true;
                }else {
                    renderAnswerAreaChart([], mt == "china"?"全国各":mt);
                    renderQuestionnaireAnswerMap(cachedatas.maxVal, cachedatas.mapdata, mt, begtime, endtime);
                }
            }else {
                noData[0] = false;
                els.rab.css({display: "block"});
                els.aaa.css({display: "block"});
                var _d = d.data.areainfo;
                if(_d && _d.length > 0) {
                    if(!cacheGlobalData.firstInit) {
                        var temp = [];
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
                            cacheGlobalData.piedata.push({
                                name: name,
                                y: num
                            });
                            temp.push(num);
                        });
                        cacheGlobalData.maxVal = Math.max.apply(null, temp);
                        cacheGlobalData.firstInit = true;
                    }
                    if(isSearch) {
                        cacheGlobalData.mapdata.length = 0;
                        cacheGlobalData.piedata.length = 0;
                        var temp = [];
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
                            cacheGlobalData.piedata.push({
                                name: name,
                                y: num
                            });
                            temp.push(num);
                        });
                        cacheGlobalData.maxVal = Math.max.apply(null, temp);
                        cacheGlobalData.firstInit = true;
                    }
                    var numArr = [];
                    $.each(_d, function(i, datas) {
                        var name = datas.areaname,
                            num = parseInt(datas.num);
                        if(!name) {
                            name = "未知";
                        }
                        cachedatas.areacode.push({
                            name: name,
                            areacode: datas.newareacode
                        });
                        cachedatas.mapdata.push({
                            name: name,
                            value: num
                        });
                        cachedatas.pieData.push({
                            name: name, y: num
                        });
                        cacheCountryPieData.push({
                            name: name, y: num
                        });
                        numArr.push(num);

                    });
                    cachedatas.maxVal = Math.max.apply(null, numArr);
                    renderAnswerAreaChart(cachedatas.pieData, mt == "china"?"全国各":mt);
                    renderQuestionnaireAnswerMap(cachedatas.maxVal, cachedatas.mapdata, mt, begtime, endtime);
                }else {
                    var tempHtml = $('<div class="tempHtml" style="width: 100%;"></div>').append(noDataHtml);
                    els.aaa.css({display: "none"});
                    els.rab.css({display: "none"});
                    els.qan.append(tempHtml);
                    noData[0] = true;
                }
            }
        }
        function onFalied(e) {
            console.log(e);
        }
    }
    function renderQuestionnaireAnswerMap(maxVal, datas, mt, begtime, endtime) {
        var myChart = echarts.init(els.rab.get(0)),
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
                    data: datas
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
                        cachedatas.maptype = mt = i;
                        var areacode = "";
                        $.each(cachedatas.areacode, function(i, code) {
                            if(code.name == mt) {
                                areacode = code.areacode;
                            }
                        });
                        if(firstClick) {
                            initQuestionnaireAnswerMap(_currentActivity, begtime, endtime, "", "china", false);
                            firstClick = false;
                        }else {
                            if(areacode != "") {
                                initQuestionnaireAnswerMap(_currentActivity, begtime, endtime, areacode, mt, true);
                            }else {
                                provinceNoData = true;
                                initQuestionnaireAnswerMap(_currentActivity, begtime, endtime, "000000000", mt, true);
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
    function renderAnswerAreaChart(datas, mt) {
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
                text: mt + "地区问卷调查情况分析"
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
        els.aia.action({
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
            noData[1] = false;
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
                els.aia.empty().append(noDataHtml);
                noData[1] = true;
            }
        }
        function onFalied(e) {
            console.log(e);
            els.aBoard .html(sweetTips.format(e.message));
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
        $(".chooseTitle").action({
            url: "analyze/qalist",
            data: {
                id: _currentActivity
            }
        },"数据加载中...").then(onSuccessed, onFailed);
        function onSuccessed(d) {
            noData[2] = false;
            answersDatas.questionsList.length = 0;
            if(!d.data.length &&　d.data.length != 0) {
                answersDatas.questionsList = d.data.qalist;
                renderQuestionList(answersDatas.questionsList);
            }else {
                var tempHtml = $('<div class="tempHtml" style="width: 100%;"></div>').append(noDataHtml);
                els.aBoard.empty().append(tempHtml);
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
        answersDatas.checkedItem.length = 0;
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
        els.aBoard.action({
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
            var emptyArr = d.data.info.length;
            if(emptyArr == 0) {
                var tempHtml = $('<div class="tempHtml" style="width: 100%;"></div>').append(noDataHtml);
                els.aBoard.empty().append(tempHtml);
                noData[2] = true;
            }else {
                var len = answersDatas.checkedItem.length, _d = d.data.info, ql = answersDatas.questionsList;
                $.each(_d, function(i, q) {
                    $.each(ql, function(n, d) {
                        if(q.qaid == d.qaid) {
                            answersDatas.title.push(d.name);
                            answersDatas.answernumber.push(q.recmember);
                        }
                    });
                    $.each(_d, function(k, a) {
                        var temp = [];
                        $.each(a.answers, function(l, _a) {
                            temp.push({
                                name: _a.answermessage,
                                y:  _a.number
                            });
                        });
                        answersDatas.answers.push(temp);
                    });
                });
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
                text: "选择总量： "+ answernumber +""
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
            account.sign.listen("logged", initActivityList);
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