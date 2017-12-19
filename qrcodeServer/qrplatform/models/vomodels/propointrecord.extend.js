/**
*create by codesmith
**/

/**
*模型
*/
var propointrecord = {
    createnew: function(){
        var info = {
            /**
            *记录id
            */
		    recid:'',
            /**
            *参与者ID
            */
		    custid:'',
            /**
            *活动ID
            */
		    projectid:'',
            /**
            *积分活动名称
            */
		    projectname:'',
            /**
            *企业名称
            */
		    entname:'',
            /**
            *参与者名称
            */
		    nickname:'',
            /**
            *积分
            */
		    point:0.0,
            /**
            *积分时间
            */
		    pointtime:'',
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
             * 中奖所在区域
             */
            areacode:'',
            /**
             * 企业id
             */
            entid:''
        }
        return info;
    }
};
module.exports = propointrecord;
