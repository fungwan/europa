/**
 * Created by root on 15-12-2.
 */
var roles={
    /*userleve0: {
        name:'0级别用户',
        descript:'级别为0的用户，一般为已注册未激活的用户。',
        permissions:['/remail','/updateentinfo']
    },
    userleve1:{
        name:'1级别用户',
        descript:'级别为1的用户，一般为已激活的未付费用户。',
        permissions:['/remail','/updateentinfo','/customer/list'],
    },*/
    admin:{
        name:'系统管理员',
        descript:'系统管理员（仅限制后台管理模块操作）',
        value:"admin",
        permissions:['/user']//禁止访问模块,数组为空表示访问不受限制
    },
    erathink:{
        name:'超级管理员',
        descript:'超级管理员（最高权限，操作不受限制）',
        value:"erathink",
        permissions:[]//禁止访问模块,数组为空表示访问不受限制
    },
    normal:{
        name:'一般用户',
        descript:'一般用户（仅限查看数据分析和消费者管理）',
        value:"normal",
        permissions:['/user','/finance','/club/getAdList','/project/start','/mcdManage','/mall/updateOrder',
                    '/mall/getOrderList']//禁止访问模块,数组为空表示访问不受限制
    }
};

module.exports = roles;