import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
const tenorApiKey = process.env.TENOR_API_KEY;
export default async function (msg, tokens) {
    let searchUrl = '';
    if (tokens.length === 0) {
        // no args
        const lmt = 10;
        searchUrl = `https://tenor.googleapis.com/v2/featured?&key=${tenorApiKey}&limit=${lmt}`;
    }
    else {
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
    const response = (await axios.get(searchUrl, {
        headers: { 'Content-Type': 'application/json' },
    })).data;
    console.log(response);
    const results = await response.results;
    const random = Math.floor(Math.random() * results.length);
    const randomGif = results[random];
    const gifUrl = randomGif.url;
    msg.channel.send(gifUrl);
}
//# sourceMappingURL=gif.js.map