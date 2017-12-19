/**
 * Created by ivan on 15/11/30.
 */
//加载第三方库
var uuid = require('node-uuid');
var eventproxy = require('eventproxy');
var sequelize = require('sequelize');
var Q = require('q');
var multiline = require('multiline');
//加载自定义库
var returnData = require('../common/returnData');
var db = require('../common/db');
var vo = require('../models/vomodels');
var logger = require('../common/logger');
var config = require('../../config');
var tool = require('../common/tool');
var sms = require('../common/smsmanage');


/**
 * 获取经销商或消费者列表
 * @param arg
 * @param cb
 */
exports.list = function (arg, cb) {

    //select custid,nickname,case sex when 1 then '男' when 2 then '女' else '未知' end as sex,address, phone, groupname from customer where entid="#entid#" and custtype=#custtype# and areacode like "#areacode#%" and nickname like "%#nickname#%" #groupid#

    //列表查询语句
    var sqlquery = multiline(function () {/*
     select temp.*,ifnull((l.con),0) as countlottery, IFNULL(sum(p.point),0) as totalpoint, IFNULL(sum(l.price),0) as totallottery from
     (SELECT a.custid,nickname,case sex when 1 then '男' when 2 then '女' else '未知' end as sex,concat(country,'/',province,'/',city) as address, phone, b.groupname FROM customer as a 
     left JOIN (SELECT custid ,groupname FROM custgroupmap LEFT JOIN custgroup ON custgroupmap.groupid = custgroup.groupid WHERE custgroupmap.entid = '#entid#' ) as b ON a.custid = b.custid where custtype=#custtype# and areacode like '#areacode#%' and nickname like '%#nickname#%' #groupid#) as temp
     left join (select custid,point from custextend) as p on (temp.custid=p.custid)
     left join (select custid,count(1) as con,sum(price*amount) as price from prolotteryrecord where mallproducttype != 'thanks' GROUP BY custid) as l on (temp.custid=l.custid)
     group by temp.custid,l.con
     having countlottery BETWEEN #totalnum_min# and #totalnum_max# and totalpoint BETWEEN #totalpoint_min# and #totalpoint_max#
     order by #order#
     limit #offset#,#limit#;
     */
    });
    //总数查询语句where entid = '#entid#
    var totalquery = multiline(function () {/*
     select count(1) as total from
     (select temp.custid,ifnull((l.con),0) as countlottery, IFNULL(sum(p.point),0) as totalpoint, IFNULL(sum(l.price),0) as totallottery from
     (SELECT a.custid,nickname,case sex when 1 then '男' when 2 then '女' else '未知' end as sex,address, phone, b.groupname FROM customer as a 
     left JOIN (SELECT custid ,groupname FROM custgroupmap LEFT JOIN custgroup ON custgroupmap.groupid = custgroup.groupid WHERE custgroupmap.entid = '#entid#' ) as b ON a.custid = b.custid where custtype=#custtype# and areacode like '#areacode#%' and nickname like '%#nickname#%' #groupid#) as temp
     left join (select custid,point from custextend) as p on (temp.custid=p.custid)
     left join (select custid,count(1) as con,sum(price*amount) as price from prolotteryrecord where mallproducttype != 'thanks' GROUP BY custid) as l on (temp.custid=l.custid)
     group by temp.custid,l.con
     having countlottery BETWEEN #totalnum_min# and #totalnum_max# and totalpoint BETWEEN #totalpoint_min# and #totalpoint_max#) as result
     */
    });
    //常量
    var MAXVALUE = 999999999;

    //获取参数
    var query = tool.isEmptyObject(arg.query) ? '' : arg.query;
    var entid = arg.currentuser.entid;
    var queryobj = {};
    var ep = new eventproxy();
    /*var orderby = arg.orderby||'nickname'; //BUG#482
     var order = arg.order||'asc';*/
    var sortList;
    try {
        sortList = JSON.parse(arg.sort || "[]");
    } catch (e) {
        sortList = [];
    }

    //query参数处理
    if (!!query && !tool.verifier.isEmptyString(query)) {
        try {
            queryobj = JSON.parse(query)
            for (var obj in queryobj) {
                if (queryobj[obj] === "" || queryobj[obj] === null || queryobj[obj] === undefined) {
                    delete queryobj[obj];
                }
            }
        } catch (error) {
            logger.error(arg.currentuser.useraccount, "解析参数query出错：" + query);
            cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
            return;
        }
    }

    //queryobj参数检查
    if (tool.isEmptyObject(queryobj)) {
        logger.error(arg.currentuser.useraccount, "调用/cusomer/list接口时query参数错误：" + query);
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
    }

    //queryobj高级查询参数处理
    var minlist = ["minlotterytime", "minpoint"];
    var maxlist = ["maxlotterytime", "maxpoint"];
    for (var item in minlist) {
        var minitem = queryobj[minlist[item]] || null;
        if (!minitem) queryobj[minlist[item]] = 0;
    }
    for (var item in maxlist) {
        var maxitem = queryobj[maxlist[item]];
        if (maxitem === 0 || maxitem === '0') {
            maxitem = 0;
        } else {
            maxitem = maxitem || null;
        }
        if (!maxitem && maxitem !== 0) queryobj[maxlist[item]] = MAXVALUE;
    }

    //order项处理 BUG#482中文排序处理
    var order = "", orderSplit = "";

    if (sortList.length > 0) {
        for (var inx in sortList) {
            var sort = sortList[inx], n = sort.field;
            if ("nickname,address,groupname".indexOf(n) >= 0)
                n = 'convert(temp.' + n + ' using gbk)';

            order += orderSplit + " " + n + " " + sort.type + " ";
            orderSplit = ",";
        }
    } else {
        order = " convert(temp.nickname using gbk) asc ";
    }

    /*if(orderby=='nickname'||orderby=='address'||orderby=='groupname'){
     orderby = 'convert(temp.'+orderby+' using gbk)';
     }
     order = orderby+' '+order;*/

    //Bug#542，对'中国'进行处理
    queryobj.areacode = queryobj.areacode || '';
    if (queryobj.areacode == '0') queryobj.areacode = '';

    var groupid = !!queryobj.groupid ? 'and groupid=\'' + queryobj.groupid + '\'' : '';


    //变量替换函数
    function _replacequery(str) {
        return str.replace(/#entid#/g, entid)
            .replace('#custtype#', queryobj.custtype || '')
            .replace('#areacode#', queryobj.areacode || '')
            .replace('#nickname#', queryobj.nickname || '')
            .replace('#groupid#', groupid)
            .replace('#totalnum_min#', queryobj.minlotterytime)
            .replace('#totalnum_max#', queryobj.maxlotterytime)
            .replace('#totalpoint_min#', queryobj.minpoint)
            .replace('#totalpoint_max#', queryobj.maxpoint)
            .replace('#offset#', db.models.customer.pageOffset(arg.page, arg.size || 0) || 0)
            .replace('#order#', order) //BUG#482
            .replace('#limit#', arg.size || 10);
    }

    origquery = _replacequery(sqlquery);
    countquery = _replacequery(totalquery);

    //出错函数
    function _fail(err) {
        logger.error(arg.currentuser.useraccount, "/cusomer/list接口出错", err);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow), "数据库错误");
    }

    function _combine(total, list) {
        var data = {};
        data.page = arg.page || 1;
        data.size = arg.size || 10;
        data.total = total[0].total,
            data.totalpage = totalpage(total[0].total, data.size);
        data.data = list;
        cb(null, returnData.createData(data));
    }

    //注册最后处理事件
    ep.all('total', 'list', _combine);

    db.sequelize.query(countquery).spread(function (result, metadata) {
        logger.info(config.systemUser, JSON.stringify(result));
        logger.info(config.systemUser, JSON.stringify(metadata));
        ep.emit('total', result);
    }, _fail);

    db.sequelize.query(origquery).spread(function (result, metadata) {
        logger.info(config.systemUser, JSON.stringify(result));
        logger.info(config.systemUser, JSON.stringify(metadata));
        ep.emit('list', result);
    }, _fail);
};
/**
 * 获取特定经销商信息
 * @param arg
 * @param cb
 */
