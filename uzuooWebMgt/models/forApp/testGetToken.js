/**
 * Created by fungwan on 2015/12/9.
 */

var tokenMgt = require('./tokenMgt');
var request = require('./requestForGo');

//var _token = '';
//tokenMgt.getToken(function(err,token){
//    if(err === null){
//        console.log(token);
//        _token = token;
//    }
//});


//tokenMgt.getToken(function(err,token){
//    if(err === null){
//        console.log(token);
//    }
//});


var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0NTI4MzEyNjcsImlkIjoiZjM2NzMwNzUtOWY1Ni00NWFmLTkwOGQtYjJhMWYzYjVlNmI5IiwidHlwZSI6ImFwcGxpY2F0aW9uIn0.-2JwV6rwBnawXcsKkxIJlCoGRt5qijDfuNIKGS26dAA';

//获取工人信息
var path = '/v1/workers?'+'accessToken=' + token + '&filter='+'all'+'&limit=10&offset=0';

//获取业主信息
var path2 = '/v1/houseOwners?'+'accessToken=' + token + '&filter='+'all'+'&limit=10&offset=0';

var optionItem = {};
optionItem['path'] = path;

var optionItem1 = {};
optionItem1['path'] = path2;

request.get(optionItem,function(err,data){

    if(err){
        console.log(err);
    }else{
        console.log(data);
    }
});

var accountID = '52cc3909-19cc-48a9-886e-6fa6492b340f';


//更新工人名字
var postPath = '/v1/workers/' + accountID +'/name?accessToken=' + token ;
var optionItem2 = {};
optionItem2['path'] = postPath;

var content = {};

content.first_name = '冯';
content.last_name = '云';

var bodyString = JSON.stringify(content);



//更新工人角色
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



//更新工人地址
var postPath3 = '/v1/workers/' + accountID +'/address?accessToken=' + token ;
var optionItem4 = {};
optionItem4['path'] = postPath3;

var content3 = {
    address:'成都'//经纬度没填会报错吗？
};

var bodyString3 = JSON.stringify(content3);



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

request.post(optionItem5,bodyString4,function(err,data){

    if(err){
        console.log(err);
    }else{
        console.log(data);
    }
});