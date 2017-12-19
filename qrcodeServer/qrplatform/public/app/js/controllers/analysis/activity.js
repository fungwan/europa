// 活动
window.APP.controller("activityCtrl", ["$scope", "$http", "MessageService", "ValiService", function($scope, $http, MessageService, Vali) {
    $scope.items = [
        { title: "活动进度分析", src: "views/templates/analysis/activity.progress.html" },
        { title: "活动效果分析", src: "views/templates/analysis/activity.effctive.html" },
    ];
    $scope.queryCondition = {
        begtime: "",
        endtime: "",
        quarter: ""
    };
    var query = function() {
        $http({
            method: "POST",
            url: "/project/list",
            headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
            data: $.param({
                query: JSON.stringify({ "begdate": "", "enddate": "", "key": "", "state": "", "type": "" }),
                page: 1,
                size: 100
            })
        }).success(function(resp) {
            Vali.check(resp);
            if (resp.data && resp.data.data) {
                $scope.tableItems = resp.data.data;
            } else if (resp.error) {
                MessageService.error($scope, "查询失败！" + resp.error.message);
            }
        }).error(function(err) {
            MessageService.error($scope, "查询失败！");
        });
    };
    query();
    $scope.query = function() {
        query();
    };
    //广播事件
    $scope.selectActivity = function(item) {
        // $scope.$boardcast("selectActivity", .....);

        $scope.selectedItem = item;
        $scope.$broadcast("actitems", item);
    };
}]);

// 活动进度
window.APP.controller("activityProgressCtrl", ["$scope", "$http", "MessageService", "ValiService", function($scope, $http, MessageService, Vali) {

    var timme = new Date();
    timme.setMonth(0);
    timme.setDate(1);
    var tim = new Date();
    tim.setDate(tim.getDate() + 1);
    $scope.progress = {
        projectid: '',
        method: 'm',
        begtime: timme,
        endtime: tim
    };
    // TODO 过滤条件
    // TODO 查询
    // TODO 画图
    $scope.$on("actitems", function(event, data) {
        var proid = data.projectid;
        window.sessionStorage.setItem('piid', proid);
        // 基于准备好的dom，初始化echarts实例
        $scope.progress.projectid = proid;

        //console.log($scope.progress);
        $scope.drawpic();
    });
    $scope.initpro = function() {
        $scope.progress.projectid = window.sessionStorage.getItem('piid');

        $scope.drawpic();
    };
    $scope.drawpic = function() {
        $("#main").empty();
        if ($scope.progress.projectid) {

            //输入时间前端验证
            if ($scope.progress.begtime >= $scope.progress.endtime) {
                $scope.progress.begtime = 0;
                $scope.progress.endtime = 0;
                return MessageService.error($scope, "开始时间不能晚于或等于结束时间");
            }

            function timF(date) {
                var y = date.getFullYear();
                var m = date.getMonth() + 1;
                m = m < 10 ? ('0' + m) : m;
                var d = date.getDate();
                d = d < 10 ? ('0' + d) : d;
                var h = date.getHours();
                var minute = date.getMinutes();
                minute = minute < 10 ? ('0' + minute) : minute;
                return y + '-' + m + '-' + d;
            }
            $http({
                method: "POST",
                url: "/analyze/projprogress",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
                data: $.param({
                    projectid: $scope.progress.projectid,
                    method: $scope.progress.method,
                    begtime: timF($scope.progress.begtime),
                    endtime: timF($scope.progress.endtime)
                })
            }).success(function(resp) {
                Vali.check(resp);
                if (resp.data) {
                    var data = resp.data;
                    if (data.length == 0) {
                        $("#main").html('<p class="picinfo">没有数据可以查询！</p>');
                        return;
                    };
                    var time = [];
                    var prov = [];
                    var timedata = [];
                    var objdata = {};
                    for (var i = 0; i < data.length; i++) {
                        time.push(data[i].date);
                        //timedata.length=0;
                        timedata[i] = [];
                        for (var p in data[i]) {
                            if (p != 'date') {

                                timedata[i].push(data[i][p])
                            }
                        }
                        objdata[time[i]] = timedata[i];
                    };
                    for (var p in data[0]) {
                        if (p != 'date') {
                            prov.push(p);
                        }
                    }

                    var myChart = echarts.init(document.getElementById('main'));

                    var dataMap = {};

                    function dataFormatter(obj) {
                        var pList = prov;
                        var temp;
                        for (var year = 2016; year <= 2017; year++) {
                            var max = 0;
                            var sum = 0;
                            temp = obj[year];
                            for (var i = 0, l = temp.length; i < l; i++) {
                                max = Math.max(max, temp[i]);
                                sum += temp[i];
                                obj[year][i] = {
                                    name: pList[i],
                                    value: temp[i]
                                }
                            }
                            obj[year + 'max'] = Math.floor(max / 100) * 100;
                            obj[year + 'sum'] = sum;
                        }
                        return obj;
                    }
                    dataMap.dataGDP = objdata;

                    var OPTIONarr = [];
                    for (var j = 0; j < time.length; j++) {
                        //针对method做title区别
                        var endText = '全国扫码次数分布';
                        if ($scope.progress.method == 'q') {
                            endText = '季度' + endText;
                        }
                        if ($scope.progress.method == 'm') {
                            endText = '月' + endText;
                        }
                        if ($scope.progress.method == 'y') {
                            endText = '年' + endText;
                        }
                        var OPTION = {
                            title: { text: time[j] + endText },
                            series: [
                                { data: objdata[time[j]] }
                            ]
                        };
                        OPTIONarr.push(OPTION);
                    }
                    option = {
                        baseOption: {
                            title: {
                                left: 'center'
                            },
                            timeline: {
                                // y: 0,
                                axisType: 'category',
                                // realtime: false,
                                // loop: false,
                                autoPlay: false,
                                // currentIndex: 2,
                                playInterval: 1000,
                                // controlStyle: {
                                //     position: 'left'
                                // },
                                data: time
                            },
                            tooltip: {},
                            calculable: true,
                            grid: {
                                top: 80,
                                bottom: 100
                            },
                            xAxis: [{
                                'type': 'category',
                                'axisLabel': { 'interval': 0 },
                                'data': prov,
                                splitLine: { show: false }
                            }],
                            yAxis: [{
                                type: 'value',
                                name: '个'
                            }],
                            series: [
                                { name: '扫码次数', type: 'bar', barMaxWidth: 40 }
                            ]
                        },
                        options: OPTIONarr
                    };

                    // 使用刚指定的配置项和数据显示图表。
                    myChart.setOption(option);
                }
            }).error(function(err) {
                MessageService.error($scope, "查询失败！");
            });
        } else {
            $("#main").html('<p class="picinfo">请在左侧选择活动！</p>')
        }

    }
}]);

