/**
 * Created by shuwei on 2017/6/8.
 */
/**
 * Created by shuwei on 2017/6/8.
 */
module.exports=function(sequelize,datatypes){
    return sequelize.define('lottorecord', {
            id:{type:datatypes.STRING(50),primaryKey: true},
            custid:{type:datatypes.STRING(50),allowNull:true},
            lottoprizeid:{type:datatypes.STRING(50),allowNull:true},
            usepoint:{type:datatypes.INTEGER,allowNull:true},
            rectime:{type:datatypes.BIGINT,allowNull:true},
            lottoid:{type:datatypes.STRING(50),allowNull:true}
        },
        {
            timestamps: false
        })
};