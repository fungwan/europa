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
        "<p><a href='" + config.email.sitehost + "enterprise/confirm.html?ukey=" + ukey + "'>" + config.email.sitehost + "enterprise/confirm.html?ukey=" + ukey + "</a></p>" +
        "<p>(如果您无法点击此链接，请将它复制到浏览器地址栏后访问)</p>";
    exports.sendMail({
        from: from,
        to: to,
        subject: subject,
        html: html
    });
};
/**
 * 找回密码通知邮件
 * @param {String} who 接收人的邮件地址
 * @param {String} token 重置用的token字符串
 * @param {String} name 接收人的用户名
 */
exports.sendMailFindPwd = function (toemail, ukey) {
    var currdate = util.format('%s %s', new Date().toLocaleDateString(), new Date().toLocaleTimeString());
    var from = util.format('%s <%s>', 'erathink', config.email.mail_options.auth.user);
    var to = toemail;
    var subject = '浪新二维码营销平台-账号密码找回';
    var html = "_______<img src='http://erathink.com/wp-content/uploads/2015/10/logo_txt-11.png'>_____________________________________________________" + "<p/>" +
        "<b>亲爱的用户</b><p>您好：</p>" + "您于 " + currdate + " 使用浪新二维码平台用户密码找回 " + toemail + " ，点击以下链接，即可重新设置帐号密码：" +
        "<p><a href='" + config.email.sitehost + "enterprise/forgetpwd.html?ukey=" + ukey + "'>" + config.email.sitehost + "enterprise/forgetpwd.html?ukey=" + ukey + "</a></p>" +
        "<p>(如果您无法点击此链接，请将它复制到浏览器地址栏后访问)</p>";
    exports.sendMail({
        from: from,
        to: to,
        subject: subject,
        html: html
    });
};

/**
 * 发送二维码邮件
 */
exports.sendMcdQRMail = function (toemail, attachments) {
    var currdate = util.format('%s %s', new Date().toLocaleDateString(), new Date().toLocaleTimeString());
    var from = util.format('%s <%s>', 'erathink', config.email.mail_options.auth.user);
    var subject = "浪新二维码营销平台-二维码附件";
    var html = "_______<img src='http://erathink.com/wp-content/uploads/2015/10/logo_txt-11.png'>_____________________________________________________" + "<p/>"
        + "<b>亲爱的用户</b><p>您好：</p>" + "您于 " + currdate + " 在浪新二维码平台获取商品二维码，请收取附件。";
    exports.sendMail({
        from: from,
        to: toemail,
        subject: subject,
        html: html,
        attachments: attachments
    });
};

/**
 * 发送加盟申请邮件
 */
exports.sendApplyJoinMail = function (toemail, userinfo) {
    var currdate = util.format('%s %s', new Date().toLocaleDateString(), new Date().toLocaleTimeString());
    var from = util.format('%s <%s>', 'erathink', config.email.mail_options.auth.user);
    var subject = "申请者加盟信息";
    var html = "<p>姓名：" + userinfo.name + "</p>";
        html += "<p>性别：" +  userinfo.sex + "</p>";
        html += "<p>联系电话：" +  userinfo.phone + "</p>";
        html += "<p>邮箱：" +  userinfo.email + "</p>";
        html += "<p>加盟方式：" +  userinfo.method + "</p>";
        html += "<p>加盟城市：" +  userinfo.city + "</p>";
    exports.sendMail({
        from: from,
        to: toemail,
        subject: subject,
        html: html
    });
};