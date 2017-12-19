/**
*create by codesmith
**/

/**
*模型
*/
var sysmessage = {
    createnew: function(){
        var info = {
            /**
            *消息id
            */
		    msgid:'',
            /**
            *消息内容
            */
		    content:'',
            /**
            *消息接收者id
            */
		    toid:'',
            /**
            *消息接收者名称
            */
		    toname:'',
            /**
            *是否已发送
            */
		    sendstatus:'',
            /**
            *发送时间
            */
		    sendtime:'',
            /**
            *消息未读/已读状态
            */
		    isread:false,
            /**
            *消息读取时间
            */
		    readtime:'',
            /**
            *消息生成时间
            */
		    createtime:''
        }
        return info;
    }
};
module.exports = sysmessage;
