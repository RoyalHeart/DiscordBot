import * as Discord from 'discord.js'
import * as dotenv from 'dotenv'
dotenv.config();
const client = new Discord.Client()
const importDynamic = new Function('modulePath', 'return import(modulePath)');
const fetch = async (...args:any[]) => {
  const module = await importDynamic('node-fetch');
  return module.default(...args);
};
// const fetch = (args: string) =>
//   import("node-fetch").then(({ default: fetch }) => {
//       return fetch(args);
//   });

let token = process.env.TOKEN;

client.login(token);

client.on("ready", () => {
  console.log(`Logged in as ${client.user!.tag}`);
});

client.on("message", async (msg) => {
  console.log(msg.content);
  let tokens = msg.content.split(' ');
  if (tokens[0] === "!hi") {
    msg.reply("Hiiii!");
    msg.channel.send("Not reply!");
  } else if (msg.content === "!random quote") {
    let random = Math.floor(Math.random() * quoteUrls.length);
    let quoteUrl = quoteUrls[random];
    let randomQuote = await getRandomQuote(quoteUrl);
    msg.reply(randomQuote);
  }
});

let quoteUrl = "https://type.fit/api/quotes";
let quoteUrl2 = "https://api.quotable.io/random";
let quoteUrls = [quoteUrl, quoteUrl2];
async function getRandomQuote(url) {
  let data: any = await (await fetch(url)).json();
  let quote = "";
  let author = "";
  if (url === quoteUrls[0]) {
    let random = Math.floor(Math.random() * data.length);
    let randomQuote = data![random];
    quote = randomQuote.text;
    author = randomQuote.author;
  } else if (url === quoteUrls[1]) {
    let randomQuote = data;
    quote = randomQuote.content;
    author = randomQuote.author;
  }
  if (author === null) {
    author = "Anonymous";
  }
  return `${quote} -  ${author}, source ${url}`;
}
