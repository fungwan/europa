/**
 *create by codesmith
 **/
module.exports=function(sequelize,datatypes){
    return sequelize.define('favorites', {
            favoritesid:{type:datatypes.STRING(50),primaryKey: true},
            productid:{type:datatypes.STRING(50),primaryKey: true},
            custid:{type:datatypes.STRING(100),primaryKey: true},
            createdate:{type:datatypes.INTEGER}
        },
        {
            timestamps: false
        })
}
