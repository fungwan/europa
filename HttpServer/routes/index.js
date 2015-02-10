/* GET home page. */

//var cluster = require('cluster');
var Logon = require('../models/Infrastructure/logon.js'),
    FetchChannels = require('../models/Infrastructure/fetchChannels.js'),
    FetchContent = require('../models/Infrastructure/fetchContent.js'),
    Logoff = require('../models/Infrastructure/logoff.js'),
    CaptureScreenshot = require('../models/Infrastructure/captureScreenshot.js');

var logOn = new Logon();
var fetchChannels = new FetchChannels();
var fetchContent = new FetchContent();
var captureScreenshot = new CaptureScreenshot();
var logoff = new Logoff();

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.logon = function(req, res){
    var macId = req.query.id;
    var _version = req.query.version;
    if(_version == undefined || macId == undefined){
        res.send(404);
    }else{
        logOn.HandleRequest(macId,_version,res);
    }
};

exports.fetchChannels = function(req, res){
    var epgId = req.query.templateId;
    if(epgId == undefined){
        res.send(404);
    }else{
        fetchChannels.HandleRequest(epgId,res);
    }

};

exports.fetchContent = function(req, res){
    var epgId = req.query.templateId;
    var dirId = req.query.directoryId;
    var pgId  = req.query.pageId;
    if(epgId == undefined || dirId == undefined || pgId == undefined){
        res.send(404);
    }else{
        fetchContent.HandleRequest(epgId,dirId,pgId,res);
    }
};

exports.logoff = function(req, res){
    var macId = req.query.id;
    logoff.HandleRequest(macId);

    res.send(200);
};

exports.captureScreenshot = function(req, res){
    captureScreenshot.HandleRequest(req,res);
};