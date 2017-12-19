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
        cprizePop: $("#choosePrize"),
        ll: $(".lotteryList")
    }, globalData = {
        startTime: "",
        stopTime: "",
        areacode: "",
        prize: "",
        keywords: ""
    };

    /**
     * 设置积分列表配置，及填充数据
     * @param actId 红包活动id
     * @param areacode 区域代码
     * @param begtime 开始时间
     * @param endtime 结束时间
     * @param lotteryid 奖项id
     * @param state 红包领取状态
     * @param keywords 关键字
     */
    function initList(actId, areacode, begtime, endtime, lotteryid, state, keywords) {
        els.ll.datagrid({
            idField: "recid",
            selectCell: false,
            uri: "rp/lotterydetails",
            pagination: {
                pageSize: 50
            },
            data: {
                totalName: "data.count",
                count: 0, //总数据量
                empty: "<i data-lang='message.error.nodata'></i>", //列数据时显示的提示文本
                collectionName: "data.details" //用于存储数据内容的集合名称
            }, //数据相关
            params: {
                details: JSON.stringify({
                        "projectid": actId,
                        "areacode": areacode,
                        "begtime": begtime,
                        "endtime": endtime,
                        "lotteryid": lotteryid,
                        "state": state,
                        "keywords": keywords
                })
            },
            columns: [
                {checkbox: true},
                {
                    field: "nickname",
                    caption: "昵称",
                    width: 130,
                    sortable: true,
                    sort: "asc"
                },
                {
                    field: "address",
                    caption: "所在区域",
                    width: 160,
                    sortable: true
                },
                {
                    field: "phone",
                    caption: "联系方式",
                    width: 120,
                    sortable: true
                },
                {
                    field: "projectname",
                    caption: "活动名称",
                    width: 160,
                    sortable: true
                },
                {
                    field: "lotteryname",
                    caption: "奖项名称",
                    width: 150,
                    sortable: true
                },
                {
                    field: "price",
                    caption: "中奖金额（元）",
                    width: 120,
                    sortable: true
                },
                {
                    field: "rectime",
                    caption: "中奖时间",
                    width: 120,
                    sortable: true
                },
                {
                    field: "state",
                    caption: "领取状态",
                    width: 120,
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
        $(".activities").action("project/prolist").then(onSuccessed, onFalied);
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
            initList(_currentActivity, "", initStartTime, Now, "", "", "", 1);
            initPrize([_currentActivity]);
        }
        function onFalied(e) {
            console.log(e);
            els.ulItem.children("li:first").trigger("click");
        }
    }

    /**
     * 初始化活动奖项
     * @param _currentActivity 当前活动id
     */
    function initPrize(_currentActivity) {
        $(".choosePrize").action({
            url: "analyze/lotterylist",
            data: {
                projectid: JSON.stringify(_currentActivity)
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(d) {
            var _d = d.data, btnHtml = '<button value="">全部</button>';
            $.each(_d, function(i, datas) {
                btnHtml += '<button value="{0}">{1}</button>'.format(datas.lotteryid, datas.name);
            });
            els.cprizePop.empty().append(btnHtml);
        }
        function onFalied(e) {
            console.log(e);
        }
    }
    /**
     * 切换活动
     */
    function chooseActivity() {
        $(this).addClass("activityClicked").siblings("button").removeClass("activityClicked");
        _currentActivity = $(this).val();
        initList(_currentActivity, globalData.areacode || "", globalData.startTime || initStartTime, globalData.stopTime || Now, globalData.prize || "", globalData.state || "", globalData.keywords || "", 1);
        initPrize([_currentActivity]);
    }

    /**
     * 检查选择的用户时候满足重新发送红包条件
     */
    function checkUserState() {
        var recid = [],
            selected = els.ll.datagrid("getChecked");
        if(selected.length > 0) {
            $.each(selected, function(i, d) {
                if(d.state == "发送失败") {
                    recid.push(d.recid);
                }
            });
            if(recid.length == 0) {
                alert("只有红包领取状态为发送失败的用户方可重新派发，您所选择的用户状态不符，请重新选择！");
                return;
            }else {
                distributeprize(recid);
            }
        }else {
            alert("还未选择红包派发失败的记录！");
            return;
        }
    }

    /**
     * 手动派发红包
     */
    function distributeprize(recid) {
        $(".distribute").action({
            url: "rp/distributeprize",
            data: {
                "recid": JSON.stringify({
                    "recid": recid
                })
            }
        }, "数据加载中...").then(onSuccessed, onFalied);
        function onSuccessed(datas) {
            initList(_currentActivity, globalData.areacode || "", globalData.startTime || initStartTime, globalData.stopTime || Now, globalData.prize || "", globalData.state || "", globalData.keywords || "");
        }
        function onFalied(e) {
            console.log(e);
            var d = e.failed, temp = '';
            $.each(d, function(i, _d) {
                temp += _d + "，";
            });
            temp = "以下用户【" + temp.replace(/，$/, "") + "】红包派送出现了小意外，请尝试重新派发。";
            $(".noticeMessage").notice(false, temp);
        }
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
                    //globalData.prize = _res.result.prize;
                    initList(_currentActivity, _res.result.areacode, _res.result.start_time, _res.result.end_time, _res.result.prize, _res.result.state, _res.result.keywords);
                }
                break;
            case "distribute":
                checkUserState();
                break;
        }
        return false;
    }
    function init() {
        if (!loaded) {
            initActivityList();
            els.act.on("click", "> button", chooseActivity);
            $(document.body).on("click", "button", onButtonClicked);
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