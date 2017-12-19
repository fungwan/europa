var router = require('../common/router');
var config = require('../../config');
var controllers = require('../controllers');
var parachecker = require('../models/prmodels');

router.add('/qrcode/gen', controllers.qrcode.gen, parachecker.qrcode.gen, '二维码生成', false);
router.add('/qrcodeNew/gen', controllers.qrcodeNew.gen, parachecker.qrcode.genNew, '二维码生成', false);
module.exports = router.router;
