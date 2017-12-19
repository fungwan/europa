/**
 * Created by ivan on 15/11/30.
 */
var verifier=require('../../common/tool').verifier;
var isType = function(str){
    if(str == "pic" || str == "txt") return true;
    return false;
}

/**
 * 用户基本信息
 * @type {{createNew: Function}}
 */
var gen = {
    createNew: function(){
        var info = {
            projectid: '',
            amount: '',
            size:''
        };
        return info;
    },
    verify:{
        projectid: verifier.isString,
        amount: verifier.isInteger,
        size:verifier.isInteger
    }
};
var genNew = {
    createNew: function(){
        var info = {
            batchid: '',
            amount: '',
            size:''
        };
        return info;
    },
    verify:{
        batchid: verifier.isString,
        amount: verifier.isInteger,
        size:verifier.isInteger
    }
};

module.exports.gen = gen;
module.exports.genNew = genNew;