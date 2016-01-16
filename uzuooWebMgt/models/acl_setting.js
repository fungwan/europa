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
                {resources:['/workers','/orders'], permissions:['get','post']}
            ]
        },
        {
            roles:['1'],//财务初审员//accountant_p
            allows:[
                {resources:'/bills', permissions:'get'},
                {resources:'/bills/:id/billStatus', permissions:['post']}
            ]
        },
        {
            roles:['2'],//财务复核员//accountant_r
            allows:[
                {resources:'/bills', permissions:'get'},
                {resources:'/bills/:id/billStatus', permissions:['put']}
            ]
        },
        {
            roles:['3'],//财务总管理员、经理//accountant
            allows:[
                {resources:'/bills', permissions:'get'},
                {resources:'/billStatus', permissions:['put','post']}
            ]
        },
        {
            roles:['4'],//运营
            allows:[
                {resources:'/bills', permissions:'get'},
                {resources:['/workers','/orders'], permissions:['get','post']}
            ]
        },
        {
            roles:['5'],//admin
            allows:[
                {resources:['/users','/logs'], permissions:['get','post','delete']}
            ]
        }

    ]);

    //为账号分配角色
    //acl.addUserRoles('fengyun', 'kefu');
    acl.addUserRoles('0d11e1da-9764-4692-8d3b-4d3b93f5e4fb', '5');


//
//    acl.allowedPermissions('fengyun', ['/workers'], function(err, permissions){
//        console.log(permissions);
//    });

//    acl.isAllowed('joed', '/forums', 'view', function(err, res){
//        if(res){
//            console.log("User joed is allowed to view blogs");
//        }else{
//            console.log("no one");
//        }
//    });
};