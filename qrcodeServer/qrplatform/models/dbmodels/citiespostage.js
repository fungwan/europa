/**
 *create by codesmith
 **/
module.exports=function(sequelize,datatypes){
    return sequelize.define('citiespostage', {
            code: {type: datatypes.STRING(20),primaryKey: true},
            name: {type: datatypes.STRING(50)},
            price:{type:datatypes.DECIMAL}
        },
        {
            timestamps: false
        })
}
