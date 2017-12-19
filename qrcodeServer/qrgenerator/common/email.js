/**
 * Created by taoj on 2015/11/27.
 */
var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var config = require('../../config');
var logger = require('../common/logger');
var util = require('util');

function sendMail(data) {
    logger.info(data.to, '开始发送邮件');
    var transporter = nodemailer.createTransport(smtpTransport(config.email.mail_options));
    transporter.sendMail(data, function (error) {
        if (error) {
            logger.error(data.to, '发送邮件失败:' + error);
        } else {
            logger.info(data.to, '发送邮件成功');
        }
    });
}

exports.sendMail = sendMail;

/**
 * 发送激活通知邮件
 * @param {String} who 接收人的邮件地址
 * @param {String} token 重置用的token字符串
 * @param {String} name 接收人的用户名
 */
exports.sendActiveMail = function (toemail, ukey) {
    var currdate = util.format('%s %s', new Date().toLocaleDateString(), new Date().toLocaleTimeString());
    var from = util.format('%s <%s>', 'erathink', config.email.mail_options.auth.user);
    var to = toemail;
    var subject = '浪新二维码营销平台-账号激活';
    var html = "_______<img src='http://erathink.com/wp-content/uploads/2015/10/logo_txt-11.png'>_____________________________________________________" + "<p/>" +
        "<b>亲爱的用户</b><p>您好：</p>" + "您于 " + currdate + " 注册浪新二维码平台 " + toemail + " ，点击以下链接，即可激活该帐号：" +
        "<p><a href='" + config.email.sitehost + "enterprise/do.html?p=confirm&ukey=" + ukey + "'>" + config.email.sitehost + "enterprise/do.html?p=confirm&ukey=" + ukey + "</a></p>" +
        "<p>(如果您无法点击此链接，请将它复制到浏览器地址栏后访问)</p>";
    exports.sendMail({
        from: from,
        to: to,
        subject: subject,
        html: html
    });
};
