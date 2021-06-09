const express = require("express");
const router = express.Router();

const client = require("../modules/authclient.js");
const redis = require("../modules/redisclient.js");

router.get("/", function (req, res, next) {
  const authToken = req.cookies["discordAuthToken"];
  if (!authToken) {
    res.redirect(
      "/login?error=You Have to be Logged in to View the Dashboard!"
    );
  } else {
    let guilds = [];
    const guildCache = req.cookies["discordGuilds"];
    if (guildCache) {
      guilds = guildCache;
    }

    res.render("layout", {
      req: req,
      body: "dashboard",
      title: "Dashboard",
      guilds: guilds,
    });
  }
});

router.get("/guild/:guildId", (req, res) => {
  const guildId = req.params.guildId;
  if (!guildId) {
    res.redirect("/dashboard");
    return;
  }

  console.log(guildId);
  res.json({ guildID: guildId });
});

router.post("/load/guilds", (req, res) => {
  const guildCache = req.cookies["discordGuilds"];
  if (guildCache) {
    res.json({ guilds: guildCache });
    return;
  }

  let error;
  const authToken = req.cookies["discordAuthToken"];
  client
    .getGuilds(authToken)
    .catch((err) => {
      error = err;
    })
    .then((response) => {
    let guilds = [];
    if (!error) {
      try {
        response.forEach(guild => {
          let perm = guild.permissions;
          perm = perm | 0x20;
          if (perm === -1) {
            guilds.push(guild);
          }
        });
      } catch (err) {
        error = err;
      }
    }

      if (error) {
        res.json({ error: error.toString() });
      } else {
        res.cookie("discordGuilds", guilds, {
          httpOnly: true,
          maxAge: 1000 * 30,
        });

        res.json({ guilds: guilds });
      }
    });
});

module.exports = router;
