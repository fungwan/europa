/**
 * Created by shane on 2015/12/4.
 */
var logger = require('../../common/logger')
function  initrelations(sequelize,models){
    //models.sysuser.belongsTo( models.sysenterprise);
    //models.sysenterprise.hasMany(models.sysuser);
    //models.mallproduct.belongsTo(models.mallcategory);
    //models.mallcategory.hasMany(models.mallproduct, { as: 'product'});
    models.shopingcart.belongsTo(models.mallproduct,{foreignKey: 'productid'});
    models.ctg2project.belongsTo(models.mcdcategory,{foreignKey: 'categoryid'});
    models.mallorder.belongsTo(models.customer,{foreignKey: 'custid'});
    models.producteval.belongsTo(models.mallorder,{foreignKey: 'orderid'});
    models.producteval.belongsTo(models.mallproduct,{foreignKey: 'productid'});
    models.qoupon_content.belongsTo(models.mallproduct,{foreignKey: 'productid'});
    models.favorites.belongsTo(models.mallproduct,{foreignKey: 'productid'});
    models.cashcoupon.belongsTo(models.mallproduct,{foreignKey: 'productid'});

    // 分享关系
    models.project.hasOne(models.projectshareconfig, { foreignKey: 'project_id' });
    models.projectshareconfig.belongsTo(models.project, { foreignKey: 'project_id' });

    models.projectshareconfig.hasMany(models.sharerecord, { foreignKey: 'config_id' });
    models.sharerecord.belongsTo(models.projectshareconfig, { foreignKey: 'config_id' });

    models.sharerecord.hasMany(models.sharehelprecord, { foreignKey: 'share_record_id' });
    models.sharehelprecord.belongsTo(models.sharerecord, { foreignKey: 'share_record_id' });

    sequelize.sync();
}
exports.initrelations=initrelations;

