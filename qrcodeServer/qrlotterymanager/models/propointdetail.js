/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('propointdetail', {
		detailid:{type:datatypes.STRING(50),primaryKey: true},
		custid:{type:datatypes.STRING(50)},
        entid:{type:datatypes.STRING(50)},
		pointchannel:{type:datatypes.STRING(50)},
		point:{type:datatypes.DECIMAL},
		pointtime:{type:datatypes.STRING(50)},
		changemode:{type:datatypes.STRING(50),allowNull:true},
		remark:{type:datatypes.STRING(50),allowNull:true}
    },
    {
        timestamps: false,            
        indexes: [
                  {unique: true,fields:['detailid']},
                 ]
    })
}
