/**
 * Created by ivan on 15/12/21.
 */
var config = require('../../config');
var redis = require('redis');

var client = redis.createClient(config.redis.port,config.redis.host);
client.auth(config.redis.auth);

exports = module.exports = client;