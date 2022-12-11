import { Client } from 'discord.js';
import * as dotenv from 'dotenv';
import commandHandler from './commands.js';
dotenv.config();
const token = process.env.TOKEN;
const client = new Client();
export default function deploy() {
    console.log('running bot');
    try {
        client.login(token);
        client.on('ready', () => {
            if (client.user)
                console.log(`Logged in as ${client.user.tag}`);
            // let channel;
            // async function test() {
            //   channel = await client.channels.fetch("1023418659726696500");
            // }
            // test();
            // autorun(channel);
        });
        client.on('message', commandHandler);
    }
    catch (err) {
        console.log(err);
    }
}
//# sourceMappingURL=deploy.js.map