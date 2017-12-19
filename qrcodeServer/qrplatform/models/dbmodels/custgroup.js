/**
 *create by codesmith
 **/
module.exports = function (sequelize, datatypes) {
    return sequelize.define('custgroup', {
            groupid: {type: datatypes.STRING(50), primaryKey:true},
            entid: {type: datatypes.STRING(50)},
            groupname: {type: datatypes.STRING(50)},
            parentid: {type: datatypes.STRING(50), allowNull: true},
            isdisabled: {type: datatypes.BOOLEAN},
            grouptype: {type: datatypes.STRING(50)},
            groupdesc: {type: datatypes.STRING(100)}
        },
        {
            timestamps: false

        })
}
