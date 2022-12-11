require('dotenv').config();

const help = require('./commands/help.js');
const hi = require('./commands/hi.js');
const gif = require('./commands/gif.js');
const quote = require('./commands/quote.js');
const weather = require('./commands/weather.js');
const yt = require('./commands/yt.js');
const crypto = require('./commands/crypto.js');
const commands = {help, hi, quote, gif, weather, yt, crypto};

module.exports = async function (msg) {
  console.log(msg.content);
  const tokens = msg.content.split(' ');
  const command = tokens.shift(); // remove first token from tokens
  if (command.charAt(0) === '!') {
    if (command.substring(1) in commands) {
      commands[command.substring(1)](msg, tokens);
    }
  }
};
