/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('customer', {
		custid:{type:datatypes.STRING(50),primaryKey: true},
		entid:{type:datatypes.STRING(50),allowNull:true},
		groupid:{type:datatypes.STRING(50),allowNull:true},
		nickname:{type:datatypes.STRING(100)},
		sex:{type:datatypes.INTEGER},
		phone:{type:datatypes.STRING(50)},
		email:{type:datatypes.STRING(50)},
		birthday:{type:datatypes.STRING(50)},
		idcard:{type:datatypes.STRING(50)},
		country:{type:datatypes.STRING(50)},
		province:{type:datatypes.STRING(50)},
		city:{type:datatypes.STRING(50)},
		address:{type:datatypes.STRING(100)},
		openid:{type:datatypes.STRING(50)},
		areacode:{type:datatypes.STRING(50)},
		custtype:{type:datatypes.STRING(50)},
		groupname:{type:datatypes.STRING(50)},
		createtime:{type:datatypes.STRING(50)},
		 unionid:{type:datatypes.STRING(50)},
		 subscribe:{type:datatypes.INTEGER},
		 lat:{type:datatypes.DECIMAL(20,10),allowNull:true},
		 lng:{type:datatypes.DECIMAL(20,10),allowNull:true},
		 edittime:{type:datatypes.STRING(50)},
		sign:{type:datatypes.STRING(100),allowNull:true},
			 headimgurl:{type:datatypes.STRING(400),allowNull:true}
    },
    {
        timestamps: false
    })
}
