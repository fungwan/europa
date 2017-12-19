window.APP.controller('activityCtrl', [
    '$scope',
    'PostService',
    'MessageService',
    function(
        $scope,
        PostService,
        MessageService
    ) {
        $scope.items = [{
                title: "活动进度分析",
                src: "views/templates/analysis/activity.progress.html"
            },
            {
                title: "活动效果分析",
                src: "views/templates/analysis/activity.effctive.html"
            },
        ];

        //接口地址
        var getProjectListUrl = "/project/list";

        //Project constructor
        function Project() {
            //默认获取活动列表配置
            this.queryOption = {
                query: JSON.stringify({
                    "begdate": "",
                    "enddate": "",
                    "key": "",
                    "state": "",
                    "type": ""
                }),
                page: 1,
                size: 100
            };
            this.selectedItem = '';
        }

        //获取活动列表方法
        Project.prototype.getProjectList = function() {
            var self = this;

            PostService.request(
                getProjectListUrl,
                $.param(self.queryOption)
            ).then(function(data) {
                self.tableItems = data.data;
            }).catch(function(error) {
                MessageService.error($scope, "获取活动列表失败 " + error);
            });
        }

        //初始化
        Project.prototype.init = function() {
            var self = this;
            //获得活动列表
            self.getProjectList();
        }

        $scope.project = new Project();
        $scope.project.init();

        //广播
        $scope.selectActivity = function(item) {
            $scope.project.selectedItem = item;
            $scope.$broadcast("actitems", item);
        };
    }
]);


// 活动进度
window.APP.controller("activityProgressCtrl", [
    "$scope",
    "PostService",
    "MessageService",
    'UtilService',
    'timSliceFilter',
    'LineChartService',
    function(
        $scope,
        PostService,
        MessageService,
        utilService,
        timSliceFilter,
        LineChartService
    ) {
        //初始时间设置
        var _begtime = new Date(),
            _endtime = new Date();
        _begtime.setMonth(0);
        _begtime.setDate(1);
        _endtime.setDate(_endtime.getDate() + 1);

        //接口地址
        var progressUrl = "/analyze/projprogress";

        //progress constructor
        function Progress() {
            this.projectid = '';
            this.method = 'm';
            this.begtime = _begtime;
            this.endtime = _endtime;
        }

        //
        Progress.prototype.drawpic = function() {
            var self = this;
            $('#main').empty();

            //活动id验证
            if (!self.projectid) {
                return $("#main").html('<p class="picinfo">请在左侧选择活动！</p>');
            };

            //输入时间前端验证
            if (self.begtime > self.endtime) {
                self.begtime = _begtime;
                self.endtime = _endtime;
                return MessageService.error($scope, "开始时间不能晚于结束时间");
            }

            var p_endtime = new Date(self.endtime.getTime() + 24*60*60*1000);

            //接口传入数据
            var option = {
                projectid: self.projectid,
                method: self.method,
                begtime: timSliceFilter(self.begtime),
                endtime: timSliceFilter(p_endtime)
            }

            utilService.startLoading;
            PostService.request(progressUrl, $.param(option)).then(function(data) {
                if (data == 0) {
                    return $("#main").html('<p class="picinfo">没有数据可以查询！</p>');
                }
                //接收数据处理

                var title = '全国扫码次数分布';
                if (self.method == 'q') {
                    title = '季度' + title;
                }
                if (self.method == 'm') {
                    title = '月' + title;
                }
                if (self.method == 'y') {
                    title = '年' + title;
                }

                //表格刷新
                LineChartService.refresh('main', title, data);
            }).catch(function(error) {
                MessageService.error($scope, "查询失败！");
            }).finally(function() {
                utilService.stopLoading();
            })

        }

        Progress.prototype.init = function() {
            var self = this;
            self.projectid = window.sessionStorage.getItem('piid');
            self.drawpic();
        }

        $scope.progress = new Progress();
        $scope.progress.init();

        //监听广播事件
        $scope.$on('actitems', function(event, data) {
            var proid = data.projectid;
            window.sessionStorage.setItem('piid', proid);
            $scope.progress.projectid = proid;
            $scope.progress.drawpic();
        })

    }
]);

// 活动效果
window.APP.controller("activityeffctiveCtrl", [
    "$scope",
    "PostService",
    "MessageService",
    'UtilService',
    'timSliceFilter',
    'EchartPieService',
    function(
        $scope,
        PostService,
        MessageService,
        utilService,
        timSliceFilter,
        EchartPieService
    ) {

        //初始时间设置
        var _begtime = new Date(),
            _endtime = new Date();
        _begtime.setMonth(0);
        _begtime.setDate(1);
        _endtime.setDate(_endtime.getDate() + 1);

        //接口地址
        var effctiveUrl = "/analyze/projeffect";

        //progress constructor
        function Effctive() {
            this.projectid = '';
            this.begtime = _begtime;
            this.endtime = _endtime;
        }

        //
        Effctive.prototype.draweffec = function() {
            var self = this;
            $('#main').empty();

            //活动id验证
            if (!self.projectid) {
                return $("#main").html('<p class="picinfo">请在左侧选择活动！</p>');
            };

            //输入时间前端验证
            if (self.begtime > self.endtime) {
                console.log(self.begtime, new Date());
                self.begtime = _begtime;
                self.endtime = _endtime;
                return MessageService.error($scope, "开始时间不能晚于结束时间");
            }
            if (self.begtime > new Date()) {
                console.log(self.begtime, new Date());
                self.begtime = _begtime;
                self.endtime = _endtime;
                return MessageService.error($scope, "开始时间不能晚于当前时间");
            }

            var p_endtime = new Date(self.endtime.getTime() + 24*60*60*1000);

            //接口传入数据
            var option = {
                projectid: self.projectid,
                method: self.method,
                begtime: timSliceFilter(self.begtime),
                endtime: timSliceFilter(p_endtime)
            }

            utilService.startLoading;
            PostService.request(effctiveUrl, $.param(option)).then(function(data) {
                if (data == 0) {
                    return $("#main").html('<p class="picinfo">没有数据可以查询！</p>');
                }

                //接收数据处理
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

                //表格刷新
                EchartPieService.refresh('main', '活动效果分析', datas);

            }).catch(function(error) {
                MessageService.error($scope, "查询失败！");
            }).finally(function() {
                utilService.stopLoading();
            })

        }

        Effctive.prototype.init = function() {
            var self = this;
            self.projectid = window.sessionStorage.getItem('piid');
            self.draweffec();
        }

        $scope.effctive = new Effctive();
        $scope.effctive.init();

        //监听广播事件
        $scope.$on('actitems', function(event, data) {
            var proid = data.projectid;
            window.sessionStorage.setItem('piid', proid);
            $scope.effctive.projectid = proid;
            $scope.effctive.draweffec();
        })


    }
]);