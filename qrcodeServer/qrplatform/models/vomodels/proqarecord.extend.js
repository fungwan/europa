/**
*create by codesmith
**/

/**
*模型
*/
var proqarecord = {
    createnew: function(){
        var info = {
            /**
            *问卷答题结果id
            */
		    recid:'',
            /**
            *参与者ID
            */
		    custid:'',
            /**
            *问卷ID
            */
		    qaid:'',
            /**
            *活动ID
            */
		    projectid:'',
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
            *问卷题目
            */
		    qaname:'',
            /**
            *问卷答案
            */
		    answer:'',
            /**
            *答题时间
            */
		    answertime:'',
            /**
            *答题国家/地区
            */
		    country:'',
            /**
            *答题省份
            */
		    province:'',
            /**
            *答题城市
            */
		    city:'',
            /**
             * 中奖所在区域
             */
            areacode:'',
            /**
             *题目序号
             */
            number:0
        }
        return info;
    }
};
module.exports = proqarecord;
