var verifier=require('../../common/tool').verifier;
var arg= {
    createNew: function () {
        var info = {
            useraccount:''
        };
        return info;
    },
    verify:{
        useraccount: verifier.isEmail
    }
}
module.exports =arg;