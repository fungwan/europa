/**
 * Created by Administrator on 2015/11/22.
 */

var users = require('./users');

module.exports = function(server){

    //register resource
    users.use(server);
};