module.exports = function (sequelize, datatypes) {
    return sequelize.define('project_share_config', {
        id: { type: datatypes.STRING(150), primaryKey: true },
        project_id: {type: datatypes.STRING(150), allowNull: true, unique: true },
        enable: { type: datatypes.INTEGER(1) },
        share_point: { type: datatypes.INTEGER },
        share_max_point: { type: datatypes.INTEGER },
        help_point: { type: datatypes.INTEGER },
        help_max_point: { type: datatypes.INTEGER }
    }, {
        timestamps: true,
        underscored: true
    });
};