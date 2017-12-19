/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('progiftrecord', {
		recid:{type:datatypes.STRING(50),primaryKey: true},
		recno:{type:datatypes.STRING(30),allowNull:true},
		custid:{type:datatypes.STRING(150),allowNull:true},
		entid:{type:datatypes.STRING(150),allowNull:true},
		projectid:{type:datatypes.STRING(150),allowNull:true},
		giftid:{type:datatypes.STRING(150),allowNull:true},
		mallproducttype:{type:datatypes.STRING(150),allowNull:true},
		projectname:{type:datatypes.STRING(150),allowNull:true},
		entname:{type:datatypes.STRING(300),allowNull:true},
		nickname:{type:datatypes.STRING(150),allowNull:true},
		mallproductname:{type:datatypes.STRING(150),allowNull:true},
		mallproductid:{type:datatypes.STRING(150),allowNull:true},
		price:{type:datatypes.DECIMAL(10, 2),allowNull:true},
		amount:{type:datatypes.INTEGER,allowNull:true},
		rectime:{type:datatypes.STRING(150),allowNull:true},
		state:{type:datatypes.STRING(150),allowNull:true},
		country:{type:datatypes.STRING(150),allowNull:true},
		province:{type:datatypes.STRING(150),allowNull:true},
		city:{type:datatypes.STRING(150),allowNull:true},
		areacode:{type:datatypes.STRING(150),allowNull:true},
		phone:{type:datatypes.STRING(150),allowNull:true},
		openid:{type:datatypes.STRING(150),allowNull:true}
    },
    {
        timestamps: false
    })
}
