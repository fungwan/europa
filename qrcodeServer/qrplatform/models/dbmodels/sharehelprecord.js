module.exports = function (sequelize, datatypes) {
    return sequelize.define('share_help_record', {
        id: { type: datatypes.STRING(150), primaryKey: true },
        share_record_id: { type: datatypes.STRING(150) },
        help_custid: { type: datatypes.STRING(150) },
        share_point: { type: datatypes.INTEGER }, 
        help_point: { type: datatypes.INTEGER }
    }, {
        timestamps: true,
        underscored: true
    });
};