// 活动效果
window.APP.controller("activityeffctiveCtrl", ["$scope", "$http", "MessageService", "ValiService", function($scope, $http, MessageService, Vali) {
    var timme = new Date();
    timme.setMonth(0);
    timme.setDate(1);
    var tim = new Date();
    tim.setDate(tim.getDate() + 1)
    $scope.effctive = {
        projectid: '',
        begtime: timme,
        endtime: tim
    };
    // TODO 过滤条件
    // TODO 查询
    // TODO 画图
    $scope.$on("actitems", function(event, data) {
        var proid = data.projectid;
        // 基于准备好的dom，初始化echarts实例
        $scope.effctive.projectid = proid;
        window.sessionStorage.setItem('piid', proid);
        $scope.draweffec();
    });
    $scope.initeffective = function() {
        $scope.effctive.projectid = window.sessionStorage.getItem('piid');
        $scope.draweffec();
    };
    $scope.draweffec = function(d) {
        $("#main").empty();
        if ($scope.effctive.projectid) {
            function timF(date) {
                var y = date.getFullYear();
                var m = date.getMonth() + 1;
                m = m < 10 ? ('0' + m) : m;
                var d = date.getDate();
                d = d < 10 ? ('0' + d) : d;
                var h = date.getHours();
                var minute = date.getMinutes();
                minute = minute < 10 ? ('0' + minute) : minute;
                return y + '-' + m + '-' + d;
            }
            $http({
                method: "POST",
                url: "/analyze/projeffect",
                headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
                data: $.param({
                    projectid: $scope.effctive.projectid,
                    begtime: timF($scope.effctive.begtime),
                    endtime: timF($scope.effctive.endtime)
                })
            }).success(function(resp) {
                Vali.check(resp);
                if (resp.data) {
                    var data = resp.data;
                    if (data.length == 0) {
                        $("#main").html('<p class="picinfo">没有数据可以查询！</p>');
                        return;
                    };
                    var myChart = echarts.init(document.getElementById('main'));

                    var names = [];
                    var values = [];
                    for (var i = 0; i < data.length; i++) {
                        names.push(data[i].name);
                        values.push(data[i].scancounts);
                    }

                    var datas = [];
                    for (var j = 0; j < data.length; j++) {
                        var objdata = {
                            value: values[j],
                            name: names[j]
                        };
                        datas.push(objdata);
                    }

                    var myChart = echarts.init(document.getElementById('main'));
                    option = {
                        title: {
                            text: '活动效果分析',
                            x: 'center'
                        },
                        tooltip: {
                            trigger: 'item',
                            formatter: "{a} <br/>{b} : {c} ({d}%)"
                        },
                        legend: {
                            orient: 'vertical',
                            left: 'left',
                            data: names
                        },
                        series: [{
                            name: '访问来源',
                            type: 'pie',
                            radius: '55%',
                            center: ['50%', '60%'],
                            data: datas,
                            itemStyle: {
                                emphasis: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }]
                    };


                    myChart.setOption(option);
                }
            }).error(function(err) {
                MessageService.error($scope, "查询失败！");
            });
        } else {
            $("#main").html('<p class="picinfo">请在左侧选择活动！</p>')
        }


    }
}]);