exports.get = function (arg, cb) {
    var custdb = db.models.customer;
    var custid = arg.custid.trim();
    var ep = new eventproxy();
    var entid = !!arg.currentuser ? arg.currentuser.entid : null;
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;

    //参数检查
    if (!custid) {
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }
    //组装查询对象
    var queryobj = {
        entid: entid,
        custid: custid
    };
    //查找记录
    custdb.findOne({
        where: queryobj
    }).then(
        //查找成功函数
        function (result) {
            logger.info(useraccount, "customer查找成功");
            ep.emit("get", result);
        },
        //查找失败函数
        function (error) {
            logger.error(useraccount, "customer查找失败");
            ep.emit("error", error);
        }
        )
        //错误捕捉
        .catch(function (error) {
            logger.error(useraccount, "数据库操作失败");
            ep.emit("error", error);
        });

    ep.on("get", function (result) {
        if (!result || tool.isEmptyObject(result)) {
            //未找到对象
            logger.error(useraccount, "调用/customer/get接口时，该记录不存在");
            cb(returnData.createError(returnData.errorType.notexist, "该用户不存在"));
        }
        else {
            cb(null, returnData.createData(result));
            logger.info(useraccount, "获取用户详细信息成功");
        }
    })

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口customer/get错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    })

};

exports.update = function (arg, cb) {
    //获取参数
    var custinput = arg.customer;
    var ep = new eventproxy();
    var custvo = vo.customer.createnew();
    var custdb = db.models.customer;
    var customer = {};
    var entid = !!arg.currentuser ? arg.currentuser.entid : null;
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;

    //参数检查
    if (!!custinput && !tool.verifier.isEmptyString(custinput)) {
        try {
            customer = JSON.parse(custinput)
        } catch (error) {
            logger.error(arg.currentuser.useraccount, "解析参数customer出错：" + custinput);
            cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
            return;
        }
    }
    if (customer.phone != null && customer.phone != "" && customer.phone != undefined) {
        if (!tool.verifier.isMobile(customer.phone) && !tool.verifier.isPhone(customer.phone)) {
            logger.error(useraccount, "调用/customer/update接口时，参数phone不满足格式")
            cb(returnData.createError(returnData.errorType.paraerror, "更新失败！电话不满足格式要求。如为固定电话,需要'-'连接"));
            return;
        }
    }
    /*    if (customer.address.trim().length == 0) {
     logger.error(useraccount, "调用/customer/update接口时，参数address为空")
     cb(returnData.createError(returnData.errorType.paraerror, "更新失败！地址为空。"));
     return;
     }*/
    if (customer.address.length > 50) {
        logger.error(useraccount, "调用/customer/update接口时，参数address超出字符限制")
        cb(returnData.createError(returnData.errorType.paraerror, "更新失败！地址最大长度为50字符。"));
        return;
    }

    if (!customer.custid) {
        //custid为空
        logger.error(useraccount, "调用/customer/update接口时，参数customer中custid为空");
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }

    //获取数据库中customer实体
    custdb.findOne({
        where: { custid: customer.custid, entid: entid }
    }).then(
        //查找成功
        function (result) {
            logger.info(useraccount, customer.custid + "数据库查找成功");
            ep.emit("findone", result);
        },
        //查找失败
        function (error) {
            logger.error(useraccount, customer.custid + "数据库customer表查找失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        }
        ).catch(function (error) {
            logger.error(useraccount, customer.custid + "数据库customer表查找失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });

    //更新customer实体并保存
    ep.on("findone", function (result) {
        if (!result || tool.isEmptyObject(result)) {
            //未找到对象
            logger.error(useraccount, "调用/customer/update接口时，custid:" + customer.custid + "在数据库中未找到");
            cb(returnData.createError(returnData.errorType.notexist, "客户信息未找到"));
        }
        else {
            result.address = customer.address;
            result.phone = customer.phone;
            //TODO: 更新country, province, city
            result.save();
            cb(null, returnData.createData(result));
            logger.info(useraccount, "客户信息更新成功");
        }
    });

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/customer/update错误", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });
};

exports.group = function (arg, cb) {
    var detail = JSON.parse(arg.detail);
    //获取参数
    var idlist = detail.idlist;
    var groupid = detail.groupid;
    var groupname = detail.groupname;
    var custdb = db.models.customer, groupdb = db.models.custgroup;
    var custgroupmapdb = db.models.custgroupmap;
    var ep = new eventproxy();
    var entid = !!arg.currentuser ? arg.currentuser.entid : null;
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;

    //参数检查
    //检查idlist
    var t = typeof (idlist);
    if (!idlist || !tool.verifier.isArray(idlist) || idlist.length == 0) {
        logger.error(useraccount, "接口/customer/group参数idlist错误：" + idlist);
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }
    //检查groupid与groupname
    if (!groupid || !groupname || tool.verifier.isEmptyString(groupid) || tool.verifier.isEmptyString(groupname)) {
        logger.error(useraccount, "接口/customer/group参数groupid groupname错误：" + groupid + groupname);
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }
    //TODO:需要检查groupid对应的记录在cgroup表中是否存在并且状态为非删除

    groupdb.findOne({
        where: { groupid: groupid, groupname: groupname }
    }).then(
        function (data) {
            if (!data || tool.isEmptyObject(data)) {
                //未找到对象
                logger.error(useraccount, "调用/customer/group接口时，验证分组信息时，分组信息错误");
                cb(returnData.createError(returnData.errorType.notexist, "参数验证失败"));
            }
            else {
                logger.info(useraccount, "验证参数groupid、groupname成功");
                var fields = {
                    groupid: groupid,
                    groupname: groupname
                }
                //设置update
                for (var id = 0; id < idlist.length; ++id) {

                    var custid = idlist[id];


                    (function (custid) {

                        console.log(custid);
                        custgroupmapdb.upsert({
                            id: uuid.v4(),
                            groupid: groupid,
                            custid: custid,//{ $in: idlist },
                            entid: entid
                        }).then(function (data) {


                            logger.info(useraccount, "客户信息更新成功");

                        }).catch(function (err) {

                            logger.info(useraccount, "更新客户组别数据库异常");

                        });

                    })(custid)

                }

                cb(null, returnData.createData({ success: true }));
                /*custdb.update(fields, { where: { custid: { $in: idlist } } }).then(
                    function (result) {
                        if (result[0] != idlist.length) ep.emit("error", new Error("/customer/group接口更新数据库错误"));
                        else {
                            logger.info(useraccount, "/customer/group接口更新数据库成功");
                            //更新mapgroup

                        }
                    },
                    function (error) {
                        logger.error(useraccount, "/customer/group接口更新数据库错误");
                        error.errortype = returnData.errorType.dataBaseError.unknow;
                        emit("error", error);

                    }
                );*/
            }
        }, function (error) {
            logger.error(useraccount, "验证分组名和分组id信息错误");
            cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "参数验证失败"));
        });


    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "/customer/group接口错误", error);
        cb(returnData.createError(error.errortype, "参数校验失败"));
    });
};

