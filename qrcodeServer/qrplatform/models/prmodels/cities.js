/**
 * Created by Yatagaras on 2015/12/7.
 */

var verifier = require('../../common/tool').verifier;

var _query = {
    createNew: function () {
        var info = {
            parentCode: ''
        };
        return info;
    }
};

var _detail = {
    createNew: function () {
        var info = {
            keyword: ''
        };
        return info;
    }
};

var _get = {
    createNew: function () {
        return {
            code: ''
        };
    },
    verify: {
        code: verifier.isNotAllowEmpty
    }
};

var _getCode = {
    createNew: function () {
        return {
            province: '',
            city: '',
            district: ''
        };
    },
    verify: {
    }
};

module.exports = {
    query: _query,
    detail: _detail,
    get: _get,
    getCode: _getCode
};
