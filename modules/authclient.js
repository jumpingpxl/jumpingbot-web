const fetch = require("node-fetch");
const config = require('../config.json');

const API = "https://discord.com/api/v8";
const Token = require("./authclient/token.js");
const User = require("./authclient/user.js");
const Guild = require("./authclient/guild.js");

class Client {
  /**
   * Create Oauth2 client
   * @param {Object} options
   * @param {String} options.clientID
   * @param {String} options.clientSecret
   * @param {Array} options.scopes
   * @param {String} options.redirectURI
   */
  constructor(options) {
    this._clientID = options.clientID;
    this._clientSecret = options.clientSecret;
    this.scopes = options.scopes;
    this.redirectURI = options.redirectURI;
  }

  getInvite() {
    return `https://discord.com/oauth2/authorize?client_id=${this._clientID}&response_type=code&redirect_uri=${this.redirectURI}&scope=${this.scopes.join(" ")}`
  }

  /**
   * Get Oauth2 access token
   * @param {String} code
   * @returns {Promise<Token>}
   */
  getAccessToken(code) {
    return new Promise((resolve, reject) => {
      fetch(`${API}/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this._clientID,
          client_secret: this._clientSecret,
          grant_type: "authorization_code",
          code: code,
          redirect_uri: this.redirectURI,
          scope: this.scopes.join(" "),
        }),
      })
        .then(async (response) => {
          let body = await response.json();
          if (response.status < 200 || response.status > 299)
            reject(new Error(body.error));
          else resolve(new Token(body));
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Get user with Oauth2 access token
   * @param {String} accessToken
   * @returns {Promise<User>}
   */
  getUser(accessToken) {
    return new Promise((resolve, reject) => {
      fetch(`${API}/users/@me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then(async (response) => {
          let body = await response.json();
          if (response.status < 200 || response.status > 299)
            reject(new Error(body.message));
          else resolve(new User(body));
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Get user guilds with Oauth2 access token
   * @param {String} accessToken
   * @returns {Promise<Array<Guild>>}
   */
  getGuilds(accessToken) {
    return new Promise((resolve, reject) => {
      fetch(`${API}/users/@me/guilds`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
        .then(async (response) => {
          let body = await response.json();
          if (response.status < 200 || response.status > 299)
            reject(new Error(body.message));
          let guilds = [];
          body.forEach((guild) => {
            guilds.push(new Guild(guild));
          });
          resolve(guilds);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Refresh Oauth2 access token
   * @param {String} refreshToken
   * @returns {Promise<Token>}
   */
  refreshToken(refreshToken) {
    return new Promise((resolve, reject) => {
      fetch(`${API}/oauth2/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this._clientID,
          client_secret: this._clientSecret,
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          redirect_uri: this.redirectURI,
          scope: this.scopes.join(" "),
        }),
      })
        .then(async (response) => {
          let body = await response.json();
          if (response.status < 200 || response.status > 299)
            reject(new Error(body.error));
          else resolve(new Token(body));
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Revoke Oauth2 access token
   * @param {String} token
   * @returns {Promise<Token>}
   */
  revokeToken(token) {
    return new Promise((resolve, reject) => {
      fetch(`${API}/oauth2/token/revoke`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: this._clientID,
          client_secret: this._clientSecret,
          token: token
        }),
      })
        .then(async (response) => {
          let body = await response.json();
          if (response.status < 200 || response.status > 299)
            reject(new Error(body.error));
          else resolve(new Token({
            access_token: null,
            refresh_token: null,
            expires_in: null,
            scope: this.scopes.join(" "),
            token_type: 'Bearer'
          }));
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

module.exports = new Client({
  clientSecret: config.discord.clientSecret,
  clientID: config.discord.clientId,
  scopes: config.discord.scopes,
  redirectURI: config.discord.redirectUri
/*  clientSecret: "pb38cEjzAUa5LMVtzl1NVoZBdYv8Kt3Z",
  clientID: "839890553168461864",
  scopes: ["identify", "guilds"],
  redirectURI: "http://localhost:3000/login/success" */
})
