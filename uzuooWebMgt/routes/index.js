var viewRrouter = require('./viewrouter');
var apiRouter = require('./apirouter');


module.exports = function(app,acl) {

    viewRrouter(app,acl);
    apiRouter.initAcl(acl);
    app.use('/api', apiRouter);
    
};