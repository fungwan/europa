/**
 * Created by ivan on 2015/11/3.
 */
var mysql = require('mysql');
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '123123',
    database: 'urls',
    port: 3306
});

var query=function(sql,callback){
    pool.getConnection(function(err,conn){
        if(err){
            callback(err,null,null);
        }else{
            conn.query(sql,function(qerr,vals,fields){
                conn.release();
                callback(qerr,vals,fields);
            });
        }
    });
};

module.exports=query;