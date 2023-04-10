import axios from 'axios';
const url = `https://discord.com/api/v10/applications/${process.env.APPLICATION_ID}/commands`;

const help = {
  name: 'help',
  type: 1,
  description: 'Show all commands',
  options: [],
};

const hi = {
  name: 'hi',
  type: 1,
  description: 'Say hi to the Bot',
  options: [],
};

const crypto = {
  name: 'crypto',
  type: 1,
  description: 'Return latest prices of top 10 crypto currencies ',
  options: [],
};

const gif = {
  name: 'gif',
  type: 1,
  description: 'Show a random gif if no args and a gif related to the args',
  options: [
    {
      name: 'category',
      description: 'The category of gif to see',
      type: 3,
      required: false,
    },
  ],
};

const weather = {
  name: 'weather',
  type: 1,
  description:
    'Show the weather information and temperature of the location (default is Ho Chi Minh city)',
  options: [
    {
      name: 'location',
      description: 'The location to see the weather condition',
      type: 3,
      required: false,
      choices: [
        {
          name: 'Binh Duong',
          value: 'Binh Duong',
        },
        {
          name: 'Ho Chi Minh',
          value: 'Ho Chi Minh',
        },
      ],
    },
    {
      name: 'mode',
      description: 'Choose current weather or forecast mode',
      type: 3,
      required: false,
      choices: [
        {
          name: 'Current',
          value: 'weather',
        },
        {
          name: 'Forecast',
          value: 'forecast',
        },
      ],
    },
  ],
};

const music = {
  name: 'music',
  type: 1,
  description: 'Playing, skipping music',
  options: [
    {
      name: 'play',
      description: 'Plays a song from youtube',
      options: [
        {
          name: 'query',
          type: 'STRING',
          description: 'The song you want to play',
          required: true,
        },
      ],
    },
    {
      name: 'skip',
      description: 'Skip to the current song',
    },
    {
      name: 'queue',
      description: 'See the queue',
    },
    {
      name: 'stop',
      description: 'Stop the player',
    },
  ],
};
const play = {
  name: 'play',
  description: 'Plays a song from youtube, spotify, soundcloud',
  type: 1,
  options: [
    {
      name: 'query',
      type: 3,
      description: 'The URL of song you want to play',
      required: true,
    },
  ],
};
const gpt = {
  name: 'gpt',
  description: 'Chat to ChatGPT',
  type: 1,
  options: [
    {
      name: 'query',
      type: 3,
      description: 'Message to ChatGPT',
      required: true,
    },
  ],
};
const yt = {
  name: 'yt',
  description: 'Search Youtube video',
  type: 1,
  options: [
    {
      name: 'title',
      type: 3,
      description: 'Title of Youtube video',
      required: true,
    },
    {
      name: 'number',
      type: 10,
      description: 'Number of Youtube videos searched',
      required: false,
    },
  ],
};
const playyt = {
  name: 'playyt',
  description: 'Plays a song from youtube',
  type: 1,
  options: [
    {
      name: 'query',
      type: 3,
      description: 'The URL of song you want to play',
      required: true,
    },
  ],
};
const loopyt = {
  name: 'loopyt',
  description: 'Loop current song',
  type: 1,
};
const skipyt = {
  name: 'skipyt',
  description: 'Skip to the next song',
  type: 1,
};
const pauseyt = {
  name: 'pauseyt',
  description: 'Pause the player',
  type: 1,
};
const resumeyt = {
  name: 'resumeyt',
  description: 'Resume the player',
  type: 1,
};
const stopyt = {
  name: 'stopyt',
  description: 'Stop the player',
  type: 1,
};
const skip = {
  name: 'skip',
  description: 'Skip to the next song',
  type: 1,
};
const queue = {
  name: 'queue',
  description: 'See the queue',
  type: 1,
};
const stop = {
  name: 'stop',
  description: 'Stop the player',
  type: 1,
};
const ocr = {
  name: 'ocr',
  description: 'Read text from an image',
  type: '1',
  options: [
    {
      name: 'image',
      type: 11,
      description: 'The image to OCR',
      required: true,
    },
    {
      name: 'language',
      description: 'The language in the image, default is English',
      type: 3,
      required: false,
      choices: [
        {
          name: 'English',
          value: 'eng',
        },
        {
          name: 'Vietnamese',
          value: 'vie',
        },
        {
          name: 'Chinese',
          value: 'chs',
        },
        {
          name: 'Korean',
          value: 'kor',
        },
        {
          name: 'Japanese',
          value: 'jpn',
        },
      ],
    },
  ],
};

async function post(json: any) {
  const res = await axios.post(url, json, {
    headers: {
      'Content-Type': 'application/json',
      Accept: '*/*',
      Authorization: `Bot ${process.env.TOKEN}`,
    },
  });
  let data = res.data;
  console.log(data);
}

async function del(id: string) {
  const delUrl = url + '/' + id;
  const res = await axios.delete(delUrl);
  let data = res.data;
  console.log(data);
}

export async function createSlashCommand() {
  console.log('> register slash command');
  // await post(help);
  // await post(gif);
  // await post(hi);
  // await post(crypto);
  // await post(playyt);
  // await post(yt);
  // await post(skipyt);
  // await post(pauseyt);
  // await post(resumeyt);
  // await post(stopyt);
  // await post(play);
  // await post(skip);
  // await post(queue);
  // await post(stop);
  // await post(gpt);
  // await post(ocr);
  // await post(weather);
}
