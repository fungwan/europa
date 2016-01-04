/**
 * Created by fungwan on 2015/12/9.
 */

var tokenMgt = require('./tokenMgt');
var request = require('./requestForGo');
var jsonConvert = require('../../lib/jsonFormat.js');
var async = require('async');

var _token = '';
//tokenMgt.getToken(function(err,token){
//    if(err === null){
//        console.log('token:' + token);
//        _token = token;
//    }
//});


//tokenMgt.getToken(function(err,token){
//    if(err === null){
//        console.log(token);
//    }
//});


var token = '1eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0NTQ0ODY4NTMsImlkIjoiZjM2NzMwNzUtOWY1Ni00NWFmLTkwOGQtYjJhMWYzYjVlNmI5IiwidHlwZSI6ImFwcGxpY2F0aW9uIn0.VR7SIti0m79D4z7BEQkOj5Kkxl5HpoGjl1Xy731EXYM';
//var token = 'fdsafasfad';
//获取工人信息
var path = '/v1/workers?'+'accessToken=' + _token + '&filter=all';//+'&limit=10&offset=0';//verified::0

//获取业主信息
var path2 = '/v1/houseOwners?'+'accessToken=' + token + '&filter='+'all';//+'&limit=10&offset=0';

var optionItem = {};
optionItem['path'] = path;

var optionItem1 = {};
optionItem1['path'] = path2;


var regionsPath = '/v1/workers/roles?'+'accessToken=' + token;
var regionsItem = {};
regionsItem['path'] = regionsPath;

//通过国家Get所有省份
request.get(regionsItem,function(err,data){
    console.log(err);
    console.log(data);
    if(err){
        return;
    }
    var rolesArray = jsonConvert.stringToJson(data);
    console.log(rolesArray);

});


var tokenOptionItem = {};
tokenOptionItem['path'] = '/v1/applications/' + 'f4db49f7-3e49-403a-8beb-980498607fcf' + '/accessToken';

var challengeInfo = JSON.stringify({
    'grant_type':'refresh_token',
    'refresh_token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0NTQ0ODY4NTMsImlkIjoiZjM2NzMwNzUtOWY1Ni00NWFmLTkwOGQtYjJhMWYzYjVlNmI5IiwidHlwZSI6ImFwcGxpY2F0aW9uIn0.VR7SIti0m79D4z7BEQkOj5Kkxl5HpoGjl1Xy731EXYx'
});

//request.post(tokenOptionItem,challengeInfo,function(err,results) {
//    if (err !== null) {
//        cb(err, false);
//    } else {
//        console.log(results);
//    }
//});

var accountID = 'f20ac872-2ef1-4663-bbf9-a709602f90a2';


//更新工人名字 ok
var postPath = '/v1/workers/' + accountID +'/name?accessToken=' + token ;
var optionItem2 = {};
optionItem2['path'] = postPath;

var content = {};

content.first_name = '冯';
content.last_name = '云';

var bodyString = JSON.stringify(content);



//更新工人角色 OK
var postPath2 = '/v1/workers/' + accountID +'/roles?accessToken=' + token ;
var optionItem3 = {};
optionItem3['path'] = postPath2;

var content2 = {
    roles:[
        {
            role_id:'R-001',
            crafts:['C-001','C-002']
        }
    ]
};

var bodyString2 = JSON.stringify(content2);



//更新工人地址 OK
var postPath3 = '/v1/workers/' + accountID +'/address?accessToken=' + token ;
var optionItem4 = {};
optionItem4['path'] = postPath3;

var content3 = {
    address:'成都',//经纬度没填会报错吗？
    latitude:1.0,
    longitude:2.0
};

var bodyString3 = JSON.stringify(content3);

//request.post(optionItem4,bodyString3,function(err,data){
//
//    if(err){
//        console.log(err);
//    }else{
//        console.log(data);
//    }
//});

