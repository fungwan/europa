/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('article', {
		artid:{type:datatypes.STRING(50),primaryKey: true},
		entid:{type:datatypes.STRING(50),allowNull:true},
		title:{type:datatypes.STRING(200),allowNull:true},
		arttype:{type:datatypes.STRING(50),allowNull:true},
		keyword:{type:datatypes.STRING(200),allowNull:true},
		summary:{type:datatypes.STRING(500),allowNull:true},
		createtime:{type:datatypes.INTEGER,allowNull:true},
		outtime:{type:datatypes.INTEGER,allowNull:true},
		author:{type:datatypes.STRING(50),allowNull:true},
		authorurl:{type:datatypes.STRING(200),allowNull:true},
		titleimageurl:{type:datatypes.STRING(200),allowNull:true},
		content:{type:datatypes.TEXT,allowNull:true},
		state:{type:datatypes.STRING(50),allowNull:true},
		publishtime:{type:datatypes.INTEGER,allowNull:true},
		recivetype:{type:datatypes.INTEGER,allowNull:true},
			 istop:{type:datatypes.INTEGER,allowNull:true},
			 ishot:{type:datatypes.INTEGER,allowNull:true}
    },
    {
        timestamps: false
    })
}
