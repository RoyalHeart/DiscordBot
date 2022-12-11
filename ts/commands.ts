import crypto from './commands/crypto.js';
import gif from './commands/gif.js';
import help from './commands/help.js';
import hi from './commands/hi.js';
import quote from './commands/quote.js';
import weather from './commands/weather.js';
import yt from './commands/yt.js';
const commands = {help, hi, quote, gif, weather, yt, crypto};

export default async function (msg: {content: string}) {
  console.log(msg.content);
  const tokens = msg.content.split(' ');
  const command = tokens.shift(); // remove first token from tokens
  if (command) {
    if (command.charAt(0) === '!') {
      if (command.substring(1) in commands) {
        (commands as any)[command.substring(1)](msg, tokens);
      }
    }
  }
}
