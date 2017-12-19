/**
 * Created by root on 15-11-30.
 */
var verifier=require('../../common/tool').verifier;
/**
 * 用户基本信息
 * @type {{createNew: Function}}
 */
var pa = {
    createNew: function(){
        var info = {
            useraccount: '',
            userpwd: ''
        };
        return info;
    },
    verify:{
        useraccount: verifier.isEmail,
        userpwd: verifier.isPwd
    }
};


module.exports =pa;
