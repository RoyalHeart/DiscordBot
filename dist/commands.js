import crypto from './commands/crypto.js';
import gif from './commands/gif.js';
import help from './commands/help.js';
import hi from './commands/hi.js';
import quote from './commands/quote.js';
import weather from './commands/weather.js';
import yt from './commands/yt.js';
import { log } from './mongodb.js';
const commands = { help, hi, quote, gif, weather, yt, crypto };
export default async function (msg) {
    const tokens = msg.content.split(' ');
    const command = tokens.shift(); // remove first token from tokens
    if (command) {
        if (command.charAt(0) === '!') {
            try {
                log(msg.member?.displayName, command.substring(1));
            }
            catch (error) {
                console.log('> error: ', error);
            }
            console.log('> command', msg.content);
            if (command.substring(1) in commands) {
                commands[command.substring(1)](msg, tokens);
            }
        }
    }
}
//# sourceMappingURL=commands.js.map