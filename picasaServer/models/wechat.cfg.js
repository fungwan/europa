/**
 * Created by Administrator on 2016/2/4.
 */

// noncestr
var createNonceStr = function() {
    return Math.random().toString(36).substr(2, 15);
};


module.exports = {
    grant_type: 'client_credential',
    appid: 'xxxxxxxxxxxxxxx',
    secret: 'xxxxxxxxxxxxxxxxxxxxxxxxxx',
    noncestr:createNonceStr(),
    accessTokenUrl:'https://api.weixin.qq.com/cgi-bin/token',
    ticketUrl:'https://api.weixin.qq.com/cgi-bin/ticket/getticket',
    cache_duration:1000*60*60*24 //缓存时长为24小时
};