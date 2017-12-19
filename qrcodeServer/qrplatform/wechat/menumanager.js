/**
 * created by xdf on 2017/06/01
 */

var request = require('request');
var moment = require('moment');
var eventproxy = require('eventproxy');

//加载项目内部模块
var logger = require('../common/logger');
var returnData = require('../common/returnData');
var tool = require('../common/tool');
var config = require('../../config');
var redis = require('../common/redis');
var tokenmanager = require('./tokenmanager');
var usermanager = require('./usermanager.js');


function getAccessToken(arg, cb) {
    var req = {
        manual: arg.manual
    };
    tokenmanager.getsystoken(req, function(err, token) {
        if (err) {
            logger.error(config.systemUser, '获取token信息失败!');
            logger.error(config.systemUser, err.stack);
            cb(returnData.createError(err.code, err.message), null);
        } else {
            logger.info(null, '已获取access_token');
            cb(null, token);
        }
    })
}

function getMenuList(arg, cb) {
    var path = config.services.wechat.url + config.services.wechat.interfaces.getmenulist;
    var req = {
        manual: 0
    };

    var ep = new eventproxy();

    //手动获取token
    var count = 0;
    ep.on('manualGetToken', function() {
        logger.info(null, '开始手动获取token');
        if (count <= 2) {
            req.manual = 1;
            count++;
            ep.emit('getaccesstoken', req);
        } else {
            logger.error(null, '获取公众号菜单失败，token失效');
            return cb(returnData.createError('', 'token错误'), null);
        }
    })

    ep.on('getmenulist', function(token) {
        request({
            url: path + token,
            method: 'get'
        }, function(err, data) {
            if (err) {
                logger.error(null, '获取公众号菜单失败');
                return cb(returnData.createError(err.code, err.message), null);
            } else {
                data = JSON.parse(data.body);
                if (data.errcode) {
                    if (data.errcode == '40001') {
                        logger.error(null, 'token失效');
                        ep.emit('manualGetToken');
                    } else {
                        logger.error(null, '获取公众号菜单失败，token错误');
                        return cb(returnData.createError(data, 'token错误'), null);
                    }
                } else {
                    logger.info(null, '获取公众号菜单成功')
                    return cb(null, returnData.createData(data));
                }
            }
        })
    })

    ep.on('getaccesstoken', function(req) {
        getAccessToken(req, function(err, token) {
            if (err) {
                return cb(returnData.createError(err.code, err.message), null);
            } else {
                ep.emit('getmenulist', token);
            }
        })
    })

    ep.emit('getaccesstoken', req);
}

function updateMenuList(arg, cb) {
    var path = config.services.wechat.url + config.services.wechat.interfaces.createmenulist,
        menuinfo = JSON.parse(arg.menuinfo);
    
    var ep = new eventproxy();

    ep.on('updatemenulist', function(token) {
        request({
            url: path + token,
            method: 'post',
            json: true,
            body: menuinfo
        }, function(err, data) {
            if (err) {
                logger.error(null, '更新公众号菜单失败')
                return cb(returnData.createError(err.code, err.message), null);
            } else {
                data = data.body
                if (data.errmsg == 'ok') {
                    logger.info(null, '更新公众号菜单成功')
                    cb(null, returnData.createData(data));
                } else {
                    logger.error(null, '传入微信接口的菜单配置错误：' + data.errmsg);
                    cb(returnData.createError(data.errcode, data.errmsg), null);
                }
            }
        })
    })


    var req = {
        manual: 0
    };
    getAccessToken(req, function(err, token) {
        if (err) {
            return cb(returnData.createError(err.code, err.message), null);
        } else {
            ep.emit('updatemenulist', token);
        }
    })
}



//暴露给内部的菜单更新接口
/**
 * 更新菜单
 * @param arg object {
 *      @param name
 *      @param type click or view
 *      @param data url or key
 *      @param updatetype 1 or 0，1代表新增菜单，0代表删除菜单
 *      @param index 非必需 object {
 *          @param firstIndex
 *          @param subIndex
 *      }
 * }
 * @return callback(res)    res object{
 *                              msg: '',
 *                              content: '',
 *                              type: 'success' or 'error'
 *                          }
 * 
 */
