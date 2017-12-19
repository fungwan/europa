/**
*create by codesmith
**/
module.exports=function(sequelize,datatypes){
     return sequelize.define('mallproductinfo', {
		productid:{type:datatypes.STRING(50),primaryKey: true},
		htmlinfo:{type:datatypes.TEXT,allowNull:true},
		images:{type:datatypes.STRING(5500),allowNull:true}
    },
    {
        timestamps: false
    })
}
