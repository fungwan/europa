/**
 * Created by Yatagaras on 2015/12/5.
 */

define("errorCodes", function () {
    window.errorCodes = {
        unknow: 'unknow',
        refuse: 'refuse',
        exists: 'exists',
        notexist: 'notexist',
        timeout: "timeout", //过期，新增
        account: {
            unlogin: 'unlogin', //帐号未登录
            confirmed: "confirmed", //帐号已激活
            unconfirmed: "unconfirmed", //帐号未激活
            disabled: "disabled", //帐号已禁用
            locked: "locked", //帐号已锁定
            unlock: "unlock" //帐号未锁定
        }, //帐号状态，新增（unlogin是移进来的）
        verifyError: {
            unknow: ' verifyError',
            notAllowNull: 'VerifyError.notAllowNull',
            formatError: 'formatError'
        },
        dataBaseError: {
            unknow: 'databaseError',
            connectError: 'databaseError.connectError'
        },
        configerror: 'configerror',
        outofdate:"outofdate",
        norpitem:"norpitem",
        noquestion:"noquestion",
        nopoint:"nopoint",
        nomoney:"nomoney"
    };

    window.validateMessage = {
        "default": {
            badInput: "错误的输入",
            patternMismatch: "格式不正确",
            rangeOverflow: "超出上限",
            rangeUnderflow: "低于下限",
            stepMismatch: "值不符合步长",
            tooLong: "内容过长",
            tooShort: "内容过短",
            typeMismatch: "类型不匹配",
            valueMissing: "为必填项"
        },
        "ent-contacts": {
            "name": "联系人",
            "patternMismatch": "必须由中文或英文组成"
        },
        "integer": {
            stepMismatch: "必须填写整数"
        },
        "get": function (dom) {
            var key = dom.getAttribute("data-validateKey"), vt = null, msg = "", _name = dom.getAttribute("data-input-name") || "";

            $.each(dom.validity, function (k, v) {
                if (v === true) {
                    vt = k;
                    return false;
                }
            });

            if (key && key != "get" && key in validateMessage) {
                var _vm = validateMessage[key];
                _name = _vm.name || "";
                if (vt in _vm)
                    msg = _vm[vt];
                else if (vt in validateMessage.default)
                    msg = validateMessage.default[vt];
                else
                    msg = dom.validationMessage;
            }

            if (vt && msg == "") msg = validateMessage.default[vt];
            return _name + msg;
        }
    };

    return {};
});