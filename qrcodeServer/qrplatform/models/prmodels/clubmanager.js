/**
 * Created by shuwei on 2017/2/16.
 */
var verifier = require('../../common/tool').verifier;
var getPointRecord={
    createNew: function () {
        return {
            custid:'',
            type:'',
            begtime:'2010-01-01',
            endtime:'2099-01-01',
            pagenumber:1,
            pagerows:10
        };
    },
    verify: {
        custid:verifier.isString,
        begtime:verifier.isDate,
        endtime:verifier.isDate,
        pagenumber:verifier.isPage,
        pagerows:verifier.isSize
    }
};

var getPointRanking={
    createNew: function () {
        return {
            custid:'',
            page:1,
            size:10
        };
    },
    verify: {
        page:verifier.isPage,
        size:verifier.isSize
    }
};

var getCustInfo={
    createNew: function () {
        return {
            custid:''
        };
    },
    verify: {
        custid:verifier.isString
    }
};

var getOrderList={
    createNew: function () {
        return {
            custid:'',
            begtime:'2010-01-01',
            endtime:'2099-01-01',
            state:-1,
            pagenumber:1,
            pagerows:10
        };
    },
    verify: {
        custid:verifier.isString,
        begtime:verifier.isDate,
        endtime:verifier.isDate,
        pagenumber:verifier.isPage,
        pagerows:verifier.isSize
    }
};


var getPrizeRecord={
    createNew: function () {
        return {
            custid:'',
            begtime:'2010-01-01',
            endtime:'2099-01-01',
            pagenumber:1,
            pagerows:10
        };
    },
    verify: {
        custid:verifier.isString,
        begtime:verifier.isDate,
        endtime:verifier.isDate,
        pagenumber:verifier.isPage,
        pagerows:verifier.isSize
    }
};

var getOrderByid={
    createNew: function () {
        return {
            orderid:''
        };
    },
    verify: {
        orderid:verifier.isString
    }
};

var getFocusList={
    createNew: function () {
        return {
            custid:''
        };
    },
    verify: {
        custid:verifier.isString
    }
};

var beginExchangePoint={
    createNew: function () {
        return {
            custid:'',
            point:0,
            message:''
        };
    },
    verify: {
        custid:verifier.isString
    }
};

var finishPointExchange={
    createNew: function () {
        return {
            custid:'',
            exchangeid:''
        };
    },
    verify: {
        custid:verifier.isString,
        exchangeid:verifier.isString
    }
};


var getWaitEval={
    createNew: function () {
        return {
            custid:'',
            pagenumber:1,
            pagerows:10
        };
    },
    verify: {
        custid:verifier.isString,
        pagenumber:verifier.isPage,
        pagerows:verifier.isSize
    }
};

var getarticle={
    createNew: function () {
        return {
            custid:'',
            entid:'',
            pagenumber:1,
            pagerows:10
        };
    },
    verify: {
        custid:verifier.isString,
        pagenumber:verifier.isPage,
        pagerows:verifier.isSize
    }
};

var createAritle={
    createNew: function () {
        return {
            article:''
        };
    },
    verify: {
        article:verifier.isString
    }
};

var gettoparticle={
    createNew: function () {
        return {
            limit:5
        };
    }
};

var getarticlebyentid={
    createNew: function () {
        return {
            entid:'',
            pagenumber:1,
            pagerows:10,
            key:'',
            begtime:'',
            endtime:'',
            state:'0'
        };
    },
    verify: {
        entid:verifier.isString,
        pagenumber:verifier.isPage,
        pagerows:verifier.isSize
    }
};

var delarticle={
    createNew: function () {
        return {
            artid:''
        };
    },
    verify: {
        artid:verifier.isString
    }
};

var getarticlebyid={
    createNew: function () {
        return {
            artid:''
        };
    },
    verify: {
        artid:verifier.isString
    }
};

var changefocusstate={
    createNew: function () {
        return {
            id:'',
            state:''
        };
    },
    verify: {
        id:verifier.isString,
        state:verifier.isString,
    }
};

var getlotteryrecord={
    createNew: function () {
        return {
            custid:'',
            only:'',
            pagenumber:1,
            pagerows:10
        };
    },
    verify: {
        pagenumber:verifier.isPage,
        pagerows:verifier.isSize
    }
};

var sendsms={
    createNew: function () {
        return {
            phone:''

        };
    }
};

var getAdList={
    createNew: function () {
        return {
            adtype:'',
            state:''
        };
    }
};

var addAdItem={
    createNew: function () {
        return {
            adtype:'',
            artid:'',
            begtime:0,
            endtime:0
        };
    }
};


var delAdItem={
    createNew: function () {
        return {
            adid:''
        };
    }
};

var publishAritle={
    createNew: function () {
        return {
            artid:''
        };
    }
};

var sendSetPhoneSms={
    createNew: function () {
        return {
            phone:''

        };
    }
};

var getselfqoupon={
    createNew: function () {
        return {
            custid:'',
            page:1,
            size:10
        };
    }
};

var getselfqouponrecord={
    createNew: function () {
        return {
            custid:'',
            begtime:0,
            endtime:0,
            usetype:'',
            page:1,
            size:10
        };
    }
};

var getselfcashcoupon = {
    createNew: function () {
        return {
            custid: '',
            page: 1,
            size: 10
        }
    }
}

var deletecashcoupon = {
    createNew: function () {
        return {
            custid: '',
            couponid: ''
        };
    }
};

var custsign = {
    createNew: function () {
        return {
            userid:''
        };
    }
};

var updateFavoritesNotify = {
    createNew: function () {
        return {
            isEnable:'int'
        };
    },
    verify: {
        isEnable:verifier.isInteger
    }
};

var applyJoin = {
    createNew: function () {
        return {
            name:'string',
            sex:'string',
            phone:'string',
            email:'string',
            method:'string',
            city:'string'
        };
    },
    verify: {
        phone:verifier.isMobile,
        email:verifier.isEmail        
    }
};

module.exports = {
    getPointRecord:getPointRecord,
    getPointRanking:getPointRanking,
    getCustInfo:getCustInfo,
    getOrderList:getOrderList,
    getPrizeRecord:getPrizeRecord,
    getOrderByid:getOrderByid,
    getFocusList:getFocusList,
    beginExchangePoint:beginExchangePoint,
    finishPointExchange:finishPointExchange,
    getWaitEval:getWaitEval,
    getarticle:getarticle,
    createAritle:createAritle,
    gettoparticle:gettoparticle,
    getarticlebyentid:getarticlebyentid,
    delarticle:delarticle,
    getarticlebyid:getarticlebyid,
    changefocusstate:changefocusstate,
    getlotteryrecord:getlotteryrecord,
    sendsms:sendsms,
    getAdList:getAdList,
    addAdItem:addAdItem,
    delAdItem:delAdItem,
    publishAritle:publishAritle,
    sendSetPhoneSms:sendSetPhoneSms,
    getselfqoupon:getselfqoupon,
    getselfqouponrecord:getselfqouponrecord,
    getselfcashcoupon: getselfcashcoupon,
    deletecashcoupon: deletecashcoupon,
    custsign:custsign,
    updateFavoritesNotify:updateFavoritesNotify,
    applyJoin:applyJoin
};