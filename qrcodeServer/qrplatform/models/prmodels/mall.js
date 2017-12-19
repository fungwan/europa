/**
 * Created by Erathink on 2016/12/15.
 */
var verifier = require('../../common/tool').verifier;

/**
 * list 查询条件参数对象及验证定义
 * @type {{createNew: Function, verify: {begdate: (*|boolean), enddate: (*|boolean), state: (*|boolean)}}}
 */
var mallPdtList = {
    createNew: function () {
        var info = {
            query: '',
            page: 1,
            size: 10,
            categoryid: '',
            point: -1,
            showpoint: true
        };
        return info;
    },
    verify: {
        page: verifier.isPage,
        size: verifier.isSize
    }
};

var blhList = {
    createNew: function () {
        var info = {
            page: 1,
            size: 10,
            categoryId: 'string',
            low: 'float',
            high: 'float'
        };
        return info;
    },
    verify: {
        page: verifier.isPage,
        size: verifier.isSize
    }
};

var importBlhPdt = {
    createNew: function () {
        var info = {
            list: 'string'
        };
        return info;
    }
};

var orderlist = {
    createNew: function () {
        var info = {
            page: 1,
            size: 10,
            orderbm: '',
            begtime: '2010-01-01',
            endtime: '2099-01-01',
            state: -1,
        };
        return info;
    },
    verify: {
        page: verifier.isPage,
        size: verifier.isSize
    }
};

var orderdetail = {
    createNew: function () {
        var info = {
            orderid: '',
            orderbm:''
        };
        return info;
    }
};

var productUpdate = {
    createNew: function () {
        var info = {
            productInfo: "",
            content: "",
        }
        return info;
    },
    verify: {
        productInfo: verifier.isString
    }
};

var updateorder = {
    createNew: function () {
        var info = {
            orderInfo: ""
        }
        return info;
    },
    verify: {
        orderInfo: verifier.isString
    }
};

var getProductTypeList = {
    createNew: function () {
        var info = {
            page: 1,
            size: 10
        };
        return info;
    },
    verify: {

    }
};

var getshopingcart = {
    createNew: function () {
        var info = {
            custid: '',
            page: 1,
            size: 10
        };
        return info;
    },
    verify: {
        custid: verifier.isString,
        page: verifier.isPage,
        size: verifier.isSize
    }
};

var addtoshopcart = {
    createNew: function () {
        var info = {
            custid: '',
            number: 1,
            productid: ''
        };
        return info;
    },
    verify: {
        custid: verifier.isString,
        number: verifier.isPage,
        productid: verifier.isString

    }
};

var deleteshopcart = {
    createNew: function () {
        var info = {
            custid: '',
            productid: ''
        };
        return info;
    },
    verify: {
        custid: verifier.isString,
        productid: verifier.isString

    }
};

var checkout = {
    createNew: function () {
        var info = {
            orderid: ''
        };
        return info;
    },
    verify: {

    }
};

var updateshopitemnumber = {
    createNew: function () {
        var info = {
            itemid: '',
            number: 1
        };
        return info;
    },
    verify: {
        itemid: verifier.isString,
        number: verifier.isPage
    }
};

var getproducteval = {
    createNew: function () {
        var info = {
            productid: ''
        };
        return info;
    },
    verify: {
        productid: verifier.isString
    }
};

var getproductevallist = {
    createNew: function () {
        var info = {
            page: 1,
            size: 10,
            state: -1,
            productname: '',
            key: '',
            sensitiveflag: ''
        };
        return info;
    },
    verify: {
        page: verifier.isPage,
        size: verifier.isSize
    }
};

var getproductevalbyleve = {
    createNew: function () {
        var info = {
            productid: '',
            leve: 0,
            pagenumber: 1,
            pagesize: 10
        };
        return info;
    },
    verify: {
        productid: verifier.isString,
        //leve:verifier.isNumber,
        pagenumber: verifier.isPage,
        pagesize: verifier.isSize
    }
};

var saveproducteval = {
    createNew: function () {
        var info = {
            eval: ''
        };
        return info;
    },
    verify: {
        eval: verifier.isString
    }
};

var getproductinfo = {
    createNew: function () {
        var info = {
            productid: ''
        };
        return info;
    },
    verify: {
        productid: verifier.isString
    }
};

var createsendredpackorder = {
    createNew: function () {
        var info = {
            productid: '',
            custid: '',
            addid: '',
            remak: '',
            password: '',
            amount: 0
        };
        return info;
    },
    verify: {
        productid: verifier.isString,
        custid: verifier.isString,
        amount:verifier.isInteger
    }
};

var resendredpackorder = {
    createNew: function () {
        var info = {
            orderid: ''
        };
        return info;
    },
    verify: {
        orderid: verifier.isString
    }
};

var pointlottery = {
    createNew: function () {
        var info = {

        };
        return info;
    }
};

