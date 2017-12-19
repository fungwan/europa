// 服务器config
window.APP.constant("HostConfig", {
    primary: "/", // 主服务
    preview: "/", // 预览服务
    download: "http://erathink.tunnel.qydv.com:3002/", // 二维码下载服务
    mall: {
        productlistimageurl: 'http://om5zaeh9b.bkt.clouddn.com/',
        productlistimagestyle: 'list',
        productevalurl: '',
        productevalstyle: '',
        productimageurl: 'http://om5zaeh9b.bkt.clouddn.com/',
        productimagestyle: 'info',
        productshopcarimageurl: 'http://om5zaeh9b.bkt.clouddn.com/',
        productshopcarimagestyle: 'shopcart',
        articleUrl: 'http://erathink.tunnel.qydv.com/club/article?id=',
        articleimageurl: 'http://om5zzdb7m.bkt.clouddn.com/',
        articleimagestyle: 'title',
        articleimagesmallstyle: 'titlesmall',
        articleimage60style: 'title60'
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
    }
});