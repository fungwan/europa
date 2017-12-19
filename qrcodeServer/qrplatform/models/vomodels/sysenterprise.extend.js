/**
*create by codesmith
**/

/**
*模型
*/
var sysenterprise = {
    createnew: function(){
        var info = {
            /**
            *企业ID
            */
		    entid:'',
            /**
            *企业名称
            */
		    entname:'',
            /**
            *联系人
            */
		    entcontact:'',
            /**
            *联系电话
            */
		    entphone:'',
            /**
            *联系地址
            */
		    entaddr:'',
            /**
            *联系邮箱
            */
		    entemail:'',
            /**
            *所属区域
            */
		    areacode:''
        }
        return info;
    }
};
module.exports = sysenterprise;
