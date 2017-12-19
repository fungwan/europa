module.exports = function (sequelize, datatypes) {
    return sequelize.define('share_record', {
        id: { type: datatypes.STRING(150), primaryKey: true },
        share_custid: { type: datatypes.STRING(150) },
        config_id: { type: datatypes.STRING(150) }
    }, {
        timestamps: true,
        underscored: true
    });
};