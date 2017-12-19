/**
 * Created by Erathink on 2016/12/13.
 */

module.exports = function (sequelize, datatypes) {
    return sequelize.define('proqrcodebatch', {
            batchid:{type:datatypes.STRING(50),primaryKey: true},
            batchcode:{type:datatypes.STRING(50),allowNull:true},
            entid:{type:datatypes.STRING(50),allowNull:true},
            mcdid:{type:datatypes.STRING(50),allowNull:true},
            categoryid:{type:datatypes.STRING(150),allowNull:true},
            creator:{type:datatypes.STRING(50),allowNull:true},
            createtime:{type:datatypes.DECIMAL,allowNull:true},
            updater:{type:datatypes.STRING(50),allowNull:true},
            modifiedtime:{type:datatypes.DECIMAL,allowNull:true},
            amount:{type:datatypes.INTEGER,allowNull:true},
            count:{type:datatypes.INTEGER,allowNull:true},
            state:{type:datatypes.STRING(50),allowNull:true}
        },
        {
            timestamps: false

        })
}
