/**
 * Created by Yatagaras on 2015/12/22.
 */

/**
 * 活动类型，activityTypes的属性为活动类型名称，每个活动包括以下属性：name: 活动类型名称，list: 活动项目集合, lottery： 是否为抽奖方式, steps: 活动步骤
 */
var activityTypes = {
        redpacket: {
            name: "redpacket",
            list: "rpitems",
            lottery: true,
            steps: ["base", "lottery", "result"],
            captions: {
                pickup: "您获得了一个红包",
                result: {
                    normal: "领取成功",
                    top: "您获得了{0}",
                    none: "非常遗憾"
                }
            },
            buttons: {
                pickup: "领取红包"
            },
            contents: {
                pickup: "恭喜您获得了{0}（{1}），非常感谢您的参与。",
                result: {
                    normal: "您成功地领取了{0}（{1}）的红包，请前往微信查收。",
                    top: "恭喜您获得了{0}（{1}），我们的工作人员将在近期与您联系进行奖品兑换",
                    none: "非常遗憾，您未能中奖，非常感谢您的参与。"
                }
            }
        },
        question: {
            name: "question",
            list: "qaitems",
            lottery: false,
            captions: {
                result: "答题完毕"
            },
            contents: {
                result: "我们已经收到了您的问卷答题，非常感谢您参与我们的问卷调查！"
            },
            steps: ["base", "question", "result"]
        },
        point: {
            name: "point",
            list: "pointitems",
            lottery: false,
            captions: {
                result: "领取成功"
            },
            contents: {
                result: "恭喜您获得了{0}积分。"
            },
            steps: ["point", "result"]
        }
    }, answerTypes = {
        "radio": "1",
        "checkbox": "2",
        "text": "3"
    }, answerSeparator = "|",
    activityStates = {
        editing: {
            code: "editing",
            color: "#505050"
        },
        start: {
            code: "start",
            color: "#1b88ee"
        },
        gen: {
            code: "gen",
            color: "#1b88ee"
        },
        stop: {
            code: "stop",
            color: "#dc3023"
        },
        completed: {
            code: "completed",
            color: "#50bd00"
        }
    }, errorCodes = {
        unknown: "unknown",
        used: "used",
        outofdate: "outofdate",
        nolottery: "nolottery",
        noexists: "noexists",
        noproject: "noproject",
        badcode: "badcode",
        limit: "limit"
    }, lotteryStates = {
        "normal": "normal",
        "success": "success"
    }, resultSetting = {
        caption: {
            redpacket: "红包消息",
            question: "问卷消息",
            point: "积分消息"
        },
        content: {
            redpacket: "这里将显示用户领取红包后的消息或者参与活动失败的信息",
            question: "这里将显示用户提交问卷后的消息或者参与活动失败的信息",
            point: "这里将显示用户获取积分后的消息或者参与活动失败的信息"
        }
    };