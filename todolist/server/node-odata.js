/**
 * Created by fungwan on 2015/11/20.
 */

//about odata
var odata = require('node-odata');
var path = require('path');
var express = require('express');
var server = odata('mongodb://localhost/my-app');
odata.resources = server.resources
//about db interface
var db = require('./models/db');
db.setupDb(server._db);

server.use(require("./models/tokenMgt").authorization);
server.use('/', express.static(path.join(__dirname, 'public')));

server.set('prefix','/api');
server.set('jwtTokenSecret','fungwan_todolist');

//about resource
var resource = require('./models/resource');
resource(server);

//about function
var action = require('./models/action');
action(server);

var routes = require('./routes/index');
routes(server._app);

// Additional middleware which will set headers that we need on each request.
server.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

//server.use();//a middleware for Express
server.listen(3000,function(){
    console.log('Todolist server has been started...');
    //fill data
    /*var data = require("./users.json");
    var model = server._db.model('users');
    model.remove({}, function(err, result) {
        data.map(function(item) {
            var entity = new model(item);
            entity.save();
        });
    });*/
});