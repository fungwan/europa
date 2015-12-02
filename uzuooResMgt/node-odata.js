/**
 * Created by fungwan on 2015/11/20.
 */

//about odata
var odata = require('node-odata');

var server = odata('mongodb://localhost/UZUOO-WEB-Service');

//about db interface
var db = require('./models/db');
db.setupDb(server._db);

//about resource
var resource = require('./models/resource');
resource(server);

var routes = require('./routes/index');
routes(server._app);

//server.use();//a middleware for Express
server.listen(3000);