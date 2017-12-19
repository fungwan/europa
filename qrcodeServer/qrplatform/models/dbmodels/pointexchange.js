/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('pointexchange', {
		recid:{type:datatypes.STRING(50),primaryKey: true},
		custid:{type:datatypes.STRING(50),allowNull:true},
		point:{type:datatypes.INTEGER,allowNull:true},
		outtime:{type:datatypes.BIGINT,allowNull:true},
		recvcustid:{type:datatypes.STRING(50),allowNull:true},
		recvtime:{type:datatypes.BIGINT,allowNull:true},
		state:{type:datatypes.INTEGER,allowNull:true},
			 message:{type:datatypes.STRING(600),allowNull:true}
    },
    {
        timestamps: false
    })
}
