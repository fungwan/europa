/**
 * Created by Yatagaras on 2017/3/18.
 */
String.prototype.getParameter = function (key) {
    var re = new RegExp(key + '=([^&]*)(?:&)?');
    return this.match(re) && this.match(re)[1];
};


var geo = {};

/**
 * 消息提示
 * @type {{open: Function, close: Function}}
 */
var tooltip = {
    /**
     * 打开
     * @param message
     */
    open: function (message) {
        if (!document.body.classList.contains("loading"))
            document.body.classList.add("loading");
        $(".tooltip-content").html(message);
    },
    /**
     * 关闭
     */
    close: function () {
        document.body.classList.remove("loading");
    }
};

function getLocationFail() {
    //如果要求强制获取地理信息，则抛出异常
    if (activity.geoRequired === true)
        fail({
            code: errorCodes.unknown,
            message: "获取地理位置信息失败或者未允许应用获取您的地理位置信息。由于该活动需要您提供地理位置信息，因此在询问“是否允许获取地理信息”时请选择“允许”，请重新扫描二维码进行尝试。"
        });
    else
        activity.login();
}

/**
 * 活动对象
 * @type {{get: Function, success: Function, fail: Function}}
 */
var activity = {
    instance: null,
    customer: null,
    /**
     * 二维码ID
     */
    uuid: "",
    /**
     * 微信授权Code
     */
    code: "",
    /**
     * 企业信息
     */
    enterprise: null,
    /**
     * 用户类型
     * */
    custtype: null,
    custid: null,
    geoRequired: false,
    /**
     * 获取活动内容
     * @param qrid
     * @param code
     */
    get: function (qrid, code) {
        if (qrid && code) {
            activity.uuid = qrid;
            activity.code = code;
            tooltip.open("正在获取活动信息，请稍候");
            //获取活动详细信息
            $.ajax({
                method: "post",
                url: "/qrcode/baseinfo",
                data: {qrcode: qrid}
            }).then(activity.fill, fail);
        }
    },
    /**
     * 填充活动内容
     * @param d
     */
    fill: function (d) {
        if (d && d.data && d.data.entid) {
            activity.instance = d.data;
            activity.enterprise = {entid: d.data.entid, entname: d.data.entname};
            activity.custtype = d.data.customertype;
            activity.geoRequired = d.data.georequired;
            preview(d, false, activity.signin);
        } else
            fail({code: errorCodes.unknown, message: "获取活动内容失败，请重新扫描二维码进行重试。"});
    },
    login: function () {
        $.ajax({
            type: "POST",
            url: "/mobile/login",
            data: {
                code: activity.code,
                entid: activity.enterprise.entid,
                custtype: activity.custtype,
                lng: geo.longitude,
                lat: geo.latitude
            }
        }).then(activity.check, fail);
    },
    /**
     * 登录
     */
    signin: function () {
        tooltip.open("正在进行登录，请稍候");
        geo.latitude = 0; // 纬度，浮点数，范围为90 ~ -90
        geo.longitude = 0; // 经度，浮点数，范围为180 ~ -180。
        geo.speed = 0; // 速度，以米/每秒计
        geo.accuracy = 0; // 位置精度

        wx.getLocation({
            type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
            success: function (res) {
                geo.latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                geo.longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                geo.speed = res.speed; // 速度，以米/每秒计
                geo.accuracy = res.accuracy; // 位置精度
                activity.login();
            },
            fail: getLocationFail,
            cancel: getLocationFail
        });

    },
    /**
     * 检测二维码可用状态
     */
    check: function (d) {
        if (d && d.error)
            fail(d.error);
        else {
            activity.custid = d.data.custid;
            activity.customer = d.data;
            $('#pickup').removeClass('opened');
            tooltip.open("正在检测二维码，请稍候");
            $.ajax({
                type: "POST",
                url: "/qrcode/checkqrcode",
                data: {qrcode: activity.uuid}
            }).then(activity.done, fail);

        }
    },
    /**
     * 开始活动
     */
    done: function (d) {
        if (d) {
            if (d.error) {
                fail(d.error);
            } else {
                if ((d.data === null || $.isArray(d.data))) {
                    if (activity.instance.checktel === true && !activity.customer.phone) {
                        tooltip.close();
                        // 填写tel
                        $('#pickup').addClass('opened');
                        $('#pickup_submit').off().click(function (){
                            var phone = $('#pickup_phone').val();
                            if (/^\d{11}$/ig.test(phone)) {
                                tooltip.open("保存手机号码");
                                $.ajax({
                                    type: 'POST',
                                    url: '/qrcode/updatephoneno',
                                    data: {
                                        phone: phone,
                                        projectid: activity.instance.projectid,
                                        code: '1234'
                                    }
                                }).then(function(res) {
                                    tooltip.close();
                                    $('#pickup').removeClass('opened');
                                    if (!res.error) {
                                        check(d.data);
                                    } else {
                                        fail(res)
                                    }
                                }, fail);
                            } else {
                                $('#pickupMessage').text('请输入正确的手机号码格式');
                            }
                        })
                    } else {
                        check(d.data);
                    }
                } else {
                    check(false);
                }
                /*var fr = $("#fr").get(0);
                if (fr.contentWindow && fr.contentWindow.check) {
                    if ((d.data === null || $.isArray(d.data)))
                        fr.contentWindow.check(d.data);
                    else
                        fr.contentWindow.check(false);
                }*/
            }
        }
        tooltip.close();
    }
};

