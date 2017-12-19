/**
 * Created by Yatagaras on 2015/12/7.
 */


module.exports = function (sequelize, datatypes) {
    return sequelize.define('cities', {
            id: {type: datatypes.INTEGER, primaryKey: true},
            code: {type: datatypes.STRING(20)},
            parentCode: {type: datatypes.STRING(20)},
            name: {type: datatypes.STRING(50)},
            level: {type: datatypes.INTEGER},
            full: {type: datatypes.STRING(200)}
        },
        {
            timestamps: false
        });
};