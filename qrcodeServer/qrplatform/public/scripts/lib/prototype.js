/**
 * Created by Yatagaras on 2015/7/8.
 */
define(function () {


    /*
     * 删除指定元素
     * obj: 要删除的元素，
     * model: 模式，true（默认）表示删除全部；false表示删除第一个
     *
     * 返回值: Array
     */
    Array.prototype.remove = function (obj, model) {
        model = model === false ? false : true;
        for (var i = 0; i < this.length; ++i) {
            if (this[i] == obj) {
                this.splice(i, 1);
                if (!model) {
                    break;
                }
            }
        }
        return this;
    };

    /**
     * 格式化字符串
     * @param args
     * @returns {String}
     */
    String.prototype.format = function (args) {
        var result = this;
        if (arguments.length > 0) {
            if (arguments.length == 1 && typeof (args) == "object") {
                for (var key in args) {
                    if (args[key] != undefined) {
                        var reg = new RegExp("({" + key + "})", "g");
                        result = result.replace(reg, args[key]);
                    }
                }
            }
            else {
                for (var i = 0; i < arguments.length; i++) {
                    if (arguments[i] != undefined) {
                        var reg = new RegExp("({)" + i + "(})", "g");
                        result = result.replace(reg, arguments[i]);
                    }
                }
            }
        }
        return result;
    };


    /**
     * 获取URL中的参数值
     * @param key 参数名
     * @returns {Array|{index: number, input: string}|*}
     */
    String.prototype.getParameter = function (key) {
        var re = new RegExp(key + '=([^&]*)(?:&)?');
        return this.match(re) && this.match(re)[1];
    };

    /**
     * 转换为货币格式
     * @param places 小数位
     * @param symbol 货币单位
     * @param thousand 千位分隔符
     * @param decimal 小数位分隔符
     * @returns {string}
     */
    Number.prototype.formatMoney = function (places, symbol, thousand, decimal) {
        places = !isNaN(places = Math.abs(places)) ? places : 2;
        symbol = symbol !== undefined ? symbol : "¥";
        thousand = thousand || ",";
        decimal = decimal || ".";
        var number = this,
                negative = number < 0 ? "-" : "",
                i = parseInt(number = Math.abs(+number || 0).toFixed(places), 10) + "",
                j = (j = i.length) > 3 ? j % 3 : 0;
        return symbol + negative + (j ? i.substr(0, j) + thousand : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousand) + (places ? decimal + Math.abs(number - i).toFixed(places).slice(2) : "");
    };

    /**
     * IE支持
     */
    if (!("classList" in document.documentElement)) {
        Object.defineProperty(HTMLElement.prototype, 'classList', {
            get: function() {
                var self = this;
                function update(fn) {
                    return function(value) {
                        var classes = self.className.split(/\s+/g),
                                index = classes.indexOf(value);

                        fn(classes, index, value);
                        self.className = classes.join(" ");
                    }
                }

                return {
                    add: update(function(classes, index, value) {
                        if (!~index) classes.push(value);
                    }),

                    remove: update(function(classes, index) {
                        if (~index) classes.splice(index, 1);
                    }),

                    toggle: update(function(classes, index, value) {
                        if (~index)
                            classes.splice(index, 1);
                        else
                            classes.push(value);
                    }),

                    contains: function(value) {
                        return !!~self.className.split(/\s+/g).indexOf(value);
                    },

                    item: function(i) {
                        return self.className.split(/\s+/g)[i] || null;
                    }
                };
            }
        });
    }
});