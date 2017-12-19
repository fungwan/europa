/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('mallcategory', {
		caid:{type:datatypes.STRING(50),primaryKey: true},
		caname:{type:datatypes.STRING(50),allowNull:true},
        type:{type:datatypes.STRING(50),allowNull:true},
		pid:{type:datatypes.STRING(50),allowNull:true},
		info:{type:datatypes.STRING(200),allowNull:true}
    },
    {
        timestamps: false
    })
}
