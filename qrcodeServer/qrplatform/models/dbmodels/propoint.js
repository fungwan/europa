/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('propoint', {
             pointid:{type:datatypes.STRING(150),primaryKey: true},
             projectid:{type:datatypes.STRING(150),allowNull:true},
             point:{type:datatypes.DECIMAL,allowNull:true},
             pointtype:{type:datatypes.STRING(50),allowNull:true}
    },
    {
        timestamps: false
    })
}
