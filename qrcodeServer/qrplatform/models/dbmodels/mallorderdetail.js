/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('mallorderdetail', {
			 itemid:{type:datatypes.STRING(50),primaryKey: true},
			 orderid:{type:datatypes.STRING(50)},
			 mcdid:{type:datatypes.STRING(50),allowNull:true},
			 productname:{type:datatypes.STRING(50),allowNull:true},
			 productnumber:{type:datatypes.INTEGER,allowNull:true},
			 productinfo:{type:datatypes.STRING(500),allowNull:true},
			 productimage:{type:datatypes.STRING(200),allowNull:true},
			 price:{type:datatypes.DECIMAL(10, 2),allowNull:true},
			 sumprice:{type:datatypes.DECIMAL(10, 2),allowNull:true},
			 privilege:{type:datatypes.STRING(50),allowNull:true},
		     cost:{type:datatypes.DECIMAL,allowNull:true}
    },
    {
        timestamps: false
    })
};
