/**
 * Created by fdr on 2016/1/13.
 */
var verifier=require('../../common/tool').verifier;
var pointdetails = {
    createNew: function () {
        var info = {
            begtime:"",
            endtime:"",
            areacode:"",
            projectid:"",
            keywords:"",
            minPoint: "",
            maxPoint: "",
            page: "",
            size: "",
            sort: []
        };
        return info;
    },
    verify:{
        begtime: verifier.isDate,
        endtime: verifier.isDate,
        areacode: verifier.isStringOrEmpty,
        projectid: verifier.isUUID,
        keywords: verifier.isStringOrEmpty,
        minPoint: verifier.isStringOrEmpty,
        maxPoint: verifier.isStringOrEmpty,
        page: verifier.isString,
        size: verifier.isString
    }
};
module.exports = {
    pointdetails: pointdetails
};