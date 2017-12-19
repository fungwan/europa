/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('sysmessage', {
		msgid:{type:datatypes.STRING(50),primaryKey: true},
		content:{type:datatypes.STRING(500)},
		toid:{type:datatypes.STRING(50)},
		toname:{type:datatypes.STRING(50)},
		sendstatus:{type:datatypes.STRING(50)},
		sendtime:{type:datatypes.STRING(50)},
		isread:{type:datatypes.BOOLEAN,defaultValue:false},
		readtime:{type:datatypes.STRING(50)},
		createtime:{type:datatypes.STRING(50)}
    },
    {
        timestamps: false
    })
}