//通知工人
var postPath4 = '/v1/workers/' + accountID +'/notifications?accessToken=' + token ;
var optionItem5 = {};
optionItem5['path'] = postPath4;

var content4 = {
    type:'System notification ID',
    brief:'hehe',
    content:'恭喜您，注册成功',
    account_id:accountID
};

var bodyString4 = JSON.stringify(content4);


//通知工人
var fengyunId = 'a4789e6f-dab4-40a4-a8bd-745e9a85fa92';
var postPath5 = '/v1/workers/' + fengyunId +'/verification?accessToken=' + token ;
var optionItem6 = {};
optionItem6['path'] = postPath5;

var content5 = {
    first_name:'张',
    last_name:'国荣',
    id_card_no:'3232',
    verify_photo:'fdasfsd'
};

var bodyString5 = JSON.stringify(content5);

//request.post(optionItem6,bodyString5,function(err,data){
//
//    if(err){
//        console.log(err);
//    }else{
//        console.log(data);
//    }
//});



/*request.get(optionItem,function(err,data){

 if(err){

 console.log(err);

 }else{

 console.log(data);

 var workerArray = jsonConvert.stringToJson(data)['workers'];//包含每一个工人的信息 ok
 var workerArrayEx = [];

 var counts = 0;
 for(x in workerArray){

 var workerItemObj = workerArray[x];
 async.parallel([
 //找施工区域
 function(cb) {
 var regionsIdArray = workerArray[x]['regions'];

 var regionsPath = '/v1/countries/001/administrativeDivision?'+'accessToken=' + token;
 var regionsItem = {};
 regionsItem['path'] = regionsPath;

 //通过国家Get所有省份
 request.get(regionsItem,function(err,data){

 if(err !== null){
 cb(err,[]);
 return;
 }

 //取到省份组，并遍历省份组
 var provincesArray = jsonConvert.stringToJson(data)['provinces'];
 for(y in provincesArray){

 //取到城市组，并遍历城市组
 var citiesArray = provincesArray[y]['cities'];
 for(z in citiesArray){

 //取到区域组
 var regionsArray = citiesArray[z]['regions'];

 //遍历区域组,根据对应id找到相应区域

 var regionsNameArray = [];
 for(index in regionsArray){
 if(regionsIdArray.indexOf(regionsArray[index]['id'] ) > -1){

 regionsNameArray.push(regionsArray[index]['name']);
 }
 }
 }
 }

 cb(null,regionsNameArray);

 });
 },

 //找到工人对应角色
 function(cb) {
 //取到角色组,它里面为对象数组
 var categoriesObjArray = workerArray[x]['categories'];
 var categoriesArray = [];
 for(h in categoriesObjArray){
 var tempId = categoriesObjArray[h]['role_id'];
 categoriesArray.push(tempId);
 }
 var roleArray = [];
 var rolePath = '/v1/workers/roles?'+'accessToken=' + token;

 var roleItem = {};
 roleItem['path'] = rolePath;

 //获取所有角色组
 request.get(roleItem,function(err,data){
 if(err !== null){
 cb(err,[]);
 return;
 }

 var array = jsonConvert.stringToJson(data)['roles'];//包含所有角色信息
 for(x in array){
 var roleItem = array[x];

 var id = roleItem['id'];
 if(categoriesArray.indexOf(id)>-1){//存在
 roleArray.push(roleItem['name']);
 }
 }

 cb(null,roleArray);
 });
 },
 //找到工人对应全名
 function(cb){

 }
 ], function (err, results) {
 ++counts;
 if(!err) {
 var regionsArray = results[0];
 var rolesArray = results[1];
 workerItemObj['regionsValuesArray'] = regionsArray;
 workerItemObj['rolesValuesArray'] = rolesArray;
 //将每一项整理好的worker再push到worksArray
 workerArrayEx.push(workerItemObj);
 if(counts === workerArray.length){
 console.log(workerArrayEx);
 }

 }else{
 console.error('err: ', err);
 }

 });

 }
 }
 });*/