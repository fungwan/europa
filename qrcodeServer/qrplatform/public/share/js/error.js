// 对不同的error显示不同的图片
function loadErrorImg (error) {
    
}

// 对不同的error显示不同的消息
function loadErrorMsg (error) {
    var errorMessage = {
        title: "未知错误",
        content: "发生了未知错误，请刷新重试"
    },
    errorMessageMap = {
        "INITWXSDKERROR": {
            title: "微信SDK初始化出错",
            content: "微信SDK初始化出错，请刷新重试"
        },
        "GETCONFIGERROR": {
            title: "分享配置获取失败",
            content: "分享配置获取失败，请刷新重试"
        },
        "SHAREDISABLED": {
            title: "分享活动未开启",
            content: "分享活动未开启，关注万码易联，第一时间获取活动消息"
        },
        "PROJECTINVALID": {
            title: "分享活动未找到",
            content: "分享活动未找到，关注万码易联，第一时间获取活动消息"
        },
        "CONFIGNOTFOUND": {
            title: "分享活动未找到",
            content: "分享活动未找到，关注万码易联，第一时间获取活动消息"
        },
        "SHARERECORDNOTFOUND": {
            title: "分享活动未找到",
            content: "分享活动未找到，关注万码易联，第一时间获取活动消息"
        }
    };
    errorMessage = errorMessageMap[error.message] || errorMessage;
    $(".error-msg-title").text(errorMessage.title);
    $(".error-msg-content").text(errorMessage.content);
}

$(function () {
    var error = top.$error || {};
    loadErrorImg(error);
    loadErrorMsg(error);
    $(".action button").click(function () {
        top.location.reload();
    });
});