/**
 * Created by Erathink on 2016/12/13.
 */

module.exports = function (sequelize, datatypes) {
    return sequelize.define('merchandise', {
            mcdid: {type: datatypes.STRING(50), primaryKey:true},
            mcdname: {type: datatypes.STRING(50),allowNull: true},
            categoryid: {type: datatypes.STRING(50),allowNull: true},
            entid: {type: datatypes.STRING(50),allowNull: true},
            price: {type: datatypes.DECIMAL(5,2),allowNull: true},
            point: {type: datatypes.INTEGER,allowNull: true},
            mcdbrand:{type: datatypes.STRING(50),allowNull: true},
            creator:{type: datatypes.STRING(50),allowNull: true},
            createtime:{type: datatypes.BIGINT,allowNull: true},
            updater:{type: datatypes.STRING(50),allowNull: true},
            updatetime:{type: datatypes.BIGINT,allowNull: true},
            mcddesc:{type: datatypes.STRING(50),allowNull: true},
            state:{type: datatypes.STRING(50),allowNull: true}
        },
        {
            timestamps: false

        })
}
