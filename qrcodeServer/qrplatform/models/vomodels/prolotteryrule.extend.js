/**
*create by codesmith
**/

/**
*模型
*/
var prolotteryrule = {
    createnew: function(){
        var info = {
            /**
            *规则ID
            */
		    ruleid:'',
            /**
            *奖项主键ID
            */
		    lotteryid:'',
            projectid:'',
            /**
            *开始时间
            */
		    begtime:'',
            /**
            *结束时间
            */
		    endtime:'',
            /**
            *产生奖项数量
            */
		    count:0,
            /**
            *产生规则
            */
		    ruletype:'',
            /**
            *策略状态
            */
		    state:'',
            /**
            *中奖区域
            */
		    area:''
        }
        return info;
    }
};
module.exports = prolotteryrule;
