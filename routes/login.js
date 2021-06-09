const express = require("express");
const router = express.Router();
const client = require("../modules/authclient.js");

router.get("/", function (req, res, next) {
  const authToken = req.cookies["discordAuthToken"];
  if (authToken) {
    res.redirect("/dashboard");
    return;
  }

  const directLogin = req.query.directLogin;
  if (directLogin) {
    res.redirect(client.getInvite());
    return;
  }

  res.render("layout", {
    req: req,
    body: "login",
    title: "Login",
    error: req.query.error,
    authClient: client,
  });
});

router.get("/success", (req, res) => {
  const code = req.query.code;
  let error;
  if (!code) {
    error = "No Code Provided!";
  }

  if (!error) {
    client
      .getAccessToken(code)
      .catch((err) => (error = err))
      .then((token) => {
        if (!error) {
          res.cookie("discordAuthToken", token.accessToken, {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7,
          });

          res.redirect("/dashboard");
        } else {
          res.redirect("/login?error=" + error);
        }
      });
  }
});

module.exports = router;
