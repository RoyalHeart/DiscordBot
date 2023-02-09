import {Message} from 'discord.js';

export default async function (msg: Message, tokens: any) {
  msg.channel.send('ocr');
}
