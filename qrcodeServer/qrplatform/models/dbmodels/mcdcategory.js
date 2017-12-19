/**
 * Created by Erathink on 2016/12/13.
 */

module.exports = function (sequelize, datatypes) {
    return sequelize.define('mcdcategory', {
            categoryid: {type: datatypes.STRING(50), primaryKey:true},
            name: {type: datatypes.STRING(50),allowNull: true},
            categorydesc: {type: datatypes.STRING(50),allowNull: true},
            entid: {type: datatypes.STRING(50), allowNull: true},
            parentid: {type: datatypes.STRING(50),allowNull: true},
            creator:{type: datatypes.STRING(50),allowNull: true},
            createtime:{type: datatypes.DECIMAL(20,2),allowNull: true},
            updater:{type: datatypes.STRING(50),allowNull: true},
            updatetime:{type: datatypes.DECIMAL(20,2),allowNull: true},
            state:{type: datatypes.STRING(50),allowNull: true}
        },
        {
            timestamps: false

        })
}
