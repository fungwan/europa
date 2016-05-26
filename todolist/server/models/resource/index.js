/**
 * Created by Administrator on 2015/11/22.
 */

var users = require('./users');
//var logs = require('./logs');
var tasks = require('./tasks');
var tokens = require('./tokens');
module.exports = function(server){

    //register resource
    users.use(server);
    tokens.use(server);
    tasks.use(server);
};