var createnetorder = {
    createNew: function () {
        var info = {
            productid: '',
            custid: '',
            password: '',
            amount: 0,
            phonenumber: '',
            range: '0'
        };
        return info;
    },
    verify: {
        productid: verifier.isString,
        //custid:verifier.isString,
    }
};

var getqouponContent = {
    createNew: function () {
        var info = {
            productid: ""
        };
        return info;
    }
};

var getqouponrecord = {
    createNew: function () {
        var info = {
            begtime: '',
            endtime: '',
            usetype: '',
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

var queryPayOrder = {
    createNew: function () {
        return {
            orderbm: ''

        };
    }
};

var createOrder = {
    createNew: function () {
        var info = {
            shopinglist: '',
            discountList:'',
            remak: '',
            addid: '',
            point: '',
            password: ''
        };
        return info;
    },
    verify: {
        shopinglist: verifier.isString
    }
};

var createQouponOrder = {
    createNew: function () {
        var info = {
            productid: '',
            point: '',
            number: 'int',
            password: '',
            custid: ''
        };
        return info;
    }
};

var createBlhOrder = {
    createNew: function () {
        var info = {
            productid: '',
            point: '',
            number: 'int',
            addid: '',
            password: '',
            custid: '',
            discountList:''
        };
        return info;
    }
};

var sendqoupon = {
    createNew: function () {
        var info = {
            orderid: '',
            productid: ''
        };
        return info;
    }
};


var getgiveqoupon = {
    createNew: function () {
        var info = {
            qouponid: '',
            custid: ''
        };
        return info;
    }
};

var recivegiveqoupon = {
    createNew: function () {
        var info = {
            code: ''
        };
        return info;
    }
};

var getqouponrecord = {
    createNew: function () {
        var info = {
            custid: '',
            begtime: 0,
            endtime: 0,
            usetype: '',
            page: 1,
            size: 10
        };
        return info;
    }
};

var createOrderByQoupon = {
    createNew: function () {
        var info = {
            qouponid: '',
            addid: '',
            remak: '',
            password: '',
            custid: ''
        };
        return info;
    }
}

var updateProductState = {
    createNew: function () {
        var info = {
            productid: '',
            state: ''
        }
        return info;
    }
}

var getPostageByAddId = {
    createNew: function () {
        var info = {
            addid: 'string',
            productnum: 'int'
        };
        return info;
    },
    verify: {
        addid: verifier.isString,
        productnum: verifier.isInteger
    }
};

var addFavoritesById = {
    createNew: function () {
        var info = {
            productid: 'string'
        };
        return info;
    },
    verify: {
        productid: verifier.isString
    }
};

var delFavoritesById = {
    createNew: function () {
        var info = {
            favoritesid: 'string'
        };
        return info;
    },
    verify: {
        favoritesid: verifier.isString
    }
};

var getDiscountCoupon = {
    createNew: function () {
        var info = {
            query: 'string'
        };
        return info;
    },
    verify: {
        query: verifier.isString
    }
};

var setDiscountProd = {
    createNew: function () {
        var info = {
            pdtlist: 'string',
            state:'int'
        };
        return info;
    },
    verify: {
        pdtlist: verifier.isString,
        state:verifier.isInteger
    }
}

module.exports = {
    mallPdtList: mallPdtList,
    blhList: blhList,
    importBlhPdt: importBlhPdt,
    productUpdate: productUpdate,
    orderlist: orderlist,
    orderdetail: orderdetail,
    updateorder: updateorder,
    getProductTypeList: getProductTypeList,
    getshopingcart: getshopingcart,
    addtoshopcart: addtoshopcart,
    deleteshopcart: deleteshopcart,
    checkout: checkout,
    updateshopitemnumber: updateshopitemnumber,
    getproducteval: getproducteval,
    getproductevallist: getproductevallist,
    getproductevalbyleve: getproductevalbyleve,
    saveproducteval: saveproducteval,
    getproductinfo: getproductinfo,
    createsendredpackorder: createsendredpackorder,
    resendredpackorder: resendredpackorder,
    pointlottery: pointlottery,
    createnetorder: createnetorder,
    queryPayOrder: queryPayOrder,
    createOrder: createOrder,
    createQouponOrder: createQouponOrder,
    getqouponContent: getqouponContent,
    sendqoupon: sendqoupon,
    getgiveqoupon: getgiveqoupon,
    recivegiveqoupon: recivegiveqoupon,
    getqouponrecord: getqouponrecord,
    createOrderByQoupon: createOrderByQoupon,
    updateProductState: updateProductState,
    getPostageByAddId:getPostageByAddId,
    addFavoritesById:addFavoritesById,
    delFavoritesById:delFavoritesById,
    createBlhOrder:createBlhOrder,
    getDiscountCoupon:getDiscountCoupon,
    setDiscountProd:setDiscountProd
};
