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

routes(app);

app.listen(8000);

module.exports = app;