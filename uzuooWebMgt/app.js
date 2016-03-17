var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var settings = require('./conf/settings');
var mongoSettings = settings.mongodb;

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

//var logger = require('./lib/log.js').logger;
var acl = require('acl');
var aclSetting = require('./models/acl_setting');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

app.use(favicon(__dirname + '/public/favicon.ico'));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: mongoSettings.cookieSecret,
    key: mongoSettings.db,//cookie name
    cookie: {maxAge: 1000 * 60 * 60},//1000 * 60 * 60 * 24 * 30 == 30 days,here is half and hour
    store: new MongoStore({
        db: mongoSettings.db,
        host: mongoSettings.host,
        port: mongoSettings.port,
        username:mongoSettings.username,
        password:mongoSettings.password
    }),
    resave: false,
    saveUninitialized: true
}));

var odata = require('node-odata');

var odataServer = odata(mongoSettings.url);//mongodb://username:password@ip:port/dbName

//about resource
var resource = require('./models/odata');
resource(odataServer);

odataServer.listen(settings.bgMgtPortAddr);

var mongodb = require('mongodb');
mongodb.connect(mongoSettings.url, function(error, db) {//mongodb://username:password@ip:port/dbName
    var mongoBackend = new acl.mongodbBackend(db, 'acl_');
    acl = new acl(mongoBackend);

    aclSetting.set(acl);

    routes(app,acl);

/// catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

/// error handlers

// development error handler
// will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            if(err.errorCode === 403){
                res.json({
                    result: 'fail',
                    content:'Permission Denied'});

                return;
            }
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

// production error handler
// no stacktraces leaked to user
    app.use(function(err, req, res, next) {

        if(err.errorCode === 403){
            res.json({
                result: 'fail',
                content:403});

            return;
        }
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });


    app.set('port', settings.webMgtPort);


//var server = app.listen(app.get('port'), function() {
//    console.log('Https server listening on port ' + 8080);
//});

    var https = require('https')
        ,fs = require("fs");

    var options = {
        key: fs.readFileSync('./privatekey.pem'),
        cert: fs.readFileSync('./certificate.pem')
    };

    https.createServer(options, app).listen(app.get('port'), function () {
        console.log('Https server listening on port ' + app.get('port'));
    });

    module.exports = app;

});
