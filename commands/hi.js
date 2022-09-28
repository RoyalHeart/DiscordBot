const replies = ["Hiii", "Halloo", "Nice to see you"];

module.exports = function (msg, tokens) {
  let random = Math.floor(Math.random() * replies.length);
  msg.reply(replies[random]);
};
