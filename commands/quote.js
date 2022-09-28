const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
module.exports = async function (msg, tokens) {
  if (tokens.length < 2) {
    let random = Math.floor(Math.random() * quoteUrls.length);
    let quoteUrl = quoteUrls[random];
    let randomQuote = await getRandomQuote(quoteUrl);
    msg.channel.send(randomQuote);
  }
  // TODO: for searching quote by authors
  //   else {
  //     let searchString = tokens.slice(1, tokens.length);
  //   }
};

let quoteUrl = "https://type.fit/api/quotes";
let quoteUrl2 = "https://api.quotable.io/random";
let quoteUrls = [quoteUrl, quoteUrl2];

async function getRandomQuote(url) {
  let data = await (await fetch(url)).json();
  let quote = "";
  let author = "";
  if (url === quoteUrls[0]) {
    let random = Math.floor(Math.random() * data.length);
    let randomQuote = data[random];
    quote = randomQuote.text;
    author = randomQuote.author;
  } else if (url === quoteUrls[1]) {
    let randomQuote = data;
    quote = randomQuote.content;
    author = randomQuote.author;
  }
  if (author === null) {
    author = "Anonymous";
  }
  return `${quote} -  ${author}, source ${url}`;
}

async function test() {
  let quote = await getRandomQuote(quoteUrl);
  let quote2 = await getRandomQuote(quoteUrl2);
  console.log(quote);
  console.log(quote2);
}

test();
