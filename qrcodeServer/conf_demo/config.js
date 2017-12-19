/**
 * Created by ivan on 15/12/29.
 */
var fs=require('fs');
var config={
    /*
    加密相关
     */
    salt: 'erathink2015',
    setname:'erathink',
    session_secret: 'erathink',
    dateformat:'YYYY-MM-DD HH:mm:ss',
    qrgenpath:'/home/erathinkdemo/qrcode',
    qrgentable:'demo_db.proqrcode',
    host: 'http://wx.51s.co/',
    systemUser: 'SYS',
    retrytime:30,//token获取失败后重试间隔,单位:秒
    staticPath: 'public',
    qrpercent:0.2,
    qrcodesizemax:10000,
    qrcodesizemin:100,
    entinfo:{
        entid:'luobawang',
        entemail:'support@erathink.com'
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
        host: 'erathinko.mysql.rds.aliyuncs.com',//数据库
        user: 'qrdemo',
        password: 'kwnIN6VK',
        port: '3306',
        database: 'demo_db',
        pool: {
            max: 20,
            min: 0,
            idle: 10000
        }
    },
    //redis配置
    redis:{
        host:'139.196.25.231',
        port:6379,
	    auth:'e4ZUzLgs',
        database:'DB1'
    },
    email: {
        mail_options: {
            host: 'smtp.qiye.163.com',
            secure: true,
            port: 994,
            auth: {
                user: 'pms@erathink.com',
                pass: 'Pms20152015'
            },
            secure:false,
            tls: {rejectUnauthorized: false}
        },
        sitehost: 'http://wx.51s.co/',
        //邮件确认超时时间
        hours: 2
    },
    page: {
        home: 'enterprise/do.html',
        qrgen: 'p.html?id=',
        activePage: 'active.html'
    },
    authentic:{
        defaulerole:'admin',
        login:{path:'../controllers/sign',fun:'login'},
        checkauthority:{path:'../controllers/sign',fun:'rolecheck'},
        checkstate:{path:'../controllers/sign',fun:'statecheck'}
    },
    wechat:{
        appId:"wxb9c796bd30f0f732",
        appSecret:"3756aefa51b8e86f5d803bde40d0912f",
        appToken: 'erathink',
        mch_id: '1307247601',
        partner_key: 'fjiut543ertfgjki8756vbnmlkjexqpo',
        webtokenkey:'webtoken_kepm2y',
        pfx: fs.readFileSync('../apiclient_cert.p12')
    },
    sms:{
        config:{
            app_key: '23312434',
            secret: '61272c3ceee971ad15724a6a227623b2'
        },
        options:{
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
                product:''
            },
            rec_num: '',  //多个手机号逗号隔开
            sms_template_code: 'SMS_5073665'
        },
        favoritesNotifyOptions: {
            sms_free_sign_name: '大鱼测试',
            rec_num: '',  //多个手机号逗号隔开
            sms_template_code: 'SMS_70615306'
        },
        timeout:180
    },
    //登录相关配置
    login: {
        //登录错误尝试最大次数
        maxtimes: 10
    },
    upload:{
        encoding:'utf-8',
        uploaddir:'public/upload',
        uploadtempdir:'uploadtmp',
        maxfieldssize: 200 * 1024 * 1024
    },
    port: {
        qrplatform: 9080,
        qrgenerator: 8001,
        qrdownloader: 8002,
        qrlotterymanager: 8003,
        billnoserver: 8004,
        wechattokenserver: 8005,
        cussyncserver: 8006,
        wxpayserver: 8007
    },
    services:{
        qrplatform: {
            url:'http://localhost:9080',
            interfaces:{}
        },
        qrgenerator: {
            url:'http://localhost:8001',
            interfaces:{
                qrcode:'/qrcode/gen',
                qrcodeNew:'/qrcodeNew/gen'
            }
        },
        qrdownloader: {
            url:'http://localhost:8002',
            interfaces:{}
        },
        qrlotterymanager: {
            url:'http://localhost:8003',
            interfaces:{
                genlottery:'/generate',
                checklottery:'/check',
                start:'/start',
                stop:'/stop',
                progress:'/progress',
                syncrulelottery:"/syncrule"
            }
        },
        billnoserver: {
            url:'http://localhost:8004',
            interfaces:{
                getbillno:'/getbillno'
            }
        },
        wechattokenserver: {
            url:'http://localhost:8005',
            interfaces:{
                gettoken:'/gettoken',
                getsign:'/getsign',
                getalltoken:'/getalltoken',
                getsystoken: '/getsystoken'
            }
        },
        wxpayserver: {
            url: 'http://localhost:8007',
            notifyurl: 'http://wx.51s.co/wx/paynotify',
            interfaces:{
                getParams:'/v1/pay/params',
                queryOrder:'/v1/pay/queryOrder',
                closeOrder:'/v1/pay/closeOrder',
                refund:'/v1/pay/refund'
            }
        },        
        cussyncserver: {
            url:'http://localhost:8006',
            interfaces:{
            }
        },
        wechat:{
            url:'https://api.weixin.qq.com',
            interfaces:{
                getwebtoken:'/sns/oauth2/access_token?appid={1}&secret={2}&code={3}&grant_type=authorization_code',
                getuserinfo:'/cgi-bin/user/info?access_token={1}&openid={2}&lang=zh_CN',
                getwebuser:'/sns/userinfo?access_token={1}&openid={2}&lang=zh_CN',
                getmenulist: '/cgi-bin/menu/get?access_token=',
                createmenulist: '/cgi-bin/menu/create?access_token='
            }
        },
        webchatmch:{
            url:"https://api.mch.weixin.qq.com",
            interfaces:{
                sendredpack:'/mmpaymkttransfers/sendredpack',
                getredpackinfo:'/mmpaymkttransfers/gethbinfo',
                paymoney:'/mmpaymkttransfers/promotion/transfers',
                getpayinfo:'/mmpaymkttransfers/gettransferinfo',
                unifiedorder:'/pay/unifiedorder',
                orderquery:'/pay/orderquery',
                closeorder:'/pay/closeorder',
                refund:'/secapi/pay/refund',
                refundquery:'/pay/refundquery',
                downloadbill:'/pay/downloadbill',
                report:'/payitil/report'
            }
        },
        baidumap:{
            url:'http://api.map.baidu.com',
            interfaces:{
                geocoder:'/geocoder/v2/?ak=4tMOTx96QG0g2SKm7p3QI64m&callback=renderReverse&location={1},{2}&output=json&pois=0'
            }
        }
    },
    mall:{
        productlistimageurl:'http://om5zaeh9b.bkt.clouddn.com/',
        productlistimagestyle:'list',
        productevalurl:'',
        productevalstyle:'',
        productimageurl:'http://om5zaeh9b.bkt.clouddn.com/',
        productimagestyle:'info',
        productshopcarimageurl:'http://om5zaeh9b.bkt.clouddn.com/',
        productshopcarimagestyle:'shopcart',
        articleUrl:'http://wx.51s.co/mall/mobile/html/newsdetail.html?artid=',
        articleimageurl:'http://om5zzdb7m.bkt.clouddn.com/',
        articleimagestyle:'title',
        articleimagesmallstyle:'titlesmall',
        article60style:'title60',
        entimageurl:'http://om7umanto.bkt.clouddn.com/',
        entlogosmallstyle:'logo'
    },
    qiniu:{
        ACCESS_KEY:'Fgzgpew-8fnEcZh-4D1VU5qhwD5cMoZvueekz60e',
        SECRET_KEY:'ZCSJU-m8ur-Q1IUrCnzfCuEqQ9mkBo70ZguuVAIr',
        product:'product',
        article:'article'
    },
    adtype:{
        focus:{key:'focus',title:'关注广告'},
        shop1:{key:'shop1',title:'商城首页1号位'},
        shop2:{key:'shop2',title:'商城首页2号位'},
        userinfo1:{key:'userinfo1',title:'用户信息页广告'},
        clube_news:{key:'clube_news',title:'会员专区轮播新闻'},
        // clube_hot:{key:'clube_hot',title:'会员专区热销商品'},
        clube_onsale:{key:'clube_onsale',title:'会员专享活动'}
    }
};
module.exports=config;
