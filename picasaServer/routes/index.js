/**
 * Created by Administrator on 2016/2/3.
 */


var sign = require('../models/signature.js');
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty({
    uploadDir: './'
});

module.exports = function(app) {

    app.get('/', function(req, res){
        res.render('index.html','');
    });

    //获取签名
    app.post('/sign', function(req, res){

        var url = req.body.url;

        res.json({
            result: ''});

        /*sign.getSign(url,function(data){

             res.json({
             result: data});

        });*/

    });

    app.post('/upload', multipartyMiddleware,function(req, res){


        var file = req.files.file;
        console.log(file.name);
        console.log(file.type);

        res.send(201);
    });
};