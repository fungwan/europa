/**
 * created by xcf 2017/4/20
 */
window.APP.factory('BarChartService', [function() {
    var service = {};

    var barOption = {
        title: {
            text: '',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { 
                type: 'shadow' 
            }
        },
        legend: {
            data: ['当前积分', '消耗积分', '产生积分']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [{
            type: 'value',
            axisLabel: {
                rotate: 45,
            }
        }],
        yAxis: [{
            type: 'category',
            axisTick: { show: false },
            data: ['促销商品']
        }],
        series: [{
                name: '当前',
                type: 'bar',
                label: {
                    normal: {
                        show: true,
                        position: 'inside'
                    }
                },
                data: [200]
            },
            {
                name: '消耗',
                type: 'bar',
                stack: '总量',
                label: {
                    normal: {
                        show: true,
                        position: 'left'
                    }
                },
                data: [320]
            },
            {
                name: '产生',
                type: 'bar',
                stack: '总量',
                label: {
                    normal: {
                        show: true,
                        position: 'inside'
                    }
                },
                data: [-120]
            }
        ]
    };

    var lineOption = {
        title: {
            text: ''
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        xAxis: {
            type: 'category',
            name: '日期',
            axisLabel: {
                rotate: 45,
                formatter: function (value,index) {
                    var arr = value.split('');
                    var arr1 = arr.slice(0,4);
                    var arr2 = arr.slice(4,6);
                    var arr3 = arr.slice(6);
                    arr1.push('/');
                    arr2.push('/');
                    var arr4 = arr1.concat(arr2,arr3);
                    return arr4.join('');
                }
            },
            boundaryGap: false,
            data: ['4/10', '4/11', '4/12', '4/13', '4/14', '4/15', '4/16', '4/17',
                '4/18', '4/19', '4/20', '4/21', '4/22', '4/23', '4/24', '4/25',
                '4/26', '4/27', '4/28', '4/29']
        },
        yAxis: {
            type: 'value',
            // name: '积分',
            nameLocation: 'end',
            axisLabel: {
                rotate: 45,
                margin: 12,
                formatter: '{value}'
            },
            axisPointer: {
                snap: true
            }
        },
        // visualMap: {
        //     show: false,
        //     dimension: 0,
        //     pieces: [{
        //         lte: 6,
        //         color: 'green'
        //     }, {
        //         gt: 6,
        //         lte: 8,
        //         color: 'red'
        //     }, {
        //         gt: 8,
        //         lte: 14,
        //         color: 'green'
        //     }, {
        //         gt: 14,
        //         lte: 17,
        //         color: 'red'
        //     }, {
        //         gt: 17,
        //         color: 'green'
        //     }]
        // },
        series: [{
            name: '积分数',
            type: 'line',
            smooth: true,
            data: [300, 280, 250, 260, 270, 300, 550, 500, 400, 390,
                380, 390, 400, 500, 600, 750, 800, 700, 600, 400
            ]
        }]
    };

    service.refreshBar = function(selector, title, data, bgColor) {
        // 设定容器
        var container = echarts.init(document.getElementById(selector));
        // 处理传入数据
        barOption.title.text = title || '';
        barOption.backgroundColor = bgColor || '#ffff';
        if (data) {
            for (var i = 0; i < barOption.series.length; i++) {
                var item = barOption.series[i];
                item.data = [data[i].data];
                item.name = data[i].name;
            }
        }
        // 渲染图表
        container.setOption(barOption);
    }

    service.refreshLine = function(selector, title, data, bgColor) {
        var container = echarts.init(document.getElementById(selector));
        lineOption.title.text = title || '';
        lineOption.backgroundColor = bgColor || '#ffff';
        if (data) {
            lineOption.xAxis.data = data.timeData
            lineOption.series[0].data = data.pointData;
        }
        container.setOption(lineOption);
    }

    return service;

}]);