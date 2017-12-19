/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('prosalerecord', {
		qrid:{type:datatypes.STRING(50),primaryKey: true},
		recid:{type:datatypes.STRING(50),allowNull:true},
		billno:{type:datatypes.STRING(30),allowNull:true},
		custid:{type:datatypes.STRING(50),allowNull:true},
		openid:{type:datatypes.STRING(50),allowNull:true},
		nickname:{type:datatypes.STRING(50),allowNull:true},
		entid:{type:datatypes.STRING(50),allowNull:true},
		entname:{type:datatypes.STRING(300),allowNull:true},
		categoryid:{type:datatypes.STRING(50),allowNull:true},
		projectid:{type:datatypes.STRING(50),allowNull:true},
		projectname:{type:datatypes.STRING(50),allowNull:true},
		state:{type:datatypes.STRING(150),allowNull:true},
		price:{type:datatypes.DECIMAL(10, 2),allowNull:true},
		rectime:{type:datatypes.STRING(50),allowNull:true},
		country:{type:datatypes.STRING(50),allowNull:true},
		province:{type:datatypes.STRING(50),allowNull:true},
		city:{type:datatypes.STRING(50),allowNull:true},
		areacode:{type:datatypes.STRING(50),allowNull:true}
    },
    {
        timestamps: false
    })
}
