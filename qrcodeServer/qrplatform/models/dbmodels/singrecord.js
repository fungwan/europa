module.exports=function(sequelize,datatypes){
    return sequelize.define('signrecord', {
            signid:{type:datatypes.STRING(50),primaryKey: true},
            custid:{type:datatypes.STRING(50),allowNull:true},
            point:{type:datatypes.STRING(50),allowNull:true},
            signdate: {type: datatypes.BIGINT(10), allowNull: true}
        },
        {
            timestamps: false
        })
}