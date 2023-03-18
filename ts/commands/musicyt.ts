import {
  AudioPlayerStatus,
  AudioResource,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from '@discordjs/voice';
import {
  BaseGuildTextChannel,
  ChatInputCommandInteraction,
  Guild,
  GuildMember,
  NewsChannel,
  TextChannel,
  VoiceBasedChannel,
  VoiceChannel,
} from 'discord.js';
import ytdl from 'ytdl-core';
import {getYoutubeVideoUrl} from './yt.js';

export async function test(interaction: ChatInputCommandInteraction) {
  let url = await getYoutubeVideoUrl('hi ren');
  const info = await ytdl.getBasicInfo(url);
  // console.log('> info', info);
  if (
    !(interaction.member instanceof GuildMember) ||
    !interaction.member.voice.channel
  ) {
    return interaction.reply({
      content: 'You are not in a voice channel!',
      ephemeral: true,
    });
  }
  const voiceChannel = interaction.member.voice.channel;
  console.log('> voice channel', voiceChannel);
  info.videoDetails.title;
}
interface Song {
  resource: AudioResource;
  title: string;
  url: string;
  songInfo: ytdl.videoInfo;
}
interface ServerQueue {
  textChannel: NewsChannel | TextChannel;
  voiceChannel: VoiceBasedChannel;
  connection: any;
  songs: Array<Song>;
  volume: 5;
  playing: true;
}

let serverQueue: ServerQueue;
let queue = new Map();
const player = createAudioPlayer({
  behaviors: {
    maxMissedFrames: 20,
  },
});
function isUrl(url: string): boolean {
  var expression =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
  var regex = new RegExp(expression);
  return url.match(regex) !== null;
}

async function getUrlFromQuery(query: string): Promise<string> {
  let url;
  if (!isUrl(query)) {
    url = await getYoutubeVideoUrl(query);
  } else {
    url = query;
  }
  return url;
}

function createSong(songInfo: ytdl.videoInfo): Song {
  const stream = ytdl(songInfo.videoDetails.video_url, {
    filter: 'audioonly',
    highWaterMark: 1 << 30,
    liveBuffer: 20000,
    // dlChunkSize: 4096,
    dlChunkSize: 0, //disabling chunking is recommended in discord bot
    quality: 'lowestaudio',
  });

  const resource = createAudioResource(stream, {
    metadata: {
      title: songInfo.videoDetails.title,
    },
  });

  const song: Song = {
    resource: resource,
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
    songInfo: songInfo,
  };

  return song;
}

async function getNextRelatedSong(song: Song): Promise<Song> {
  const relatedVideos = song.songInfo.related_videos;
  const randomIndex = Math.floor(Math.random() * relatedVideos.length);
  const nextSongId = relatedVideos[randomIndex].id;
  const nextSongUrl = `https://youtube.com/watch?v=${nextSongId}`;
  const nextSongInfo = await ytdl.getInfo(nextSongUrl);
  const nextSong = createSong(nextSongInfo);
  return nextSong;
}
let song: Song;
export default async function playyt(interaction: ChatInputCommandInteraction) {
  if (!(interaction.channel instanceof BaseGuildTextChannel)) {
    return interaction.reply({
      content: 'You are not in a channel!',
      ephemeral: true,
    });
  }
  if (!(interaction.guild instanceof Guild)) {
    return interaction.reply({
      content: 'You are not in a guild channel!',
      ephemeral: true,
    });
  }
  if (
    !(interaction.member instanceof GuildMember) ||
    !interaction.member.voice.channel
  ) {
    return interaction.reply({
      content: 'You are not in a voice channel!',
      ephemeral: true,
    });
  }
  await interaction.deferReply();

  const query = interaction.options.get('query')?.value as string;
  console.log('> Query:', query);
  const url = await getUrlFromQuery(query);
  const songInfo = await ytdl.getInfo(url);
  song = createSong(songInfo);

  const voiceChannel = interaction.member.voice.channel;
  if (!serverQueue) {
    try {
      const connection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guildId as string,
        adapterCreator: interaction.member.guild.voiceAdapterCreator as any,
        selfMute: false,
      });
      connection.on('stateChange', (old_state, new_state) => {
        if (
          old_state.status === VoiceConnectionStatus.Ready &&
          new_state.status === VoiceConnectionStatus.Connecting
        ) {
          connection.configureNetworking();
        }
      });
      const queueContruct: ServerQueue = {
        textChannel: interaction.channel,
        voiceChannel: voiceChannel,
        connection: null as any,
        songs: [song],
        volume: 5,
        playing: true,
      };
      serverQueue = queueContruct;
      queue.set(interaction.guild.id, queueContruct);
      queueContruct.connection = connection;
      connection.subscribe(player);
      player.play(song.resource);
      await interaction.followUp({
        content: `> Playing **${song.title}**`,
      });
    } catch (err) {
      console.log(err);
      queue.delete(interaction.guild.id);
      player.stop();
      return interaction.channel!.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    if (player.state.status === 'idle') {
      player.play(song.resource);
      return interaction.channel.send(`> Playing **${song.title}**`);
    }
    await interaction.followUp(`> Adding ${song.title} to queue`);
    await interaction.deleteReply();
    return interaction.channel.send(`> Add **${song.title}** to the queue!`);
  }

  player.on('stateChange', (oldState, newState) => {
    if (
      oldState.status == AudioPlayerStatus.Playing &&
      newState.status == AudioPlayerStatus.AutoPaused
    ) {
      console.log('> AutoPause start playing again');
      player.play(song.resource);
    }
  });
  player.on(AudioPlayerStatus.Buffering, async (e: any) => {
    // const title = await e.resource['metadata']['title'];
    console.log('> Loading', song.title);
  });
  player.on(AudioPlayerStatus.Playing, (e: any) => {
    // const title = e.resource['metadata']['title'];
    console.log('> Playing', song.title);
  });
  player.on(AudioPlayerStatus.AutoPaused, (e) => {
    console.log('> Auto pause');
  });
  player.on(AudioPlayerStatus.Idle, async (e) => {
    console.log('> Idle');
    console.log('> ServerQueue ', serverQueue.songs);
    let nextRelatedSong = getNextRelatedSong(serverQueue.songs.shift()!);
    if (serverQueue.songs.length == 0) {
      song = await nextRelatedSong;
      serverQueue.songs.push(song);
      await interaction.channel?.send({
        content: `> Queue is empty`,
      });
      player.play(song.resource);
      await interaction.channel?.send({
        content: `> Playing related song **${song.title}**`,
      });
    } else {
      console.log('> ServerQueue ', serverQueue.songs);
      song = serverQueue.songs[0];
      console.log('> Next song title' + song.title);
      if (song) {
        await interaction.channel?.send({
          content: `> Playing **${song.title}**`,
        });
        player.play(song.resource);
      }
    }
  });
}

