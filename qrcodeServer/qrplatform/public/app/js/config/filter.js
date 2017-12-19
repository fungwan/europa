// 商品状态过滤器
window.APP.filter("commondityFilter", function () {
    return function (input) {
        input = input || "";
        if (input == 1) {
            return "已上架";
        } else if (input == 0) {
            return "已下架";
        } else {
            return "未知";
        }
    }
});

// 商品状态提示过滤器
window.APP.filter("commondityTitleFilter", function () {
    return function (input) {
        input = input || "";
        if (input == 1) {
            return "点击下架";
        } else if (input == 0) {
            return "点击上架";
        } else {
            return "未知状态";
        }
    };
});

// 二维码进度过滤器
window.APP.filter("qrcodeProgressFilter", function () {
    return function (input) {
        input = input || "0";
        return parseFloat(input).toFixed(2) * 100 + "%";
    };
});
//促销文章状态
window.APP.filter("commonditySaleState", function () {
    return function (input) {
        input = input || "";
        if (input == 0) {
            return "未激活";
        } else if (input == 1) {
            return "已激活";
        } else {
            return "已停用";
        }
    };
});
//时间戳转时间
window.APP.filter("timFmart", function () {
    return function (now) {
        return new Date(now).toLocaleString().replace(/:\d{1,2}$/, ' ');
    };
});
//时间戳转时间moment
window.APP.filter("momt", function () {
    return function (now) {
        return moment(now).format().slice(0, 10);
    };
});
//时间截取
window.APP.filter("timFmart10", function () {
    return function (now) {
        return new String(now).slice(0, 19).replace('T', ' ')
    };
});
//时间截取
window.APP.filter("timFmartday", function () {
    return function (now) {
        return new Date(now).toLocaleString().replace(/:\d{1,2}$/, ' ').slice(0, 9);
    };
});
//商品状态
window.APP.filter("forstate", function () {
    return function (state) {
        if (state == 'sell') {
            state = '已上架'
        } else {
            state = '已下架'
        }
        return state
    };
});
//商品状态
window.APP.filter("forstatef", function () {
    return function (state) {
        if (state == 'sell') {
            state = '下架'
        } else {
            state = '上架'
        }
        return state
    };
});
//用户状态
window.APP.filter("userstate", function () {
    return function (item) {
        var state = "";
        if (item.confirmed) {
            state = '正常'
        } else {
            state = '已停用'
        }
        return state
    };
});
//使用积分
window.APP.filter("tickmoneyPoint", function () {
    return function (tickmoneyPoint) {
        tickmoneyPoint = parseInt(tickmoneyPoint * 1000 / 10);
        return tickmoneyPoint
    };
});
//用户状态
window.APP.filter("updateUserState", function () {
    return function (state) {
        if (state) {
            state = '停用账户'
        } else {
            
            state = '启用账户'
        }
        return state
    };
});
//用户状态
window.APP.filter("roleState", function () {
    return function (state) {
        if (state == "erathink") {
            state = '超级管理员'
        } else if (state == "admin") {
            state = "系统管理员"
        } else {
            state = '一般用户'
        }
        return state
    };
});
//用户角色
window.APP.filter("roleDesc", function () {
    return function (state) {
        if (state == "erathink") {
            state = '超级管理员（最高权限，操作不受限制）'
        } else if (state == "admin") {
            state = '系统管理员（仅限制后台管理模块操作）'
        } else {
            state = '一般用户（仅可查看数据分析和消费者管理）'
        }
        return state
    };
});
//时间戳转时间
window.APP.filter("timFmartm", function () {
    return function (nS) {
        if (!nS) {
            return "";
        }
        return new Date(parseInt(nS)).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
    };
});
//时间戳转时间1000
window.APP.filter("timFmartm1000", function () {
    return function (nS) {
        return new Date(parseInt(nS) * 1000).toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
    };
});
//时间戳转时间1000
window.APP.filter("state", function () {
    return function (state) {
        if (state == '0') {
            state = '待审核'
        } else if (state == '1') {
            state = '审核通过'
        } else {
            state = '审核未通过'
        }
        return state
    };
});
//标准时间格式化
window.APP.filter("timF", function () {
    return function (date) {
        if (date) {
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            m = m < 10 ? ('0' + m) : m;
            var d = date.getDate();
            d = d < 10 ? ('0' + d) : d;
            var h = date.getHours();
            var minute = date.getMinutes();
            minute = minute < 10 ? ('0' + minute) : minute;
            return y + '-' + m + '-' + d
        } else {
            return ""
        }

    };
});

