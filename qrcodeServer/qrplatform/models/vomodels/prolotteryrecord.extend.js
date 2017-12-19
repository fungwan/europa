/**
*create by codesmith
**/

/**
*模型
*/
var prolotteryrecord = {
    createnew: function(){
        var info = {
            /**
            *红包中奖纪录ID
            */
		    recid:'',
            /**
            *参与者ID
            */
		    custid:'',
            /**
            *企业ID
            */
		    entid:'',
            /**
            *活动ID
            */
		    projectid:'',
            /**
            *奖项主键ID
            */
		    lotteryid:'',
            /**
            *规则ID
            */
		    ruleid:null,
            /**
            *营销活动
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
            *奖项名称
            */
		    lotteryname:'',
            /**
            *中奖时间
            */
		    rectime:'',
            /**
            *中奖状态(系统处理状态及微信发红包状态)
            */
		    state:'',
            /**
            *中奖金额
            */
		    money:0.0,
            /**
            *中奖国家/地区
            */
		    country:'',
            /**
            *中奖省份
            */
		    province:'',
            /**
            *中奖城市
            */
		    city:'',
            /**
             * 中奖所在区域
             */
            areacode:''
        }
        return info;
    }
};
module.exports = prolotteryrecord;
