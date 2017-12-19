/**
 * Created by shuwei on 15/12/23.
 */

module.exports = function (sequelize, datatypes) {
    return sequelize.define('bill', {
            billno: {type: datatypes.STRING(50), primaryKey: true},
            billtype:{type: datatypes.STRING(50)},
            resultcode: {type: datatypes.STRING(50)},
            openid: {type: datatypes.STRING(50)},
            amount: {type: datatypes.STRING(50)},
            createtime: {type: datatypes.STRING(50)},//创建时间
            submittime:{type: datatypes.STRING(50)},//提交时间
            sendtime: {type: datatypes.STRING(50)},//支付时间
            listid: {type: datatypes.STRING(200)},
            state:{type:datatypes.STRING(20)}//状态 0:未提交 1:已支付  2:支付失败
        },
        {
            timestamps: false
        });
};