/**
 * Created by shuwei on 15-11-25.
 */
/**;
 * 返回类型
 * @type {{createError: Function, createData: Function}}
 */
var returnData = {
    createError: function(code,msg){
        var info = {
            error:{
                code:code,
                message:msg
            }
        };
        return info;
    },
    createData: function(dataValue) {
        var info = {
            data: dataValue
        };
        return info;
    }
};

module.exports = returnData;