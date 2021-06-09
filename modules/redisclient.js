const config = require("../config.json");
const Redis = require("redis");
const redis = Redis.createClient({
  password: config.redis.password,
});

redis.on("error", function (error) {
  console.log(error);
});

const GUILD_IDENTIFIER = "Guild";

class Client {
  getRedis() {
    return redis;
  }

  guildExists(guild) {
    return new Promise((resolve, reject) => {
      redis.exists(GUILD_IDENTIFIER + guild, (cb) => resolve(cb));
    });
  }

  getGuild(guildId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        redis.get("Guild:" + guildId, (err, value) => {
          if (err) {
            reject(err);
          } else {
            resolve(value);
          }
        });
      }, 2000);
    });
  }
}

module.exports = new Client();
