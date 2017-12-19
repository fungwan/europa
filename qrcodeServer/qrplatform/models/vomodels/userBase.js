/**
 * Created by shuwei on 15-11-25.
 */

/**
 * 用户信息类,自定义的用户类型必须继承于此类
 * @type {{createNew: Function}}
 */
var userBase = {
   createNew: function(){
        var info = {
            //帐号
            id:'',
            //名称
            name:'',
            //角色Id
            roleId:''
        };
        return info;
    }
};

module.exports = userBase;