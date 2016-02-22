/**
 * Created by Administrator on 2015/11/19.
 */
var settings = require('../conf/settings').mongodb,
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;
module.exports = new Db(settings.db, new Server(settings.host, settings.port),
    {safe: true});