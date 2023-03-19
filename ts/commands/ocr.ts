import {ChannelType, Message} from 'discord.js';

export default async function (msg: Message, tokens: any) {
  if (msg.channel.type === ChannelType.GuildText) {
    msg.channel.send('ocr');
  }
}
