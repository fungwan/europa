/**
 * Created by san on 2015/12/14.
 */
var verifier=require('../../common/tool').verifier;

var queryverify = function(obj){
    //TODO:需要补全
    return true;
};

var lotterylist={
    createNew: function(){
        var info = {
            projectid:'json'
        };
        return info;
    },
    //verify:{
    //    projectid:verifier.isUUID
    //}
};

var projprogress= {
    createNew: function(){
        var info = {
            projectid:'',
            method:'',
            begtime:'',
            endtime:''
        };
        return info;
    },
    verify:{
        projectid:verifier.isUUID,
        begtime:verifier.isDate,
        endtime:verifier.isDate
    }
};

var projeffect= {
    createNew: function(){
        var info = {
            projectid:'',
            begtime:'',
            endtime:''
        };
        return info;
    },
    verify:{
        projectid:verifier.isUUID,
        begtime:verifier.isDate,
        endtime:verifier.isDate
    }
};

var rqprogress= {
    createNew: function(){
        var info = {
            id:''
        };
        return info;
    },
    verify:{
        id:verifier.isUUID
    }
};

var lotteryprogress ={
    createNew: function(){
        var info = {
            id:'json',
            begtime:'',
            endtime:'',
            areacode:''
        };
        return info;
    },
    verify:{
        begtime:verifier.isDate,
        endtime:verifier.isDate
    }
};

var lotteryarea ={
    createNew: function(){
        var info = {
            id:'json',
            begtime:'',
            endtime:'',
            areacode:'',
            lotteryname:'',
            lotteryprice:0,
        };
        return info;
    },
    verify:{
            begtime:verifier.isDate,
            endtime:verifier.isDate
    }
};

var lotterydate ={
    createNew: function(){
        var info = {
            id:'json',
            begtime:'',
            endtime:'',
            areacode:'',
            lotteryname:'',
            lotteryprice:0,
            grouptype:''
        };
        return info;
    },
    verify:{
        begtime:verifier.isDate,
        endtime:verifier.isDate
    }
};

var lotterytimes ={
    createNew: function(){
        var info = {
            id:'json',
            areacode:'',
            lotteryname:'',
            lotteryprice:0,
            begtime:'',
            endtime:'',
            topnumber:''
        };
        return info;
    },
    verify:{
        begtime:verifier.isDate,
        endtime:verifier.isDate
    }
};

var qaprogress ={
    createNew: function(){
        var info = {
            id:''
        };
        return info;
    },
    verify:{
        id:verifier.isString
    }
};


var qalist ={
    createNew: function(){
        var info = {
            id:''
        };
        return info;
    },
    verify:{
        id:verifier.isString
    }
};
var qaanalyze ={
    createNew: function(arg){
        var info = {
            id:'',
            areacode:'string',
            begtime:'',
            endtime:''
        };
        return info;
    },
    verify:{
        id:verifier.isString,
        begtime:verifier.isDate,
        endtime:verifier.isDate
    }
};
var qaanalyzenum={
    createNew: function(arg){
        var info = {
            id:'',
            areacode:'',
            begtime:'',
            endtime:'',
            grouptype:''

        };
        return info;
    },
    verify:{
        id:verifier.isString,
        begtime:verifier.isDate,
        endtime:verifier.isDate,
        //areacode:verifier.isString,
        grouptype:verifier.isString
    }
};

var orderanalyze={
    createNew: function(arg){
        var info = {
            productid:'',
            areacode:'',
            begtime:'',
            endtime:''
        };
        return info;
    }
};

var pointcomponent={
    createNew: function(arg){
        var info = {
            areacode:'',
            begtime:'',
            endtime:''
        };
        return info;
    }
};

var answeranalyze ={
    createNew: function(){
        var info = {
            details:''
        };
        return info;
    },
    verify:{
        details:verifier.isString
    }
};

var customerarea = {
    createNew: function () {
        var info = {
            entid: '',
            begtime: '',
            endtime: ''
        };
        return info;
    },
    verify: {
        entid: verifier.isString,
        begtime: verifier.isDate,
        endtime: verifier.isDate
    }
};
var customerdate ={
    createNew: function(){
        var info = {
            entid:'',
            areacode:'',
            begtime:'',
            endtime:'',
            grouptype:''
        };
        return info;
    },
    verify:{
        entid:verifier.isString,
        areacode:verifier.isString,
        begtime:verifier.isDate,
        endtime:verifier.isDate,
        grouptype:verifier.isString
    }
};

module.exports={
    lotterylist:lotterylist,
    projprogress:projprogress,
    projeffect:projeffect,
    rqprogress:rqprogress,
    lotteryprogress :lotteryprogress,
    lotteryarea: lotteryarea,
    lotterydate:lotterydate,
    lotterytimes:lotterytimes,
    qaprogress:qaprogress,
    qalist:qalist,
    qaanalyze:qaanalyze,
    orderanalyze:orderanalyze,
    pointcomponent:pointcomponent,
    qaanalyzenum:qaanalyzenum,
    answeranalyze:answeranalyze,
    customerarea:customerarea,
    customerdate:customerdate
}


