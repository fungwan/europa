/**
*create by codesmith
**/

/**
*模型
*/
var prolottery = {
    createnew: function(){
        var info = {
            /**
            *奖项主键ID
            */
		    lotteryid:'',
            /**
            *活动ID
            */
		    projectid:'',
            /**
            *奖项名称
            */
		    name:'',
            /**
            *奖项单个金额
            */
		    money:0.0,
            /**
            *奖项数量
            */
		    count:0,
            /**
            *单个奖项总金额
            */
		    summoney:0.0
        }
        return info;
    }
};
module.exports = prolottery;
