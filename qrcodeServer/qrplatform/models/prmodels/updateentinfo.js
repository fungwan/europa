var verifier=require('../../common/tool').verifier;
var arg= {
    createNew: function () {
        var info = {
            entname:'',
            entcontact:'',
            entphone:'',
            entaddr:'',
            areacode: '',
            imageurl:''
        };
        return info;
    },
    verify:{
        entphone: verifier.isPhone,
        entname:verifier.isEntname,
        entcontact:verifier.isContact,
        areacode: verifier.isInteger
    }
};
module.exports =arg;