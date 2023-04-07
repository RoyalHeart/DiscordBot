import { ChannelType } from 'discord.js';
const allCommands = 'There are currently these functions: \n' +
    '!help show this page \n ' +
    '!crypto show latest price of top 10 crypto currencies \n' +
    '!hi the bot will say hi back :> \n' +
    '!gif <args> show a random gif if no args and a gif related to the args \n' +
    '!quote show a random quote \n' +
    '!weather show the weather status \n ' +
    '!yt <args> give a youtube search link of the args \n';
export default function (msg, tokens) {
    if (msg.channel.type === ChannelType.GuildText) {
        msg.channel.send(allCommands);
    }
}
export function help(interaction) {
    interaction.reply(allCommands);
}
//# sourceMappingURL=help.js.map