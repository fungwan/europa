var sequelize = require("sequelize");
var eventproxy = require('eventproxy');
var moment = require("moment");
var Excel = require('exceljs');

var returnData = require("../common/returnData");
var db = require("../common/db");
var logger = require("../common/logger");

var paymanager = require("../wechat/paymanager");

var totalpage = function (total, size) {
    var page = 0;
    var num = Number(total) / Number(size);
    if (parseInt(num) == num)
        page = num;
    else
        page = Math.floor(num) + 1;
    return page;
};

var formateDateTime = function (momentDateTime) {
    if (momentDateTime.isValid()) {
        return momentDateTime.format("YYYY-MM-DD HH:mm:ss");
    }   
    return "";
};

function incomeList (arg, cb) {
    if (!arg.currentuser) {
        cb(returnData.createError(returnData.errorType.account.unlogin, "当前用户未登录"));
        return ;
    }

    var page = parseInt(arg.page) || 1;
    var size = parseInt(arg.size) || 10;

    var datetype = parseInt(arg.datetype);
    var begtime = arg.begtime;
    var endtime = arg.endtime;
    var code = arg.code;

    var now = moment();
    endtime = now.hours(23).minutes(59).seconds(59).format("YYYY-MM-DD HH:mm:ss");
    switch (datetype) {
        case 0:
            begtime = now.hours(0).minutes(0).seconds(0).format("YYYY-MM-DD HH:mm:ss");
            break;
        case 1:
            begtime = now.subtract(1, "week").hours(0).minutes(0).seconds(0).format("YYYY-MM-DD HH:mm:ss");
            break;
        case 2:
            begtime = now.subtract(1, "month").hours(0).minutes(0).seconds(0).format("YYYY-MM-DD HH:mm:ss");
            break;
        case 3:
            begtime = now.subtract(3, "month").hours(0).minutes(0).seconds(0).format("YYYY-MM-DD HH:mm:ss");
            break;
        case 4:
            begtime = formateDateTime(moment(arg.begtime || ""));
            endtime = formateDateTime(moment(arg.endtime || "").hours(23).minutes(59).seconds(59));
            break;
        default:
            begtime = "";
            endtime = "";
            break;
    }

    var whereCondition = {};
    
    if (code) {
        whereCondition.$or = [
            {transaction_id: {$like: "%" + code + "%"}},
            {out_trade_no: {$like: "%" + code + "%"}}
        ];
    }

    if (begtime) {
        if (!whereCondition.time_end) {
            whereCondition.time_end = {};
        }
        whereCondition.time_end.$gte = begtime;
    }
    if (endtime) {
        if (!whereCondition.time_end) {
            whereCondition.time_end = {};
        }
        whereCondition.time_end.$lte = endtime;
    }

    var cashflowDb = db.models.cashflow;
    var ep = new eventproxy();

    cashflowDb.findAndCountAll({
        where: whereCondition,
        offset: cashflowDb.pageOffset(page, size),
        limit: size,
        order: [['time_end', 'DESC']]
    }).then(function (data) {
        ep.emit("incomeList", data);
    }).catch(function (error) {
        logger.error(error.message);
        ep.emit("error", error);
    });

    ep.on("incomeList", function (data) {
        var result = {};
        var count = data.count;
        result.data = data.rows;
        result.total=count,
        result.totalpage = totalpage(count, size);
        result.page = page;
        result.size = size;
        cb(null, returnData.createData(result));
    });

    //错误处理
    ep.on("error", function (error) {
        cb(returnData.createError("unknown", "数据库错误"));
    });
}

