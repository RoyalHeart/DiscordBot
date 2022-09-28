module.exports = function (msg, tokens) {
  let search_query = tokens.slice(0, tokens.length).join("+");
  msg.channel.send(
    "https://www.youtube.com/results?search_query=" + search_query
  );
};
