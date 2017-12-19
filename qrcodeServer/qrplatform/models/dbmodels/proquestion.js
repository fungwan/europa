/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('proquestion', {
		qaid:{type:datatypes.STRING(50),primaryKey: true},
		projectid:{type:datatypes.STRING(50)},
		name:{type:datatypes.STRING(200)},
		answer:{type:datatypes.STRING(500)},
		qatype:{type:datatypes.STRING(50)},
        number:{type:datatypes.INTEGER}
    },
    {
        timestamps: false
    })
}
