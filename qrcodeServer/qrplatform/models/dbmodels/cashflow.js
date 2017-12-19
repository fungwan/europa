/**
 * Created by shuwei on 15/12/23.
 */

module.exports = function (sequelize, datatypes) {
    return sequelize.define('cashflow', {
            transaction_id: {type: datatypes.STRING(32), primaryKey: true},
            out_trade_no: {type: datatypes.STRING(32)},
            time_end: {type: datatypes.STRING(100)},//支付时间
            openid: {type: datatypes.STRING(128)},
            trade_type:{type: datatypes.STRING(20)},
            pay_state:{type: datatypes.STRING(20)},
            pay_bank:{type: datatypes.STRING(120)},
            fee_type:{type: datatypes.STRING(20)},
            total_fee:{type: datatypes.DECIMAL},
            err_code: {type: datatypes.STRING(50),allowNull:true},
            err_code_des: {type: datatypes.STRING(128),allowNull:true},
            refund_id:{type: datatypes.STRING(32),allowNull:true},
            out_refund_no:{type: datatypes.STRING(32),allowNull:true},
            refund_fee:{type: datatypes.DECIMAL, allowNull: true},
            refund_type:{type: datatypes.STRING(32),allowNull:true},
            refund_state:{type: datatypes.STRING(32),allowNull:true},
            refund_time_end: {type: datatypes.STRING(100),allowNull:true}//退款时间
        },
        {
            timestamps: false
        });
};