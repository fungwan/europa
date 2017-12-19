/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('ctg2project', {
		id:{type:datatypes.STRING(50),primaryKey: true},
		entid:{type:datatypes.STRING(50),allowNull:true},
		categoryid:{type:datatypes.STRING(50),allowNull:true},
		projectid:{type:datatypes.STRING(50),allowNull:true},
		state:{type:datatypes.STRING(30),allowNull:true}
    },
    {
        timestamps: false
    })
}
