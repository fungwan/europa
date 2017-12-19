/**
 * Created by tao on 2017/7/19.
 */
var config = require('../../config');
var logger = require('../common/logger');
var returndata = require('../common/returnData');
var db = require('../common/db');
var Q = require('q');



function list(req,res) {
    //处理过滤条件：商品分类、商品名称模糊查询、价格区间
    //var condition = JSON.parse({} || req.body.condition);
    logger.info(config.systemUser, "查询条件:" + JSON.stringify(req.body));
    logger.info(config.systemUser, "开始获取百利汇商品");
    var recDb = db.models.product;
    var page=1,size=10,filter={};
    if(req.body.page) page=parseInt(req.body.page);
    if(req.body.size) size = parseInt(req.body.size);
    if(req.body.filter) filter=JSON.parse(req.body.filter);
    //默认获取上架的商品
    filter.state=0;
    recDb.findAndCountAll({
        where:filter,
        offset: recDb.pageOffset(page, size),
        limit: size
    }).then(function (data) {
        logger.info(config.systemUser, "获取百利汇商品完成");
        if (data) {
            var result = {};
            count = data.count;
            result.data = data.rows;
            result.totalpage = db.totalpage(count, size);
            result.page = page;
            result.size = size;
            result.totalsize = count;
            return res.json(returndata.createData(result));
        } else {
            return res.json(returndata.createError(returnData.errorType.notexist));
        }
    });
};


/**
 * 批量插入数据,先执行删除
 * @param list
 */
function batch(list) {
    var defer = Q.defer();
    var recDb = db.models.product;
    var items=[];
    for(var i=0;i<list.length;i++){
        items.push(list[i].itemId);
    }
    try {
        db.sequelize.transaction(function (tran) {
            function del() {
                var deferred = Q.defer();
                recDb.destroy({where:{itemId:{in:items}},transaction:tran}).then(function () {
                    deferred.resolve(true);
                }).catch(function(err){
                    logger.error(config.systemUser, "删除数据发生错误：" + err);
                    deferred.reject(err);
                });
                return deferred.promise;
            };
            function insert() {
                var deferred = Q.defer();
                recDb.bulkCreate(list,{transaction:tran}).then(function () {
                    deferred.resolve(list);
                }).catch(function (err) {
                    logger.error(config.systemUser, "写入数据库发生错误：" + err);
                    deferred.reject(err);
                });
                return deferred.promise;
            };
            return del().then(insert);
        }).then(function (result) {
            defer.resolve(true);
        }).catch(function (err) {
            defer.reject(err);
        });

    }catch (err){
        defer.reject(err);
    }
    return defer.promise;
}
/**
 * 更新状态，上架/下架
 */
function updateState(list,state) {
    var defer = Q.defer();
    var recDb= db.models.product;
    var items=[];
    for(var i=0;i<list.length;i++){
        items.push(list[i].itemId);
    }
    recDb.update({state:state},{where:{itemId:{in:items}}}).then(function (rows) {
        logger.info(config.systemUser," 下架百礼汇商品成功，更新数据库，共"+rows +"条");
        defer.resolve(rows);
    }).catch(function (err) {
        logger.error(config.systemUser," 下架百礼汇商品失败:"+ err);
        defer.reject(err);
    });
    return defer.promise;
}

exports.batch=batch;
exports.updateState=updateState;
exports.list = list;