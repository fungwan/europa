/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('shopingcart', {
		id:{type:datatypes.STRING(50),primaryKey: true},
		custid:{type:datatypes.STRING(50),allowNull:true},
            // productid:{type:datatypes.STRING(50),allowNull:true},
             number:{type:datatypes.INTEGER,allowNull:true},
             addtime: {type: datatypes.BIGINT(10), allowNull: true}
    },
    {
        timestamps: false
    })
}
