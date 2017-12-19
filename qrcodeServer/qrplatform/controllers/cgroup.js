/**
 * Created by ivan on 15/11/30.
 */
//加载第三方库
var eventproxy = require('eventproxy');
var sequelize = require('sequelize');
var uuid = require('node-uuid');

//加载自定义库
var returnData = require('../common/returnData');
var db = require('../common/db');
var vo = require('../models/vomodels');
var logger = require('../common/logger');
var config = require('../../config');
var tool = require('../common/tool');
uuid = require('node-uuid')

/**
 * 获取分组列表
 * @param arg
 * @param cb
 */
exports.list = function (arg, cb) {
    //获取参数
    var page = parseInt(arg.page) || 1;
    var size = parseInt(arg.size) || 10;
    var query = tool.isEmptyObject(arg.query) ? '' : arg.query;
    var entid = !!arg.currentuser ? arg.currentuser.entid : null;
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;
    var queryobj = {};
    var cgrpdb = db.models.custgroup;
    var ep = new eventproxy();
    var count = 0;

    //参数校验
    if (!!query && !tool.verifier.isEmptyString(query)) {
        try {
            queryobj = JSON.parse(query)
        } catch (error) {
            logger.error(arg.currentuser.useraccount, "解析参数query出错：" + query);
            cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
            return;
        }
    }
    if (tool.isEmptyObject(queryobj)) {
        logger.error(arg.currentuser.useraccount, "调用/cusomer/list接口时未提供queryobj参数");
    }
    queryobj.entid = entid;
    if (queryobj.groupname) {
        queryobj.groupname = { $like: '%' + queryobj.groupname + '%' };
    }
    //获取分组列表及其总数
    cgrpdb.findAndCountAll({
        where: queryobj,
        offset: cgrpdb.pageOffset(page, size),
        limit: size,
        order: 'convert(groupname using gbk) asc'
    })
        .then(
        function (data) {
            logger.info(useraccount, "获取分组列表成功");
            ep.emit("grouplist", data);
        },
        function (error) {
            logger.error(useraccount, error.message);
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        }
        );

    //组装分组列表信息，返回给前端
    ep.on("grouplist", function (data) {
        if (!data || tool.isEmptyObject(data)) {
            //未找到对象
            logger.error(useraccount, "调用/cgroup/list接口时，分组列表不存在");
            cb(returnData.createError(returnData.errorType.notexist, "获取分组列表不存在"));
        }
        else {
            var result = {};
            count = data.count;
            result.data = data.rows;
            result.total = count,
                result.totalpage = totalpage(count, size);
            result.page = page;
            result.size = size;
            cb(null, returnData.createData(result));
            logger.info(useraccount, "获取分组列表成功");
        }
    })

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/cgroup/list错误", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });
}

/**
 * 分组查询并返回
 * @param arg
 * @param cb
 */
exports.query = function (arg, cb) {
    //获取参数
    var page = parseInt(arg.page) || 1, size = parseInt(arg.size) || 10;
    var groupname = arg.nickname;
    var query = arg.query, queryobj = null;
    var entid = !!arg.currentuser ? arg.currentuser.entid : null;
    var useraccount = !!arg.curretuser ? arg.currentuser.useraccount : null;
    var ep = new eventproxy();
    var groupdb = db.models.custgroup;

    //参数校验
    if (!!query && !tool.verifier.isEmptyString(query)) {
        try {
            queryobj = JSON.parse(query)
        } catch (error) {
            logger.error(arg.currentuser.useraccount, "解析参数query出错：" + query);
            cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
            return;
        }
    }
    if (tool.isEmptyObject(queryobj)) {
        logger.error(arg.currentuser.useraccount, "调用/cusomer/list接口时未提供queryobj参数");
    }

    //查询数据库
    groupdb.findAndCountAll(
        {
            where: {
                groupname: { $like: "%" + groupname + "%" },
                grouptype: queryobj.grouptype,
                entid: entid
            },
            offset: groupdb.pageOffset(page, size),
            limit: size,
            order: 'convert(groupname using gbk) asc'
        }
    ).then(
        function (result) {
            logger.info(useraccount, "查询分组" + groupname + "成功");
            ep.emit("querysuccess", result);
        },
        function (error) {
            logger.error(useraccount, "查询分组" + groupname + "失败");
            error.code = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        }
        );

    /**
     * 触发querysuccess事件，并返回数据给前端
     */
    ep.on("querysuccess", function (data) {
        if (!data.rows || data.rows.length == 0) {
            logger.error(useraccount, "查询数据为空，没有该分组。");
            cb(returnData.createError(returnData.errorType.notexist, "该分组不存在，请重试。"));
        }
        else {
            var result = {}, count = data.count;
            result.data = data.rows;
            result.totalpage = totalpage(count, size);
            result.page = page;
            result.size = size;
            cb(null, returnData.createData(result));
            logger.info(useraccount, "查询分组返回成功。")
        }
    });

    /**
     * 错误处理
     */
    ep.on("error", function (error) {
        logger.error(useraccount, "调用/cgroup/query接口错误", error);
        cb(returnData.createError(error.code, "数据库错误"));
    });


}

