import axios from 'axios';
import {ChannelType, Message, TextChannel} from 'discord.js';
import * as dotenv from 'dotenv';
dotenv.config();

const youtubeApiKey = process.env.YOUTUBE_API_KEY;
function getTextChannel(message: Message): TextChannel | null {
  if (message.channel instanceof TextChannel) {
    return message.channel;
  }
  return null;
}
export default async function (msg: Message, tokens: string[]) {
  if (tokens.length > 0) {
    const urls = getYoutubeVideoUrls(tokens.join(' '), 3);
    for (let url in urls) {
      let channel = getTextChannel(msg);
      if (channel != null) {
        channel.send(url);
      }
    }
  } else {
    if (msg.channel.type === ChannelType.GuildText) {
      msg.channel.send('> Please input some arguments');
    }
  }
}

async function getYoutubeVideoUrls(title: string, numbers: number) {
  let videoInfos = await getYoutubeVideoInfos(title);
  let videoUrls = [];
  for (let index = 0; index < numbers; index++) {
    const videoId = videoInfos[index]['id']['videoId'];
    videoUrls.push(videoId);
  }
  return videoUrls;
}
export async function getYoutubeVideoUrl(title: string) {
  let videoInfos = await getYoutubeVideoInfos(title);
  console.log(videoInfos);
  let index = 0;
  let videoUrl: string = '';
  while (videoUrl == '') {
    let videoId = videoInfos[index]['id']['videoId'];
    if (videoId != null) {
      videoUrl = `https://youtube.com/watch?v=${videoId}`;
      break;
    }
    index++;
  }
  return videoUrl;
}
async function getYoutubeVideoInfos(title: string): Promise<any> {
  let tokens = title.split(' ');
  let searchQuery = tokens.join('%20');
  let search_query = `https://youtube.googleapis.com/youtube/v3/search?q=${searchQuery}&key=${youtubeApiKey}`;
  let data = await getAxiosData(search_query);
  // console.log(data);
  let results = data['items'];
  return results;
}

async function getAxiosData(query: string): Promise<any> {
  let data = (
    await axios.get(query, {
      headers: {
        'Accept-Encoding': 'application/json',
      },
    })
  ).data;
  return data;
}
