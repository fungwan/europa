/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('prolotteryrule', {
		ruleid:{type:datatypes.STRING(50),primaryKey: true},
        projectid:{type:datatypes.STRING(50)},
		lotteryid:{type:datatypes.STRING(50)},
		begtime:{type:datatypes.STRING(50)},
		endtime:{type:datatypes.STRING(50)},
		amount:{type:datatypes.INTEGER},
		ruletype:{type:datatypes.STRING(50)},
		state:{type:datatypes.STRING(50)},
		area:{type:datatypes.STRING(50),allowNull:true}
    },
    {
        timestamps: false
    })
}
