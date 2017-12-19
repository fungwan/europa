/**
 * Created by ivan on 2015/11/3.
 */
var query = require("../lib/mysql.js");
var md5 = require('../lib/md5');
var sha1  = require('sha1');
var config = require('../config');

exports.short = function (req, res, next){
    var orig_url = req.body.url;
    var url_sha1 = sha1(orig_url);

    //check if it exists
    query("select * from url where sha1='"+url_sha1+"'", function(err,vals,fields) {
        if(err){
            //TODO: ERROR HANDLER
        }
        else{
            if(vals.length>1 || vals.length<0 ){
                //TODO: SHOULD LOG THIS ERROR
            }
            else if(vals.length == 1){
                //TODO: SEND OUT THE SHORT URL AND UPDATE THE CLICK COLUMN
                res.send(vals[0].surl);
                updateClick(vals[0].id);
            }
            else if(vals.length == 0){
                //TODO: CREATE A SHORT URL AND SEND OUT
                var url_md5 = md5(orig_url+config.salt,16);
                //check if the md5 exists
                query("select * from url where ID='"+url_md5+"'", function(err,vals,fields) {
                    if (err) {
                        //TODO: ERROR HANDLER;
                    }
                    else {
                        if(vals.length>0){
                            url_md5 = md5(orig_url+config.salt+conifg.salt,16);
                        }
                    }
                });
                //Prepare the data
                var url_short = config.surlPrefix+url_md5;
                query("insert into url values ('"+url_md5+"','"+url_sha1+"','"+orig_url+"','"+url_short+"',0, now(), now())", function(err, vals, fields) {
                    if(err){
                        res.send(err);
                    }
                    else{
                        res.send("successful!");
                    }
                });
            }
        }
    });
}

exports.revert =  function(req, res, next){
    res.send(req.params.id);
}

function updateClick(ID) {
    query("update url set click=click+1 where id='"+ID+"'", function(err,vals,fields) {
        if(err){

        }
        else {

        }
    });
}
