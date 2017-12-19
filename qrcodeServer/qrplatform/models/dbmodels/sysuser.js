/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('sysuser', {
		userid:{type:datatypes.STRING(50),primaryKey: true},
		entid:{type:datatypes.STRING(50)},
		useraccount:{type:datatypes.STRING(50)},
		userpwd:{type:datatypes.STRING(50)},
		logintime:{type:datatypes.STRING(50)},
		confirmed:{type:datatypes.BOOLEAN},
		confirmtime:{type:datatypes.STRING(50)},
		confirmcontent:{type:datatypes.STRING(300)},
		updateinfo:{type:datatypes.BOOLEAN},
		updateinfotime:{type:datatypes.STRING(50)},
		locked:{type:datatypes.BOOLEAN},
		locktime:{type:datatypes.STRING(50)},
		disabled:{type:datatypes.BOOLEAN},
		disabletime:{type:datatypes.STRING(50)},
		registtime:{type:datatypes.STRING(50)},
		loginfailtime:{type:datatypes.STRING(50)},
		failtimes:{type:datatypes.INTEGER},
		roleid:{type:datatypes.STRING(50)}
    },
    {
        timestamps: false
    })
}
