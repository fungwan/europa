/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('producteval', {
		id:{type:datatypes.STRING(50),primaryKey: true},
		productid:{type:datatypes.STRING(50),allowNull:true},
		leve:{type:datatypes.INTEGER,allowNull:true},
		info:{type:datatypes.STRING(500),allowNull:true},
		state:{type:datatypes.STRING(10),allowNull:false,defaultValue:'0'},
		remark:{type:datatypes.STRING(500),allowNull:true},
		createtime:{type:datatypes.INTEGER,allowNull:true},
		custid:{type:datatypes.STRING(50),allowNull:true},
		nickname:{type:datatypes.STRING(50),allowNull:true},
		image:{type:datatypes.STRING(50),allowNull:true},
		sensitiveflag:{type:datatypes.STRING(10),allowNull:false,defaultValue:'0'},
		score:{type:datatypes.DECIMAL,allowNull:true},
		orderid:{type:datatypes.STRING(50),allowNull:true}
    },
    {
        timestamps: false
    })
}
