
$(document).ready(function () {
  $.ajax({
    url: "/dashboard/load/guilds",
    method: "POST",
  }).done((body) => {
    const loadingDoc = $("#loading");
    const guildsDoc = $("#guilds");

    const errors = [];
    if (body.error) {
      errors.push(body.error);
    } else if (body.guilds.length === 0) {
      errors.push("No Guild with User Permission MANAGE_SERVER Found!");
    }

    if (errors.length !== 0) {
      errors.forEach((error) => {
        $("<p/>").addClass("flash-error").text(error).insertBefore(loadingDoc);
      });

      loadingDoc.remove();
      guildsDoc.remove();
    } else {
      loadingDoc.remove();
      const defaultIcon =
        "https://discordapp.com/assets/6debd47ed13483642cf09e832ed0bc1b.png";
      body.guilds.forEach((guild) => {
        const guildImage = $("<img/>")
          .addClass("icon")
          .attr(
            "src",
            guild.icon === null
              ? defaultIcon
              : "https://cdn.discordapp.com/icons/" +
                  guild.id +
                  "/" +
                  guild.icon +
                  "." +
                  (guild.icon.startsWith("a_") ? "gif" : "png") +
                  "?size128"
          );
        const guildName = $("<span/>").addClass("name").text(guild.name);

        $.ajax({
          url: "/dashboard/load/guild/" + guild.id,
          method: "POST",
        }).done((guildInfo) => {
          const guildDiv = $("<div/>")
            .addClass("guild")
            .on("click", () => {
              if (guildInfo === null) {
                window.location.href =
                  "https://discord.com/oauth2/authorize?scope=bot&response_type=code&redirect_uri=http://localhost:3000/dashboard/link/&permissions=8&client_id=839890553168461864&guild_id=" +
                  guild.id;
              } else {
                window.location.href = "/dashboard/guild/" + guild.id;
              }
            })
            .append(guildImage)
            .append(guildName);

          if (guildInfo === null) {
            guildDiv.appendTo(guildsDoc);
          } else {
            guildDiv.prependTo(guildsDoc);
          }

          $("<button/>")
            .add("greenButton")
            .addClass("button")
            .addClass(guildInfo === null ? "gray" : "green")
            .attr(
              "href",
              guildInfo === null
                ? "https://discord.com/oauth2/authorize?scope=bot&response_type=code&redirect_uri=http://localhost:3000/dashboard/link/&permissions=8&client_id=839890553168461864&guild_id=" +
                    guild.id
                : "/dashboard/guild/" + guild.id + "/"
            )
            .text(guildInfo === null ? "Set up JumpingBot" : "Open Dashboard")
            .appendTo(guildDiv);
        });
      });
    }
  });
});
