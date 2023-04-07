const replies = ['Hiii', 'Halloo', 'Nice to see you'];
export default function (msg, tokens) {
    msg.reply(sayHi());
}
export function hi(interaction) {
    interaction.reply(sayHi());
}
function sayHi() {
    let random = Math.floor(Math.random() * replies.length);
    return replies[random];
}
//# sourceMappingURL=hi.js.map