/**
 * Created by fdr08 on 2015/11/30.
 */
var checkBeginTime, checkEndTime;
define(function () {
    var module = {}, loaded = false, _currentActivity = "", _currentSelect = "", _currentPrize = "", _currenPrizeCH = "", activitiesList = [], selectList = [];
    var _t = new Date();
    var Now = _t.getFullYear() + "-" + ((_t.getMonth()+1)>9?(_t.getMonth()+1):"0"+(_t.getMonth()+1)) + "-" + (_t.getDate()>9?_t.getDate():"0"+_t.getDate()), startTime = "2015-11-01";
    /**
     * 各标签数据是否初始化
     * @type {boolean[]}
     */
    var isInit = [false, false, false, false];
    /**
     * 缓存各标签页数据
     * @type {{tabelData: Array, pieData: Array, sumData: Array, desc: string, name: string}}
     */
    var progress = {
        tabelData: [],
        pieData: [],
        sumData: [],
        desc: "",
        name: ""
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
        maxVal: "",
        maptype: ""
    },
    cacheGlobalData = {
        firstInit: false,
        mapdata: [],
        piedata: [],
        maxVal: 0
    };
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
        cprizePop: $("#choosePrize"),
        pp: $(".prizeprogress")
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
    var noData = [false, false, false, false];
    //pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>'
    /**
     * 初始化活动列表
     */
    function initActivityList() {
        var activities = [], actHtml = '';
        els.act.action("project/prolist").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data;
            $.each(_d, function(i, datas) {
                if(datas.type == "redpacket") {
                    activities.push(datas);
                }
            });
            var btn = '';
            if (activities.length > 0) {
                for (var i = 0, len = activities.length; i < len; i++) {
                    if(activities[i].name.length >　10) {
                        btn = '<div class="horizontalFlexBox"><div class="cell checkboxcell" data-column="c0" tabindex="1" style="width: 36px;"><input class="labelLinkCheckbox" type="checkbox" id="{1}"><label for="{1}"></label></div><button title="{0}" value="{1}">{2}</button></div>'.format(activities[i].name, activities[i].projectid, activities[i].name.length >　8?activities[i].name.slice(0,8) + "...": activities[i].name);
                    }else {
                        btn = '<div class="horizontalFlexBox"><div class="cell checkboxcell" data-column="c0" tabindex="1" style="width: 36px;"><input class="labelLinkCheckbox" type="checkbox" id="{0}"><label for="{0}"></label></div><button title="{0}" value="{0}">{1}</button></div>'.format(activities[i].projectid, activities[i].name);
                    }
                    actHtml += btn;
                }
            } else {
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
            els.act.append(actHtml);
            $(".activities > .spinnerLoader").remove();
            var ft = els.act.children("div").first();
            ft.find("input").prop("checked", true);
            ft.find("button").addClass("activityClicked");
            $.each(activities, function (i, datas) {
                activitiesList.push(activities[i].projectid);
            });
            _currentActivity = els.act.children("div").find(".activityClicked").val();
            getURLParam();
        }
        function onFalied(e) {
            console.log(e);
            els.ulItem.children("li:first").trigger("click");
            els.pp.html(sweetTips.format(e.message));
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
            var temp = [];
            temp.push(whichActivity);
            _currentActivity = temp;
            initPrize(_currentActivity);
            if (_isInArr >= 0) {
                _currentSelect = whatAnalysis;
            }
            els.act.find("button[value=" + _currentActivity[0] + "]").trigger("click");
        } else {
            //initPrize(_currentActivity);
            els.act.find("button[value=" + activitiesList[0] + "]").trigger("click");
        }
    }
    /**
     * 切换活动
     */
    function chooseActivity() {
        var isCheckBox = $(this).hasClass("labelLinkCheckbox"), actArr = [];
        if(isCheckBox) {
            var isChecked = $(this).prop("checked");
            if(!isChecked) {
                $(this).parent().siblings("button").removeClass("activityClicked");
            }else {
                $(this).parent().siblings("button").addClass("activityClicked");
                //$(this).prop("checked", true);
            }
            var t = els.act.find(".activityClicked");
            $.each(t, function(i, d) {
                actArr.push(d.value);
            })
        }else {
            $(this).addClass("activityClicked");
            $(this).siblings("div").find("input").prop("checked", true);
            $(this).parent().siblings("div").children("button").removeClass("activityClicked");
            $(this).parent().siblings("div").find("input").prop("checked", false);
            actArr.push($(this).val());
        }
        _currentActivity = actArr;
       isInit = [false, false, false, false];
        /**
         * 获取活动进度信息(该版本暂时隐藏)
         */
        //getacprogress(_currentActivity);
        if (_currentSelect) {
            els.ulItem.children("li[value=" + _currentSelect + "]").trigger("click", true);
        } else {
            els.ulItem.children("li:first").trigger("click");
        }
    }
    /**
     * 初始化奖项
     */
    function initPrize(_currentActivity) {
        els.cprize.action({
            url: "analyze/lotterylist",
            data: {
                projectid: JSON.stringify(_currentActivity)
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data, btnHtml = '<button value="">全部</button>';
            $.each(_d, function(i, datas) {
                btnHtml += '<button value="{0}">{1}</button>'.format(datas.price, datas.name);
            });
            els.cprizePop.empty().append(btnHtml);
        }
        function onFalied(e) {
            console.log(e);
        }
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
     * 获取活动进度等信息
     * @param _currentActivity 问卷id
     */
    function getacprogress(_currentActivity) {
        $(".survey").action({
            url: "analyze/rqprogress",
            data: {
                id: _currentActivity
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            progress.sumData.length = 0;
            var _d = d.data;
            els.progress.animate({width: _d.lotteryprogress.toFixed(2) + "%"});
            els.percent.html(_d.lotteryprogress.toFixed(2) || 0);
            progress.sumData.push(_d.lotterymem, _d.lotterymoney, _d.lotterynum);
            els.person.html(progress.sumData[0] || 0);
            els.money.html(progress.sumData[1] || 0);
            els.num.html(progress.sumData[2] || 0);
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
    var _mt = "";
    function onAnlaysisItemsChanged(e, target) {
        switch (target.tag) {
            case "prizeAnalysis":
                if (isInit[0] == false) {
                    initPrize(_currentActivity);
                    initPrizeAreaChart(_currentActivity, "", startTime, Now);
                    isInit[0] = true;
                    noData[0] = false;
                } else {
                    if(noData[0]) {
                        var tempHtml = $('<div style="width: 100%;"></div>').append(noDataHtml);
                        $(".hasPrizeAnalysis").css({display: "none"});
                        $(".prizeDesc").css({display: "none"});
                        els.pp.append(tempHtml);
                    }else {
                        renderPrizeAreaChart(progress.tabelData, progress.pieData);
                    }
                }
                _currentSelect = "prizeAnalysis";
                firstClick = false;
                break;
            case "areaAnalysis":
                if (isInit[1] == false) {
                    initPrize(_currentActivity);
                    initLotteryAreaChart(_currentActivity, startTime, Now, "", "", "", "china");
                    isInit[1] = true;
                    noData[1] = false;
                } else {
                    if(noData[1]) {
                        var _tempHtml = $('<div style="width: 100%;"></div>').append(noDataHtml);
                        els.laa.css({display: "none"});
                        els.eapa.css({display: "none"});
                        $(".nodata").parent().remove();
                        $(".areaAnalysisBoard").append(_tempHtml);
                    }else {
                        if(_mt == "china" || _mt == "") _mt = "中国各";
                        renderEachPrizeAreaChart(_mt, cacheGlobalData.piedata);
                        renderLotteryAreaChart(cacheGlobalData.mapdata, cacheGlobalData.maxVal, "china", cacheBegtime, cacheEndtime, cachelotteryname, cachelotteryprice);
                    }
                }
                _currentSelect = "areaAnalysis";
                break;
            case "timeAnalysis":
                if (isInit[2] == false) {
                    initPrize(_currentActivity);
                    initLotteryDateChart(_currentActivity, "", startTime, Now, "", "", "months");
                    isInit[2] = true;
                    noData[2] = false;
                } else {
                    if(noData[2]) {
                        els.lda.empty().append(noDataHtml);
                    }else {
                        renderLotteryDateChart(dateAna.grouptype, dateAna.xArr, dateAna.yNumDatas, dateAna.yMoneyDatas);
                    }
                }
                _currentSelect = "timeAnalysis";
                firstClick = false;
                break;
            case "drawTimesAnalysis":
                if (isInit[3] == false) {
                    initPrize(_currentActivity);
                    timesAna.xDatas.length = 0;
                    timesAna.yMoneyDatas.length = 0;
                    timesAna.yTimeDatas.length = 0;
                    initEachDrawChart(_currentActivity, "", "", "", startTime, Now, "10");
                    isInit[3] = true;
                    noData[3] = false;
                } else {
                    if(noData[3]) {
                        els.eda.empty().append(noDataHtml);
                    }else {
                        renderEachDrawChart(timesAna.xDatas, timesAna.yMoneyDatas, timesAna.yTimeDatas)
                    }
                }
                _currentSelect = "drawTimesAnalysis";
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
                var t = $(e.currentTarget).parents(".editorGroup");
                var res = t.serializeForm();
                if (!res.hasError) {
                    if(res.result.areacode) {
                        els.areaInfo.cval(res.result.areacode);
                    }
                    if(res.result.start_time) {
                       els.st.cval(res.result.start_time);
                    }
                    if(res.result.end_time) {
                        els.et.cval(res.result.end_time);
                    }
                    if(res.result.dateOrTime) {
                        els.dt.cval(res.result.dateOrTime);
                    }
                    if(res.result.prize) {
                        els.cprize.cval(_currentPrize).html(_currenPrizeCH);
                    }
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
                        $(".prizeDesc").css({display: "block"});
                        $(".hasPrizeAnalysis").css({display: "block"});
                        $(".nodata").parent().remove();
                        initPrizeAreaChart(_currentActivity, _res.result.areacode, _res.result.start_time, _res.result.end_time);
                    } else if (_currentSelect == "areaAnalysis") {
                        isInit[1] = true;
                        noData[1] = false;
                        els.laa.css({display: "block"});
                        els.eapa.css({display: "block"});
                        $(".nodata").parent().remove();
                        initLotteryAreaChart(_currentActivity, _res.result.start_time, _res.result.end_time, "", _currenPrizeCH ==  "全部"?"":_currenPrizeCH, _currentPrize, "china", false ,true);
                    } else if (_currentSelect == "timeAnalysis") {
                        dateAna.grouptype = "";
                        dateAna.xArr.length = 0;
                        dateAna.yMoneyDatas.length = 0;
                        dateAna.yNumDatas.length = 0;
                        isInit[2] = true;
                        noData[2] = false;
                        els.lda.empty();
                        initLotteryDateChart(_currentActivity, _res.result.areacode, _res.result.start_time, _res.result.end_time, _currenPrizeCH ==  "全部"?"":_currenPrizeCH, _currentPrize, _res.result.dateOrTime);
                    } else if (_currentSelect == "drawTimesAnalysis") {
                        timesAna.xDatas.length = 0;
                        timesAna.yMoneyDatas.length = 0;
                        timesAna.yTimeDatas.length = 0;
                        isInit[3] = true;
                        noData[3] = false;
                        initEachDrawChart(_currentActivity, _res.result.areacode, _currenPrizeCH ==  "全部"?"":_currenPrizeCH, _currentPrize, _res.result.start_time, _res.result.end_time, _res.result.topNum);
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
        progress.desc = "";
        els.pp.action({
            url: "analyze/lotteryanalyinfo",
            data: {
                id: JSON.stringify(_currentActivity),
                areacode: areacode,
                begtime: begtime,
                endtime: endtime
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data,_info = _d.lotteryinfo, _analysis = _d.lotteryanaly;
            //progress.name = _d.projectinfo.name;
            //var rand = parseInt( Math.random()*10) + 70;
            //if(_d.projectinfo.description.length > 70){
            //    progress.desc = _d.projectinfo.description.slice(0, rand) + " ......";
            //}else{
            //    progress.desc = _d.projectinfo.description;
            //}
            //$(".desc > .tit").html("活动名称：" + progress.name);
            //$(".desc > .txt").html("活动描述：" + progress.desc);
            if(_analysis.length > 0){
                $(".hasPrizeAnalysis").css({display: "block"});
                $(".prizeDesc").css({display: "block"});
                $.each(_analysis, function (i, datas) {
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
                $(".prizeDesc").css({display: "none"});
                els.pp.append(tempHtml);
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
    var firstClick = false, provinceNoData = false, cachecountryPieData = [], cacheCountryDatas = [], cacheBegtime = "", cacheEndtime = "", cachelotteryname = "", cachelotteryprice = "";
    function initLotteryAreaChart(_currentActivity, begtime, endtime, areacode, lotteryname, lotteryprice, mt, add, isSerach) {
        cacheBegtime = begtime;
        cacheEndtime = endtime;
        cachelotteryname = lotteryname;
        cachelotteryprice = lotteryprice;
        areaAna.mapdata.length = 0;
        areaAna.piedata.length = 0;
        areaAna.maxVal = "";
        $(".areaAnalysisBoard").action({
            url: "analyze/lotteryarea",
            data: {
                id: JSON.stringify(_currentActivity),
                begtime: begtime,
                endtime: endtime,
                areacode: areacode,
                lotteryname: lotteryname,
                lotteryprice: lotteryprice
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data.info, temp = [];
            if(_d.length > 0) {
                $(".nodata").parent().remove();
                els.laa.css({display: "block"});
                els.eapa.css({display: "block"});
                if(!cacheGlobalData.firstInit) {
                    var _temp = [];
                    $.each(_d, function(i, datas) {
                        var name = datas.areaname,
                            num = datas.recnumber;
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
                        _temp.push(datas.recnumber);
                        areaAna.cacheAreacode.push({
                            name: name,
                            areacode: datas.newareacode

                        });
                    });
                    cacheGlobalData.maxVal = Math.max.apply(null, _temp);
                    cacheGlobalData.firstInit = true;
                }
                if(isSerach) {
                    cacheGlobalData.mapdata.length = 0;
                    cacheGlobalData.piedata.length = 0;
                    var _temp = [];
                    $.each(_d, function(i, datas) {
                        var name = datas.areaname,
                            num = datas.recnumber;
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
                        _temp.push(datas.recnumber);
                        areaAna.cacheAreacode.push({
                            name: name,
                            areacode: datas.newareacode

                        });
                    });
                    cacheGlobalData.maxVal = Math.max.apply(null, _temp);
                }
                $.each(_d, function (i, datas) {
                    var name = datas.areaname;
                    if(!name) {
                        name = "未知";
                    }
                    areaAna.mapdata.push({
                        name: name,
                        value: datas.recnumber
                    });
                    areaAna.piedata.push([name, datas.recnumber]);
                    temp.push(datas.recnumber);
                });
                areaAna.maxVal = Math.max.apply(null, temp);
                renderEachPrizeAreaChart(mt == "china"?"中国各":mt, areaAna.piedata);
                renderLotteryAreaChart(areaAna.mapdata, areaAna.maxVal, mt, begtime, endtime, lotteryname, lotteryprice);
            }else {
                if(areacode == "000000000") {
                    renderEachPrizeAreaChart(mt == "china"?"全国各":mt, []);
                    renderLotteryAreaChart(areaAna.mapdata, areaAna.maxVal, mt, begtime, endtime, lotteryname, lotteryprice);
                }else {
                    var tempHtml = $('<div style="width: 100%;"></div>').append(noDataHtml);
                    $(".lotteryAreaAnalysis").css({display: "none"});
                    els.eapa.css({display: "none"});
                    $(".areaAnalysisBoard").append(tempHtml);
                    noData[1] = true;
                }
            }
        }
        function onFalied(e) {
            console.log(e);
            $(".areaAnalysisBoard") .html(sweetTips.format(e.message));
        }
    }
    function renderLotteryAreaChart(datas, maxVal, mt, begtime, endtime, lotteryname, lotteryprice) {
        var myChart = echarts.init(els.laa.get(0)),
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
                        areaAna.maptype = mt = i;
                        var areacode = "";
                        $.each(areaAna.cacheAreacode, function(i, code) {
                            if(code.name == mt) {
                                areacode = code.areacode;
                            }
                        });
                        if(firstClick) {
                            initLotteryAreaChart(_currentActivity, begtime, endtime, areacode, lotteryname, lotteryprice, "china", false);
                            firstClick = false;
                        }else {
                            if(areacode != "") {
                                initLotteryAreaChart(_currentActivity, begtime, endtime, areacode, lotteryname, lotteryprice, mt, true);
                            }else {
                                provinceNoData = true;
                                initLotteryAreaChart(_currentActivity, begtime, endtime, "000000000", lotteryname, lotteryprice, mt, true);
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
                text: area + '地区奖项占比分析'
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
    function initLotteryDateChart(_currentActivity, areacode, begtime, endtime, lotteryname, lotteryprice, grouptype) {
        dateAna.xArr.length = 0;
        dateAna.yNumDatas.length = 0;
        dateAna.yMoneyDatas.length = 0;
        els.lda.action({
            url: "analyze/lotterydate",
            data: {
                id: JSON.stringify(_currentActivity),
                areacode: areacode,
                begtime: begtime,
                endtime: endtime,
                lotteryname: lotteryname,
                lotteryprice: lotteryprice,
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
                els.lda.empty().append(noDataHtml);
                noData[2] = true;
            }
        }
        function onFalied(e) {
            console.log(e);
            els.lda.html(sweetTips.format(e.message));
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
            xAxis: {
                categories: xArr
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
                name: '中奖次数',
                color: "#F3A43B",
                data: yNumDatas

            }, {
                name: '中奖金额',
                color: "#60C0DD",
                yAxis: 1,
                data: yMoneyDatas
            }]
        })
    }
    /**
     * 单人抽奖次数分析
     */
    function initEachDrawChart(_currentActivity, areacode, lotteryname, lotteryprice, begtime, endtime, topnumber) {
        els.eda.action({
            url: "analyze/lotterytimes",
            data: {
                id: JSON.stringify(_currentActivity),
                areacode: areacode,
                begtime: begtime,
                endtime: endtime,
                lotteryname: lotteryname,
                lotteryprice: lotteryprice,
                topnumber: topnumber
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data.info;
            if(_d.length > 0) {
                $.each(_d, function (i, datas) {
                    timesAna.xDatas.push(datas.nickname);
                    timesAna.yMoneyDatas.push(datas.recmoney);
                    timesAna.yTimeDatas.push(datas.recnumber);
                });
                renderEachDrawChart(timesAna.xDatas, timesAna.yMoneyDatas, timesAna.yTimeDatas);
            }else {
                els.eda.empty().append(noDataHtml);
                noData[3] = true;
            }
        }
        function onFalied(e) {
            console.log(e);
            els.eda.html(sweetTips.format(e.message));
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
                data: yTimeDatas

            }, {
                yAxis: 1,
                name: '中奖金额',
                color: '#27727B',
                data: yMoneyDatas

            }]
        });
    }
    function init() {
        if (!loaded) {
            $(document.body).on("click", "button", onButtonClicked);
            els.act.on("click", "button, input", chooseActivity);
            els.ulItem.bind("change", onAnlaysisItemsChanged);
            els.cprizePop.bind("closed", onPrizeChanged);
            account.sign.listen("logged", initActivityList);
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