function preview(d, preview, callback) {
    if (d && d.data) {
        /*$("#fr").unbind("load").load(function (e) {
            document.title = d.data.shortname || "Untitled";
            e.currentTarget.contentWindow.setup(d.data, callback);
            /!*if (preview !== false) e.currentTarget.contentWindow.goStep(0);*!/
        }).attr("src", "templates/index.html" + (preview !== false ? "?preview=phone" : ""));*/

        document.title = d.data.shortname || "Untitled";
        setup(d.data, callback);
    } else
        fail();
}

/**
 * 失败
 */
function fail(err) {
    tooltip.close();
    messager.error(err);
    /*if (fr && fr.contentWindow && fr.contentWindow.fail)
        fr.contentWindow.fail(err);
    else {
        document.title = "ERROR";
        $("#fr").attr("src", "templates/404.html");
    }*/
}

/**
 * 初始化微信接口
 */
function wenxinJDK(id, code) {
    function done(d) {
        if (d && d.data) {
            wx.ready(function () {
                activity.get(id, code);
            });
            wx.error(fail);
            wx.config($.extend(true, {
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                /*appId: '', // 必填，公众号的唯一标识
                 timestamp: , // 必填，生成签名的时间戳
                 nonceStr: '', // 必填，生成签名的随机串
                 signature: '',// 必填，签名，见附录1*/
                jsApiList: ["getLocation", "closeWindow"]
                // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            }, d.data));
        } else
            fail();
    }

    $.ajax({
        url: "/mobile/getsign",
        method: "post",
        data: {
            url: window.location.href
        }
    }).then(done, fail);
}

$(function () {
	_body = $('body');
    var id = window.location.href.getParameter("id");

    if (id) {
        var re = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        if (re.test(id)) {
            var code = window.location.href.getParameter("code");
            if (!!code && wx) {
                wenxinJDK(id, code);
            } else {
                tooltip.open("需要微信授权, 将跳转至授权页面.");
                var reuri = encodeURIComponent(window.location.href);
                window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid="+config.wechat.appid+"&redirect_uri=" + reuri + "&response_type=code&scope=snsapi_userinfo&state=frist#wechat_redirect";
            }
        } else if (/^\d+$/ig.test(id)) {
            $.ajax({
                url: "project/preview",
                method: "POST",
                data: {
                    qrid: id
                }
            }).then(preview, fail);
        } else
            window.location.href = "templates/404.html";
    } else {
        window.location.href = "templates/404.html";
    }
});