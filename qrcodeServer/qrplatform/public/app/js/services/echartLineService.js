window.APP.factory('LineChartService', [function() {
    var　 service = {};
    service.refresh = function(selector, title, data) {

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
            var OPTION = {
                title: { text: time[j] + title },
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

    return service;
}]);