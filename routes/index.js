var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req);
  res.render('layout', {
    req: req,
    title: 'Home',
    body: 'index',
    stats: {
      userCount: 123,
      uploadCount: 456,
      uploadSize: 3
    }
  });
});

module.exports = router;
