/**
 * Created by ivan on 15/11/28.
 */
var moment = require('moment');
var config = require('../../config');
var crypto = require('crypto');
var logger = require('../common/logger');
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
        str=str.trim();
        return str;
    },
    isEntname:function(str){
        if(str){
            str=str.trim();
            if(verifier.isStringLen(str,25,1)){
                return true;
            }else {
                return false;
            }
        }else {
            return false;
        }
    },
    isContact:function(str){
        if(str){
            strchomp=str.trim();
            if(verifier.isStringLen(strchomp,25,1)&&verifier.isChineseOrEnglish(strchomp)){
                return true;
            }else {
                return false;
            }
        }else {
            return false;
        }

    },
    isAddress:function(str){
        if(str){
            str=str.trim();
            if(str.length<=50){
                return true;
            }else {
                return false;
            }
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
        if(str){
            var myReg = /^[-._A-Za-z0-9]+@([_A-Za-z0-9]+\.)+[A-Za-z0-9]{2,3}$/;
            logger.info('',str);
            str=str.trim();
            if (myReg.test(str)){
                return verifier.isStringLen(str,50,5);
            }
            else {
                return false;
            }
        }else {
            return false;
        }
    },

    isEmailOrEmpty:function(str){
        if(str && str.length>0){
            var myReg = /^[-._A-Za-z0-9]+@([_A-Za-z0-9]+\.)+[A-Za-z0-9]{2,3}$/;
            logger.info('',str);
            str=str.trim();
            if (myReg.test(str)){
                return verifier.isStringLen(str,50,5);
            }
            else {
                return false;
            }
        }else {
            return true;
        }
    },
    /**
     * 手机号
     * @param str
     * @returns {boolean}
     */
    isMobile:function(str) {

        var re = /(^0?(1[0-9]{2})[0-9]{8}$)|(^0[0-9]{2,3}(\-|\s)[2-9][0-9]{6,7}((\-|\s)[0-9]{1,4})?$)/ig;
        if (re.test(str)) {
            return true;
        } else {
            return false;
        }
    },

    isMobileOrEmpty:function(str) {

        if(str&&str.length>0) {
            var re = /(^0?(1[0-9]{2})[0-9]{8}$)|(^0[0-9]{2,3}(\-|\s)[2-9][0-9]{6,7}((\-|\s)[0-9]{1,4})?$)/ig;
            if (re.test(str)) {
                return true;
            } else {
                return false;
            }
        }else
            return true;
    },
    /**
     * 带区号的电话
     * @param str
     * @returns {boolean}
     */
    isPhone:function(str){
        if(str) {
            str = str.trim();
            var re = /(^\d{11}$)|(^((\+?86)|(\(\+86\)))?(\d{3,4})?(\-|\s)?\d{7,8}((\-|\s)\d{3,4})?$)/ig;
            if (re.test(str)) {
                return true;
            } else {
                return false;
            }
        }else {
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
        if(str){
            //var  re= /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/;
            var re = /^((([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29))\s(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9]))?$/g;
            if(re.test(str)){
                return true;
            }else{
                return false;
            }
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
        if(str){
            str=str.trim();
            //var  re= /^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/;
            var re = /^(([0-9]{3}[1-9]|[0-9]{2}[1-9][0-9]{1}|[0-9]{1}[1-9][0-9]{2}|[1-9][0-9]{3})-(((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01]))|((0[469]|11)-(0[1-9]|[12][0-9]|30))|(02-(0[1-9]|[1][0-9]|2[0-8]))))|((([0-9]{2})(0[48]|[2468][048]|[13579][26])|((0[48]|[2468][048]|[3579][26])00))-02-29)$/g;
            if(re.test(str)){
                return true;
            }else{
                return false;
            }
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
        var  re= /^((20|21|22|23|[0-1]\d)\:[0-5][0-9])(\:[0-5][0-9])?$/g;
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

        //var  re= /^[-\+]?\d+(\.\d+)?$/;
        var re  = /^\d+(\.\d+)?$/;
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
           // var myReg=new RegExp("^(?![^a-zA-Z]+$)(?!\D+$).{6,20}$");
            var myReg=/^(?![^a-zA-Z]+$)(?!\D+$).{6,20}$/;
            str=str.trim();
            logger.info('',myReg.test(str));
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
    isPage:function(str){
        if(str && str!=''){
            str=str.trim();
            if(Number(str)<1000&&Number(str)>=1){
                return true;
            }else {
                return false;
            }
        } else
            return false;
    },
    isSize:function(str){
    if(str && str!=''){
        str=str.trim();
        if(Number(str)<=10000&&Number(str)>=1){
            return true;
        }else {
            return false;
        }
    } else
        return false;
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
    },
    isUUID:function (s) {
        if(typeof s == "string" && !!s)
        {
            var re = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
            console.info(s);
            if(re.test(s)){
                return true
            }else{
                return false
            }
        }
        else
        {
            return false;
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
exports.getInt=function(str){
    return parseInt(Number(str));
}
exports.genPwd = function(pwd){
    return crypto.createHash("md5").update(pwd+config.salt).digest('hex');
}

exports.begdate = function(date){
    return moment(date).format("YYYY-MM-DD ")+"00:00:00";
}
exports.begtime =function(time){
    return moment(time).format("YYYY-MM-DD HH:mm:")+"00";
}
exports.enddate = function(date){
    return moment(date).format("YYYY-MM-DD ")+"23:59:59";
}
exports.endtime =function(time){
    return moment(time).format("YYYY-MM-DD HH:mm:")+"59";
}
exports.queryenddate = function(date){
    return moment(date).add(1, 'days').format("YYYY-MM-DD");
}
exports.verifier=verifier;
exports.verifyData=verifyData;

exports.isEmptyObject = function(obj) {
    var name;
    for ( name in obj ) {
        return false;
    }
    return true;
};

/**
 * 用指定字符C为字符串补足位数
 * @param str
 * @param c
 * @param lenght
 * @returns {*}
 */
function padLeft(str,c,lenght){
    if(str.length >= lenght)
        return str;
    else
        return padLeft(c +str,c,lenght);
};

exports.padLeft=padLeft;

exports.des={
    algorithm:{ ecb:'des-ecb',cbc:'des-cbc' },
    encrypt:function(plaintext,iv,key){
        var key = new Buffer(key);
        var iv = new Buffer(iv ? iv : 0);
        var cipher = crypto.createCipher(this.algorithm.ecb, key);
        cipher.setAutoPadding(true); //default true
        var ciph = cipher.update(plaintext, 'utf8', 'base64');
        ciph += cipher.final('base64');
        return ciph;
    },
    decrypt:function(encrypt_text,iv,key){
        var key = new Buffer(key);
        var iv = new Buffer(iv ? iv : 0);
        var decipher = crypto.createDecipher(this.algorithm.ecb, key, iv);
        decipher.setAutoPadding(true);
        var txt = decipher.update(encrypt_text, 'base64', 'utf8');
        txt += decipher.final('utf8');
        return txt;
    }
};


