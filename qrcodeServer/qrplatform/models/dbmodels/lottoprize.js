/**
 * Created by shuwei on 2017/6/8.
 */
module.exports=function(sequelize,datatypes){
    return sequelize.define('lottoprize', {
            id:{type:datatypes.STRING(50),primaryKey: true},
            prizename:{type:datatypes.STRING(50),allowNull:true},
            productid:{type:datatypes.STRING(50),allowNull:true},
            productnumber:{type:datatypes.INTEGER,allowNull:true},
            ratio:{type:datatypes.DECIMAL,allowNull:true},
            maxnumber:{type:datatypes.INTEGER,allowNull:true},
            lottoid:{type:datatypes.STRING(50),allowNull:true}
           // isdefault:{type:datatypes.BOOLEAN,allowNull:true},
        },
        {
            timestamps: false
        })
};