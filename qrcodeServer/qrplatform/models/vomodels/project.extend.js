/**
*create by codesmith
**/

/**
*模型
*/
var project = {
    createnew: function(){
        var info = {
            /**
            *活动ID
            */
		    projectid:'',
            /**
            *企业ID
            */
		    entid:'',
            /**
            *活动名称
            */
		    name:'',
            /**
             *企业名称
             */

            entname:'',
            /**
            *活动描述
            */
		    description:'',
            /**
            *活动类别(rp、point、qa)
            */
		    type:'',
            /**
            *开 始时间
            */
		    begdate:'',
            /**
            *结束时间
            */
		    enddate:'',
            /**
            *创建人
            */
		    creater:'',
            /**
            *创建时间
            */
		    createtime:'',
            /**
            *更新时间
            */
		    updatetime:'',
            /**
            *更新人
            */
		    updater:'',
            /**
            *数据业务状态
            */
		    state:'',
            /**
            *红包中奖比例
            */
            percent:0.0,
            /**
            *二维码生成数量
            */
		    qramounts:0,
            /**
             * 活动进度
             */
            progress:0,
            /**
             * 二维码预览id
             */
            qrid:'',
            /**
             * 页面模板名称
             */
            templates:''
        }
        return info;
    }
};
module.exports = project;
