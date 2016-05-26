/**
 * Created by Administrator on 2016/5/20.
 */
var loginSessions = require('./loginSessions');
var refreshToken = require('./refreshToken');
module.exports = function(server){

    //register resource
    loginSessions.use(server);

    refreshToken.use(server);
};