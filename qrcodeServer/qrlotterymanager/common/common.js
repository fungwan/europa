/**
 * Created by taoj on 2015/12/28.
 */
/**
 * qrcode 所对应的状态
 * @type {{badcode: string, normal: string, used: string, finished: string, sending: string, nolottery: string, outofdate: string}}
 */
var checkstate = {
    normal: "normal",
    used: "used",
    success: "success",
    nolottery: "nolottery",
    outofdate: "outofdate"
}
var lotterystate = {
    normal: "normal", //中奖未发送红包
    sending: "sending", //正在发送中
    sendfalse:"sendfalse", //发送失败
    refund:"refund",  //已退款
    success: "success" //发送成功
}
var project = {
    state: {
        start: "start"
    },
    type: {
        redpacket: "redpacket",
        point:"point"
    },
    prizetype: {
        redpacket: "redpacket",
        point:"point",
        product:"product",
        cashcoupon:"cashcoupon"
    },
    ruletype : {
        order: "1",
        random: "2"
    }
}
var errType ={
    unknow: "unknow",
    badcode:"badcode",
    noexists:"noexists",
    noproject:"noproject",
    refuse:"refuse",
    hasexists:"hasexists"
}

exports.checkstate = checkstate;
exports.lotterystate = lotterystate;
exports.project= project;
exports.errType = errType;