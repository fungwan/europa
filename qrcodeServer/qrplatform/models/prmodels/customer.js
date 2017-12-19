/**
 * Created by ivan on 15/11/30.
 */
var verifier=require('../../common/tool').verifier;


var queryverify = function (obj) {
    if(!obj){
        return false;
    }
    var query=JSON.parse(obj);
    if(query.custtype=="1"||query.custtype=="2"){
        return true;
    }else{
        return false;
    }
};

var customerverify = function(obj){
    //TODO:需要补全
    return true;
};


/**
 * 用户基本信息
 * @type {{createNew: Function}}
 */
var list = {
    createNew: function(){
        var info = {
            page: '',
            size: '',
            query:{},
            sort: ''
        };
        return info;
    },
    verify:{
        page: verifier.isPage,
        size: verifier.isSize,
        query:queryverify
    }
};
var userList = {
    createNew: function(){
        var info = {
            page: '',
            size: '',
            query:""
        };
        return info;
    },
    verify:{
        page: verifier.isPage,
        size: verifier.isSize
    }
};
var setrole = {
    createNew: function(){
        var info = {
            userid: '',
            roleid: ''
        };
        return info;
    },
    verify:{
        roleid: customerverify
    }
};
var get = {
    createNew: function(){
        var info = {
            custid: ''
        };
        return info;
    },
    verify:{
        custid: verifier.isString
    }
};

var update = {
    createNew: function(){
        var info = {
            customer:{}
        };
        return info;
    },
    verify: {
        customer:customerverify
    }
};
var updateLocked = {
    createNew: function(){
        var info = {
            userid: "",
            disabled: ""
        }
        return info;
    },
    verify: {
        disabled:customerverify
    }
};
var group = {
    createNew: function(){
        var info = {
            detail: ''
        };
        return info;
    },
    verify: {
        detail:verifier.isString
    }
};

var customerarea = {
    createNew: function() {
        var info = {
            areacode: "",
            begtime: "",
            endtime: ""
        };
        return info;
    },
    verify: {
        endtime:verifier.isString
    }
};

var customernumbers = {
    createNew: function() {
        var info = {
            areacode: "",
            page:"int",
            size:"int",
            categoryid: "",
            minpoint: "",
            maxpoint: ""
        };
        return info;
    }
};

var customerdate = {
    createNew: function() {
        var info = {
            areacode: "",
            begtime: "",
            endtime: "",
            grouptype: ""
        };
        return info;
    },
    verify: {
        endtime:verifier.isString
    }
};

var test = {
    createNew: function() {
        var info = {
            a:''
        };
        return info;
    },
    verify: {
        a:verifier.isString
    }
};

var getSummary = {
    createNew: function() {
        var info = {
            custid:''
        };
        return info;
    },
    verify: {
        custid:verifier.isString
    }
};

var getCustInfo = {
    createNew: function() {
        var info = {
            custid:''
        };
        return info;
    },
    verify: {
        custid:verifier.isString
    }
};

var updateBaseInfo = {
    createNew: function() {
        var info = {
            customer:''
        };
        return info;
    },
    verify: {
        customer:customerverify
    }
};


var resetPayPassword = {
    createNew: function() {
        var info = {
            custid:'',
            password:'',
            oldpassword:''
        };
        return info;
    },
    verify: {
        custid:verifier.isString,
        password:verifier.isString
    }
};

var resetSaftInfo = {
    createNew: function() {
        var info = {
            custid:'',
            email:'',
            phone:'',
            password:''
        };
        return info;
    },
    verify: {
        custid:verifier.isString,
        email:verifier.isEmailOrEmpty,
        phone:verifier.isMobileOrEmpty
    }
};


var getAddressList = {
    createNew: function() {
        var info = {
            custid:''
        };
        return info;
    },
    verify: {
        custid:verifier.isString
    }
};


var readMessage = {
    createNew: function() {
        var info = {
            custid:'',
            messageType:''
        };
        return info;
    },
    verify: {
        custid:verifier.isString,
        messageType:verifier.isString
    }
};

var updateAddress = {
    createNew: function() {
        var info = {
            address:''
        };
        return info;
    },
    verify: {
        address:verifier.isString
    }
};


var setDefaultAddress = {
    createNew: function() {
        var info = {
            custid:'',
            address:''
        };
        return info;
    },
    verify: {
        custid:verifier.isString,
        address:verifier.isString
    }
};


var delAddress = {
    createNew: function() {
        var info = {
            custid:'',
            address:''
        };
        return info;
    },
    verify: {
        custid:verifier.isString,
        address:verifier.isString
    }
};


var checkpasswordstate = {
    createNew: function() {
        var info = {
        };
        return info;
    }
};

var resetPhoneNo = {
    createNew: function() {
        var info = {
            custid:'',
            checkcode:'',
            phone:'',
            password:''
        };
        return info;
    },
    verify: {
        custid:verifier.isString,
        phone:verifier.isMobileOrEmpty
    }
};


module.exports = {
    userList:userList,
    updateLocked:updateLocked,
    setrole:setrole,
    list: list,
    get: get,
    update: update,
    group: group,
    customerarea: customerarea,
    customernumbers: customernumbers,
    customerdate: customerdate,
    test:test,
    getSummary:getSummary,
    getCustInfo:getCustInfo,
    updateBaseInfo:updateBaseInfo,
    resetPayPassword:resetPayPassword,
    resetSaftInfo:resetSaftInfo,
    updateAddress:updateAddress,
    getAddressList:getAddressList,
    readMessage:readMessage,
    setDefaultAddress:setDefaultAddress,
    delAddress:delAddress,
    checkpasswordstate:checkpasswordstate,
    resetPhoneNo:resetPhoneNo
};