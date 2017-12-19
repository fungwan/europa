var express = require('express');
var router = express.Router();
var billmanager=require('../controllers/billmanager');

/* GET home page. */
router.post('/getbillno', billmanager.getbillno);

module.exports = router;
