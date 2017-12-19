/**
 * Created by ivan on 15/11/30.
 */
var verifier=require('../../common/tool').verifier;
/**
 * 用户基本信息
 * @type {{createNew: Function}}
 */
var list = {
    createNew: function(){
        var info = {
            page: '',
            size: ''
        };
        return info;
    },
    verify:{
        page: verifier.isInteger,
        size: verifier.isInteger
    }
};

var get = {
    createNew: function(){
        var info = {
            id: ''
        };
        return info;
    },
    verify:{
        id: verifier.isString
    }
};

var markread = {
    createNew: function(){
        var info = {
            list: []
        };
        return info;
    },
    verify:{
        list: verifier.isStringArray
    }
};

module.exports = {
    list: list,
    get: get,
    markread: markread
}