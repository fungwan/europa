/**
 * Created by shuwei on 2017/6/8.
 */
module.exports=function(sequelize,datatypes){
    return sequelize.define('lotto', {
            lottoid:{type:datatypes.STRING(50),primaryKey: true},
            begindate:{type:datatypes.BIGINT,allowNull:true},
            enddate:{type:datatypes.BIGINT,allowNull:true},
            info:{type:datatypes.STRING(300),allowNull:true},
            name:{type:datatypes.STRING(100),allowNull:true},
            state:{type:datatypes.INTEGER,defaultValue: 0}
        },
        {
            timestamps: false
        })
}