export async function skipyt(interaction: ChatInputCommandInteraction) {
  if (!(interaction.guild instanceof Guild)) {
    return interaction.reply({
      content: 'You are not in a guild channel!',
      ephemeral: true,
    });
  }
  if (
    !(interaction.member instanceof GuildMember) ||
    !interaction.member.voice.channel
  ) {
    return interaction.reply({
      content: 'You are not in a voice channel!',
      ephemeral: true,
    });
  }
  interaction.reply({content: '> Skiping to next song'});
  setTimeout(async () => {
    await interaction.deleteReply();
  }, 2000);
  serverQueue.songs.shift();
  const nextSong = serverQueue.songs[0];
  if (nextSong) {
    interaction.channel?.send({
      content: `> Skip to ${nextSong.title}`,
    });
    return player.play(nextSong.resource);
  } else {
    interaction.channel?.send({
      content: `> No next song`,
    });
  }
}

export async function pauseyt(interaction: ChatInputCommandInteraction) {
  if (!(interaction.guild instanceof Guild)) {
    return interaction.reply({
      content: 'You are not in a guild channel!',
      ephemeral: true,
    });
  }
  if (
    !(interaction.member instanceof GuildMember) ||
    !interaction.member.voice.channel
  ) {
    return interaction.reply({
      content: 'You are not in a voice channel!',
      ephemeral: true,
    });
  }
  player.pause();
  interaction.reply({content: `> Pausing`});
  setTimeout(async () => {
    await interaction.deleteReply();
  }, 2000);
  interaction.channel?.send({content: `> Pausing`});
}

export async function resumeyt(interaction: ChatInputCommandInteraction) {
  player.unpause();
  interaction.reply({content: `> Resume`});
  setTimeout(async () => {
    await interaction.deleteReply();
  }, 2000);
  interaction.channel?.send({content: `> Resume`});
}