/**
 * 更新或添加分组
 * @param arg
 * @param cb
 */
exports.update = function (arg, cb) {

    //获取参数
    var groupinput = arg.group;
    var ep = new eventproxy();
    var groupdb = db.models.custgroup, cutomerdb = db.models.customer;
    var entid = !!arg.currentuser ? arg.currentuser.entid : null;
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;
    var group = {}, tran = null;

    //参数校验
    if (!!groupinput) {
        try {
            group = JSON.parse(groupinput);
            if (group.groupname.length > 20) {
                logger.error(useraccount, "分组名称长度超过限制，最大长度为20个字符。");
                cb(returnData.createError(returnData.errorType.paraerror, "分组名称长度超过限制，最大长度为20个字符。"));
            }
            if (group.groupdesc.length > 50) {
                logger.error(useraccount, "分组描述长度超过限制，最大长度为50个字符。");
                cb(returnData.createError(returnData.errorType.paraerror, "分组描述长度超过限制，最大长度为50个字符。"));
            }
        } catch (error) {
            logger.error(arg.currentuser.useraccount, "解析参数groupinput出错：" + groupinput);
            cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
            return;
        }
    }

    /**
     * 添加分组
     */
    ep.on("addGroup", function (group) {
        var groupid = uuid.v4();
        groupdb.create({
            groupid: groupid,
            entid: entid,
            groupname: group.groupname,
            parentid: "0",
            isdisabled: "0",
            groupdesc: group.groupdesc,
            grouptype: group.grouptype
        }).then(function (result) {
            logger.info(useraccount, "添加分组" + group.groupname + "成功");
            result.isdisabled = false;
            cb(null, returnData.createData(result));
        }, function (error) {
            logger.error(useraccount, "添加分组" + group.groupname + "失败");
            error.code = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        }).catch(function (error) {
            logger.error(useraccount, "添加分组" + group.groupname + "失败");
            error.code = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });
    });


    /**
     *更新分组
     */
    ep.on("updateGroup", function (group) {
        groupdb.findOne({ where: { groupid: group.groupid, entid: entid } }).then(
            //查找成功
            function (result) {
                if (!result || tool.isEmptyObject(result)) {
                    //未找到对象,此时为添加分组
                    logger.error(useraccount, "没有找到更新的分组。");
                    cb(returnData.createError(returnData.errorType.notexist, "分组不存在"));
                }
                else {
                    logger.info(useraccount, "开始更新分组" + result.groupname);
                    db.sequelize.transaction({
                        autocommit: true
                    }).then(function (t) {
                        tran = t;
                        groupdb.update(
                            {
                                groupname: group.groupname,
                                groupdesc: group.groupdesc
                            },
                            { where: { groupid: group.groupid } },
                            { transaction: tran }
                        ).then(function (result) {
                            logger.info(useraccount, "更新分组" + result.groupname + "完成,开始更新customer表中数据。");
                            ep.emit("updateCustomerGroup", group);
                            /* cb(null, returnData.createData(result));
                             logger.info(useraccount, "更新分组" + result.groupname + "完成");*/
                        }).catch(function (error) {
                            tran.rollback();
                            logger.error(useraccount, "更新分组" + result.groupname + "失败");
                            error.errortype = returnData.errorType.dataBaseError.unknow;
                            ep.emit("error", error);
                        })
                    });
                }
            },
            //查找失败
            function (error) {
                logger.error(useraccount, group.groupid + "数据库custgroup表查找失败:");
                error.errortype = returnData.errorType.dataBaseError.unknow;
                ep.emit("error", error);
            }
        );
    });

    /**
     *更新customer表中group信息
     */
    ep.on("updateCustomerGroup", function (group) {
        cutomerdb.update(
            { groupname: group.groupname },
            { where: { groupid: group.groupid } },
            { transaction: tran }
        ).then(function (result) {
            logger.info(useraccount, "更新customer表中group数据成功.");
            tran.commit();
            cb(null, returnData.createData(group));
        }).catch(function (error) {
            tran.rollback();
            logger.error(useraccount, "更新分组" + group.groupname + "失败.原因：更新customer表中group数据失败。");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });
    });
    /**
     * 错误处理
     */
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/cgroup/update错误", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });

    if (group.groupid == "") {
        //检查有无重复分组名
        groupdb.findOne({ where: { entid: arg.currentuser.entid, groupname: group.groupname } }).then(function (res) {
            if (res) {
                logger.error(useraccount, "接口/cgroup/update错误", '重复的客户分组名');
                cb(returnData.createError(returnData.errorType.exists, "重复的客户分组名"));
            } else {
                logger.info(useraccount, "开始添加分组" + group.groupname);
                ep.emit("addGroup", group);
            }
        });
    }
    else {
        logger.info(useraccount, "开始更新分组" + group.groupname);
        ep.emit("updateGroup", group);
    }


}