var totalpage = function (total, size) {
    var page = 0;
    var num = Number(total) / Number(size);
    if (parseInt(num) == num)
        page = num;
    else
        page = Math.floor(num) + 1;
    return page;
};

exports.getbyentanduid = function (arg, cb) {
    var entid = arg.entid;
    var unionid = arg.unionid;
    var custtype = arg.custtype;
    var custdb = db.models.customer;
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;
    var ep = new eventproxy();


    //检查参数和当前用户状态
    if (!entid) {
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }
    if (!unionid) {
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }

    //组装查询对象
    var queryobj = {
        //entid: entid,
        unionid: unionid,
        custtype: custtype
    };
    //查找记录
    custdb.findOne({
        where: queryobj
    }).then(
        //查找成功函数
        function (result) {
            logger.info(useraccount, "customer查找成功" + JSON.stringify(result));
            cb(null, returnData.createData(result));
        },
        //查找失败函数
        function (error) {
            logger.error(useraccount, "customer查找失败");
            ep.emit("error", error);
        }
        )
        //错误捕捉
        .catch(function (error) {
            logger.error(useraccount, "数据库操作失败");
            ep.emit("error", error);
        });

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "捕捉到错误：" + JSON.stringify(error));
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    })

};

/**
 * 新建客户,该方法不能被路由直接使用
 * @param member
 * @param cb
 */
