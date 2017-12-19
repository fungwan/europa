/**
 *create by codesmith
 **/
module.exports = function (sequelize, datatypes) {
    return sequelize.define('project', {
            projectid: {type: datatypes.STRING(50), primaryKey: true},
            entid: {type: datatypes.STRING(50)},
            name: {type: datatypes.STRING(50)},
            entname: {type: datatypes.STRING(50)},
            description: {type: datatypes.STRING(200)},
            type: {type: datatypes.STRING(50)},
            begdate: {type: datatypes.STRING(50)},
            enddate: {type: datatypes.STRING(50)},
            creater: {type: datatypes.STRING(50)},
            createtime: {type: datatypes.STRING(50)},
            updatetime: {type: datatypes.STRING(50)},
            updater: {type: datatypes.STRING(50)},
            state: {type: datatypes.STRING(50)},
            percent: {type: datatypes.DECIMAL(12,2)},
            qramounts: {type: datatypes.BIGINT},
            content: {type: datatypes.TEXT},
            customertype: {type: datatypes.STRING(50)},
            shortname: {type: datatypes.STRING(50)},
            progress:{type:datatypes.DECIMAL(12,2)},
            qrid:{type:datatypes.STRING(50)},
            templatename:{type:datatypes.STRING(50)},
            gen: {type: datatypes.BOOLEAN,defaultValue:0},
                georequired:{type:datatypes.BOOLEAN,defaultValue:0},
                checktel:{type:datatypes.BOOLEAN,defaultValue:0},
                times:{type:datatypes.INTEGER,defaultValue:0}
        },
        {
            timestamps: false
        })
};

