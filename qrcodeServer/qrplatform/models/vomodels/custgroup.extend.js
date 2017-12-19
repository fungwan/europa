/**
*create by codesmith
**/

/**
*模型
*/
var custgroup = {
    createnew: function(){
        var info = {
            /**
            *客户组
            */
		    groupid:'',
            /**
            *企业ID
            */
		    entid:'',
            /**
            *企业名称
            */
		    entname:'',
            /**
            *客户组名称
            */
		    groupname:'',
            /**
            *父级客户组id
            */
		    parentid:null,
            /**
            *是否禁用
            */
		    isdisabled:false,
            /**
            *客户组类别(消费者/经销商)
            */
		    grouptype:'',
            /**
             * 组别描述
             */
            groupdesc:''
        }
        return info;
    }
};
module.exports = custgroup;
