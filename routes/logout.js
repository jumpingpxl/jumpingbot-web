const express = require('express');
const router = express.Router();

router.get('/', function (req, res, next) {
  res.clearCookie('discordAuthToken');

  res.redirect('/login');
});

module.exports = router;