exports.new = function (cust, cb) {
    var ep = new eventproxy();
    var custdb = db.models.customer;
    custdb.create(cust).then(function (task) {
        cb(null, cust);
    }).catch(function (error) {
        logger.error(cust.nickname, cust.nickname + "新建失败");
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    });
    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "/customer/new接口错误捕捉成功");
        cb(returnData.createError(returnData.errorType.unknow, error.message));
    });
}


exports.test = function (arg, cb) {
    var lotterydb = db.models.prolotteryrecord, pointdb = db.models.propointrecord;
    /* lotterydb.findAndCountAll({
     include: [
     sequelize.
     {model: pointdb, where: {custid: true}, required: true}
     ],
     offset: db.limit * (req.params.pageid - 1),
     limit: db.limit,
     order: [[db.sequelize.fn('datetime', db.sequelize.col('Tasks.endedAt')), 'DESC']]
     })*/

    db.sequelize.query("SELECT p.custid,p.totalpoint,l.totallottery,l.countlottery  from (select custid, SUM(point) as totalpoint from propointrecord GROUP BY custid) as p" +
        " INNER JOIN (SELECT custid , SUM(price) as totallottery,COUNT(custid) as countlottery FROM prolotteryrecord GROUP BY custid) as l ON p.custid=l.custid GROUP BY custid").spread(function (results, metadata) {
            logger.info("testUser:", "测试成功");
            cb(null, returnData.createData(results));
        })
};

//获取用户摘要信息
exports.getSummary = function (arg, cb) {
    var custdb = db.models.customer;
    var custid = '';
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    var ep = new eventproxy();
    //参数检查
    if (!custid) {
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }

    //组装查询对象
    var queryobj = {
        custid: custid
    };

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口customer/get错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });


    ep.on("getpoint", function (custinfo) {
        var pointdb = db.models.custextend;
        pointdb.findOne({
            where: queryobj
        }).then(
            //查找成功函数
            function (result) {
                logger.info(useraccount, "custextend查找成功");
                if (result)
                    custinfo.dataValues.point = result.point;
                else
                    custinfo.dataValues.point = 4;
                cb(null, returnData.createData(custinfo));
            },
            //查找失败函数
            function (error) {
                logger.error(useraccount, "custextend查找失败");
                ep.emit("error", error);
            }
            )
            //错误捕捉
            .catch(function (error) {
                logger.error(useraccount, "数据库操作失败");
                ep.emit("error", error);
            });

    });

    ep.on("getnewinfo", function (custinfo) {
        var newinfodb = db.models.custnewinfo;
        newinfodb.findOne({
            where: queryobj
        }).then(
            //查找成功函数
            function (result) {
                logger.info(useraccount, "custnewinfo查找成功");
                if (result)
                    custinfo.dataValues.newinfo = result.dataValues;
                else
                    custinfo.dataValues.newinfo = null;
                ep.emit("getpoint", custinfo);
            },
            //查找失败函数
            function (error) {
                logger.error(useraccount, "custnewinfo查找失败");
                ep.emit("error", error);
            }
            )
            //错误捕捉
            .catch(function (error) {
                logger.error(useraccount, "数据库操作失败");
                ep.emit("error", error);
            });

    });


    //
    ep.on("get", function (result) {
        if (!result || tool.isEmptyObject(result)) {
            //未找到对象
            logger.error(useraccount, "调用/customer/getSummary接口时，该记录不存在");
            cb(returnData.createError(returnData.errorType.notexist, "该用户不存在"));
        }
        else {
            ep.emit("getnewinfo", result);
            logger.info(useraccount, "获取用户详细信息成功");
        }
    });

    //查找用户基本信息
    custdb.findOne({
        where: queryobj
    }).then(
        //查找成功函数
        function (result) {
            logger.info(useraccount, "customer查找成功");
            ep.emit("get", result);
        },
        //查找失败函数
        function (error) {
            logger.error(useraccount, "customer查找失败");
            ep.emit("error", error);
        }
        )
        //错误捕捉
        .catch(function (error) {
            logger.error(useraccount, "数据库操作失败");
            ep.emit("error", error);
        });


};

