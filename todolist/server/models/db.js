/**
 * Created by Administrator on 2015/8/20.
 */


var _db;

exports.setupDb = function(db){

    _db = db;

};

exports.getDataModel = function(collectionName){

    if(_db === undefined)
        return null;
    return _db.model(collectionName);

};
