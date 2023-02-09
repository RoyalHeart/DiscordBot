import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();
const youtubeApiKey = process.env.YOUTUBE_API_KEY;
export default async function (msg, tokens) {
    if (tokens.length > 0) {
        const urls = getYoutubeVideoUrls(tokens.join(' '), 3);
        for (let url in urls) {
            msg.channel.send(url);
        }
    }
    else {
        msg.channel.send('> Please input some arguments');
    }
}
async function getYoutubeVideoUrls(title, numbers) {
    let videoInfos = await getYoutubeVideoInfos(title);
    let videoUrls = [];
    for (let index = 0; index < numbers; index++) {
        const videoId = videoInfos[index]['id']['videoId'];
        videoUrls.push(videoId);
    }
    return videoUrls;
}
export async function getYoutubeVideoUrl(title) {
    let videoInfos = await getYoutubeVideoInfos(title);
    let videoId = videoInfos[0]['id']['videoId'];
    let videoUrl = `https://youtube.com/watch?v=${videoId}`;
    return videoUrl;
}
async function getYoutubeVideoInfos(title) {
    let tokens = title.split(' ');
    let searchQuery = tokens.join('%20');
    let search_query = `https://youtube.googleapis.com/youtube/v3/search?q=${searchQuery}&key=${youtubeApiKey}`;
    let data = await getAxiosData(search_query);
    // console.log(data);
    let results = data['items'];
    return results;
}
async function getAxiosData(query) {
    let data = (await axios.get(query, {
        headers: {
            'Accept-Encoding': 'application/json',
        },
    })).data;
    return data;
}
//# sourceMappingURL=yt.js.map