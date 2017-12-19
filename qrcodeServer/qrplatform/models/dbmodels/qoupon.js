/**
 *create by codesmith
 **/
module.exports=function(sequelize,datatypes){
    return sequelize.define('qoupon', {
            qouponid:{type:datatypes.STRING(160),primaryKey: true},
            productid:{type:datatypes.STRING(160),allowNull:true},
            createdate:{type:datatypes.BIGINT,allowNull:true},
            owner:{type:datatypes.STRING(160),allowNull:true},
            state:{type:datatypes.STRING(80),allowNull:true},
            usedate:{type:datatypes.BIGINT,allowNull:true}
        },
        {
            timestamps: false
        })
}
