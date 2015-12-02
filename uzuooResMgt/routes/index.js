/**
 * Created by fengyun on 2015/8/20.
 *
 * setting routes
 *
 */

var db = require('../models/db');

module.exports = function(app) {

//    app.delete('/v1/users',
//        function(req, res){
//
//            var model = db.getDataModel('users');
//            model.remove({"uuid": req.query.uuid},function(err, data) {
//                if(err === null){
//                    res.sendStatus(200);
//
//                }else{
//                    res.status(500).send('Internal Server Error');
//                }
//
//            });
//        }
//    );

//    app.put('/v1/users',
//        function(req, res){
//
//            var model = db.getDataModel('users');
//            model.update({"uuid": req.query.uuid},function(err, data) {
//                if(err === null){
//                    res.sendStatus(200);
//
//                }else{
//                    res.status(500).send('Internal Server Error');
//                }
//
//            });
//        }
//    );

};