/**
 * Created by fungwan on 2015/12/9.
 */

var tokenMgt = require('./tokenMgt');
var request = require('./requestForGo');

//tokenMgt.getToken(function(err,token){
//    if(err === null){
//        console.log(token);
//    }
//});
//
//tokenMgt.getToken(function(err,token){
//    if(err === null){
//        console.log(token);
//    }
//});

var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0NTI2NzgwNzEsImlkIjoiZjdlY2ViMTQtYTQ1NC00N2MxLWEwMjItYWM3NmQwOTQwOWJjIiwidHlwZSI6ImFwcGxpY2F0aW9uIn0.q39IwS2QaA2GpL8_GkeJ0RPuNve6aktPKJJ0FK_Dbyk';

var path = '/v1/workers?'+'accessToken=' + token + '&filter='+'verified::1';
var optionItem = {};
optionItem['path'] = path;

request.get(optionItem,function(err,data){

    if(err){
        console.log(err);
    }else{
        console.log(data);
    }
});