//订单状态过滤器
window.APP.filter("orderStateFilter", function () {
    return function (input) {
        var output;
        switch (input) {
            case "0":
                output = "待付款";
                break;
            case "1":
                output = "待发货";
                break;
            case "2":
                output = "待收货";
                break;
            case "3":
                output = "已完成";
                break;
            case "4":
                output = "已取消";
                break;
            case "5":
                output = "退货审核中";
                break;
            case "6":
                output = "换货审核中";
                break;
            case "7":
                output = "退货中";
                break;
            case "8":
                output = "换货中";
                break;
            case "100":
                output = "已关闭";
                break;
            default:
                output = "";
                break;
        }
        return output;
    };
});

//文章广告位状态
window.APP.filter('articleAdState', function () {
    return function (input) {
        var output;
        switch (input) {
            case "focus":
                output = "关注广告";
                break;
            case "shop1":
                output = "首页1号位";
                break;
            case "shop2":
                output = "首页2号位";
                break;
            case "userinfo1":
                output = "用户信息页广告";
                break;
            case "clube_news":
                output = "轮播新闻";
                break;
            case "clube_hot":
                output = "热销产品";
                break;
            case "clube_onsale":
                output = "专享活动";
                break;
            default:
                output = "未设置";
                break;
        }
        return output;
    };
});

//广告位时间
window.APP.filter('timSlice', function () {
    return function (nS) {
        if (!nS) {
            return "";
        }
        var time = new Date(nS);
        var y = time.getFullYear();
        var m = time.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = time.getDate();
        d = d < 10 ? ('0' + d) : d;
        return y + '-' + m + '-' + d;
    };
});

window.APP.filter('timToHMS', function () {
    return function (nS) {
        if (!nS) {
            return "";
        }
        var time = new Date(nS);
        var y = time.getFullYear();
        var m = time.getMonth() + 1;
        m = m < 10 ? ('0' + m) : m;
        var d = time.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = time.getHours();
        var minute = time.getMinutes();
        var second = time.getSeconds();

        return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
    };
});

window.APP.filter("timFlt", function () {
    return function (date) {
        if (date) {
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            m = m < 10 ? ('0' + m) : m;
            var d = date.getDate();
            d = d < 10 ? ('0' + d) : d;
            var h = date.getHours();
            var minute = date.getMinutes();
            minute = minute < 10 ? ('0' + minute) : minute;
            return y + '-' + m + '-' + d + ' ' + h + ':' + minute;
        } else {
            return ""
        }

    };
});
// 收支统计-交易状态
window.APP.filter("FpayState", function () {
    return function (input) {
        if (typeof input == "string") input = input.toUpperCase();
        switch (input) {
            case "SUCCESS":
                return "支付成功";
            case "REFUND":
                return "转入退款";
            case "NOTPAY":
                return "未支付";
            case "CLOSED":
                return "已关闭";
            case "REVOKED":
                return "已撤销";
            case "USERPAYING":
                return "用户支付中";
            case "PAYERROR":
                return "支付失败";
            default:
                return input;
        }
    };
});

