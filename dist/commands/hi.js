const replies = ['Hiii', 'Halloo', 'Nice to see you'];
export default function (msg, tokens) {
    let random = Math.floor(Math.random() * replies.length);
    msg.reply(replies[random]);
}
//# sourceMappingURL=hi.js.map