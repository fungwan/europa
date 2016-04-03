/**
 * Created by Administrator on 2015/12/15.
 */
var express = require('express');
var path = require('path');
var app = express();
var routes = require('./routes');
var bodyParser = require('body-parser');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

routes(app);

app.listen(8000);

module.exports = app;