//近几个月时间
Date.prototype.format = function (format) {
    var o = {
        "M+": this.getMonth() + 1, // month
        "d+": this.getDate(), // day
        "h+": this.getHours(), // hour
        "m+": this.getMinutes(), // minute
        "s+": this.getSeconds(), // second
        "q+": Math.floor((this.getMonth() + 3) / 3), // quarter
        "S": this.getMilliseconds()
        // millisecond
    }
    if (/(y+)/.test(format))
        format = format.replace(RegExp.$1, (this.getFullYear() + "")
            .substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(format))
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
};
//数组求和
Array.prototype.sum = function () {
    var result = 0;
    for (var i = 0; i < this.length; i++) {
        result += this[i];
    }
    return result;
};
//删除数组的某一个
Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index != -1) {
        this.splice(index, 1);
    }
};
//获取url参数
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
var app = {
    entname: '企业名称',
    unit: '元',
    code: null, //地址code
    nickname: null,
    openid: null,
    custid: '',
    point: null,
    haspass: null,
    //判断数组终极解决方案
    isArrayFn: function (obj) {
        if (typeof Array.isArray === "function") {
            return Array.isArray(obj); //浏览器支持则使用isArray()方法
        } else { //否则使用toString方法
            return Object.prototype.toString.call(obj) === "[object Array]";
        }
    },
    //对象遍历找到返回data,没有返回undefined,第三个参数是默认取值
    namespaceValue: function (obj, path, defaultValue) {
        var value = defaultValue,
            splitter = ".",
            fields = path.split(splitter);

        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (obj[field] === undefined) {
                break;
            } else {
                obj = obj[field];
                if (i == fields.length - 1) {
                    value = obj;
                }
            }
        }

        return value;
    },
    //时间,金额格式化
    Fmat: {
        getLocalTime: function (nS) {
            return new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/, ' ');
        },
        getLocalTime1000: function (nS) {
            return new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
        },
        timeFm: function (nS) {
            if (!nS) {
                return "";
            }
            var time = new Date(nS);
            var y = time.getFullYear();
            var m = time.getMonth() + 1;
            m = m < 10 ? ('0' + m) : m;
            var d = time.getDate();
            d = d < 10 ? ('0' + d) : d;
            return y + '/' + m + '/' + d;
        },
        money: function (money, bool) {
            if (bool) { //true
                if (money === 0) return money;
                if (money === null || money === undefined || money == "") {
                    return "--"
                } else {
                    var prefix = money < 0 ? "-" : ""; //前缀 是否有负号
                    money = Math.abs(money).toFixed(2); //取绝对值 并保留两位小数
                    var index = money.indexOf("."); //小数点的位置
                    var suffix = money.substring(index); //后缀 小数点及其两位小数
                    var newMoney = ""; //格式化后的金额字符串
                    while (true) {
                        if (index - 3 <= 0) {
                            newMoney = money.substring(0, index) + newMoney;
                            break;
                        }
                        newMoney = "," + money.substring(index - 3, index) + newMoney;
                        index -= 3;
                    }
                    return prefix + newMoney + suffix;
                }
            } else {
                if (money === null || money === undefined || money == "") {
                    return "--";
                } else {
                    return money;
                }
            }
        },
        getNowFormatDate: function () {
            var date = new Date();
            var seperator1 = "-";
            var seperator2 = ":";
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
            //var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
            //    + " " + date.getHours() + seperator2 + date.getMinutes()
            //    + seperator2 + date.getSeconds();
            return currentdate;
        }
    },
    //初始化页面
    pageInit: function (pageId) {
        $(".page").removeClass("page-current");
        $(pageId).addClass("page-current");
        $.init();
    },
    //ajax
    request: function (url, data, method) {
        var promise = new Promise(function (resolve, reject) {
            $.ajax({
                type: method || 'post',
                url: url,
                data: data || null,
                success: function (res) {
                    if (res.error) {
                        reject(res)
                    } else {
                        resolve(res)

                    }
                },
                error: function (res) {

                    reject(res)
                }
            });
        });
        return promise;
    },
    checkLogin: function () {
        return new Promise(function (resolve, reject) {
            app.request("/mobile/checklogin")
                .then(function (data) {
                    var d = data.data;
                    app.custid = d.custid;
                    app.openid = d.openid;
                    app.nickname = d.nickname;
                    resolve(d);
                })
                .catch(function (data) {
                    reject(data);
                    if (data.error) {
                        if (data.error.code == 'unlogin') {
                            //未登录
                            var thisurl = window.location.href;
                            window.sessionStorage.setItem('thisurl', thisurl);
                            window.location.href = './login.html';
                        } else {
                            $.toast("登录异常:" + data.error.message);
                        }
                    } else {
                        $.toast("登录异常");
                    }
                });
        });
    },
    //是否设置了支付密码
    hasSetPass: function () {
        app.request('/customer/checkpasswordstate')
            .then(function (data) {
                app.haspass = data.data;
                app.checkOut.hasSetPassword = data.data;
            })
            .catch(function (data) {
                if (data.error) {
                    $.toast("检测密码失败:" + data.error.message)
                } else {
                    $.toast("检测密码失败");
                }
            })
    },
    //获取积分,个人微信的信息
    getGrade: function () {
        var promise = new Promise(function (resolve, reject) {
            app.request("/club/getCustInfo", {
                    custid: app.custid
                })
                .then(function (data) {
                    if (data.data && data.data.point) {
                        app.point = data.data.point || 0;
                        $("#Grade").html(data.data.point || 0);
                    } else {
                        app.point = 0;
                        $("#Grade").html(0);
                    }
                    resolve(data);
                })
                .catch(function (data) {
                    if (data.error) {
                        $.toast("积分获取失败:" + data.message);
                    } else {
                        $.toast("积分获取失败");
                    }
                    reject(data);
                });
        });
        return promise;
    },
    //获取个人完整信息
    getCustInfo: function () {
        return new Promise(function (resolve, reject) {
            app.request('/shop/getCustInfo', {
                    custid: app.custid
                })
                .then(function (data) {
                    resolve(data)
                }).catch(function (data) {
                    if (data.error) {
                        $.toast("获取用户信息失败:" + data.error.message);
                        reject(data)
                    } else {
                        $.toast("获取用户信息失败");
                        reject(data)
                    }
                })
        })
    },
    //获取个人地址
    getCustAddressList: function () {
        return new Promise(function (resolve, reject) {
            app.request('/shop/getAddressList', {
                    custid: app.custid
                })
                .then(function (data) {
                    if (data.error) {
                        $.toast("获取个人地址列表失败！");
                        reject(data)
                    } else {
                        resolve(data)
                    }
                })
                .catch(function (data) {
                    $.toast("获取个人地址列表失败！")
                })
        })
    },
    //swiper广告
    initSwiper: function (id, container, adtype) {
        var swiperConfig = {
            pagination: '.swiper-pagination',
            direction: 'horizontal',
            loop: true,
            autoplay: 2000,
            speed: 3000
        };
        if (adtype == 'shop1') {
            swiperConfig.pagination = '.swiper-p1'
        } else if (adtype == 'shop2') {
            swiperConfig.pagination = '.swiper-p2'
        }
        app.request('/club/getAdList', {
            adtype: adtype,
            state: '1'
        }).
        then(function (data) {
            if (data.data && data.data.length != 0) {
                var d = data.data;
                for (var i = 0; i < d.length; i++) {
                    $(container).append(`<div class="swiper-slide"><a href="./newsdetail.html?artid=${d[i].artid}" class="external"><img src="${config.mall.articleimageurl + d[i].titleimageurl + '-' + config.mall.articleimagestyle}" alt=""></a></div>`);
                };
                if (data.data.length == 1) {
                    swiperConfig.pagination = null;
                    swiperConfig.allowSwipeToNext = false;
                    swiperConfig.allowSwipeToPrev = false;
                    var swiper = new Swiper(id, swiperConfig);
                } else {
                    var swiper = new Swiper(id, swiperConfig);
                }
            } else {
                $(container).append(`<div class="swiper-slide"><a href="#"><img src="../images/ad.jpg" alt=""></a></div>`);
                swiperConfig.pagination = null;
                swiperConfig.allowSwipeToNext = false;
                swiperConfig.allowSwipeToPrev = false;
                var swiper = new Swiper(id, swiperConfig);
            }
        }).catch(function (data) {
            if (data.error) {
                $.toast("初始化广告位失败:" + data.error.message)
            } else {
                
                $.toast("初始化广告位失败" + JSON.stringify(data));
            }
        });
    },
    //swiper礼品详情轮播
    initSwiperProduct(data, datPath, blh) {
        var swiperConfig = {
            pagination: '.swiper-pagination',
            direction: 'horizontal',
            loop: true,
            autoplay: 2000,
            speed: 1000
        };

        if (blh == 'blh') {
            for (var i = 0; i < data.length; i++) {
                $(".swiper-wrapper").append(`<div class="swiper-slide"><img src="${data[i]}" alt=""></div>`);
            }
        } else {
            for (var i = 0; i < data.length; i++) {
                $(".swiper-wrapper").append(`<div class="swiper-slide"><img src="${datPath.imagepath}${data[i]}-${datPath.imagestyle}" alt=""></div>`);
            }
        }


        if (data.length == 1) {
            swiperConfig.pagination = null;
            swiperConfig.allowSwipeToNext = false;
            swiperConfig.allowSwipeToPrev = false;
            var swiper = new Swiper('.swiper-container', swiperConfig);
        } else {
            var swiper = new Swiper('.swiper-container', swiperConfig);
        }
    },
    //时间选择器格式化
    getTime: function () {
        var select = $(".changetime").val();
        //当前时间
        var begin = new Date();
        var begintime = begin.format("yyyy-MM-dd");
        var endtime = null;
        if (select == "近一个月") {

            var end = new Date(begin.setMonth((new Date().getMonth() - 1)));
            endtime = end.format("yyyy-MM-dd");
        } else if (select == "近三个月") {

            var end = new Date(begin.setMonth((new Date().getMonth() - 3)));
            endtime = end.format("yyyy-MM-dd");
        } else if (select == "近六个月") {

            var end = new Date(begin.setMonth((new Date().getMonth() - 6)));
            endtime = end.format("yyyy-MM-dd");
        } else if (select == "近一年") {

            var end = new Date(begin.setMonth((new Date().getMonth() - 12)));
            endtime = end.format("yyyy-MM-dd");
        }
        var timeobj = {
            begintime: endtime,
            endtime: begintime
        };
        return timeobj;
    },
    //获取查询字符串
    getSearchParams: function () {
        var params = {};
        var search;
        if (window.parent != window) {
            var href = window.parent.location.href;
            // TODO 添加对?至#的支持
            var search = href.match(/(\?.*)$/);
            if (search) {
                var length = search[0].length;
                if (search[0][length - 1] == "#") {
                    search = search[0].substr(1, search[0].length - 2);
                } else {
                    search = search[0].substr(1, search[0].length - 1);
                }
            } else {
                search = "";
            }
        } else {
            search = window.location.search;
            search = search.substr(1);
        }
        var arr = search.split("&"),
            newarr = [];

        $.each(arr, function (i, v) {
            newarr = v.split("=");

            if (typeof params[newarr[0]] === "undefined") {
                params[newarr[0]] = newarr[1];
            }
        });
        return params;
    },
    //订单状态
    orderState: function (state) {
        if (state == "0") {
            state = "待付款"
        } else if (state == "1") {
            state = "待发货"
        } else if (state == "2") {
            state = "待收货"
        } else if (state == "3") {
            state = "已完成"
        } else if (state == "4") {
            state = "已取消"
        } else if (state == "5") {
            state = "退货审核中"
        } else if (state == "6") {
            state = "换货审核中"
        } else if (state == "7") {
            state = "退货中"
        } else if (state == "8") {
            state = "换货中"
        } else if (state == "100") {
            state = "已关闭"
        };
        return state;
    },
    //验证
    RegVali: {
        phone: function (phone) {
            var myreg = /^(((1[3|7][0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
            if (myreg.test(phone)) {
                return true;
            } else {
                return false;
            }
        },
        empty: function (val) {
            if (val) {
                return true;
            } else {
                return false;
            }
        },
        name: function (val) {
            var reg = /[@#\$%\^&\*]+/g;
            if (reg.test(val) || val.length > 20) {
                return false;
            } else {
                return true;
            }
        },
        Nnumber: function (num, count) {
            var reg = new RegExp("^\\d{" + count + "}$");
            if (reg.test(num)) {
                return true;
            } else {
                return false;
            }
        },
        IsLetter: function (ps) {
            var reg = /^[A-Za-z]+$/;
            if (reg.test(ps)) {
                return true;
            } else {
                return false;
            }
        },
        IsNum: function (ps) {
            var reg = /^[\d]+$/;
            if (reg.test(ps)) {
                return true;
            } else {

                return false;
            }
        },
        password: function (perpassword) { //6-10位
            var reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{5,10}$/;
            if (reg.test(perpassword)) {
                //$(".passtip").html("密码符合要求请重复密码!");
                return true;
            } else {
                return false;
            }
        },
        posInt: function (ps) {
            var reg = /^[1-9]*[1-9][0-9]*$/;
            if (reg.test(ps)) {
                return true;
            } else {
                return false;
            }
        },
        email: function(email) {
            var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
            return reg.test(email);
        }
    },
    //满加载
    scollItem: {
        loading: false,
        page: 1,
        size: 20,
        init: function () {
            $('.infinite-scroll-preloader').show();
            $(".list-container").empty();
            app.scollItem.loading = false;
            app.scollItem.page = 1;
            $.attachInfiniteScroll($('.infinite-scroll'));
        },
        addItems: function (url, sendObj) {
            return new Promise(function (resolve, reject) {
                app.request(url, sendObj)
                    .then(function (data) {
                        resolve(data);
                    })
                    .catch(function (data) {
                        if (data.error) {
                            $.toast(data.error.message);
                            $('.infinite-scroll-preloader').hide();
                        } else {
                            $.toast('加载错误！');
                            $('.infinite-scroll-preloader').hide();
                        }
                    });
            });

        }
    },
    //礼品
    Product: {
        type: null,
        typeTxt: function (data) {
            app.Product.type = data;
            if (data == 'net') {
                data = '流量';
            } else if (data == 'redpacket') {
                data = '红包'
            } else if (data == 'cinema') {
                data = '电影票'
            } else if (data == 'product') {
                data = '商品'
            } else if (data == 'blh') {
                data = '商品'
            } else if (data == 'point') {
                data = '积分'
            } else if (data == 'phone') {
                data = '话费'
            } else if (data == 'qoupon') {
                data = '礼券'
            }
            return data;
        }
    },
    //获取城市列表
    cities: function (code) {
        return new Promise(function (resolve, reject) {
            app.request('/cities/query', {
                    parentCode: code
                })
                .then(function (data) {
                    resolve(data)
                })
                .catch(function (data) {
                    reject(data);
                    if (data.error) {
                        $.toast('获取城市列表失败:' + data.error.message)
                    } else {
                        $.toast('获取城市列表失败')
                    }
                })
        })
    },
    getprv: function (data) {
        var d = data.data;
        $(".list-container").empty();
        for (var i = 0; i < d.length; i++) {
            $(".list-container").append(`
                <li class="item-content item-link province" data-code="${d[i].code}">
                    <div class="item-media"><i class="icon icon-f7"></i></div>
                    <div class="item-inner">
                        <div class="item-title">${d[i].name}</div>
                    </div>
                </li>`)
        }
    },
    getcity: function (data) {
        var d = data.data;
        $(".list-container").empty();
        for (var i = 0; i < d.length; i++) {
            $(".list-container").append(`<li class="item-content item-link cities" data-code="${d[i].code}" data-name="${d[i].full}"">
                        <div class="item-media"><i class="icon icon-f7"></i></div>
                        <div class="item-inner">
                            <div class="item-title">${d[i].name}</div>
                        </div>
                    </li>`)
        }
    },
    //sendSms发送短信验证
    sendSms: {
        //安全手机验证码
        safePhone: {},
        //重置密码验证码
        resetPassword: {}
    },
    //css3动画
    Animate: function (ele, animate) {
        return new Promise(function (resolve, reject) {
            $(ele).removeClass("animated");
            $(ele).removeClass(animate);
            $(ele).addClass("animated");
            $(ele).addClass(animate);
            setTimeout(function () {
                resolve(ele)
            }, 600)
        })
    },
    //随机字符串
    RandomString: function (length) {
        var str = '';
        for (; str.length < length; str += Math.random().toString(36).substr(2));
        return str.substr(0, length);
    },
    //下单，结算
    checkOut: {
        orderid: null, //订单id
        orderbm: null, //订单编号
        allowPasswordWrongTime: 5, //允许输入支付密码错误次数
        hasPasswordWrongTime: 0, //密码已错次数
        passwordLocked: window.localStorage.getItem("passwordLocked"), //是否锁定密码,保存密码错误时的时间
        canUsePasswordSecond: 10, //密码错误60秒后再试
        type: null, //礼券：qoupon；普通商品：product；红包：redpacket
        poinit: null, //现有积分
        peductiblePoint: null, //抵扣的积分
        addressId: null, //收货地址
        usePoint: false, //是都使用积分
        checkOuturl: "/mall/checkout", //支付接口///mall/checkout///mobile/wxpaytest
        redpacketUrl: "/mall/createsendredpackorder", //创建红包订单
        reSendRedpacketUrl: "/mall/resendredpackorder", //再次发送红包
        queryOrderUrl: "/club/getOrderByid", //查询支付后订单的结果
        createOrderUrl: "/mall/createOrder", //下商品订单
        createQouponOrderUrl: "/mall/createQouponOrder", //下礼券订单
        colsePayOrderUrl: "/mall/colsePayOrder", //关闭订单
        createBlhOrderUrl:"/mall/createBlhOrder",//百里汇商品下单
        getDiscountCouponUrl: "/mall/getDiscountCoupon",
        hasSetPassword: null, //是否设置密码
        colsePayOrder: function (orderbm) { //关闭订单
            app.request(app.checkOut.colsePayOrderUrl, {
                    orderbm: orderbm
                })
                .then(function () {
                    $.toast("订单已关闭")
                    setTimeout(function () {
                        window.location.reload();
                    }, 1000)

                }).catch(function () {
                    $.toast("订单关闭失败")
                    setTimeout(function () {
                        window.location.reload();
                    }, 1000)
                })
        },
        conFirm: function (type, usePoint, parm, renderTpl) { //输入支付密码
            //检测是否锁定了密码
            if (window.localStorage.getItem("passwordLocked")) { //密码已锁定提示倒计时
                var second = window.localStorage.getItem("passwordLocked");
                var nowt = Date.parse(new Date()) / 1000;
                if (second && Number(second) > nowt) {
                    $.toast("剩余" + (Number(second) - nowt) + "秒后重试！");
                    if (Number(second) - nowt > 0) {
                        app.checkOut.hasPasswordWrongTime = 0;

                    }
                } else {
                    window.localStorage.removeItem("passwordLocked")
                }
            } else {
                if ($(".modal-button-bold").length == 0) {
                    $.confirm("<input type='password' id='password'/ > <a href='./selfsafe.html' class='external forgetalert'>忘记密码？</a>", '请输入支付密码', function () {
                        //检测是否输入密码
                        if (!$("#password").val()) {
                            $.toast("请输入密码");
                            return
                        }
                        parm.password = $("#password").val();
                        app.checkOut.createOrder(type, usePoint, parm, renderTpl);
                    });
                }



            }
        },
        checkOut: function (orderid) { //结算订单
            app.request(app.checkOut.checkOuturl, {
                    orderid: orderid
                })
                .then(function (data) {
                    //支付后
                    $.hidePreloader();
                    if (data.data.payargs) {
                        var d = data.data.payargs;
                        app.checkOut.wxPay.init(d)
                    } else {

                        //不需要调用微信，获取结算结果
                        if (window.location.href.indexOf("?") > 0) { //订单详情或者商品详情
                            if (window.location.href.indexOf("?id") > 0) { //订单详情页
                                window.location.reload();
                            } else { //商品详情
                                $.confirm('立即查看订单?', '支付成功',
                                    function () {
                                        window.location.href = "./marketorderlistdetail.html?id=" + app.checkOut.orderid;
                                    },
                                    function () {
                                        window.location.reload();
                                    }
                                );
                            }
                        } else { //去支付页
                            $.confirm('立即查看订单?', '支付成功',
                                function () {
                                    window.location.href = "./marketorderlistdetail.html?id=" + app.checkOut.orderid;
                                },
                                function () {
                                    window.location.href = "./marketshopcar.html"
                                }
                            );
                        }

                    }
                })
                .catch(function (data) {
                    $.hidePreloader();
                    if (window.location.href.indexOf("?") > 0) {

                        $.toast("结算失败,请稍后重试")
                    } else {

                        $.toast("结算失败,即将跳转")
                        setTimeout(function () {
                            window.location.href = "./marketorderlistdetail.html?id=" + app.checkOut.orderid;
                        }, 1000)
                    }

                })
        },
        createOrderRedpacket: function (type, usePoint, parm, renderTpl) {
            app.request(app.checkOut.redpacketUrl, parm)
                .then(function (data) {
                    app.checkOut.orderid = data.data.orderid;
                    $.hidePreloader();
                    $.confirm('立即查看订单?', '兑换成功',
                        function () {
                            window.location.href = "./marketorderlistdetail.html?id=" + app.checkOut.orderid;
                        },
                        function () {
                            window.location.reload();
                        }
                    );
                })
                .catch(function (data) {
                    if (data.error && data.error.code == "pointerror") {
                        $.toast("积分不足！");
                        $.hidePreloader();
                        return
                    }
                    if (data.error) {
                        if (data.error.code == 'passworderror') {
                            app.checkOut.hasPasswordWrongTime++;
                            if (app.checkOut.hasPasswordWrongTime >= app.checkOut.allowPasswordWrongTime) {
                                $.toast('您已连续输错' + app.checkOut.allowPasswordWrongTime + '次密码,请' + app.checkOut.canUsePasswordSecond + '秒后再试！');
                                var timestamp1 = Date.parse(new Date()) / 1000 + app.checkOut.canUsePasswordSecond;
                                window.localStorage.setItem('passwordLocked', timestamp1)
                            } else {
                                $.hidePreloader();
                                $.toast("兑换红包失败:" + data.error.message);
                            }
                        } else {
                            //$.toast("提交失败:" + data.error.message);
                            $.hidePreloader();
                            renderTpl(data);
                        }
                    } else {

                        $.toast("兑换红包失败");
                    }
                })
        },
        reSendRedpacket: function (type, usePoint, parm, renderTpl) {
            app.request(app.checkOut.reSendRedpacketUrl, {
                    orderid: app.getSearchParams().id
                })
                .then(function (data) {
                    var d = data.data.state;
                    if (d == '3') {
                        //成功
                        $.toast("兑换红包成功:注意在微信查收!")

                    } else {
                        //失败
                        $.toast("兑换红包失败:请稍后重试!")
                    }
                })
                .catch(function (data) {
                    $.toast("兑换红包失败，请稍后重试");
                })
        },
        createOrderProduct: function (type, usePoint, parm, renderTpl) {
            app.request(app.checkOut.createOrderUrl, parm)
                .then(function (data) {
                    $.hidePreloader();
                    $.showPreloader('订单支付中。。。')
                    //下单成功,调用结算接口
                    window.sessionStorage.removeItem('selid');
                    app.checkOut.orderid = data.data.orderid;
                    app.checkOut.orderbm = data.data.orderbm;
                    var orderBm = data.data.orderid;
                    app.checkOut.checkOut(orderBm);
                }).catch(function (data) {
                    app.checkOut.createOrderError(type, usePoint, parm, renderTpl, data);
                })
        },
        createOrderBlh: function (type, usePoint, parm, renderTpl) {

            app.request(app.checkOut.createBlhOrderUrl, parm)
                .then(function (data) {
                    console.log(data)
                    $.hidePreloader();
                    $.showPreloader('订单支付中。。。')
                    //下单成功,调用结算接口
                    app.checkOut.orderid = data.data.orderid;
                    app.checkOut.orderbm = data.data.orderbm;
                    var orderid = data.data.orderid;
                    app.checkOut.checkOut(orderid);
                }).catch(function (data) {
                    app.checkOut.createOrderError(type, usePoint, parm, renderTpl, data);
                })
        },
        createOrderQoupon: function (type, usePoint, parm, renderTpl) {
            app.request(app.checkOut.createQouponOrderUrl, parm)
                .then(function (data) {
                    $.hidePreloader();
                    $.showPreloader('订单支付中。。。')
                    //下单成功,调用结算接口
                    app.checkOut.orderid = data.data.orderid;
                    app.checkOut.orderbm = data.data.orderbm;
                    var orderid = data.data.orderid;
                    app.checkOut.checkOut(orderid);
                }).catch(function (data) {
                    app.checkOut.createOrderError(type, usePoint, parm, renderTpl, data);
                })
        },
        createOrderError: function (type, usePoint, parm, renderTpl, data) {
            $.hidePreloader();
            if (data.error) {
                if (data.error.code == 'passworderror') {
                    app.checkOut.hasPasswordWrongTime++;
                    if (app.checkOut.hasPasswordWrongTime >= app.checkOut.allowPasswordWrongTime) {
                        $.toast('您已连续输错' + app.checkOut.allowPasswordWrongTime + '次密码,请' + app.checkOut.canUsePasswordSecond + '秒后再试！');
                        var timestamp1 = Date.parse(new Date()) / 1000 + app.checkOut.canUsePasswordSecond;
                        window.localStorage.setItem('passwordLocked', timestamp1)
                    } else {
                        $.toast("提交失败:" + data.error.message);
                    }
                } else {
                    //下单失败,如果缺货做处理
                    renderTpl(data);
                }
            } else {
                $.toast("提交订单失败！");
            }
        },
        createOrder: function (type, usePoint, parm, renderTpl) { //下订单
            $.showPreloader('订单提交中。。。')
            //判断是否是红包订单，调用不同接口
            if (type == "redpacket") { //红包订单redpacketUrl
                app.checkOut.createOrderRedpacket(type, usePoint, parm, renderTpl)
            } else if (type == "product") {
                //下订单并且支付（下订单成功，下订单失败，下订单成功但是未支付）
                app.checkOut.createOrderProduct(type, usePoint, parm, renderTpl);
            } else if (type == "blh") {
                //下订单并且支付（下订单成功，下订单失败，下订单成功但是未支付）
                app.checkOut.createOrderBlh(type, usePoint, parm, renderTpl);
            } else { //下订单去结算礼券
                app.checkOut.createOrderQoupon(type, usePoint, parm, renderTpl);
            }

        },
        // 获取用户折扣券
        getDiscount: function() {
            return app.request(app.checkOut.getDiscountCouponUrl, {
                query: JSON.stringify({
                    state: 0
                })
            })
        },

        wxPay: {
            init: function (parm) {
                if (typeof WeixinJSBridge == "undefined") {
                    if (document.addEventListener) {
                        document.addEventListener('WeixinJSBridgeReady', app.checkOut.wxPay.pay, false);
                    } else if (document.attachEvent) {
                        document.attachEvent('WeixinJSBridgeReady', app.checkOut.wxPay.pay.pay);
                        document.attachEvent('onWeixinJSBridgeReady', app.checkOut.wxPay.pay.pay);
                    }
                } else {
                    app.checkOut.wxPay.pay(parm);
                }
            },
            pay: function (parm) {
                WeixinJSBridge.invoke(
                    'getBrandWCPayRequest', parm,
                    function (res) {
                        if (res.err_msg == "get_brand_wcpay_request:ok") { // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                            if (window.location.href.indexOf("?") > 0) { //产品详情页支付成功，//订单详情页支付成功

                                if (window.location.href.indexOf("?id") > 0) { //订单详情页支付成功
                                    window.location.reload();

                                } else { //产品详情页支付成功
                                    $.confirm('立即查看订单?', '支付成功',
                                        function () {
                                            window.location.href = "./marketorderlistdetail.html?id=" + app.checkOut.orderid;
                                        },
                                        function () {
                                            window.location.reload();
                                        }
                                    );
                                }
                            } else { //支付页支付成功
                                $.confirm('立即查看订单?', '支付成功',
                                    function () {
                                        window.location.href = "./marketorderlistdetail.html?id=" + app.checkOut.orderid;
                                    },
                                    function () {
                                        window.location.href = "./marketshopcar.html"
                                    }
                                );

                            }
                        } else if (res.err_msg == "get_brand_wcpay_request:cancel") { //点击取消微信支付，跳转到待支付订单列表，拿到订单信息，跳转到带支付页面      
                            if (window.location.href.indexOf("?") > 0) { //产品详情页或者订单详情页
                                if (window.location.href.indexOf("?id") > 0) { //订单详情页
                                    console.log("在订单详情页取消了支付")
                                } else { //产品详情页
                                    window.location.href = "./marketorderlistdetail.html?id=" + app.checkOut.orderid;
                                }
                            } else { //支付页取消支付
                                window.location.href = "./marketorderlistdetail.html?id=" + app.checkOut.orderid;
                            }
                        } else if (res.err_msg == "get_brand_wcpay_request:fail") {
                            //todo close payorder
                            app.checkOut.colsePayOrder(app.checkOut.orderbm)
                        }
                    }
                );
            }
        },
        checkOutTypeFun: function (type, usePoint, parm, renderTpl) {
            return new Promise(function (resolve, reject) {
                if (type == "qoupon") {
                    app.checkOut.checkOutQoupon(type, usePoint, parm, renderTpl);
                } else if (type == "product") {
                    app.checkOut.checkOutProduct(type, usePoint, parm, renderTpl);
                } else if (type == "redpacket") {
                    app.checkOut.checkOutRedpacket(type, usePoint, parm, renderTpl);
                } else if (type == "blh") {
                    app.checkOut.checkOutBlh(type, usePoint, parm, renderTpl);
                }
            })
        }, //参数为qoupon,product,redpacket
        checkOutQoupon: function (type, usePoint, parm, renderTpl) { //礼券
            if (usePoint) { //使用积分，去下单再结算
                if (app.checkOut.hasSetPassword) { //检测是否设置了密码
                    app.checkOut.conFirm(type, usePoint, parm, renderTpl);
                } else {
                    $.confirm("请先设置支付密码", '提示', function () {
                        window.location.href = "./selfsafe.html";
                        window.sessionStorage.setItem('fistSetPass', true);
                    });
                }
            } else { //不使用积分，去下单再结算
                app.checkOut.createOrder(type, usePoint, parm, renderTpl);
            }
        },
        checkOutBlh: function (type, usePoint, parm, renderTpl) {
            if (usePoint) { //使用积分，去下单再结算
                if (app.checkOut.hasSetPassword) { //检测是否设置了密码
                    app.checkOut.conFirm(type, usePoint, parm, renderTpl);
                } else {
                    $.confirm("请先设置支付密码", '提示', function () {
                        window.location.href = "./selfsafe.html";
                        window.sessionStorage.setItem('fistSetPass', true);
                    });
                }
            } else { //不使用积分，去下单再结算
                app.checkOut.createOrder(type, usePoint, parm, renderTpl);
            }
        },
        checkOutProduct: function (type, usePoint, parm, renderTpl) { //礼品
            if (usePoint) { //使用积分，去下单再结算
                if (app.checkOut.hasSetPassword) { //检测是否设置了密码
                    // if ($("#ordermsg").val() && $("#ordermsg").val().length > 30) {
                    //     $.toast('备注不能超过30个字！');
                    //     return
                    // }
                    app.checkOut.conFirm(type, usePoint, parm, renderTpl);
                } else {
                    $.confirm("请先设置支付密码", '提示', function () {
                        window.location.href = "./selfsafe.html";
                        window.sessionStorage.setItem('fistSetPass', true);
                    });
                }
            } else { //不使用积分，去下单再结算
                app.checkOut.createOrder(type, usePoint, parm, renderTpl);
            }
        },
        checkOutRedpacket: function (type, usePoint, parm, renderTpl) { //红包
            if (app.checkOut.hasSetPassword) { //检测是否设置了密码
                app.checkOut.conFirm(type, usePoint, parm, renderTpl);
            } else {
                $.confirm("请先设置支付密码", '提示', function () {
                    window.location.href = "./selfsafe.html";
                    window.sessionStorage.setItem('fistSetPass', true);
                });
            }
        },
        init: function () {
            return new Promise(function (resolve, reject) {
                app.getGrade().then(function () {

                    app.hasSetPass();
                    resolve(true)
                })
            })

        }
    },
    //js运算，处理浮点数
    //加法
    //var m=accAdd(1.22,1.22);
    //减法
    //var m1=accSub(1.22,1.22);
    //乘法
    //var m3=accMul(1.22,1.22);
    //除法
    //var m4=accDiv(1.22,1.22);
    math: {
        /**
         ** 加法函数，用来得到精确的加法结果
         ** 说明：javascript的加法结果会有误差，在两个浮点数相加的时候会比较明显。这个函数返回较为精确的加法结果。
         ** 调用：accAdd(arg1,arg2)
         ** 返回值：arg1加上arg2的精确结果
         **/
        accAdd: function (arg1, arg2) {
            var r1, r2, m, c;
            try {
                r1 = arg1.toString().split(".")[1].length;
            } catch (e) {
                r1 = 0;
            }
            try {
                r2 = arg2.toString().split(".")[1].length;
            } catch (e) {
                r2 = 0;
            }
            c = Math.abs(r1 - r2);
            m = Math.pow(10, Math.max(r1, r2));
            if (c > 0) {
                var cm = Math.pow(10, c);
                if (r1 > r2) {
                    arg1 = Number(arg1.toString().replace(".", ""));
                    arg2 = Number(arg2.toString().replace(".", "")) * cm;
                } else {
                    arg1 = Number(arg1.toString().replace(".", "")) * cm;
                    arg2 = Number(arg2.toString().replace(".", ""));
                }
            } else {
                arg1 = Number(arg1.toString().replace(".", ""));
                arg2 = Number(arg2.toString().replace(".", ""));
            }
            return (arg1 + arg2) / m;
        },
        /**
         ** 减法函数，用来得到精确的减法结果
         ** 说明：javascript的减法结果会有误差，在两个浮点数相减的时候会比较明显。这个函数返回较为精确的减法结果。
         ** 调用：accSub(arg1,arg2)
         ** 返回值：arg1减去arg2的精确结果
         **/
        accSub: function (arg1, arg2) {
            var r1, r2, m, n;
            try {
                r1 = arg1.toString().split(".")[1].length;
            } catch (e) {
                r1 = 0;
            }
            try {
                r2 = arg2.toString().split(".")[1].length;
            } catch (e) {
                r2 = 0;
            }
            m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
            n = (r1 >= r2) ? r1 : r2;
            return ((arg1 * m - arg2 * m) / m).toFixed(n);
        },
        /**
         ** 乘法函数，用来得到精确的乘法结果
         ** 说明：javascript的乘法结果会有误差，在两个浮点数相乘的时候会比较明显。这个函数返回较为精确的乘法结果。
         ** 调用：accMul(arg1,arg2)
         ** 返回值：arg1乘以 arg2的精确结果
         **/
        accMul: function (arg1, arg2) {
            var m = 0,
                s1 = arg1.toString(),
                s2 = arg2.toString();
            try {
                m += s1.split(".")[1].length;
            } catch (e) {}
            try {
                m += s2.split(".")[1].length;
            } catch (e) {}
            return Number(s1.replace(".", "")) * Number(s2.replace(".", "")) / Math.pow(10, m);
        },
        /** 
         ** 除法函数，用来得到精确的除法结果
         ** 说明：javascript的除法结果会有误差，在两个浮点数相除的时候会比较明显。这个函数返回较为精确的除法结果。
         ** 调用：accDiv(arg1,arg2)
         ** 返回值：arg1除以arg2的精确结果
         **/
        accDiv: function (arg1, arg2) {
            var t1 = 0,
                t2 = 0,
                r1, r2;
            try {
                t1 = arg1.toString().split(".")[1].length;
            } catch (e) {}
            try {
                t2 = arg2.toString().split(".")[1].length;
            } catch (e) {}
            with(Math) {
                r1 = Number(arg1.toString().replace(".", ""));
                r2 = Number(arg2.toString().replace(".", ""));
                return (r1 / r2) * pow(10, t2 - t1);
            }
        }
    },

    // 初始化wxjsSDK
    weixinSDK: {
        fail: function(error) {
            var self = this;
            $.toast(typeof error == 'object' ? JSON.stringify(error) : error);
        },
        init: function(url, cb) {
            var  self = this;
            cb = typeof cb == 'function' ? cb : function() {};
            app.request(
                "/mobile/getsign",
                { url: url }
            ).then(function(res) {
                if (res && res.data) {
                    wx.ready(function () {
                        cb();
                    });
                    wx.error(function(res) {
                        self.fail(res);
                    });
                    wx.config($.extend(true, {
                        debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        /*appId: '', // 必填，公众号的唯一标识
                         timestamp: , // 必填，生成签名的时间戳
                         nonceStr: '', // 必填，生成签名的随机串
                         signature: '',// 必填，签名，见附录1*/
                        jsApiList: ["onMenuShareAppMessage", "onMenuShareTimeline"]
                        // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                    }, res.data));
                } else 
                    self.fail('接口错误，无wxSDK数据');
            }).catch(function(err) {
                self.fail(err);
            })
        },

    } 
};