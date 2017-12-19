/**
 * Created by ivan on 15/11/28.
 */
var moment = require('moment');
var config = require('../../config');
var crypto = require('crypto');
var logger = require('../common/logger');
var fs = require('fs');

String.prototype.trim=function(){
    return this.replace(/(^\s*)|(\s*$)/g, "");
}

var verifier={
    /**
     * 验证是否字符串，字符串只能包括字母、数字与下划线
     * @param s
     * @param maxLen 最大长度
     * @param minLen 最小长度
     * @returns {boolean}
     */
    isStringLen:function (s,maxLen,minLen) {
        if(typeof s == "string" && !!s)
        {
            var
                myReg = new RegExp("^.{"+minLen+","+maxLen+"}$");
            if(myReg.test(s)){
                return true
            }else{
                return false
            }
        }
        else
        {
            return false;
        }
    },

    isStringOrEmptyLen:function(s,maxLen,minLen){
        if(!s) return true;
        if(typeof s == "string" && !!s)
        {
            var
                myReg = new RegExp("^\\\w{"+maxLen+","+minLen+"}$");
            if(myReg.test(s)){
                return true
            }else{
                return false
            }
        }
        else
        {
            return false;
        }
    },

    /**
     * 验证是否字符串，字符串只能包括字母、数字与下划线
     * @param s
     * @param maxLen 最大长度
     * @param minLen 最小长度
     * @returns {boolean}
     */
    isString:function (s) {
        if(typeof s == "string" && !!s) return true;
        else return false;
    },

    isStringOrEmpty:function(s){
        if(!s) return true;
        if(typeof s == "string" && !!s)
        {
            var
                myReg = new RegExp("^\\\w");
            if(myReg.test(s)){
                return true
            }else{
                return false
            }
        }
        else
        {
            return false;
        }
    },
    delSpace:function(str){
        var reSpace=/^\s*(.*?)\s*$/;
        var strchomp = str.replace(reSpace,"$1");
        return strchomp;
    },
    isContact:function(str){
        str=str.trim();
       if(verifier.isStringLen(str,25,1)&&verifier.isChineseOrEnglish(str)){
           return true;
       }else {
           return false;
       }
    },
    isAddress:function(str){
    str=str.trim();
    if(str.length<=50){
        return true;
    }else {
        return false;
    }
},
    /**
     * 邮箱验证
     * @param str
     * @returns {boolean}
     */
    isEmail:function(str){
        var myReg = /^[-._A-Za-z0-9]+@([_A-Za-z0-9]+\.)+[A-Za-z0-9]{2,3}$/;
        logger.info('',str);
        str=str.trim();
        if (myReg.test(str)){
            return verifier.isStringLen(str,50,5);
        }
        else {
            return false;
        }
    },
    /**
     * 手机号
     * @param str
     * @returns {boolean}
     */
    isMobile:function(str) {
        str=str.trim();
        var re = /(^0?(13[0-9]|15[012356789]|18[0236789]|14[57])[0-9]{8}$)|(^0[0-9]{2,3}(\-|\s)[2-9][0-9]{6,7}((\-|\s)[0-9]{1,4})?$)/ig;
        if (re.test(str)) {
            return true;
        } else {
            return false;
        }
    },
    /**
     * 带区号的电话
     * @param str
     * @returns {boolean}
     */
    isPhone:function(str){
        str=str.trim();
        var  re = /(^0?(13[0-9]|15[012356789]|18[0236789]|14[57])[0-9]{8}$)|(^0[0-9]{2,3}(\-|\s)[2-9][0-9]{6,7}((\-|\s)[0-9]{1,4})?$)/ig;
        if(re.test(str)){
            return true;
        }else{
            return false;
        }
    },
    /**
     * Ip地址
     * @param str
     * @returns {boolean}
     */
    isIp:function(str){
       // var  re=/^(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])$/;
        var re=/^((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d)(.((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d)){3}$/ig;
        if(re.test(str)){
            return true;
        }else{
            return false;
        }
    },
    /**
     * 身份证
     * @param str
     * @returns {boolean}
     */
    isIdcard:function(str){
        var  re=/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        if(re.test(str)){
            return true;
        }else{
            return false;
        }
    },
    /**
     * 域名
     * @param str
     * @returns {boolean}
     */
    isDomain:function(str){
        var re=/^[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+.?$/ig;
        if(re.test(str)){
            return true;
        }else{
            return false;
        }
    },
    /**
     * 邮政编码
     * @param str
     * @returns {boolean}
     */
    isZip:function(str){
        var  re= /^[1-9]\d{5}$/;
        if(re.test(str)){
            return true;
        }else{
            return false;
        }
    },
    /**
     * 空字符串
     * @param str
     * @returns {boolean}
     */
    isEmptyString:function(str){
        str=str.trim();
        return !(typeof str == "string" && !!str);
    },
    /**
     * 非空字符串
     * @param str
     * @returns {boolean}
     */
    isNotAllowEmpty: function (str) {
        str = str ? str.trim() : '';
        return (typeof str == "string" && !!str);
    },
    /**
     * 日期时间格式（YYY-MM-dd HH:mm:ss）
     * @param str
     * @returns {boolean}
     */
    isDateTime:function(str){
        var  re= /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2}) (\d{1,2}):(\d{1,2})(:(\d{1,2}))?$/;
        if(re.test(str)){
            return true;
        }else{
            return false;
        }
    },
    /**
     * 日期（yyy-MM-dd）
     * @param str
     * @returns {boolean}
     */
    isDate:function(str){
        var  re= /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/;
        if(re.test(str)){
            return true;
        }else{
            return false;
        }
    },
    /**
     * 时间（HH:mm:ss)
     * @param str
     * @returns {boolean}
     */
    isTime:function(str){
        var  re= /^((20|21|22|23|[0-1]\d)\:[0-5][0-9])(\:[0-5][0-9])?$/;
        if(re.test(str)){
            return true;
        }else{
            return false;
        }
    },
    /**
     * 是否英文字母
     * @param str
     * @returns {boolean}
     */
    isLetter:function(str){
        var  re= /^[a-zA-Z]+$/;
        if(re.test(str)){
            return true;
        }else{
            return false;
        }
    },
    /**
     * 是否整数
     * @param str
     * @returns {boolean}
     */
    isInteger:function(str){
        var  re= /^[-+]?\d*$/;
        if(re.test(str)){
            return true;
        }else{
            return false;
        }
    },
    /**
     * 是否小数
     * @param str
     * @returns {boolean}
     */
    isFloat:function(str){
        var  re= /^[-\+]?\d+(\.\d+)?$/;
        if(re.test(str)){
            return true;
        }else{
            return false;
        }
    },
    /**
     * 是否中文
     * @param str
     * @returns {boolean}
     */
    isChinese:function(str){
        var  re= /^[\u0391-\uFFE5]+$/;
        if(re.test(str)){
            return true;
        }else{
            return false;
        }
    },
    /*
    *只能中英文
     * @param str
     * @returns {boolean}
    */
    isChineseOrEnglish:function(str){
        var re=/^[A-Za-z\u4e00-\u9fa5]+$/;
        if(re.test(str)){
            return true;
        }else{
            return false;
        }
    },
    /*
     * 是否金额
     * @param str
     * @returns {boolean}
     */
    isMoney:function(str){
        var  re= /^((\d{1,3}(,\d{3})*)|(\d+))(\.\d{2})?$/;
        if(re.test(str)){
            return true;
        }else{
            return false;
        }
    },
    isPwd:function(str) {
        if (typeof str == "string" && !!str) {
            var myReg=new RegExp("^(?![^a-zA-Z]+$)(?!\D+$).{6,20}$");
            str=str.trim();
            if (myReg.test(str)) {
                return true
            } else {
                return false
            }
        }
        else {
            return false;

        }
    },
    allownull:function(f,str){
        if(str && str!=''){
            var ex='f(str)';
            return eval(ex);
        }
        else
            return f;
    },

    /**
     * 判断是否为数组
     * @param obj
     */
    isArray:function(obj){
        if(!obj) return false; //空对象
        return (Object.prototype.toString.call(obj) === '[object Array]' && obj.length >0);
    },

    /**
     * 判断是否为字符串数组
     * @param str
     */
    isStringArray:function(obj){
        //判断是否为数组
        if(!verifier.isArray(obj)) return false;

        //判断数组内元素是否为string
        for(var str in obj){
            if(!verifier.isString(obj[str])) return false;
        }
        return true;
    },

    isIntegerArray:function(obj){
        //判断是否为数组
        if(!verifier.isArray(obj)) return false;

        //判断数组内元素是否为整型
        for(var integer in obj){
            if(!verifier.isInteger(obj[integer])) return false;
        }
    }


};
/**
 * 校验数据
 * @param v 待校验对象
 * @param type 对象类型
 * @returns {boolean}
 */
function verifyData(v,type){
    if(type) {
        if ('verify' in type) {
            var re = true;
            for (var key in type.verify) {
                var fun = type.verify[key];
                var vaule = v[key];
                if(typeof fun == "string") {
                    if(vaule && vaule!='') {
                        var ex='verifier.' + fun + '(vaule)';
                        re = eval(ex);
                        if(!re){
                            logger.error(null,'参数:'+key+'校验失败！');
                        }
                    }
                    else
                        re=true;
                }
                else{
                    re = fun(vaule);
                    if(!re){
                        logger.error(null,'参数:'+key+'校验失败！');
                    }
                }
                if (!re)
                    break;
            }
            return re;
        }
        else
            return true;
    }
    else{
        return true;
    }
}

exports.date = function(){
    return moment().format(config.dateformat);
}

exports.genPwd = function(pwd){
    return crypto.createHash("md5").update(pwd+config.salt).digest('hex');
}

exports.verifier=verifier;
exports.verifyData=verifyData;

exports.isEmptyObject = function(obj) {
    var name;
    for ( name in obj ) {
        return false;
    }
    return true;
}

exports.init = function(){
    logger.info(config.systemUser, "初始化文件夹");
    try{
        if(!fs.existsSync(config.qrgenpath))
            fs.mkdirSync(config.qrgenpath);

    }catch(err){
        logger.error(config.systemUser, "初始化文件夹出错",err);
    }
    logger.info(config.systemUser, "初始化文件夹结束");
}

