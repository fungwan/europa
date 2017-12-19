/**
 * Created by ivan on 15/12/29.
 */
var fs = require('fs');
var config = {
    /*
    加密相关
     */
    salt: 'erathink2015',
    setname: 'erathink',
    session_secret: 'erathink',
    dateformat: 'YYYY-MM-DD HH:mm:ss',
    qrgenpath: '/var/erathink/qrcode',
    qrgentable: 'test_db.proqrcode',
    host: 'http://cs.51s.co/',
    systemUser: 'SYS',
    retrytime: 30,//token获取失败后重试间隔,单位:秒
    staticPath: 'public',
    qrpercent: 0.2,
    qrcodesizemax: 10000,
    qrcodesizemin: 100,
    entinfo: {
        entid: 'luobawang',
        entemail: 'support@erathink.com'
    },
    applyEmail:'yfeng@erathink.com',
    log: {
        type: 'dateFile',
        filename: 'logs/log',
        pattern: "_yyyy-MM-dd",
        maxLogSize: 1024,
        alwaysIncludePattern: true,
        backups: 3,
        category: 'logger'
    },
    mysql: {
        host: '127.0.0.1',//192.168.1.138
        user: 'root',
        password: '123123',
        port: '3306',
        database: 'qr',
        pool: {
            max: 20,
            min: 0,
            idle: 10000
        }
    },
    //redis配置
    redis: {
        host: 'r-uf6978cad780c094.redis.rds.aliyuncs.com',
        port: 6379,
        auth: 'e4ZUzLgs'
    },
    email: {
        mail_options: {
            host: 'smtp.qiye.163.com',
            port: 25,
            auth: {
                user: 'pms@erathink.com',
                pass: 'Pms20152015'
            },
            secure:false,
            tls: {rejectUnauthorized: false}
        },
        sitehost: 'http://cs.51s.co/',
        //邮件确认超时时间
        hours: 2
    },
    page: {
        home: 'enterprise/do.html',
        qrgen: 'p.html?id=',
        activePage: 'active.html'
    },
    authentic: {
        defaulerole: 'admin',
        login: { path: '../controllers/sign', fun: 'login' },
        checkauthority: { path: '../controllers/sign', fun: 'rolecheck' },
        checkstate: { path: '../controllers/sign', fun: 'statecheck' }
    },
    wechat: {
        appId: "wxaabcaab73e9592f6",
        appSecret: "2b52e15e1fb3f9cb149f34d1fe45e255",
        appToken: 'erathink',
        mch_id: '1271138901',
        partner_key: 'fjiut543ertfgjki8756vbnmlkjexqpo',
        webtokenkey: 'webtoken_kepm2y',
        pfx: fs.readFileSync('../apiclient_cert.p12')
    },
    sms: {
        config: {
            app_key: '23312434',
            secret: '61272c3ceee971ad15724a6a227623b2'
        },
        options: {
            sms_free_sign_name: '身份验证',
            sms_param: {
                code: ''
            },
            rec_num: '',  //多个手机号逗号隔开
            sms_template_code: 'SMS_4993307'
        },
        resetPwdOptions: {
            sms_free_sign_name: '变更验证',
            sms_param: {
                code: ''
            },
            rec_num: '',  //多个手机号逗号隔开
            sms_template_code: 'SMS_71380502'
        },
        resetInfoOptions: {
            sms_free_sign_name: '变更验证',
            sms_param: {
                code: '',
                product: ''
            },
            rec_num: '',  //多个手机号逗号隔开
            sms_template_code: 'SMS_5073665'
        },
        favoritesNotifyOptions: {
            sms_free_sign_name: '大鱼测试',
            rec_num: '',  //多个手机号逗号隔开
            sms_template_code: 'SMS_70615306'
        },
        timeout: 180
    },
    //登录相关配置
    login: {
        //登录错误尝试最大次数
        maxtimes: 10
    },
    upload: {
        encoding: 'utf-8',
        uploaddir: 'public/upload',
        uploadtempdir: 'uploadtmp',
        maxfieldssize: 200 * 1024 * 1024
    },
    port: {
        qrplatform: 3000,
        qrgenerator: 3001,
        qrdownloader: 3002,
        qrlotterymanager: 3003,
        billnoserver: 3004,
        wechattokenserver: 3005,
        cussyncserver: 3006,
        wxpayserver: 3007,
        blhmanager:3008
    },
    services: {
        qrplatform: {
            url: 'http://localhost:3000',
            interfaces: {}
        },
        qrgenerator: {
            url: 'http://localhost:3001',
            interfaces: {
                qrcode: '/qrcode/gen',
                qrcodeNew: '/qrcodeNew/gen'
            }
        },
        qrdownloader: {
            url: 'http://localhost:3002',
            interfaces: {}
        },
        qrlotterymanager: {
            url: 'http://localhost:3003',
            interfaces: {
                genlottery: '/generate',
                checklottery: '/check',
                start: '/start',
                stop: '/stop',
                progress: '/progress',
                syncrulelottery: "/syncrule"
            }
        },
        billnoserver: {
            url: 'http://localhost:3004',
            interfaces: {
                getbillno: '/getbillno'
            }
        },
        wechattokenserver: {
            url: 'http://localhost:3005',
            interfaces:{
                gettoken:'/gettoken',
                getsign:'/getsign',
                getalltoken:'/getalltoken',
                getsystoken: '/getsystoken'
            }
        },
        wxpayserver: {
            url: 'http://localhost:3007',
            notifyurl: 'http://cs.51s.co/wx/paynotify',
            interfaces: {
                getParams: '/v1/pay/params',
                queryOrder: '/v1/pay/queryOrder',
                closeOrder: '/v1/pay/closeOrder',
                refund:'/v1/pay/refund'
            }
        },
        blhserver: {
            url:'http://localhost:3008',
            interfaces:{
                getCategory:'/category/list',
                getPdtList:'/product/list',
                createOrder:'/order/new',
                express:'/order/express'
            }
        },
        cussyncserver: {
            url: 'http://localhost:3006',
            interfaces: {
            }
        },
        wechat: {
            url: 'https://api.weixin.qq.com',
            interfaces:{
                getwebtoken:'/sns/oauth2/access_token?appid={1}&secret={2}&code={3}&grant_type=authorization_code',
                getuserinfo:'/cgi-bin/user/info?access_token={1}&openid={2}&lang=zh_CN',
                getwebuser:'/sns/userinfo?access_token={1}&openid={2}&lang=zh_CN',
                getmenulist: '/cgi-bin/menu/get?access_token=',
                createmenulist: '/cgi-bin/menu/create?access_token='
            }
        },
        webchatmch: {
            url: "https://api.mch.weixin.qq.com",
            interfaces: {
                sendredpack: '/mmpaymkttransfers/sendredpack',
                getredpackinfo: '/mmpaymkttransfers/gethbinfo',
                paymoney: '/mmpaymkttransfers/promotion/transfers',
                getpayinfo: '/mmpaymkttransfers/gettransferinfo',
                unifiedorder:'/pay/unifiedorder',
                orderquery:'/pay/orderquery',
                closeorder:'/pay/closeorder',
                refund:'/secapi/pay/refund',
                refundquery:'/pay/refundquery',
                downloadbill:'/pay/downloadbill',
                report:'/payitil/report'
            }
        },
        baidumap: {
            url: 'http://api.map.baidu.com',
            interfaces: {
                geocoder: '/geocoder/v2/?ak=4tMOTx96QG0g2SKm7p3QI64m&callback=renderReverse&location={1},{2}&output=json&pois=0'
            }
        }
    },
    mall: {
        productlistimageurl: 'http://om5zaeh9b.bkt.clouddn.com/',
        productlistimagestyle: 'list',
        productevalurl: '',
        productevalstyle: '',
        productimageurl: 'http://om5zaeh9b.bkt.clouddn.com/',
        productimagestyle: 'info',
        productshopcarimageurl: 'http://om5zaeh9b.bkt.clouddn.com/',
        productshopcarimagestyle: 'shopcart',
        articleUrl: 'http://cs.51s.co/mall/mobile/html/newsdetail.html?artid=',
        articleimageurl: 'http://om5zzdb7m.bkt.clouddn.com/',
        articleimagestyle: 'title',
        articleimagesmallstyle: 'titlesmall',
        article60style: 'title60',
        entimageurl: 'http://om7umanto.bkt.clouddn.com/',
        entlogosmallstyle: 'logo'
    },
    qiniu: {
        ACCESS_KEY: 'Fgzgpew-8fnEcZh-4D1VU5qhwD5cMoZvueekz60e',
        SECRET_KEY: 'ZCSJU-m8ur-Q1IUrCnzfCuEqQ9mkBo70ZguuVAIr',
        product: 'product',
        article: 'article'
    },
    adtype: {
        focus: { key: 'focus', title: '关注广告' },
        shop1: { key: 'shop1', title: '商城首页1号位' },
        shop2: { key: 'shop2', title: '商城首页2号位' },
        userinfo1: { key: 'userinfo1', title: '用户信息页广告' },
        clube_news: { key: 'clube_news', title: '会员专区轮播新闻' },
        // clube_hot: { key: 'clube_hot', title: '会员专区热销商品' },
        clube_onsale: { key: 'clube_onsale', title: '会员专享活动' }
    },
    share: {
        shareUrl: '/share/html/index.html?type=share',
    },
    blh:{
        app_id:2000100033,
        app_key:"82f2ad1c7038efb85a71829c87a6e089",
        url:{
            product_All:"http://test.api.li91.com:8088/Main/GOODSJK_cs/goodsall/",//正式 https://apijk.li91.com/Main/GOODSJK/goodsall/
            product_Info:"http://test.api.li91.com:8088/Main/GOODSJK_cs/goodsinfos/",//正式 https://apijk.li91.com/Main/GOODSJK/goodsinfos/
            product_Update:"http://test.api.li91.com:8088/Main/GOODSUPDATEJK_cs/goodsupdatelist/",//正式 https://apijk.li91.com/Main/GOODSUPDATEJK/goodsupdatelist/
            excute_Update:"http://test.api.li91.com:8088/Main/GOODSUPDATEJK_cs/goodsupdatereturn/",//正式 https://apijk.li91.com/Main/GOODSUPDATEJK/goodsupdatereturn/
            order_Generate:"http://test.api.li91.com:8088/Main/APIJK_cs/index/",//正式 https://apijk.li91.com/Main/APIJK/index/
            order_Express:"http://test.api.li91.com:8088/Main/APIJK_cs/checkexpress/"//正式 https://apijk.li91.com/Main/APIJK/checkexpress/
        },
        numbers:10, //每次向百利汇请求的商品数量
        times:500, // 每次间隔的时间，毫秒
        syncTime:'0 0 0 * * *', //每天自动更新数据时间，分别为秒 分 时
        expressUrl:"http://erp.li91.com/Main/Index/kuaidi/expressname/{1}/nums/{2}.html"
    }
};
module.exports = config;
