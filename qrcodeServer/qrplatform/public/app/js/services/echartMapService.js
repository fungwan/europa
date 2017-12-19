/**
 * created by xdf on 2017/4/18
 * @param selector  容器id eg: 'mapChart'
 * @param title     饼状图标题 字符串
 * @param data      传入数据 json格式
 * @param bgColor   饼状图背景色 可选参数，默认#fff
 */
window.APP.factory('MapChartService', ['MapDataService', function(MapDataService) {
    //城市经纬度数据

    var geoCoordMap = MapDataService.data;

    //传入数据处理
    var convertData = function(data) {
        var res = [];
        for (var i = 0; i < data.length; i++) {
            //传入城市经纬度值，array
            var geoCoord = geoCoordMap[data[i].name];
            if (geoCoord) {
                res.push({
                    name: data[i].name,
                    //value，array[经度，纬度，值]
                    value: geoCoord.concat(data[i].value)
                });
            }
        }
        return res;
    };

    //图表配置项
    var option = {
        backgroundColor: '#404a59',
        title: {
            text: '地图表',
            x: 'center',
            y: '5%',
            textStyle: {
                color: '#333'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: function(params) {
                return params.name + ' : ' + params.value[2];
            }
        },
        legend: {
            orient: 'vertical',
            y: 'bottom',
            x: 'right',
            data: ['会员数'],
            textStyle: {
                color: '#333'
            }
        },
        visualMap: {
            min: 0,
            max: 500,
            calculable: true,
            color: ['#d94e5d', '#eac736', '#50a3ba'],
            textStyle: {
                color: '#111'
            }
        },
        geo: {
            map: 'china',
            label: {
                emphasis: {
                    show: false
                }
            },
            itemStyle: {
                normal: {
                    areaColor: '#2c333a',
                    borderColor: '#444'
                },
                emphasis: {
                    areaColor: '#666666'
                }
            }
        },
        series: [{
            name: '会员数',
            type: 'scatter',
            coordinateSystem: 'geo',
            data: convertData([
                { name: "成都", value: 169 },
                { name: "长沙", value: 175 },
                { name: "上海", value: 177 },
                { name: "北京", value: 193 }
            ]),
            symbolSize: 10,
            label: {
                normal: {
                    show: false
                },
                emphasis: {
                    show: false
                }
            },
            itemStyle: {
                emphasis: {
                    borderColor: 'rgba(255,255,255,0.5)',
                    borderWidth: 1
                }
            }
        }]
    };

    var service = {};

    service.refresh = function(selector, title, data, bgColor) {
        var container = echarts.init(document.getElementById(selector));
        if (title) {
            option.title.text = title;
        }
        if (data) {
            option.series[0].data = convertData(data);
        }
        option.backgroundColor = bgColor || '#ffff';
        container.setOption(option);
    }

    return service;

}]);