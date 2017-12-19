/**
 * Created by shuwei on 2017/6/8.
 */
module.exports=function(sequelize,datatypes){
    return sequelize.define('lottopoint', {
            id:{type:datatypes.STRING(50),primaryKey: true},
            ratio:{type:datatypes.DECIMAL,allowNull:true},
            point:{type:datatypes.INTEGER,allowNull:true},
            lottoid:{type:datatypes.STRING(50),allowNull:true}
        },
        {
            timestamps: false
        })
};