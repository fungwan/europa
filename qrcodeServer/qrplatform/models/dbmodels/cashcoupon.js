/**
 *create by codesmith
 **/
module.exports=function(sequelize,datatypes){
    return sequelize.define('cashcoupon', {
            couponid:{type:datatypes.STRING(160)},
            productid:{type:datatypes.STRING(160),allowNull:true},
            createdate:{type:datatypes.INTEGER,allowNull:true},
            owner:{type:datatypes.STRING(160),allowNull:true},
            state:{type:datatypes.STRING(80),allowNull:true},
            usedate:{type:datatypes.INTEGER,allowNull:true},
            url:{type:datatypes.STRING(160),primaryKey: true}
        },
        {
            timestamps: false
        })
}
