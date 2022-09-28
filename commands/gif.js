const tenor_api_key = process.env.TENOR_API_KEY;
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
module.exports = async function (msg, tokens) {
  let searchUrl = "";
  if (tokens.length === 0) {
    // no args
    var lmt = 10;
    searchUrl =
      "https://tenor.googleapis.com/v2/featured?&key=" +
      tenor_api_key +
      "&limit=" +
      lmt;
  } else {
    // search using args
    let searchString = tokens.join("");
    var lmt = 10;
    searchUrl =
      "https://tenor.googleapis.com/v2/search?q=" +
      searchString +
      "&key=" +
      tenor_api_key +
      "&limit=" +
      lmt;
  }
  let response = await (await fetch(searchUrl)).json();
  let results = await response.results;
  let random = Math.floor(Math.random() * results.length);
  let randomGif = results[random];
  let gifUrl = randomGif.url;
  msg.channel.send(gifUrl);
};
