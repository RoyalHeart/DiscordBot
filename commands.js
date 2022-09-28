require("dotenv").config();

const help = require("./commands/help.js");
const hi = require("./commands/hi.js");
const gif = require("./commands/gif.js");
const quote = require("./commands/quote.js");
const weather = require("./commands/weather.js");
const yt = require("./commands/yt.js");
const commands = { help, hi, quote, gif, weather, yt };

module.exports = async function (msg) {
  console.log(msg.content);
  let tokens = msg.content.split(" ");
  let command = tokens.shift(); // remove first token from tokens
  if (command.charAt(0) === "!") {
    commands[command.substring(1)](msg, tokens);
  }
};
