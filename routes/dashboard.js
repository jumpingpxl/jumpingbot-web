const express = require("express");
const router = express.Router();

const client = require("../modules/authclient.js");
const redis = require("../modules/redisclient.js");

const config = require("../config.json");

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
      config: config,
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

router.get("/link", (req, res) => {
  console.log(req);
  const guildId = req.query.guild_id;
  if (!guildId) {
    res.redirect("/dashboard");
    return;
  }

  res.redirect("/dashboard/guild/" + guildId);
});

router.post("/load/guilds", async (req, res) => {
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
        console.log("test " + response[1].toString());
        response.forEach((guild) => {
          let perm = guild.permissions;
          perm = perm | 0x20;
          if (perm === -1) {
            guilds.push(guild);
          }
        });
      }

      if (error) {
        res.json({ error: error.toString() });
      } else {
        guilds.sort(function (a, b) {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });

        res.cookie("discordGuilds", guilds, {
          httpOnly: true,
          maxAge: 1000 * 30,
        });

        res.json({ guilds: guilds });
      }
    });
});

router.post("/load/guild/:guildId", async (req, res) => {
  const guildId = req.params.guildId;
  const guildCache = req.cookies["discordGuilds"];
  if (!guildCache) {
    res.json({ error: "Guild Information could not be loaded." });
    return;
  }

  let isInCache = false;
  guildCache.forEach((guild) => {
    if (guild.id === guildId) {
      isInCache = true;
    }
  });

  if (!isInCache) {
    res.json({ error: "Guild Information could not be loaded." });
    return;
  }

  const redisAnswer = await redis.getGuild(guildId);
  res.json(redisAnswer);
});

module.exports = router;