function _updatemenulist(arg, cb) {
    var ep = new eventproxy(),
        getPath = config.services.wechat.url + config.services.wechat.interfaces.getmenulist,
        updatePath = config.services.wechat.url + config.services.wechat.interfaces.createmenulist,
        updatetype = arg.updatetype,
        index = arg.index;

    var res = {
        type: '',
        msg: '',
        content: ''
    };

    function addMenu(menu, token) {
        var option = {
            type: arg.type,
            name: arg.name,
            url: arg.url,
            sub_button: []
        };

        if (index) {
            var fi = index.firstIndex,
                si = index.subIndex;

            if (menu[fi].sub_button.length >= 5) {
                //返回错误
                logger.error(null, '当前设置的一级菜单中二级菜单数量已至上限');
                res = {
                    msg: '当前设置的一级菜单中二级菜单数量已至上限',
                    content: 'sub_menu err',
                    type: 'error'
                };
                cb(res);
            } else {
                menu[fi].sub_button.splice(si, 0, option);
                logger.info(null, '指定位置新增菜单成功，开始向微信接口更新数据');
                ep.emit('updatemenu', menu, token);
            }
        } else {
            //不指定菜单新增位置时，默认加到第二个一级菜单末尾
            if (menu[1].sub_button.length >= 5) {
                //返回错误
                logger.error(null, '第二个一级菜单中二级菜单数量已至上限');
                res = {
                    msg: '第二个一级菜单中二级菜单数量已至上限',
                    content: 'sub_menu err',
                    type: 'error'
                };
                cb(res);
            } else {
                menu[1].sub_button.push(option);
                logger.info(null, '不指定位置新增菜单成功，开始向微信接口更新数据');
                ep.emit('updatemenu', menu, token);
            }
        }
    }

    function deleteMenu(menu, token) {
        var done = false;
        for (var i = 0; i < menu.length; i++) {
            for (var j = 0; j < menu[i].sub_button.length; j++) {
                if (menu[i].sub_button[j].name == arg.name) {
                    done = true;
                    menu[i].sub_button.splice(j, 1);
                    break;
                }
            }
        }
        if (done) {
            logger.info(null, '删除菜单成功，开始向微信接口更新数据');
            ep.emit('updatemenu', menu, token);
        } else {
            logger.error(null, '菜单中没有找到设置的菜单，删除失败');
            res = {
                msg: '菜单中没有找到设置的菜单，删除失败',
                content: 'name err',
                type: 'error'
            };
            cb(res);
        }
    }

    ep.on('updatemenu', function(menu, token) {
        var option = {
            button: menu
        };
        request({
            url: updatePath + token,
            method: 'post',
            json: true,
            body: option
        }, function(err, data) {
            if (err) {
                logger.error(null, '向微信接口更新菜单失败')
                res = {
                    msg: '向微信接口更新菜单失败',
                    content: err,
                    type: 'error'
                };
                cb(res);
            } else {
                data = data.body;
                if (data.errmsg == 'ok') {
                    logger.info(null, '更新公众号菜单成功')
                    res = {
                        msg: '更新公众号菜单成功',
                        content: data,
                        type: 'success'
                    };
                    cb(res);
                } else {
                    logger.error(null, '传入微信接口的菜单配置错误：' + data);
                    res = {
                        msg: '传入微信接口的菜单配置错误',
                        content: data,
                        type: 'error'
                    };
                    cb(res);
                }
            }
        })
    })

    ep.on('handlemenu', function(data, token) {
        var menu = data.menu.button; //array

        if (updatetype == 1) {
            addMenu(menu, token);
        } else if (updatetype == 0) {
            deleteMenu(menu, token);
        } else {
            //报错
            logger.error(null, '内部调用，更新微信菜单传入参数错误');
            res = {
                msg: '传入参数错误',
                content: 'updatetype err',
                type: 'error'
            };
            cb(res);
        }
    })

    ep.on('getmenu', function(token) {
        request({
            url: getPath + token,
            method: 'get'
        }, function(err, data) {
            if (err) {
                logger.error(null, '获取公众号菜单失败');
                res = {
                    msg: '获取公众号菜单失败',
                    content: err,
                    type: 'error'
                }
                cb(res);
            } else {
                if (!!data.errcode || !data.body) {
                    logger.error(null, '获取公众号菜单失败，错误：' + data.errmsg)
                    res = {
                        msg: data.errmsg,
                        content: data.errcode,
                        type: 'error'
                    };
                    cb(res);
                } else {
                    logger.info(null, '获取公众号菜单成功')
                    data = JSON.parse(data.body);
                    ep.emit('handlemenu', data, token);
                }
            }
        })
    })

    var req = {
        manual: 0
    };
    getAccessToken(req, function(err, token) {
        if (err) {
            logger.error(null, '获取access_token错误');
            return res = {
                msg: '获取access_token错误',
                content: err,
                type: 'error'
            }
        } else {
            ep.emit('getmenu', token);
        }
    })
}

exports.getMenuList = getMenuList;
exports.updateMenuList = updateMenuList;
exports._updatemenulist = _updatemenulist;