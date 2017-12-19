/**
 *create by xdf
 *
 */
module.exports = function(sequelize, datatypes) {
    return sequelize.define('mallproduct', {
        productid: { type: datatypes.STRING(50), primaryKey: true },
        productname: { type: datatypes.STRING(50), allowNull: true },
        productor: { type: datatypes.STRING(50), allowNull: true },
        price: { type: datatypes.DECIMAL, allowNull: true },
        amount: { type: datatypes.INTEGER, allowNull: true },
        productdate: { type: datatypes.STRING(200), allowNull: true },
        state: { type: datatypes.STRING(50), allowNull: true },
        producttype: { type: datatypes.STRING(20), allowNull: true },
        privilege: { type: datatypes.INTEGER, allowNull: true },
        productimage: { type: datatypes.STRING(200), allowNull: true },
        productinfo: { type: datatypes.STRING(500), allowNull: true },
        leve: { type: datatypes.INTEGER, allowNull: true },
        cost: { type: datatypes.DECIMAL, allowNull: true },
        spec: { type: datatypes.STRING(100), allowNull: true },
        validity_beg: { type: datatypes.DATE, allowNull: true },
        validity_end: { type: datatypes.DATE, allowNull: true }
    }, {
        timestamps: false
    })
};