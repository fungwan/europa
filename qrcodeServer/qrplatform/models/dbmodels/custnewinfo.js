/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('custnewinfo', {
		custid:{type:datatypes.STRING(50),primaryKey: true},
		neworderreceivin:{type:datatypes.INTEGER,allowNull:true},
		newordereva:{type:datatypes.INTEGER,allowNull:true},
		newprize:{type:datatypes.INTEGER,allowNull:true},
		newprizereceivin:{type:datatypes.INTEGER,allowNull:true}
    },
    {
        timestamps: false
    })
}
