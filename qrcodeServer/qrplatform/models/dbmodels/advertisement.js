module.exports=function(sequelize,datatypes){
    return sequelize.define('advertisement', {
            adid:{type:datatypes.STRING(100),primaryKey: true},
            artid:{type:datatypes.STRING(100),allowNull:true},
            begtime:{type:datatypes.BIGINT,allowNull:true},
            endtime:{type:datatypes.BIGINT,allowNull:true},
            adtype:{type:datatypes.STRING(200),allowNull:true}
        },
        {
            timestamps: false
        })
}