import { Client, Events, GatewayIntentBits, IntentsBitField } from 'discord.js';
import * as dotenv from 'dotenv';
import commandHandler from './commands.js';
import interactionHandler from './interactions.js';
import { connectMongodb } from './mongodb.js';
import { createSlashCommand } from './slash_commands.js';
dotenv.config();
const token = process.env.TOKEN;
export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildVoiceStates,
    ],
});
export default async function deploy() {
    console.log('> deploying...');
    try {
        client.login(token);
        client.on(Events.MessageCreate, commandHandler);
        client.on(Events.InteractionCreate, interactionHandler);
        connectMongodb();
        createSlashCommand();
        client.on(Events.ClientReady, () => {
            if (client.user)
                console.log(`> logged in as ${client.user.tag}`);
            console.log('> deployed');
        });
    }
    catch (error) {
        console.log('> error: ' + error);
    }
}
//# sourceMappingURL=deploy.js.map