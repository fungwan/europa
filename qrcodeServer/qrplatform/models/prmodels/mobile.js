/**
 * Created by shuwei on 15/12/16.
 */
var login={
    createNew: function () {
        var info = {
            code:'string',
            entid:'string',
            custtype:'string',
            lat:'float',
            lng:'float'
        };
        return info;
    }
};
var getsign={
    createNew: function () {
        var info = {
            url:'string'
        };
        return info;
    }
};

var checklogin={
    createNew: function () {
        var info = {
        };
        return info;
    }
};

module.exports = {
    login:login,
    getsign:getsign,
    checklogin:checklogin
}