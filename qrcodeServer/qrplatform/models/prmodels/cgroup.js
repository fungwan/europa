/**
 * Created by ivan on 15/11/30.
 */
var verifier = require('../../common/tool').verifier;

var queryverify = function (obj) {
    if (!obj) {
        return false;
    }
    var query = JSON.parse(obj);
    if (query.grouptype == "1" || query.grouptype == "2") {
        return true;
    } else {
        return false;
    }
}
var groupverify = function (obj) {
    if (!obj) {
        return false;
    }
    var group = JSON.parse(obj);
    var groupid = group.groupid;
    var groupdesc, groupname, grouptype, entid, parentid, isdisabled;
    groupdesc = group.groupdesc;
    groupname = group.groupname;
    grouptype = group.grouptype;
    if (!groupname || groupname.trim() == "" || !verifier.isString(groupname)) {
        return false;
    }
    else if (groupname.length > 20) {
        return false;
    }
    if (!groupdesc || groupdesc.trim() == "" || !verifier.isString(groupdesc)) {
        return false;
    }
    else if (groupdesc.length > 50)
        return false;
    if (grouptype != "1" && grouptype != "2") {
        return false;
    }
    if (!groupid || groupid.trim() == "" || !verifier.isString(groupid)) {
        return false;
    }
    if (groupid != "add") {
        entid = group.entid;
        isdisabled = group.isdisabled;
        if (!entid || entid.trim() == "" || !verifier.isString(entid))
            return false;
        if (isdisabled || typeof isdisabled != "boolean")
            return false;
        //TODO 验证parentid
    }
    return true;

}
/**
 * 用户基本信息
 * @type {{createNew: Function}}
 */
var list = {
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
        size: verifier.isInteger,
        query: queryverify
    }
};

var query = {
    createNew: function () {
        var info = {
            page: '',
            size: '',
            nickname: '',
            query: {}
        };
        return info;
    },
    verify: {
        page: verifier.isInteger,
        size: verifier.isInteger,
        nickname: verifier.isString,
        query: queryverify
    }
};

var update = {
    createNew: function () {
        var info = {
            group: ""
        }
        return info;
    },
    verify: {
        group: verifier.isString
    }
};

var deletegr = {
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

module.exports = {
    list: list,
    query:query,
    update: update,
    deletegr: deletegr
}
