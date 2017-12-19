/**
 * Created by taoj on 2015/12/24.
 */
var verifier = require('../../common/tool').verifier;
var qrcode = {
    createNew: function () {
        var info = {
            "qrcode": ""
        };
        return info;
    },
    verify: {
        "qrcode": verifier.isNotAllowEmpty
    }
};
var qasave = {
    createNew: function () {
        var info = {
            "qrcode": "",
            "qa": []
        };
        return info;
    },
    verify: {
        "qrcode": verifier.isNotAllowEmpty
    }
};
var pointgenerate = {
    createNew: function () {
        var info = {
            "qrcode": "",
            "user": {}
        };
        return info;
    },
    verify: {
        "qrcode": verifier.isNotAllowEmpty
    }
};
var updatephoneno = {
    createNew: function () {
        var info = {
            "phone": "string",
            "projectid": "",
            "code": ""
        };
        return info;
    },
    verify: {
        "phone": verifier.isMobile
    }
};

var genorder = {
    createNew: function () {
        var info = {
            "qrcode": "string",
            "address": "",
            "type": "string"
        };
        return info;
    },
    verify: {
        "qrcode": verifier.isNotAllowEmpty,
        "type": verifier.isNotAllowEmpty
    }
};

var sms = {
    createNew: function () {
        var info = {
            phone: "string",
            code: "string"
        };
        return info;
    }
};

var getcashcoupon = {
    createNew: function () {
        var info = {
            "phone": "string",
            "qrcode": "string",
            "type": "string"
        };
        return info;
    },
    verify: {
        "phone": verifier.isMobile,
        "qrcode": verifier.isNotAllowEmpty,
        "type": verifier.isNotAllowEmpty
    }
};

module.exports = {
    qrcode: qrcode,
    qasave: qasave,
    pointgenerate: pointgenerate,
    updatephoneno: updatephoneno,
    genorder: genorder,
    sms: sms,
    getcashcoupon: getcashcoupon
};