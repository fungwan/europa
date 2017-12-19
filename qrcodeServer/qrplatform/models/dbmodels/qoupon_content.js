/**
 * Created by shuwei on 2017/5/11.
 */
/**
 *create by codesmith
 **/
module.exports=function(sequelize,datatypes){
    return sequelize.define('qoupon_content', {
            itemid:{type:datatypes.STRING(50),primaryKey: true},
            qouponclassid:{type:datatypes.STRING(50),allowNull:true},
            productid:{type:datatypes.STRING(50),allowNull:true},
            number:{type:datatypes.INTEGER,allowNull:true},
            price:{type:datatypes.STRING,allowNull:true},
            productname:{type:datatypes.STRING(200),allowNull:true}
        },
        {
            timestamps: false
        })
}
