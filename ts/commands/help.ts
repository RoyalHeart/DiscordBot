export default function (
  msg: {channel: {send: (arg0: string) => void}},
  tokens: any
) {
  const allCommands =
    'There are currently these functions: \n' +
    '!help show this page \n ' +
    '!crypto show latest price of tope 10 crypto currencies' +
    '!hi the bot will say hi back :> \n' +
    '!gif <args> show a random gif if no args and a gif related to the args \n' +
    '!quote show a random quote \n' +
    '!weather show the weather status \n ' +
    '!yt <args> give a youtube search link of the args \n';

  msg.channel.send(allCommands);
}