//获取用户基本信息
exports.getCustInfo = function (arg, cb) {
    var custdb = db.models.customer;
    var custid = arg.custid.trim();

    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    var ep = new eventproxy();
    //参数检查
    if (!custid) {
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }

    //组装查询对象
    var queryobj = {
        custid: custid
    };

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口customer/get错误", error);
        cb(returnData.createError(returnData.errorType.dataBaseError.unknow, "数据库错误"));
    });


    ep.on("getAddress", function (custinfo) {
        if (custinfo.dataValues.extInfo.address) {
            var adddb = db.models.custaddress;
            adddb.findOne({
                where: { addid: custinfo.dataValues.extInfo.address }
            }).then(
                //查找成功函数
                function (result) {
                    logger.info(useraccount, "custaddress查找成功");
                    if (result) {
                        custinfo.dataValues.extInfo.addressInfo = result;
                    }
                    else
                        custinfo.dataValues.extInfo.addressInfo = null;
                    cb(null, returnData.createData(custinfo));
                },
                //查找失败函数
                function (error) {
                    logger.error(useraccount, "custaddress查找失败");
                    ep.emit("error", error);
                }
                )
                //错误捕捉
                .catch(function (error) {
                    logger.error(useraccount, "数据库操作失败");
                    ep.emit("error", error);
                });

        } else {
            cb(null, returnData.createData(custinfo));
        }


    });


    ep.on("getExtInfo", function (custinfo) {
        var pointdb = db.models.custextend;
        pointdb.findOne({
            where: queryobj
        }).then(
            //查找成功函数
            function (result) {
                logger.info(useraccount, "custextend查找成功");
                if (result) {
                    if (result.dataValues.paypassword && !tool.verifier.isEmptyString(result.dataValues.paypassword))
                        custinfo.dataValues.hassetpassword = true;
                    else
                        custinfo.dataValues.hassetpassword = false;
                    result.dataValues.paypassword = "";
                    custinfo.dataValues.extInfo = result.dataValues;
                    ep.emit("getAddress", custinfo);
                }
                else {
                    custinfo.dataValues.extInfo = null;
                    custinfo.dataValues.hassetpassword = false;
                    cb(null, returnData.createData(custinfo));
                }

            },
            //查找失败函数
            function (error) {
                logger.error(useraccount, "custextend查找失败");
                ep.emit("error", error);
            }
            )
            //错误捕捉
            .catch(function (error) {
                logger.error(useraccount, "数据库操作失败");
                ep.emit("error", error);
            });

    });


    //
    ep.on("get", function (result) {
        if (!result || tool.isEmptyObject(result)) {
            //未找到对象
            logger.error(useraccount, "调用/customer/getSummary接口时，该记录不存在");
            cb(returnData.createError(returnData.errorType.notexist, "该用户不存在"));
        }
        else {
            ep.emit("getExtInfo", result);
            logger.info(useraccount, "获取用户详细信息成功");
        }
    });

    //查找用户基本信息
    custdb.findOne({
        where: queryobj
    }).then(
        //查找成功函数
        function (result) {
            logger.info(useraccount, "customer查找成功");
            ep.emit("get", result);
        },
        //查找失败函数
        function (error) {
            logger.error(useraccount, "customer查找失败");
            ep.emit("error", error);
        }
        )
        //错误捕捉
        .catch(function (error) {
            logger.error(useraccount, "数据库操作失败");
            ep.emit("error", error);
        });
};

