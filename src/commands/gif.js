const tenorApiKey = process.env.TENOR_API_KEY;
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
module.exports = async function (msg, tokens) {
  let searchUrl = '';
  if (tokens.length === 0) {
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
  const response = await (await fetch(searchUrl)).json();
  const results = await response.results;
  const random = Math.floor(Math.random() * results.length);
  const randomGif = results[random];
  const gifUrl = randomGif.url;
  msg.channel.send(gifUrl);
};
