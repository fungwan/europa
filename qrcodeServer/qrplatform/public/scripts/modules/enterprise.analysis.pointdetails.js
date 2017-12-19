/**
 * Created by fdr on 2016/1/18.
 */
var checkBeginTime, checkEndTime;
define(function() {
    var module = {}, loaded = false, _currentActivity = "";
    var _t = new Date();
    var Now = _t.getFullYear() + "-" + ((_t.getMonth()+1)>9?(_t.getMonth()+1):"0"+(_t.getMonth()+1)) + "-" + (_t.getDate()>9?_t.getDate():"0"+_t.getDate()),
        initStartTime = "2015-11-01";
    var els = {
        st: $(".startTime"),
        et: $(".endTime"),
        act: $(".activities"),
        pl: $(".pointList"),
        maxp: $("#maxPoint"),
        minp: $("#minxPoint")
    }, globalData = {
        startTime: "",
        stopTime: "",
        areacode: "",
        keywords: ""
    };
    /**
     * 设置积分列表配置，及填充数据
     * @param actId 积分活动id
     * @param areacode 区域代码
     * @param begtime 开始时间
     * @param endtime 结束时间
     * @param keywords 关键字
     * @param minPoint 最小积分
     * @param maxPoint 最大积分
     */
    function initList(actId, areacode, begtime, endtime, keywords, minPoint, maxPoint) {
        els.pl.datagrid({
            idField: "recid",
            selectCell: false,
            uri: "point/pointdetails",
            pagination: {
                pageSize: 50
            },
            data: {
                count: 0, //总数据量
                empty: "<i data-lang='message.error.nodata'></i>", //列数据时显示的提示文本
                collectionName: "data.details" //用于存储数据内容的集合名称
            }, //数据相关
            params: {
                "projectid": actId,
                "areacode": areacode,
                "begtime": begtime,
                "endtime": endtime,
                "keywords": keywords,
                "minPoint": minPoint,
                "maxPoint": maxPoint
            },
            columns: [
                //{checkbox: true},
                {
                    field: "nickname",
                    caption: "昵称",
                    width: 160,
                    sortable: true,
                    sort: "asc"
                },
                {
                    field: "address",
                    caption: "所在区域",
                    width: 200,
                    sortable: true
                },
                {
                    field: "projectname",
                    caption: "活动名称",
                    width: 160,
                    sortable: true
                },
                {
                    field: "point",
                    caption: "积分",
                    width: 120,
                    sortable: true
                },
                {
                    field: "pointtime",
                    caption: "时间",
                    width: 160,
                    sortable: true
                }
            ]
        });
    }

    /**
     * 初始化活动列表并初始化第一个活动积分列表
     */
    function initActivityList() {
        var activities = [], actHtml = "";
        els.act.action("project/prolist").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data;
            $.each(_d, function(i, datas) {
                if(datas.type == "point") {
                    activities.push(datas);
                }
            });
            var btn = '';
            if (activities.length > 0) {
                for (var i = 0, len = activities.length; i < len; i++) {
                    if(activities[i].name.length >　10) {
                        btn = "<button title='{0}' value='{1}'>{2}</button>".format(activities[i].name, activities[i].projectid,
                            activities[i].name.length >　8?activities[i].name.slice(0,8) + "...": activities[i].name);
                    }else {
                        btn = "<button value='{0}'>{1}</button>".format(activities[i].projectid, activities[i].name);
                    }
                    actHtml += btn;
                }
            } else {
                var temp = '<div class="sleepman">'+
                    '<div class="head sleep">'+
                    '<div class="eye"></div>'+
                    '</div>'+
                    '<div class="body">'+
                    '<div class="l_leg"></div>'+
                    '<div class="r_leg"></div>'+
                    '</div>'+
                    '</div>';
                $(".editorSet").css({display: "none"});
                $(".lottery.content").css({display: "none"});
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
            _currentActivity = els.act.children(".activityClicked").val();
            initList(_currentActivity, "", initStartTime, Now, "", "", "");
        }
        function onFalied(e) {
            console.log(e);
            els.ulItem.children("li:first").trigger("click");
        }
    }

    /**
     * 切换活动
     */
    function chooseActivity() {
        $(this).addClass("activityClicked").siblings("button").removeClass("activityClicked");
        _currentActivity = $(this).val();
        initList(_currentActivity, globalData.areacode || "" , globalData.startTime || initStartTime , globalData.stopTime || Now, globalData.keywords || "");
    }

    /**
     * 页面按钮点击事件
     * @param e
     * @returns {boolean}
     */
    function onButtonClicked(e) {
        switch ($(e.currentTarget).val()) {
            case "search":
                var _t = $(e.currentTarget).parents(".editorGroup");
                var _res = _t.serializeForm();
                checkEndTime;
                checkEndTime;
                if (_res.hasError) {

                }else {
                    //globalData.startTime = _res.result.start_time;
                    //globalData.stopTime = _res.result.end_time;
                    //globalData.areacode = _res.result.areacode;
                    //globalData.keywords = _res.result.keywords;
                    //globalData.keywords = _res.result.minPoint;
                    //globalData.keywords = _res.result.maxpoint;
                    initList(_currentActivity, _res.result.areacode, _res.result.start_time, _res.result.end_time, _res.result.keywords, _res.result.minPoint, _res.result.maxPoint);
                }
                break;
        }
        return false;
    }

    /**
     * 积分输入框失去焦点，改变输入框最大最小值
     * @param e
     */
    function minPointBlur(e) {
        var v = Math.abs($(this).val());
        $(this).val(v);
        els.maxp.attr("min", v);
    }
    function maxPointBlur(e) {
        var v = Math.abs($(this).val());
        $(this).val(v);
        els.minp.attr("max", v).attr("min", 0);
    }
    function init() {
        if (!loaded) {
            initActivityList();
            els.act.on("click", "> button", chooseActivity);
            $(document.body).on("click", "button", onButtonClicked);
            els.minp.on("blur", minPointBlur);
            els.maxp.on("blur", maxPointBlur);
            els.st.cval(initStartTime);
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