/**
 * Created by Administrator on 2015/12/4.
 */
var http = require('http');

var taskBody = {
    "name": "test",
    "password":"098f6bcd4621d373cade4e832627b4f6"
}

var strToken = '34525192-4cef-4085-b170-35c30789d66e:eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIzNDUyNTE5Mi00Y2VmLTQwODUtYjE3MC0zNWMzMDc4OWQ2NmUiLCJleHAiOjE0NjM3MjI4MjE1NzN9.ZQ3PB565Av-t4hDuysWwGBOa-6Xb16A66PKae7JXw9A';
var buffer = new Buffer(strToken);
var base64Code = buffer.toString('base64');

var taskBodyString = JSON.stringify(taskBody);
console.log(taskBodyString);
var options = {
    host: 'localhost',
    port:'3000',
    path: '/api/tasks',///api/loginSessions
    method: 'GET',
    headers: {
        'Accept': '/',
        'Content-Type':'application/json;text/html',
        'Authorization': 'Bearer ' + base64Code
        //'Content-Length': Buffer.byteLength(taskBodyString, 'utf8')
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

//var jsonStrBuffer = new Buffer(taskBodyString,'utf8');

req.write(taskBodyString );
console.log(taskBodyString);
req.end();