window.APP.filter("FpayBank", function () {
    return function (input) {
        if (typeof input == "string") input = input.toUpperCase();
        else return input;

        var cardCodeMap = {
            "DEBIT": "（借记卡）",
            "CREDIT": "（信用卡）"
        };

        var bankCodeMap = {
            "ICBC": "工商银行",
            "ABC": "农业银行",
            "PSBC": "邮政储蓄银行",
            "CCB": "建设银行",
            "CMB": "招商银行",
            "BOC": "中国银行",
            "COMM": "交通银行",
            "SPDB": "浦发银行",
            "GDB": "广发银行",
            "CMBC": "民生银行",
            "PAB": "平安银行",
            "CEB": "光大银行",
            "CIB": "兴业银行",
            "CITIC": "中信银行",
            "BOSH": "上海银行",
            "CRB": "华润银行",
            "HZB": "杭州银行",
            "BSB": "包商银行",
            "CQB": "重庆银行",
            "SDEB": "顺德农商行",
            "SZRCB": "深圳农商银行",
            "HRBB": "哈尔滨银行",
            "BOCD": "成都银行",
            "GDNYB": "南粤银行",
            "GZCB": "广州银行",
            "JSB": "江苏银行",
            "NBCB": "宁波银行",
            "NJCB": "南京银行",
            "JZB": "晋中银行",
            "KRCB": "昆山农商",
            "LJB": "龙江银行",
            "LNNX": "辽宁农信",
            "LZB": "兰州银行",
            "WRCB": "无锡农商",
            "ZYB": "中原银行",
            "ZJRCUB": "浙江农信",
            "WZB": "温州银行",
            "XAB": "西安银行",
            "JXNXB": "江西农信",
            "NCB": "宁波通商银行",
            "NYCCB": "南阳村镇银行",
            "NMGNX": "内蒙古农信",
            "SXXH": "陕西信合",
            "SRCB": "上海农商银行",
            "SJB": "盛京银行",
            "SDRCU": "山东农信",
            "SCNX": "四川农信",
            "QLB": "齐鲁银行",
            "QDCCB": "青岛银行",
            "PZHCCB": "攀枝花银行",
            "ZJTLCB": "浙江泰隆银行",
            "TJBHB": "天津滨海农商行",
            "WEB": "微众银行",
            "YNRCCB": "云南农信",
            "WFB": "潍坊银行",
            "WHRC": "武汉农商行",
            "ORDOSB": "鄂尔多斯银行",
            "XJRCCB": "新疆农信银行",
            "CSRCB": "常熟农商银行",
            "JSNX": "江苏农商行",
            "GRCB": "广州农商银行",
            "GLB": "桂林银行",
            "GDRCU": "广东农信银行",
            "GDHX": "广东华兴银行",
            "FJNX": "福建农信银行",
            "DYCCB": "德阳银行",
            "DRCB": "东莞农商行",
            "CZCB": "稠州银行",
            "CZB": "浙商银行",
            "CSCB": "长沙银行",
            "CQRCB": "重庆农商银行",
            "CBHB": "渤海银行",
            "BOIMCB": "内蒙古银行",
            "BOD": "东莞银行",
            "BOB": "北京银行",
            "BNC": "江西银行",
            "BJRCB": "北京农商行",
            "AE": "AE",
            "GYCB": "贵阳银行",
            "JSHB": "晋商银行",
            "JRCB": "江阴农商行",
            "JNRCB": "江南农行",
            "JLNX": "吉林农信",
            "JLB": "吉林银行",
            "JJCCB": "九江银行",
            "HXB": "华夏银行",
            "HUNNX": "湖南农信",
            "HSB": "徽商银行",
            "HSBC": "恒生银行",
            "HRXJB": "华融湘江银行",
            "HNNX": "河南银行",
            "HKBEA": "东亚银行",
            "HEBNX": "河北农信",
            "HBNX": "湖北农信",
            "GYCB": "贵阳银行",
            "GSNX": "甘肃农信",
            "JCB": "JCB",
            "MASTERCARD": "MASTERCARD",
            "VISA": "VISA"
        };

        var splitResults = input.split("_");
        if (splitResults.length != 2) {
            return input;
        }
        var bankCode = splitResults[0],
            cardCode = splitResults[1],
            bankName = bankCodeMap[bankCode],
            cardName = cardCodeMap[cardCode];

        if (bankName && cardName) {
            return bankName + cardName;
        }
        return input;
    };
});

window.APP.filter("FtotalFee", function () {
    return function (input) {
        if (isNaN(input)) return "";
        return (input / 100).toFixed(2);
    };
});

window.APP.filter("FwxTime", function () {
    return function (input) {
        if (typeof input != "string") return "";
        if (input.length != 14) return input;
        var year = input.substr(0, 4),
            month = input.substr(4, 2),
            day = input.substr(6, 2),
            hour = input.substr(8, 2),
            minute = input.substr(10, 2),
            second = input.substr(12, 2);
        var output = [year, month, day].join("-") + " " + [hour, minute, second].join(":");

        if (moment(output).isValid()) return output;
        return input;
    };
});

window.APP.filter("FbillState", function () {
    return function (input) {
        if (typeof input == "string") input = input.toUpperCase();
        switch (input) {
            case "SUCCESS":
                return "发送成功";
            case "SENDFALSE":
                return "发送失败";
            default:
                return input;
        }
    };
});

window.APP.filter("FhbStatus", function () {
    return function (input) {
        if (typeof input == "string") input = input.toUpperCase();
        switch (input) {
            case "SENDING":
                return "发放中";
            case "SENT":
                return "已发放待领取";
            case "FAILED":
                return "发放失败";
            case "RECEIVED":
                return "已领取";
            case "RFUND_ING":
                return "退款中";
            case "REFUND":
                return "已退款";
            default:
                return input;
        }
    }
});

window.APP.filter("toFixed", function () {
    return function (input, length) {
        if (isNaN(input)) return "";
        length = length != undefined ? length : 2;
        return Number(input).toFixed(length);
    }
});

window.APP.filter("QouponState", function () {
    return function (type) {
        switch (type) {
            case "create":
                return "已购买";
            case "use":
                return "已使用";
            case "give":
                return "已赠予";
            default:
                return input;
        }
    }
});

window.APP.filter('lqbz', function () {
    return function (input, producttype) {
        if (producttype == 'redpacket') {
            if (isNaN(input)) return input;
            return parseInt(input) + " 积分";
        } else {
            if (isNaN(input)) return input;
            return input + " 元";
        }
        return input;
    }
});

window.APP.filter('expressState', function() {
    return function(state) {
        console.log(state)
        switch (state) {
            case 1:
                return "未发货";
            case 2:
                return "已发货";
            default:
                return '无信息';
        }
    }
})
