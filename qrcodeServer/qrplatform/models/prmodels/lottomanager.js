/**
 * Created by shuwei on 2017/6/8.
 */
var savelotto = {
    createNew: function () {
        var info = {
            lotto: ""
        };
        return info;
    }
};

var getlottolist = {
    createNew: function () {
        var info = {
            begdate:0,
            enddate:0,
            key:'%'
        };
        return info;
    }
};

var getcurrentlotto = {
    createNew: function () {
        var info = {

        };
        return info;
    }
};

var getlottobyid = {
    createNew: function () {
        var info = {
            lottoid:''
        };
        return info;
    }
};

var playlotto = {
    createNew: function () {
        var info = {
            lottopointid:''
        };
        return info;
    }
};

var getlottorecord = {
    createNew: function () {
        var info = {
        }
        return info;
    }
};

var editorderadd = {
    createNew: function () {
        var info = {
            addid:'',
            orderid:'',
            address:''
        }
        return info;
    }
};

var enablelotto = {
    createNew: function () {
        var info = {
            lottoid: "string",
            state:"int"
        };
        return info;
    }
};

module.exports = {
    savelotto:savelotto,
    enablelotto:enablelotto,
    getlottolist:getlottolist,
    getcurrentlotto:getcurrentlotto,
    getlottobyid:getlottobyid,
    playlotto:playlotto,
    getlottorecord:getlottorecord,
    editorderadd:editorderadd
}