/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('custfocus', {
		fid:{type:datatypes.STRING(50),primaryKey: true},
		custid:{type:datatypes.STRING(50),allowNull:true},
		entid:{type:datatypes.STRING(50),allowNull:true},
		state:{type:datatypes.STRING(50),allowNull:true},
		focustime:{type:datatypes.BIGINT,allowNull:true},
		content:{type:datatypes.STRING(500),allowNull:true},
		unfocustime:{type:datatypes.BIGINT,allowNull:true}
    },
    {
        timestamps: false
    })
}
