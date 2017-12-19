var express = require('express');
var router = express.Router();
var url = require('../controllers/url');

/* GET home page. */
router.get('/:id', url.revert);
router.post('/', url.short);

module.exports = router;