exports.updateBaseInfo = function (arg, cb) {
    //获取参数
    var custinput = arg.customer;
    var ep = new eventproxy();
    var custdb = db.models.customer;
    var customer = {};
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    //参数检查
    if (!!custinput && !tool.verifier.isEmptyString(custinput)) {
        try {
            customer = JSON.parse(custinput)
        } catch (error) {
            logger.error(arg.currentuser.useraccount, "解析参数customer出错：" + custinput);
            cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
            return;
        }
    }
    if (customer.phone != null && customer.phone != "" && customer.phone != undefined) {
        if (!tool.verifier.isMobile(customer.phone) && !tool.verifier.isPhone(customer.phone)) {
            logger.error(useraccount, "调用/customer/updateBaseInfo，参数phone不满足格式")
            cb(returnData.createError(returnData.errorType.paraerror, "更新失败！电话不满足格式要求。如为固定电话,需要'-'连接"));
            return;
        }
    }
    if (customer.address.length > 50) {
        logger.error(useraccount, "调用/customer/updateBaseInfo，参数address超出字符限制")
        cb(returnData.createError(returnData.errorType.paraerror, "更新失败！地址最大长度为50字符。"));
        return;
    }

    if (!customer.custid) {
        //custid为空
        logger.error(useraccount, "调用/customer/updateBaseInfo，参数customer中custid为空");
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/customer/updateBaseInfo", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });

    //获取数据库中customer实体
    custdb.findOne({
        where: { custid: customer.custid }
    }).then(
        //查找成功
        function (result) {
            logger.info(useraccount, customer.custid + "数据库查找成功");
            ep.emit("findone", result);
        },
        //查找失败
        function (error) {
            logger.error(useraccount, customer.custid + "数据库customer表查找失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        }
        ).catch(function (error) {
            logger.error(useraccount, customer.custid + "数据库customer表查找失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });

    //更新customer实体并保存
    ep.on("findone", function (result) {
        if (!result || tool.isEmptyObject(result)) {
            //未找到对象
            logger.error(useraccount, "调用/customer/updateBaseInfo，custid:" + customer.custid + "在数据库中未找到");
            cb(returnData.createError(returnData.errorType.notexist, "客户信息未找到"));
        }
        else {
            result.address = customer.address;
            result.phone = customer.phone;
            result.country = customer.country;
            if (customer.province && customer.province[customer.province.length - 1] == "省") {
                customer.province = customer.province.replace(/省/ig, "");
            }
            result.province = customer.province;
            result.city = customer.city;
            result.sign = customer.sign;
            result.sex = customer.sex;
            result.nickname = customer.nickname;
            result.birthday = customer.birthday;
            result.areacode = customer.code;
            result.save().then(function () {
                logger.info(useraccount, "客户信息更新成功");
                cb(null, returnData.createData(result));

            }).catch(function (error) {
                logger.error(useraccount, customer.custid + "customer更新失败");
                error.errortype = returnData.errorType.dataBaseError.unknow;
                ep.emit("error", error);
            });

        }
    });
};

exports.resetPayPassword = function (arg, cb) {
    //获取参数
    var custid = arg.custid;
    var password = arg.password;
    var oldpassword = arg.oldpassword;
    var ep = new eventproxy();
    var custdb = db.models.custextend;

    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    //参数检查


    if (!password || password.length < 6) {
        logger.error(useraccount, "调用/customer/updateBaseInfo，参数password为空或长度不足");
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/customer/updateBaseInfo", JSON.stringify(error));
        cb(returnData.createError(error.errortype, error.message));
    });

    //更新customer实体并保存
    ep.on("findone", function (result) {

        var reg = new RegExp("^[0-9]*$");
        var leve = "low";
        if (reg.test(password)) {
            leve = "mlow";
        } else {
            reg = new RegExp(/\d+/);
            if (reg.test(password)) {
                leve = "mid";
                reg = new RegExp(/[A-Za-z].*[0-9]|[0-9].*[A-Za-z]/);
                if (reg.test(password))
                    leve = "hig";

            }
        }

        if (!result || tool.isEmptyObject(result)) {
            //未找到对象
            var cust = vo.custextend.createnew();
            cust.custid = custid;
            cust.paypassword = tool.genPwd(password);
            cust.passwordleve = leve;
            custdb.create(cust);
        } else {
            result.paypassword = tool.genPwd(password);
            result.passwordleve = leve;
            result.save().then(function () {
                logger.info(useraccount, "密码更新成功");
                cb(null, returnData.createData(leve));

            }).catch(function (error) {
                logger.error(useraccount, customer.custid + "密码更新失败");
                error.errortype = returnData.errorType.dataBaseError.unknow;
                error.message = '密码错误';
                ep.emit("error", error);
            });


        }

    });


    custdb.findOne({
        where: { custid: custid }
    }).then(
        //查找成功
        function (result) {
            logger.info(useraccount, custid + "数据库customer查找成功");
            if (result.dataValues.paypassword && !tool.verifier.isEmptyString(result.dataValues.paypassword)) {
                if (result.dataValues.paypassword === tool.genPwd(oldpassword)) {
                    ep.emit("findone", result);
                } else {
                    logger.error(useraccount, custid + "旧密码错误!");
                    var error = {};
                    error.errortype = returnData.errorType.refuse;
                    error.message = '旧密码错误';
                    ep.emit("error", error);
                }
            } else {
                ep.emit("findone", result);
            }

        }).catch(function (error) {
            logger.error(useraccount, custid + "数据库customer表查找失败");
            error.message = '数据库错误';
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });


};

exports.resetSaftInfo = function (arg, cb) {
    //获取参数
    var custid = arg.custid;
    var password = arg.password;
    var email = arg.email;
    var phone = arg.phone;
    var ep = new eventproxy();
    var custdb = db.models.custextend;

    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/customer/updateBaseInfo", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });

    //更新customer实体并保存
    ep.on("findone", function (result) {
        var info = {};
        if (email && email != '')
            info.email = email;
        if (phone && phone != '')
            info.phone = phone;
        custdb.update(info, {
            where: { custid: custid }
        }).then(function () {
            logger.info(useraccount, "客户安全信息更新成功");
            cb(null, true);

        }).catch(function (error) {
            logger.error(useraccount, customer.custid + "安全信息更新失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });

    });


    custdb.findOne({
        where: { custid: custid }
    }).then(function (result) {
        if (result && result.dataValues.paypassword && !tool.verifier.isEmptyString(result.dataValues.paypassword)) {
            logger.info(useraccount, custid + "数据库customer查找成功");
            if (result.dataValues.paypassword === tool.genPwd(password)) {
                ep.emit("findone", result);
            } else {
                logger.error(useraccount, custid + "密码错误!");
                cb(returnData.createError(returnData.errorType.account.passworderror, '密码错误!'));
            }
        } else
            cb(returnData.createError(returnData.errorType.dataBaseError.notfind, '请先设置支付密码!'));
    }).catch(function (error) {
        logger.error(useraccount, custid + "数据库customer表查找失败");
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    });


};


exports.getAddressList = function (arg, cb) {
    //获取参数
    var custid = arg.custid;
    var ep = new eventproxy();
    var adddb = db.models.custaddress;
    var custdb = db.models.custextend;
    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/customer/updateBaseInfo", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });


    ep.on("findinfo", function (result) {
        if (result) {
            var res = {
                addressList: [],
                defaultAddressId: result.dataValues.address
            }
            //查询默认地址
            adddb.findAll({
                where: { custid: custid }
            }).then(
                //查找成功
                function (result) {
                    logger.info(useraccount, custid + "数据库custaddress查找成功");
                    res.addressList = result;
                    cb(null, returnData.createData(res));
                },
                //查找失败
                function (error) {
                    logger.error(useraccount, custid + "数据库custaddress表查找失败");
                    error.errortype = returnData.errorType.dataBaseError.unknow;
                    ep.emit("error", error);
                }
                ).catch(function (error) {
                    logger.error(useraccount, custid + "数据库custaddress表查找失败");
                    error.errortype = returnData.errorType.dataBaseError.unknow;
                    ep.emit("error", error);
                });

        } else {
            logger.error(useraccount, custid + "未找到指定的记录");
            var error = {};
            error.errortype = returnData.errorType.dataBaseError.notfind;
            ep.emit("error", error);
        }
    });


    custdb.findOne({
        where: { custid: custid }
    }).then(
        //查找成功
        function (result) {
            logger.info(useraccount, custid + "数据库custextend查找成功");
            ep.emit("findinfo", result);
        },
        //查找失败
        function (error) {
            logger.error(useraccount, custid + "数据库custextend表查找失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        }
        ).catch(function (error) {
            logger.error(useraccount, custid + "数据库custextend表查找失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });


};

exports.readMessage = function (arg, cb) {
    //获取参数
    var custid = arg.custid;
    var messageType = arg.messageType;
    var ep = new eventproxy();
    var infodb = db.models.custnewinfo;

    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/customer/updateBaseInfo", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });
    ep.on('saveinfo', function (info) {
        if (info) {
            switch (messageType) {
                case 'neworderreceivin':
                    info.neworderreceivin = 0;
                    break;
                case 'newordereva':
                    info.newordereva = 0;
                    break;
                case 'newprize':
                    info.newprize = 0;
                    break;
                case 'newprizereceivin':
                    info.newprizereceivin = 0;
                    break;
            }

            info.save().then(function () {
                cb(null, returnData.createData(true));
            }).catch(function (error) {
                logger.error(useraccount, custid + "保存custnewinfo失败");
                error.errortype = returnData.errorType.dataBaseError.unknow;
                ep.emit("error", error);
            });

        } else {
            cb(null, returnData.createData(true));
        }
    });


    infodb.findOne({
        where: { custid: custid }
    }).then(
        //查找成功
        function (result) {
            logger.info(useraccount, custid + "数据库custnewinfo查找成功");
            ep.emit('saveinfo', result);
        },
        //查找失败
        function (error) {
            logger.error(useraccount, custid + "数据库custnewinfo表查找失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        }
        ).catch(function (error) {
            logger.error(useraccount, custid + "数据库custnewinfo表查找失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });
};

exports.updateAddress = function (arg, cb) {
    //获取参数
    var addressinput = arg.address;
    var ep = new eventproxy();
    var adddb = db.models.custaddress;
    var custdb = db.models.custextend;
    var address = {};
    var useraccount = !!arg.currentuser ? arg.currentuser.useraccount : null;

    //参数检查
    if (!!addressinput && !tool.verifier.isEmptyString(addressinput)) {
        try {
            address = JSON.parse(addressinput)
        } catch (error) {
            logger.error(arg.currentuser.useraccount, "解析参数address出错：" + addressinput);
            cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
            return;
        }
    }


    if (!address.custid) {
        //custid为空
        logger.error(useraccount, "调用/customer/updateAddress，参数address中custid为空");
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }

    if (!address.addid || tool.verifier.isEmptyString(address.addid)) {
        address.addid = uuid.v4();
    }

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/customer/updateAddress", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });
    ep.on('updatedefault', function (result) {
        if (result) {
            result.address = address.addid;
            result.save().then(function () {
                logger.info(useraccount, "客户默认地址更新成功");
                cb(null, returnData.createData(address));

            }).catch(function (error) {
                logger.error(useraccount, "默认地址更新失败");
                error.errortype = returnData.errorType.dataBaseError.unknow;
                ep.emit("error", error);
            });
        } else {
            cb(null, returnData.createData(address));
        }
    });

    adddb.upsert(address).then(
        //成功
        function () {
            logger.info(useraccount, "地址保存成功!");
            if (address.defaultAddressId == true) {
                custdb.findOne({ where: { custid: address.custid } }).then(function (result) {
                    ep.emit('updatedefault', result);
                })
            } else {
                cb(null, returnData.createData(address));
            }
        },
        //失败
        function (error) {
            logger.error(useraccount, "地址保存失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        }
    ).catch(function (error) {
        logger.error(useraccount, "地址保存失败");
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    });

};

exports.setDefaultAddress = function (arg, cb) {
    //获取参数
    var custid = arg.custid;
    var address = arg.address;

    var ep = new eventproxy();
    var custdb = db.models.custextend;

    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/customer/updateBaseInfo", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });

    //更新customer实体并保存
    ep.on("findone", function (result) {
        if (!result || tool.isEmptyObject(result)) {
            //未找到对象
            logger.error(useraccount, custid + "数据库custextend表查找无此记录!");
            error.errortype = returnData.errorType.dataBaseError.notfind;
            ep.emit("error", error);
        } else {
            result.address = address;
            result.save().then(function () {
                logger.info(useraccount, "客户默认地址更新成功");
                cb(null, returnData.createData(result));

            }).catch(function (error) {
                logger.error(useraccount, customer.custid + "默认地址更新失败");
                error.errortype = returnData.errorType.dataBaseError.unknow;
                ep.emit("error", error);
            });
        }

    });

    custdb.findOne({
        where: { custid: custid }
    }).then(
        //查找成功
        function (result) {
            ep.emit('findone', result);
        },
        //查找失败
        function (error) {
            logger.error(useraccount, custid + "数据库customer表查找失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        }
        ).catch(function (error) {
            logger.error(useraccount, custid + "数据库customer表查找失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });


};

exports.delAddress = function (arg, cb) {
    //获取参数
    var custid = arg.custid;
    var address = arg.address;

    var ep = new eventproxy();
    var custdb = db.models.custextend;
    var adddb = db.models.custaddress;

    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();


    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/customer/updateBaseInfo", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });

    ep.on('updatedefault', function (result) {
        if (result) {
            if (result.dataValues.address == address) {
                result.address = '';
                result.save().then(function () {
                    logger.info(useraccount, "客户默认地址更新成功");
                    cb(null, returnData.createData(true));

                }).catch(function (error) {
                    logger.error(useraccount, custid + "默认地址更新失败");
                    error.errortype = returnData.errorType.dataBaseError.unknow;
                    ep.emit("error", error);
                });
            } else
                cb(null, returnData.createData(true));

        } else {
            cb(null, returnData.createData(true));
        }
    });

    //更新customer实体并保存
    ep.on("findone", function (result) {
        adddb.destroy({ where: { custid: custid, addid: address } }).then(function () {
            logger.info(useraccount, "删除地址成功");
            ep.emit('updatedefault', result);

        }).catch(function (error) {
            logger.error(useraccount, custid + "删除地址失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });
    });

    custdb.findOne({
        where: { custid: custid }
    }).then(
        //查找成功
        function (result) {
            ep.emit('findone', result);
        },
        //查找失败
        function (error) {
            logger.error(useraccount, custid + "数据库customer表查找失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        }
        ).catch(function (error) {
            logger.error(useraccount, custid + "数据库customer表查找失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });

};

exports.checkpasswordstate = function (arg, cb) {
    var custid = "";
    var ep = new eventproxy();
    var custdb = db.models.custextend;

    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    ep.on('ok', function (result) {
        logger.info(useraccount, "查询密码状态成功");
        cb(null, returnData.createData(result));
    });

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/customer/checkpasswordstate", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });

    custdb.findOne({
        where: { custid: custid }
    }).then(function (result) {
        if (result) {
            if (result.paypassword && result.paypassword != '') {
                ep.emit('ok', true);
            } else {
                ep.emit('ok', false);
            }

        } else {
            ep.emit("error", { errortype: returnData.errorType.dataBaseError.notfind });
        }
    }).catch(function (error) {
        logger.error(useraccount, custid + "数据库customer表查找失败");
        error.errortype = returnData.errorType.dataBaseError.unknow;
        ep.emit("error", error);
    });
};

/**
 * 重置用户的支付密码
 * 获取用户电话, 未找到返回异常
 * 生成随机6位码，通过短信发送，发送后设置数据库的密码为新密码
 */
exports.resetPassword = function (arg, cb) {
    var custid = arg.currentuser.custid;
    if (!custid) {
        cb(returnData.createError("unlogin", "用户尚未登录"));
        return;
    }
    var custdb = db.models.custextend;
    var customerdb = db.models.customer;
    var ep = new eventproxy();

    ep.on("error", function (error) {
        cb(returnData.createError(error.errortype, "数据库错误"));
    });

    ep.on("nophone", function () {
        cb(returnData.createError("NOPHONE", "未找到安全手机号码"));
    });

    ep.on("findone", function (phone) {
        // 发送信息
        sms.sendResetSms(phone).then(function (newPwd) {
            custdb.update({ paypassword: tool.genPwd(newPwd) }, {
                where: { custid: custid }
            }).then(function () {
                logger.info(custid + ":支付密码重置成功");
                cb(null, { data: true });
            }).catch(function (error) {
                logger.error(custid + " 支付密码重置失败");
                ep.emit("error", error);
            });
        }).catch(function (error) {
            cb(returnData.createError("SENDFAIL", "短信发送失败" + JSON.stringify(error)));
        });
    });

    customerdb.findOne({
        where: { custid: custid }
    }).then(function (result) {
        if (result) {
            var data = result.get({ chain: true });
        } else {
            var data = null;
        }
        if (data && data.phone) {
            ep.emit("findone", data.phone);
        } else {
            ep.emit("nophone");
        }
    }).catch(function (error) {
        ep.emit("error", error);
    });
};
/**
 * 设置用户电话号码。
 * @param arg
 * @param cb
 */
exports.resetPhoneNo = function (arg, cb) {
    //获取参数
    var custid = arg.custid;
    var password = arg.password;
    var phoneNo = arg.phone;
    var checkcode = arg.checkcode;
    var ep = new eventproxy();
    var custdb = db.models.custextend;
    //var custinfodb = db.models.customer;

    var useraccount = !!arg.currentuser.nickname ? arg.currentuser.nickname : arg.currentuser.useraccount;
    custid = !!arg.currentuser.custid ? arg.currentuser.custid : custid = arg.custid.trim();

    //参数检查


    if (!password || password.length < 6) {
        logger.error(useraccount, "调用/customer/resetPhoneNo，参数password为空或长度不足");
        cb(returnData.createError(returnData.errorType.paraerror, "参数错误"));
        return;
    }

    //错误处理
    ep.on("error", function (error) {
        logger.error(useraccount, "接口/customer/resetPhoneNo", error);
        cb(returnData.createError(error.errortype, "数据库错误"));
    });

    //更新customer实体并保存
    ep.on("findone", function (result) {
        sms.valsms(phoneNo, checkcode).then(function () {
            custdb.update({
                phone: phoneNo
            }, {
                    where: { custid: custid }
                }).then(function () {
                    logger.info(useraccount, "安全手机更新成功");
                    cb(null, returnData.createData(phoneNo));

                }).catch(function (error) {
                    logger.error(useraccount, "安全手机更新失败");
                    error.errortype = returnData.errorType.dataBaseError.unknow;
                    ep.emit("error", error);
                });
        });

    });


    custdb.findOne({
        where: { custid: custid }
    }).then(
        //查找成功
        function (result) {
            logger.info(useraccount, custid + "数据库customer查找成功");
            if (result.dataValues.paypassword && !tool.verifier.isEmptyString(result.dataValues.paypassword)) {
                if (result.dataValues.paypassword === tool.genPwd(password)) {
                    ep.emit("findone", result);
                } else {
                    logger.error(useraccount, custid + "密码错误!");
                    cb(returnData.createError(returnData.errorType.account.passworderror, "密码错误!"));
                }
            } else {
                cb(returnData.createError(returnData.errorType.paraerror, "请先设置支付密码!"));
            }

        },
        //查找失败
        function (error) {
            logger.error(useraccount, custid + "数据库customer表查找失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        }
        ).catch(function (error) {
            logger.error(useraccount, custid + "数据库customer表查找失败");
            error.errortype = returnData.errorType.dataBaseError.unknow;
            ep.emit("error", error);
        });


};