function redpacketList (arg, cb) {
    if (!arg.currentuser) {
        cb(returnData.createError(returnData.errorType.account.unlogin, "当前用户未登录"));
        return ;
    }

    var page = parseInt(arg.page) || 1;
    var size = parseInt(arg.size) || 10;

    var datetype = parseInt(arg.datetype);
    var begtime = arg.begtime;
    var endtime = arg.endtime;
    var code = arg.code;

    var now = moment();
    endtime = now.hours(23).minutes(59).seconds(59).format("YYYY-MM-DD HH:mm:ss");
    switch (datetype) {
        case 0:
            begtime = now.hours(0).minutes(0).seconds(0).format("YYYY-MM-DD HH:mm:ss");
            break;
        case 1:
            begtime = now.subtract(1, "week").hours(0).minutes(0).seconds(0).format("YYYY-MM-DD HH:mm:ss");
            break;
        case 2:
            begtime = now.subtract(1, "month").hours(0).minutes(0).seconds(0).format("YYYY-MM-DD HH:mm:ss");
            break;
        case 3:
            begtime = now.subtract(3, "month").hours(0).minutes(0).seconds(0).format("YYYY-MM-DD HH:mm:ss");
            break;
        case 4:
            begtime = formateDateTime(moment(arg.begtime || ""));
            endtime = formateDateTime(moment(arg.endtime || "").hours(23).minutes(59).seconds(59));
            break;
        default:
            begtime = "";
            endtime = "";
            break;
    }

    var whereCondition = {};
    
    if (code) {
        whereCondition.$or = [
            {billno: {$like: "%" + code + "%"}}
        ];
    }

    if (begtime) {
        if (!whereCondition.createtime) {
            whereCondition.createtime = {};
        }
        whereCondition.createtime.$gte = begtime;
    }
    if (endtime) {
        if (!whereCondition.createtime) {
            whereCondition.createtime = {};
        }
        whereCondition.createtime.$lte = endtime;
    }

    var redpacketDb = db.models.bill;
    var ep = new eventproxy();

    redpacketDb.findAndCountAll({
        where: whereCondition,
        offset: redpacketDb.pageOffset(page, size),
        limit: size,
        order: [['createtime', 'DESC']]
    }).then(function (data) {
        ep.emit("redpacketList", data);
    }).catch(function (error) {
        logger.error(error.message);
        ep.emit("error", error);
    });

    ep.on("redpacketList", function (data) {
        var result = {};
        var count = data.count;
        result.data = data.rows;
        result.total=count,
        result.totalpage = totalpage(count, size);
        result.page = page;
        result.size = size;
        cb(null, returnData.createData(result));
    });

    ep.on("error", function (error) {
        cb(returnData.createError("unknown", "数据库错误"));
    });
}

function redpacketInfo (arg, cb) {
    var billno = arg.billno;
    paymanager.getredpack(billno, function (error, data) {
        if (error) {
            cb({error: error});
        } else {
            cb(null, returnData.createData(data));
        }
    });
}

/**
 * 添加/更新财务记录接口
 * @param arg财务流水对象
 *         arg.transaction_id : 微信支付单号
 *         arg.out_trade_no : 商户系统内部唯一订单号
 * @param callback
 * @description 如果涉及到退款（目前不考虑退款）就会更新该笔账单
 */
function updateIncomeRecord (arg, cb) {

    var cashflowDb = db.models.cashflow;
    cashflowDb.upsert(arg).then(function (cashflow) {
        cb(null, cashflow);
    }).catch(function (error) {
        logger.error('sys',error.message);
        cb(returnData.createError("unknown", error.message),null);
    });
}

// 下载收支列表文档
function downLoadIncomeList (req, res) {
    var datetype = parseInt(req.body.datetype);
    var begtime = req.body.begtime;
    var endtime = req.body.endtime;
    var code = req.body.code;

    var now = moment();
    endtime = now.hours(23).minutes(59).seconds(59).format("YYYY-MM-DD HH:mm:ss");
    switch (datetype) {
        case 0:
            begtime = now.hours(0).minutes(0).seconds(0).format("YYYY-MM-DD HH:mm:ss");
            break;
        case 1:
            begtime = now.subtract(1, "week").hours(0).minutes(0).seconds(0).format("YYYY-MM-DD HH:mm:ss");
            break;
        case 2:
            begtime = now.subtract(1, "month").hours(0).minutes(0).seconds(0).format("YYYY-MM-DD HH:mm:ss");
            break;
        case 3:
            begtime = now.subtract(3, "month").hours(0).minutes(0).seconds(0).format("YYYY-MM-DD HH:mm:ss");
            break;
        case 4:
            begtime = formateDateTime(moment(req.body.begtime || ""));
            endtime = formateDateTime(moment(req.body.endtime || "").hours(23).minutes(59).seconds(59));
            break;
        default:
            begtime = "";
            endtime = "";
            break;
    }

    var whereCondition = {};
    
    if (code) {
        whereCondition.$or = [
            {billno: {$like: "%" + code + "%"}}
        ];
    }

    if (begtime) {
        if (!whereCondition.time_end) {
            whereCondition.time_end = {};
        }
        whereCondition.time_end.$gte = begtime;
    }
    if (endtime) {
        if (!whereCondition.time_end) {
            whereCondition.time_end = {};
        }
        whereCondition.time_end.$lte = endtime;
    }


    var cashflowDb = db.models.cashflow;
    cashflowDb.findAll({
        where: whereCondition,
        order: [['time_end', 'DESC']]
    }).then(function (data) {
        var workbook = new Excel.Workbook();
        var worksheet = workbook.addWorksheet("收支列表");
        worksheet.columns = [
            { header: "商户订单号", key: "out_trade_no", width: 25 },
            { header: "微信订单号", key: "transaction_id", width: 25 },
            { header: "交易状态", key: "pay_state", width: 25 },
            { header: "付款银行", key: "pay_bank", width: 25 },
            { header: "金额（元）", key: "total_fee", width: 25 },
            { header: "微信退款单号", key: "refund_id", width: 25 },
            { header: "商户退款单号", key: "out_refund_no", width: 25 },
            { header: "退款金额（元）", key: "refund_fee", width: 25 },
            { header: "退款类型", key: "refund_type", width: 25 },
            { header: "退款状态", key: "refund_state", width: 25 },
            { header: "退款时间", key: "refund_time_end", width: 25 },
            { header: "错误码", key: "err_code", width: 25 },
            { header: "错误描述", key: "err_code_des", width: 25 }
        ];

        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            item.pay_state = String(item.pay_state).toUpperCase();
            switch (item.pay_state) {
                case "SUCCESS":
                    item.pay_state = "支付成功";
                    break;
                case "REFUND":
                    item.pay_state = "转入退款";
                    break;
                case "NOTPAY":
                    item.pay_state = "未支付";
                    break;
                case "CLOSED":
                    item.pay_state = "已关闭";
                    break;
                case "REVOKED":
                    item.pay_state = "已撤销";
                    break;
                case "USERPAYING":
                    item.pay_state = "用户支付中";
                    break;
                case "PAYERROR":
                    item.pay_state = "支付失败";
                    break;
                default:
                    break;
            }
            worksheet.addRow(item);
        }
        res.header("Content-Type", "application/octet-stream");
        res.header("Content-Disposition", "attachment; filename=incomeList.xlsx");
        workbook.xlsx.write(res);
    }).catch(function (error) {
        logger.error(error);
        res.json({
            error: {
                code: "unknown",
                message: "excel文档构建错误"
            }
        });
    });
}

