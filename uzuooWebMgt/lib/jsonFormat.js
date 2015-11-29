/**
 * Created by fungwan on 2015/11/22.
 */

var logger = require('../lib/log.js').logger;


exports.jsonToString = function(jsonObj){
    var str;
    try {
        str = JSON.stringify(jsonObj);
    }catch (err){
        logger.error('jsonFormat - json to string error!');
        return null;
    }
    return str;
};

exports.stringToJson = function(str){
    var jsonObj;
    try {
        jsonObj = JSON.parse(str);
    }catch (err){
        logger.error('jsonFormat - string to json error: ' + str);
        return null;
    }
    return jsonObj;
};
