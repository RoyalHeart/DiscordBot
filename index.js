console.log("running bot");
const Discord = require("discord.js");
const client = new Discord.Client();
require("dotenv").config();

const token = process.env.TOKEN;
client.login(token);
const autorun = require("./autorun.js");
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  // let channel;
  // async function test() {
  //   channel = await client.channels.fetch("1023418659726696500");
  // }
  // test();
  // autorun(channel);
});

const commandHandler = require("./commands.js");

client.on("message", commandHandler);
