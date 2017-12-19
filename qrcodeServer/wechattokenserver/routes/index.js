var express = require('express');
var manager=require('../controller/tokenmanager');

var router = express.Router();

router.post('/gettoken',manager.gettoken);
router.post('/getwebtoken',manager.getwebtoken);
router.post('/getalltoken',manager.getalltoken);
router.post('/getsign',manager.getsign);
router.post('/getsystoken',manager.getsystoken);

module.exports = router;
