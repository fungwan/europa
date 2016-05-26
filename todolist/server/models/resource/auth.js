/**
 * Created by Administrator on 2016/5/23.
 */

module.exports = {
    token : function(req){
        if(req.authInfo === undefined) return false;
        return true;
    }
};