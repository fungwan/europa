/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('custaddress', {
		addid:{type:datatypes.STRING(50),primaryKey: true},
		custid:{type:datatypes.STRING(50),allowNull:true},
		country:{type:datatypes.STRING(50),allowNull:true},
		province:{type:datatypes.STRING(50),allowNull:true},
		city:{type:datatypes.STRING(50),allowNull:true},
		address:{type:datatypes.STRING(500),allowNull:true},
		phone:{type:datatypes.STRING(50),allowNull:true},
		contact:{type:datatypes.STRING(50),allowNull:true}
    },
    {
        timestamps: false
    })
}
