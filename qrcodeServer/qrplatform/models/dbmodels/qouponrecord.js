/**
 * Created by shuwei on 2017/5/18.
 */
/**
 *create by codesmith
 **/
module.exports=function(sequelize,datatypes){
    return sequelize.define('qouponrecord', {
            recid:{type:datatypes.STRING(50),primaryKey: true},
            qouponid:{type:datatypes.STRING(50),allowNull:true},
            user:{type:datatypes.STRING(50),allowNull:true},
            usetime:{type:datatypes.BIGINT,allowNull:true},
            usetype:{type:datatypes.STRING(40),allowNull:true},
            reciver:{type:datatypes.STRING(50),allowNull:true},
            info:{type:datatypes.STRING(400),allowNull:true},
            price:{type:datatypes.DECIMAL,allowNull:true},
            cost:{type:datatypes.DECIMAL,allowNull:true}
        },
        {
            timestamps: false
        })
}
