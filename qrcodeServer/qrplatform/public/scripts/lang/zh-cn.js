/**
 * Created by Yatagaras on 2015/9/14.
 */

define(function () {
    window.languagePackage = {
        "system": {
            "title": "Big-data Visualization Analysis",
            "initialization": "The system is being initialized<br />please wait for completion.",
            "module": {
                "home": "首页",
                "activities": {
                    "main": "二维码活动",
                    "redpackets": "扫码赢红包",
                    "questionnaire": "扫码答问卷",
                    "points": "扫码赚积分",
                    "advertisement": "营销广告",
                    "custom": "自定义活动",
                    "microSite": "微网站"
                },

                "analysis": {
                    "main": "分析结果",
                    "marketing": "红包活动",
                    "questionnaire": "调查问卷",
                    "price": "价格分析",
                    "bugsell": "窜货分析",
                    "customer": "消费者分析"
                },
                "dealer": {
                    "main": "经销商管理",
                    "emptylist": "经销商列表为空",
                    "emptyone": "没有该经销商"
                },
                "customer": {
                    "main": "消费者分类",
                    "seniorquery": {
                        "title": "高级查询"
                    }
                },
                "pages": {
                    "main": "活动页面",
                    "templates": "模板",
                    "designer": "设计器"
                },
                "language": "语言"
            },
            "menu": {
                "resetPassword": "更改密码",
                "exit": "退出系统"
            },
            "validation": {
                "isrequired": "为必填项",
                "notvalidated": "不符合要求"
            }
        },

        "commands": {
            "add": "添加",
            "apply": "应用",
            "asc": "升序",
            "back": "返回",
            "build": "构建",
            "cancel": "取消",
            "clear": "清除",
            "clone": "克隆",
            "close": "关闭",
            "confirm": "确定",
            "copy": "复制",
            "create": "创建",
            "delete": "删除",
            "desc": "降序",
            "done": "应用",
            "edit": "编辑",
            "export": "导出",
            "filter": "过滤",
            "help": "帮助",
            "login": "登录",
            "maximize": "最大化",
            "minimize": "最小化",
            "new": "新建",
            "ok": "好的",
            "open": "打开",
            "paste": "粘贴",
            "pause": "暂停",
            "print": "打印",
            "refresh": "刷新",
            "refreshall": "全部刷新",
            "remove": "移除",
            "reset": "重置",
            "restore": "重构",
            "save": "保存",
            "search": "查询",
            "selectAll": "全选/全不选",
            "setting": "设置",
            "share": "共享",
            "sort": "排序",
            "stop": "停止",
            "submit": "提交",
            "strategy": "策略",
            "sent": "保存",
            "global": "设为全局"
        },

        "message": {
            "loading": {
                "default": "正在加载数据",
                "module": "正在加载模块"
            },
            "success": {},
            "error": {
                "caption": "噢, 发生了错误!",
                "notConnected": "连接服务器失败.",
                "confirmPassword": "两次输入的密码不一致, 请重新输入.",
                "nodata": "没有数据可以查看, 请重试."
            },
            "title": {},
            "content": {}
        },
        "redpackets": {
            "all": "全部",
            "edit": "Editing",
            "simpleTitle": "Subversion Failed to commit",
            "simpleDescribe": "The critical state of flow is defined as the condition for which the Froude number is equal to unity.",
            "baseInfo": "基本信息",
            "editInfo": "设置活动的基本信息，在活动开始后就不能修改了哦。",
            "name": "名称",
            "description": "描述",
            "starttime": "开始时间",
            "endtime": "结束时间",
            "prize": "奖项设置",
            "editprize": "设置活动的红包分发规则，应用后将生成对应的二维码包，并删除之前已经生成的。"
        },
        "microSite": {
            "moduleTitle": "微网站",
            "voice": "海量模板，轻松建站，您的专属个性微网！"
        },
        "advertisement": {
            "title": "营销广告",
            "addNewMsg": "新建营销广告",
            "sentMsg": {
                "columnTitle": {
                    "time": "发送时间",
                    "group": "组别",
                    "area": "区域",
                    "status": "状态"
                }
            },
            "sendMsg": {
                "title": "新建营销广告",
                "allgroups": "全部分组",
                "sendGroup": "目标用户组",
                "all": "全部",
                "sex": "性别",
                "man": "男",
                "female": "女",
                "group": {
                    "firstLevel": "一级分组",
                    "secLevel": "二级分组",
                    "thiLevel": "三级分组"
                },
                "area": "区域",
                "editMsg": {
                    "title": "标题",
                    "author": "作者",
                    "coverImg": "添加封面图片",
                    "localUpLoad": "本地上传",
                    "content": "正文内容"
                },
                "preview": {
                    "title": "请输入标题",
                    "time": "2015-02-12",
                    "author": "Tom",
                    "image": "图片尺寸建议为900px*500px"
                }

            }
        },
        "marketing": {
            "moduleTitle": "营销分析",
            "chooseActivities": "活动",
            "search": {
                "conditions": {
                    "choose": "时间段:",
                    "to": "到",
                    "startTimeDef": "2010-01-01 00:00",
                    "endTimeDef": "2099-12-12 00:00",
                    "months": "按月分析",
                    "days": "按天分析"
                }
            },
            "switch": {
                "areaAnalysis": "中奖区域分析",
                "prizeAnalysis": "中奖情况",
                "timeAnalysis": "中奖时间分析",
                "drawTimesAnalysis": "抽奖次数分析"
            },
            "analysis": {
                "lotteryArea": "中奖区域分析",
                "bigprizeArea": "大奖区域分析",
                "lotteryDate": "中奖时间分析（按月）",
                "lotteryTime": "中奖时间分析（按天）",
                "eachDraw": "单人抽奖次数分析"
            }
        },
        "questionnaire": {
            "moduleTitle": "调查问卷分析",
            "chooseActivities": "问卷活动",
            "chooseTitle": "全部",
            "questionTitle": {
                "ques1": "1.您会选择有名气的甜品店去买甜品么？",
                "ques2": "2.您平均多久吃一次甜品？",
                "ques3": "3.去甜品店的时候和谁一起去？",
                "ques4": "4.请问您通常去的甜品店是在哪里？"
            },
            "chooseArea": "区域",
            "switch": {
                "questionnaireAnalysis": "问卷分析",
                "answersAnalysis": "答题分析",
                "priceAnalysis": "价格分析",
                "transshipmentsAnalysis": "窜货分析"
            }
        },
        "customer": {
            "moduleTitle": "消费者分析",
            "switch": {
                "customerArea": "消费者分布区域",
                "customerIncrease": "消费者增量趋势"
            }
        },
        "account": {
            "email": "电子邮箱",
            "username": "用户名",
            "password": "密码",
            "verifying": "正在验证您的身份, 请稍候.",
            "login": {
                "title": "登录到51s.co",
                "forgot": "忘记密码?",
                "remember": "记住我的登录",
                "submit": "提交登录信息",
                "signup": "<b>还不是会员?</b> 您可以继续了解更多的信息或者免费创建一个帐号."
            }
        },

        "placeholder": {
            "account": {
                "email": "您的电子邮箱地址",
                "username": "输入您的用户名",
                "password": "和登录密码"
            },
            "search": {
                "keywords": "请输入关键字",
                "status": "状态"
            }
        },

        "location": {
            "province": "省份/直辖市",
            "city": "城市",
            "area": "区域"
        },


        "dictionary": {}
    };
});