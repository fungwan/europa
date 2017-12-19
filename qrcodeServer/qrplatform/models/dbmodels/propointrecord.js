/**
 *create by codesmith
 **/
module.exports = function (sequelize, datatypes) {
    return sequelize.define('propointrecord', {
            recid:{type:datatypes.STRING(50),primaryKey: true},
            custid:{type:datatypes.STRING(50),allowNull:true},
            projectid:{type:datatypes.STRING(50),allowNull:true},
            projectname:{type:datatypes.STRING(150),allowNull:true},
            entname:{type:datatypes.STRING(300),allowNull:true},
            nickname:{type:datatypes.STRING(150),allowNull:true},
            point:{type:datatypes.DECIMAL,allowNull:true},
            pointtime:{type:datatypes.STRING(150),allowNull:true},
            country:{type:datatypes.STRING(150),allowNull:true},
            province:{type:datatypes.STRING(150),allowNull:true},
            city:{type:datatypes.STRING(150),allowNull:true},
            areacode:{type:datatypes.STRING(150),allowNull:true},
            entid:{type:datatypes.STRING(150),allowNull:true}
        },
        {
            timestamps: false
        })
}
