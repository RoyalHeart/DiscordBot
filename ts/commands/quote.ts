import axios from 'axios';
import {ChannelType, Message} from 'discord.js';
export default async function (msg: Message, tokens: string[]) {
  if (msg.channel.type === ChannelType.GuildText) {
    msg.channel.send(await getQuote(tokens));
  }
}

let quoteUrl = 'https://type.fit/api/quotes';
let quoteUrl2 = 'https://api.quotable.io/random';
let quoteUrls = [quoteUrl, quoteUrl2];

async function getQuote(tokens: string[]) {
  let random = Math.floor(Math.random() * quoteUrls.length);
  let quoteUrl = quoteUrls[random];
  let randomQuote = await getRandomQuote(quoteUrl);
  return randomQuote;
}

async function getRandomQuote(url: string) {
  let data = (
    await axios.get(url, {headers: {'Content-Type': 'application/json'}})
  ).data;
  let quote = '';
  let author = '';
  if (url === quoteUrls[0]) {
    let random = Math.floor(Math.random() * data.length);
    let randomQuote = data[random];
    quote = randomQuote.text;
    author = randomQuote.author;
  } else if (url === quoteUrls[1]) {
    let randomQuote = data;
    quote = randomQuote.content;
    author = randomQuote.author;
  }
  if (author === null) {
    author = 'Anonymous';
  }
  return `${quote} -  ${author}, source ${url}`;
}

async function test() {
  let quote = await getRandomQuote(quoteUrl);
  let quote2 = await getRandomQuote(quoteUrl2);
  console.log(quote);
  console.log(quote2);
}
