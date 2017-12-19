/**
 * Created by Erathink on 2016/12/15.
 */
var verifier = require('../../common/tool').verifier;

/**
 * list 查询条件参数对象及验证定义
 * @type {{createNew: Function, verify: {begdate: (*|boolean), enddate: (*|boolean), state: (*|boolean)}}}
 */
var mcdList = {
    createNew: function () {
        var info = {
            query:'',
            page: 1,
            size: 10
        };
        return info;
    },
    verify: {
       page: verifier.isPage,
       size: verifier.isSize
    }
};

var qrBatchList = {
    createNew: function () {
        var info = {
            QRbatch:'',
            mcdId:'',
            page: 1,
            size: 10
        };
        return info;
    },
    verify: {
       page: verifier.isPage,
       size: verifier.isSize
    }
};

var mcdById = {
    createNew: function () {
        var info = {
            mcdId:''
        };
        return info;
    },
    verify: {
       // mcdId: verifier.isUUID
    }

};

var svOrUpd = {
    createNew: function () {
        var info = {
            mcdid:'',
            mcdname: '',
            categoryid: '',
            categoryname: '',
            entid: '',
            price:0.0,
            point:0,
            mcdbrand:'',
            creator:'',
            createtime:'date',
            updater:'',
            updatetime:'date',
            mcddesc:'',
            state:''
        };
        return info;
    },
    verify: {

    }

};

var delMcd = {
    createNew: function () {
        var info = {
            mcdId: ''
        };
        return info;
    },
    verify: {
        mcdId: verifier.isString
    }
}

var categotyList = {
    createNew: function () {
        var info = {
            page: '',
            size: '',
            query: {}
        };
        return info;
    },
    verify: {
        page: verifier.isInteger,
        size: verifier.isInteger
    }
};

var categotyListEx = {
    createNew: function () {
        var info = {
            page: '',
            size: '',
            projectid:''
        };
        return info;
    },
    verify: {
        page: verifier.isInteger,
        size: verifier.isInteger
    }
};

var ctgListSelected = {
    createNew: function () {
        var info = {
            projectid:''
        };
        return info;
    },
    verify: {
        projectid: verifier.isStringOrEmpty
    }
};

var updateCtgListSelected = {
    createNew: function () {
        var info = {
            projectid:'',
            ctgid:''
        };
        return info;
    },
    verify: {
        projectid: verifier.isStringOrEmpty,
        ctgid: verifier.isString
    }
};

var categotyUpdate = {
    createNew: function () {
        var info = {
            categoryInfo: ""
        }
        return info;
    },
    verify: {
        categoryInfo: verifier.isString
    }
};

var categoryDelete = {
    createNew: function () {
        var info = {
            listid: ''
        };
        return info;
    },
    verify: {
        listid: verifier.isString
    }
}

var creatQRbatch = {
    createNew: function () {
        var info = {
            batchId:'',
            batchCode: '',
            mcdid: '',
            mcdName:'',
            amount:0,
            creator:'',
            createtime:'date',
            updater:'',
            modeifiedtime:'date',
            state:0
        };
        return info;
    },
    verify: {

    }

};

var getAddQRbatch = {
    createNew: function () {
        var info = {
            mcdId:''
        };
        return info;
    },
    verify: {

    }

};

var sendMcdQREmali = {
    createNew: function () {
        var info = {
            batchid: "",
            key: "",
            batchcode: ""
        };
        return info;
    },
    verify: {
        batchid: verifier.isString,
        key: verifier.isString
    }
};

module.exports = {
    mcdList: mcdList,
    mcdById:mcdById,
    delMcd:delMcd,
    qrBatchList:qrBatchList,
    svOrUpd:svOrUpd,
    categotyList:categotyList,
    categotyListEx:categotyListEx,
    ctgListSelected:ctgListSelected,
    updateCtgListSelected:updateCtgListSelected,
    categotyUpdate:categotyUpdate,
    categoryDelete:categoryDelete,
    creatQRbatch:creatQRbatch,
    getAddQRbatch:getAddQRbatch,
    sendMcdQREmali: sendMcdQREmali
}
