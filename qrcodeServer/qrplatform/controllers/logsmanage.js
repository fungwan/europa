var rf = require('fs');
var url = require('url');
var readlines = require("readline");
var basicAuth = require('basic-auth');

var auth = function (req, resp) {
    function unauthorized(resp) {
        resp.set('WWW-Authenticate', 'Basic realm=Input User&Password');
        return resp.sendStatus(401);
    }
    var user = basicAuth(req);
    if (!user || !user.name || !user.pass) {
        return unauthorized(resp);
    }
    if (user.name === 'support' && user.pass === 'Test4Test') {
        return true;
    } else {
        return unauthorized(resp);
    }
}
/**
 * 读取日志 
 * @param req
 *      @param servername
 *      @param year
 *      @param month
 *      @param day
 * url:'../servername/logs/log_year-months-day'
 */
function readLogs(req, res) {

    auth(req, res);
    var params = url.parse(req.url, true).query;//object
    var file_path = '../' + params.servername + '/logs/log_' + params.year + '-' + params.month + '-' + params.day;
    var file_size, file_tmp_size, line_obj, end_line, getLine, last_line, fs;

    var endArray = [], lineCounts = params.readline;
    lineCounts = lineCounts || 1000;

    if (rf.existsSync(file_path)) {
        /*rf.readFile(file_path, 'utf-8',function(err,data){
            res.end(data);
        });*/

        rf.stat(file_path, function (err, stats) {
            file_size = stats.size;
            file_tmp_size = 0;

            getLine = function () {

                if (file_tmp_size == file_size) {
                    return;
                }

                line_obj = readlines.createInterface({
                    input: rf.createReadStream(file_path, { start: file_tmp_size, end: file_size })
                });

                line_obj.on('line', function (line) {
                    endArray.push(line);
                });

                line_obj.on('close', function () {
                    line_obj.close && line_obj.close();
                    if (endArray.length > lineCounts)
                        endArray = endArray.splice(endArray.length - lineCounts, lineCounts);
                    var logData = '';
                    for (var x = 0; x < endArray.length; ++x) {
                        logData += endArray[x] + '\n';
                    }
                    res.end(logData);
                });

            };
            getLine();
        });
    } else {
        res.end('未找到文件，可能无log或参数错误')
    }
}


/**
 * 返回静态html
 */
function rendHtml(req, res) {

    auth(req, res);
    var options = {
        root: './public/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    var fileName = req.path + '.html';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        }
        else {
            console.log('Sent:', fileName);
        }
    });
}

exports.readLogs = readLogs;
exports.rendHtml = rendHtml;