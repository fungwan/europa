/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('custgroupmap', {
		id:{type:datatypes.STRING(50)},
		custid:{type:datatypes.STRING(50),primaryKey: true},
		entid:{type:datatypes.STRING(50),primaryKey: true},
		groupid:{type:datatypes.STRING(50),allowNull:true}
    },
    {
        timestamps: false
    })
}
