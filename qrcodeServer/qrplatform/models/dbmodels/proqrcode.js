/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('proqrcode', {
             qrid:{type:datatypes.STRING(50),primaryKey: true},
             content:{type:datatypes.STRING(50),allowNull:true},
             batchid:{type:datatypes.STRING(50),allowNull:true},
             state:{type:datatypes.STRING(50),allowNull:true}
    },
    {
        timestamps: false
    })
};
