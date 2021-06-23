var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
  res.render("layout", {
    req: req,
    title: "Home",
    body: "index"
  });
});

module.exports = router;
