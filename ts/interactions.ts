import {CacheType, Interaction} from 'discord.js';
import crypto from './commands/crypto.js';
import gif from './commands/gif.js';
import {help} from './commands/help.js';
import {hi} from './commands/hi.js';
import {
  default as play,
  default as skip,
  default as stop,
} from './commands/music.js';
import {
  default as playyt,
  skipyt,
  pauseyt,
  resumeyt,
} from './commands/musicyt.js';
import quote from './commands/quote.js';
import weather from './commands/weather.js';
import yt from './commands/yt.js';
const commands = {
  help,
  hi,
  quote,
  gif,
  weather,
  yt,
  crypto,
  play,
  stop,
  skip,
  playyt,
  skipyt,
  pauseyt,
  resumeyt,
};
export default async function interactionHandler(
  interaction: Interaction<CacheType>
) {
  if (!interaction.isChatInputCommand()) {
    return;
  }
  console.log(
    `[${interaction.guild?.name}] ${interaction.user.username}: ${interaction.commandName}`
  );
  if (interaction.commandName in commands) {
    const command = interaction.commandName;
    (commands as any)[command](interaction);
  }
}
