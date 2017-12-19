/**
 * Created by zhiwei on 2015/12/29.
 */
var save={
    createNew: function () {
        var info = {
            qrcode:'',
            qa:[]
        };
        return info;
    }
};
var check={
    createNew: function () {
        var info = {
            qrcode:''
        };
        return info;
    }
};
module.exports = {
    save:save,
    check:check
}