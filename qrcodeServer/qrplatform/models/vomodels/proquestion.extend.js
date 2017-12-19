/**
*create by codesmith
**/

/**
*模型
*/
var proquestion = {
    createnew: function(){
        var info = {
            /**
            *问卷ID
            */
		    qaid:'',
            /**
            *活动ID
            */
		    projectid:'',
            /**
            *问卷题目
            */
		    name:'',
            /**
            *问卷答案
            */
		    answer:'',
            /**
            *题目类型
            */
		    qatype:'',
            /**
             * 题目序号
             */
            number:0
        }
        return info;
    }
};
module.exports = proquestion;
