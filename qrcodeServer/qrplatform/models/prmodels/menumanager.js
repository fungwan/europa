/**
 * created by xdf on 2017/06/06
 */
var verifier = require('../../common/tool').verifier;

var updateMenuList = {
    createNew: function() {
        var info = {
            menuinfo: ""
        }
        return info;
    },
    verify: {
        menuinfo: verifier.isString
    }
}

module.exports = {
    updateMenuList: updateMenuList
}