/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('prosale', {
		saleid:{type:datatypes.STRING(50),primaryKey: true},
		projectid:{type:datatypes.STRING(50),allowNull:true},
		unfinisheddesc:{type:datatypes.STRING(500),allowNull:true},
		finisheddesc:{type:datatypes.STRING(500),allowNull:true},
		redpacket:{type:datatypes.INTEGER,allowNull:true},
		condition:{type:datatypes.INTEGER,allowNull:true},
		conditiontype:{type:datatypes.INTEGER,allowNull:true}
    },
    {
        timestamps: false
    })
}
