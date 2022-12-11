const fetch = (...args) =>
  import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = async function (msg, tokens) {
  msg.channel.send('ocr');
};
