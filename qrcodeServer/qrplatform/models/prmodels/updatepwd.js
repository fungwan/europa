var verifier=require('../../common/tool').verifier;
var arg= {
    createNew: function () {
        var info = {
            userpwd: '',
            usernewpwd:''
        };
        return info;
    },
    verify:{
        userpwd: verifier.isPwd,
        usernewpwd: verifier.isPwd
    }
}
module.exports =arg;