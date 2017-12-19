/**
 *create by codesmith
 **/
module.exports=function(sequelize,datatypes){
    return sequelize.define('discountcoupon', {
            id:{type:datatypes.STRING(100),primaryKey: true},
            productid:{type:datatypes.STRING(100),allowNull:true},
            productname:{type:datatypes.STRING(100),allowNull:true},
            createdate:{type:datatypes.BIGINT,allowNull:true},
            ratio:{type: datatypes.DECIMAL(5, 2),allowNull:true},
            owner:{type:datatypes.STRING(100),allowNull:true},
            state:{type:datatypes.INTEGER,allowNull:true},
            usedate:{type:datatypes.BIGINT,allowNull:true}
        },
        {
            timestamps: false
        })
}
