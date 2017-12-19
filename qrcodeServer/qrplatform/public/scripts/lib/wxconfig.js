var config = {
    "host": {
        "resource": "/", //资源
        "service": {
            "primary": "/", //主服务
            "preview": "http://192.168.1.176:3000/", //预览服务
            "download": "http://a.51s.co:3002/",//下载服务
            "fullname":"http://wx.51s.co/"//二维码积分赠送
        } //服务相关
    }, //域名
    "themeName": localStorage.getItem("themeName") || "default",
    "language": localStorage.getItem("language") || navigator.language || navigator.systemLanguage,
    "formats": {
        "date": "YYYY-MM-DD",
        "time": "HH:mm",
        "datetime": "YYYY-MM-DD HH:mm",
        "s_date": "Y-m-d",
        "s_time": "H:i",
        "s_datetime": "Y-m-d H:i",
        "get": function (format, defaultValue) {
            if (format !== "get" && format in config.formats)
                return config.formats[format];
            else
                return format || defaultValue;
        }
    },
    "debug": true,
    "compression": ""
};