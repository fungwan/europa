var verifier = require("../../common/tool").verifier;

var incomeList = {
    createNew: function () {
        var info = {
            page: '',
            size: '',
            datetype: 0,
            begtime: "",
            endtime: "",
            code: ""
        };
        return info;
    },
    verify: {
        page: verifier.isInteger,
        size: verifier.isInteger,
        datetype: verifier.isInteger
    }
};

var redpacketList = {
    createNew: function () {
        var info = {
            page: '',
            size: '',
            datetype: 0,
            begtime: "",
            endtime: "",
            code: ""
        };
        return info;
    },
    verify: {
        page: verifier.isInteger,
        size: verifier.isInteger,
        datetype: verifier.isInteger
    }
};

var redpacketInfo = {
    createNew: function () {
        var info = {
            billno: ''
        };
        return info;
    },
    verify: {
        billno: verifier.isString
    }
};

var addIncomeRecord = {
    createNew: function () {
        var info = {
            transaction_id: '',
            err_code: null,
            err_code_des: null,
            fee_type: null,
            openid: null,
            out_refund_no: null,
            out_trade_no: null,
            pay_bank: null,
            pay_state: null,
            refund_fee: null,
            refund_id: null,
            refund_state: null,
            refund_time_end: null,
            refund_type: null,
            time_end: null,
            total_fee: null,
            trade_type: null,
        };
        return info;
    },
    verify: {
        transaction_id: verifier.isString
    }
};

module.exports = {
    incomeList: incomeList,
    redpacketList: redpacketList,
    redpacketInfo: redpacketInfo,
    addIncomeRecord: addIncomeRecord
};