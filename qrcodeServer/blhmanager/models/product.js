/**
 * Created by tao on 2017/7/19.
 */
module.exports=function(sequelize,datatypes){
    return sequelize.define('blh_products', {
            itemId:{type:datatypes.INTEGER,primaryKey: true},
            category_id:{type:datatypes.INTEGER},
            category_name:{type:datatypes.STRING(1000)},
            product_name:{type:datatypes.STRING(1000)},
            settlement:{type:datatypes.FLOAT},
            market_price:{type:datatypes.FLOAT},
            product_images:{type:datatypes.TEXT},
            product_img:{type:datatypes.TEXT},
            product_infos:{type:datatypes.TEXT},
            update_time:{type:datatypes.INTEGER},
            state:{type:datatypes.INTEGER,defaultValue:0}
        },
        {
            timestamps: false
        })
}