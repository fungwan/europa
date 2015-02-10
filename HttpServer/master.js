/**
 * Created by fengyun on 2014/8/6.
 */

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var europa_http_server = require('./app.js');

if (cluster.isMaster) {
    console.log('[master] ' + "start master...");

    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('listening', function (worker, address) {
        console.log('[master] ' + 'listening: worker' + worker.id + ',pid:' + worker.process.pid + ', Address:' + address.address + ":" + address.port);
    });
	
	cluster.on('exit', function(deadWorker, code, signal) {
    // Restart the worker
    var worker = cluster.fork();

    // Note the process IDs
    var newPID = worker.process.pid;
    var oldPID = deadWorker.process.pid;

    // Log the event
    console.log('worker '+oldPID+' died.');
    console.log('worker '+newPID+' born.');
  });

} else if (cluster.isWorker) {
    console.log('[worker] ' + "start worker ..." + cluster.worker.id);
    var port = 7878;
    europa_http_server.listen(port,function(){
    console.log('                        ');
    console.log('                                  _oo0oo_');
    console.log('                                 088888880');
    console.log('                                 88" . "88');
    console.log('                                 (| -_- |)');
    console.log('                                  0\\ = /0');
    console.log('                                  0\\ = /0');
    console.log('                             .\' \\\\|     |// \'.');
    console.log('                            / \\\\|||  :  |||// \\');
    console.log('                           /_ ||||| -:- |||||- \\');
    console.log('                          |   | \\\\\\  -  /// |   |');
    console.log('                          | \_|  \'\'\---/\'\'  |_/ |');
    console.log('                          \  .-\__  \'-\'  __/-.  /');
    console.log('                        ___\'. .\'  /--.--\  \'. .\'___');
    console.log('                     ."" \'<  \'.___\_<|>_/___.\' >\'  "".');
    console.log('                    | | : \'-  \'.;\'\ _ /\';.\'/ - \' : | |');
    console.log('                    \  \ \'_.   \_ __\ /__ _/   .-\' /  /');
    console.log('                =====\'-.____\'.___ \_____/___.-\'____.-\'=====');
    console.log('                                  \'=---=\'');
    console.log('                                           ');
    console.log('              ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
    console.log('                        佛祖保佑    httpServer    永不死机');
    console.log('                        心外无法    fungwan       法外无心');
    console.log('                        ');
    console.info('              Express server have started, and listening on port ' + port);
	});
}