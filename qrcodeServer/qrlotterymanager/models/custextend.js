/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('custextend', {
			 custid:{type:datatypes.STRING(50),primaryKey: true},
			 point:{type:datatypes.DECIMAL,allowNull:true},
			 fullname:{type:datatypes.STRING(60),allowNull:true},
			 phone:{type:datatypes.STRING(50),allowNull:true},
			 address:{type:datatypes.STRING(450),allowNull:true},
			 leve:{type:datatypes.INTEGER,allowNull:true},
			 paypassword:{type:datatypes.STRING(60),allowNull:true},
			 passwordleve:{type:datatypes.STRING(50),allowNull:true},
			 email:{type:datatypes.STRING(300),allowNull:true},
			 emailquestion:{type:datatypes.STRING(300),allowNull:true}
    },
    {
        timestamps: false
    })
}
