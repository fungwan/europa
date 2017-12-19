/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('proqarecord', {
		recid:{type:datatypes.STRING(50),primaryKey: true},
		qrid:{type:datatypes.STRING(50)},
		custid:{type:datatypes.STRING(50)},
		qaid:{type:datatypes.STRING(50)},
		projectid:{type:datatypes.STRING(50)},
		projectname:{type:datatypes.STRING(50)},
		entid:{type:datatypes.STRING(50)},
		entname:{type:datatypes.STRING(100)},
		nickname:{type:datatypes.STRING(50)},
		qaname:{type:datatypes.STRING(200)},
		answer:{type:datatypes.STRING(100)},
		answertime:{type:datatypes.STRING(50)},
		country:{type:datatypes.STRING(50)},
		province:{type:datatypes.STRING(50)},
		city:{type:datatypes.STRING(50)},
		areacode:{type:datatypes.STRING(50)},
		number:{type:datatypes.INTEGER}
    },
    {
        timestamps: false
    })
}
