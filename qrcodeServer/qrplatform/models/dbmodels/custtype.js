/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('custtype', {
		id:{type:datatypes.STRING(50),primaryKey: true},
		entid:{type:datatypes.STRING(50),allowNull:true},
		name:{type:datatypes.STRING(50),allowNull:true},
		info:{type:datatypes.STRING(500),allowNull:true}
    },
    {
        timestamps: false
    })
}
