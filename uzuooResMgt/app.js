/**
 * Created by fungwan on 2015/11/20.
 */

//about odata
var odata = require('node-odata');

var server = odata('mongodb://localhost/UZUOO-WEB-Service');

//about resource
var resource = require('./models/resource');
resource(server);

//server.use();//a middleware for Express
server.listen(3000);