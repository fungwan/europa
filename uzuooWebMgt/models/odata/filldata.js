/**
 * Created by Administrator on 2015/12/4.
 */
var http = require('http');

var body = {
    "username" : "admin",
    "password" : "e1f1ee0cfcbb93ea2ffe9e44df18395c",
    "role":"4"
};

var bodyString = JSON.stringify(body);

var options = {
    host: 'localhost',
    port:'3000',
    path: '/users',
    method: 'POST',
    headers: {
        'Accept': '/',
        'Content-Type':'application/json',
        'Content-Length': bodyString.length
    }
};

var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(data) {
        console.log(data);
    });

    res.on('err',function(data){
        console.log(data);
    });
});

//to post
req.write(bodyString);
console.log(bodyString);
req.end();