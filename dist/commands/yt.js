import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
const youtubeApiKey = process.env.YOUTUBE_API_KEY;
export default async function (msg, tokens) {
    if (tokens.length > 0) {
        let searchQuery = tokens.join('%20');
        let search_query = `https://youtube.googleapis.com/youtube/v3/search?q=${searchQuery}&key=${youtubeApiKey}`;
        let data = (await axios.get(search_query, {
            headers: {
                'Accept-Encoding': 'application/json',
            },
        })).data;
        console.log(data);
        let results = data['items'];
        for (let i = 0; i < 3; i++) {
            let videoId = results[i]['id']['videoId'];
            let videoUrl = `https://youtube.com/watch?v=${videoId}`;
            msg.channel.send(videoUrl);
        }
    }
    else {
        msg.channel.send('please input some arguments');
    }
}
//# sourceMappingURL=yt.js.map