const replies = ['Hiii', 'Halloo', 'Nice to see you'];

export default function (msg: {reply: (arg0: string) => void}, tokens: any) {
  let random = Math.floor(Math.random() * replies.length);
  msg.reply(replies[random]);
}
