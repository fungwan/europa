/**
 * created by xdf on 2017/4/17
 * @param selector  容器id eg: 'charContainer'
 * @param title     饼状图标题 字符串
 * @param data      传入数据 json格式
 * @param bgColor   饼状图背景色 可选参数，默认#fff
 */
window.APP.factory('EchartPieService', [function() {
    var echart = {},
        myEchart,
        defaultEcharOption = {
            //标题设置
            title: {
                text: '',
                textStyle: {
                    color: '#111'
                }
            },

            //背景色
            backgroundColor: '#ffff',

            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },

            visualMap: {
                // 不显示 visualMap 组件，只用于明暗度的映射
                show: false,
                // 映射最小值最大值
                min: 0,
                max: 500,
                //范围
                inRange: {
                    //明暗度变化范围
                    colorLightness: [0.6, 0.3]
                }
            },
            series: [{
                name: '',
                //饼状图
                type: 'pie',
                //图标所占比例
                radius: '50%',

                //数据 json
                data: [].sort(function(a, b) { return a.value - b.value }),

                //设置为南丁格尔图
                roseType: 'angle',
                //标签设置
                label: {
                    normal: {
                        textStyle: {
                            color: '#222'
                        }
                    }
                },
                //标签连线设置
                labelLine: {
                    normal: {
                        lineStyle: {
                            color: '#222'
                        }
                    }
                },
                //图表中每份的样式设置
                itemStyle: {
                    normal: {
                        color: '#c23531',
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    },
                    emphasis: {
                        color: '#c23531',
                        shadowBlur: 100,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }]
        };

    //渲染图表
    echart.refresh = function(selector, title, data, bgColor) {
        //设定容器
        myEchart = echarts.init(document.getElementById(selector));
        //处理传入数据
        defaultEcharOption.title.text = title;
        if (data) {
            defaultEcharOption.series[0].data = data;
        }
        defaultEcharOption.backgroundColor = bgColor || '#ffff';
        //渲染图表
        myEchart.setOption(defaultEcharOption);
    }

    return echart;
}]);