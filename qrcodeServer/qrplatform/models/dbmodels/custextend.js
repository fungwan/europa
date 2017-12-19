/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('custextend', {
			 custid:{type:datatypes.STRING(50),primaryKey: true},
			 point:{type:datatypes.DECIMAL,allowNull:true},
			 fullname:{type:datatypes.STRING(20),allowNull:true},
			 phone:{type:datatypes.STRING(50),allowNull:true},
			 address:{type:datatypes.STRING(150),allowNull:true},
			 leve:{type:datatypes.INTEGER,allowNull:true},
			 paypassword:{type:datatypes.STRING(20),allowNull:true},
			 passwordleve:{type:datatypes.STRING(50),allowNull:true},
			 email:{type:datatypes.STRING(100),allowNull:true},
			 emailquestion:{type:datatypes.STRING(100),allowNull:true},
			 favoritesnotify:{type:datatypes.INTEGER,defaultValue: 0}
    },
    {
        timestamps: false
    })
}
