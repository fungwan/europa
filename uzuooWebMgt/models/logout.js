/**
 * Created by Administrator on 2015/11/22.
 */
var jsonConvert = require('../lib/jsonFormat.js');

exports.getProcess = function(req,res){

    req.session.user = null;
    res.redirect('/login');

};