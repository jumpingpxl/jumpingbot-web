const config = require("../config.json");
const Redis = require("redis");
let redis;
if(config.redis) {
  redis = Redis.createClient({
    password: config.redis.password
  });
} else {
  redis = Redis.createClient();
}

redis.on("error", function (error) {
  console.log(error);
});

const GUILD_IDENTIFIER = "Guild";

class Client {
  guildExists(guild) {
    return new Promise((resolve, reject) => {
      redis.exists(GUILD_IDENTIFIER + guild, (cb) => resolve(cb));
    });
  }
}

module.exports = new Client();
