/**
 * Created by Yatagaras on 2015/12/7.
 */

define("citypicker", function () {
    var caches = {}, fullCaches = {}, inited = false, pop = null, country = {}, province = {}, city = {}, district = {},
        levels = ["country", "province", "city", "district"], currentDetailCur = null;
    var containers = [];

    /**
     * 当点击国家时
     * @param e
     * @returns {boolean}
     */
    function onCountryItemClicked(e) {
        var t = $(e.currentTarget), v = t.cval();
        if (!t.hasClass("selected")) {
            t.addClass("selected").siblings().removeClass("selected");
            if (v)
                getCities(v, 1, getCitiesCompleted);
        }
        return false;
    }


    /**
     * 当双击国家时
     * @param e
     * @returns {boolean}
     */
    function onCountryItemDblClicked(e) {
        province.children(".selected").removeClass("selected");
        city.children(".selected").removeClass("selected");
        district.children(".selected").removeClass("selected");
        setTargetCity($(e.currentTarget));
        return false;
    }

    /**
     * 当单击省份时
     * @param e
     * @returns {boolean}
     */
    function onProvinceItemClicked(e) {
        var t = $(e.currentTarget), v = t.cval();
        if (!t.hasClass("selected")) {
            t.addClass("selected").siblings().removeClass("selected");
            if (v)
                getCities(v, 2, getCitiesCompleted);
        }
        return false;
    }

    /**
     * 当双击省份时
     * @param e
     * @returns {boolean}
     */
    function onProvinceItemDblClicked(e) {
        city.children(".selected").removeClass("selected");
        district.children(".selected").removeClass("selected");
        setTargetCity($(e.currentTarget));
        return false;
    }

    /**
     * 当单击城市时
     * @param e
     * @returns {boolean}
     */
    function onCityItemClicked(e) {
        var t = $(e.currentTarget), v = t.cval();
        if (!t.hasClass("selected")) {
            t.addClass("selected").siblings().removeClass("selected");
            if (v)
                getCities(v, 3, getCitiesCompleted);
        }
        return false;
    }

    /**
     * 当双击城市时
     * @param e
     * @returns {boolean}
     */
    function onCityItemDblClicked(e) {
        district.children(".selected").removeClass("selected");
        setTargetCity($(e.currentTarget));
        return false;
    }

    /**
     * 当单击区域时
     * @param e
     * @returns {boolean}
     */
    function onDistrictItemClicked(e) {
        var t = $(e.currentTarget);
        t.addClass("selected").siblings().removeClass("selected");
        setTargetCity(t);
        return false;
    }

    /**
     * 为接受城市信息的目标对象设置城市信息
     * @param source 城市信息提供元素
     */
    function setTargetCity(source) {
        currentDetailCur = source.val();
        if (popup.config.source)
            popup.config.source.val(currentDetailCur).text(source.attr("data-full")).trigger("change", currentDetailCur);
        popup.close();
    }

    /**
     * 获取城市列表
     * @param parentCode 父级城市Code
     * @param level 城市级别
     * @param callback 回调
     */
    function getCities(parentCode, level, callback) {
        if (currentDetailCur != parentCode) {
            currentDetailCur = parentCode;
            if (parentCode in caches)
                callback(level, caches[parentCode]);
            else
                containers[level].action({
                    "url": "cities/query",
                    "data": {"parentCode": parentCode}
                }, true).then(function (d) {
                    caches[parentCode] = d.data;
                    callback(level, d.data);
                });
        }
    }

    /**
     * 获取城市列表完成后
     * @param level
     * @param result
     */
    function getCitiesCompleted(level, result) {
        if (result && $.type(result) == "array") {
            for (var i = level, ii = levels.length; i < ii; i++)
                containers[i].empty();

            var _c = containers[level];
            $.each(result, function (i, r) {
                _c.append("<button value='{1}' data-full='{2}'>{0}</button>".format(r.name, r.code, r.full));
            });
            if (level === 1 && remote_ip_info)
                getDetailCities();
        }
    }

    /**
     * 获取详细城市列表（包含省、市、区）
     * @param code 城市编号
     * @param callback 回调
     */
    function getDetailCities(code, callback) {
        var _code = code || remote_ip_info;
        if (_code && _code != currentDetailCur) {
            pop.action({
                "url": "cities/detail",
                "data": {"keyword": JSON.stringify(_code)}
            }, false).then(function (d) {
                if (d && d.data) {
                    d = d.data;
                    fillDetailCities(d, 0, null);
                }
                if ($.type(callback) == "function") callback();
            });
        }
    }

    /**
     * 填充详细城市信息
     * @param d
     */
    function fillDetailCities(d, level, parent) {
        var _d = d[levels[level]];
        if (_d && _d.current) {
            if (_d.list && $.type(_d.list) == "array") {
                var _c = containers[level].empty();
                $.each(_d.list, function (i, r) {
                    var isCur = r.code == _d.current.code, btn = $("<button value='{1}' data-full='{2}'>{0}</button>".format(r.name, r.code, r.full));
                    _c.append(btn);
                    if (isCur)
                        btn.addClass("selected");
                });
            } else {
                containers[level].children().removeClass("selected");
                containers[level].children("button[value='{0}']".format(_d.current.code)).addClass("selected");
            }
            fillDetailCities(d, level + 1, _d.current);
        } else if (level < levels.length && parent) {
            getCities(parent.code, level, getCitiesCompleted);
        }
    }

    /**
     * 采用API（基于IP地址）获得的地理信息
     * @param info 返回的地理信息
     * @constructor
     */
    function APICitiesGetted() {
        getCities('-1', 0, getCitiesCompleted);
    }

    function init() {
        if (!inited) {
            pop = $("<div class='popup' data-type='citypicker' id='citypicker'><div class='cascading citypicker'>" +
                "<div class='verticalFlexBox flex'><span data-lang='国家'></span><div data-scroll='y' class='country verticalFlexBox flex'></div></div>" +
                "<div class='verticalFlexBox flex'><span data-lang='省/直辖市'></span><div data-scroll='y' class='province verticalFlexBox flex'></div></div>" +
                "<div class='verticalFlexBox flex'><span data-lang='城市'></span><div data-scroll='y' class='city verticalFlexBox flex'></div></div>" +
                "<div class='verticalFlexBox flex'><span data-lang='区/县'></span><div data-scroll='y' class='district verticalFlexBox flex'></div></div>" +
                "</div></div>");
            core.language.install(pop);
            $(document.body).append(pop);
            country = pop.find(".country");
            containers.push(country);
            province = pop.find(".province");
            containers.push(province);
            city = pop.find(".city");
            containers.push(city);
            district = pop.find(".district");
            containers.push(district);

            country.on("click", "button", onCountryItemClicked).on("dblclick", "button", onCountryItemDblClicked);
            province.on("click", "button", onProvinceItemClicked).on("dblclick", "button", onProvinceItemDblClicked);
            city.on("click", "button", onCityItemClicked).on("dblclick", "button", onCityItemDblClicked);
            district.on("click", "button", onDistrictItemClicked);

            //采用API（基于IP地址）获取地理位置
            $.getScript('http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js', APICitiesGetted);
            inited = true;
        }
    }

    /**
     * 更新指定城市选择源的城市全路径
     * @param obj
     */
    function getFull(obj) {
        if (obj.jquery && obj.length) {
            var v = obj.cval();
            if (v) {
                if (v in fullCaches)
                    return fullCaches[v].full;
                else
                    obj.action({
                        url: "cities/get",
                        data: {code: v}
                    }, false, true).then(success);
            }
        }

        function success(d, unhandled) {
            if (d && d.data && d.data.id >= 0) {
                fullCaches[d.data.code] = d.data;
                obj.text(d.data.full);
                unhandled = false;
            }
        }

        return null;
    }

    init();

    window.citypicker = {
        navigateTo: getDetailCities,
        getFull: getFull
    };
});