/**
 * Created by tao on 2017/7/19.
 */
var config = require('../../config');
var logger = require('../common/logger');
var returndata = require('../common/returnData');
var db = require('../common/db');


function list(req,res) {
    logger.info(config.systemUser, "获取百利汇商品分类");
    var page=1,size=10;
    if(req.body.page) page=req.body.page;
    if(req.body.size) size = req.body.size;
    var result = {};
    var sql = 'select distinct category_id,category_name from blh_products order by convert(category_name USING gbk) COLLATE gbk_chinese_ci ';
    sql+=' limit ' + (page-1) + ','+size;
    //计算总行数
    db.sequelize.query('select count(distinct category_id) as count from blh_products',{type: db.sequelize.QueryTypes.SELECT}).then(function (data) {
        db.sequelize.query(sql,{ type: db.sequelize.QueryTypes.SELECT}).then(function (results) {
            result.totalpage = db.totalpage(data[0].count, size);
            result.page = page;
            result.size = size;
            result.totalsize = data[0].count;
            result.data=results;
            return res.json(returndata.createData(result));
        });
    });
};

exports.list = list;