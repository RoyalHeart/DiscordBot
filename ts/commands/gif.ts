import axios from 'axios';
import {ChatInputCommandInteraction, Message} from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();
const tenorApiKey = process.env.TENOR_API_KEY;
export default async function (msg: Message, tokens: string[]) {
  msg.channel.send(await getGif(tokens));
}
export async function gif(interaction: ChatInputCommandInteraction) {
  var token = interaction.options.get('category')?.value?.toString();
  var tokens = token!.split(' ');
  interaction.reply(await getGif(tokens));
}

async function getGif(tokens: string[]) {
  let searchUrl = '';
  const haveArgs = tokens.length !== 0;
  if (!haveArgs) {
    // no args
    const lmt = 10;
    searchUrl = `https://tenor.googleapis.com/v2/featured?&key=${tenorApiKey}&limit=${lmt}`;
  } else {
    // search using args
    const searchString = tokens.join('');
    const lmt = 10;
    searchUrl =
      'https://tenor.googleapis.com/v2/search?q=' +
      searchString +
      '&key=' +
      tenorApiKey +
      '&limit=' +
      lmt;
  }
  const response = (
    await axios.get(searchUrl, {
      headers: {'Content-Type': 'application/json'},
    })
  ).data;
  const results = await response.results;
  const random = Math.floor(Math.random() * results.length);
  const randomGif = results[random];
  const gifUrl = randomGif.url;
  return gifUrl;
}
