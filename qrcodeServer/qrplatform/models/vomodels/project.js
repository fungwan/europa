/**
 *create by codesmith
 **/
var verifier = require('../../common/tool').verifier;
var returnData = require('../../common/returnData');
var extend = require('./project.extend');

/**
 *模型
 */
var project = {
    createnew: function () {
        var info = extend.createnew();
        info["config"] = {
            templates: null,
            rpitems: null,
            qritems: null,
            pointitems: null,
            lotterysetting: null
        };
        return info;
    }
    //如果需要校验增加以下定义
    //verify:{
    //}    

};
var type = {
    redpacket: 'redpacket',
    question: 'question',
    point: 'point'
};

var prizetype = {
    redpacket: 'redpacket',
    question: 'question',
    point: 'point',
    cinema:'cinema',
    product:'product',
    net:'net',
    phone:'phone',
    cashcoupon:'cashcoupon',//优惠券
    discountcoupon:'discountcoupon'
};

var lotterystate = {
    normal: "normal", //中奖未发送红包
    sending: "sending", //正在发送中
    sendfalse:"sendfalse", //发送失败
    refund:"refund",  //已退款
    success: "success" //发送成功
}

var state = {
    editing: 'editing',
    start: 'start',
    stop: 'stop',
    completed:'completed',
    delete: 'delete'
};
var custype = {
    customer: "1",
    dealer: "2"
};
var ruletype = {
    "sequence": "1",
    "random": "2"
};
var rulestate = {
    "enable":"1",
    "disable":"0"
};
var custtypes = [custype.customer, custype.dealer];
var ruletypes = [ruletype.sequence, ruletype.random];
var rulestates= [rulestate.enable,rulestate.disable];
var lotterytypes = {
    progift: 'progift',
    prolottery: 'prolottery',
    propoint: 'propoint',
    proquestion:'proquestion',
    prosale:'prosale'
};

module.exports = project;
module.exports.type = type;
module.exports.prizetype = prizetype;
module.exports.lotterystate = lotterystate;
module.exports.state = state;
module.exports.custtype = custype;
module.exports.ruletype = ruletype;
module.exports.custtypes = custtypes;
module.exports.ruletypes = ruletypes;
module.exports.rulestates = rulestates;
module.exports.lotterytypes = lotterytypes;