// 下载红包列表文档
function downloadRedpacketList (req, res) {
    var datetype = parseInt(req.body.datetype);
    var begtime = req.body.begtime;
    var endtime = req.body.endtime;
    var code = req.body.code;

    var now = moment();
    endtime = now.hours(23).minutes(59).seconds(59).format("YYYY-MM-DD HH:mm:ss");
    switch (datetype) {
        case 0:
            begtime = now.hours(0).minutes(0).seconds(0).format("YYYY-MM-DD HH:mm:ss");
            break;
        case 1:
            begtime = now.subtract(1, "week").hours(0).minutes(0).seconds(0).format("YYYY-MM-DD HH:mm:ss");
            break;
        case 2:
            begtime = now.subtract(1, "month").hours(0).minutes(0).seconds(0).format("YYYY-MM-DD HH:mm:ss");
            break;
        case 3:
            begtime = now.subtract(3, "month").hours(0).minutes(0).seconds(0).format("YYYY-MM-DD HH:mm:ss");
            break;
        case 4:
            begtime = formateDateTime(moment(req.body.begtime || ""));
            endtime = formateDateTime(moment(req.body.endtime || "").hours(23).minutes(59).seconds(59));
            break;
        default:
            begtime = "";
            endtime = "";
            break;
    }

    var whereCondition = {};
    
    if (code) {
        whereCondition.$or = [
            {billno: {$like: "%" + code + "%"}}
        ];
    }

    if (begtime) {
        if (!whereCondition.createtime) {
            whereCondition.createtime = {};
        }
        whereCondition.createtime.$gte = begtime;
    }
    if (endtime) {
        if (!whereCondition.createtime) {
            whereCondition.createtime = {};
        }
        whereCondition.createtime.$lte = endtime;
    }


    var billDb = db.models.bill;
    billDb.findAll({
        where: whereCondition,
        order: [['createtime', 'DESC']]
    }).then(function (data) {
        var workbook = new Excel.Workbook();
        var worksheet = workbook.addWorksheet("红包列表");
        worksheet.columns = [
            { header: "红包单号", key: "billno", width: 25 },
            { header: "红包状态", key: "state", width: 25 },
            { header: "创建时间", key: "createtime", width: 25 },
            { header: "发送时间", key: "sendtime", width: 25 },
            { header: "金额（元）", key: "amount", width: 25 }
        ];

        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            item.state = String(item.state).toUpperCase();
            switch (item.state) {
                case "SUCCESS":
                    item.state = "发送成功";
                    break;
                case "SENDFALSE":
                    item.state = "发送失败";
                    break;
                default:
                    break;
            }
            worksheet.addRow(item);
        }
        res.header("Content-Type", "application/octet-stream");
        res.header("Content-Disposition", "attachment; filename=redpacketList.xlsx");
        workbook.xlsx.write(res);
    }).catch(function (error) {
        logger.error(error);
        res.json({
            error: {
                code: "unknown",
                message: "excel文档构建错误"
            }
        });
    });
}


module.exports = {
    incomeList: incomeList,
    redpacketList: redpacketList,
    redpacketInfo: redpacketInfo,
    updateIncomeRecord: updateIncomeRecord,
    downLoadIncomeList: downLoadIncomeList,
    downloadRedpacketList: downloadRedpacketList
};