exports.deletegr = function (arg, cb) {
    //获取参数
    var listid = JSON.parse(arg.listid);
    var list = listid.list;
    var ep = new eventproxy();
    var groupvo = vo.custgroup.createnew();
    var groupdb = db.models.custgroup, customerdb = db.models.customer;
    var entid = !!arg.currentuser ? arg.currentuser.entid : null;
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;
    var tran = null;

    //参数校验
    if (!list) {
        //custid为空
        logger.error(useraccount, "调用/cgroup/delete接口时，参数listid中list为空");
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }
    if (list.length == 1 && list[0] == "") {
        cb(null, returnData.createData({ success: true }));
    }

    ep.on("deleteGroupMap", function (list) {

        var groupmapdb = db.models.custgroupmap;
        groupmapdb.destroy(
            {
                where: { groupid: { $in: list } },
            },
            { transaction: tran }
        ).then(
            //删除成功
            function (result) {
                logger.info(useraccount, "分组删除成功,开始更新customer表数据");
                ep.emit("deleteGroupFromCustomer", list);
            }
            ).catch(function (error) {
                //删除失败
                tran.rollback();
                logger.error(useraccount, "groupmap分组删除失败");
                error.errortype = returnData.errorType.dataBaseError.unknow;
                ep.emit("error", error);
            });
    })

    ep.on("deleteGroupFromCustomer", function (list) {
        customerdb.update(
            {
                groupid: '',
                groupname: '未分组'
            },
            { where: { groupid: { $in: list } } },
            { transaction: tran }
        ).then(function (result) {
            cb(null, returnData.createData({ success: true }));
            logger.info(useraccount, "删除分组后，客户和经销商关联的分组更新为'未分组'完成");
            tran.commit();
        }).catch(function (error) {
            logger.error(useraccount, "删除分组时，更新客户和经销商的分组为'未分组'失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
            tran.rollback();
        })
    });

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/cgroup/deletegr错误", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });

    groupdb.findAll({ where: { groupid: { $in: list } } }).then(
        function (result) {
            if (!result || tool.isEmptyObject(result)) {
                //未找到对象
                logger.error(useraccount, "调用/customer/delete接口时，gorupid在数据库中未找到");
                cb(returnData.createError(returnData.errorType.notexist, "分组信息不存在，删除失败。"));
            }
            else {
                db.sequelize.transaction({
                    autocommit: true
                }).then(function (t) {
                    tran = t;
                    groupdb.destroy(
                        {
                            where: { groupid: { $in: list } },
                        },
                        { transaction: tran }
                    ).then(
                        //删除成功
                        function (result) {
                            logger.info(useraccount, "分组删除成功,开始更新customermap表数据");
                            ep.emit("deleteGroupMap", list);
                           
                        }
                        ).catch(function (error) {
                            //删除失败
                            tran.rollback();
                            logger.error(useraccount, "分组删除失败");
                            error.errortype = returnData.errorType.dataBaseError.unknow;
                            ep.emit("error", error);
                        });
                })
            }
        },
        function (error) {
            logger.error(useraccount, "分组删除失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        }
    );
}

var totalpage = function (total, size) {
    var page = 0;
    var num = Number(total) / Number(size);
    if (parseInt(num) == num)
        page = num;
    else
        page = Math.floor(num) + 1;
    return page;
}