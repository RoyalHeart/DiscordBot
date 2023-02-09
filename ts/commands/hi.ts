import {ChatInputCommandInteraction} from 'discord.js';

const replies = ['Hiii', 'Halloo', 'Nice to see you'];

export default function (msg: {reply: (arg0: string) => void}, tokens: any) {
  msg.reply(sayHi());
}

export function hi(interaction: ChatInputCommandInteraction) {
  interaction.reply(sayHi());
}

function sayHi() {
  let random = Math.floor(Math.random() * replies.length);
  return replies[random];
}
