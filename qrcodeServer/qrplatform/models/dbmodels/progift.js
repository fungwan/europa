/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('progift', {
		giftid:{type:datatypes.STRING(50),primaryKey: true},
		projectid:{type:datatypes.STRING(50),allowNull:true},
		mallproductid:{type:datatypes.STRING(50),allowNull:true},
        mallproducttype:{type:datatypes.STRING(50),allowNull:true},
        mallproductname:{type:datatypes.STRING(50),allowNull:true},
        price:{type:datatypes.DECIMAL,allowNull:true},
        summoney:{type:datatypes.DECIMAL,allowNull:true},
		giftcount:{type:datatypes.INTEGER,allowNull:true}
    },
    {
        timestamps: false
    })
}
