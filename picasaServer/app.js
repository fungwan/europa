/**
 * Created by Administrator on 2015/12/15.
 */
var express = require('express');
var path = require('path');
var app = express();
var routes = require('./routes');
var bodyParser = require('body-parser');
var ejs = require('ejs');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
//app.set('view engine', 'ejs');
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

routes(app);

app.listen(8000);

module.exports = app;