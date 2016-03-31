/**
 * Created by Administrator on 2016/1/15.
 */

exports.set = function(acl){

    //系统前期角色初定5个

    //分别为admin、客服、财务总管理员、财务初审员、财务复核员、运营

    //创建角色
    acl.allow([
        {
            roles:['0'],//客服
            allows:[
                {resources:['/api/workers','/api/orders'], permissions:['get','post']}
            ]
        },
        {
            roles:['1'],//财务初审员//accountant_p
            allows:[
                {resources:'/api/bills', permissions:'get'},
                {resources:'/api/bills/checkBill', permissions:['post']},
                {resources:'/api/bills/rejectBill', permissions:['post']}
            ]
        },
        {
            roles:['2'],//财务复核员//accountant_r
            allows:[
                {resources:'/api/bills', permissions:'get'},
                {resources:'/api/bills/checkBill', permissions:['put']},
                {resources:'/api/bills/rejectBill', permissions:['put']}
            ]
        },
        {
            roles:['3'],//财务总管理员、经理//accountant
            allows:[
                {resources:'/api/bills', permissions:'get'},
                {resources:'/api/bills/checkBill', permissions:['post','put']},
                {resources:'/api/bills/rejectBill', permissions:['post','put']}
            ]
        },
        {
            roles:['4'],//运营
            allows:[
                {resources:'/api/bills', permissions:'get'},
                {resources:['/api/workers','/api/orders'], permissions:['get','post']},
                {resources:['/api/setting'], permissions:['get','post','put','delete']}
            ]
        },
        {
            roles:['5'],//城市管理员
            allows:[
                {resources:['/api/users','/api/logs'], permissions:['get','post','delete']}
            ]
        },
        {
            roles:['99'],//超级管理员
            allows:[
                {resources:['/api/users','/api/logs'], permissions:['get','post','delete']}
            ]
        }

    ]);

    //为账号分配角色
    acl.addUserRoles('0d11e1da-9764-4692-8d3b-4d3b93f5e4fc', '99');

};