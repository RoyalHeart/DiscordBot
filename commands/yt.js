const youtube_api_key = process.env.YOUTUBE_API_KEY;
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
module.exports = async function (msg, tokens) {
  let searchQuery = tokens.join("%20");
  let search_query = `https://youtube.googleapis.com/youtube/v3/search?q=${searchQuery}&key=${youtube_api_key}`;
  let data = await (await fetch(search_query)).json();
  let results = data["items"];
  for (let i = 0; i < 3; i++) {
    let videoId = results[i]["id"]["videoId"];
    let videoUrl = `https://youtube.com/watch?v=${videoId}`;
    msg.channel.send(videoUrl);
  }
};
