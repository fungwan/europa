/**
*create by codesmith
**/

/**
*模型
*/
var customer = {
    createnew: function(){
        var info = {
            /**
            *参与者ID
            */
		    custid:'',
            /**
            *企业ID
            */
		    entid:null,
            /**
            *客户组
            */
		    groupid:null,
            /**
            *参与者名称
            */
		    nickname:'',
            /**
            *性别
            */
		    sex:0,
            /**
            *手机号码
            */
		    phone:'',
            /**
            *电子邮件
            */
		    email:'',
            /**
            *生日
            */
		    birthday:'',
            /**
            *身份证号码
            */
		    idcard:'',
            /**
            *国家/地区
            */
		    country:'',
            /**
            *省份
            */
		    province:'',
            /**
            *城市
            */
		    city:'',
            /**
            *地址
            */
		    address:'',
            /**
            *微信openid
            */
		    openid:'',
            /**
            *邮编
            */
		    areacode:'',
            /**
            *用户类型
            */
		    custtype:'',
            /**
            *客户组名称
            */
		    groupname:'',
            /**
             * 客户创建时间
             */
            createtime:'',
            /**
             * 是否关注
             */
            subscribe:0,
            /**
             * 用户唯一标志
             */
            unionid:''

        }
        return info;
    }
};
module.exports = customer;
