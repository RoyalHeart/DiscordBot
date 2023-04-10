import {Client, Events, GatewayIntentBits, IntentsBitField} from 'discord.js';
import * as dotenv from 'dotenv';
import commandHandler from './commands.js';
import interactionHandler from './interactions.js';
import {connectMongodb} from './mongodb.js';
import {createSlashCommand} from './slash_commands.js';
import {test} from './commands/music.js';
// import {start} from 'repl';
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
    client.on(Events.ClientReady, () => {
      if (client.user) console.log(`> logged in as ${client.user.tag}`);
    });
    client.on(Events.MessageCreate, commandHandler);
    client.on(Events.InteractionCreate, interactionHandler);
    await connectMongodb();
    await createSlashCommand();
    // await test();
    console.log('> deployed');
  } catch (err) {
    console.log(err);
  }
}
