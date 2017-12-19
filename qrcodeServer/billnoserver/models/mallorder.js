/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('mallorder', {
			 orderid:{type:datatypes.STRING(50),primaryKey: true},
			 custid:{type:datatypes.STRING(50),allowNull:true},
			 price:{type:datatypes.DECIMAL(10, 2),allowNull:true},
			 createtime:{type:datatypes.BIGINT,allowNull:true},
			 state:{type:datatypes.STRING(30),allowNull:true},
			 addid:{type:datatypes.STRING(50),allowNull:true},
			 address:{type:datatypes.STRING(500),allowNull:true},
			 sendtime:{type:datatypes.BIGINT,allowNull:true},
			 finishtime:{type:datatypes.BIGINT,allowNull:true},
			 orderbm:{type:datatypes.STRING(50),allowNull:true},
			 paymoney:{type:datatypes.DECIMAL(10, 2),allowNull:true},
			 tickmoney:{type:datatypes.DECIMAL(10, 2),allowNull:true},
			 discountmoney:{type:datatypes.DECIMAL(10, 2),allowNull:true},
			 tickid:{type:datatypes.STRING(500),allowNull:true},
			 remak:{type:datatypes.STRING(500),allowNull:true},
			 producttype:{type:datatypes.STRING(50),allowNull:true},
			 express:{type:datatypes.STRING(100),allowNull:true},
			 trackingno:{type:datatypes.STRING(100),allowNull:true},
			 postage:{type:datatypes.DECIMAL(10, 2),defaultValue: 0,allowNull:true},
			 evalstate:{type:datatypes.INTEGER,allowNull:true},
			 billno:{type:datatypes.STRING(50),allowNull:true}
    },
    {
        timestamps: false
    })
}
