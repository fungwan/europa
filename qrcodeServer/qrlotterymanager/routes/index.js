var express = require('express');
var router = express.Router();
var lottery = require('../lottery/index');

router.post('/generate',lottery.generateLottery);
router.post('/check',lottery.check);
router.post('/progress',lottery.getLotteryProgress);
router.post('/start',lottery.start);
router.post('/stop',lottery.stop);
router.post('/syncrule',lottery.updaterule);

module.exports = router;