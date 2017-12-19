/**
 * Created by ivan on 15/11/30.
 */
var returnData =require('../common/returnData');

exports.num = function(arg, cb){
    var num = {num:20};
    cb(null, returnData.createData(num));

    /**
     * 1,获取session中用户ID
     * 2,以用户ID查询消息数量
     */
}

exports.list = function(arg, cb){
    var list = {
        page: 2,
        size: 10,
        messages:[
            {
                id: 1,
                toid:'id1',
                toname: 'username1',
                fromid: 'id2',
                fromname:"username2",
                content: 'content1',
                read: true
            },
            {
                id: 2,
                toid:'id1',
                toname: 'username1',
                fromid: 'id2',
                fromname:"username2",
                content: 'content1',
                read: false
            }
        ]
    }

    cb(null, returnData.createData(list));
}

exports.get = function(arg, cb){
    var message = {
        id: 2,
        toid:'id1',
        toname: 'username1',
        fromid: 'id2',
        fromname:"username2",
        content: 'content1',
        read: false
    }
    cb(null, returnData.createData(message));
}

exports.markread = function(arg, cb){
    var message = {
        success:true
    }
    cb(null, returnData.createData(message));
}