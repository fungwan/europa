/**
 * Created by Administrator on 2015/11/22.
 */

var request = require('./request.js');
var jsonConvert = require('../lib/jsonFormat.js');
var settings = require('../conf/settings');
var async = require('async');
var connectAddr = "http://" + settings.bgMgtIpAddr + ':' + settings.bgMgtPortAddr;

exports.getProcess = function(req,res){

    res.render('background_users.ejs',
        {
            userInfo:req.session.user
        });
};

exports.createAccount = function(req,res,acl){

    var content = req.body;

    var bodyString = JSON.stringify(content);

    var optionItem = {};
    optionItem['path'] = '/users';

    request.post(optionItem,bodyString,function(err,results){
        if(err === null){

            var newUserInfo = JSON.parse(results);
            var userId = newUserInfo['id'];

            acl.addUserRoles(userId, String(content['role']),function(err){
                if(err){
                    console.log(err);
                }
            });


            res.json({ result: 'success',
                content:results});

        }else{
            res.json({ result: 'fail',
                content:err});
        }
    });
};

exports.delUsersById = function(req,res,acl){

    var idArray = req.body.ids;
    async.map(idArray, function(item, callback) {

        var delIdPath = '/users(' + item + ')';

        acl.userRoles(item,function(err, roles){
            if(err){
                console.log('获取当前用户角色出错...' + err);
            }else{
                acl.removeUserRoles( item, roles, function(err){
                    if(err){
                        console.log('删除当前用户角色出错...' + err);
                    }
                } )
            }
        });

        var optionItem = {};
        optionItem['path'] = delIdPath;
        request.del(optionItem,callback);

    }, function(err,results) {
        if(err !== null){
            res.json({
                    result: 'fail',
                    content:err}
            );
        }else{
            res.json({
                    result: 'success',
                    content: 'ok'}
            );
        }
    });
};

exports.updateUserById = function(req,res,acl){

    var content = req.body.content;
    var userId = req.body.id;
    var putPath = '/users(' + req.body.id + ')';

    var bodyString = JSON.stringify(content);

    var optionItem = {};
    optionItem['path'] = putPath;

    request.put(optionItem,bodyString,function(err,results){
        if(err === null){

            acl.userRoles(userId,function(err, roles){
                if(err){
                    console.log('获取当前用户角色出错...' + err);
                }else{
                    acl.removeUserRoles( userId, roles, function(err){
                        if(err){
                            console.log('删除当前用户角色出错...' + err);
                        }else{
                            acl.addUserRoles(userId,String(content.role),function(err){});
                        }
                    } )
                }
            });

            res.json({ result: 'success',
                content:results});
        }else{
            res.json({ result: 'fail',
                content:err});
        }
    });
};

exports.updateUserPWById = function(req,res){

    var content = req.body.content;
    var oldPW = content.oldPW;

    async.auto({
        judge_pw:function(callback){

            var options = connectAddr + '/users(' + req.body.id + ')' ;
            request.get(options,callback);
        },
        update_PW : ['judge_pw',function(callback, results){

            var jsonObj = jsonConvert.stringToJson(results.judge_pw);
            var pw_db = jsonObj['password'];
            if(oldPW !== pw_db){

                callback('old_pw_error','old_pw_error');

            }else{
                var putPath = '/users(' + req.body.id + ')';

                var afterData = {
                    password : content.newPW
                }
                var bodyString = JSON.stringify(afterData);
                var optionItem = {};
                optionItem['path'] = putPath;

                request.put(optionItem,bodyString,callback);
            }

        }]
    },function(err,results){
        if(err !== null){
            res.json({
                result: 'fail',
                content:err});
        }else{
            res.json({
                result: 'success',
                content:'密码更新成功'});
        }
    });
};

exports.findUsersByPage = function(req,res){

    var currPage = req.query.page - 1;
    var cityStr = req.session.user.city;
    async.auto(
        {
            get_all: function (callback) {

                var options = '';
                if(req.session.user.role == 99){
                    options = connectAddr + '/users?$count=true';
                }else{
                    options = connectAddr + '/users?$filter=city eq \''+ cityStr +'\'&$count=true';
                }

                request.get(options,callback);
            },
            get_currPage: function (callback) {

                var skipValue = currPage * 10;
                var options = ''
                if(req.session.user.role == 99){
                    options = connectAddr + '/users?$top=10&$skip=' + skipValue;//
                }else{
                    options = connectAddr + '/users?$filter=city eq \''+ cityStr +'\'&$top=10&$skip=' + skipValue;//
                }
                request.get(options,callback);
            }
        },
        function(err, results) {
            if(err !== null){
                res.json({ result: 'fail',
                    content:err});
            }else{


                var allUserCounts = jsonConvert.stringToJson(results.get_all)['@odata.count'];

                //get product list
                var pageCounts = 1;
                if(allUserCounts > 0){
                    var over = (allUserCounts) % 10;
                    over > 0 ? pageCounts = parseInt((allUserCounts) / 10) + 1 :  pageCounts = parseInt((allUserCounts) / 10) ;
                }

                //第一页用户数组
                var userArray = jsonConvert.stringToJson(results.get_currPage)['value'];

                res.json({
                        result: 'success',
                        pages:pageCounts,
                        content:userArray}
                );
            }
        }
    );
};

exports.findUserByName = function(req,res){

    var username = req.query.username;
    var options = connectAddr + '/users?$filter=username eq ' + '\'' + username + '\'' ;

    request.get(options,function(err,results){
        if(err === null){
            var jsonObj = jsonConvert.stringToJson(results);
            var array = jsonObj['value'];
            if(array.length === 0){
                //no user in db
                res.json({ result: 'success',
                    content:''});
            }else{

                res.json({ result: 'fail',
                    content:'user has been exist...'});
            }
        }else{
            res.json({ result: 'fail',
                content:err});
        }
    });

};

exports.findUserById = function(req,res){

    var userId = req.query.id;
    var options = connectAddr + '/users(' + userId + ')' ;

    request.get(options,function(err,results){
        if(err === null){
            var jsonObj = jsonConvert.stringToJson(results);
            if(jsonObj === null){
                res.json({ result: 'fail',
                    content:results});
                return;
            }
            res.json({ result: 'success',
                content:jsonObj});
        }else{
            res.json({ result: 'fail',
                content:err});
        }
    });

};