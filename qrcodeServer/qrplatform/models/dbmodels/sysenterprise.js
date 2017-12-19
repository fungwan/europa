/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('sysenterprise', {
			 entid:{type:datatypes.STRING(50),primaryKey: true},
			 entname:{type:datatypes.STRING(50),allowNull:true},
			 entcontact:{type:datatypes.STRING(150),allowNull:true},
			 entphone:{type:datatypes.STRING(150),allowNull:true},
			 entaddr:{type:datatypes.STRING(500),allowNull:true},
			 entemail:{type:datatypes.STRING(150),allowNull:true},
			 areacode:{type:datatypes.STRING(150),allowNull:true},
			 imageurl:{type:datatypes.STRING(200),allowNull:true},
			 balance:{type:datatypes.DECIMAL,allowNull:true}
    },
    {
        timestamps: false
    })
}
