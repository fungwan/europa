module.exports = function (sequelize, datatypes) {
    return sequelize.define('projectgroup', {
            groupid: {type: datatypes.STRING(50), primaryKey: true},
            grouptype:{type: datatypes.STRING(50)},
            prolist:{type: datatypes.STRING(500)},
            limitnumber:{type: datatypes.INTEGER}
        },
        {
            timestamps: false
        });
};