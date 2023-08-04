import {CacheType, Interaction} from 'discord.js';
import {crypto} from './commands/crypto.js';
import {gif} from './commands/gif.js';
import gpt from './commands/gpt.js';
import {help} from './commands/help.js';
import {hi} from './commands/hi.js';
import {
  addyt,
  loopyt,
  pauseyt,
  default as playyt,
  resumeyt,
  skipyt,
  stopyt,
  downloadyt,
} from './commands/musicyt.js';
import {ocr} from './commands/ocr.js';
import quote from './commands/quote.js';
import {weather} from './commands/weather.js';
import {yt} from './commands/yt.js';
import {log} from './mongodb.js';
const commands = {
  help,
  hi,
  quote,
  gif,
  weather,
  yt,
  crypto,
  addyt,
  playyt,
  loopyt,
  skipyt,
  pauseyt,
  resumeyt,
  stopyt,
  downloadyt,
  gpt,
  ocr,
};
export default async function interactionHandler(
  interaction: Interaction<CacheType>
) {
  try {
    if (interaction.isButton()) {
      console.log(
        `Button [${interaction.guild?.name}] ${interaction.user.username}: ${interaction.customId}`
      );
      if (interaction.customId in commands) {
        log(
          `[${interaction.guild?.name}] ${interaction.user.username}`,
          interaction.customId
        );
        const command = interaction.customId;
        (commands as any)[command](interaction);
      }
    } else if (interaction.isModalSubmit()) {
      console.log(
        `Modal [${interaction.guild?.name}] ${interaction.user.username}: ${interaction.customId}`
      );
      if (interaction.customId in commands) {
        log(
          `[${interaction.guild?.name}] ${interaction.user.username}`,
          interaction.customId
        );
        const command = interaction.customId;
        (commands as any)[command](interaction);
      }
    } else if (!interaction.isChatInputCommand()) {
      return;
    } else if (interaction.commandName in commands) {
      console.log(
        `Chat [${interaction.guild?.name}] ${interaction.user.username}: ${interaction.commandName}`
      );
      log(
        `[${interaction.guild?.name}] ${interaction.user.username}`,
        interaction.commandName
      );
      const command = interaction.commandName;
      (commands as any)[command](interaction);
    }
  } catch (err) {
    console.log('> Interaction', err);
  }
}
