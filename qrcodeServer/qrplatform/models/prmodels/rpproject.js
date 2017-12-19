/**
 * Created by shuwei on 15/12/27.
 */
var verifier=require('../../common/tool').verifier;
var lotterydetails = {
    createNew: function () {
        var info = {
            details: '',
            page: "",
            size: "",
            sort: []
        };
        return info;
    },
    verify:{
        details: verifier.isString,
        page: verifier.isStringOrEmpty,
        size: verifier.isStringOrEmpty
    }
};
var distributeprize = {
    createNew: function () {
        var info = {
            recid: ''
        };
        return info;
    },
    verify:{
        recid: verifier.isString
    }
};
module.exports = {
    lotterydetails: lotterydetails,
    distributeprize: distributeprize
};